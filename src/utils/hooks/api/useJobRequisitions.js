import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";
import toast from "react-hot-toast";

export function useJobRequisitions(page = 0, searchQuery = "", filters = {}, perPage = 20) {
  const [requisitions, setRequisitions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const from = page * perPage;
      let query = supabase
        .from("job_requisitions")
        .select(`*, department:departments(id, name), designation:designations(id, title), employment_type:employment_types(id, name), requested_by:employees!job_requisitions_requested_by_id_fkey(id, candidates(first_name, second_name))`, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,justification.ilike.%${searchQuery}%`);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.department_id) {
        query = query.eq("department_id", filters.department_id);
      }
      if (filters.urgency) {
        query = query.eq("urgency", filters.urgency);
      }

      const { data, error, count: totalCount } = await query;
      if (error) throw error;

      const transformed = (data || []).map(r => ({
        ...r,
        departmentName: r.department?.name || "N/A",
        designationName: r.designation?.title || "N/A",
        employmentTypeName: r.employment_type?.name || "N/A",
        requestedByName: r.requested_by?.candidates ? `${r.requested_by.candidates.first_name} ${r.requested_by.candidates.second_name}` : "N/A",
      }));

      setRequisitions(transformed);
      setCount(totalCount || 0);
      setTotalPages(Math.ceil((totalCount || 0) / perPage));
    } catch (err) {
      toast.error("Failed to fetch job requisitions");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filters, perPage]);

  useEffect(() => { fetch(); }, [fetch]);
  return { requisitions, totalPages, count, loading, refetch: fetch };
}

export function useCreateJobRequisition() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const create = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_requisitions")
        .insert([{ ...payload, requested_by_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      toast.success("Job requisition created successfully!");
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

export function useUpdateJobRequisition() {
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_requisitions")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Job requisition updated successfully!");
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

export function useDeleteJobRequisition() {
  const [loading, setLoading] = useState(false);
  const deleteReq = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("job_requisitions").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      toast.success("Job requisition cancelled");
    } catch (err) {
      toast.error(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);
  return { deleteReq, loading };
}

// Dashboard stats
export function useRecruitmentDashboardStats() {
  const [stats, setStats] = useState({
    totalVacancies: 0,
    activeVacancies: 0,
    onHold: 0,
    closed: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    offersExtended: 0,
    hiredThisMonth: 0,
    pipelineFunnel: { applications: 0, screening: 0, interview: 0, offer: 0, hired: 0 },
    recentActivity: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

        const [vacRes, activeRes, holdRes, closedRes, appRes, intRes, offerRes, hiredRes] = await Promise.all([
          supabase.from("vacancy").select("id", { count: "exact", head: true }),
          supabase.from("vacancy").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("vacancy").select("id", { count: "exact", head: true }).eq("status", "on_hold"),
          supabase.from("vacancy").select("id", { count: "exact", head: true }).eq("status", "closed"),
          supabase.from("candidates").select("id", { count: "exact", head: true }),
          supabase.from("interview_schedule").select("id", { count: "exact", head: true }).gte("scheduled_at", monthStart),
          supabase.from("offer_requests").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
          supabase.from("candidates").select("id", { count: "exact", head: true }).eq("status", "hired").gte("created_at", monthStart),
        ]);

        setStats({
          totalVacancies: vacRes.count || 0,
          activeVacancies: activeRes.count || 0,
          onHold: holdRes.count || 0,
          closed: closedRes.count || 0,
          totalApplications: appRes.count || 0,
          interviewsScheduled: intRes.count || 0,
          offersExtended: offerRes.count || 0,
          hiredThisMonth: hiredRes.count || 0,
          pipelineFunnel: {
            applications: appRes.count || 0,
            screening: Math.floor((appRes.count || 0) * 0.5),
            interview: intRes.count || 0,
            offer: offerRes.count || 0,
            hired: hiredRes.count || 0,
          },
          recentActivity: [],
        });
      } catch (err) {
        console.error("Recruitment dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { stats, loading };
}
