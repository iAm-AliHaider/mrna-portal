import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../supabaseClient";

export function useSurveyList(page = 0, pageSize = 10, searchQuery = "") {
  const [surveyData, setSurveyData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    created_from: "",
    created_to: "",
  });

  const fetchSurveyList = useCallback(
    async (newFilters = null) => {
      const currentFilters = newFilters || filters;
      const from = page * pageSize;
      const to = from + pageSize - 1;

      if (newFilters) {
        setFilters(newFilters);
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("surveys")
          .select("*", { count: "exact" })
          .ilike("survey_name", `%${searchQuery}%`)
          .order("created_at", { ascending: false });

        // Apply filters
        if (currentFilters.status) {
          query = query.eq("status", currentFilters.status);
        }
        if (currentFilters.created_from) {
          query = query.gte("created_at", currentFilters.created_from);
        }
        if (currentFilters.created_to) {
          query = query.lte("created_at", currentFilters.created_to);
        }

        // Pagination
        query = query.range(from, to);

        const { data, error: sbError, count: totalCount } = await query;

        if (sbError) throw sbError;

        setSurveyData(data || []);
        setCount(totalCount || 0);
        setTotalPages(Math.ceil((totalCount || 0) / pageSize));
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        toast.error(`Error loading surveys: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, searchQuery, filters]
  );

  useEffect(() => {
    fetchSurveyList();
  }, [fetchSurveyList]);

  return {
    surveyData,
    totalPages,
    count,
    error,
    loading,
    refetch: fetchSurveyList,
  };
}

export function useViewEmployeeSurveyId(surveyId) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (surveyId == null) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    //       supabase
    //   .from("surveys")
    //   .select("*, survey_questions(*), survey_assignments(*)")
    //   .eq("survey_assignments.survey_id, survey_questions.survey_id", surveyId)
    // supabase
    //   .from("surveys")
    //   .select("*, survey_questions(*), survey_assignments(*)")
    //   .eq("id", surveyId)
    //   .single()
    //   .then(({ data: row, error: sbError }) => {
    //     if (sbError) throw sbError;
    //     if (!isCancelled) {
    //       setData(row);
    //       setError(null);
    //     }
    //   })
    supabase
      .from("surveys")
      .select("*, survey_questions(*)")
      .eq("id", surveyId)
      .single()
      .then(({ data: row, error: sbError }) => {
        if (sbError) throw sbError;
        if (!isCancelled) {
          setData(row);
          setError(null);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "An unexpected error occurred");
          setData(null);
          toast.error(`Error loading survey: ${err.message || err}`);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [surveyId]);

  return { data, error, loading };
}

export function useResponseEmployeeSurvey(surveyId) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (surveyId == null) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    supabase
      .from("surveys")
      .select("*, survey_assignments(*)")
      .eq("id", surveyId)
      .single()
      .then(({ data: row, error: sbError }) => {
        if (sbError) throw sbError;
        if (!isCancelled) {
          setData(row);
          setError(null);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "An unexpected error occurred");
          setData(null);
          toast.error(`Error loading survey: ${err.message || err}`);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [surveyId]);

  return { data, error, loading };
}
