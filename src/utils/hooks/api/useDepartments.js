import { useState, useEffect } from 'react';
import { supaBasegetAllCall } from '../../common';

export function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    supaBasegetAllCall("organizational_units")
      .then((data) => {
        setDepartments(
          (data || []).map((item) => ({
            value: item.id?.toString(),
            label: item.name,
          }))
        );
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { departments, loading, error };
} 