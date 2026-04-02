import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

export function useCreateTrainingAndDevelopment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTrainingAndDevelopment = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Training/Course created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createTrainingAndDevelopment, loading, error };
}

export function useUpdateTrainingAndDevelopment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTrainingAndDevelopment = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('courses')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Training/Course updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateTrainingAndDevelopment, loading, error };
}

export function useGetTrainingAndDevelopmentById(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTrainingAndDevelopment = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error);
        toast.error(`Error fetching data: ${error.message}`);
        return;
      }

      setData(data);
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Error fetching data: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getTrainingAndDevelopment();
  }, [getTrainingAndDevelopment]);

  return { data, loading, error, refetch: getTrainingAndDevelopment };
}

export const useGetTrainingsAndCourses = (page = 0, searchQuery = '', filters = {}, perPage = 10) => {
  const [trainings, setTrainings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTrainingsAndCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const from = page * perPage;
      const to = from + perPage - 1;

      const buildQuery = (isTraining) => {
        let query = supabase
          .from('courses')
          .select('*', { count: 'exact' })
          .eq('is_training', isTraining)
          .eq('is_deleted', false);

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.course_id) query = query.eq('id', filters.course_id);
        if (filters.publisher) query = query.eq('publisher', filters.publisher);
        if (filters.created_from) query = query.gte('created_at', filters.created_from);
        if (filters.created_to) query = query.lte('created_at', filters.created_to);
        if (filters.trainer_type === 'internal_trainer') query = query.is('external_trainer', null);
        if (filters.trainer_type === 'external_trainer') query = query.is('internal_trainer', null);
        if (searchQuery) query = query.ilike('course_name', `%${searchQuery}%`);

        return query.range(from, to).order('created_at', { ascending: false });
      };

      const { data: trainingsData, error: trainingsError } = await buildQuery(true);
      const { data: coursesData, error: coursesError } = await buildQuery(false);

      if (trainingsError) {
        toast.error(trainingsError.message);
        setError(trainingsError);
      }

      if (coursesError) {
        toast.error(coursesError.message);
        setError(coursesError);
      }

      setTrainings(trainingsData || []);
      setCourses(coursesData || []);
      setCount((trainingsData?.length || 0) + (coursesData?.length || 0));
      setTotalPages(Math.ceil(((trainingsData?.length || 0) + (coursesData?.length || 0)) / perPage));
    } catch (err) {
      const message = err?.message || err;
      setError(message);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filters, perPage]);

  useEffect(() => {
    getTrainingsAndCourses();
  }, [getTrainingsAndCourses]);

  const refetch = useCallback(() => {
    getTrainingsAndCourses();
  }, [getTrainingsAndCourses]);

  return {
    trainings,
    courses,
    loading,
    error,
    count,
    totalPages,
    getTrainingsAndCourses,
    refetch
  };
};

export const useGetTypedTrainingsAndCourses = (type = 'training') => {
  const [responseData, setResponseData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getTrainingsAndCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const isTraining = type === 'training'
      let query = supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .eq('is_training', isTraining)
        .eq('is_deleted', false);

      const { data, error: trainingsError } = await query.order('created_at', {
        ascending: false
      })

      if (trainingsError) {
        toast.error(trainingsError.message)
        setError(trainingsError)
      }

      setResponseData(data || [])
    } catch (err) {
      const message = err?.message || err
      setError(message)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    getTrainingsAndCourses()
  }, [getTrainingsAndCourses])

  return {
    data: responseData,
    loading,
    error,
    refetch: getTrainingsAndCourses
  }
}

export function useDeleteTrainingAndDevelopment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteTrainingAndDevelopment = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ is_deleted: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        toast.error(`Delete failed: ${error.message}`);
        return { data: null, error: error };
      }
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Delete failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteTrainingAndDevelopment, loading, error };
}
