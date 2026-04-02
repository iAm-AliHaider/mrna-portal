import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { toast } from "react-hot-toast";
import { useUser } from "../../../context/UserContext";

export function useAttendanceRequests(
  page = 0,
  searchQuery = "",
  filters = {},
  perPage = 10
) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchAttendance = useCallback(
    async (isCancelled) => {
      if (!employeeId || isCancelled()) return;
      try {
        setLoading(true);
        setError(null);

        const from = page * perPage;
        const to = from + perPage - 1;
        let query = supabase
          .from("attendance_requests")
          .select("*", { count: "exact" })
          .eq("is_deleted", false)
          .eq("employee_id", employeeId);

        if (searchQuery) {
          query = query.or(
            `reason.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`
          );
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.request_type) {
          query = query.eq("request_type", filters.request_type);
        }
        if (filters.original_date) {
          query = query.eq("original_date", filters.original_date);
        }
        if (filters.new_time) {
          query = query.eq("new_time", filters.new_time);
        }
        if (filters.check_type) {
          query = query.eq("check_type", filters.check_type);
        }
        query = query.order("created_at", { ascending: false });
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (isCancelled()) return;

        if (error) {
          setError(error);
          setAttendanceData([]);
          setTotalPages(0);
          setCount(0);
          return;
        }

        setAttendanceData(data || []);
        setCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / perPage));
      } catch (err) {
        if (!isCancelled()) setError(err);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [page, searchQuery, filters, perPage, employeeId]
  );

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchAttendance(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchAttendance, employeeId]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchAttendance(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchAttendance, employeeId]);

  return { attendanceData, totalPages, error, count, loading, refetch };
}

export function useCreateAttendanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAttendanceRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("attendance_requests")
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success("Attendance request created successfully!");
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createAttendanceRequest, loading, error };
}

export function useUpdateAttendanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateAttendanceRequest = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("attendance_requests")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success("Attendance request updated successfully!");
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateAttendanceRequest, loading, error };
}

export function useDeleteAttendanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteAttendanceRequest = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("attendance_requests");

      if (Array.isArray(id)) {
        query = query.update({ is_deleted: true }).in("id", id);
      } else {
        query = query.update({ is_deleted: true }).eq("id", id);
      }

      const { data, error } = await query.select();

      if (error) {
        setError(error);
        toast.error(`Deletion failed: ${error.message}`);
        return null;
      }

      toast.success("Attendance request deleted successfully!");
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteAttendanceRequest, loading, error };
}

export function useAttendanceDuplicateCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAttendanceDuplicate = useCallback(
    async ({
      employee_id,
      request_type,
      original_date,
      start_time,
      end_time,
      showToast,
    }) => {
      setLoading(true);
      setError(null);

      try {
        // const normalizedTitle = (title || "").trim();
        if (!employee_id || !request_type || !original_date || !start_time || !end_time) {
          throw new Error(
            "Missing required fields: employee_id, request_type, original_date, start_time, end_time"
          );
        }

        let query = supabase
          .from("attendance_requests")
          .select(
            "id, employee_id, request_type, original_date, start_time, end_time",
            { count: "exact" }
          )
          .eq("employee_id", employee_id)
          .eq("request_type", request_type)
          .eq("original_date", original_date)
          .eq("start_time", start_time)
          .eq("end_time", end_time);

        const { data, error: sbError } = await query;
        if (sbError) throw sbError;

        const exists = Array.isArray(data) && data.length > 0;
        const record = exists ? data[0] : null;

        if (exists && showToast) {
          toast.error(
            "A Attendance with the same type, time and date already exists."
          );
        }

        return { exists, record };
      } catch (err) {
        const msg =
          err?.message || "Failed to check duplicate Attendance Request";
        setError(msg);
        if (showToast) toast.error(msg);
        return { exists: false, record: null };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { checkAttendanceDuplicate, loading, error };
}
