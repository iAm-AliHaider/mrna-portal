-- =============================================
-- MRNA Leave Management - DB Migration Script
-- Run this ONCE against the Supabase database
-- =============================================
-- Adds: last_vacation_ref column to leave_requests
-- Run via Supabase SQL Editor or: psql <this file>

ALTER TABLE public.leave_requests
ADD COLUMN IF NOT EXISTS last_vacation_ref INTEGER
REFERENCES public.leave_requests(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.leave_requests.last_vacation_ref
IS 'Reference to previous approved leave request (for tracking vacation history)';
