// import React, { useState } from 'react';
// import { Button } from '@mui/material';
// import { Formik, Form } from 'formik';
// import toast from 'react-hot-toast';
// import { useCompanyEmployeesWithoutMyId } from '../../../../utils/hooks/api/emplyees';
// import FormikSelectField from '../../../../components/common/FormikSelectField';
// import { supabase } from '../../../../supabaseClient';
// import Modal from '../../../../components/common/Modal';

// const AssignmentModal = ({ 
//   open, 
//   onClose, 
//   taskId, 
//   taskName, 
//   onAssignmentSuccess, 
//   refetch,
//   selectedTaskAssignedIDMaster
// }) => {
//   const [loading, setLoading] = useState(false);


//   console.log("================xffg", selectedTaskAssignedIDMaster);
  
  
//   // Use the existing hook to fetch employees
//   const { employees, loading: employeesLoading } = useCompanyEmployeesWithoutMyId();

//   // Transform employees data for the select field
//   const employeeOptions = employees.map(emp => ({
//     value: emp.id,
//     label: `${emp.employee_code} - ${emp.candidates?.first_name || ''} ${emp.candidates?.second_name || ''} ${emp.candidates?.third_name || ''} ${emp.candidates?.forth_name || ''} ${emp.candidates?.family_name || ''}`.trim() || `Employee #${emp.id}`,
//   }));

//   const handleSubmit = async (values, { setSubmitting }) => {
//     if (!taskId || !values.employeeId) return;
    
//     setLoading(true);
//     try {
//       const { error } = await supabase
//       .from('assigned_tasks')
//       .update({
//         assigned_to_id: values.employeeId,
//         status: 'assigned',
//         updated_at: new Date().toISOString()
//       })
//       .eq('task_id', taskId);

//       if (error) throw error;

//       toast.success('Task assigned successfully!');
//       onAssignmentSuccess && onAssignmentSuccess(taskId);
//       refetch();
//       onClose();
//     } catch (err) {
//       console.error('Error assigning task:', err);
//       toast.error('Failed to assign task');
//     } finally {
//       setLoading(false);
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Modal title='Assign Task' open={open} onClose={onClose}>
//       <Formik
//         initialValues={{ employeeId: '' }}
//         onSubmit={handleSubmit}
//       >
//         {({ isSubmitting, setFieldValue, values }) => (
//           <Form className='flex flex-col gap-4'>
//             <FormikSelectField
//               name='employeeId'
//               label='Select Employee'
//               options={employeeOptions}
//               onChange={value => setFieldValue('employeeId', value)}
//               required
//               loading={employeesLoading}
//             />
//             <div className='flex justify-end gap-2'>
//               <Button onClick={onClose} disabled={isSubmitting}>
//                 Cancel
//               </Button>
//               <Button 
//                 type='submit' 
//                 variant='contained' 
//                 color='primary' 
//                 disabled={isSubmitting || !values.employeeId}
//               >
//                 Assign
//               </Button>
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </Modal>
//   );
// };

// export default AssignmentModal; 


import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@mui/material';
import { Formik, Form } from 'formik';
import toast from 'react-hot-toast';
import { useCompanyEmployeesWithoutMyId } from '../../../../utils/hooks/api/emplyees';
import FormikSelectField from '../../../../components/common/FormikSelectField';
import { supabase } from '../../../../supabaseClient';
import Modal from '../../../../components/common/Modal';

const AssignmentModal = ({ 
  open, 
  onClose, 
  taskId, 
  taskName, 
  onAssignmentSuccess, 
  refetch,
  selectedTaskAssignedIDMaster
}) => {
  const [loading, setLoading] = useState(false);


  // id we will preselect in the dropdown (original assigned or replacement)
  const [defaultEmployeeId, setDefaultEmployeeId] = useState('');
  // if the default employee isn't in the hook results, we add it here so it appears in the dropdown
  const [extraOptions, setExtraOptions] = useState([]);

  // Hook to fetch employees
  const { employees, loading: employeesLoading } = useCompanyEmployeesWithoutMyId();

  // Transform employees data for the select field
  const employeeOptions = useMemo(() => {
    return (employees || []).map(emp => ({
      value: emp.id,
      label: `${emp.employee_code} - ${emp.candidates?.first_name || ''} ${emp.candidates?.second_name || ''} ${emp.candidates?.third_name || ''} ${emp.candidates?.forth_name || ''} ${emp.candidates?.family_name || ''}`.trim() || `Employee #${emp.id}`,
    }));
  }, [employees]);

  // Merge in extra option if needed (replacement/original not present in hook)
  const mergedOptions = useMemo(() => {
    const map = new Map(employeeOptions.map(o => [o.value, o]));
    (extraOptions || []).forEach(o => map.set(o.value, o));
    return Array.from(map.values());
  }, [employeeOptions, extraOptions]);

  // On modal open (or when selectedTaskAssignedIDMaster changes):
  // - If the assigned user has any non-sick leave, use replacement_employee_id
  // - Otherwise, use the original assigned id
  // - Ensure that default id has an option in the dropdown (fetch if missing)
  useEffect(() => {
    let cancelled = false;

    const loadDefaultAssignee = async () => {
      if (!open) return;

      const originalId = selectedTaskAssignedIDMaster || '';
      if (!originalId) {
        setDefaultEmployeeId('');
        setExtraOptions([]);
        return;
      }

      // 1) Check if this employee has any leave (not sick_leave)
      const { data: leaveRows, error: leaveErr } = await supabase
        .from('leave_requests')
        .select('employee_id, replacement_employee_id, leave_type, created_at')
        .eq('employee_id', originalId)
        .neq('leave_type', 'sick_leave')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (leaveErr) {
        console.error('Error checking leave_requests:', leaveErr);
      }

      // If there is a replacement, prefer the latest one
      const replacementId = leaveRows?.find(r => r?.replacement_employee_id)?.replacement_employee_id || null;
      const preselectId = replacementId || originalId;
      setDefaultEmployeeId(preselectId);

      // 2) Ensure preselectId exists in the dropdown options
      const existsInOptions = employeeOptions.some(o => o.value === preselectId);
      if (!existsInOptions) {
        const { data: emp, error: empErr } = await supabase
          .from('employees')
          .select('id, employee_code, candidates(first_name, second_name, third_name, forth_name, family_name)')
          .eq('id', preselectId)
          .single();

        if (cancelled) return;

        if (empErr) {
          console.error('Error fetching employee for default option:', empErr);
          setExtraOptions([{
            value: preselectId,
            label: `Employee #${preselectId}`
          }]);
        } else if (emp) {
          const label = `${emp.employee_code ?? ''} - ${emp.candidates?.first_name || ''} ${emp.candidates?.second_name || ''} ${emp.candidates?.third_name || ''} ${emp.candidates?.forth_name || ''} ${emp.candidates?.family_name || ''}`.trim() || `Employee #${emp.id}`;
          setExtraOptions([{ value: emp.id, label }]);
        }
      } else {
        // already present in options
        setExtraOptions([]);
      }
    };

    loadDefaultAssignee();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedTaskAssignedIDMaster, employeeOptions.length]);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!taskId || !values.employeeId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('assigned_tasks')
        .update({
          assigned_to_id: values.employeeId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('task_id', taskId);

      if (error) throw error;

      toast.success('Task assigned successfully!');
      onAssignmentSuccess && onAssignmentSuccess(taskId);
      refetch();
      onClose();
    } catch (err) {
      console.error('Error assigning task:', err);
      toast.error('Failed to assign task');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Modal title='Assign Task' open={open} onClose={onClose}>
      <Formik
        initialValues={{ employeeId: defaultEmployeeId }}   
        enableReinitialize                                 
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className='flex flex-col gap-4'>
            <FormikSelectField
              name='employeeId'
              label='Select Employee'
              options={mergedOptions}
              onChange={value => setFieldValue('employeeId', value)}
              required
              loading={employeesLoading || loading}
            />
            <div className='flex justify-end gap-2'>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type='submit' 
                variant='contained' 
                color='primary' 
                disabled={isSubmitting || !values.employeeId}
              >
                Assign
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AssignmentModal;
