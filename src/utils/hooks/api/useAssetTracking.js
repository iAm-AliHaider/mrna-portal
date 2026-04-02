import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useAssetTracking(page = 0, searchQuery = "", filters = {}, perPage = 20) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (isCancelled) => {
      try {
        setLoading(true);
        setError(null);
        const from = page * perPage;
        const to = from + perPage - 1;

        let query = supabase
          .from("assets")
          .select(`
            *,
            category:asset_categories!assets_asset_category_id_fkey(
              id,
              name
            ),
            assigned_to:employees!assets_assigned_to_fkey(
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
          query = query.or(`name.ilike.%${searchQuery}%,serial_number.ilike.%${searchQuery}%`);
        }
        if (filters.category) {
          query = query.eq("asset_category_id", filters.category);
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.location) {
          query = query.ilike("location", `%${filters.location}%`);
        }

        query = query.order("created_at", { ascending: false });
        const { data: result, error: queryError, count: totalCount } = await query.range(from, to);

        if (isCancelled()) return;

        if (queryError) {
          setError(queryError);
          setData([]);
          toast.error("Failed to fetch asset tracking data");
          return;
        }

        setData(result || []);
        setCount(totalCount ?? 0);
        setTotalPages(Math.ceil((totalCount ?? 0) / perPage));
      } catch (err) {
        if (!isCancelled()) setError(err);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [page, searchQuery, filters, perPage]
  );

  useEffect(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchData]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
  }, [fetchData]);

  return { data, totalPages, error, count, loading, refetch };
}

export function useUpdateAssetLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("assets")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Asset location updated!");
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}
