import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useBonusIncentives(page = 0, searchQuery = "", filters = {}, perPage = 20) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (isCancelled) => {
    try {
      setLoading(true);
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("bonus_incentives")
        .select(`
          *,
          employee:employees!bonus_incentives_employee_id_fkey(
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
        `, { count: "exact" })
        .eq("is_deleted", false);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      if (filters.bonus_type) {
        query = query.eq("bonus_type", filters.bonus_type);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      query = query.order("created_at", { ascending: false });
      const { data: result, error, count: totalCount } = await query.range(from, to);

      if (isCancelled()) return;
      if (error) throw error;

      setData(result || []);
      setTotalPages(Math.ceil((totalCount ?? 0) / perPage));
    } catch (err) {
      console.error(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchData]);

  return { data, totalPages, loading, refetch: fetchData };
}

export function useCreateBonusIncentive() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bonus_incentives")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      toast.success("Bonus/Incentive created!");
      return data;
    } catch (err) {
      toast.error(err.message || "Failed to create bonus");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading };
}

export function useUpdateBonusIncentive() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bonus_incentives")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Bonus/Incentive updated!");
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
