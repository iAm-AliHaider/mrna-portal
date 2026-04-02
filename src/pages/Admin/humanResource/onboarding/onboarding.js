// // import React, { useState, useEffect, useRef } from "react";
// // import { Formik, Form } from "formik";
// // import * as Yup from "yup";
// // import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
// // import FormikSelectField from "../../../../components/common/FormikSelectField";
// // import SubmitButton from "../../../../components/common/SubmitButton";
// // import HomeIcon from "@mui/icons-material/Home";
// // import {
// //   useAssignOnBoardingTasks,
// //   useHiringTasks,
// //   useOnboardingCandidates,
// // } from "../../../../utils/hooks/api/onboarding";
// // import { useEmployeesWithCandidates } from "../../../../utils/hooks/api/offboarding";
// // import { useOnboardingEmployees } from "../../../../utils/hooks/api/onboradingEmployee";
// // import LoadingWrapper from "../../../../components/common/LoadingWrapper";
// // import FormikInputField from "../../../../components/common/FormikInputField";
// // import toast from "react-hot-toast";

// // const buildInitialValues = (sections) =>
// //   sections.reduce(
// //     (acc, section) => {
// //       const { id } = section;
// //       acc[id] = "";

// //       return acc;
// //     },
// //     {
// //       employee: "",
// //       role: "",
// //       employment_type: "",
// //       // employee_code: "",
// //       // salary: "",
// //     }
// //   );

// // const buildValidationSchema = (sections) => {
// //   const shape = {
// //     employee: Yup.string().required("Candidate is required"),
// //     role: Yup.string().required("Role is required"),
// //     employment_type: Yup.string().required("Employment Type is required"),
// //     // employee_code: Yup.string()
// //     //   .required("Employee Code is required")
// //     //   .matches(/^\d{6}$/, "Employee Code must be a 6-digit number"),
// //     // salary: Yup.string().required('Employee salary is required')
// //     //   .matches(/^\d+(\.\d{1,2})?$/, 'Enter a valid numeric salary (e.g., 50000 or 50000.75)')
// //   };
// //   sections.forEach(({ id }) => {
// //     shape[id] = Yup.string().required("This task assignment is required");
// //   });
// //   return Yup.object().shape(shape);
// // };

// // const breadcrumbItems = [
// //   { href: "/home", icon: HomeIcon },
// //   { title: "Human Resource", href: "#" },
// //   { title: "On Boarding" },
// // ];

// // const ROLE_OPTIONS = [
// //   { label: "Employee", value: "employee" },
// //   { label: "Manager", value: "manager" },
// //   { label: "HR", value: "hr" },
// //   { label: "HR Manager", value: "hr_manager" },
// // ];

// // const OnBoardingTaskAssignmentForm = () => {
// //   const { data: candidates, refetch: refetchCandidates } =
// //     useOnboardingCandidates();
// //   const { data: employeeTypes } = useOnboardingEmployees();
// //   const { data: employees } = useEmployeesWithCandidates();
// //   const { assigneTasks, loading: assigning } = useAssignOnBoardingTasks();

// //   const [employmentTypeId, setEmploymentTypeId] = useState(null);
// //   const [selectedCandidateId, setSelectedCandidateId] = useState("");
// //   const {
// //     // preTasks,
// //     postTasks,
// //     loading: tasksLoading,
// //   } = useHiringTasks(employmentTypeId);

// //   const formikRef = useRef();

// //   useEffect(() => {
// //     if (selectedCandidateId) {
// //       const selectedCandidate = (candidates || []).find(
// //         (c) => c.id === selectedCandidateId
// //       );
// //       if (
// //         selectedCandidate &&
// //         (!selectedCandidate.designation || !selectedCandidate.vacancy)
// //       ) {
// //         toast.error("Please add vacancy and designation first.");
// //         setSelectedCandidateId("");
// //       }
// //     }
// //   }, [selectedCandidateId, candidates]);

// //   useEffect(() => {
// //     // Sync Formik and local state for candidate selection
// //     if (formikRef.current) {
// //       const formikValues = formikRef.current.values;
// //       if (formikValues.employee !== selectedCandidateId) {
// //         formikRef.current.setFieldValue("employee", selectedCandidateId);
// //       }
// //     }
// //   }, [selectedCandidateId]);

// //   const initialValues = buildInitialValues([
// //     // ...(preTasks || []),
// //     ...(postTasks || []),
// //   ]);
// //   const validationSchema = buildValidationSchema([
// //     // ...(preTasks || []),
// //     ...(postTasks || []),
// //   ]);

// //   const handleSubmit = (values, formikHelpers) =>
// //     assigneTasks(values, formikHelpers, refetchCandidates);

// //   return (
// //     <PageWrapperWithHeading title="On Boarding" items={breadcrumbItems}>
// //       <div className="flex flex-col h-[calc(100vh-222px)]">
// //         <Formik
// //           innerRef={formikRef}
// //           initialValues={initialValues}
// //           validationSchema={validationSchema}
// //           onSubmit={handleSubmit}
// //         >
// //           {({ values, setFieldValue }) => {
// //             // Remove useEffect from here, just update local state on change
// //             const handleEmployeeChange = (value) => {
// //               setSelectedCandidateId(value);
// //               setFieldValue("employee", value);
// //             };
// //             return (
// //               <Form className="flex flex-col flex-1 overflow-hidden">
// //                 <div className="flex-1 overflow-y-auto space-y-6">
// //                   {/* Candidate Info */}
// //                   <h2 className="text-lg font-semibold">
// //                     Candidate Information
// //                   </h2>
// //                   <div className="bg-gray-100 p-6 rounded-lg space-y-4">
// //                     <FormikSelectField
// //                       name="employee"
// //                       label="Select Candidate"
// //                       placeholder="Select Candidate"
// //                       options={candidates || []}
// //                       getOptionLabel={(o) => `${o.first_name} ${o.family_name}`}
// //                       selectKey="id"
// //                       required
// //                       onChange={handleEmployeeChange}
// //                     />
// //                     <FormikSelectField
// //                       name="role"
// //                       label="Select Role"
// //                       options={ROLE_OPTIONS}
// //                       selectKey="value"
// //                       required
// //                     />
// //                     {/* <FormikInputField
// //                       name="employee_code"
// //                       label="Assign a Employee Code"
// //                       required
// //                     /> */}
// //                     <FormikSelectField
// //                       name="employment_type"
// //                       label="Employment Type"
// //                       options={employeeTypes || []}
// //                       getOptionLabel={(o) => o.employment_type}
// //                       selectKey="id"
// //                       onChange={(value) => {
// //                         setFieldValue("employment_type", value);
// //                         setEmploymentTypeId(value);
// //                       }}
// //                       required
// //                     />
// //                     {/* <FormikInputField
// //                       name='salary'
// //                       label='Add Salary of the employee'
// //                       required
// //                     /> */}
// //                   </div>

// //                   <LoadingWrapper isLoading={tasksLoading}>
// //                     {/* {preTasks?.length > 0 ? (
// //                       <>
// //                         <h2 className='text-lg font-semibold'>
// //                           Pre-Hiring Tasks
// //                         </h2>
// //                         <div className='bg-gray-100 p-6 rounded-lg space-y-4'>
// //                           {preTasks.map(({ id, name }) => (
// //                             <div key={id} className='grid grid-cols-2 gap-4'>
// //                               <div>
// //                                 <p className='text-sm mb-1 text-gray-800'>
// //                                   Task <br />{' '}
// //                                   <span className='text-md'>{name}</span>
// //                                 </p>
// //                               </div>
// //                               <FormikSelectField
// //                                 name={id}
// //                                 label='Assign To'
// //                                 options={employees || []}
// //                                 getOptionLabel={o =>
// //                                   `${o.first_name} ${o.family_name}`
// //                                 }
// //                                 selectKey='id'
// //                               />
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </>
// //                     ) : null} */}

// //                     {/* Post-Hiring Tasks */}
// //                     {postTasks?.length > 0 && (
// //                       <>
// //                         <h2 className="text-lg font-semibold">
// //                           Post-Hiring Tasks
// //                         </h2>
// //                         <div className="bg-gray-100 p-6 rounded-lg space-y-4">
// //                           {postTasks.map(({ id, name }) => (
// //                             <div key={id} className="grid grid-cols-2 gap-4">
// //                               <div>
// //                                 <p className="text-sm mb-1 text-gray-800">
// //                                   Task <br />{" "}
// //                                   <span className="text-md">{name}</span>
// //                                 </p>
// //                               </div>
// //                               <FormikSelectField
// //                                 name={id}
// //                                 label="Assign To"
// //                                 options={employees || []}
// //                                 getOptionLabel={(o) =>
// //                                   `${o.first_name} ${o.family_name}`
// //                                 }
// //                                 selectKey="id"
// //                               />
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </>
// //                     )}
// //                   </LoadingWrapper>
// //                 </div>

// //                 <div className="sticky bottom-0 bg-white p-4 flex justify-end">
// //                   <SubmitButton
// //                     title="Assign Tasks"
// //                     isLoading={assigning}
// //                     type="submit"
// //                     fullWidth={false}
// //                   />
// //                 </div>
// //               </Form>
// //             );
// //           }}
// //         </Formik>
// //       </div>
// //     </PageWrapperWithHeading>
// //   );
// // };

// // export default OnBoardingTaskAssignmentForm;



// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { Formik, Form } from "formik";
// import * as Yup from "yup";
// import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
// import FormikSelectField from "../../../../components/common/FormikSelectField";
// import SubmitButton from "../../../../components/common/SubmitButton";
// import HomeIcon from "@mui/icons-material/Home";
// import {
//   useAssignOnBoardingTasks,
//   useHiringTasks,
//   useOnboardingCandidates,
// } from "../../../../utils/hooks/api/onboarding";
// import { useEmployeesWithCandidates } from "../../../../utils/hooks/api/offboarding";
// import { useOnboardingEmployees } from "../../../../utils/hooks/api/onboradingEmployee";
// import LoadingWrapper from "../../../../components/common/LoadingWrapper";
// import FormikInputField from "../../../../components/common/FormikInputField";
// import toast from "react-hot-toast";

// /* base initialValues without seeding tasks here */
// const buildInitialValues = (sections) =>
//   sections.reduce(
//     (acc, section) => {
//       acc[section.id] = ""; // task selects will be seeded later via useEffect
//       return acc;
//     },
//     {
//       employee: "",
//       role: "",
//       employment_type: "",
//     }
//   );

// const buildValidationSchema = (sections) => {
//   const shape = {
//     employee: Yup.string().required("Candidate is required"),
//     role: Yup.string().required("Role is required"),
//     employment_type: Yup.string().required("Employment Type is required"),
//   };
//   sections.forEach(({ id }) => {
//     shape[id] = Yup.string().required("This task assignment is required");
//   });
//   return Yup.object().shape(shape);
// };

// const breadcrumbItems = [
//   { href: "/home", icon: HomeIcon },
//   { title: "Human Resource", href: "#" },
//   { title: "On Boarding" },
// ];

// const ROLE_OPTIONS = [
//   { label: "Employee", value: "employee" },
//   { label: "Manager", value: "manager" },
//   { label: "HR", value: "hr" },
//   { label: "HR Manager", value: "hr_manager" },
// ];

// const OnBoardingTaskAssignmentForm = () => {
//   const { data: candidates, refetch: refetchCandidates } = useOnboardingCandidates();
//   const { data: employeeTypes } = useOnboardingEmployees();
//   const { data: employees } = useEmployeesWithCandidates();
//   const { assigneTasks, loading: assigning } = useAssignOnBoardingTasks();

//   const [employmentTypeId, setEmploymentTypeId] = useState(null);
//   const [selectedCandidateId, setSelectedCandidateId] = useState("");

//   const { postTasks, loading: tasksLoading } = useHiringTasks(employmentTypeId);

//   const formikRef = useRef();

//   // guard: candidate must have designation & vacancy
//   useEffect(() => {
//     if (selectedCandidateId) {
//       const selectedCandidate = (candidates || []).find((c) => c.id === selectedCandidateId);
//       if (selectedCandidate && (!selectedCandidate.designation || !selectedCandidate.vacancy)) {
//         toast.error("Please add vacancy and designation first.");
//         setSelectedCandidateId("");
//       }
//     }
//   }, [selectedCandidateId, candidates]);

//   // keep Formik 'employee' in sync with local selection
//   useEffect(() => {
//     if (formikRef.current) {
//       const formikValues = formikRef.current.values;
//       if (formikValues.employee !== selectedCandidateId) {
//         formikRef.current.setFieldValue("employee", selectedCandidateId, false);
//       }
//     }
//   }, [selectedCandidateId]);

//   /* sections are just postTasks in this screen */
//   const sections = useMemo(() => [...(postTasks || [])], [postTasks]);

//   const initialValues = useMemo(
//     () => buildInitialValues(sections),
//     [sections]
//   );

//   const validationSchema = useMemo(
//     () => buildValidationSchema(sections),
//     [sections]
//   );

//   // 🔑 Seed only the task fields from assigned_id_master AFTER tasks load,
//   // without touching employee/role/employment_type
//   useEffect(() => {
//     if (!formikRef.current || !postTasks?.length) return;

//     const { setFieldValue } = formikRef.current;

//     postTasks.forEach((t) => {
//       const taskFieldName = t.id; // each task select uses name={id}
//       const assigned = t?.assigned_id_master != null ? t.assigned_id_master : "";

//       // Set only if different to avoid loops; won't affect base fields
//       if (formikRef.current.values[taskFieldName] !== assigned) {
//         setFieldValue(taskFieldName, assigned, false);
//       }
//     });
//   }, [postTasks]);

//   const handleSubmit = (values, formikHelpers) =>
//     assigneTasks(values, formikHelpers, refetchCandidates);

//   return (
//     <PageWrapperWithHeading title="On Boarding" items={breadcrumbItems}>
//       <div className="flex flex-col h-[calc(100vh-222px)]">
//         <Formik
//           innerRef={formikRef}
//           initialValues={initialValues}
//           validationSchema={validationSchema}
//           onSubmit={handleSubmit}
//           /* 🚫 no enableReinitialize — prevents base fields from resetting */
//         >
//           {({ setFieldValue }) => {
//             const handleEmployeeChange = (value) => {
//               setSelectedCandidateId(value);
//               setFieldValue("employee", value);
//             };

//             return (
//               <Form className="flex flex-col flex-1 overflow-hidden">
//                 <div className="flex-1 overflow-y-auto space-y-6">
//                   {/* Candidate Info */}
//                   <h2 className="text-lg font-semibold">Candidate Information</h2>
//                   <div className="bg-gray-100 p-6 rounded-lg space-y-4">
//                     <FormikSelectField
//                       name="employee"
//                       label="Select Candidate"
//                       placeholder="Select Candidate"
//                       options={candidates || []}
//                       getOptionLabel={(o) => `${o.first_name} ${o.family_name}`}
//                       selectKey="id"
//                       required
//                       onChange={handleEmployeeChange}
//                       /* keep current selection */
//                       value={selectedCandidateId}
//                     />
//                     <FormikSelectField
//                       name="role"
//                       label="Select Role"
//                       options={ROLE_OPTIONS}
//                       selectKey="value"
//                       required
//                     />
//                     <FormikSelectField
//                       name="employment_type"
//                       label="Employment Type"
//                       options={employeeTypes || []}
//                       getOptionLabel={(o) => o.employment_type}
//                       selectKey="id"
//                       onChange={(value) => {
//                         setFieldValue("employment_type", value);
//                         setEmploymentTypeId(value);
//                       }}
//                       required
//                     />
//                   </div>

//                   <LoadingWrapper isLoading={tasksLoading}>
//                     {postTasks?.length > 0 && (
//                       <>
//                         <h2 className="text-lg font-semibold">Post-Hiring Tasks</h2>
//                         <div className="bg-gray-100 p-6 rounded-lg space-y-4">
//                           {postTasks.map(({ id, name }) => (
//                             <div key={id} className="grid grid-cols-2 gap-4">
//                               <div>
//                                 <p className="text-sm mb-1 text-gray-800">
//                                   Task <br /> <span className="text-md">{name}</span>
//                                 </p>
//                               </div>
//                               <FormikSelectField
//                                 name={id}
//                                 label="Assign To"
//                                 options={employees || []}
//                                 getOptionLabel={(o) => `${o.first_name} ${o.family_name}`}
//                                 selectKey="id"
//                                 /* value will already be injected via the seeding effect above */
//                               />
//                             </div>
//                           ))}
//                         </div>
//                       </>
//                     )}
//                   </LoadingWrapper>
//                 </div>

//                 <div className="sticky bottom-0 bg-white p-4 flex justify-end">
//                   <SubmitButton
//                     title="Assign Tasks"
//                     isLoading={assigning}
//                     type="submit"
//                     fullWidth={false}
//                   />
//                 </div>
//               </Form>
//             );
//           }}
//         </Formik>
//       </div>
//     </PageWrapperWithHeading>
//   );
// };

// export default OnBoardingTaskAssignmentForm;



import React, { useState, useEffect, useRef, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../components/common/SubmitButton";
import HomeIcon from "@mui/icons-material/Home";
import {
  useAssignOnBoardingTasks,
  useHiringTasks,
  useOnboardingCandidates,
} from "../../../../utils/hooks/api/onboarding";
import { useEmployeesWithCandidates } from "../../../../utils/hooks/api/offboarding";
import { useOnboardingEmployees } from "../../../../utils/hooks/api/onboradingEmployee";
import LoadingWrapper from "../../../../components/common/LoadingWrapper";
import FormikInputField from "../../../../components/common/FormikInputField";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabaseClient"; // ✅ added

/* base initialValues without seeding tasks here */
const buildInitialValues = (sections) =>
  sections.reduce(
    (acc, section) => {
      acc[section.id] = ""; // task selects will be seeded later via useEffect
      return acc;
    },
    {
      employee: "",
      role: "",
      employment_type: "",
    }
  );

const buildValidationSchema = (sections) => {
  const shape = {
    employee: Yup.string().required("Candidate is required"),
    role: Yup.string().required("Role is required"),
    employment_type: Yup.string().required("Employment Type is required"),
  };
  sections.forEach(({ id }) => {
    shape[id] = Yup.string().required("This task assignment is required");
  });
  return Yup.object().shape(shape);
};

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource", href: "#" },
  { title: "On Boarding" },
];

const ROLE_OPTIONS = [
  { label: "Employee", value: "employee" },
  { label: "Manager", value: "manager" },
  { label: "HR", value: "hr" },
  { label: "HR Manager", value: "hr_manager" },
];

const OnBoardingTaskAssignmentForm = () => {
  const { data: candidates, refetch: refetchCandidates } = useOnboardingCandidates();
  const { data: employeeTypes } = useOnboardingEmployees();
  const { data: employees = [] } = useEmployeesWithCandidates();
  const { assigneTasks, loading: assigning } = useAssignOnBoardingTasks();

  const [employmentTypeId, setEmploymentTypeId] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  const { postTasks, loading: tasksLoading } = useHiringTasks(employmentTypeId);

  const formikRef = useRef();

  // guard: candidate must have designation & vacancy
  useEffect(() => {
    if (selectedCandidateId) {
      const selectedCandidate = (candidates || []).find((c) => c.id === selectedCandidateId);
      if (selectedCandidate && (!selectedCandidate.designation || !selectedCandidate.vacancy)) {
        toast.error("Please add vacancy and designation first.");
        setSelectedCandidateId("");
      }
    }
  }, [selectedCandidateId, candidates]);

  // keep Formik 'employee' in sync with local selection
  useEffect(() => {
    if (formikRef.current) {
      const formikValues = formikRef.current.values;
      if (formikValues.employee !== selectedCandidateId) {
        formikRef.current.setFieldValue("employee", selectedCandidateId, false);
      }
    }
  }, [selectedCandidateId]);

  /* sections are just postTasks in this screen */
  const sections = useMemo(() => [...(postTasks || [])], [postTasks]);

  const initialValues = useMemo(() => buildInitialValues(sections), [sections]);

  const validationSchema = useMemo(() => buildValidationSchema(sections), [sections]);

  // Local cache for any replacement employees we might need to add to dropdown options
  const [extraEmployees, setExtraEmployees] = useState([]);
  const mergedEmployees = useMemo(() => {
    const map = new Map(employees.map((e) => [e.id, e]));
    extraEmployees.forEach((e) => map.set(e.id, e));
    return Array.from(map.values());
  }, [employees, extraEmployees]);

  // 🔑 Seed task fields with assigned or replacement employees BEFORE loading into dropdown
  useEffect(() => {
    (async () => {
      if (!formikRef.current || !postTasks?.length) return;

      // 1) Collect the original assigned employees from tasks
      const assignedIds = Array.from(
        new Set(
          postTasks
            .map((t) => t?.assigned_id_master)
            .filter((v) => v !== null && v !== undefined)
        )
      );
      if (assignedIds.length === 0) return;

      // 2) Query leave_requests for these employees (non-sick leaves), prefer latest by created_at
      const { data: leaves, error: leaveErr } = await supabase
        .from("leave_requests")
        .select("employee_id,replacement_employee_id,created_at,leave_type")
        .in("employee_id", assignedIds)
        .neq("leave_type", "Sick Leave")
        .order("created_at", { ascending: false });

      if (leaveErr) {
        console.error("Leave lookup error:", leaveErr);
        // Fail-open: if leave lookup fails, just seed the original assigned ids
      }

      // 3) Build map employee_id -> replacement_employee_id (latest)
      const replacementMap = new Map(); // employee_id -> replacement_employee_id
      if (leaves?.length) {
        for (const row of leaves) {
          if (row?.replacement_employee_id) {
            if (!replacementMap.has(row.employee_id)) {
              replacementMap.set(row.employee_id, row.replacement_employee_id);
            }
          }
        }
      }

      // 4) Ensure all replacement employees exist in dropdown options
      const replacementIds = Array.from(
        new Set(Array.from(replacementMap.values()).filter(Boolean))
      );

      const existingIds = new Set(mergedEmployees.map((e) => e.id));
      const missingReplacementIds = replacementIds.filter((id) => !existingIds.has(id));

      if (missingReplacementIds.length > 0) {
        const { data: fetchedReplacements, error: empErr } = await supabase
          .from("employees")
          .select(
            "id, employee_code, first_name, second_name, third_name, forth_name, family_name"
          )
          .in("id", missingReplacementIds);

        if (empErr) {
          console.error("Replacement employee fetch error:", empErr);
        } else if (Array.isArray(fetchedReplacements) && fetchedReplacements.length > 0) {
          setExtraEmployees((prev) => {
            const map = new Map(prev.map((e) => [e.id, e]));
            fetchedReplacements.forEach((e) => map.set(e.id, e));
            return Array.from(map.values());
          });
        }
      }

      // 5) Finally seed each task field: use replacement if available, else original assigned
      const { setFieldValue, values } = formikRef.current;
      let replacedCount = 0;

      postTasks.forEach((t) => {
        const taskFieldName = t.id;
        const originalAssigned = t?.assigned_id_master ?? "";
        const replacementForThis = replacementMap.get(originalAssigned) ?? null;
        const seedValue = replacementForThis || originalAssigned || "";

        if (values[taskFieldName] !== seedValue) {
          setFieldValue(taskFieldName, seedValue, false);
        }
        if (replacementForThis) replacedCount += 1;
      });

      if (replacedCount > 0) {
        toast((t) => (
          <span>
            {replacedCount} task{replacedCount > 1 ? "s" : ""} auto-assigned to replacement
            employee{replacedCount > 1 ? "s" : ""} (assignee on leave).
          </span>
        ));
      }
    })();
    // We intentionally depend on mergedEmployees so we can add missing replacements first
  }, [postTasks, mergedEmployees]);

  const handleSubmit = (values, formikHelpers) =>
    assigneTasks(values, formikHelpers, refetchCandidates);

  return (
    <PageWrapperWithHeading title="On Boarding" items={breadcrumbItems}>
      <div className="flex flex-col h-[calc(100vh-222px)]">
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          /* 🚫 no enableReinitialize — prevents base fields from resetting */
        >
          {({ setFieldValue }) => {
            const handleEmployeeChange = (value) => {
              setSelectedCandidateId(value);
              setFieldValue("employee", value);
            };

            return (
              <Form className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-6">
                  {/* Candidate Info */}
                  <h2 className="text-lg font-semibold">Candidate Information</h2>
                  <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                    <FormikSelectField
                      name="employee"
                      label="Select Candidate"
                      placeholder="Select Candidate"
                      options={candidates || []}
                      getOptionLabel={(o) => `${o.first_name} ${o.second_name} ${o.third_name} ${o.forth_name} ${o.family_name}`} // first_name, second_name, third_name, forth_name, family_name
                      selectKey="id"
                      required
                      onChange={handleEmployeeChange}
                      /* keep current selection */
                      value={selectedCandidateId}
                    />
                    <FormikSelectField
                      name="role"
                      label="Select Role"
                      options={ROLE_OPTIONS}
                      selectKey="value"
                      required
                    />
                    <FormikSelectField
                      name="employment_type"
                      label="Employment Type"
                      options={employeeTypes || []}
                      getOptionLabel={(o) => o.employment_type}
                      selectKey="id"
                      onChange={(value) => {
                        setFieldValue("employment_type", value);
                        setEmploymentTypeId(value);
                      }}
                      required
                    />
                  </div>

                  <LoadingWrapper isLoading={tasksLoading}>
                    {postTasks?.length > 0 && (
                      <>
                        <h2 className="text-lg font-semibold">Post-Hiring Tasks</h2>
                        <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                          {postTasks.map(({ id, name }) => (
                            <div key={id} className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm mb-1 text-gray-800">
                                  Task <br /> <span className="text-md">{name}</span>
                                </p>
                              </div>
                              <FormikSelectField
                                name={id}
                                label="Assign To"
                                options={mergedEmployees} // ✅ includes fetched replacements if needed
                                getOptionLabel={(o) =>
                                  o.employee_code
                                    ? `${o.employee_code} - ${o.first_name} ${o.second_name} ${o.third_name} ${o.forth_name} ${o.family_name}`
                                    : `${o.first_name} ${o.second_name} ${o.third_name} ${o.forth_name} ${o.family_name}`
                                }
                                selectKey="id"
                                /* values are injected by the seeding effect above (replacement or original) */
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
            );
          }}
        </Formik>
      </div>
    </PageWrapperWithHeading>
  );
};

export default OnBoardingTaskAssignmentForm;
