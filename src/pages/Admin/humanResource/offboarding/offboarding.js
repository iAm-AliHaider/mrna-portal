// import React, { useState } from "react";
// import { Formik, Form } from "formik";
// import * as Yup from "yup";
// import FormikSelectField from "../../../../components/common/FormikSelectField";
// import SubmitButton from "../../../../components/common/SubmitButton";
// import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
// import HomeIcon from "@mui/icons-material/Home";
// import {
//   useCreateOffboardingTaskChecklist,
//   useEmployeesWithCandidates,
//   useOffboardEmployeesWithCandidates,
//   useOffBoardingTasks,
// } from "../../../../utils/hooks/api/offboarding";
// import LoadingWrapper from "../../../../components/common/LoadingWrapper";

// const generateInitialValues = (sections) => {
//   const values = { employee: "" };
//   sections.forEach(({ id }) => {
//     values[id] = "";
//   });
//   return values;
// };

// const generateValidationSchema = (sections) => {
//   const shape = { employee: Yup.string().required("Employee is required") };
//   sections.forEach(({ id }) => {
//     shape[id] = Yup.string().required("This task assignment is required");
//   });
//   return Yup.object().shape(shape);
// };

// const breadcrumbItems = [
//   { href: "/home", icon: HomeIcon },
//   { title: "Human Resource", href: "#" },
//   { title: "Off Boarding" },
// ];

// const OffBoardingTaskAssignmentForm = () => {
//   const [employmentTypeId, setEmploymentTypeId] = useState();
//   const { data: employees } = useEmployeesWithCandidates();
//   const { data: offBoardEmployees } = useOffboardEmployeesWithCandidates();
//   const { createTaskChecklist, loading: taskChecklistLoading } =
//     useCreateOffboardingTaskChecklist();

//   const {
//     preTasks,
//     postTasks,
//     loading: tasksLoading,
//   } = useOffBoardingTasks(employmentTypeId);

//   const initialValues = generateInitialValues([
//     ...(preTasks || []),
//     ...(postTasks || []),
//   ]);
//   const validationSchema = generateValidationSchema([
//     ...(preTasks || []),
//     ...(postTasks || []),
//   ]);

//   return (
//     <PageWrapperWithHeading title="Off Boarding" items={breadcrumbItems}>
//       <div className="h-[calc(100vh-222px)] flex flex-col">
//         <Formik
//           initialValues={initialValues}
//           validationSchema={validationSchema}
//           onSubmit={createTaskChecklist}
//         >
//           {({ setFieldValue }) => {
//             const handleValueChange = (value) => {
//               setFieldValue("employee", value);
//               const currentEmployee = offBoardEmployees.find(
//                 (emp) => emp.id === value
//               );
//               setEmploymentTypeId(currentEmployee?.employment_type_id);
//             };

//             return (
//               <Form className="flex flex-col flex-1 overflow-hidden">
//                 <div className="overflow-y-auto space-y-6 flex-1">
//                   <span className="mt-6 font-semibold text-lg">
//                     Employee Information
//                   </span>
//                   <div className="bg-gray-100 rounded-lg shadow-sm px-6 py-4 space-y-6">
//                     <FormikSelectField
//                       label="Select Employee"
//                       name="employee"
//                       placeholder="Select Employee"
//                       options={offBoardEmployees}
//                       getOptionLabel={(option) =>
//                         `${option.first_name} ${option.family_name}`
//                       }
//                       onChange={handleValueChange}
//                       selectKey="id"
//                       required
//                     />
//                   </div>
//                   <LoadingWrapper isLoading={tasksLoading}>
//                     {preTasks && preTasks.length > 0 && (
//                       <>
//                         <p className="mt-6 font-semibold text-lg">
//                           Pre Off Boarding Tasks
//                         </p>
//                         <div className="bg-gray-100 rounded-lg shadow-sm px-6 py-4">
//                           <div>
//                             {preTasks?.map((task) => {
//                               const name = task.id;
//                               return (
//                                 <div
//                                   key={name}
//                                   className="mb-4 grid gap-2 grid-cols-2"
//                                 >
//                                   <p className="text-sm mb-1 text-gray-800">
//                                     Task <br />{" "}
//                                     <span className="text-md">
//                                       {task?.name}
//                                     </span>
//                                   </p>
//                                   <FormikSelectField
//                                     label="Assign To"
//                                     name={name}
//                                     placeholder="Select"
//                                     options={employees}
//                                     getOptionLabel={(option) =>
//                                       `${option.employee_code} - ${option.first_name} ${option.second_name} ${option.third_name} ${option.forth_name} ${option.family_name}`
//                                     }
//                                     selectKey="id"
//                                   />
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       </>
//                     )}

//                     {postTasks && postTasks.length > 0 && (
//                       <>
//                         <p className="mt-6 font-semibold text-lg">
//                           Post Off Boarding Tasks
//                         </p>
//                         <div className="bg-gray-100 rounded-lg shadow-sm px-6 py-4">
//                           <div>
//                             {postTasks?.map((task) => {
//                               const name = task.id;
//                               return (
//                                 <div
//                                   key={name}
//                                   className="mb-4 grid gap-2 grid-cols-2"
//                                 >
//                                   <p className="text-sm mb-1 text-gray-800">
//                                     Task <br />{" "}
//                                     <span className="text-md">
//                                       {task?.name}
//                                     </span>
//                                   </p>
//                                   <FormikSelectField
//                                     label="Assign To"
//                                     name={name}
//                                     placeholder="Select"
//                                     options={employees}
//                                     getOptionLabel={(option) =>
//                                       `${option.employee_code} - ${option.first_name} ${option.second_name} ${option.third_name} ${option.forth_name} ${option.family_name}`
//                                     }
//                                     selectKey="id"
//                                   />
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </LoadingWrapper>
//                 </div>

//                 <div className="mt-4 sticky bottom-0 flex justify-end">
//                   <SubmitButton
//                     title="Assigned Tasks"
//                     type="submit"
//                     isLoading={taskChecklistLoading}
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

// export default OffBoardingTaskAssignmentForm;


import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../components/common/SubmitButton";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import {
  useCreateOffboardingTaskChecklist,
  useEmployeesWithCandidates,
  useOffboardEmployeesWithCandidates,
  useOffBoardingTasks,
} from "../../../../utils/hooks/api/offboarding";
import LoadingWrapper from "../../../../components/common/LoadingWrapper";

const generateInitialValues = (sections) => {
  const values = { employee: "" };
  sections.forEach(({ id }) => {
    values[id] = "";
  });
  return values;
};

const generateValidationSchema = (sections) => {
  const shape = { employee: Yup.string().required("Employee is required") };
  sections.forEach(({ id }) => {
    shape[id] = Yup.string().required("This task assignment is required");
  });
  return Yup.object().shape(shape);
};

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource", href: "#" },
  { title: "Off Boarding" },
];

const OffBoardingTaskAssignmentForm = () => {
  const [employmentTypeId, setEmploymentTypeId] = useState();
  const { data: employees } = useEmployeesWithCandidates();
  const { data: offBoardEmployees } = useOffboardEmployeesWithCandidates();
  const { createTaskChecklist, loading: taskChecklistLoading } =
    useCreateOffboardingTaskChecklist();

  const {
    preTasks,
    postTasks,
    loading: tasksLoading,
  } = useOffBoardingTasks(employmentTypeId);

  const initialValues = generateInitialValues([
    ...(preTasks || []),
    ...(postTasks || []),
  ]);
  const validationSchema = generateValidationSchema([
    ...(preTasks || []),
    ...(postTasks || []),
  ]);

  // ✅ Seed only the task fields (by id) from assigned_id_master, without reinitializing the whole form
  const formikRef = useRef(null);
  useEffect(() => {
    if (!formikRef.current) return;
    const { setFieldValue, values } = formikRef.current;

    const seed = (arr) =>
      (arr || []).forEach((t) => {
        const fieldName = t.id; // select name is the numeric task id
        const assigned = t?.assigned_id_master != null ? t.assigned_id_master : "";
        if (values[fieldName] !== assigned) {
          setFieldValue(fieldName, assigned, false);
        }
      });

    seed(preTasks);
    seed(postTasks);
  }, [preTasks, postTasks]);

  return (
    <PageWrapperWithHeading title="Off Boarding" items={breadcrumbItems}>
      <div className="h-[calc(100vh-222px)] flex flex-col">
        <Formik
          innerRef={formikRef} // keep form stable; we only seed specific fields
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={createTaskChecklist} // submits selected ids as-is
        >
          {({ setFieldValue }) => {
            const handleValueChange = (value) => {
              setFieldValue("employee", value);
              const currentEmployee = offBoardEmployees.find(
                (emp) => emp.id === value
              );
              setEmploymentTypeId(currentEmployee?.employment_type_id);
            };

            return (
              <Form className="flex flex-col flex-1 overflow-hidden">
                <div className="overflow-y-auto space-y-6 flex-1">
                  <span className="mt-6 font-semibold text-lg">
                    Employee Information
                  </span>
                  <div className="bg-gray-100 rounded-lg shadow-sm px-6 py-4 space-y-6">
                    <FormikSelectField
                      label="Select Employee"
                      name="employee"
                      placeholder="Select Employee"
                      options={offBoardEmployees}
                      getOptionLabel={(option) =>
                        `${option.first_name} ${option.family_name}`
                      }
                      onChange={handleValueChange}
                      selectKey="id"
                      required
                    />
                  </div>
                  <LoadingWrapper isLoading={tasksLoading}>
                    {preTasks && preTasks.length > 0 && (
                      <>
                        <p className="mt-6 font-semibold text-lg">
                          Pre Off Boarding Tasks
                        </p>
                        <div className="bg-gray-100 rounded-lg shadow-sm px-6 py-4">
                          <div>
                            {preTasks?.map((task) => {
                              const name = task.id;
                              return (
                                <div
                                  key={name}
                                  className="mb-4 grid gap-2 grid-cols-2"
                                >
                                  <p className="text-sm mb-1 text-gray-800">
                                    Task <br />{" "}
                                    <span className="text-md">
                                      {task?.name}
                                    </span>
                                  </p>
                                  <FormikSelectField
                                    label="Assign To"
                                    name={name}
                                    placeholder="Select"
                                    options={employees}
                                    getOptionLabel={(option) =>
                                      `${option.employee_code} - ${option.first_name} ${option.second_name} ${option.third_name} ${option.forth_name} ${option.family_name}`
                                    }
                                    selectKey="id"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    {postTasks && postTasks.length > 0 && (
                      <>
                        <p className="mt-6 font-semibold text-lg">
                          Post Off Boarding Tasks
                        </p>
                        <div className="bg-gray-100 rounded-lg shadow-sm px-6 py-4">
                          <div>
                            {postTasks?.map((task) => {
                              const name = task.id;
                              return (
                                <div
                                  key={name}
                                  className="mb-4 grid gap-2 grid-cols-2"
                                >
                                  <p className="text-sm mb-1 text-gray-800">
                                    Task <br />{" "}
                                    <span className="text-md">
                                      {task?.name}
                                    </span>
                                  </p>
                                  <FormikSelectField
                                    label="Assign To"
                                    name={name}
                                    placeholder="Select"
                                    options={employees}
                                    getOptionLabel={(option) =>
                                      `${option.employee_code} - ${option.first_name} ${option.second_name} ${option.third_name} ${option.forth_name} ${option.family_name}`
                                    }
                                    selectKey="id"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </LoadingWrapper>
                </div>

                <div className="mt-4 sticky bottom-0 flex justify-end">
                  <SubmitButton
                    title="Assigned Tasks"
                    type="submit"
                    isLoading={taskChecklistLoading}
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

export default OffBoardingTaskAssignmentForm;

