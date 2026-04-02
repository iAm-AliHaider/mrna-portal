import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useAssetMaintenance(page = 0, searchQuery = "", filters = {}, perPage = 20) {
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
          .from("asset_maintenance")
          .select(`
            *,
            asset:assets!asset_maintenance_asset_id_fkey(
              id,
              name,
              serial_number
            )
          `, { count: "exact" })
          .eq("is_deleted", false);

        if (searchQuery) {
          query = query.or(`description.ilike.%${searchQuery}%,asset.name.ilike.%${searchQuery}%`);
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.maintenance_type) {
          query = query.eq("maintenance_type", filters.maintenance_type);
        }

        query = query.order("scheduled_date", { ascending: false });
        const { data: result, error: queryError, count: totalCount } = await query.range(from, to);

        if (isCancelled()) return;

        if (queryError) {
          setError(queryError);
          setData([]);
          toast.error("Failed to fetch maintenance records");
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

export function useCreateAssetMaintenance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("asset_maintenance")
        .insert([payload])
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Maintenance record created!");
      return data;
    } catch (err) {
      const message = err.message || err;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

export function useUpdateAssetMaintenance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("asset_maintenance")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Maintenance record updated!");
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

export function useAssetsForMaintenance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from("assets")
        .select("id, name, serial_number, status")
        .eq("is_deleted", false)
        .order("name", { ascending: true });
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading };
}
