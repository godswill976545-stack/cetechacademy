import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ error: 'User ID and code are required' });
        }

        // 1. Check for the code in the database
        const { data, error } = await supabase
            .from('verification_codes')
            .select('*')
            .eq('user_id', userId)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (error || !data) {
            return res.status(401).json({ error: 'Invalid or expired verification code' });
        }

        // 2. Clean up used code
        await supabase
            .from('verification_codes')
            .delete()
            .eq('id', data.id);

        return res.status(200).json({ success: true, message: 'Identity verified successfully' });
    } catch (error) {
        console.error('OTP Verify Error:', error);
        return res.status(500).json({ error: 'Internal server error while verifying OTP' });
    }
}
