// import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
// import { Formik, Form, Field } from "formik";
// import * as Yup from "yup";
// import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
// import FormikSelectField from "../../../../components/common/FormikSelectField";
// import SubmitButton from "../../../../components/common/SubmitButton";
// import HomeIcon from "@mui/icons-material/Home";
// import {
//   useAssignOnBoardingTasks,
//   useOnboardingCandidates,
// } from "../../../../utils/hooks/api/onboarding";
// import { useEmployeesWithCandidates } from "../../../../utils/hooks/api/offboarding";
// import { useOnboardingEmployees } from "../../../../utils/hooks/api/onboradingEmployee";
// import LoadingWrapper from "../../../../components/common/LoadingWrapper";
// import { supabase } from "../../../../supabaseClient";
// import { toast } from "react-hot-toast";

// // MUI Radios
// import { RadioGroup, FormControlLabel, Radio, FormLabel } from "@mui/material";

// /* ---------- Helpers ---------- */
// const employmentTypeOptions = [
//   { label: "Permanent", value: "21" },
//   { label: "Outsource", value: "22" },
// ];

// const buildInitialValues = (sections, employmentTypeId) =>
//   sections.reduce(
//     (acc, section) => {
//       acc[section.id] = ""; // each task assignment select
//       return acc;
//     },
//     {
//       employee: "",
//       role: "",
//       employment_type: "",
//       employment_type_id: employmentTypeId || "", // controlled by radio
//     }
//   );

// const buildValidationSchema = (sections) => {
//   const shape = {};
//   sections.forEach(({ id }) => {
//     shape[id] = Yup.string().required("This task assignment is required");
//   });
//   return Yup.object().shape(shape);
// };

// const breadcrumbItems = [
//   { href: "/home", icon: HomeIcon },
//   { title: "Human Resource", href: "#" },
//   { title: "Master Task" },
// ];

// // Normalize whatever FormikSelectField stores into a plain id
// const asId = (v) => {
//   if (v == null || v === "") return null;
//   if (typeof v === "number" || typeof v === "string") return v;
//   if (typeof v === "object") {
//     if (v.id != null) return v.id;
//     if (v.value != null) return v.value;
//   }
//   return null;
// };

// const EditMasterTask = () => {
//   const { data: candidates, refetch: refetchCandidates } = useOnboardingCandidates();
//   const { data: employeeTypes } = useOnboardingEmployees();
//   const { data: employees = [] } = useEmployeesWithCandidates();
//   const { assigneTasks, loading: assigning } = useAssignOnBoardingTasks();

//   // ✅ Default to first radio option
//   const defaultEmploymentTypeId = employmentTypeOptions[0]?.value || "";
//   const [employmentTypeId, setEmploymentTypeId] = useState(defaultEmploymentTypeId);

//   // Local tasks state (fetched from Supabase)
//   const [task, setTasks] = useState([]);
//   const [tasksLoading, setTasksLoading] = useState(false);

//   // Fetch tasks for a given employment type (normalized to number)
//   const fetchHiringTasks = useCallback(async (etypeId) => {
//     try {
//       setTasksLoading(true);
//       const etype = Number(etypeId);
//       if (!Number.isFinite(etype)) {
//         console.warn("Invalid employment_type_id:", etypeId);
//         setTasks([]);
//         return;
//       }

//       const { data: tasks, error } = await supabase
//         .from("tasks")
//         .select("*")
//         .eq("employment_type_id", etype);

//       if (error) {
//         console.error("Error fetching hiring tasks:", error.message);
//         setTasks([]);
//         return;
//       }
//       setTasks(Array.isArray(tasks) ? tasks : []);
//     } finally {
//       setTasksLoading(false);
//     }
//   }, []);

//   const fetchEmploymentCalls = useCallback(async (etypeId) => {
//     try {
//       const etype = Number(etypeId);
//       if (!Number.isFinite(etype)) return;

//       await supabase
//         .from("final_employment_calls")
//         .select("*")
//         .eq("employment_type_id", etype);
//       // (kept for parity; result not used)
//     } catch (e) {
//       console.error("Error fetching hiring employmentCalls:", e?.message || e);
//     }
//   }, []);

//   // 🔁 Initial fetch & whenever radio changes
//   useEffect(() => {
//     if (!employmentTypeId) return;
//     fetchHiringTasks(employmentTypeId);
//     fetchEmploymentCalls(employmentTypeId);
//   }, [employmentTypeId, fetchHiringTasks, fetchEmploymentCalls]);

//   // Split tasks
//   const preHiringEntry = useMemo(
//     () => task.filter((e) => e.task_type === "pre_on_boarding"),
//     [task]
//   );
//   const postHiringEntry = useMemo(
//     () => task.filter((e) => e.task_type === "post_on_boarding"),
//     [task]
//   );
//   const terminationTasksEntry = useMemo(
//     () => task.filter((e) => e.task_type === "pre_off_boarding"),
//     [task]
//   );
//   const secondTerminationTasksEntry = useMemo(
//     () => task.filter((e) => e.task_type === "post_off_boarding"),
//     [task]
//   );

//   const sections = useMemo(
//     () => [...preHiringEntry, ...postHiringEntry, ...terminationTasksEntry],
//     [preHiringEntry, postHiringEntry, terminationTasksEntry]
//   );

//   const initialValues = useMemo(
//     () => buildInitialValues(sections, employmentTypeId),
//     [sections, employmentTypeId]
//   );

//   const validationSchema = useMemo(
//     () => buildValidationSchema(sections),
//     [sections]
//   );

//   const formikRef = useRef();

//   // ⬇️ On submit: update each task's assigned_id_master (NO UPSERTS)
//   const handleSubmit = async (values, { setSubmitting }) => {
//     try {
//       // Build updates from visible sections
//       const updates = sections
//         .map(({ id }) => {
//           const selected = asId(values[id]);
//           return selected != null && selected !== ""
//             ? { id, assigned_id_master: selected }
//             : null;
//         })
//         .filter(Boolean);

//       if (updates.length === 0) {
//         toast("No task assignments selected.");
//         setSubmitting(false);
//         return;
//       }

//       // Run per-row updates to avoid accidental inserts (and NOT NULL violations)
//       const results = await Promise.all(
//         updates.map(async ({ id, assigned_id_master }) => {
//           const { error } = await supabase
//             .from("tasks")
//             .update({ assigned_id_master })
//             .eq("id", id);
//           return { id, error };
//         })
//       );

//       const failures = results.filter((r) => r.error);
//       if (failures.length === 0) {
//         toast.success("Tasks updated successfully.");
//       } else {
//         // Log/Toast the first error and count
//         console.error("Update failures:", failures);
//         toast.error(
//           `Some updates failed (${failures.length}/${updates.length}). Check permissions/RLS.`
//         );
//       }

//       // Optional: refetch current set to refresh UI
//       // await fetchHiringTasks(employmentTypeId);
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.message || "Failed to update tasks.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <PageWrapperWithHeading title="On Boarding" items={breadcrumbItems}>
//       <div className="flex flex-col h-[calc(100vh-222px)]">
//         <Formik
//           innerRef={formikRef}
//           initialValues={initialValues}
//           validationSchema={validationSchema}
//           onSubmit={handleSubmit}
//           enableReinitialize
//         >
//           {({ values }) => (
//             <Form className="flex flex-col flex-1 overflow-hidden">
//               <div className="flex-1 overflow-y-auto space-y-6">
//                 {/* ✅ RadioGroup (MUI) with explicit wiring to Formik + local state */}
//                 <div>
//                   <FormLabel component="legend" className="mb-2 block">
//                     Employment Type
//                   </FormLabel>
//                   <Field name="employment_type_id">
//                     {({ field, form }) => (
//                       <RadioGroup
//                         {...field}
//                         row
//                         value={field.value || employmentTypeOptions[0]?.value || ""}
//                         onChange={(e) => {
//                           const next = e.target.value;
//                           // Update Formik
//                           form.setFieldValue("employment_type_id", next);
//                           // Update local (triggers refetch)
//                           setEmploymentTypeId(next);
//                         }}
//                       >
//                         {employmentTypeOptions.map((opt) => (
//                           <FormControlLabel
//                             key={opt.value}
//                             value={opt.value}
//                             control={<Radio />}
//                             label={opt.label}
//                           />
//                         ))}
//                       </RadioGroup>
//                     )}
//                   </Field>
//                 </div>

//                 <LoadingWrapper isLoading={tasksLoading}>
//                   {/* Pre-Hiring Tasks */}
//                   {preHiringEntry?.length > 0 && (
//                     <>
//                       <h2 className="text-lg font-semibold">Pre-Hiring Tasks</h2>
//                       <div className="bg-gray-100 p-6 rounded-lg space-y-4">
//                         {preHiringEntry.map(({ id, name }) => (
//                           <div key={id} className="grid grid-cols-2 gap-4">
//                             <div>
//                               <p className="text-sm mb-1 text-gray-800">
//                                 <span className="text-md">{name}</span>
//                               </p>
//                             </div>
//                             <FormikSelectField
//                               name={id}
//                               label="Assign To"
//                               options={employees}
//                               getOptionLabel={(o) =>
//                                 `${o.first_name} ${o.family_name}`
//                               }
//                               selectKey="id"
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   )}

//                   {/* Post-Hiring Tasks */}
//                   {postHiringEntry?.length > 0 && (
//                     <>
//                       <h2 className="text-lg font-semibold">On Boarding Tasks</h2>
//                       <div className="bg-gray-100 p-6 rounded-lg space-y-4">
//                         {postHiringEntry.map(({ id, name }) => (
//                           <div key={id} className="grid grid-cols-2 gap-4">
//                             <div>
//                               <p className="text-sm mb-1 text-gray-800">
//                                 <span className="text-md">{name}</span>
//                               </p>
//                             </div>
//                             <FormikSelectField
//                               name={id}
//                               label="Assign To"
//                               options={employees}
//                               getOptionLabel={(o) =>
//                                 `${o.first_name} ${o.family_name}`
//                               }
//                               selectKey="id"
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   )}

//                   {/* Off-Boarding Tasks */}
//                   {terminationTasksEntry?.length > 0 && (
//                     <>
//                       <h2 className="text-lg font-semibold">Off-Boarding Tasks</h2>
//                       <div className="bg-gray-100 p-6 rounded-lg space-y-4">
//                         {terminationTasksEntry.map(({ id, name }) => (
//                           <div key={id} className="grid grid-cols-2 gap-4">
//                             <div>
//                               <p className="text-sm mb-1 text-gray-800">
//                                 <span className="text-md">{name}</span>
//                               </p>
//                             </div>
//                             <FormikSelectField
//                               name={id}
//                               label="Assign To"
//                               options={employees}
//                               getOptionLabel={(o) =>
//                                 `${o.first_name} ${o.family_name}`
//                               }
//                               selectKey="id"
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   )}
//                 </LoadingWrapper>
//               </div>

//               <div className="sticky bottom-0 bg-white p-4 flex justify-end">
//                 <SubmitButton
//                   title="Assign Tasks"
//                   isLoading={assigning}
//                   type="submit"
//                   fullWidth={false}
//                 />
//               </div>
//             </Form>
//           )}
//         </Formik>
//       </div>
//     </PageWrapperWithHeading>
//   );
// };

// export default EditMasterTask;




import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../components/common/SubmitButton";
import HomeIcon from "@mui/icons-material/Home";
import {
  useAssignOnBoardingTasks,
  useOnboardingCandidates,
} from "../../../../utils/hooks/api/onboarding";
import { useEmployeesWithCandidates } from "../../../../utils/hooks/api/offboarding";
import { useOnboardingEmployees } from "../../../../utils/hooks/api/onboradingEmployee";
import LoadingWrapper from "../../../../components/common/LoadingWrapper";
import { supabase } from "../../../../supabaseClient";
import { toast } from "react-hot-toast";

// MUI Radios
import { RadioGroup, FormControlLabel, Radio, FormLabel } from "@mui/material";

/* ---------- Helpers ---------- */
const employmentTypeOptions = [
  { label: "Permanent", value: "21" },
  { label: "Outsource", value: "22" },
];

// Build initial values and seed each task field with any pre-assigned employee id (numeric)
const buildInitialValues = (sections, employmentTypeId, assignedByTaskId) =>
  sections.reduce(
    (acc, section) => {
      acc[section.id] =
        assignedByTaskId?.[section.id] != null
          ? assignedByTaskId[section.id] // keep as NUMBER for the select
          : "";
      return acc;
    },
    {
      employee: "",
      role: "",
      employment_type: "",
      employment_type_id: employmentTypeId || "", // controlled by radio
    }
  );

const buildValidationSchema = (sections) => {
  const shape = {};
  sections.forEach(({ id }) => {
    shape[id] = Yup.string().required("This task assignment is required");
  });
  return Yup.object().shape(shape);
};

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource", href: "#" },
  { title: "Task Master" },
];

// Normalize whatever FormikSelectField stores into a plain id
const asId = (v) => {
  if (v == null || v === "") return null;
  if (typeof v === "number" || typeof v === "string") return v;
  if (typeof v === "object") {
    if (v.id != null) return v.id;
    if (v.value != null) return v.value;
  }
  return null;
};

const EditMasterTask = () => {
  const { data: candidates, refetch: refetchCandidates } =
    useOnboardingCandidates();
  const { data: employeeTypes } = useOnboardingEmployees();
  const { data: employees = [] } = useEmployeesWithCandidates();
  const { assigneTasks, loading: assigning } = useAssignOnBoardingTasks();

  // ✅ Default to first radio option
  const defaultEmploymentTypeId = employmentTypeOptions[0]?.value || "";
  const [employmentTypeId, setEmploymentTypeId] = useState(
    defaultEmploymentTypeId
  );

  // Local tasks state (fetched from Supabase)
  const [task, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Fetch tasks for a given employment type (normalized to number)
  const fetchHiringTasks = useCallback(async (etypeId) => {
    try {
      setTasksLoading(true);
      const etype = Number(etypeId);
      if (!Number.isFinite(etype)) {
        console.warn("Invalid employment_type_id:", etypeId);
        setTasks([]);
        return;
      }

      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("employment_type_id", etype);

      if (error) {
        console.error("Error fetching hiring tasks:", error.message);
        setTasks([]);
        return;
      }
      setTasks(Array.isArray(tasks) ? tasks : []);

    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchEmploymentCalls = useCallback(async (etypeId) => {
    try {
      const etype = Number(etypeId);
      if (!Number.isFinite(etype)) return;

      await supabase
        .from("final_employment_calls")
        .select("*")
        .eq("employment_type_id", etype);
      // (kept for parity; result not used)
    } catch (e) {
      console.error("Error fetching hiring employmentCalls:", e?.message || e);
    }
  }, []);

  // 🔁 Initial fetch & whenever radio changes
  useEffect(() => {
    if (!employmentTypeId) return;
    fetchHiringTasks(employmentTypeId);
    fetchEmploymentCalls(employmentTypeId);
  }, [employmentTypeId, fetchHiringTasks, fetchEmploymentCalls]);



  // Split tasks
  const preHiringEntry = useMemo(
    () => task.filter((e) => e.task_type === "pre_on_boarding"),
    [task]
  );
  const postHiringEntry = useMemo(
    () => task.filter((e) => e.task_type === "post_on_boarding"),
    [task]
  );
  const terminationTasksEntry = useMemo(
    () => task.filter((e) => e.task_type === "pre_off_boarding"),
    [task]
  );
  const jobOfferTaskEntry = useMemo(
    () => task.filter((e) => e.task_type === "job_offer_task"),
    [task]
  );
  const secondTerminationTasksEntry = useMemo(
    () => task.filter((e) => e.task_type === "post_off_boarding"),
    [task]
  );




  // Build a numeric map { taskId: assigned_id_master }
  const assignedByTaskId = useMemo(() => {
    const map = {};
    for (const t of task) {
      map[t.id] =
        t.assigned_id_master != null ? Number(t.assigned_id_master) : "";
    }
    return map;
  }, [task]);

  const sections = useMemo(
    () => [...preHiringEntry, ...postHiringEntry, ...terminationTasksEntry],
    [preHiringEntry, postHiringEntry, terminationTasksEntry]
  );

  const initialValues = useMemo(
    () => buildInitialValues(sections, employmentTypeId, assignedByTaskId),
    [sections, employmentTypeId, assignedByTaskId]
  );

  const validationSchema = useMemo(
    () => buildValidationSchema(sections),
    [sections]
  );

  const formikRef = useRef();

  // ⬇️ On submit: update each task's assigned_id_master (NO UPSERTS)
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Build updates from visible sections
      const updates = sections
        .map(({ id }) => {
          const selected = asId(values[id]);
          return selected != null && selected !== ""
            ? { id, assigned_id_master: Number(selected) }
            : null;
        })
        .filter(Boolean);

      if (updates.length === 0) {
        toast("No task assignments selected.");
        setSubmitting(false);
        return;
      }

      // Run per-row updates to avoid accidental inserts (and NOT NULL violations)
      const results = await Promise.all(
        updates.map(async ({ id, assigned_id_master }) => {
          const { error } = await supabase
            .from("tasks")
            .update({ assigned_id_master })
            .eq("id", id);
          return { id, error };
        })
      );

      const failures = results.filter((r) => r.error);
      if (failures.length === 0) {
        toast.success("Tasks updated successfully.");
        // Optionally refresh tasks to reflect current selections
        await fetchHiringTasks(employmentTypeId);
      } else {
        console.error("Update failures:", failures);
        toast.error(
          `Some updates failed (${failures.length}/${updates.length}). Check permissions/RLS.`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update tasks.");
    } finally {
      setSubmitting(false);
    }
  };

  const getFullName = (o) => {
  return [o.employee_code, o.first_name, o.second_name, o.third_name, o.forth_name, o.family_name]
    .filter(Boolean)        // removes null, undefined, empty string
    .join(" ");             // join without extra spaces
};

  return (
    <PageWrapperWithHeading title="Task Master" items={breadcrumbItems}>
      <div className="flex flex-col h-[calc(100vh-222px)]">
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-6">
                {/* ✅ RadioGroup (MUI) with explicit wiring to Formik + local state */}
                <div>
                  <FormLabel component="legend" className="mb-2 block">
                    Employment Type
                  </FormLabel>
                  <Field name="employment_type_id">
                    {({ field, form }) => (
                      <RadioGroup
                        {...field}
                        row
                        value={
                          field.value || employmentTypeOptions[0]?.value || ""
                        }
                        onChange={(e) => {
                          const next = e.target.value;
                          // Update Formik
                          form.setFieldValue("employment_type_id", next);
                          // Update local (triggers refetch)
                          setEmploymentTypeId(next);
                        }}
                      >
                        {employmentTypeOptions.map((opt) => (
                          <FormControlLabel
                            key={opt.value}
                            value={opt.value}
                            control={<Radio />}
                            label={opt.label}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  </Field>
                </div>

                <LoadingWrapper isLoading={tasksLoading}>
                  
                  {/* Pre-Hiring Tasks */}
                  {preHiringEntry?.length > 0 && (
                    <>
                      <h2 className="text-lg font-semibold">Pre-Hiring Tasks</h2>
                      <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                        {preHiringEntry.map(({ id, name }) => (
                          <div key={id} className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm mb-1 text-gray-800">
                                <span className="text-md">{name}</span>
                              </p>
                            </div>
                            <FormikSelectField
                              name={id}
                              label="Assign To"
                              options={employees}
                              getOptionLabel={(o) => getFullName(o)}

                              selectKey="id"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Post-Hiring Tasks */}
                  {postHiringEntry?.length > 0 && (
                    <>
                      <h2 className="text-lg font-semibold">On Boarding Tasks</h2>
                      <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                        {postHiringEntry.map(({ id, name }) => (
                          <div key={id} className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm mb-1 text-gray-800">
                                <span className="text-md">{name}</span>
                              </p>
                            </div>
                            <FormikSelectField
                              name={id}
                              label="Assign To"
                              options={employees}
                              getOptionLabel={(o) => getFullName(o)}

                              selectKey="id"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Off-Boarding Tasks */}
                  {terminationTasksEntry?.length > 0 && (
                    <>
                      <h2 className="text-lg font-semibold">Off-Boarding Tasks</h2>
                      <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                        {terminationTasksEntry.map(({ id, name }) => (
                          <div key={id} className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm mb-1 text-gray-800">
                                <span className="text-md">{name}</span>
                              </p>
                            </div>
                            <FormikSelectField
                              name={id}
                              label="Assign To"
                              options={employees}
                             getOptionLabel={(o) => getFullName(o)}
                              selectKey="id"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </LoadingWrapper>
              </div>

              <div className="sticky bottom-0 bg-white p-4 flex justify-end">
                <SubmitButton
                  title="Assign Tasks"
                  isLoading={assigning}
                  type="submit"
                  fullWidth={false}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </PageWrapperWithHeading>
  );
};

export default EditMasterTask;

