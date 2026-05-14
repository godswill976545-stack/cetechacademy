// Set up Paystack integration
document.addEventListener('DOMContentLoaded', async () => {
  const payBtn = document.getElementById('pay-btn');
  const emailInput = document.getElementById('email');
  const firstNameInput = document.getElementById('firstname');
  const lastNameInput = document.getElementById('lastname');

  // Supabase Configuration
  const supabaseUrl = 'https://kohlegvunumiwxbhfbwb.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvaGxlZ3Z1bnVtaXd4YmhmYndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODEyOTcsImV4cCI6MjA5MzA1NzI5N30.1A-ykiNp6KVZ9lfo0kd1xW157KJtukiTe7DUAE6uVf0';
  
  const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

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

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && emailInput) {
      emailInput.value = user.email;
      // Pre-fill names from profile if available
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (profile?.full_name) {
        const names = profile.full_name.split(' ');
        if (firstNameInput) firstNameInput.value = names[0] || '';
        if (lastNameInput) lastNameInput.value = names.slice(1).join(' ') || '';
      }
    }
  }
  
  if (payBtn) {
    payBtn.addEventListener('click', (e) => {
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

      // Initialize Paystack Inline
      const handler = PaystackPop.setup({
        key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with real Paystack Public Key
        email: email,
        amount: amount * 100, // Amount in kobo (Naira * 100)
        currency: 'NGN',
        ref: 'CET-' + Math.floor((Math.random() * 1000000000) + 1), // Generate random reference
        metadata: {
          custom_fields: [
            {
              display_name: "First Name",
              variable_name: "first_name",
              value: firstname
            },
            {
              display_name: "Last Name",
              variable_name: "last_name",
              value: lastname
            },
            {
              display_name: "Course",
              variable_name: "course_name",
              value: courseName
            }
          ]
        },
        callback: async function(response) {
          console.log('Payment Successful! Reference: ' + response.reference);
          
          // In a real app, you would verify the transaction on the backend via webhook
          // For this implementation, we'll update the profile directly (stubbing the webhook behavior)
          if (supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase
                .from('profiles')
                .update({ payment_status: 'paid' })
                .eq('id', user.id);
              
              // Create enrollment record
              await supabase
                .from('enrollments')
                .upsert({
                  user_id: user.id,
                  course_id: selectedOption.value, // Use the selected course value as ID (or map to real UUID)
                  payment_status: 'paid',
                  paystack_reference: response.reference
                }, { onConflict: 'user_id,course_id' });
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
