import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

// Fetch meeting room bookings
export function useMeetingRoomBookings(page = 0, searchQuery = '', filters = {}, perPage = 10, employeeId) {
  const [meetingRoomData, setMeetingRoomData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async (isCancelled) => {
    try {
      if (!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('meeting_room_bookings')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);

      if (employeeId) {
        query = query.eq('created_by', employeeId);
      }

      if (searchQuery) {
        query = query.or(`room_name.ilike.%${searchQuery}%,room_code.ilike.%${searchQuery}%,meeting_code.eq.${searchQuery}`);
      }

      if (filters.from_date) query = query.eq('from_date', filters.from_date);
      if (filters.to_date) query = query.eq('to_date', filters.to_date);
      if (filters.room_location) query = query.ilike('room_location', `%${filters.room_location}%`);
      if (filters.meeting_code) query = query.eq('meeting_code', filters.meeting_code);
      if (filters.contains_projector !== undefined) query = query.eq('contains_projector', filters.contains_projector);
      if (filters.contains_video_conf_equipment !== undefined) query = query.eq('contains_video_conf_equipment', filters.contains_video_conf_equipment);
      if (filters.contains_telephone !== undefined) query = query.eq('contains_telephone', filters.contains_telephone);
      if (filters.phone_number) query = query.eq('phone_number', filters.phone_number);
      if (filters.notes) query = query.ilike('notes', `%${filters.notes}%`);
      if (filters.status) query = query.eq('status', filters.status);

      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setMeetingRoomData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setMeetingRoomData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [employeeId, page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchBookings(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchBookings]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    fetchBookings(() => isCancelled);
  }, [fetchBookings]);

  return { meetingRoomData, totalPages, error, count, loading, refetch };
}

// Create new meeting room booking
export function useCreateMeetingRoomBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMeetingRoomBooking = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      // Check for existing bookings with overlapping time and same room
      const { data: existing, error: existingError } = await supabase
        .from('meeting_room_bookings')
        .select('id')
        .eq('is_deleted', false)
        .eq('room_name', payload.room_name)
        .lte('from_date', payload.to_date)
        .gte('to_date', payload.from_date)
        .lte('meeting_start_time', payload.meeting_end_time)
        .gt('meeting_end_time', payload.meeting_start_time);

      if (existingError) {
        setError(existingError);
        toast.error(`Conflict check failed: ${existingError.message}`);
        setLoading(false);
        return null;
      }

      if (existing && existing.length > 0) {
        toast.error('Same time and meeting room already booked at this date. Please choose a different slot.');
        setLoading(false);
        return null;
      }

      const { data, error } = await supabase
        .from('meeting_room_bookings')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Meeting room booking created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createMeetingRoomBooking, loading, error };
}


// Update meeting room booking
export function useUpdateMeetingRoomBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateMeetingRoomBooking = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('meeting_room_bookings')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Meeting room booking updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateMeetingRoomBooking, loading, error };
}

// Delete meeting room booking (soft delete)
export function useDeleteMeetingRoomBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteMeetingRoomBooking = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('meeting_room_bookings');
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

      toast.success('Meeting room booking deleted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteMeetingRoomBooking, loading, error };
} 