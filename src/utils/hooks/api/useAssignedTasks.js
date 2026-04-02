import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
// import { sendNewTaskEmail } from "../../emailSender";
import { sendNewTaskEmail } from "../../emailSenderHelper";

// or your preferred toast library

/**
 * Fetch and filter assigned tasks with joined task and user details.
 */
export function useAssignedTasks({
  assignedToId,
  createdBy = null,
  taskId = null,
  status = null,
  startDate = null,
  endDate = null,
  searchTerm = "",
  initialPage = 0,
  initialSize = 20,
  refetch,
}) {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!assignedToId) return;
    setLoading(true);
    setError(null);

    try {
      // --- Step 1: Base query for assigned_tasks ---
      let query = supabase
        .from("assigned_tasks")
        .select(
          `
        *,
        tasks!inner(id,name,description,status,organizational_structure_id,type,task_type,employment_type_id,attachment,created_at,updated_at),
        creator:created_by(id,employee_code,role_columns,company_id,user_status),
        updater:updated_by(id,employee_code,role_columns,company_id,user_status)
        `,
          { count: "exact" }
        )
        .eq("assigned_to_id", assignedToId);

      if (createdBy != null) query = query.eq("created_by", createdBy);
      if (taskId != null) query = query.eq("task_id", taskId);
      if (status) query = query.eq("status", status);
      if (startDate != null) query = query.gte("assigned_at", startDate);
      if (endDate != null) query = query.lte("assigned_at", endDate);
      if (searchTerm) query = query.ilike("tasks.name", `%${searchTerm}%`);

      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order("assigned_at", { ascending: false });

      const { data: rows, error: fetchError, count: total } = await query;
      if (fetchError) {
        toast.error("Failed to fetch assigned tasks.");
        setError(fetchError);
        setLoading(false);
        return;
      }

      // --- Step 2: Collect candidate_ids + employee_ids ---
      const directCandidateIds = Array.from(
        new Set((rows || []).map((r) => r.candidate_id).filter(Boolean))
      );
      const employeeIds = Array.from(
        new Set((rows || []).map((r) => r.employee_id).filter(Boolean))
      );

      // --- Step 3: Fetch employees → candidate_ids (only if needed) ---
      let employeesById = {};
      let extraCandidateIds = [];
      if (employeeIds.length > 0) {
        const { data: employees, error: empErr } = await supabase
          .from("employees")
          .select("id, candidate_id")
          .in("id", employeeIds);

        if (empErr) {
          toast.error(`Failed to fetch employees: ${empErr.message}`);
        } else {
          employeesById = (employees || []).reduce((acc, e) => {
            acc[e.id] = e;
            if (e.candidate_id) extraCandidateIds.push(e.candidate_id);
            return acc;
          }, {});
        }
      }

      // Merge direct + from employees
      const candidateIds = Array.from(
        new Set([...directCandidateIds, ...extraCandidateIds])
      );

      // --- Step 4: Fetch candidates (names) ---
      let candidatesById = {};
      if (candidateIds.length > 0) {
        const { data: candidates, error: candErr } = await supabase
          .from("candidates")
          .select(
            "id, first_name, second_name, third_name, forth_name, family_name"
          )
          .in("id", candidateIds);

        if (candErr) {
          toast.error(`Failed to fetch candidates: ${candErr.message}`);
        } else {
          candidatesById = (candidates || []).reduce((acc, e) => {
            acc[e.id] = e;
            return acc;
          }, {});
        }
      }

      // --- Step 5: Map rows to final structure ---
      const taskData = (rows || []).map((row) => {
        let emp = null;

        if (row.candidate_id) {
          // Use candidate_id directly
          emp = candidatesById[row.candidate_id] || null;
        } else if (row.employee_id) {
          // Use employee_id → candidate_id
          const employee = employeesById[row.employee_id];
          if (employee?.candidate_id) {
            emp = candidatesById[employee.candidate_id] || null;
          }
        }

        return {
          ...row,
          task_name: row?.tasks?.name,
          task_description: row?.tasks?.description,
          task_status: row?.tasks?.status,
          task_type: row?.tasks?.task_type
            ? row.tasks.task_type
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
            : "",
          task_attachment: row?.tasks?.attachment,
          assigned_at: row?.assigned_at,

          employee_name:
            [
              emp?.first_name,
              emp?.second_name,
              emp?.third_name,
              emp?.forth_name,
              emp?.family_name,
            ]
              .map((v) => (v ?? "").trim())
              .filter(Boolean)
              .join(" ") || null,
        };
      });

      setData(taskData);
      setCount(total || 0);
    } catch (err) {
      setError(err);
      toast.error(`Unexpected error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, [
    assignedToId,
    createdBy,
    taskId,
    status,
    startDate,
    endDate,
    searchTerm,
    page,
    pageSize,
    refetch,
  ]);

  //     const fetchTasks = useCallback(async () => {
  //         if (!assignedToId) return
  //         setLoading(true)
  //         setError(null)

  //         let query = supabase
  //             .from('assigned_tasks')
  //             .select(`*,
  //         tasks!inner(id,name,description,status,organizational_structure_id,type,task_type,employment_type_id,attachment,created_at,updated_at),
  //         creator:created_by(id,employee_code,role_columns,company_id,user_status),
  //         updater:updated_by(id,employee_code,role_columns,company_id,user_status)`,
  //                 { count: 'exact' }
  //             )
  //             .eq('assigned_to_id', assignedToId)

  //             console.log("------------", assignedToId)

  //         if (createdBy != null) query = query.eq('created_by', createdBy)
  //         if (taskId != null) query = query.eq('task_id', taskId)
  //         if (status) query = query.eq('status', status)
  //         if (startDate != null) query = query.gte('assigned_at', startDate)
  //         if (endDate != null) query = query.lte('assigned_at', endDate)

  //         if (searchTerm) {
  //             query = query.ilike('tasks.name', `%${searchTerm}%`)
  //         }

  //         const from = page * pageSize
  //         const to = from + pageSize - 1

  //         query = query.range(from, to).order('assigned_at', { ascending: false })

  //         const { data: rows, error: fetchError, count: total } = await query
  //         if (fetchError) {
  //             toast.error('Failed to fetch assigned tasks.')
  //             setError(fetchError)
  //         } else {
  //             let taskData = rows.map(row => ({
  //                 ...row,
  //                 task_name: row?.tasks?.name,
  //                 task_description: row?.tasks?.description,
  //                 task_status: row?.tasks?.status,
  //                 task_type: row?.tasks?.task_type ? row?.tasks?.task_type
  //                     .split('_')
  //                     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  //                     .join(' ') : '',
  //                 task_attachment: row?.tasks?.attachment,
  //                 assigned_at: row?.assigned_at,
  //             }));

  //             setData(taskData || [])
  //             setCount(total || 0)
  //         }
  //         setLoading(false)
  //     }, [assignedToId, createdBy, taskId, status, startDate, endDate, searchTerm, page, pageSize,refetch])

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    count,
    refetch: fetchTasks,
  };
}

/**
 * Update a single assigned task (e.g., change status, update note).
 */
export function useUpdateAssignedTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateAssignedTask = useCallback(async ({ id, changes, refetch }) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("assigned_tasks")
        .update(changes)
        .eq("id", id)
        .select("*, updater:updated_by(id,employee_code)")
        .single();

      if (updateError) {
        toast.error("Failed to update task.");
        setError(updateError);
        return { data: null, error: updateError };
      }

      if (refetch && typeof refetch === "function") {
        await refetch();
      }

      return { data, error: null };
    } catch (err) {
      toast.error("An error occurred while updating the task.");
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateAssignedTask, loading, error };
}

/**
 * Assign one or more tasks to one or more employees.
 */
// export function useAssignTasks() {
//   const [loading, setLoading] = useState(false);

//   const assignTasks = async (taskIds, employeeIds) => {
//     setLoading(true);
//     try {
//       const assignments = [];
//       // const employeeId = [];
//       employeeIds.forEach(employee_id => {
//         taskIds.forEach(task_id => {
//           assignments.push({ task_id, assigned_to_id: employee_id, status: 'assigned', type: 'succession_planning' });
//           // employeeId.push(employee_id);
//         });
//       });
//         const { data, error: employeeError } = await supabase
//           .from('employees')
//           .select(`
//             *
//           `)
//           .in('id', employeeIds)       // filter for multiple IDs
//           .order('id', { ascending: true })
//       if(data & data.length){
//         await sendNewTaskEmail({
//         })
//       }
//       return
//       const { error } = await supabase.from('assigned_tasks').insert(assignments);
//       if (error) throw error;
//       toast.success('Tasks assigned successfully!');
//       return true;
//     } catch (err) {
//       toast.error('Failed to assign tasks');
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { assignTasks, loading };
// }

export function useAssignSuccessionTasks() {
  const [loading, setLoading] = useState(false);

  const assignSuccessionTasks = async (assignments) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("assigned_tasks")
        .insert(assignments);
      if (error) throw error;
      toast.success("Succession tasks assigned successfully!");
      if (assignments && assignments.length) {
        const employeeIds = [];
        assignments.forEach((task_a) => {
          employeeIds.push(task_a.assigned_to_id);
        });

        const { data, error: employeeError } = await supabase
          .from("employees")
          .select(
            `
              *
            `
          )
          .in("id", employeeIds) // filter for multiple IDs
          .order("id", { ascending: true });
        if (data && data.length) {
          data.forEach(async (emp) => {
            if (emp.work_email) {
              await sendNewTaskEmail({
                email: emp.work_email,
              });
            }
          });
        }
      }
      return true;
    } catch (err) {
      toast.error("Failed to assign succession tasks");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { assignSuccessionTasks, loading };
}
