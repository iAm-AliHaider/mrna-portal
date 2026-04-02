import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';

export function useEmployeeLeaveQuota(employeeId) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaveTypes = useCallback(async () => {
    if (!employeeId) return;

    setIsLoading(true);
    setError(null);

    const { data: rawData, error: fetchError } = await supabase
      .from('employee_leave_qouta')
      .select(`
        id,
        employee_id,
        leave_type_id,
        availed_leaves,
        leave_type:leaves_vacations_insurance!employee_leave_qouta_leave_type_id_fkey(id, name, type, days_allowed)
      `)
      .eq('employee_id', employeeId);

    if (fetchError) {
      setError(fetchError);
      setData([]);
    } else {
      const filtered = (rawData || []).filter(item => item.leave_type && item.leave_type.type === 'leave');
      setData(filtered);
    }

    setIsLoading(false);
  }, [employeeId]);

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchLeaveTypes
  };
}
