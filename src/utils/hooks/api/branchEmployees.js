import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useUser } from '../../../context/UserContext';

export const useBranchEmployees = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [employeesInBranch, setEmployeesInBranch] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchEmployeesInBranch = async () => {
      if (!employeeId) return;
      
      setLoading(true);
      try {
        // Get current employee's branch
        const { data: currentEmployee, error: currentError } = await supabase
          .from('employees')
          .select('branch_id')
          .eq('id', employeeId)
          .eq('is_deleted', false)
          .single();

        if (currentError) throw currentError;
        if (!currentEmployee?.branch_id) throw new Error("Employee's branch not found");

        const branchId = currentEmployee.branch_id;

        // Get employees in the same branch
        const { data: employees, error } = await supabase
          .from('employees')
          .select('id, candidate_id, candidates:candidates!employees_candidate_id_fkey(first_name)')
          .eq('branch_id', branchId)
          .eq('is_deleted', false)
          .neq('id', employeeId)
          .contains('role_columns', { roles: ['employee'] });

        if (error) throw error;

        setEmployeesInBranch(
          (employees || []).map(emp => ({
            value: emp.id,
            label: emp.candidates?.first_name || `Employee #${emp.id}`,
          }))
        );
      } catch (err) {
        setError(err);
        console.error('Error fetching branch employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesInBranch();
  }, [employeeId]);

  return { employeesInBranch, loading, error };
}; 