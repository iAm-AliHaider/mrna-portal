import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function usePreHiringTasks(employeeTypeId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreHiringTasks = useCallback(async (isCancelled) => {
    if (!isCancelled) {
      setLoading(true);
      setError(null);
    }

    try {
      const { data: rows, error: fetchError } = await supabase
        .from("hiring_tasks")
        .select("*")
        .eq("employment_type_id", Number(employeeTypeId))
        .single()


      if (fetchError) {
        throw fetchError;
      }

      if (!isCancelled) {
        setData(rows || []);
        setLoading(false);
      }
    } catch (err) {
      if (!isCancelled) {
        setError(err.message || err);
        setLoading(false);
        toast.error(`Error loading candidates: ${err.message || err}`);
      }
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    fetchPreHiringTasks(isCancelled);

    return () => {
      isCancelled = true;
    };
  }, [fetchPreHiringTasks, employeeTypeId]);

  return {
    data,
    loading,
    error,
    refetch: fetchPreHiringTasks,
  };
}

export function useSuccessionPlanningTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('tasks')
      .select('*')
      .eq('task_type', 'succession_planning')
      .then(({ data }) => setTasks(data || []))
      .finally(() => setLoading(false));
  }, []);

  return { tasks, loading };
}
