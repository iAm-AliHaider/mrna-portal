import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";

export function useAssetHistory(assetId = null, page = 0, perPage = 50) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (isCancelled) => {
      try {
        setLoading(true);
        setError(null);
        const from = page * perPage;
        const to = from + perPage - 1;

        let query = supabase
          .from("asset_history")
          .select(`
            *,
            asset:assets!asset_history_asset_id_fkey(
              id,
              name,
              serial_number
            ),
            performed_by:employees!asset_history_performed_by_fkey(
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

        if (assetId) {
          query = query.eq("asset_id", assetId);
        }

        query = query.order("created_at", { ascending: false });
        const { data: result, error: queryError, count: totalCount } = await query.range(from, to);

        if (isCancelled()) return;

        if (queryError) {
          setError(queryError);
          setData([]);
          toast.error("Failed to fetch asset history");
          return;
        }

        setData(result || []);
        setTotalPages(Math.ceil((totalCount ?? 0) / perPage));
      } catch (err) {
        if (!isCancelled()) setError(err);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [assetId, page, perPage]
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

  return { data, totalPages, error, loading, refetch };
}
