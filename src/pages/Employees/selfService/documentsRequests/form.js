import React, { useEffect, useState } from "react";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { DOCUMENT_TYPES } from "../../../../utils/constants";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { useEmployeesForDropdown } from "../../../../utils/hooks/api/companyInfo";
import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
import { Button } from "@mui/material";
import { useUser } from "../../../../context/UserContext";


const fees_options = [
  { value: "self_paid", label: "I have paid from my pocket" },
  { value: "mrna_paid", label: "Mrna to pay" },
];

// Build schema with access to annualLeaveData
const buildValidationSchema = (annualLeaveData) =>
  Yup.object().shape({
    document_type: Yup.string()
      .required("Document type is required")
      .test(
        "annual-leave-eligibility",
        // Message replaced below when failing a specific check
        "Not eligible to create Annual Leave Flight request.",
        function (docType) {
          if (docType !== "annual_leave_flight") return true;

          // Guard: data must exist
          if (!annualLeaveData) {
            return this.createError({
              path: "document_type",
              message:
                "Annual leave data not found. Please select a leave first.",
            });
          }

          const leave = Array.isArray(annualLeaveData) ? annualLeaveData[0] : annualLeaveData;


          const {
            is_manager_approve,
            is_hod_approve,
            is_hr_approve,
            is_hr_manager_approve,
            start_date,
            end_date,
          } = leave || {};

          // All three approvals must be 'approved'
          const approvalsOk =
            String(is_manager_approve) === "approved" &&
            String(is_hod_approve) === "approved" &&
            String(is_hr_approve) === "approved" &&
            String(is_hr_manager_approve) === "approved";
            

          if (!approvalsOk) {
            return this.createError({
              path: "document_type",
              message:
                "Annual leave must be approved before requesting this leave.",
            });
          }

          // Date diff should be greater than 11 days
          if (!start_date || !end_date) {
            return this.createError({
              path: "document_type",
              message:
                "Annual leave start and end dates are missing in annual leave record.",
            });
          }

          let diffDays;
          try {
            const s = parseISO(String(start_date));
            const e = parseISO(String(end_date));
            diffDays = differenceInCalendarDays(e, s);
          } catch {
            return this.createError({
              path: "document_type",
              message:
                "Invalid annual leave dates format. Expected YYYY-MM-DD.",
            });
          }

          if (!(diffDays > 11)) {
            return this.createError({
              path: "document_type",
              message:
                "Annual leave duration must be 12 days or above.",
            });
          }

          return true;
        }
      ),

    custom_title: Yup.string().required("Title is required"),
    custom_details: Yup.string()
      .test(
        "no-spaces",
        "Spaces are not allowed",
        (value) => !value || value.trim().length > 0
      )
      .required("Details are required"),
    file_path: Yup.string().notRequired("Attachment is required"),
    salary_certificate_joining_date: Yup.date().when("document_type", {
      is: "salary_certificate",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),

    bank_commitment_adressed_to_whome: Yup.string().when("document_type", {
      is: "bank_commitment",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),

    bank_transfer_request_attached_new_iban: Yup.string().when(
      "document_type",
      {
        is: "bank_transfer_request",
        then: (s) => s.required("Required"),
        otherwise: (s) => s.nullable(),
      }
    ),
    bank_transfer_request_bank_name: Yup.string().when("document_type", {
      is: "bank_transfer_request",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    bank_transfer_request_clearance_certificate_from_old_bank: Yup.string().when(
      "document_type",
      {
        is: "bank_transfer_request",
        then: (s) => s.required("Required"),
        otherwise: (s) => s.nullable(),
      }
    ),

    annual_leave_flight_destination: Yup.string().when("document_type", {
      is: "annual_leave_flight",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    annual_leave_flight_departure_date: Yup.date().when("document_type", {
      is: "annual_leave_flight",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    annual_leave_flight_returning_date: Yup.date().when("document_type", {
      is: "annual_leave_flight",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    annual_leave_flight_passport_softcopy: Yup.string().when("document_type", {
      is: "annual_leave_flight",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),

    family_flight_ticket_destination: Yup.string().when("document_type", {
      is: "family_flight_ticket",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    family_flight_ticket_departure_date: Yup.date().when("document_type", {
      is: "family_flight_ticket",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    family_flight_ticket_return_date: Yup.date().when("document_type", {
      is: "family_flight_ticket",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    family_flight_ticket_passport_softcopy: Yup.string().when("document_type", {
      is: "family_flight_ticket",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),

    business_trip_destination: Yup.string().when("document_type", {
      is: "business_trip",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    business_trip_departure_date: Yup.date().when("document_type", {
      is: "business_trip",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    business_trip_return_date: Yup.date().when("document_type", {
      is: "business_trip",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    business_trip_passwort_softcopy: Yup.string().when("document_type", {
      is: "business_trip",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),

    chamber_of_commerce_attachment: Yup.string().when("document_type", {
      is: "chamber_of_commerce",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    chamber_of_commerce_to_whome: Yup.string().when("document_type", {
      is: "chamber_of_commerce",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    chamber_of_commerce_subject: Yup.string().when("document_type", {
      is: "chamber_of_commerce",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),

    exit_re_entry_visa_type: Yup.string().when("document_type", {
      is: "exit_re_entry_visa",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    exit_re_entry_visa_duration: Yup.number().when("document_type", {
      is: "exit_re_entry_visa",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    fees_paid_by: Yup.string().when("document_type", {
      is: "exit_re_entry_visa",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    exit_re_entry_visa_start_date: Yup.date().when("document_type", {
      is: "exit_re_entry_visa",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    exit_re_entry_visa_end_date: Yup.date().when("document_type", {
      is: "exit_re_entry_visa",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    exit_re_entry_visa_fees_paid: Yup.number().when("document_type", {
      is: "exit_re_entry_visa",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),

    course_request_name: Yup.string().when("document_type", {
      is: "course_request",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    course_request_institute_name: Yup.string().when("document_type", {
      is: "course_request",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    course_request_start_date: Yup.date().when("document_type", {
      is: "course_request",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    course_request_end_date: Yup.date().when("document_type", {
      is: "course_request",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    course_request_location: Yup.string().when("document_type", {
      is: "course_request",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    course_request_course_fees: Yup.number().when("document_type", {
      is: "course_request",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),

    dependents_fees_request_dependants_count: Yup.number().when(
      "document_type",
      {
        is: "dependents_fees_request",
        then: (s) => s.required("Required"),
        otherwise: (s) => s.nullable(),
      }
    ),
    dependents_fees_request_dependants_ids: Yup.array().when("document_type", {
      is: "dependents_fees_request",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),

    candidate_check_name: Yup.string().when("document_type", {
      is: "candidate_check",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    candidate_check_id_no: Yup.string().when("document_type", {
      is: "candidate_check",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    candidate_check_sima_check: Yup.string().when("document_type", {
      is: "candidate_check",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
    candidate_check_id_softcopy: Yup.string().when("document_type", {
      is: "candidate_check",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.nullable(),
    }),
  });

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const NewDocumentForm = ({
  onClose,
  open,
  onSubmit = () => {},
  editDoc,
  loading,
  isViewOnly = false,
  resData = null,
  setResData,
  annualLeaveData, // used for annual_leave_flight eligibility checks
}) => {
  const disabledAll = isViewOnly;
  const today = format(new Date(), "yyyy-MM-dd");
  const { employees, loading: employeesLoading } = useEmployeesForDropdown();

    const { user } = useUser();


  const handleDownload = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const employeeOptions = (employees || []).map((emp) => ({
    label:
      `${emp.candidate?.first_name || ""} ${
        emp.candidate?.family_name || ""
      }`.trim() || `Employee #${emp.id}`,
    value: Number(emp.id),
  }));

  const initialValues = {
    custom_title: editDoc?.custom_title || resData?.custom_title || "",
    custom_details: editDoc?.custom_details || resData?.custom_details || "",
    file_name: editDoc?.file_name || resData?.file_name || "",
    file_path: editDoc?.file_path || resData?.file_path || "",
    document_type: editDoc?.document_type || resData?.document_type || "",
    created_on: resData ? resData?.created_on : today,

    salary_certificate_adressed_to_whome:
      editDoc?.salary_certificate_adressed_to_whome ??
      resData?.salary_certificate_adressed_to_whome ??
      null,
    salary_certificate_salary_details:
      editDoc?.salary_certificate_salary_details ??
      resData?.salary_certificate_salary_details ??
      null,
    salary_certificate_employee_name:
      editDoc?.salary_certificate_employee_name ??
      resData?.salary_certificate_employee_name ??
      null,
    salary_certificate_joining_date:
      editDoc?.salary_certificate_joining_date ??
      resData?.salary_certificate_joining_date ??
      null,
    salary_certificate_position_title:
      editDoc?.salary_certificate_position_title ??
      resData?.salary_certificate_position_title ??
      null,

    bank_commitment_adressed_to_whome:
      editDoc?.bank_commitment_adressed_to_whome ??
      resData?.bank_commitment_adressed_to_whome ??
      null,

    bank_transfer_request_attached_new_iban:
      editDoc?.bank_transfer_request_attached_new_iban ??
      resData?.bank_transfer_request_attached_new_iban ??
      null,
    bank_transfer_request_bank_name:
      editDoc?.bank_transfer_request_bank_name ??
      resData?.bank_transfer_request_bank_name ??
      null,
    bank_transfer_request_clearance_certificate_from_old_bank:
      editDoc?.bank_transfer_request_clearance_certificate_from_old_bank ??
      resData?.bank_transfer_request_clearance_certificate_from_old_bank ??
      null,

    annual_leave_flight_destination:
      editDoc?.annual_leave_flight_destination ??
      resData?.annual_leave_flight_destination ??
      null,
    annual_leave_flight_departure_date:
      editDoc?.annual_leave_flight_departure_date ??
      resData?.annual_leave_flight_departure_date ??
      null,
    annual_leave_flight_returning_date:
      editDoc?.annual_leave_flight_returning_date ??
      resData?.annual_leave_flight_returning_date ??
      null,
    annual_leave_flight_passport_softcopy:
      editDoc?.annual_leave_flight_passport_softcopy ??
      resData?.annual_leave_flight_passport_softcopy ??
      null,

    family_flight_ticket_destination:
      editDoc?.family_flight_ticket_destination ??
      resData?.family_flight_ticket_destination ??
      null,
    family_flight_ticket_departure_date:
      editDoc?.family_flight_ticket_departure_date ??
      resData?.family_flight_ticket_departure_date ??
      null,
    family_flight_ticket_return_date:
      editDoc?.family_flight_ticket_return_date ??
      resData?.family_flight_ticket_return_date ??
      null,
    family_flight_ticket_passport_softcopy:
      editDoc?.family_flight_ticket_passport_softcopy ??
      resData?.family_flight_ticket_passport_softcopy ??
      null,
    family_flight_ticket_dependants_names:
      editDoc?.family_flight_ticket_dependants_names ??
      resData?.family_flight_ticket_dependants_names ??
      null,

    business_trip_destination:
      editDoc?.business_trip_destination ??
      resData?.business_trip_destination ??
      null,
    business_trip_departure_date:
      editDoc?.business_trip_departure_date ??
      resData?.business_trip_departure_date ??
      null,
    business_trip_return_date:
      editDoc?.business_trip_return_date ??
      resData?.business_trip_return_date ??
      null,
    business_trip_prefered_time:
      editDoc?.business_trip_prefered_time ??
      resData?.business_trip_prefered_time ??
      null,
    business_trip_passwort_softcopy:
      editDoc?.business_trip_passwort_softcopy ??
      resData?.business_trip_passwort_softcopy ??
      null,

    chamber_of_commerce_attachment:
      editDoc?.chamber_of_commerce_attachment ??
      resData?.chamber_of_commerce_attachment ??
      null,
    chamber_of_commerce_to_whome:
      editDoc?.chamber_of_commerce_to_whome ??
      resData?.chamber_of_commerce_to_whome ??
      null,
    chamber_of_commerce_subject:
      editDoc?.chamber_of_commerce_subject ??
      resData?.chamber_of_commerce_subject ??
      null,

    exit_re_entry_visa_type:
      editDoc?.exit_re_entry_visa_type ?? resData?.exit_re_entry_visa_type ?? null,
    exit_re_entry_visa_duration:
      editDoc?.exit_re_entry_visa_duration ??
      resData?.exit_re_entry_visa_duration ??
      null,
    exit_re_entry_visa_start_date:
      editDoc?.exit_re_entry_visa_start_date ??
      resData?.exit_re_entry_visa_start_date ??
      null,
    exit_re_entry_visa_end_date:
      editDoc?.exit_re_entry_visa_end_date ??
      resData?.exit_re_entry_visa_end_date ??
      null,
    exit_re_entry_visa_fees_paid:
      editDoc?.exit_re_entry_visa_fees_paid ??
      resData?.exit_re_entry_visa_fees_paid ??
      null,
    fees_paid_by: editDoc?.fees_paid_by || resData?.fees_paid_by || "",

    course_request_name:
      editDoc?.course_request_name ?? resData?.course_request_name ?? null,
    course_request_institute_name:
      editDoc?.course_request_institute_name ??
      resData?.course_request_institute_name ??
      null,
    course_request_start_date:
      editDoc?.course_request_start_date ??
      resData?.course_request_start_date ??
      null,
    course_request_end_date:
      editDoc?.course_request_end_date ?? resData?.course_request_end_date ?? null,
    course_request_location:
      editDoc?.course_request_location ?? resData?.course_request_location ?? null,
    course_request_course_fees:
      editDoc?.course_request_course_fees ??
      resData?.course_request_course_fees ??
      null,

    dependents_fees_request_dependants_count:
      editDoc?.dependents_fees_request_dependants_count ??
      resData?.dependents_fees_request_dependants_count ??
      null,
    dependents_fees_request_dependants_ids:
      editDoc?.dependents_fees_request_dependants_ids ??
      resData?.dependents_fees_request_dependants_ids ??
      null,

    candidate_check_name:
      editDoc?.candidate_check_name ?? resData?.candidate_check_name ?? null,
    candidate_check_id_no:
      editDoc?.candidate_check_id_no ?? resData?.candidate_check_id_no ?? null,
    candidate_check_sima_check:
      editDoc?.candidate_check_sima_check ??
      resData?.candidate_check_sima_check ??
      null,
    candidate_check_id_softcopy:
      editDoc?.candidate_check_id_softcopy ??
      resData?.candidate_check_id_softcopy ??
      null,
  };

  return (
    <Modal onClose={onClose} title="New Document" open={open}>
      <div className="flex flex-col">
        <Formik
          initialValues={initialValues}
          validationSchema={buildValidationSchema(annualLeaveData)}
          enableReinitialize
          onSubmit={onSubmit}
          validate={async (values) => {
            try {
              await buildValidationSchema(annualLeaveData).validate(values, {
                abortEarly: false,
              });
            } catch (err) {
              if (err.inner && Array.isArray(err.inner)) {
                const errors = {};
                err.inner.forEach((error) => {
                  errors[error.path] = error.message;
                });
                return errors;
              }
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form
              className="flex-1 overflow-y-auto space-y-6"
              disabled={disabledAll && resData ? disabledAll : false}
            >
              <FormikSelectField
                name="document_type"
                label="Document Type"
                options={DOCUMENT_TYPES}
                required
                disabled={isViewOnly}
              />

              {/* salary_certificate */}
              {values.document_type === "salary_certificate" && (
                <>
                  <FormikInputField
                    name="salary_certificate_salary_details"
                    label="Total Salary"
                    value={user?.total_salary}
                    type="text"
                    disabled
                  />
                  <FormikInputField
                    name="salary_certificate_basic_salary"
                    label="Basic Salary"
                    value={user?.basic_salary}
                    type="text"
                     disabled
                  />
                  <FormikInputField
                    name="salary_certificate_house_allowance"
                    label="Transportation Allowance"
                    value={user?.transportation_allowance}
                    type="text"
                     disabled
                  />
                  <FormikInputField
                    name="salary_certificate_house_allowance"
                    label="Housing Allowance"
                    value={user?.housing_allowance}
                    type="text"
                     disabled
                  />
                  <FormikInputField
                    name="salary_certificate_joining_date"
                    label="Joining Date"
                    type="date"
                    required
                    max="2100-12-31"
                  />
                </>
              )}

              {/* bank_commitment */}
              {values.document_type === "bank_commitment" && (
                <FormikInputField
                  type="text"
                  name="bank_commitment_adressed_to_whome"
                  label="Bank Commitment Adressed To Whome"
                  required
                />
              )}

              {/* bank_transfer_request */}
              {values.document_type === "bank_transfer_request" && (
                <>
                  <FormikInputField
                    name="bank_transfer_request_attached_new_iban"
                    label="New IBAN"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="bank_transfer_request_bank_name"
                    label="Bank Name"
                    type="text"
                    required
                  />
                  {!isViewOnly ? (
                    <FileUploadField
                      name="bank_transfer_request_clearance_certificate_from_old_bank"
                      label="Clearance Certificate from Old Bank"
                      required
                    />
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleDownload(
                          resData?.bank_transfer_request_clearance_certificate_from_old_bank
                        )
                      }
                    >
                      Download Chamber Of Commerce Attachment
                    </Button>
                  )}
                </>
              )}

              {/* annual_leave_flight */}
              {values.document_type === "annual_leave_flight" && (
                <>
                  <FormikInputField
                    name="annual_leave_flight_destination"
                    label="Destination"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="annual_leave_flight_departure_date"
                    label="Departure Date"
                    type="date"
                    required
                    max="2100-12-31"
                    min={today}
                  />
                  <FormikInputField
                    name="annual_leave_flight_returning_date"
                    label="Returning Date"
                    type="date"
                    required
                    max="2100-12-31"
                    min={today}
                  />
                  <FileUploadField
                    name="annual_leave_flight_passport_softcopy"
                    label="Passport Softcopy"
                    required
                  />
                </>
              )}

              {/* family_flight_ticket */}
              {values.document_type === "family_flight_ticket" && (
                <>
                  <FormikInputField
                    name="family_flight_ticket_destination"
                    label="Destination"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="family_flight_ticket_departure_date"
                    label="Departure Date"
                    type="date"
                    required
                    max="2100-12-31"
                  />
                  <FormikInputField
                    name="family_flight_ticket_return_date"
                    label="Return Date"
                    type="date"
                    required
                    max="2100-12-31"
                  />
                  <FileUploadField
                    name="family_flight_ticket_passport_softcopy"
                    label="Passport Softcopy"
                    required
                  />
                  <FieldArray name="family_flight_ticket_dependants_names">
                    {(arrayHelpers) => (
                      <div>
                        <label className="text-xs sm:text-sm dark-color">
                          Dependants Names
                        </label>
                        {(values.family_flight_ticket_dependants_names || []).map(
                          (_name, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                              <FormikInputField
                                name={`family_flight_ticket_dependants_names.${idx}`}
                                type="text"
                                placeholder={`Dependant Name #${idx + 1}`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => arrayHelpers.remove(idx)}
                                className="text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          )
                        )}
                        <button
                          type="button"
                          onClick={() => arrayHelpers.push("")}
                          className="text-blue-500"
                        >
                          Add Dependant
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </>
              )}

              {/* business_trip */}
              {values.document_type === "business_trip" && (
                <>
                  <FormikInputField
                    name="business_trip_destination"
                    label="Destination"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="business_trip_departure_date"
                    label="Departure Date"
                    type="date"
                    required
                    max="2100-12-31"
                  />
                  <FormikInputField
                    name="business_trip_return_date"
                    label="Return Date"
                    type="date"
                    required
                    max="2100-12-31"
                  />
                  <FormikInputField
                    name="business_trip_prefered_time"
                    label="Preferred Time"
                    type="time"
                  />
                  <FileUploadField
                    name="business_trip_passwort_softcopy"
                    label="Passport Softcopy"
                    required
                  />
                </>
              )}

              {/* chamber_of_commerce */}
              {values.document_type === "chamber_of_commerce" && (
                <>
                  {!isViewOnly ? (
                    <FileUploadField
                      name="chamber_of_commerce_attachment"
                      label="Only Chamber Of Commerce Attachment"
                      required
                    />
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleDownload(resData?.chamber_of_commerce_attachment)
                      }
                    >
                      Download Chamber Of Commerce Attachment
                    </Button>
                  )}
                  <FormikInputField
                    name="chamber_of_commerce_to_whome"
                    label="Chamber Of Commerce To Whome"
                    selectKey="value"
                    required
                  />
                  <FormikInputField
                    name="chamber_of_commerce_subject"
                    label="Subject"
                    type="text"
                    required
                  />
                </>
              )}

              {/* exit_re_entry_visa */}
              {values.document_type === "exit_re_entry_visa" && (
                <>
                  <FormikInputField
                    name="exit_re_entry_visa_type"
                    label="Visa Type"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="exit_re_entry_visa_duration"
                    label="Visa Duration (In Months)"
                    type="number"
                    required
                  />
                  <FormikInputField
                    name="exit_re_entry_visa_start_date"
                    label="Start Date"
                    type="date"
                    required
                    max="2100-12-31"
                  />
                  <FormikInputField
                    name="exit_re_entry_visa_end_date"
                    label="End Date"
                    type="date"
                    required
                    max="2100-12-31"
                  />
                  <FormikInputField
                    name="exit_re_entry_visa_fees_paid"
                    label="Fees Paid"
                    type="number"
                    required
                  />
                  <FormikSelectField
                    name="fees_paid_by"
                    label="Fees paid by"
                    options={fees_options}
                    required
                    onChange={(value) => setFieldValue("fees_paid_by", value)}
                  />
                </>
              )}

              {/* course_request */}
              {values.document_type === "course_request" && (
                <>
                  <FormikInputField
                    name="course_request_name"
                    label="Course Name"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="course_request_institute_name"
                    label="Institute Name"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="course_request_start_date"
                    label="Start Date"
                    type="date"
                    required
                    max="2100-12-31"
                  />
                  <FormikInputField
                    name="course_request_end_date"
                    label="End Date"
                    type="date"
                    required
                    max="2100-12-31"
                  />
                  <FormikInputField
                    name="course_request_location"
                    label="Location"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="course_request_course_fees"
                    label="Course Fees"
                    type="number"
                    required
                  />
                </>
              )}

              {/* dependents_fees_request */}
              {values.document_type === "dependents_fees_request" && (
                <>
                  <FormikInputField
                    name="dependents_fees_request_dependants_count"
                    label="Dependants Count"
                    type="number"
                    required
                  />
                  <FormikMultiSelectField
                    name="dependents_fees_request_dependants_ids"
                    label="Dependants (Employees)"
                    options={employeeOptions}
                    selectKey="value"
                    getOptionLabel={(option) => option.label}
                    disabled={employeesLoading}
                    required
                  />
                </>
              )}

              {/* candidate_check */}
              {values.document_type === "candidate_check" && (
                <>
                  <FormikInputField
                    name="candidate_check_name"
                    label="Candidate Name"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="candidate_check_id_no"
                    label="ID No"
                    type="text"
                    required
                  />
                  <FormikInputField
                    name="candidate_check_sima_check"
                    label="SIMA Check"
                    type="text"
                    required
                  />
                  <FileUploadField
                    name="candidate_check_id_softcopy"
                    label="ID Softcopy"
                    required
                  />
                </>
              )}

              {/* Always-show fields */}
              <FormikInputField
                name="custom_title"
                label="Custom Title"
                type="text"
                required
              />
              <FormikInputField
                name="custom_details"
                label="Details"
                type="textarea"
                rows={4}
                required
              />
              {!isViewOnly ? (
                <FileUploadField name="file_path" label="Attachment" />
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleDownload(resData?.file_path)}
                >
                  Download Attachment
                </Button>
              )}

              <FormikInputField
                name="created_on"
                label="Created On"
                type="date"
                value={today}
                disabled
                InputProps={{ readOnly: true }}
                max="2100-12-31"
              />

              {!isViewOnly && (
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
              )}
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewDocumentForm;
