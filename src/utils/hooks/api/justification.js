import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../supabaseClient';
import { useUser } from '../../../context/UserContext';

export function useJustificationRequests(page = 0, searchQuery = '', filters = {}, perPage = 10, type = 'justifications', employee_id, is_manager) {
  const [justificationData, setJusticeficationData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const employeeId = user?.id;

  const fetchJustifications = useCallback(async (isCancelled) => {
    if (!employeeId || isCancelled()) return;

    try {
      setLoading(true);
      setError(null);

      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('justifications')
        .select(`
          *,
          employee:employees!justifications_employee_id_fkey(
            id,
            candidate_id,
            candidate:candidates!employees_candidate_id_fkey(
              full_name
            )
          )
        `, { count: 'exact' });

      if (searchQuery) {
        query = query.or(
          `justification_question.ilike.%${searchQuery}%`
        );
      }


      if(is_manager){
  query = query.eq(
          `manager_id`, employee_id
        );
      }
      else if (employee_id) {
        query = query.eq(
          `employee_id`, employee_id
        );
      }


      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setJusticeficationData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setJusticeficationData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, perPage, searchQuery, filters, employeeId, type]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchJustifications(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [useJustificationRequests, employeeId]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchJustifications(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchJustifications, employeeId]);

  return {
    justificationData,
    totalPages,
    error,
    count,
    loading,
    refetch
  };
}



// CREATE HOOK
export function useCreateJustificationRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createJustificationRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('justifications')
        .insert([payload])
        .select()
        .single();
      
      if (sbError) {
        throw sbError;
      }
      
      toast.success('Justification request created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Creation failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createJustificationRequest, loading, error };
}

// UPDATE HOOK
export function useUpdateJustificationRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateJustificationRequest = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);


    try {
      const { data, error: sbError } = await supabase
        .from('justifications')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (sbError) {
        throw sbError;
      }
      
      toast.success('Justification request updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateJustificationRequest, loading, error };
}

// DELETE HOOK
export function useDeleteJustificationRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteJustificationRequest = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('advance_salary');

      if (Array.isArray(ids)) {
        query = query.update({ is_deleted: true }).in('id', ids);
      } else {
        query = query.update({ is_deleted: true }).eq('id', ids);
      }

      const { error: sbError, data } = await query;

      if (sbError) {
        throw sbError;
      }

      toast.success(
        Array.isArray(ids)
          ? `Deleted ${ids.length} Justification requests successfully.`
          : 'Justification request deleted successfully.'
      );
      setLoading(false);
      return data;
    } catch (err) {
      if (err.code === '23503') {
        toast.error('Cannot delete Justification request: referenced by other records');
        return null;
      }
      setError(err.message || err);
      toast.error(`Deletion failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteJustificationRequest, loading, error };
} 