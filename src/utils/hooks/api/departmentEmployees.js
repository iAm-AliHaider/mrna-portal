import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useUser } from '../../../context/UserContext';

export const useDepartmentEmployees = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    const fetchDepartmentEmployees = async () => {
      if (!employeeId) return;
      
      setLoading(true);
      try {
        // First get current employee's organizational unit
        const { data: currentEmployee, error: currentError } = await supabase
          .from('employees')
          .select('organizational_unit_id')
          .eq('id', employeeId)
          .eq('is_deleted', false)
          .single();

        if (currentError) throw currentError;
        if (!currentEmployee?.organizational_unit_id) throw new Error("Employee's organizational unit not found");

        const organizationalUnitId = currentEmployee.organizational_unit_id;

        const { data: currentEmployeeInfo, error: empInfoError } = await supabase
        .from('employees')
        .select(`
          id,
          candidate_id,
          candidates:candidates!employees_candidate_id_fkey(
            first_name,
            second_name,
            third_name,
            forth_name,
            family_name
          ),
          organizational_units:organizational_unit_id (
            id,
            name
          )
        `)
.eq('id', employeeId)
.eq('is_deleted', false)
.single();

if (empInfoError) throw empInfoError;
setDepartment(currentEmployeeInfo?.organizational_units || null);

        // Get employees in the same organizational unit
        const { data: employees, error } = await supabase
          .from('employees')
          .select(`
            id,
            candidate_id,
            employee_code,
            candidates:candidates!employees_candidate_id_fkey(
              first_name,
              second_name,
              third_name,
              forth_name,
              family_name
            )
          `)
          .eq('organizational_unit_id', organizationalUnitId)
          .eq('is_deleted', false)
          .neq('id', employeeId) // Exclude current employee
          .contains('role_columns', { roles: ['employee'] });

        if (error) throw error;
          
        setDepartmentEmployees(
          (employees || []).map(emp => ({
            value: emp.id,
            label: `${emp.employee_code} - ${emp.candidates?.first_name || ''} ${emp.candidates?.second_name || ''} ${emp.candidates?.third_name || ''} ${emp.candidates?.forth_name || ''} ${emp.candidates?.family_name || ''} `.trim() || `Employee #${emp.id}`,
          }))
        );
      } catch (err) {
        setError(err);
        console.error('Error fetching organizational unit employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentEmployees();
  }, [employeeId]);

  return { departmentEmployees, loading, error, department };
}; 