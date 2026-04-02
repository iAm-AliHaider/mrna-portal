import { useMemo, useCallback, useEffect, useState } from "react";
import { usePhotos } from "./photoGallery";
import { useEmployeesData } from "./emplyees";
import { supabase } from '../../../supabaseClient';
import { useUser } from '../../../context/UserContext';
import toast from 'react-hot-toast'
// Reuses usePhotos internally with page 1
export function useDashboardGallery(limit = 6) {
  const { data, loading, error, refetch } = usePhotos(1, limit);

  // In case you want to transform/limit the results further:
  const photos = useMemo(() => data.slice(0, limit), [data, limit]);

  return { 
    photos,
    loading,
    error,
    refetch,
  };
}

export function useDashboardInspirationVideos (page = 1, perPage = 12) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchInspirationVideos = useCallback(
    async isCancelled => {
      if (!isCancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        // Calculate range for pagination
        const from = (page - 1) * perPage
        const to = from + perPage - 1

        // Get paginated data
        const {
          data: rows,
          error: fetchError,
          count
        } = await supabase
          .from('inspiration_videos')
          .select('*', { count: 'exact' })
          .eq('catagory', 'video')
          .order('created_at', { ascending: false })
          .range(from, to)

        if (fetchError) throw fetchError

        if (!isCancelled) {
          setData(rows || [])
          setTotalCount(count || 0)
          setLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || err)
          setLoading(false)
          toast.error(`Error loading photos: ${err.message || err}`)
        }
      }
    },
    [page, perPage]
  )

  useEffect(() => {
    let isCancelled = false
    fetchInspirationVideos(isCancelled)
    return () => {
      isCancelled = true
    }
  }, [fetchInspirationVideos])

  return {
    data,
    loading,
    error,
    totalCount,
    refetch: fetchInspirationVideos
  }
}

export function useDashboardTvInterviews (page = 1, perPage = 12) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchInspirationVideos = useCallback(
    async isCancelled => {
      if (!isCancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        // Calculate range for pagination
        const from = (page - 1) * perPage
        const to = from + perPage - 1

        // Get paginated data
        const {
          data: rows,
          error: fetchError,
          count
        } = await supabase
          .from('inspiration_videos')
          .select('*', { count: 'exact' })
          .eq('catagory', 'interview')
          .order('created_at', { ascending: false })
          .range(from, to)

        if (fetchError) throw fetchError

        if (!isCancelled) {
          setData(rows || [])
          setTotalCount(count || 0)
          setLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || err)
          setLoading(false)
          toast.error(`Error loading photos: ${err.message || err}`)
        }
      }
    },
    [page, perPage]
  )

  useEffect(() => {
    let isCancelled = false
    fetchInspirationVideos(isCancelled)
    return () => {
      isCancelled = true
    }
  }, [fetchInspirationVideos])

  return {
    data,
    loading,
    error,
    totalCount,
    refetch: fetchInspirationVideos
  }
}

// Dashboard hook - fetch employees for dashboard
export function useDashboardEmployees(limit = 5) {
  const { data, loading, error, refetch } = useEmployeesData(false); // false to not use filters

  // Transform employee data for dashboard display
  const employees = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .slice(0, limit)
      .map(emp => ({
        id: emp.id,
        name: emp.full_name || `Employee #${emp.id}`,
        title: emp.designation || 'Employee',
        email: emp.email || 'No email',
        profile_image: emp.profile_image || '/profile.jpg',
      }));
  }, [data, limit]);

  return {
    employees,
    loading,
    error,
    refetch,
  };
}

// Dashboard hook - fetch recently created employees for onboarding
export function useDashboardRecentEmployees(limit = 5) {
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecentEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("employees")
        .select(
          `
          id,
          employee_code,
          company_id,
          profile_image,
          candidates:candidates!employees_candidate_id_fkey(*)
        `
        )
        .eq("company_employee_status", "active")
        .eq("user_status", "active")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;

      setRecentEmployees(data || []);
    } catch (err) {
      setError(err.message || err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecentEmployees();
  }, [fetchRecentEmployees]);

  return {
    recentEmployees,
    loading,
    error,
    refetch: fetchRecentEmployees,
  };
}

// Comprehensive Dashboard hook - fetch all requests and provide counts
export function useDashboardRequests() {
  const [requestStats, setRequestStats] = useState({
    pending: 0,
    approved: 0,
    completed: 0,
    total: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchAllRequests = useCallback(async () => {
    if (!employeeId) return;

    setLoading(true);
    setError(null);

    try {
      // Get date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch all request types for the employee
      const [
        leaveRequests,
        loanRequests,
        allowanceRequests,
        expenseRequests,
        attendanceRequests,
        documents,
        grievanceRequests
      ] = await Promise.all([
        // Leave Requests
        supabase
          .from('leave_requests')
          .select('id, status, created_at, leave_type')
          .eq('employee_id', employeeId)
          .eq('is_deleted', false)
          .gte('created_at', thirtyDaysAgo.toISOString()),

        // Loan Requests
        supabase
          .from('loan_requests')
          .select('id, status, created_at, reason')
          .eq('employee_id', employeeId)
          .eq('is_deleted', false)
          .gte('created_at', thirtyDaysAgo.toISOString()),

        // Allowance Requests
        supabase
          .from('allowance_requests')
          .select('id, status, created_at, reason, type')
          .eq('created_by', employeeId)
          .eq('type', 'allowance')
          .eq('is_deleted', false)
          .gte('created_at', thirtyDaysAgo.toISOString()),

        // Expense Requests
        supabase
          .from('allowance_requests')
          .select('id, status, created_at, reason, type')
          .eq('created_by', employeeId)
          .eq('type', 'expense')
          .eq('is_deleted', false)
          .gte('created_at', thirtyDaysAgo.toISOString()),

        // Attendance Requests
        supabase
          .from('attendance_requests')
          .select('id, status, created_at, request_type')
          .eq('employee_id', employeeId)
          .eq('is_deleted', false)
          .gte('created_at', thirtyDaysAgo.toISOString()),

        // Documents
        supabase
          .from('my_documents')
          .select('id, status, created_at, document_type')
          .eq('created_by', employeeId)
          .eq('is_deleted', false)
          .gte('created_at', thirtyDaysAgo.toISOString()),

        // Grievance/Suggestions
        supabase
          .from('grievance_suggestions')
          .select('id, status, created_at, report_type')
          .eq('reporter_employee_id', employeeId)
          .eq('is_deleted', false)
          .gte('created_at', thirtyDaysAgo.toISOString())
      ]);

      // Combine all requests and add type information
      const allRequests = [
        ...(leaveRequests.data || []).map(req => ({ ...req, request_type: 'leave', title: req.leave_type || 'Leave Request' })),
        ...(loanRequests.data || []).map(req => ({ ...req, request_type: 'loan', title: req.reason || 'Loan Request' })),
        ...(allowanceRequests.data || []).map(req => ({ ...req, request_type: 'allowance', title: req.reason || 'Allowance Request' })),
        ...(expenseRequests.data || []).map(req => ({ ...req, request_type: 'expense', title: req.reason || 'Expense Request' })),
        ...(attendanceRequests.data || []).map(req => ({ ...req, request_type: 'attendance', title: req.request_type || 'Attendance Request' })),
        ...(documents.data || []).map(req => ({ ...req, request_type: 'document', title: req.document_type || 'Document Request' })),
        ...(grievanceRequests.data || []).map(req => ({ ...req, request_type: 'grievance', title: req.report_type || 'Grievance/Suggestion' }))
      ];

      // Calculate statistics
      const stats = {
        pending: allRequests.filter(req => req.status === 'pending').length,
        approved: allRequests.filter(req => req.status === 'approved').length,
        completed: allRequests.filter(req => req.status === 'completed').length,
        total: allRequests.length
      };

      // Get 3 most recent requests
      const recent = allRequests
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3)
        .map(req => ({
          id: req.id,
          type: req.request_type,
          title: req.title,
          status: req.status,
          created_at: req.created_at,
        }));

      setRequestStats(stats);
      setRecentRequests(recent);

    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  return {
    requestStats,
    recentRequests,
    loading,
    error,
    refetch: fetchAllRequests
  };
}
