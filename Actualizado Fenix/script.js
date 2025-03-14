document.addEventListener('DOMContentLoaded', () => {
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
});
