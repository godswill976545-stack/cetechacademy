const getEnv = (key) => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            return import.meta.env[key];
        }
    } catch (e) {}
    return '';
};

const CONVEX_URL = getEnv('VITE_CONVEX_URL') || '';

let convexClient = null;

async function getConvex() {
    if (convexClient) return convexClient;
    if (!CONVEX_URL) return null;
    const { ConvexClient } = await import('convex/browser');
    convexClient = new ConvexClient(CONVEX_URL);
    return convexClient;
}

document.addEventListener('DOMContentLoaded', async () => {
  const payBtn = document.getElementById('pay-btn');
  const emailInput = document.getElementById('email');
  const firstNameInput = document.getElementById('firstname');
  const lastNameInput = document.getElementById('lastname');

  const client = await getConvex();
  const storedUser = localStorage.getItem('cetech_user');
  let currentUser = null;

  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {}
  }

  if (client && currentUser) {
    try {
      const user = await client.query('auth/queries:getUser', { userId: currentUser._id });
      if (user && emailInput) {
        emailInput.value = user.email;
        if (user.fullName) {
          const names = user.fullName.split(' ');
          if (firstNameInput) firstNameInput.value = names[0] || '';
          if (lastNameInput) lastNameInput.value = names.slice(1).join(' ') || '';
        }
      }
    } catch (e) {
      console.warn('Could not fetch user profile', e);
    }
  }

  const courseSelect = document.getElementById('course-select');
  const displayPrice = document.getElementById('display-price');
  const displayTotal = document.getElementById('display-total');

  const updatePrice = () => {
    const selectedOption = courseSelect.options[courseSelect.selectedIndex];
    const price = parseInt(selectedOption.getAttribute('data-price'));
    const formattedPrice = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);
    displayPrice.textContent = formattedPrice;
    displayTotal.textContent = formattedPrice;
  };

  courseSelect?.addEventListener('change', updatePrice);

  if (payBtn) {
    payBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const firstname = firstNameInput.value.trim();
      const lastname = lastNameInput.value.trim();
      const email = emailInput.value.trim();
      const selectedOption = courseSelect.options[courseSelect.selectedIndex];
      const courseName = selectedOption.text.split(' - ')[0];
      const amount = parseInt(selectedOption.getAttribute('data-price'));

      if (!firstname || !lastname || !email) {
        alert("Please fill in all fields before proceeding.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      const handler = PaystackPop.setup({
        key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        email: email,
        amount: amount * 100,
        currency: 'NGN',
        ref: 'CET-' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
          custom_fields: [
            { display_name: "First Name", variable_name: "first_name", value: firstname },
            { display_name: "Last Name", variable_name: "last_name", value: lastname },
            { display_name: "Course", variable_name: "course_name", value: courseName }
          ]
        },
        callback: async function(response) {
          console.log('Payment Successful! Reference: ' + response.reference);

          if (client && currentUser) {
            const courseId = selectedOption.value;
            try {
              await client.mutation('enrollments/mutations:createEnrollment', {
                userId: currentUser._id,
                courseId,
                paymentStatus: 'paid',
                paystackReference: response.reference,
              });
            } catch (e) {
              console.error('Failed to create enrollment', e);
            }
          }

          alert('Payment successful! Redirecting to your portal...');
          window.location.href = '/frontend/portal.html';
        },
        onClose: function() {
          console.log('Window closed.');
        }
      });

      handler.openIframe();
    });
  }
});
