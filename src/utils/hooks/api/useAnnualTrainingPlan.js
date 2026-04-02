import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useAnnualTrainingPlan(year = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentYear = year || new Date().getFullYear();

      const { data: result, error: queryError } = await supabase
        .from("annual_training_plan")
        .select(`
          *,
          course:courses!annual_training_plan_course_id_fkey(
            id,
            name,
            description
          )
        `)
        .eq("is_deleted", false)
        .eq("year", currentYear)
        .order("quarter", { ascending: true })
        .order("month", { ascending: true });

      if (queryError) {
        setError(queryError);
        toast.error("Failed to fetch annual training plan");
        return;
      }

      setData(result || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useCreateAnnualPlanItem() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("annual_training_plan")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      toast.success("Training plan item added!");
      return data;
    } catch (err) {
      toast.error(err.message || "Failed to add item");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading };
}

export function useUpdateAnnualPlanItem() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("annual_training_plan")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Training plan item updated!");
      return data;
    } catch (err) {
      toast.error(`Update failed: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading };
}
