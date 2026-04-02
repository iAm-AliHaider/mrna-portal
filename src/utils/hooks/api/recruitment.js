import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useScheduledInterviewsList(
  page = 0,
  pageSize = 10,
  searchQuery = ""
) {
  const [interviews, setInterviews] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const currentEmployeeId = user?.id || null;

  const fetchCandidates = useCallback(async () => {
    if (!currentEmployeeId) {
      setError("User not authenticated");
      return;
    }


    setLoading(true);
    const from = page * pageSize;
    try {
      const { data, error } = await supabase.rpc(
        "get_interviews_for_employee",
        {
          employee_id: currentEmployeeId,
          search_term: searchQuery || null,
          page_limit: pageSize,
          page_offset: from,
        },
        { count: "exact" }
      );

      if (error) throw error;

      setInterviews(data?.interviews || []);
      setCount(data?.count || 0);
      setTotalPages(Math.ceil((data?.count || 0) / pageSize));
      setError(null);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      toast.error(`Error loading candidates: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, currentEmployeeId]);

  useEffect(() => {
    let isCancelled = false;
    if (!isCancelled) fetchCandidates();
    return () => {
      isCancelled = true;
    };
  }, [fetchCandidates]);

  return {
    interviews,
    totalPages,
    count,
    error,
    loading,
    refetch: fetchCandidates,
  };
}

export const useUpdateInterview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const employeeId = user?.id;

  const updateInterview = async (interviewData, id) => {
    setLoading(true);
    try {
      const payload = {
        ...interviewData,
        updated_by: employeeId,
      };

      const { data, error: updateError } = await supabase
        .from("scheduled_interviews")
        .update(payload)
        .eq("id", id)
        .single();

      if (updateError) throw updateError;

      toast.success("Note added successfully");
      return data;
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      toast.error(`Error scheduling interview: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateInterview,
    loading,
    error,
  };
};

export const useUpcommingInterviewsList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interviewData, setInterviewData] = useState([]);
  const { user } = useUser();
  const employeeId = user?.id;

  useEffect(() => {
    if (!employeeId) return;

    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split("T")[0];

        const { data, error: fetchError } = await supabase
          .from("scheduled_interviews").select("*")
          .or(
            [
              `interviewer_id.eq.${employeeId}`,
              `second_interviewer_id.eq.${employeeId}`,
              `third_interviewer_id.eq.${employeeId}`,
              `third_interview_panel_member_two_id.eq.${employeeId}`,
              `third_interview_panel_member_one_id.eq.${employeeId}`,
              `second_interview_panel_member_one_id.eq.${employeeId}`,
              `second_interview_panel_member_two_id.eq.${employeeId}`,
              `first_interview_panel_member_one_id.eq.${employeeId}`,
              `first_interview_panel_member_two_id.eq.${employeeId}`,
            ].join(",")
          );

        if (fetchError) throw fetchError;
        // Only keep rows with interview date today or in future
        const filtered = (data || []).filter((row) =>
          [row.third_interview_date, row.second_interview_date, row.first_interview_date]
            .some((date) => date && date >= today)
        );

        // For each filtered row, fetch candidate email and add as candidate_email
        const withEmails = await Promise.all(
          filtered.map(async (row) => {
            let candidate_email = null;
            if (row.candidate_id) {
              const { data: candidate, error: candidateError } = await supabase
                .from("candidates")
                .select("email")
                .eq("id", row.candidate_id)
                .single();
              if (!candidateError && candidate && candidate.email) {
                candidate_email = candidate.email;
              }
            }
            return { ...row, candidate_email };
          })
        );

        setInterviewData(withEmails);
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        toast.error(`Error fetching interview: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [employeeId]);

  return { interviewData, loading, error };
};

export function useJobOfferTask(employmentTypeId) {
  const [jobOfferTasks, setJobOfferTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!employmentTypeId) return [];

    setLoading(true);
    setError(null);

    try {
      const { data: rows, error: sbError } = await supabase
        .from("tasks")
        .select("*")
        .eq("employment_type_id", employmentTypeId)
        .in("task_type", ["job_offer_task"]);

      if (sbError) throw sbError;

      setJobOfferTasks(rows || []);
      return rows || [];   // <-- IMPORTANT: return rows
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load hiring tasks");
      toast.error(`Error loading tasks: ${err.message || err}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [employmentTypeId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { jobOfferTasks, fetchTasks, loading, error };  // <-- MUST include fetchTasks
}