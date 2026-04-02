// hooks/useEmployeesWithCandidates.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { generateOffBoardAssignedTasksPayloads } from "../../helper";
// import { sendNewTaskEmail } from "../../emailSender";
import { sendNewTaskEmail } from "../../emailSenderHelper";


export function useEmployeesWithCandidates() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCombined = async () => {
      const { data: rows, error: fetchError } = await supabase
        .from("employees")
        .select(
          `
          id,
          employee_code,
          company_id,
          employment_type_id,
          candidates:candidates!employees_candidate_id_fkey(*)
        `
        )
        .eq("company_employee_status", "active")
        .eq("user_status", "active")
        .eq("is_deleted", false)
        .neq("is_off_boarding_approve", "approved")
        .order("id", { ascending: true });
      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }
      const merged = getMergeData(rows);

      setData(merged);
      setLoading(false);
    };

    fetchCombined();
  }, []);

  return { data, loading, error };
}

export function useOffboardEmployeesWithCandidates() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCombined = async () => {
      const { data: rows, error: fetchError } = await supabase
        .from("employees")
        .select(
          `
          id,
          employee_code,
          company_id,
          employment_type_id,
          candidates:candidates!employees_candidate_id_fkey(*)
        `
        )
        .eq("company_employee_status", "active")
        .eq("user_status", "active")
        .eq("is_deleted", false)
        .eq("is_off_boarding_approve", "approved")
        .order("id", { ascending: true });
      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }
      const merged = getMergeData(rows);

      setData(merged);
      setLoading(false);
    };

    fetchCombined();
  }, []);

  return { data, loading, error };
}

export function useGetOffBoardingTasks() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOnBoardingTasks = async () => {
      const { data: rows, error: fetchError } = await supabase.rpc(
        "get_offboarding_tasks_by_department"
      );

      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }
      setData(rows);
      setLoading(false);
    };

    fetchOnBoardingTasks();
  }, []);
  return { data, loading, error };
}

export function useCreateOffboardingRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOffboardingRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const {
        id: employee_id,
        department_id = 27,
        grade = "Senior Engineer",
        termination_date = "2025-07-01",
        reason = "End of contract",
        status = "pending",
        created_by_id = 1,
      } = payload;

      const { data: inserted, error: insertError } = await supabase
        .from("offboarding_requests")
        .insert([
          {
            employee_id,
            department_id,
            grade,
            termination_date,
            reason,
            status,
            created_by_id,
          },
        ])
        .select();

      if (insertError) {
        setError(insertError);
        toast.error(
          `Failed to create offboarding request: ${insertError.message}`
        );
        return { data: null, error: insertError };
      }

      toast.success("Offboarding request created successfully.");
      return { data: inserted, error: null };
    } catch (err) {
      setError(err);
      toast.error(`An unexpected error occurred: ${err.message || err}`);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOffboardingRequest, loading, error };
}

export function useCreateOffboardingTaskChecklist() {
  const [loading, setLoading] = useState(false);

  const createTaskChecklist = useCallback(async (values, { resetForm }) => {
    setLoading(true);
    try {
      const payload = generateOffBoardAssignedTasksPayloads(values);
      const { data: inserted, error: insertError } = await supabase
        .from("assigned_tasks")
        .insert(payload)
        .select();

      if (insertError) {
        throw new Error(insertError);
      }

      await deactivateEmployeeByEmployeeId(values.employee);
      if (payload && payload.length) {
        const employeeIds = [];
        payload.forEach((task_a) => {
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
            // if(emp.work_email){
            //   await sendNewTaskEmail({
            //     email:emp.work_email
            //   })
            // }
            if (emp.work_email) {
              try {
                await sendNewTaskEmail({ email: emp.work_email });
              } catch (err) {
                console.error("Failed to send email to", emp.work_email, err);
                toast.error(
                  `Email not sent to ${emp.work_email}: ${
                    err.text || err.message
                  }`
                );
              }
            }
          });
        }
      }
      toast.success("Offboarding tasks created successfully.");
      resetForm();
      return { data: inserted, error: null };
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err.message || err}`);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTaskChecklist, loading };
}

async function deactivateEmployeeByEmployeeId(employeeId) {
  return (
    supabase
      .from("employees")
      .select("id, candidate_id")
      .eq("id", employeeId)
      .single()
      .then(({ data: employeeRow, error: fetchError }) => {
        if (fetchError) throw fetchError;
        if (!employeeRow?.candidate_id) {
          throw new Error("No candidate_id found for that employee");
        }
        return employeeRow.candidate_id;
      })

      .then((candidateId) =>
        Promise.all([
          supabase
            .from("employees")
            .update({
              company_employee_status: "inactive",
              employee_status: "offboarded",
              user_status: "inactive",
              is_deleted: true,
            })
            .eq("id", employeeId),
          supabase
            .from("candidates")
            .update({ is_employee: false, is_deleted: true })
            .eq("id", candidateId),
        ])
      )

      .then(([empResult, candResult]) => {
        const { error: empError, data: empData } = empResult;
        const { error: candError, data: candData } = candResult;

        if (empError) throw empError;
        if (candError) throw candError;

        return { empData, candData };
      })
      // Step 4: Catch any error
      .catch((err) => {
        console.error("Pipeline error:", err.message || err);
        toast.error(`Error deactivating employee: ${err.message || err}`);
        throw err;
      })
  );
}

export function useOffBoardingTasks(employmentTypeId) {
  const [preTasks, setPreTasks] = useState([]);
  const [postTasks, setPostTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchTasks = useCallback(async () => {
    if (!employmentTypeId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: rows, error: sbError } = await supabase
        .from("tasks")
        .select("*")
        .eq("employment_type_id", employmentTypeId)
        .in("task_type", ["pre_off_boarding", "post_off_boarding"]);

      if (sbError) throw sbError;
      setPreTasks(rows.filter((r) => r.task_type === "pre_off_boarding"));
      setPostTasks(rows.filter((r) => r.task_type === "post_off_boarding"));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load hiring tasks");
      toast.error(`Error loading tasks: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, [employmentTypeId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { preTasks, postTasks, loading, error };
}

const getMergeData = (rows) =>
  rows.map((emp) => {
    const { candidates, ...employeeFields } = emp;
    const cand = Array.isArray(candidates)
      ? candidates[0] || {}
      : candidates || {};
    return {
      candidate_id: cand.id,
      ...cand,
      ...employeeFields,
    };
  });
