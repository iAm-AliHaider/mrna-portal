import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-hot-toast';
import { useUser } from '../../../context/UserContext';

export function useVacationRequests(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [vacationData, setVacationData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchVacationRequests = useCallback(async (isCancelled) => {
    if (!employeeId || isCancelled()) return;

    try {
      setLoading(true);
      setError(null);

      const from = page * perPage;
      const to = from + perPage - 1;
      let query = supabase
        .from('vacation_requests')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .eq('employee_id', employeeId);

      if (searchQuery) {
        query = query.or(`vacation_type.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.employeeNumber) {
        query = query.eq('employee_number', filters.employeeNumber);
      }
      if (filters.fromDate) {
        query = query.gte('start_date', filters.fromDate);
      }
      if (filters.toDate) {
        query = query.lte('return_date', filters.toDate);
      }
      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        setError(error);
        setVacationData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }
      setVacationData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage, employeeId]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchVacationRequests(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchVacationRequests, employeeId ]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchVacationRequests(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchVacationRequests, employeeId]);

  return { 
    vacationData, 
    totalPages, 
    error, 
    count, 
    loading,
    refetch 
  };
}

// CREATE HOOK
export function useCreateVacationRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createVacationRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
      .from('vacation_requests')
      .insert([payload])
      .select()
      .single();

      if(error){
        throw error;
      }
      toast.success('Vacation request created successfully!');
      setLoading(false);
      return data;
      
    } catch (error) {
      setError(error.message || error);
      toast.error(`Creation failed: ${error.message || error}`);
      setLoading(false);
      return null;
    }
    
  }, []);

  return { createVacationRequest, loading, error };
}

// UPDATE HOOK
export function useUpdateVacationRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateVacationRequest =useCallback( async (id, updates) => {

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
      .from('vacation_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

      if(error){
        throw error;
      }
      toast.success('Vacation request updated successfully!');
      setLoading(false);
      return data;
    } catch (error) {
      setError(error.message || error);
      toast.error(`Update failed: ${error.message || error}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateVacationRequest, loading, error };
}

// DELETE HOOK
export function useDeleteVacationRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteVacationRequest = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try{
let query = supabase.from('vacation_requests');

      if(Array.isArray(id)){
        query = query.delete().in('id', id);
      }else{
        query = query.delete().eq('id', id);
      }

      const { error, data } = await query;

      if(error){
        throw error;
      }

      toast.success(Array.isArray(id) ? `Deleted ${id.length} vacation requests successfully.` : 'Vacation request deleted successfully.');
      setLoading(false);
      return data;

    }catch(error){
      if(error.code === '23503'){
        toast.error('Cannot delete vacation request: referenced by other records');
        return null;
      }
      setError(error.message || error);
      toast.error(`Deletion failed: ${error.message || error}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteVacationRequest, loading, error };
}

// const deleteVacationRequest = async (id) => {
//   const { data, error } = await supabase
//     .from('vacation_requests')
//     .update({ is_deleted: true })
//     .eq('id', id);
//   if (!error) refetch();
//   if (error) setError(error);
//   return { data, error };
// };