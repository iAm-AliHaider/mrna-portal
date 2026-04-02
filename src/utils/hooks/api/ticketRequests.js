import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast'; 
import { supabase } from '../../../supabaseClient';
import { useUser } from '../../../context/UserContext';

export function useTicketRequests(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [ticketData, setTicketData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchTickets = useCallback(async (isCancelled) => {
    if (!employeeId || isCancelled()) return;
    try {
      setLoading(true);
      setError(null);

      const from = page * perPage;
      const to = from + perPage - 1;
      let query = supabase
        .from('ticket_requests')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .eq('employee_id', employeeId);

      if (searchQuery) {
        query = query.or(`status.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.employee_no) {
        query = query.eq('employee_no', filters.employee_no);
      }
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (filters.from_date) {
        query = query.gte('departure_date', filters.from_date);
      }
      if (filters.to_date) {
        query = query.lte('return_date', filters.to_date);
      }
      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setTicketData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }
      setTicketData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      setError(err);
      if (!isCancelled()) setLoading(false);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage, employeeId]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchTickets(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchTickets, employeeId]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchTickets(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchTickets, employeeId]);

  return { ticketData, totalPages, error, count, loading, refetch };
} 

export function useCreateTicketRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTicketRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
try{
  const { data, error } = await supabase
  .from('ticket_requests')
  .insert([payload])
  .select()
  .single();

  if (error) {
    throw error;
  }

  toast.success('Ticket request created successfully!');
  setLoading(false);
  return data;
}catch(err){
  setError(err.message || err);
  toast.error(`Creation failed: ${err.message || err}`);
  setLoading(false);
  return null;
}

  }, []);

  return { createTicketRequest, loading, error };
}