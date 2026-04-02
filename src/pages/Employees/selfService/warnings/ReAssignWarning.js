import React, { useMemo } from "react";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikFileUpload from "../../../../components/common/FormikFileUpload";
import warningValidationSchema from "../../../../utils/validations/warningValidation";
import { format } from "date-fns";
import { useEmployeesData } from "../../../../utils/hooks/api/emplyees";
import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";

const ReAssignWarning = ({
  open,
  onClose,
  id = null,
  handleSubmit,
  loading,
  editingData,
}) => {
  const initialValues = {
    effected_date: "",
    subject: "",
    warning: "",
    attachment: "",
    employee_id: [],
  };

  // Prefill justification if editing
  const getInitialValues = () => {
    if (editingData) {
      return {
        effected_date: "",
        subject: editingData.subject || "",
        warning: editingData.warning || "",
        attachment: editingData.attachment || "",
        employee_id: [],
      };
    }
    return initialValues;
  };

  const { data = [], loading: empLoading } = useEmployeesData(false);
  const today = format(new Date(), "yyyy-MM-dd");

  // Memoize employee options for dropdown
  const employeeOptions = useMemo(() => {


    return (data || []).map((emp) => ({
      value: emp.id,
      label: `${emp?.employee_code || ""} - ${
        emp?.first_name || ""
      } ${emp?.second_name || ""} ${
        emp?.third_name || ""
      } ${emp?.forth_name || ""} ${
        emp?.family_name || ""
      }`
        .replace(/\s+/g, " ")
        .trim(),
    }));
  }, [data]);

  return (
    <Modal
      onClose={onClose}
      title={id ? "Edit Warning Letter" : "Reassign Warning Letter"}
      open={open}
    >
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={getInitialValues()}
          validationSchema={warningValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => {
            // ✅ Selected values for display in the multi-select
            const selectedValues = employeeOptions.filter((opt) =>
              values.employee_id.includes(opt.value)
            );

            return (
              <Form className="flex-1 overflow-y-auto space-y-6">
                <FormikInputField name="subject" label="Subject" required />

                <FormikInputField
                  name="warning"
                  label="Warning"
                  textarea
                  rows={4}
                  required
                />

                {/* 👇 Multi-select Employees */}
                <FormikMultiSelectField
                  name="employee_id"
                  label="Employees"
                  placeholder="Select Employees"
                  required
                  options={employeeOptions}
                  disabled={empLoading}
                  value={selectedValues}
                />

                <FormikInputField
                  name="effected_date"
                  label="Effected Date"
                  type="date"
                  required
                />

                {/* Display readonly Created At field */}
                <FormikInputField
                  name="created_at_display"
                  label="Created At"
                  value={today}
                  type="date"
                  disabled
                  InputProps={{ readOnly: true }}
                />

                <FormikFileUpload name="attachment" label="Attachment" />

                {/* Action Buttons */}
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

export default ReAssignWarning;





// import React, { useState } from "react";
// import { Formik, Form } from "formik";
// import FormikInputField from "../../../../components/common/FormikInputField";
// import Modal from "../../../../components/common/Modal";
// import SubmitButton from "../../../../components/common/SubmitButton";
// import FormikFileUpload from "../../../../components/common/FormikFileUpload";
// import warningValidationSchema from "../../../../utils/validations/warningValidation";
// import { format } from "date-fns";
// import { useEmployeesData } from "../../../../utils/hooks/api/emplyees";
// import FormikSelectField from "../../../../components/common/FormikSelectField";
// import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";

// const ReAssignWarning = ({
//   open,
//   onClose,
//   id = null,
//   handleSubmit,
//   loading,
//   editingData,
// }) => {
//   const initialValues = {
//     effected_date: "",
//     subject: "",
//     warning: "",
//     attachment: "",
//     employee_id: "",
//   };

//     // Prefill justification if editing
//   const getInitialValues = () => {
//     if (editingData) {
//       return {
//         effected_date: "",
//     subject: editingData.subject,
//     warning: editingData.warning,
//     attachment: editingData.attachment,
//     employee_id: []
//       };
//     }
//     return initialValues;
//   };

//   const { data, loading: empLoading } = useEmployeesData(false);

//   // const [initialValuesState, setInitialValues] = useState(initialValues)
//   const today = format(new Date(), "yyyy-MM-dd");

//   return (
//     <Modal
//       onClose={onClose}
//       title={id ? "Edit Warning Letter" : "New Warning Letter"}
//       open={open}
//     >
//       <div className="flex flex-col">
//         <Formik
//           enableReinitialize
//           initialValues={getInitialValues()}
//           validationSchema={warningValidationSchema}
//           onSubmit={handleSubmit}
//         >
//           {({ isValid, isSubmitting, values }) => (


//             <Form className="flex-1 overflow-y-auto space-y-6">
//               <FormikInputField name="subject" label="Subject" required />

//               <FormikInputField
//                 name="warning"
//                 label="Warning"
//                 textarea
//                 rows={4}
//                 required
//               />

//                 {/* 👇 Multi-select Employees */}
//                 <FormikMultiSelectField
//                   name="employee_id"
//                   label="Employees"
//                   placeholder="Select Employees"
//                   required
//                   options={data}
//                   disabled={empLoading}
//                   value={selectedValues}
//                 />


//               <FormikInputField
//                 name="effected_date"
//                 label="Effected Date"
//                 type="date"
//                 required
//               />
//               <FormikInputField
//                 name="today"
//                 label="Created At"
//                 value={today}
//                 type="date"
//                 disabled
//                 InputProps={{ readOnly: true }}
//               />
//               <FormikFileUpload name="attachment" label="Attachment" />
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

// export default ReAssignWarning;
