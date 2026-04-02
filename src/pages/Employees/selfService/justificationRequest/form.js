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
// import FormikSelectField from "../../../../components/common/FormikSelectField";
// import { supabase } from "../../../../supabaseClient";
// import { toast } from "react-hot-toast";

// /** Syncs fetched manager into the form as manager_id */
// const ManagerWriter = ({ manager, isEditing }) => {
//   const { setFieldValue } = useFormikContext();
//   useEffect(() => {
//     if (!isEditing) {
//       setFieldValue("manager_id", manager?.id || null, false);
//     }
//   }, [manager, setFieldValue, isEditing]);
//   return null;
// };

// const ACTION_OPTIONS = [
//   { label: "Pending Decision",  value: "pending"  },
//   { label: "Accepted", value: "accepted" },
//   { label: "Rejected", value: "rejected" },
// ];

// const NewJustificationRequestForm = ({
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
//     employee_id: "",
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
//         id: editingData.id || null,
//         employee_id: editingData.employee_id || "",
//         justification_question: editingData.justification_question || "",
//         justification_reason: editingData.justification_reason || "",
//         created_by: editingData.created_by || null,
//         manager_id: editingData.manager_id || null,
//         status: editingData.status || "pending",
//       };
//     }
//     return baseInitialValues;
//   };

//   // ✅ Dynamic Yup schema: justification_reason required only when editing
//   const submitValidationSchema = useMemo(
//     () =>
//       Yup.object({
//         employee_id: Yup.mixed().required("Employee is required"),
//         justification_question: isEditing
//           ? Yup.string() // not required while editing
//           : Yup.string().required("Justification is required"),
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

//   // 🔄 Update status in DB when manager changes Action
//   const updateStatusImmediate = async (rowId, nextStatus, previousStatus, setFieldValue) => {
//     if (!rowId) return;
//     try {
//       const { error } = await supabase
//         .from("justifications") // <-- adjust table name if different
//         .update({ status: nextStatus })
//         .eq("id", rowId);

//       if (error) {
//         // revert on error
//         setFieldValue("status", previousStatus, false);
//         toast.error(error.message || "Failed to update status");
//         return;
//       }
//       toast.success(`Status updated to ${nextStatus}`);
//     } catch (err) {
//       setFieldValue("status", previousStatus, false);
//       toast.error(err?.message || "Failed to update status");
//     }
//   };

//   return (
//     <Modal
//       onClose={onClose}
//       title={isEditing ? "Require Justification" : "New Justification Request"}
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
//           onSubmit={(values, actions) => {
//             handleSubmit(isEditing, values, actions);
//           }}
//         >
//           {({ isSubmitting, setFieldValue, values }) => (
//             <Form className="flex-1 overflow-y-auto space-y-6">
//               {/* Keep manager_id in sync with hook results */}
//               <ManagerWriter manager={manager} isEditing={isEditing} />

//               {/* Employee selection only when creating */}
//               {!isEditing && (
//                 <FormikSelectField
//                   name="employee_id"
//                   label="Employee"
//                   required
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
//                   onChange={async (opt) => {
//                     const selectedId = opt?.value ?? opt;
//                     setFieldValue("employee_id", selectedId);

//                     const emp = (employees || []).find(
//                       (e) => String(e.id) === String(selectedId)
//                     );
//                     const orgUnitId = emp?.organizational_unit_id;

//                     if (orgUnitId) {
//                       await fetchManager(orgUnitId);
//                     } else if (!isEditing) {
//                       setFieldValue("manager_id", null, false);
//                     }
//                   }}
//                 />
//               )}

//               <FormikInputField
//                 name="justification_question"
//                 label="Justification"
//                 textarea
//                 rows={3}
//                 placeholder="Require justification of......"
//                 required={!isEditing}
//                 disabled={isEditing}
//               />

//               {isEditing && (
//                 <FormikInputField
//                   name="justification_reason"
//                   label="Justification Response"
//                   textarea
//                   rows={3}
//                   placeholder="Your response to this justification......"
//                   required={!isManager}
//                   disabled={isManager}
//                 />
//               )}

//               {/* 👇 Action dropdown for managers only (live update on change) */}
//               {isManager && (
//                 <FormikSelectField
//                   name="status"
//                   label="Action"
//                   required
//                   options={ACTION_OPTIONS}
//                   onChange={async (opt) => {
//                     const next = (opt?.value ?? opt)?.toString().toLowerCase();
//                     const prev = values.status;
//                     // optimistic update
//                     setFieldValue("status", next, false);
//                     await updateStatusImmediate(
//                       values.id || editingData?.id,
//                       next,
//                       prev,
//                       setFieldValue
//                     );
//                   }}
//                 />
//               )}

//               <div className="mt-5 flex justify-end space-x-2 bg-white">
//                 <SubmitButton
//                   variant="outlined"
//                   title="Clear"
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

// export default NewJustificationRequestForm;


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
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { supabase } from "../../../../supabaseClient";
import { toast } from "react-hot-toast";

/** Syncs fetched manager into the form as manager_id */
const ManagerWriter = ({ manager, isEditing }) => {
  const { setFieldValue } = useFormikContext();
  useEffect(() => {
    if (!isEditing) {
      setFieldValue("manager_id", manager?.id || null, false);
    }
  }, [manager, setFieldValue, isEditing]);
  return null;
};

const ACTION_OPTIONS = [
  { label: "Pending Decision", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
];

const NewJustificationRequestForm = ({
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
  const { manager, fetchManager } = useGetDepartmentManager();

  // Base initial values for create mode
  const baseInitialValues = {
    employee_id: "",
    justification_question: "",
    justification_reason: "",
    created_by: user?.id || null,
    manager_id: null,
    status: "pending",
  };

  // Compute initial values based on editing mode/data
  const getInitialValues = () => {
    if (isEditing && editingData) {
      return {
        id: editingData.id || null,
        employee_id: editingData.employee_id || "",
        justification_question: editingData.justification_question || "",
        justification_reason: editingData.justification_reason || "",
        created_by: editingData.created_by || null,
        manager_id: editingData.manager_id || null,
        status: editingData.status || "pending",
      };
    }
    return baseInitialValues;
  };

  // ✅ Dynamic Yup schema: justification_reason required only when editing
  const submitValidationSchema = useMemo(
    () =>
      Yup.object({
        employee_id: Yup.mixed().required("Employee is required"),
        justification_question: isEditing
          ? Yup.string() // not required while editing
          : Yup.string().required("Justification is required"),
        justification_reason: isEditing
          ? Yup.string().when("$isManager", {
              is: false, // required when editing and NOT manager
              then: (s) => s.required("Justification response is required"),
              otherwise: (s) => s,
            })
          : Yup.string().nullable(),
      }),
    [isEditing]
  );

  return (
    <Modal
      onClose={onClose}
      title={isEditing ? "Require Justification" : "New Justification Request"}
      open={open}
    >
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={getInitialValues()}
          validationSchema={submitValidationSchema}
          validateOnBlur
          validateOnChange
          context={{ isManager }}
          onSubmit={async (values, actions) => {
            try {
              // If manager is editing, push status to DB on submit (NOT on dropdown change)
              if (isManager && isEditing) {
                const rowId = values.id || editingData?.id;
                if (rowId) {
                  const { error } = await supabase
                    .from("justifications") // <-- change if your table name differs
                    .update({ status: values.status })
                    .eq("id", rowId);

                  if (error) {
                    toast.error(error.message || "Failed to update status");
                    // keep going to allow parent to handle other updates or bail?
                    // You can return here if you want to block parent submit on error.
                  } else {
                    toast.success(`Status updated to ${values.status}`);
                  }
                }
              }

              // Let parent handle the rest (create/update payload, etc.)
              await handleSubmit(isEditing, values, actions);
            } catch (err) {
              console.error("Submit failed:", err);
              toast.error(err?.message || "Submit failed");
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {/* Keep manager_id in sync with hook results */}
              <ManagerWriter manager={manager} isEditing={isEditing} />

              {/* Employee selection only when creating */}
              {!isEditing && (
                <FormikSelectField
                  name="employee_id"
                  label="Employee"
                  required
                  options={(employees || []).map((emp) => ({
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
                  }))}
                  disabled={employeesLoading}
                  onChange={async (opt) => {
                    const selectedId = opt?.value ?? opt;
                    setFieldValue("employee_id", selectedId);

                    const emp = (employees || []).find(
                      (e) => String(e.id) === String(selectedId)
                    );
                    const orgUnitId = emp?.organizational_unit_id;

                    if (orgUnitId) {
                      await fetchManager(orgUnitId);
                    } else if (!isEditing) {
                      setFieldValue("manager_id", null, false);
                    }
                  }}
                />
              )}

              <FormikInputField
                name="justification_question"
                label="Justification"
                textarea
                rows={3}
                placeholder="Require justification of......"
                required={!isEditing}
                disabled={isEditing}
              />

              {isEditing && (
                <FormikInputField
                  name="justification_reason"
                  label="Justification Response"
                  textarea
                  rows={3}
                  placeholder="Your response to this justification......"
                  required={!isManager}
                  disabled={isManager}
                />
              )}

              {/* 👇 Action dropdown for managers only (NO API here; only on submit) */}
              {isManager && (
                <FormikSelectField
                  name="status"
                  label="Action"
                  required
                  options={ACTION_OPTIONS}
                  onChange={(opt) => {
                    const next = (opt?.value ?? opt)?.toString().toLowerCase();
                    setFieldValue("status", next, false); // just update form state
                  }}
                />
              )}

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton
                  variant="outlined"
                  title="Clear"
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
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewJustificationRequestForm;
