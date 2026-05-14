// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    if (this.getAttribute('href') !== '#') {
      e.preventDefault();
      const targetElement = document.querySelector(this.getAttribute('href'));
      if (targetElement) {
        // Offset for sticky header
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// Form submission handler
const contactForm = document.getElementById('contactForm');
const formMessages = document.getElementById('formMessages');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // reset messages
    formMessages.className = 'form-messages';
    formMessages.textContent = '';

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    // gather data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        formMessages.textContent = 'Thanks for your inquiry! We will contact you soon.';
        formMessages.classList.add('success');
        contactForm.reset();
      } else {
        formMessages.textContent = result.message || 'An error occurred. Please try again.';
        formMessages.classList.add('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      formMessages.textContent = 'Network error. Please make sure the backend server is running.';
      formMessages.classList.add('error');
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}
