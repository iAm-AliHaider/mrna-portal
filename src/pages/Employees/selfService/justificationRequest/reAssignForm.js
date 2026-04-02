import React, { useEffect, useMemo } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { useUser } from "../../../../context/UserContext";
import {
  useCompanyEmployeesWithoutMyId,
  useGetDepartmentManager,
} from "../../../../utils/hooks/api/emplyees";
import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
import { toast } from "react-hot-toast";

/* 🧩 Subcomponent to handle manager fetching safely */
const AutoManagerSync = ({ employees, fetchManager }) => {
  const { values, setFieldValue } = useFormikContext();

  useEffect(() => {
    const updateManagers = async () => {
      if (!values.employee_id?.length) {
        setFieldValue("manager_id", [], false);
        return;
      }

      const managerIds = await Promise.all(
        values.employee_id.map(async (empId) => {
          const emp = employees.find((e) => String(e.id) === String(empId));
          const orgUnitId = emp?.organizational_unit_id;
          if (!orgUnitId) return "";
          const mgr = await fetchManager(orgUnitId);
          return mgr?.id || "";
        })
      );

      setFieldValue("manager_id", managerIds, false);
    };

    updateManagers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.employee_id]);

  return null;
};

const ReAssignJustificationForm = ({
  onClose,
  open,
  id,
  handleSubmit,
  loading,
  editingData,
  isEditing,
  isManager,
}) => {
  const { user } = useUser();
  const { employees = [], loading: employeesLoading } =
    useCompanyEmployeesWithoutMyId();
  const { fetchManager } = useGetDepartmentManager();

  // Base initial values
  const baseInitialValues = {
    employee_id: [],
    manager_id: [], // store manager IDs in parallel
    justification_question: "",
    justification_reason: "",
    created_by: user?.id || null,
    status: "pending",
  };

  // Prefill justification if editing
  const getInitialValues = () => {
    if (isEditing && editingData) {
      return {
        employee_id: [],
        manager_id: [],
        justification_question: editingData.justification_question || "",
        justification_reason: "",
        created_by: editingData.created_by || null,
        status: "pending",
      };
    }
    return baseInitialValues;
  };

  // Validation schema
  const validationSchema = useMemo(
    () =>
      Yup.object({
        employee_id: Yup.array()
          .min(1, "Please select at least one employee")
          .required("Employees are required"),
        justification_question: Yup.string().required(
          "Justification is required"
        ),
      }),
    []
  );

  return (
    <Modal
      onClose={onClose}
      title={"Re-Assign Justification Request"}
      open={open}
    >
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          validateOnBlur
          validateOnChange
          onSubmit={async (values, actions) => {
            try {
              await handleSubmit(isEditing, values, actions);
              toast.success("Reassigned successfully");
            } catch (err) {
              console.error("Submit failed:", err);
              toast.error(err?.message || "Submit failed");
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values }) => {
            // Build employee dropdown options
            const employeeOptions = (employees || []).map((emp) => ({
              value: emp.id,
              label: `${emp?.employee_code || ""} - ${
                emp?.candidates?.first_name || ""
              } ${emp?.candidates?.second_name || ""} ${
                emp?.candidates?.third_name || ""
              } ${emp?.candidates?.forth_name || ""} ${
                emp?.candidates?.family_name || ""
              }`
                .replace(/\s+/g, " ")
                .trim(),
            }));

            const selectedValues = employeeOptions.filter((opt) =>
              values.employee_id.includes(opt.value)
            );

            return (
              <Form className="flex-1 overflow-y-auto space-y-6">
                {/* 🔁 Sync managers automatically when employees change */}
                <AutoManagerSync
                  employees={employees}
                  fetchManager={fetchManager}
                />

                {/* 👇 Multi-select Employees */}
                <FormikMultiSelectField
                  name="employee_id"
                  label="Employees"
                  placeholder="Select Employees"
                  required
                  options={employeeOptions}
                  disabled={employeesLoading}
                  value={selectedValues}
                />

                {/* 👇 Justification Question */}
                <FormikInputField
                  name="justification_question"
                  label="Justification"
                  textarea
                  rows={3}
                  value={values.justification_question}
                  placeholder="Require justification of..."
                  required={true}
                />

                {/* 👇 Buttons */}
                <div className="mt-5 flex justify-end space-x-2 bg-white">
                  <SubmitButton
                    variant="outlined"
                    title="Cancel"
                    type="button"
                    onClick={onClose}
                  />
                  <SubmitButton
                    title="Save"
                    type="submit"
                    isLoading={isSubmitting || loading}
                    disabled={isSubmitting}
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Modal>
  );
};

export default ReAssignJustificationForm;










// import React, { useEffect, useMemo } from "react";
// import { Formik, Form, useFormikContext } from "formik";
// import * as Yup from "yup";
// import FormikInputField from "../../../../components/common/FormikInputField";
// import Modal from "../../../../components/common/Modal";
// import SubmitButton from "../../../../components/common/SubmitButton";
// import { useUser } from "../../../../context/UserContext";
// import {
//   useCompanyEmployeesWithoutMyId,
//   useGetDepartmentManager,
// } from "../../../../utils/hooks/api/emplyees";
// import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
// import { supabase } from "../../../../supabaseClient";
// import { toast } from "react-hot-toast";

// /** Syncs fetched manager into the form as manager_id */
// const ManagerWriter = ({ manager, isEditing }) => {
//   const { setFieldValue } = useFormikContext();
//   useEffect(() => {
//     if (!isEditing) {
//       setFieldValue("manager_id", manager?.id || null, false);

//       console.log("==============999", manager?.id)
//     }
//   }, [manager, setFieldValue, isEditing]);
//   return null;
// };

// const ACTION_OPTIONS = [
//   { label: "Pending Decision", value: "pending" },
//   { label: "Accepted", value: "accepted" },
//   { label: "Rejected", value: "rejected" },
// ];

// const ReAssignJustificationForm = ({
//   onClose,
//   open,
//   id,
//   handleSubmit,
//   loading,
//   editingData,
//   isEditing,
//   isManager,
// }) => {
//   const { user } = useUser();
//   const { employees = [], loading: employeesLoading } =
//     useCompanyEmployeesWithoutMyId();
//   const { manager, fetchManager } = useGetDepartmentManager();

//   // Base initial values for create mode
//   const baseInitialValues = {
//     employee_id: [],
//     justification_question: "",
//     justification_reason: "",
//     created_by: user?.id || null,
//     manager_id: null,
//     status: "pending",
//   };

//   // Compute initial values based on editing mode/data
//   const getInitialValues = () => {
//     if (isEditing && editingData) {
//       return {
//         employee_id: [],
//         justification_question: editingData.justification_question || "",
//         justification_reason: "",
//         created_by: editingData.created_by || null,
//         manager_id: null,
//         status: "pending",
//       };
//     }
//     return baseInitialValues;
//   };

//   // ✅ Dynamic Yup schema: justification_reason required only when editing
//   const submitValidationSchema = useMemo(
//     () =>
//       Yup.object({
//         employee_id: Yup.mixed().required("Employee is required"),
//         justification_question:Yup.string().required("Justification is required"),
//         justification_reason: isEditing
//           ? Yup.string().when("$isManager", {
//               is: false, // required when editing and NOT manager
//               then: (s) => s.required("Justification response is required"),
//               otherwise: (s) => s,
//             })
//           : Yup.string().nullable(),
//       }),
//     [isEditing]
//   );

//   return (
//     <Modal
//       onClose={onClose}
//       title={"Re-Assign Justification Request"}
//       open={open}
//     >
//       <div className="flex flex-col">
//         <Formik
//           enableReinitialize
//           initialValues={getInitialValues()}
//           validationSchema={submitValidationSchema}
//           validateOnBlur
//           validateOnChange
//           context={{ isManager }}
//           onSubmit={async (values, actions) => {
//             try {
//               // If manager is editing, push status to DB on submit (NOT on dropdown change)
//               if (isManager && isEditing) {
//                 const rowId = values.id || editingData?.id;
//                 if (rowId) {
//                   const { error } = await supabase
//                     .from("justifications") // <-- change if your table name differs
//                     .update({ status: values.status })
//                     .eq("id", rowId);

//                   if (error) {
//                     toast.error(error.message || "Failed to update status");
//                     // keep going to allow parent to handle other updates or bail?
//                     // You can return here if you want to block parent submit on error.
//                   } else {
//                     toast.success(`Status updated to ${values.status}`);
//                   }
//                 }
//               }

//               // Let parent handle the rest (create/update payload, etc.)
//               await handleSubmit(isEditing, values, actions);
//             } catch (err) {
//               console.error("Submit failed:", err);
//               toast.error(err?.message || "Submit failed");
//             } finally {
//               actions.setSubmitting(false);
//             }
//           }}
//         >
//           {({ isSubmitting, setFieldValue, values }) => (
//             <Form className="flex-1 overflow-y-auto space-y-6">
//               {/* Keep manager_id in sync with hook results */}
//               <ManagerWriter manager={manager} isEditing={isEditing} />

//               {/* Employee selection only when creating */}
//         <FormikMultiSelectField
//                 name="employee_id"
//                 label="Employees"
//                 placeholder="Select Employees"
//                 required
//                   options={(employees || []).map((emp) => ({
//                     value: emp.id,
//                     label: `${emp?.employee_code || ""} - ${
//                       emp?.candidates?.first_name || ""
//                     } ${emp?.candidates?.second_name || ""} ${
//                       emp?.candidates?.third_name || ""
//                     } ${emp?.candidates?.forth_name || ""} ${
//                       emp?.candidates?.family_name || ""
//                     }`
//                       .replace(/\s+/g, " ")
//                       .trim(),
//                   }))}
//                   disabled={employeesLoading}
//               />

//               <FormikInputField
//                 name="justification_question"
//                 label="Justification"
//                 textarea
//                 rows={3}
//                 value={values.justification_question}
//                 placeholder="Require justification of......"
//                 required={true}
//               />


//               {/* 👇 Action dropdown for managers only (NO API here; only on submit) */}
//               <div className="mt-5 flex justify-end space-x-2 bg-white">
//                 <SubmitButton
//                   variant="outlined"
//                   title="Cancel"
//                   type="button"
//                   onClick={onClose}
//                 />
//                 <SubmitButton
//                   title="Save"
//                   type="submit"
//                   isLoading={isSubmitting || loading}
//                   disabled={isSubmitting}
//                 />
//               </div>
//             </Form>
//           )}
//         </Formik>
//       </div>
//     </Modal>
//   );
// };

// export default ReAssignJustificationForm;
