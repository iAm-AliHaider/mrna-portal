-- MRNA Leave Management Enhancements
-- Adds: last_vacation_ref column to leave_requests
-- Creates: usePreviousLeaveRequests hook

-- =============================================
-- 1. Add last_vacation_ref to leave_requests
-- =============================================
ALTER TABLE public.leave_requests
ADD COLUMN IF NOT EXISTS last_vacation_ref INTEGER
REFERENCES public.leave_requests(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.leave_requests.last_vacation_ref IS 'Reference to previous approved leave request (for tracking vacation history)';
