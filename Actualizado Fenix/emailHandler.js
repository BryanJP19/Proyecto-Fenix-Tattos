const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const router = express.Router();

// Cargue secretos de cliente desde un archivo local.
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

/**
 * Autorizar con la API de Google usando OAuth2
 * @param {Object} credentials - Las credenciales del cliente de autorización.
 * @param {Function} callback - La devolución de llamada para llamar con el cliente autorizado.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Comprobar si hemos almacenado previamente algún token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Obtenga y almacene un nuevo token después de solicitar la autorización del usuario
 * @param {google.auth.OAuth2} oAuth2Client - El cliente OAuth2 para obtener el token
 * @param {Function} callback - La devolución de llamada para el cliente autorizado.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
    console.log('Autorice esta aplicación visitando esta URL:', authUrl);
    
    // En una aplicación real, implementaría una ruta para manejar la devolución de llamada de OAuth.
    // Por ahora, este es un marcador de posición para la entrada manual de tokens
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Almacene el token en el disco para ejecuciones posteriores del programa.
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Crear un nuevo evento en el calendario principal del usuario
 * @param {google.auth.OAuth2} auth - Un cliente OAuth2 autorizado
 * @param {Object} eventDetails - Detalles del evento a crear
 * @returns {Promise} - Promesa que representa el resultado de la llamada API.
 */
function createEvent(auth, eventDetails) {
    return new Promise((resolve, reject) => {
        const calendar = google.calendar({ version: 'v3', auth });
        calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: eventDetails,
        }, (err, event) => {
            if (err) {
                console.error('Se produjo un error al contactar con el servicio Calendario:', err);
                reject(err);
                return;
            }
            console.log('Event created:', event.data.htmlLink);
            resolve(event);
        });
    });
}

// Configurar Nodemailer con variables de entorno
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'bryanjimenez744@gmail.com',
        pass: process.env.EMAIL_PASS || 'BryanJP190401'
    }
});

// Punto final para manejar el envío de formularios
router.post('/send-email', async (req, res) => {
    try {
        const { name, email, message, appointmentDate, appointmentTime, duration = 60 } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        // Enviar correo electrónico a la empresa.
        const mailOptions = {
            from: email,
            to: process.env.BUSINESS_EMAIL || 'bryanjimenez774@gmail.com',
            subject: 'Envío de nuevo formulario de contacto',
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: `
                <h2>Envío de nuevo formulario de contacto</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
                ${appointmentDate ? `<p><strong>Requested Appointment:</strong> ${appointmentDate} at ${appointmentTime}</p>` : ''}
            `
        };

        await transporter.sendMail(mailOptions);

        // Enviar respuesta automática al usuario
        const autoResponseOptions = {
            from: process.env.BUSINESS_EMAIL || 'bryanjimenez774@gmail.com',
            to: email,
            subject: 'Gracias por contactar con nosotros!',
            text: `Estimado ${name},\n\nGracias por contactarnos. Hemos recibido su mensaje y nos comunicaremos con usted en breve.\n\n${appointmentDate ? 'Hemos tomado nota de su solicitud de cita y la confirmaremos pronto' : 'Si desea programar una cita, visite nuestra página de programación: [Enlace a la página de programación]'}\n\nSaludos cordiales,\nEl equipo`,
            html: `
                <h2>Gracias por contactar con nosotros!</h2>
                <p>Estimado ${name},</p>
                <p>TGracias por contactarnos. Hemos recibido su mensaje y nos comunicaremos con usted en breve.</p>
                ${appointmentDate ? '<p>Hemos tomado nota de su solicitud de cita y la confirmaremos pronto.</p>' : '<p>Si desea programar una cita, visite nuestra <a href="#">página de programación</a>.</p>'}
                <p>Saludos cordiales,<br>El equipo</p>
            `
        };

        await transporter.sendMail(autoResponseOptions);

        // Si se proporcionan la fecha y hora de la cita, cree un evento de calendario
        if (appointmentDate && appointmentTime) {
            // Analizar la fecha y hora de la cita.
            const [year, month, day] = appointmentDate.split('-').map(Number);
            const [hours, minutes] = appointmentTime.split(':').map(Number);
            
            // Crear horas de inicio y finalización (agregando minutos de duración a la hora de finalización)
            const startDateTime = new Date(year, month - 1, day, hours, minutes);
            const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
            
            // Formato para la API de Google Calendar
            const timeZone = 'America/Los_Angeles';
            const startTimeISO = startDateTime.toISOString();
            const endTimeISO = endDateTime.toISOString();

            try {
                const content = await fs.promises.readFile(CREDENTIALS_PATH);
                const credentials = JSON.parse(content);
                
                authorize(credentials, async (auth) => {
                    try {
                        const eventDetails = {
                            summary: `Cita con ${name}`,
                            description: message,
                            start: {
                                dateTime: startTimeISO,
                                timeZone,
                            },
                            end: {
                                dateTime: endTimeISO,
                                timeZone,
                            },
                            attendees: [
                                { email: email },
                                { email: process.env.BUSINESS_EMAIL || 'bryanjimenez774@gmail.com' }
                            ],
                            reminders: {
                                useDefault: false,
                                overrides: [
                                    { method: 'email', minutes: 24 * 60 },
                                    { method: 'popup', minutes: 10 },
                                ],
                            },
                        };
                        
                        await createEvent(auth, eventDetails);
                        res.status(200).json({ 
                            success: true, 
                            message: 'Correo electrónico enviado y cita programada con éxito' 
                        });
                    } catch (error) {
                        console.error('Error al crear el evento del calendario:', error);
                        res.status(200).json({ 
                            success: true, 
                            message: 'El correo electrónico se envió correctamente, pero hubo un problema al programar la cita.' 
                        });
                    }
                });
            } catch (error) {
                console.error('Error al cargar el archivo secreto del cliente:', error);
                res.status(200).json({ 
                    success: true, 
                    message: 'El correo electrónico se envió correctamente, pero falló la integración del calendario' 
                });
            }
        } else {
            // No se solicitó cita, solo confirme que se enviaron los correos electrónicos.
            res.status(200).json({ 
                success: true, 
                message: 'Correo electrónico enviado correctamente' 
            });
        }
    } catch (error) {
        console.error('Error en el controlador de correo electrónico:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al procesar su solicitud', 
            error: error.message 
        });
    }
});

module.exports = router;
