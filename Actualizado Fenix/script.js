/* document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', (event) => {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            alert('Formulario enviado correctamente.');
            form.reset();
        }
        form.classList.add('was-validated');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 1000, once: true }); // Inicializar animaciones

    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', (event) => {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            alert('✅ Mensaje enviado correctamente.');
            form.reset();
        }
        form.classList.add('was-validated');
    });
});


document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 1000, once: true }); // Efecto más fluido
}); */

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

