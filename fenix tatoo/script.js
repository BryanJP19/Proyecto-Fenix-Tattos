// Example JavaScript for form validation or other interactivity
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission
        alert('Formulario enviado correctamente.');
        form.reset(); // Reset form fields
    });
});
