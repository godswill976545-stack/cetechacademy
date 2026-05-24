import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export default async (req, res) => {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { userId, code } = req.body;
        if (!userId || !code) return res.status(400).json({ error: 'Missing fields' });
        const { data, error } = await supabase
            .from('verification_codes')
            .select('*')
            .eq('user_id', userId)
            .eq('code', code)
            .single();
        if (error || !data) return res.status(400).json({ error: 'Invalid code' });
        if (new Date(data.expires_at) < new Date()) return res.status(400).json({ error: 'Code expired' });
        await supabase.from('verification_codes').delete().eq('user_id', userId);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
