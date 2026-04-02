import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useUser } from '../../../context/UserContext';
import toast from 'react-hot-toast';

export const useVacationTypes = () => {
    const { user } = useUser();
    const employmentTypeId = user?.employment_type_id;
  const [vacationTypes, setVacationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVacationTypes = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('leaves_vacations_insurance')
          .select('id, name')
          .eq('type', 'vacation');
        
        if (employmentTypeId) {
          query = query.eq('employment_type_id', employmentTypeId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setVacationTypes(data.map(v => ({ value: v.name, label: v.name })));
      } catch (err) {
        setError(err);
        toast.error('Error fetching vacation types');
      } finally {
        setLoading(false);
      }
    };

    fetchVacationTypes();
  }, [employmentTypeId]);

  return { vacationTypes, loading, error };
}; 