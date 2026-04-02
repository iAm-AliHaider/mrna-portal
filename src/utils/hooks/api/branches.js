import { useState, useEffect, useCallback } from "react";
import { supabase } from '../../../supabaseClient';
import toast from "react-hot-toast";

// Fetch all branches with pagination
export function useBranches(page = 0, searchQuery = '', perPage = 10) {
  const [branchesData, setBranchesData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [branchOptions, setBranchOptions] = useState([]);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBranches = useCallback(async (isCancelled) => {
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('branches')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,short_code.ilike.%${searchQuery}%`);
      }

      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setBranchesData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setBranchesData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
      setBranchOptions(
        (data || []).map((r) => ({
          label: r.name || `Branch #${r.id}`,
          value: r.id,
        }))
      );
    } catch (err) {
      if(!isCancelled()) {
        setError(err);
      }
    } finally {
      if(!isCancelled()) {
        setLoading(false);
      }
    }
  }, [page, searchQuery, perPage]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchBranches(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchBranches]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchBranches(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchBranches]);
  

  return { branchesData, totalPages, branchOptions, error, count, loading, refetch };
}

// Create new branch
export function useCreateBranch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBranch = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('branches')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Branch created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createBranch, loading, error };
}

// Update branch
export function useUpdateBranch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateBranch = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('branches')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Branch updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateBranch, loading, error };
}

// Delete branch (soft delete)
export function useDeleteBranch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteBranch = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('branches');

      if (Array.isArray(id)) {
        query = query.update({ is_deleted: true }).in('id', id);
      } else {
        query = query.update({ is_deleted: true }).eq('id', id);
      }

      const { data, error } = await query.select();

      if (error) {
        setError(error);
        toast.error(`Deletion failed: ${error.message}`);
        return null;
      }

      toast.success('Branch deleted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteBranch, loading, error };
}

// Get single branch by ID
export function useBranch(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBranch = useCallback(async (isCancelled) => {
    if (!id) return;
    
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }

      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setData(null);
        return;
      }

      setData(data);
    } catch (err) {
      if(!isCancelled()) {
        setError(err);
      }
    } finally {
      if(!isCancelled()) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchBranch(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchBranch]);

  return { data, loading, error };
} 