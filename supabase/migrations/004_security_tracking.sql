-- ============================================================
-- CeTech Academy - Security Tracking (Login Attempts)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email or user_id
  event_type TEXT NOT NULL, -- 'login_failure', 'otp_failure', 'rate_limit'
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups during rate limiting
CREATE INDEX IF NOT EXISTS idx_security_logs_identifier_type ON public.security_logs(identifier, event_type, created_at);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write security logs
CREATE POLICY "Service role full access" ON public.security_logs 
  FOR ALL USING (auth.role() = 'service_role');
