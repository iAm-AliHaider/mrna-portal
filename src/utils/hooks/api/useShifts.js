import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";
import toast from "react-hot-toast";

// =====================
// SHIFTS
// =====================
export function useShifts(page = 0, perPage = 20) {
  const [shifts, setShifts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const from = page * perPage;
      const { data, error, count } = await supabase
        .from("shifts")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1);
      if (error) throw error;
      setShifts(data || []);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      toast.error("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { fetch(); }, [fetch]);
  return { shifts, totalPages, loading, refetch: fetch };
}

export function useCreateShift() {
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("shifts").insert([payload]).select().single();
      if (error) throw error;
      toast.success("Shift created successfully!");
      return data;
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  return { create, loading };
}

export function useUpdateShift() {
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shifts")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Shift updated successfully!");
      return data;
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  return { update, loading };
}

export function useDeleteShift() {
  const [loading, setLoading] = useState(false);
  const deleteShift = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("shifts")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Shift deactivated successfully!");
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);
  return { deleteShift, loading };
}

// =====================
// ROSTER SCHEDULES
// =====================
export function useRosterSchedules(weekStart = null, employeeId = null) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("roster_schedules")
          .select("*, shift:shifts(*), employee:employees!roster_schedules_employee_id_fkey(id, employee_code, candidates(first_name, second_name))")
          .order("schedule_date", { ascending: true });

        if (weekStart) {
          const start = new Date(weekStart);
          const end = new Date(start);
          end.setDate(end.getDate() + 6);
          query = query.gte("schedule_date", start.toISOString().split("T")[0]);
          query = query.lte("schedule_date", end.toISOString().split("T")[0]);
        }
        if (employeeId) {
          query = query.eq("employee_id", employeeId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setSchedules(data || []);
      } catch (err) {
        toast.error("Failed to fetch roster schedules");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [weekStart, employeeId]);

  return { schedules, loading };
}

export function useUpdateRosterSchedule() {
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("roster_schedules")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Roster updated successfully!");
      return data;
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  return { update, loading };
}

export function useCreateRosterSchedule() {
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("roster_schedules")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  return { create, loading };
}

// =====================
// ROSTER REQUESTS
// =====================
export function useRosterRequests(page = 0, perPage = 20) {
  const [requests, setRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const from = page * perPage;
      const { data, error, count } = await supabase
        .from("roster_requests")
        .select("*, employee:employees!roster_requests_employee_id_fkey(id, employee_code, candidates(first_name, second_name)), shift:shifts(*)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1);
      if (error) throw error;
      setRequests(data || []);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      toast.error("Failed to fetch roster requests");
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { fetch(); }, [fetch]);
  return { requests, totalPages, loading, refetch: fetch };
}

export function useCreateRosterRequest() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const create = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("roster_requests")
        .insert([{ ...payload, employee_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      toast.success("Roster request submitted!");
      return data;
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);
  return { create, loading };
}

export function useApproveRosterRequest() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const approve = useCallback(async (id, type) => {
    setLoading(true);
    try {
      const payload = type === "manager" ? { manager_approved: true } : { hr_approved: true };
      const { error } = await supabase.from("roster_requests").update(payload).eq("id", id);
      if (error) throw error;
      toast.success("Request approved!");
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, [user]);
  return { approve, loading };
}
