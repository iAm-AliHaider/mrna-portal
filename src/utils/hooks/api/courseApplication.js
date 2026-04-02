import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

export function useCreateCourseApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCourseApplication = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('course_applications')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Application submitted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createCourseApplication, loading, error };
}

export function useGetCourseApplications(page = 0, searchQuery = '', filters = {}, perPage = 10, userType, userId) {
  const [applications, setApplications] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchApplications = useCallback(async (isCancelled) => {
    try {
      if (!isCancelled()) {
        setLoading(true);
        setError(null);
      }

      const from = page * perPage;
      const to = from + perPage - 1;

      // Build the base query
      let query = supabase
        .from('course_applications')
        .select(`
          *,
          courses!inner (
            course_name,
            course_details,
            publisher,
            is_training,
            upload_certificate_date
          )
        `, { count: 'exact' });

      // Apply user type filters
      if (userType === 'TrainingAndDevelopment' && userId) {
        query = query.eq('applicant_id', userId);
      } else if (userType === 'TrainingAndCourses' && userId) {
        query = query.eq('course_id', userId);
      }

      // Apply search filters
      if (searchQuery) {
        query = query.ilike('courses.course_name', `%${searchQuery}%`);
      }
      

      // Apply additional filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('courses.is_training', filters.type === 'training');
      }
      if (filters.course_name) {
        query = query.ilike('courses.course_name', `%${filters.course_name}%`);
      }
      if (filters.created_from) {
        query = query.gte('created_at', filters.created_from);
      }

      // Apply sorting and pagination
      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error: queryError, count: totalCount } = await query;

      if (isCancelled()) return;

      if (queryError) {
        setError(queryError);
        setApplications([]);
        setTotalPages(0);
        setCount(0);
        return;
      }


      // Transform the data
      const transformedData = data.map(app => ({
        id: app.id,
        courseName: app.courses?.course_name || '',
        createdOn: app.created_at ? new Date(app.created_at).toLocaleDateString() : '',
        publisher: app.courses?.publisher || '',
        courseDetails: app.courses?.course_details || '',
        status: app.status || '',
        attachment_path: app.attachment_path || '',
        required_date: app.required_date || '',
        determine_need: app.determine_need || '',
        course_id: app.course_id || '',
        upload_certificate_date: app.courses?.upload_certificate_date || '',
        certificate_attachment: app.certificate_attachment || null
      }));



      setApplications(transformedData || []);
      setCount(totalCount || 0);
      setTotalPages(Math.ceil((totalCount || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) {
        setError(err);
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  }, [page, searchQuery, filters, perPage, userType, userId]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchApplications(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchApplications]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchApplications(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchApplications]);

  return {
    applications,
    totalPages,
    error,
    count,
    loading,
    refetch
  };
}


export function useUpdateCourseApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const updateCourseApplication = useCallback(async (id, updates) => {
    if (!id) {
      const msg = "Missing application id";
      setError(msg);
      toast.error(msg);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: upErr } = await supabase
        .from('course_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (upErr) {
        setError(upErr);
        toast.error(`Update failed: ${upErr.message || upErr}`);
        setLoading(false);
        return null;
      }

      toast.success('Application updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateCourseApplication, loading, error };
}
