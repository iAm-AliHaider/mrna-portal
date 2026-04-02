import React, { useEffect, useState, useCallback } from "react";
import { Formik, Form } from "formik";
import leaveValidationSchema from "../../../../utils/validations/leaveValidation";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import { useUser } from "../../../../context/UserContext";
import { useEmployeeLeaveQuota } from "../../../../utils/hooks/api/useEmployeeLeaveQuota";
import CustomTable from "../../../../components/tables/customeTable";
import { Field } from "formik";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { supabase } from "../../../../supabaseClient";
import { Button } from "@mui/material";

import { useEmploymentTypesById } from "../../../../utils/hooks/api/employmentType";

// --- small helpers ---
const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const NewLeaveRequestForm = ({
  onClose,
  open,
  id,
  leaveData,
  handleSubmit,
  loading,
  departmentEmployees,
  isViewOnly = false,
  ownView = false,
}) => {
  const { user } = useUser();
  const employeeId = user?.id;
  const employment_type_id = user?.employment_type_id;

  const {
    data: leaveQuotas = [],
    isLoading: quotasLoading,
    error: quotasError,
    refresh: refreshQuotas,
  } = useEmployeeLeaveQuota(employeeId);

  // employment type
  const { data: empType } = useEmploymentTypesById(employment_type_id);
  const [allowCurrentLeaveDate, setAllowCurrentLeaveDate] = useState(null);

  useEffect(() => {
    if (empType) {
      setAllowCurrentLeaveDate(Boolean(empType.allow_current_leave_date));
    }
  }, [empType]);

  // compute min start date (today or tomorrow) based on the flag
  const today = new Date();
  const todayStr = toYMD(today);
  const tomorrowStr = toYMD(addDays(today, 1));
  const minStartDate = allowCurrentLeaveDate ? todayStr : tomorrowStr;

  const defaultValues = {
    leave_type: null,
    leave_type_id: null,
    start_date: "", // will be coerced to minStartDate if new form
    end_date: "",
    is_start_half_day: false,
    is_end_half_day: false,
    vacation_phone_no: "",
    replacement_employee_id: null,
    attachment_path: null,
    reason: "",
  };

  const [initialValuesState, setInitialValues] = useState(defaultValues);
  const [applicantEmployee, setApplicantEmployee] = useState({});
  const [replacementEmployee, setReplacementEmployee] = useState({});

  // seed from edit row or use defaults
  useEffect(() => {
    let isCancelled = false;

    const fetchEmployee = async () => {
      if (id && leaveData && leaveData.length > 0) {
        const row = leaveData.find((l) => l.id === id);
        if (isViewOnly && row?.replacement_employee_id) {
          const { data, error } = await supabase
            .from("employees")
            .select(
              `
            id,
            employee_code,
            candidate_id,
            created_at,
            candidates:candidates!employees_candidate_id_fkey(
              first_name,
              second_name,
              third_name,
              forth_name,
              family_name
            ),
            organizational_unit_id
          `
            )
            .eq("id", row.replacement_employee_id);

          if (!error && data?.[0] && !isCancelled) {
            setReplacementEmployee(data[0]);
          }
        }

        if (row && !isCancelled) {
          const employee = row?.employee?.candidate || {};
          setApplicantEmployee({...employee, employee_code: row.employee?.employee_code || ""});
          setInitialValues({
            leave_type_id: isViewOnly
              ? row.leave_type_id
              : row.leave_quota_id || null,
            leave_type: row.leave_type || null,
            start_date: row.start_date || "",
            end_date: row.end_date || "",
            is_start_half_day: row.is_start_half_day || false,
            is_end_half_day: row.is_end_half_day || false,
            vacation_phone_no: row.vacation_phone_no || "",
            replacement_employee_id: row.replacement_employee_id || null,
            attachment_path: row.attachment_path || null,
            reason: row.reason || "",
          });
        }
      } else if (!isCancelled) {
        setInitialValues(defaultValues);
      }
    };

    fetchEmployee();

    return () => {
      isCancelled = true;
    };
  }, [id, leaveData, isViewOnly, allowCurrentLeaveDate]);
  // >>>>>>> 43deb8aa2ed2c0ddca9cae3959a6f892a50547cc

  useEffect(() => {
    if (!departmentEmployees || departmentEmployees.length === 0) {
      setInitialValues((prev) => ({
        ...prev,
        replacement_employee_id: null,
      }));
    }
  }, [departmentEmployees]);

  const handleDownload = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = ""; // let browser pick the filename
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Leave limit check logic ---
  const checkLeaveLimit = (values) => {
    const selectedQuota = leaveQuotas.find(
      (q) => (q.id || q.leave_type_id) === values.leave_type_id
    );
    if (!selectedQuota || !selectedQuota.leave_type) return "";

    const allowed = selectedQuota.leave_type.days_allowed || 0;
    const availed = selectedQuota.availed_leaves || 0;
    const remaining = allowed - availed;

    if (remaining <= 0) {
      return `You have no remaining days for ${selectedQuota.leave_type.name}. Allowed: ${allowed}, Availed: ${availed}, Remaining: 0`;
    }

    // Calculate requested days (plain JS)
    let requestedDays = 0;
    if (values.start_date && values.end_date) {
      const start = new Date(values.start_date);
      const end = new Date(values.end_date);
      if (!isNaN(start) && !isNaN(end)) {
        requestedDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    if (requestedDays > remaining) {
      return `You have exceeded your allowed leave days for ${selectedQuota.leave_type.name}. Allowed: ${allowed}, Availed: ${availed}, Requested: ${requestedDays}`;
    }
    return "";
  };

  // console.log(values);
  return (
    <Modal
      onClose={onClose}
      title={id ? "Edit Leave Request" : "New Leave Request"}
      open={open}
    >
      <div className="flex flex-col">
        {/* End Leave Quota Summary */}
        <Formik
          enableReinitialize
          initialValues={initialValuesState}
          validationSchema={leaveValidationSchema}
          validateOnChange={false}
          onSubmit={(values, { setSubmitting }) => {
            handleSubmit(values, { setSubmitting });
          }}
        >
          {({ isSubmitting, values, ...formikProps }) => {
            const message = checkLeaveLimit(values);
            const disableSubmit = Boolean(message);
            return (
              <Form className="flex-1 overflow-y-auto space-y-6">
                {message && (
                  <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-center font-semibold">
                    {message}
                  </div>
                )}

                {isViewOnly && (
                  <>
                    <FormikInputField
                      name="employee"
                      label="Leave Type"
                      type="text"
                      value={values.leave_type || "N/A"}
                      disabled={true}
                    />

                    {!ownView && (
                      <FormikInputField
                        name="employee"
                        label="Employee Name"
                        type="text"
                        value={`${applicantEmployee?.employee_code || ""} - ${
                          applicantEmployee?.first_name || ""
                        } ${applicantEmployee?.second_name || ""} ${
                          applicantEmployee?.third_name || ""
                        } ${applicantEmployee?.forth_name || ""} ${
                          applicantEmployee?.family_name || ""
                        }`}
                        disabled={true}
                      />
                    )}

                    <FormikInputField
                      name="replacement"
                      label="Replacement Employee"
                      type="text"
                      value={`${replacementEmployee.employee_code || ""} - ${
                        replacementEmployee.candidates?.first_name || ""
                      } ${replacementEmployee.candidates?.second_name || ""} ${
                        replacementEmployee.candidates?.third_name || ""
                      } ${replacementEmployee.candidates?.forth_name || ""} ${
                        replacementEmployee.candidates?.family_name || ""
                      }`}
                      disabled={true}
                    />
                  </>
                )}

                {!isViewOnly && (
                  <FormikSelectField
                    name="leave_type_id"
                    label="Select Leave Type"
                    options={leaveQuotas?.map((q) => ({
                      label: q.leave_type
                        ? q.leave_type.name
                        : `Unknown leave type (id: ${q.leave_type_id})`,
                      value: q.id,
                      leaveType: q.leave_type ? q.leave_type.type : undefined,
                    }))}
                    placeholder="Select Leave Type"
                    required
                    onChange={(value) => {
                      const selectedQuota = leaveQuotas?.find(
                        (q) => q.id === value
                      );
                      if (selectedQuota) {
                        if (selectedQuota.leave_type) {
                          formikProps.setFieldValue(
                            "leave_type",
                            selectedQuota.leave_type.name
                          );
                        } else {
                          formikProps.setFieldValue("leave_type", "Unknown");
                        }
                        formikProps.setFieldValue("leave_type_id", value);
                      }
                    }}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormikInputField
                    name="start_date"
                    label="Start Date"
                    type="date"
                    min={minStartDate || undefined}
                    max="2100-12-31"
                    disabled={isViewOnly}
                  />
                  <FormikInputField
                    name="end_date"
                    label="End Date"
                    type="date"
                    max="2100-12-31"
                    disabled={isViewOnly}
                  />
                  {/* <FormikInputField
                    name="is_start_half_day"
                    label="Is Start Half Day?"
                    type="checkbox"
                  />
                  <FormikInputField
                    name="is_end_half_day"
                    label="Is End Half Day?"
                    type="checkbox"
                  /> */}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">
                    Vacation Phone Number
                    {values.leave_type === "Annual Leave" && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <Field name="vacation_phone_no">
                    {({ field, form, meta }) => (
                      <div>
                        <PhoneInput
                          country={"sa"}
                          value={field.value || ""}
                          onChange={(value) =>
                            form.setFieldValue("vacation_phone_no", value || "")
                          }
                          inputClass="!w-full !pl-10 !text-md"
                          inputStyle={{
                            width: "100%",
                            height: "48px",
                            borderTopLeftRadius: "0.5rem",
                            borderBottomLeftRadius: "0.5rem",
                          }}
                          buttonStyle={{
                            height: "48px",
                            minHeight: "48px",
                            alignItems: "center",
                            borderTopLeftRadius: "0.5rem",
                            borderBottomLeftRadius: "0.5rem",
                          }}
                          enableSearch
                          specialLabel=""
                          disabled={isViewOnly}
                        />
                        {meta.touched && meta.error && (
                          <div className="text-red-500 text-sm mt-1">
                            {meta.error}
                          </div>
                        )}
                      </div>
                    )}
                  </Field>
                </div>

                {/* <FormikInputField
                  name="email"
                  label="Your Email"
                  required={values.leave_type === "Annual Leave"}
                /> */}

                {!isViewOnly && (
                  <FormikSelectField
                    name="replacement_employee_id"
                    label="Replacement Employee"
                    options={departmentEmployees || []}
                    placeholder="Select Replacement Employee"
                    required={values.leave_type != "Sick Leave"}
                  />
                )}

                <FormikInputField name="reason" label="Reason" rows={4} />

                {isViewOnly ? (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDownload(values?.attachment_path)}
                    >
                      Download Attachment
                    </Button>
                  </>
                ) : (
                  <FileUploadField
                    name="attachment_path"
                    label="Upload File"
                    required={values.leave_type != "Sick Leave"}
                  />
                )}

                <div className="mt-4 border-t p-4 flex justify-end space-x-2 bg-white">
                  <SubmitButton
                    variant="outlined"
                    title="Close"
                    type="button"
                    onClick={onClose}
                  />
                  {!isViewOnly && (
                    <SubmitButton
                      title={id ? "Update Request" : "Send Request"}
                      type="submit"
                      isLoading={isSubmitting || loading}
                      disabled={isSubmitting || disableSubmit}
                    />
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>

        {/* Leave Quota Summary */}
        {!isViewOnly && (
          <>
            {leaveQuotas.length !== 0 ? (
              <div className="mb-4">
                <div className="font-semibold mb-2">Your Leave Quotas</div>
                <CustomTable
                  headers={["Leave Type", "Allowed", "Availed", "Remaining"]}
                  data={leaveQuotas.map((q) => ({
                    "Leave Type": q.leave_type
                      ? q.leave_type.name
                      : `Unknown (id: ${q.leave_type_id})`,
                    Allowed: q.leave_type?.days_allowed ?? "-",
                    Availed: q.availed_leaves ?? "-",
                    Remaining:
                      (q.leave_type?.days_allowed ?? 0) -
                      (q.availed_leaves ?? 0),
                  }))}
                  showCheckbox={false}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center">
                <h1>You don't have any Leaves Qouta</h1>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default NewLeaveRequestForm;

// import React, { useEffect, useState } from "react";
// import { Formik, Form, Field } from "formik";
// import leaveValidationSchema from "../../../../utils/validations/leaveValidation";
// import FormikInputField from "../../../../components/common/FormikInputField";
// import FormikSelectField from "../../../../components/common/FormikSelectField";
// import Modal from "../../../../components/common/Modal";
// import SubmitButton from "../../../../components/common/SubmitButton";
// import FileUploadField from "../../../../components/common/FormikFileUpload";
// import { useUser } from "../../../../context/UserContext";
// import { useEmployeeLeaveQuota } from "../../../../utils/hooks/api/useEmployeeLeaveQuota";
// import CustomTable from "../../../../components/tables/customeTable";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import { useEmploymentTypesById } from "../../../../utils/hooks/api/employmentType";

// // --- small helpers ---
// const toYMD = (d) =>
//   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//     d.getDate()
//   ).padStart(2, "0")}`;
// const addDays = (d, n) => {
//   const x = new Date(d);
//   x.setDate(x.getDate() + n);
//   return x;
// };

// const NewLeaveRequestForm = ({
//   onClose,
//   open,
//   id,
//   leaveData,
//   handleSubmit,
//   loading,
//   departmentEmployees,
// }) => {
//   const { user } = useUser();
//   const employeeId = user?.id;
//   const employment_type_id = user?.employment_type_id;

//   // quotas
//   const {
//     data: leaveQuotas = [],
//     isLoading: quotasLoading,
//     error: quotasError,
//     refresh: refreshQuotas,
//   } = useEmployeeLeaveQuota(employeeId);

//   // employment type
//   const { data: empType } = useEmploymentTypesById(employment_type_id);
//   const [allowCurrentLeaveDate, setAllowCurrentLeaveDate] = useState(null);

//   useEffect(() => {
//     if (empType) {
//       setAllowCurrentLeaveDate(Boolean(empType.allow_current_leave_date));
//     }
//   }, [empType]);

//   // compute min start date (today or tomorrow) based on the flag
//   const today = new Date();
//   const todayStr = toYMD(today);
//   const tomorrowStr = toYMD(addDays(today, 1));
//   const minStartDate = allowCurrentLeaveDate ? todayStr : tomorrowStr;

//   const defaultValues = {
//     leave_type: null,
//     leave_type_id: null,
//     start_date: "", // will be coerced to minStartDate if new form
//     end_date: "",
//     is_start_half_day: false,
//     is_end_half_day: false,
//     vacation_phone_no: "",
//     replacement_employee_id: null,
//     attachment_path: null,
//     reason: "",
//   };

//   // initial values (edit/new)
//   const [initialValuesState, setInitialValues] = useState(defaultValues);

//   // seed from edit row or use defaults
//   useEffect(() => {
//     if (id && leaveData?.length) {
//       const row = leaveData.find((l) => l.id === id);
//       if (row) {
//         setInitialValues({
//           leave_type_id: row.leave_quota_id,
//           leave_type: row.leave_type?.type || row.leave_type || null,
//           start_date: row.start_date || "",
//           end_date: row.end_date || "",
//           is_start_half_day: !!row.is_start_half_day,
//           is_end_half_day: !!row.is_end_half_day,
//           vacation_phone_no: row.vacation_phone_no || "",
//           replacement_employee_id: row.replacement_employee_id || null,
//           attachment_path: row.attachment_path || null,
//           reason: row.reason || "",
//         });
//       }
//     } else {
//       // for new request, default start_date to minStartDate once flag is known
//       setInitialValues((prev) => ({
//         ...defaultValues,
//         start_date: minStartDate || "", // if flag not yet loaded, will re-run once it is
//       }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, leaveData, allowCurrentLeaveDate]); // re-evaluate when flag changes for new forms

//   // if dept employees list is empty, clear replacement
//   useEffect(() => {
//     if (!departmentEmployees?.length) {
//       setInitialValues((prev) => ({ ...prev, replacement_employee_id: null }));
//     }
//   }, [departmentEmployees]);

//   // --- Leave limit check logic (unchanged) ---
//   const checkLeaveLimit = (values) => {
//     const selectedQuota = leaveQuotas.find(
//       (q) => (q.id || q.leave_type_id) === values.leave_type_id
//     );
//     if (!selectedQuota || !selectedQuota.leave_type) return "";

//     const allowed = selectedQuota.leave_type.days_allowed || 0;
//     const availed = selectedQuota.availed_leaves || 0;
//     const remaining = allowed - availed;

//     if (remaining <= 0) {
//       return `You have no remaining days for ${
//         selectedQuota.leave_type.name
//       }. Allowed: ${allowed}, Availed: ${availed}, Remaining: 0`;
//     }

//     // Calculate requested days (inclusive)
//     let requestedDays = 0;
//     if (values.start_date && values.end_date) {
//       const start = new Date(values.start_date);
//       const end = new Date(values.end_date);
//       if (!isNaN(start) && !isNaN(end)) {
//         requestedDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
//       }
//     }

//     if (requestedDays > remaining) {
//       return `You have exceeded your allowed leave days for ${
//         selectedQuota.leave_type.name
//       }. Allowed: ${allowed}, Availed: ${availed}, Requested: ${requestedDays}`;
//     }
//     return "";
//   };

//   return (
//     <Modal
//       onClose={onClose}
//       title={id ? "Edit Leave Request" : "New Leave Request"}
//       open={open}
//     >
//       <div className="flex flex-col">
//         <Formik
//           enableReinitialize
//           initialValues={initialValuesState}
//           validationSchema={leaveValidationSchema}
//           validateOnChange={false} // validate on submit only
//           onSubmit={(values, { setSubmitting }) => {
//             // optional: coerce start date to min if user hacked UI
//             if (minStartDate && values.start_date < minStartDate) {
//               values.start_date = minStartDate;
//             }
//             handleSubmit(values, { setSubmitting });
//           }}
//         >
//           {({ isSubmitting, values, setFieldValue, ...formikProps }) => {
//             // enforce min dates dynamically
//             useEffect(() => {
//               // if new form and start_date is empty or before min, set to min
//               if (!id && minStartDate) {
//                 if (!values.start_date || values.start_date < minStartDate) {
//                   setFieldValue("start_date", minStartDate, false);
//                 }
//               }
//               // keep end_date >= start_date
//               if (
//                 values.end_date &&
//                 values.start_date &&
//                 values.end_date < values.start_date
//               ) {
//                 setFieldValue("end_date", values.start_date, false);
//               }
//               // eslint-disable-next-line react-hooks/exhaustive-deps
//             }, [minStartDate, values.start_date]);

//             const message = checkLeaveLimit(values);
//             const disableSubmit = Boolean(message);

//             return (
//               <Form className="flex-1 overflow-y-auto space-y-6">
//                 {message && (
//                   <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-center font-semibold">
//                     {message}
//                   </div>
//                 )}

//                 <FormikSelectField
//                   name="leave_type_id"
//                   label="Select Leave Type"
//                   options={leaveQuotas?.map((q) => ({
//                     label: q.leave_type
//                       ? q.leave_type.name
//                       : `Unknown leave type (id: ${q.leave_type_id})`,
//                     value: q.id,
//                     leaveType: q.leave_type ? q.leave_type.type : undefined,
//                   }))}
//                   placeholder="Select Leave Type"
//                   required
//                   onChange={(value) => {
//                     const selectedQuota = leaveQuotas?.find(
//                       (q) => q.id === value
//                     );
//                     if (selectedQuota) {
//                       setFieldValue(
//                         "leave_type",
//                         selectedQuota.leave_type
//                           ? selectedQuota.leave_type.name
//                           : "Unknown",
//                         false
//                       );
//                       setFieldValue("leave_type_id", value, false);
//                     }
//                   }}
//                 />

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <FormikInputField
//                     name="start_date"
//                     label={`Start Date${
//                       allowCurrentLeaveDate === false ? " (from tomorrow)" : ""
//                     }`}
//                     type="date"
//                     min={minStartDate || undefined}
//                     max="2100-12-31"
//                     onChange={(e) => {
//                       const next = e?.target?.value;
//                       // clamp to minStartDate on change
//                       const clamped =
//                         minStartDate && next < minStartDate
//                           ? minStartDate
//                           : next;
//                       setFieldValue("start_date", clamped, false);
//                       // also ensure end_date >= start_date
//                       if (values.end_date && values.end_date < clamped) {
//                         setFieldValue("end_date", clamped, false);
//                       }
//                     }}
//                   />
//                   <FormikInputField
//                     name="end_date"
//                     label="End Date"
//                     type="date"
//                     min={values.start_date || minStartDate || undefined}
//                     max="2100-12-31"
//                     onChange={(e) => {
//                       const next = e?.target?.value;
//                       const minEnd = values.start_date || minStartDate;
//                       const clamped =
//                         minEnd && next < minEnd ? minEnd : next;
//                       setFieldValue("end_date", clamped, false);
//                     }}
//                   />
//                 </div>

//                 <div className="flex flex-col">
//                   <label className="text-sm font-medium">
//                     Vacation Phone Number
//                     {values.leave_type === "Annual Leave" && (
//                       <span className="text-red-500 ml-1">*</span>
//                     )}
//                   </label>
//                   <Field name="vacation_phone_no">
//                     {({ field, form, meta }) => (
//                       <div>
//                         <PhoneInput
//                           country={"sa"}
//                           value={field.value || ""}
//                           onChange={(value) =>
//                             form.setFieldValue("vacation_phone_no", value || "")
//                           }
//                           inputClass="!w-full !pl-10 !text-md"
//                           inputStyle={{
//                             width: "100%",
//                             height: "48px",
//                             borderTopLeftRadius: "0.5rem",
//                             borderBottomLeftRadius: "0.5rem",
//                           }}
//                           buttonStyle={{
//                             height: "48px",
//                             minHeight: "48px",
//                             alignItems: "center",
//                             borderTopLeftRadius: "0.5rem",
//                             borderBottomLeftRadius: "0.5rem",
//                           }}
//                           enableSearch
//                           specialLabel=""
//                         />
//                         {meta.touched && meta.error && (
//                           <div className="text-red-500 text-sm mt-1">
//                             {meta.error}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </Field>
//                 </div>

//                 <FormikSelectField
//                   name="replacement_employee_id"
//                   label="Replacement Employee"
//                   options={departmentEmployees || []}
//                   placeholder="Select Replacement Employee"
//                   required={values.leave_type !== "Sick Leave"}
//                 />

//                 <FormikInputField name="reason" label="Reason" rows={4} />

//                 <FileUploadField
//                   name="attachment_path"
//                   label="Upload File"
//                   required={values.leave_type !== "Sick Leave"}
//                 />

//                 <div className="mt-4 border-t p-4 flex justify-end space-x-2 bg-white">
//                   <SubmitButton
//                     variant="outlined"
//                     title="Close"
//                     type="button"
//                     onClick={onClose}
//                   />
//                   <SubmitButton
//                     title={id ? "Update Request" : "Send Request"}
//                     type="submit"
//                     isLoading={isSubmitting || loading}
//                     disabled={isSubmitting || Boolean(message)}
//                   />
//                 </div>
//               </Form>
//             );
//           }}
//         </Formik>

//         {/* Leave Quota Summary */}
//         {leaveQuotas.length !== 0 ? (
//           <div className="mb-4">
//             <div className="font-semibold mb-2">Your Leave Quotas</div>
//             <CustomTable
//               headers={["Leave Type", "Allowed", "Availed", "Remaining"]}
//               data={leaveQuotas.map((q) => ({
//                 "Leave Type": q.leave_type
//                   ? q.leave_type.name
//                   : `Unknown (id: ${q.leave_type_id})`,
//                 Allowed: q.leave_type?.days_allowed ?? "-",
//                 Availed: q.availed_leaves ?? "-",
//                 Remaining:
//                   (q.leave_type?.days_allowed ?? 0) - (q.availed_leaves ?? 0),
//               }))}
//               showCheckbox={false}
//             />
//           </div>
//         ) : (
//           <div className="flex justify-center items-center">
//             <h1>You don't have any Leaves Qouta</h1>
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default NewLeaveRequestForm;
