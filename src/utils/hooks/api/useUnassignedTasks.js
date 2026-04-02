import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
// import { sendNewTaskEmail } from "../../emailSender";
import { sendNewTaskEmail } from "../../emailSenderHelper";


export const usePreOnboardingUnassignedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // const fetchTasks = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     // 1. Fetch all pre-onboarding tasks with related data
  //     const { data, error } = await supabase
  //       .from("assigned_tasks")
  //       .select(
  //         `
  //         *,
  //         task:tasks(*),
  //         candidate:candidates!fk_candidate!inner(*)
  //       `
  //       )
  //       // .is("assigned_to_id", null) // checks if assigned_to_id IS NULL
  //       .not("candidate_id", "is", null) // checks if candidate_id IS NOT NULL
  //       .eq("candidate.suiteable_for_recruitment", true);

  //     console.log("datttaaaaaa", { data });

  //     setTasks(data || []);
  //   } catch (err) {
  //     console.error("Failed to fetch unassigned tasks:", err);
  //     setError(err.message);
  //     toast.error("Error fetching unassigned tasks");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


   const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch all pre-onboarding tasks with related data
      const { data, error } = await supabase
        .from("assigned_tasks")
        .select(
          `
          *,
          task:tasks(*),
          candidate:candidates!fk_candidate!inner(*)
        `
        )
      .eq("task.task_type", "pre_on_boarding") // ✅ filter on tasks table
      .eq("task.employment_type_id", "21") // ✅ filter on tasks table

        // .is("assigned_to_id", null) // checks if assigned_to_id IS NULL
        .not("candidate_id", "is", null) // checks if candidate_id IS NOT NULL
        .not("task", "is", null) 

        // .eq("candidate.suiteable_for_recruitment", true);


      setTasks(data || []);
    } catch (err) {
      console.error("Failed to fetch unassigned tasks:", err);
      setError(err.message);
      toast.error("Error fetching unassigned tasks");
    } finally {
      setLoading(false);
    }
  };

  const assignTask = async (
    taskId,
    assignedToId,
    employeeId = null,
    candidateId = null
  ) => {
    try {
      const { data, error } = await supabase.from("assigned_tasks").insert({
        task_id: taskId,
        assigned_to_id: assignedToId,
        employee_id: employeeId,
        candidate_id: candidateId,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Task assigned successfully!");
      // Refresh the tasks list

      const { empdata, error: employeeError } = await supabase
        .from("employees")
        .select(
          `
                    *
                  `
        )
        .in("id", assignedToId) // filter for multiple IDs
        .order("id", { ascending: true });
      if (empdata && empdata.length) {
        empdata.forEach(async (emp) => {
          if (emp.work_email) {
            await sendNewTaskEmail({
              email: emp.work_email,
            });
          }
        });
      }
      await fetchTasks();
      return true;
    } catch (err) {
      console.error("Failed to assign task:", err);
      toast.error("Error assigning task");
      return false;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;

      toast.success("Task updated successfully!");
      await fetchTasks();
      return true;
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Error updating task");
      return false;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      toast.success("Task deleted successfully!");
      await fetchTasks();
      return true;
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Error deleting task");
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    assignTask,
    updateTask,
    deleteTask,
  };
};
