import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";

export function useTrainingCalendar(month = null, year = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("trainings")
        .select(`
          *,
          course:courses!trainings_course_id_fkey(
            id,
            name,
            description
          ),
          trainer:employees!trainings_trainer_id_fkey(
            id,
            employee_code,
            candidates:candidates!employees_candidate_id_fkey(
              first_name,
              second_name,
              third_name,
              forth_name,
              family_name
            )
          )
        `)
        .eq("is_deleted", false)
        .eq("status", "scheduled");

      if (month && year) {
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
        query = query.gte("start_date", startDate).lte("start_date", endDate);
      }

      query = query.order("start_date", { ascending: true });

      const { data: result, error: queryError } = await query;

      if (queryError) {
        setError(queryError);
        toast.error("Failed to fetch training calendar");
        return;
      }

      setData(result || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
