import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export const useLoanTypes = () => {
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoanTypes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('loan_types')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setLoanTypes(data || []);
      } catch (err) {
        setError(err);
        console.error('Error fetching loan types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanTypes();
  }, []);

  return { loanTypes, loading, error };
}; 