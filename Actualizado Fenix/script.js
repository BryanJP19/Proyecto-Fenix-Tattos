document.addEventListener('DOMContentLoaded', () => {
    // Inicializar AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true });
    }

    // Obtener el formulario
    const form = document.getElementById('contactForm');
    
    // Verificar si el formulario existe
    if (form) {
        form.addEventListener('submit', (event) => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.preventDefault(); // Evitar el envío real para mostrar el mensaje
                alert('✅ Mensaje enviado correctamente.');
                form.reset();
            }
            form.classList.add('was-validated');
        });
    }
});

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD08oDVTwWZiU-kQZWWThal-bL0sjaEeUI",
  authDomain: "fenix-tattos.firebaseapp.com",
  projectId: "fenix-tattos",
  storageBucket: "fenix-tattos.firebasestorage.app",
  messagingSenderId: "669670704915",
  appId: "1:669670704915:web:7cdd63e8bd3fef80297ce6",
  measurementId: "G-MFXVY8S8P4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);