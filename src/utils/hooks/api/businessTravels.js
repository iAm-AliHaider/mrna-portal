import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { toast } from "react-hot-toast";
import { useUser } from "../../../context/UserContext";

// Fetch all business travels
export function useBusinessTravels(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [businessTravelData, setBusinessTravelData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [businessTravelOptions, setBusinessTravelOptions] = useState([]);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;
  const fetchBusinessTravels = useCallback(async (isCancelled) => {
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('business_travels')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .eq('employee_id', employeeId);

      if (searchQuery) {
        query = query.or(`reference.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
     
      if (filters.created_from) {
        query = query.gte('created_at', filters.created_from);
      }
      if (filters.created_to) {
        query = query.lte('created_at', filters.created_to);
      }
      if (filters.min_amount) {
        query = query.gte('amount_due', filters.min_amount);
      }
      if (filters.max_amount) {
        query = query.lte('amount_due', filters.max_amount);
      }
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setBusinessTravelData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setBusinessTravelData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
      setBusinessTravelOptions(
        (data || []).map((r) => ({
          label: r.referance || `Travel #${r.id}`,
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
  }, [employeeId, page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchBusinessTravels(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchBusinessTravels]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchBusinessTravels(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchBusinessTravels]);
  

  return { businessTravelData, totalPages, businessTravelOptions, error, count, loading, refetch };
}

// Create new business travel
export function useCreateBusinessTravel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBusinessTravel = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('business_travels')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Business travel created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createBusinessTravel, loading, error };
}

export function useUpdateBusinessTravel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateBusinessTravel = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('business_travels')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Business travel updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateBusinessTravel, loading, error };
}

export function useDeleteBusinessTravel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteBusinessTravel = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('business_travels');

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

      toast.success('Business travel deleted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteBusinessTravel, loading, error };
}