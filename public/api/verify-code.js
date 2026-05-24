const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  try {
    // 1. Fetch the profile for the given email
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('verification_code, verification_expires_at, is_verified')
      .eq('email', email)
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // 2. Check if already verified
    if (profile.is_verified) {
      return res.status(200).json({ success: true, message: 'Account already verified' });
    }

    // 3. Validate the code
    if (profile.verification_code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // 4. Check expiration (30 minutes)
    const expiresAt = new Date(profile.verification_expires_at);
    if (new Date() > expiresAt) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // 5. Mark the account as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_verified: true,
        verification_code: null, // Clear the code after success
        verification_expires_at: null
      })
      .eq('email', email);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return res.status(500).json({ error: 'Failed to activate account' });
    }

    return res.status(200).json({ success: true, message: 'Account verified successfully' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
