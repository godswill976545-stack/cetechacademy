import { createClient } from '@supabase/supabase-js';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Must be POST' });
  }

  const { userId, email } = req.body || {};
  if (!userId || !email) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  return res.status(200).json({ success: true, message: 'skipped email for now' });
};
