import React, { useCallback, useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import FormikCheckbox from "../../../../components/common/FormikCheckbox";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../components/common/SubmitButton";
import HomeIcon from "@mui/icons-material/Home";
import { supabase } from "../../../../supabaseClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import EmploymentVacation from "./employmentVacation";
import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
import {
  ACCOUNT_DATA,
  JOB_STATUS,
  POST_HIRING_TASKS,
  PRE_HIRING_TASKS,
  RULES_DATA,
  TERMINATION_TASKS,
} from "../../../../utils/constants";
import { useUser } from "../../../../context/UserContext";
import { formatEmploymetTypeTask } from "../../../../utils/helper";

const validationSchema = Yup.object().shape({
  employment_type: Yup.string().required("Employee Type Required"),
  name: Yup.string().required("Name Required"),
  description: Yup.string()
    .test("no-spaces", "Spaces are not allowed", (value) => {
      return !value || value.trim().length > 0;
    })
    .required("Description Required"),
  rules: Yup.string().required("Rules Required"),
  account: Yup.string().required("Amount Required"),

  post_hiring: Yup.array()
    .min(1, "Post hiring task Required")
    .required("Post hiring task Required"),
  absenteeism_policy_id: Yup.number().required("Absenteeism Policy Required"),
  delay_policy_id: Yup.number().required("Absenteeism Policy Required"),
  overtime_policy_id: Yup.number().required("Absenteeism Policy Required"),
  contract_id: Yup.number().required("Contract Required"),
  work_hours: Yup.number().min(0).required("Daily work hours Required"),
  weekly_month_hours: Yup.number()
    .min(0)
    .required("Weekly work hours Required"),
  monthly_work_hours: Yup.number()
    .min(0)
    .required("Monthly work hours Required"),
  resignation_notice_period: Yup.number()
    .min(0)
    .required("Resignation notice period Required"),
  termination_submitters: Yup.array()
    .min(1, "Employee submit the termination Required")
    .required("Employee submit the termination Required"),
  termination_cancellation_approvers: Yup.array()
    .min(1, "Employee cancel submit the termination Required")
    .required("Employee cancel submit the termination Required"),
  termination_task_List: Yup.array()
    .min(1, "Termination task list Required")
    .required("Termination task list Required"),
  // second_termination_task_List: Yup.array()
  //   .min(1, "Second Termination task list Required")
  //   .required("Second Termination task list Required"),
});

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Job Info" },
  { title: "Employment type" },
];

const EmploymentTypeForm = ({ data }) => {
  // const [payment_type, setPaymentType] = useState("hourly");
  const [employId, setEmployId] = useState();
  const [task, setTasks] = useState([]);
  const [employmentsCalls, setEmploymentsCalls] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const isEditMode = data && data.id;
  const navigate = useNavigate();

  const parsedProbationList =
    typeof data?.probation_list === "string"
      ? JSON.parse(data.probation_list)
      : data?.probation_list || {};

  // Split post_hiring
  const preHiringEntry = task.filter((e) => e.task_type === "pre_on_boarding");
  const postHiringEntry = task.filter(
    (e) => e.task_type === "post_on_boarding"
  );
  const terminationTasksEntry = task.filter(
    (e) => e.task_type === "pre_off_boarding"
  );
  const secondTerminationTasksEntry = task.filter(
    (e) => e.task_type === "post_off_boarding"
  );

  // Helper to safely extract task names from a `tasks` array
  const extractTasks = (entry) => entry?.map((t) => t.name) || [];

  const initialValues = {
    employment_type: data?.employment_type || "",
    name: data?.name || "",
    description: data?.description || "",
    work_hours: data?.work_hours || "",
    weekly_month_hours: data?.weekly_month_hours || "",
    monthly_work_hours: data?.monthly_work_hours || "",
    allow_shift_work: data?.allow_shift_work ?? true,
    exclude_additional_salary: data?.exclude_additional_salary ?? true,
    exclude_from_salary_calculation:
      data?.exclude_from_salary_calculation ?? true,
    exclude_from_indemnity: data?.exclude_from_indemnity ?? true,
    tax_exemption: data?.tax_exemption ?? true,
    allow_delay: data?.allow_delay ?? false,
    allow_overtime: data?.allow_overtime ?? true,
    exempt_social_security: data?.exempt_social_security ?? true,
    job_title_tickets: data?.job_title_tickets ?? false,
    allow_exceed_ticket_balance: data?.allow_exceed_ticket_balance ?? false,
    tax_by_company: data?.tax_by_company ?? false,
    dangerous_profession: data?.dangerous_profession ?? false,
    allow_current_leave_date: data?.allow_current_leave_date ?? false,

    account: data?.account || "",
    absenteeism_policy_id:
      data?.absenteeism_policy_id !== undefined
        ? String(data.absenteeism_policy_id)
        : "",
    resignation_notice_period: Number(data?.resignation_notice_period) || "",
    contract_id:
      data?.contract_id !== undefined ? String(data.contract_id) : "",
    payment_type: data?.payment_type || "hourly",
    probation_period: data?.probation_period ?? false,
    probation_list: {
      allow_overtimes: parsedProbationList?.allow_overtimes ?? false,
      allow_vacation: parsedProbationList?.allow_vacation ?? false,
      allow_leaves: parsedProbationList?.allow_leaves ?? false,
      allow_cash_payment: parsedProbationList?.allow_cash_payment ?? false,
      allow_loan: parsedProbationList?.allow_loan ?? false,
      allow_raise: parsedProbationList?.allow_raise ?? false,
      allow_promotion: parsedProbationList?.allow_promotion ?? false,
      allow_transfer: parsedProbationList?.allow_transfer ?? false,
    },
    rules: data?.rules || "",
    use_shift_instead: data?.use_shift_instead ?? false,
    pre_hiring: extractTasks(preHiringEntry),
    post_hiring: extractTasks(postHiringEntry),
    termination_task_List: extractTasks(terminationTasksEntry),
    second_termination_task_List: extractTasks(secondTerminationTasksEntry),

    termination_submitters:
      employmentsCalls?.[0]?.termination_submitters?.map((t) => t.employee) ||
      [],
    termination_cancellation_approvers:
      employmentsCalls?.[0]?.termination_cancellation_approvers?.map(
        (t) => t.employee
      ) || [],
  };
  useEffect(() => {
    const fetchContracts = async () => {
      setLoadingContracts(true);
      const { data, error } = await supabase
        .from("contract_definitions")
        .select("id, contract_name")
        .order("contract_name", { ascending: true });
      if (error) {
        console.error("Error fetching contract:", error.message);
      } else {
        const opts = data.map((d) => ({
          label: d.contract_name,
          value: d.id.toString(),
        }));
        setContracts(opts);
      }
      setLoadingContracts(false);
    };

    const fetchPolicies = async () => {
      setLoadingPolicies(true);
      const { data, error } = await supabase
        .from("policy")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) {
        console.error("Error fetching contract:", error.message);
      } else {
        const opts = data.map((d) => ({
          label: d.name,
          value: d.id.toString(),
        }));
        setPolicies(opts);
      }
      setLoadingPolicies(false);
    };

    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      const { data, error } = await supabase
        .from("employees")
        .select(
          `
          id,
          employee_code,
          candidates:candidate_id (
            first_name,
            second_name,
            third_name,
            forth_name,
            family_name
          )
        `
        )
        .not("role_columns->roles", "eq", JSON.stringify(["employee"]));

      if (error) {
        console.error("Error fetching employee", error.message);
      } else {
        const opts = data.map((d) => ({
          label: `${d?.employee_code || ""} - ${
            d.candidates?.first_name || ""
          } ${d.candidates?.second_name || ""} ${
            d.candidates?.third_name || ""
          } ${d.candidates?.forth_name || ""} ${
            d.candidates?.family_name || ""
          }`.trim(),
          value: d.id.toString(),
        }));
        setEmployees(opts);
      }
      setLoadingEmployees(false);
    };

    fetchPolicies();
    fetchEmployees();
    fetchContracts();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchHiringTasks = async () => {
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("employment_type_id", data.id);

        if (error) {
          console.error("Error fetching hiring tasks:", error.message);
          return;
        }

        // Handle no tasks or multiple tasks
        if (!tasks || tasks.length === 0) {
          setTasks([]);
        } else {
          setTasks(tasks);
        }
      };
      const fetchEmploymentCalls = async () => {
        const { data: employmentCalls, error } = await supabase
          .from("final_employment_calls")
          .select("*")
          .eq("employment_type_id", data.id);

        if (error) {
          console.error(
            "Error fetching hiring employmentCalls:",
            error.message
          );
          return;
        }

        // Handle no employmentCalls or multiple employmentCalls
        if (!employmentCalls || employmentCalls.length === 0) {
          setEmploymentsCalls([]);
        } else {
          setEmploymentsCalls(employmentCalls);
        }
      };

      fetchHiringTasks();
      fetchEmploymentCalls();
    }
  }, [isEditMode, data?.id]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const newRow = {
        employment_type: values?.employment_type || "",
        name: values?.name || "",
        job_description: values?.job_description || "",
        description: values?.description || "",
        work_hours: Number(values?.work_hours) || 0,
        weekly_month_hours: Number(values?.weekly_month_hours) || 0,
        monthly_work_hours: Number(values?.monthly_work_hours) || 0,
        salary_group_id: Number(values.salary_group_id) || null,
        allow_overtime: values.allow_overtime ?? true,
        allow_shift_work: values.allow_shift_work ?? true,
        exclude_additional_salary: values?.exclude_additional_salary ?? true,
        exclude_from_salary_calculation:
          values?.exclude_from_salary_calculation ?? true,
        exclude_from_indemnity: values?.exclude_from_indemnity ?? true,
        tax_exemption: values?.tax_exemption ?? true,
        allow_delay: values?.allow_delay ?? false,
        exempt_social_security: values?.exempt_social_security ?? true,
        job_title_tickets: values?.job_title_tickets ?? false,
        allow_exceed_ticket_balance:
          values?.allow_exceed_ticket_balance ?? false,
        tax_by_company: values?.tax_by_company ?? false,
        dangerous_profession: values?.dangerous_profession ?? false,
        allow_current_leave_date: values?.allow_current_leave_date ?? false,
        account: values?.account || "",
        absenteeism_policy_id: Number(values?.absenteeism_policy_id) || null,
        delay_policy_id: Number(values?.delay_policy_id) || null,
        overtime_policy_id: Number(values?.overtime_policy_id) || null,
        resignation_notice_period:
          Number(values?.resignation_notice_period) || 0,
        contract_id: Number(values?.contract_id) || null,
        payment_type: values?.payment_type || "hourly",
        probation_period: values?.probation_period ?? false,
        use_shift_instead: values?.use_shift_instead ?? false,
        probation_list: {
          allow_overtimes: values.probation_list?.allow_overtimes ?? false,
          allow_vacation: values.probation_list?.allow_vacation ?? false,
          allow_leaves: values.probation_list?.allow_leaves ?? false,
          allow_cash_payment:
            values.probation_list?.allow_cash_payment ?? false,
          allow_loan: values.probation_list?.allow_loan ?? false,
          allow_raise: values.probation_list?.allow_raise ?? false,
          allow_promotion: values.probation_list?.allow_promotion ?? false,
          allow_transfer: values.probation_list?.allow_transfer ?? false,
        },
        rules: values?.rules || "",
      };


      // Insert into employment_types and get the inserted ID
      const { data: insertData, error: insertError } = await supabase
        .from("employment_types")
        .insert([newRow])
        .select("id")
        .single();

      if (insertError || !insertData) {
        throw new Error(
          "Error creating employee type: " +
            (insertError?.message || "Unknown error")
        );
      }

      const employment_type_id = insertData.id;
      setEmployId(employment_type_id);

      const taskToInsert = formatEmploymetTypeTask(values, employment_type_id);
      const { error: hiringError } = await supabase
        .from("tasks")
        .insert(taskToInsert);

      if (hiringError) {
        // Rollback if hiring tasks fail
        await supabase
          .from("employment_types")
          .delete()
          .eq("id", employment_type_id);

        throw new Error("Error adding hiring tasks: " + hiringError.message);
      }

      const finalSettlementEmployees = {
        employment_type_id,
        termination_submitters: values.termination_submitters.map(
          (employee) => ({ employee })
        ),
        termination_cancellation_approvers:
          values.termination_cancellation_approvers.map((employee) => ({
            employee,
          })),
        company_id: 1,
      };

      const { error: finalSettlementEmployeesError } = await supabase
        .from("final_employment_calls")
        .insert(finalSettlementEmployees);

      if (finalSettlementEmployeesError) {
        await supabase
          .from("employment_types")
          .delete()
          .eq("id", employment_type_id);
        await supabase
          .from("hiring_tasks")
          .delete()
          .eq("employment_type_id", employment_type_id);
        throw new Error(
          "Error adding final settlement: " +
            finalSettlementEmployeesError.message
        );
      }

      toast.success("Employee Type created successfully");
      // resetForm();
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };



  const handleUpdate = async (values, { setSubmitting }) => {
  setSubmitting(true);
  try {
    const employment_type_id = data?.id;

    // Step 1: Backup current data (unchanged)
    const { data: empBackup } = await supabase
      .from("employment_types")
      .select("*")
      .eq("id", employment_type_id)
      .single();

    // Kept for parity with your code (even if not used later)
    const { data: hiringBackup } = await supabase
      .from("hiring_tasks")
      .select("*")
      .eq("employment_type_id", employment_type_id)
      .single();

    const { data: finalBackup } = await supabase
      .from("final_employment_calls")
      .select("*")
      .eq("employment_type_id", employment_type_id)
      .single();

    // Step 2: Prepare new data (unchanged)
    const newRow = {
      employment_type: values?.employment_type || "",
      name: values?.name || "",
      job_description: values?.job_description || "",
      description: values?.description || "",
      work_hours: Number(values?.work_hours) || 0,
      weekly_month_hours: Number(values?.weekly_month_hours) || 0,
      monthly_work_hours: Number(values?.monthly_work_hours) || 0,
      salary_group_id: Number(values.salary_group_id) || null,
      allow_overtime: values.allow_overtime ?? true,
      allow_shift_work: values.allow_shift_work ?? true,
      exclude_additional_salary: values?.exclude_additional_salary ?? true,
      exclude_from_salary_calculation:
        values?.exclude_from_salary_calculation ?? true,
      exclude_from_indemnity: values?.exclude_from_indemnity ?? true,
      tax_exemption: values?.tax_exemption ?? true,
      allow_delay: values?.allow_delay ?? false,
      exempt_social_security: values?.exempt_social_security ?? true,
      job_title_tickets: values?.job_title_tickets ?? false,
      allow_exceed_ticket_balance:
        values?.allow_exceed_ticket_balance ?? false,
      tax_by_company: values?.tax_by_company ?? false,
      dangerous_profession: values?.dangerous_profession ?? false,
      allow_current_leave_date: values?.allow_current_leave_date ?? false,
      account: values?.account || "",
      absenteeism_policy_id: Number(values?.absenteeism_policy_id) || null,
      delay_policy_id: Number(values?.delay_policy_id) || null,
      overtime_policy_id: Number(values?.overtime_policy_id) || null,
      resignation_notice_period: Number(values?.resignation_notice_period) || 0,
      contract_id: Number(values?.contract_id) || null,
      payment_type: values?.payment_type || "hourly",
      probation_period: values?.probation_period ?? false,
      use_shift_instead: values?.use_shift_instead ?? false,
      probation_list: {
        allow_overtimes: values.probation_list?.allow_overtimes ?? false,
        allow_vacation: values.probation_list?.allow_vacation ?? false,
        allow_leaves: values.probation_list?.allow_leaves ?? false,
        allow_cash_payment: values.probation_list?.allow_cash_payment ?? false,
        allow_loan: values.probation_list?.allow_loan ?? false,
        allow_raise: values.probation_list?.allow_raise ?? false,
        allow_promotion: values.probation_list?.allow_promotion ?? false,
        allow_transfer: values.probation_list?.allow_transfer ?? false,
      },
      rules: values?.rules || "",
    };

    const finalSettlementEmployees = {
      employment_type_id,
      termination_submitters: values.termination_submitters.map((employee) => ({
        employee,
      })),
      termination_cancellation_approvers:
        values.termination_cancellation_approvers.map((employee) => ({
          employee,
        })),
    };

    // Step 3: Update employment_types (unchanged)
    {
      const { error: updateError } = await supabase
        .from("employment_types")
        .update(newRow)
        .eq("id", employment_type_id);

      if (updateError) throw new Error("Employment type update failed");
    }

    // Step 4: Diff tasks without `process_type`
    // Build desired tasks list; strip process_type if helper still provides it
    const rawDesired = formatEmploymetTypeTask(values, employment_type_id) || [];
    const desiredTasks = rawDesired.map(({ process_type, ...rest }) => ({
      ...rest,
      employment_type_id,
    }));

    // Load existing tasks (no process_type column)
    const { data: existingTasks, error: loadTasksErr } = await supabase
      .from("tasks")
      .select("id, name, task_type, employment_type_id")
      .eq("employment_type_id", employment_type_id);

    if (loadTasksErr) {
      await supabase.from("employment_types").update(empBackup).eq("id", employment_type_id);
      throw new Error(`Tasks update failed (load existing): ${loadTasksErr.message}`);
    }

    // Stable key WITHOUT process_type
    const keyOf = (t) => `${t.task_type ?? ""}::${t.name ?? ""}`;

    const existingMap = new Map((existingTasks || []).map((t) => [keyOf(t), t]));
    const desiredMap  = new Map((desiredTasks  || []).map((t) => [keyOf(t), t]));

    // Inserts = in desired but not in existing
    const toInsert = (desiredTasks || []).filter((dt) => !existingMap.has(keyOf(dt)));

    // Removals = in existing but not in desired
    const toRemove = (existingTasks || []).filter((et) => !desiredMap.has(keyOf(et)));

    // 4.a Insert new tasks
    if (toInsert.length > 0) {
      const { error: insErr } = await supabase.from("tasks").insert(toInsert);
      if (insErr) {
        await supabase.from("employment_types").update(empBackup).eq("id", employment_type_id);
        throw new Error(`Tasks update failed (insert): ${insErr.message}`);
      }
    }

    // 4.b Delete only removed & unreferenced tasks
    if (toRemove.length > 0) {
      const removeIds = toRemove.map((t) => t.id);

      const { data: refs, error: refErr } = await supabase
        .from("assigned_tasks")
        .select("task_id")
        .in("task_id", removeIds);

      if (refErr) {
        await supabase.from("employment_types").update(empBackup).eq("id", employment_type_id);
        throw new Error(`Tasks update failed (check refs): ${refErr.message}`);
      }

      const referenced = new Set((refs || []).map((r) => r.task_id));
      const deletableIds = removeIds.filter((id) => !referenced.has(id));
      const blockedIds   = removeIds.filter((id) => referenced.has(id));

      if (deletableIds.length > 0) {
        const { error: delErr } = await supabase
          .from("tasks")
          .delete()
          .in("id", deletableIds);

        if (delErr) {
          await supabase.from("employment_types").update(empBackup).eq("id", employment_type_id);
          throw new Error(`Tasks update failed (delete): ${delErr.message}`);
        }
      }

      if (blockedIds.length > 0) {
        toast("Some tasks couldn’t be removed because they’re already assigned.");
      }
    }

    // Step 5: Update final employment call (unchanged)
    {
      const { error: finalError } = await supabase
        .from("final_employment_calls")
        .update(finalSettlementEmployees)
        .eq("employment_type_id", employment_type_id);

      if (finalError) {
        await supabase.from("employment_types").update(empBackup).eq("id", employment_type_id);
        throw new Error("Final employment call update failed");
      }
    }

    toast.success("Employee Type and related tasks updated successfully");
    navigate("/admin/job-info/employment-type");
  } catch (err) {
    toast.error(err.message || "An unexpected error occurred");
  } finally {
    setSubmitting(false);
  }
};



  // const handleUpdate = async (values, { setSubmitting }) => {
  //   setSubmitting(true);
  //   try {
  //     const employment_type_id = data?.id;

  //     // Step 1: Backup current data
  //     const { data: empBackup } = await supabase
  //       .from("employment_types")
  //       .select("*")
  //       .eq("id", employment_type_id)
  //       .single();

  //     const { data: hiringBackup } = await supabase
  //       .from("hiring_tasks")
  //       .select("*")
  //       .eq("employment_type_id", employment_type_id)
  //       .single();

  //     const { data: finalBackup } = await supabase
  //       .from("final_employment_calls")
  //       .select("*")
  //       .eq("employment_type_id", employment_type_id)
  //       .single();



  //     // Step 2: Prepare new data
  //     const newRow = {
  //       employment_type: values?.employment_type || "",
  //       name: values?.name || "",
  //       job_description: values?.job_description || "",
  //       description: values?.description || "",
  //       work_hours: Number(values?.work_hours) || 0,
  //       weekly_month_hours: Number(values?.weekly_month_hours) || 0,
  //       monthly_work_hours: Number(values?.monthly_work_hours) || 0,
  //       salary_group_id: Number(values.salary_group_id) || null,
  //       allow_overtime: values.allow_overtime ?? true,
  //       allow_shift_work: values.allow_shift_work ?? true,
  //       exclude_additional_salary: values?.exclude_additional_salary ?? true,
  //       exclude_from_salary_calculation:
  //         values?.exclude_from_salary_calculation ?? true,
  //       exclude_from_indemnity: values?.exclude_from_indemnity ?? true,
  //       tax_exemption: values?.tax_exemption ?? true,
  //       allow_delay: values?.allow_delay ?? false,
  //       exempt_social_security: values?.exempt_social_security ?? true,
  //       job_title_tickets: values?.job_title_tickets ?? false,
  //       allow_exceed_ticket_balance:
  //         values?.allow_exceed_ticket_balance ?? false,
  //       tax_by_company: values?.tax_by_company ?? false,
  //       dangerous_profession: values?.dangerous_profession ?? false,
  //       allow_current_leave_date: values?.allow_current_leave_date ?? false,
  //       account: values?.account || "",
  //       absenteeism_policy_id: Number(values?.absenteeism_policy_id) || null,
  //       delay_policy_id: Number(values?.delay_policy_id) || null,
  //       overtime_policy_id: Number(values?.overtime_policy_id) || null,
  //       resignation_notice_period:
  //         Number(values?.resignation_notice_period) || 0,
  //       contract_id: Number(values?.contract_id) || null,
  //       payment_type: values?.payment_type || "hourly",
  //       probation_period: values?.probation_period ?? false,
  //       use_shift_instead: values?.use_shift_instead ?? false,
  //       probation_list: {
  //         allow_overtimes: values.probation_list?.allow_overtimes ?? false,
  //         allow_vacation: values.probation_list?.allow_vacation ?? false,
  //         allow_leaves: values.probation_list?.allow_leaves ?? false,
  //         allow_cash_payment:
  //           values.probation_list?.allow_cash_payment ?? false,
  //         allow_loan: values.probation_list?.allow_loan ?? false,
  //         allow_raise: values.probation_list?.allow_raise ?? false,
  //         allow_promotion: values.probation_list?.allow_promotion ?? false,
  //         allow_transfer: values.probation_list?.allow_transfer ?? false,
  //       },
  //       rules: values?.rules || "",
  //     };

  //     const finalSettlementEmployees = {
  //       employment_type_id,
  //       termination_submitters: values.termination_submitters.map(
  //         (employee) => ({
  //           employee,
  //         })
  //       ),
  //       termination_cancellation_approvers:
  //         values.termination_cancellation_approvers.map((employee) => ({
  //           employee,
  //         })),
  //     };

  //     // Step 3: Update employment_types
  //     const { error: updateError } = await supabase
  //       .from("employment_types")
  //       .update(newRow)
  //       .eq("id", employment_type_id);

  //     if (updateError) throw new Error("Employment type update failed");

  //     // Step 4: Update hiring_tasks (loop for each type)
  //     // for (const taskGroup of hiringTasks) {
  //     //   const { tasks, type, process_type } = taskGroup;

  //     //   const { error: hiringError } = await supabase
  //     //     .from("hiring_tasks")
  //     //     .update({ tasks })
  //     //     .eq("employment_type_id", employment_type_id)
  //     //     .eq("company_id", 1)
  //     //     .eq("type", type)
  //     //     .eq("process_type", process_type);

  //     // if (insertRes.error || deleteRes.error) {
  //     //   await supabase
  //     //     .from("employment_types")
  //     //     .update(empBackup)
  //     //     .eq("id", employment_type_id);
  //     //   throw new Error(`Hiring tasks update failed`);
  //     // }
  //     // }

  //     // Step 5: Update final employment call
  //     const { error: finalError } = await supabase
  //       .from("final_employment_calls")
  //       .update(finalSettlementEmployees)
  //       .eq("employment_type_id", employment_type_id);

  //     if (finalError) {
  //       // Rollback hiring_tasks and employment_types
  //       for (const backup of hiringBackup) {
  //         await supabase
  //           .from("hiring_tasks")
  //           .update({ tasks: backup.tasks })
  //           .eq("employment_type_id", employment_type_id)
  //           .eq("company_id", backup.company_id)
  //           .eq("type", backup.type)
  //           .eq("process_type", backup.process_type);
  //       }

  //       await supabase
  //         .from("employment_types")
  //         .update(empBackup)
  //         .eq("id", employment_type_id);
  //       throw new Error("Final employment call update failed");
  //     }

  //     toast.success("Employee Type and related tasks updated successfully");
  //     navigate("/admin/job-info/employment-type");
  //   } catch (err) {
  //     toast.error(err.message || "An unexpected error occurred");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  return (
    <PageWrapperWithHeading
      title="Add Employement Type"
      items={breadcrumbItems}
    >
      <div className="bg-white p-6 rounded shadow-md">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={isEditMode ? handleUpdate : handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => {
            return (
              <Form className="space-y-4 p-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormikInputField
                    name="employment_type"
                    label="Employment Type"
                    required={true}
                  />
                  <FormikSelectField
                    name="name"
                    label="Job Status"
                    options={JOB_STATUS}
                    placeholder="Select Job Status"
                    required={true}
                  />
                  <FormikSelectField
                    name="rules"
                    label="Rules"
                    options={RULES_DATA}
                    placeholder="Select Job Status"
                    required={true}
                  />
                </div>

                <FormikInputField
                  name="description"
                  label="Description"
                  rows={3}
                  required={true}
                />

                {/* <div className="flex items-center space-x-2">
                  <FormikCheckbox
                    label="When exporting from attendance, use Employee working hours from the shift not from Employment type"
                    name="use_shift_instead"
                  />
                </div> */}

                <div className="grid grid-cols-3 gap-4">
                  <FormikInputField
                    name="work_hours"
                    type="number"
                    label="Daily work hours"
                    required={true}
                  />
                  <FormikInputField
                    name="weekly_month_hours"
                    label="Weekly work hours (for overtime purposes)"
                    type="number"
                    required={true}
                  />
                  <FormikInputField
                    name="monthly_work_hours"
                    label="Monthly working hours (for overtime purposes)"
                    type="number"
                    required={true}
                  />
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <FormikCheckbox
                    name="allow_overtime"
                    label="Allow overtime"
                  />
                  <FormikCheckbox
                    name="allow_shift_work"
                    label="Allow shift work"
                  />
                  <FormikCheckbox
                    name="exclude_additional_salary"
                    label="Excluded from additional salary months"
                  />
                  <FormikCheckbox
                    name="tax_exemption"
                    label="Exempted from tax"
                    required
                  />
                  <FormikCheckbox name="allow_delay" label="Allow delay" />
                  <FormikCheckbox
                    name="exempt_social_security"
                    label="Exempted from social security"
                  />
                  <FormikCheckbox
                    name="job_title_tickets"
                    label="Entitled to job title travel tickets"
                  />
                  <FormikCheckbox
                    name="allow_exceed_ticket_balance"
                    label="Allow exceed travel ticket balance"
                  />
                  <FormikCheckbox
                    name="tax_by_company"
                    label="Tax payable by company"
                  />
                  <FormikCheckbox
                    name="dangerous_profession"
                    label="Dangerous professions"
                  />
                  <FormikCheckbox
                    name="allow_current_leave_date"
                    label="Allow the current date as leave start date "
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormikSelectField
                    name="account"
                    label="Account"
                    options={ACCOUNT_DATA}
                    placeholder="Select Account"
                    required={true}
                  />
                  <div className="col-span-1">
                    <FormikInputField
                      name="resignation_notice_period"
                      label="Resignation notice period (days)"
                      type="number"
                      required={true}
                    />
                  </div>
                  <FormikSelectField
                    name="contract_id"
                    label="Contract"
                    options={contracts}
                    placeholder={
                      loadingContracts ? "Loading…" : "Select Contract"
                    }
                    disabled={loadingContracts}
                    required={true}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormikSelectField
                    name="absenteeism_policy_id"
                    label="Absenteeism policy"
                    options={policies}
                    placeholder={
                      loadingPolicies ? "Loading…" : "Select Absenteeism policy"
                    }
                    disabled={loadingPolicies}
                    required={true}
                  />
                  <FormikSelectField
                    name="delay_policy_id"
                    label="Delay policy"
                    options={policies}
                    placeholder={
                      loadingPolicies ? "Loading…" : "Select Absenteeism policy"
                    }
                    disabled={loadingPolicies}
                    required={true}
                  />
                  <FormikSelectField
                    name="overtime_policy_id"
                    label="Overtime policy"
                    options={policies}
                    placeholder={
                      loadingPolicies ? "Loading…" : "Select Absenteeism policy"
                    }
                    disabled={loadingPolicies}
                    required={true}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className="flex flex-col justify-start
               items-start mt-2"
                  >
                    <span className="text-sm font-medium">Payment method</span>
                    <Field name="payment_type">
                      {({ field }) => (
                        <RadioGroup
                          {...field}
                          value={field.value || "hourly"} // Default to "hourly" if undefined
                          onChange={(e) =>
                            setFieldValue("payment_type", e.target.value)
                          }
                          className="flex !flex-row"
                        >
                          <FormControlLabel
                            value="hourly"
                            control={<Radio />}
                            label="Hourly"
                          />
                          <FormControlLabel
                            value="monthly"
                            control={<Radio />}
                            label="Monthly"
                          />
                        </RadioGroup>
                      )}
                    </Field>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <FormikMultiSelectField
                    name="pre_hiring"
                    label="Pre Hiring tasks"
                    options={PRE_HIRING_TASKS}
                    placeholder="Select"
                    required={true}
                  />
                  <FormikMultiSelectField
                    name="post_hiring"
                    label="Onboarding task"
                    options={POST_HIRING_TASKS}
                    placeholder="Select"
                    required={true}
                    // disabled={isEditMode}
                  />
                  <FormikMultiSelectField
                    name="termination_task_List"
                    label="Offboarding task"
                    options={TERMINATION_TASKS}
                    placeholder="Select"
                    required={true}
                    // disabled={isEditMode}
                  />
                  {/* <FormikMultiSelectField
                    name="second_termination_task_List"
                    label="Second Offboarding task"
                    options={TERMINATION_TASKS}
                    placeholder="Select"
                    required={true}
                    disabled={isEditMode}
                  /> */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormikCheckbox
                    label="Probation Period"
                    name="probation_period"
                    handleChange={(value) => {
                      setFieldValue("probation_period", value);
                      setFieldValue("probation_list.allow_overtimes", false);
                      setFieldValue("probation_list.allow_vacation", false);
                      setFieldValue("probation_list.allow_leaves", false);
                      setFieldValue("probation_list.allow_cash_payment", false);
                      setFieldValue("probation_list.allow_loan", false);
                      setFieldValue("probation_list.allow_raise", false);
                      setFieldValue("probation_list.allow_promotion", false);
                      setFieldValue("probation_list.allow_transfer", false);
                    }}
                  />
                </div>

                {values.probation_period && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <FormikCheckbox
                      label="Allow Overtimes"
                      name="probation_list.allow_overtimes"
                    />
                    <FormikCheckbox
                      label="Allow Vacation"
                      name="probation_list.allow_vacation"
                    />
                    <FormikCheckbox
                      label="Allow Leave"
                      name="probation_list.allow_leaves"
                    />
                    <FormikCheckbox
                      label="Allow Cash Payment"
                      name="probation_list.allow_cash_payment"
                    />
                    <FormikCheckbox
                      label="Allow Loan"
                      name="probation_list.allow_loan"
                    />
                    <FormikCheckbox
                      label="Allow Raise"
                      name="probation_list.allow_raise"
                    />
                    <FormikCheckbox
                      label="Allow Promotion"
                      name="probation_list.allow_promotion"
                    />
                    <FormikCheckbox
                      label="Allow Transfer"
                      name="probation_list.allow_transfer"
                    />
                  </div>
                )}

                <div className="mt-6">
                  <h2 className="font-semibold text-lg">
                    Final settlement requires confirmation
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <FormikMultiSelectField
                      name="termination_submitters"
                      label="Employees who can submit the termination for final approval"
                      options={employees}
                      placeholder="Select"
                      required={true}
                    />

                    <FormikMultiSelectField
                      name="termination_cancellation_approvers"
                      label="Employees who can cancel submit the termination for final approval"
                      options={employees}
                      disabled={loadingEmployees}
                      placeholder="Select"
                      required={true}
                    />
                    {/* <FormikMultiSelectField
                      name="second_termination_taskL_ist"
                      label="Second termination task list"
                      options={TERMINATION_TASKS}
                    /> */}
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <SubmitButton
                    type="submit"
                    isLoading={isSubmitting}
                    title={isEditMode ? "Update" : "Submit"}
                    disabled={isSubmitting}
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
        <EmploymentVacation
          employment_type_id={employId || isEditMode}
          isEditMode={!!isEditMode}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default EmploymentTypeForm;
