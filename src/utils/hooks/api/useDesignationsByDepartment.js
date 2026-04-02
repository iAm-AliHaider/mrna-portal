import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export function useDesignationsByDepartment(departmentId) {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!departmentId) {
      setDesignations([]);
      return;
    }
    setLoading(true);
    supabase
      .from('designations')
      .select('*')
      .eq('department_id', departmentId)
      .then(({ data, error }) => {
        if (error) setError(error);
        setDesignations(
          (data || []).map((d) => ({
            value: d.id?.toString(),
            label: d.name,
          }))
        );
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [departmentId]);

  return { designations, loading, error };
} 