import { createClient } from '@supabase/supabase-js';
export default async (req, res) => {
  res.status(200).json({ ok: true, supabaseLoaded: true });
};
