// import React, { useEffect, useState, useCallback } from "react";
// import { Formik, Form, useFormikContext } from "formik";
// import * as Yup from "yup";

// import { supabase } from "../../../../../supabaseClient";
// import JobOfferPDF from "../../../../../components/ContractsForms/OfferLetter";
// import { useUser } from "../../../../../context/UserContext";
// import FormikSelectField from "../../../../../components/common/FormikSelectField";
// import FormikInputField from "../../../../../components/common/FormikInputField";
// import SubmitButton from "../../../../../components/common/SubmitButton";
// import FormikRadioGroup from "../../../../../components/common/RadioGroup";

// import {
//   useGetManagers,
//   useOfferRequests,
// } from "../../../../../utils/hooks/api/useOfferRequests";
// import { useUpdateCandidate } from "../../../../../utils/hooks/api/candidates";

// const recommendationOptions = [
//   { label: "Suitable for recruitment", value: "suitable_now" },
//   { label: "Suitable in the future", value: "suitable_future" },
//   { label: "Rejected", value: "rejected" },
//   { label: "Direct Hire", value: "direct" },
// ];

// export const offerRequestValidationSchema = Yup.object().shape({
//   candidate_id: Yup.number().required("Candidate is required"),
//   salary: Yup.number()
//     .typeError("Salary must be a number")
//     .required("Salary is required")
//     .min(0, "Salary must be greater than zero"),
//   assignee_id: Yup.number().required("Assignee is required"),
// });

// const OfferRequestForm = () => {
//   const { user } = useUser();
//   const { createOfferRequest } = useOfferRequests();
//   const { updateCandidate, loading: updateLoading } = useUpdateCandidate();
//   const { managers, loading: managersLoading } = useGetManagers();

//   const [candidates, setCandidates] = useState([]);
//   const [candidatesLoading, setCandidatesLoading] = useState(false);

//   /**
//    * Fetch candidates based on selected hiring status
//    * - "direct" => candidates where hiring_status is NULL OR empty string
//    * - others  => candidates where hiring_status === selected value
//    * Always filter: offer_letter = 'not_generated', is_deleted = false, is_employee = false
//    */
//   const fetchCandidates = useCallback(async (statusValue) => {
//     setCandidatesLoading(true);
//     setCandidates([]); // clear to avoid stale options while loading

//     try {
//       let query = supabase
//         .from("candidates")
//         .select("*, vacancy:vacancy (id, title)")
//         .eq("offer_letter", "not_generated")
//         .eq("is_deleted", false)
//         .eq("is_employee", false);

//       if (statusValue === "direct") {
//         // match both NULL and empty string values
//         query = query.or("hiring_status.is.null,hiring_status.eq.");
//       } else {
//         query = query.eq("hiring_status", statusValue);
//       }

//       const { data, error } = await query;
//       if (error) throw error;
//       setCandidates(data || []);
//     } catch (err) {
//       console.error("Error fetching candidates:", err);
//       setCandidates([]);
//     } finally {
//       setCandidatesLoading(false);
//     }
//   }, []);

//   // Initial fetch for default radio (first option)
//   useEffect(() => {
//     fetchCandidates(recommendationOptions[0].value);
//   }, [fetchCandidates]);


  

//   return (
//     <div className="p-4 max-w-4xl mx-auto">
//       <h2 className="text-xl font-semibold mb-4">Create Offer Request</h2>

//       <Formik
//         initialValues={{
//           candidate_id: "",
//           hiring_status: recommendationOptions[0].value,
//           salary: "",
//           note_en: "",
//           note_ar: "",
//           assignee_id: "",
//         }}
//         validationSchema={offerRequestValidationSchema}
//         onSubmit={async (values, { resetForm, setSubmitting }) => {
//           try {
//             const element = document.getElementById("offer-pdf-preview");
//             const html2pdf = (await import("html2pdf.js")).default;

//             // 1) Generate PDF as Blob
//             const blob = await html2pdf().from(element).outputPdf("blob");

//             // 2) Upload to S3
//             const file = new File(
//               [blob],
//               `offer-${values.candidate_id}-${Date.now()}.pdf`,
//               { type: "application/pdf" }
//             );
//             const { uploadFile } = await import("../../../../../utils/s3");
//             const uploadedUrl = await uploadFile(file);

//             // 3) Build payload
//             const isHrManager = values?.assignee_id == 6;
//             const payload = {
//               ...values,
//               pdf_url: uploadedUrl,
//               status: isHrManager ? "pending_hr_manager" : "pending_manager",
//               is_manager_approve: !!isHrManager,
//               is_hr_manager_approve: false,
//               created_by: user?.id,
//               updated_by: user?.id,
//             };

//             delete payload.hiring_status; // remove if present

//             // 4) Create offer request
//             const success = await createOfferRequest(payload);

//             // 5) Mark candidate offer status
//             await updateCandidate(values.candidate_id, { offer_letter: "pending" });

//             if (success) resetForm();
//           } finally {
//             setSubmitting(false);
//           }
//         }}
//       >
//         {/* Child component with hooks at top level (no hooks inside callbacks) */}
//         <OfferRequestFields
//           candidates={candidates}
//           candidatesLoading={candidatesLoading}
//           fetchCandidates={fetchCandidates}
//           managers={managers}
//           managersLoading={managersLoading}
//         />
//       </Formik>
//     </div>
//   );
// };

// export default OfferRequestForm;

// /**
//  * Fields component that reacts to radio changes:
//  * - When hiring_status changes:
//  *   → reset candidate_id
//  *   → refetch candidates using the selected radio value
//  */
// const OfferRequestFields = ({
//   candidates,
//   candidatesLoading,
//   fetchCandidates,
//   managers,
//   managersLoading,
// }) => {
//   const { values, setFieldValue, isSubmitting } = useFormikContext();

//   // Watch radio change safely (top-level hook in a component)
//   useEffect(() => {
//     setFieldValue("candidate_id", "");
//     fetchCandidates(values.hiring_status);
//   }, [values.hiring_status, fetchCandidates, setFieldValue]);

//   const housingAllowance =
//     values.salary ? ((values.salary * 3) / 12).toFixed(2) : "";
//   const travelAllowance = values.salary ? (values.salary * 0.1).toFixed(2) : "";
//   const totalSalary =
//     values.salary
//       ? (
//           parseFloat(values.salary) +
//           parseFloat((values.salary * 3) / 12) +
//           parseFloat(values.salary * 0.1)
//         ).toFixed(2)
//       : "";

//   return (
//     <Form className="space-y-4">
//       {/* Radio drives candidate filter */}
//       <div>
//         <FormikRadioGroup name="hiring_status" options={recommendationOptions} />
//       </div>

//       {/* Candidate select (reset on radio change) */}
//       <div>
//         <FormikSelectField
//           as="select"
//           name="candidate_id"
//           className="w-full border p-2 rounded"
//           options={candidates}
//           selectKey="id"
//           label="Candidate"
//           getOptionLabel={(c) =>
//             `${c.first_name || ""} ${c.second_name || ""} ${c.third_name || ""} ${
//               c.forth_name || ""
//             } ${c.family_name || ""}`.trim()
//           }
//           disabled={candidatesLoading}
//           loading={candidatesLoading}
//           placeholder={candidatesLoading ? "Loading candidates..." : "Select a candidate"}
//         />
//       </div>

//       {/* Manager select */}
//       <div>
//         <FormikSelectField
//           as="select"
//           name="assignee_id"
//           className="w-full border p-2 rounded"
//           options={managers}
//           selectKey="id"
//           label="Approval Required From Manager"
//           getOptionLabel={(e) =>
//             `${e?.employee_code || ""} - ${e?.candidates?.full_name || ""}`
//           }
//           disabled={managersLoading}
//           loading={managersLoading}
//         />
//       </div>

//       {/* Compensation */}
//       <div>
//         <FormikInputField label="Basic Salary" name="salary" type="number" />
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label>Housing Allowance</label>
//           <input
//             value={housingAllowance}
//             disabled
//             className="w-full border p-2 rounded bg-gray-100"
//           />
//         </div>
//         <div>
//           <label>Travel Allowance</label>
//           <input
//             value={travelAllowance}
//             disabled
//             className="w-full border p-2 rounded bg-gray-100"
//           />
//         </div>
//         <div>
//           <label>Total Salary</label>
//           <input
//             value={totalSalary}
//             disabled
//             className="w-full border p-2 rounded bg-gray-100"
//           />
//         </div>
//       </div>

//       {/* Note */}
//       <div>
//         <FormikInputField label="Note" name="note_ar" rows={4} />
//       </div>

//       {/* PDF Preview */}
//       <div className="border p-4 rounded bg-gray-50 mt-6">
//         <h3 className="font-semibold mb-2">PDF Preview</h3>
//         <JobOfferPDF
//           data={{
//             candidate:
//               candidates.find((cand) => cand.id === values.candidate_id) || {},
//             basic_salary: values.salary,
//             housing_allowance: housingAllowance || 0,
//             transportation_allowance: travelAllowance || 0,
//             total_salary: totalSalary || 0,
//             note_en: values.note_en,
//             note_ar: values.note_ar,
//           }}
//         />
//       </div>

//       {/* Actions */}
//       <div className="text-right flex justify-end gap-4 mt-4">
//         <SubmitButton
//           type="button"
//           onClick={() => {
//             const element = document.getElementById("offer-pdf-preview");
//             import("html2pdf.js").then((html2pdf) => {
//               html2pdf.default().from(element).save("OfferLetter.pdf");
//             });
//           }}
//           title="Download Offer Letter"
//           variant="outlined"
//         />
//         <SubmitButton
//           type="submit"
//           title="Submit Offer"
//           isLoading={isSubmitting}
//         />
//       </div>
//     </Form>
//   );
// };



// src/pages/Admin/humanResource/talentAcquisition/offerRequest/form.js

import React, { useEffect, useState, useCallback } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";

import { supabase } from "../../../../../supabaseClient";
import JobOfferPDF from "../../../../../components/ContractsForms/OfferLetter";
import { useUser } from "../../../../../context/UserContext";
import FormikSelectField from "../../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../../components/common/FormikInputField";
import SubmitButton from "../../../../../components/common/SubmitButton";
import FormikRadioGroup from "../../../../../components/common/RadioGroup";

import {
  useGetManagers,
  useOfferRequests,
} from "../../../../../utils/hooks/api/useOfferRequests";
  import { useUpdateCandidate } from "../../../../../utils/hooks/api/candidates";
import JobOfferDocument from "../../../../../components/ContractsForms/OfferLetterNew";

const recommendationOptions = [
  { label: "Suitable for recruitment", value: "suitable_now" },
  { label: "Suitable in the future", value: "suitable_future" },
  { label: "Rejected", value: "rejected" },
  { label: "Direct Hire", value: "direct" },
];

export const offerRequestValidationSchema = Yup.object().shape({
  candidate_id: Yup.number().required("Candidate is required"),
  salary: Yup.number()
    .typeError("Salary must be a number")
    .required("Salary is required")
    .min(0, "Salary must be greater than zero"),
  assignee_id: Yup.number().required("Assignee is required"),
});

const OfferRequestForm = () => {
  const { user } = useUser();
  const { createOfferRequest } = useOfferRequests();
  const { updateCandidate, loading: updateLoading } = useUpdateCandidate();
  const { managers, loading: managersLoading } = useGetManagers();

  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // Fetch candidates based on selected hiring status
  const fetchCandidates = useCallback(async (statusValue) => {
    setCandidatesLoading(true);
    setCandidates([]);

    try {
      let query = supabase
        .from("candidates")
        .select("*, vacancy:vacancy (id, title)")
        .eq("offer_letter", "not_generated")
        .eq("is_deleted", false)
        .eq("is_employee", false);

      if (statusValue === "direct") {
        // hiring_status is NULL OR empty string
        query = query.or("hiring_status.is.null,hiring_status.eq.");
      } else {
        query = query.eq("hiring_status", statusValue);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  }, []);

  // initial fetch (first radio option)
  useEffect(() => {
    fetchCandidates(recommendationOptions[0].value);
  }, [fetchCandidates]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create Offer Request</h2>

      <Formik
        initialValues={{
          candidate_id: "",
          hiring_status: recommendationOptions[0].value,
          salary: "",
          note_en: "",
          note_ar: "",
          assignee_id: "",
        }}
        validationSchema={offerRequestValidationSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            const element = document.getElementById("offer-pdf-preview");
            const html2pdf = (await import("html2pdf.js")).default;

            // 1) Generate PDF as Blob
            const blob = await html2pdf().from(element).outputPdf("blob");

            // 2) Upload to S3
            const file = new File(
              [blob],
              `offer-${values.candidate_id}-${Date.now()}.pdf`,
              { type: "application/pdf" }
            );
            const { uploadFile } = await import("../../../../../utils/s3");
            const uploadedUrl = await uploadFile(file);

            // 3) Build payload (remove hiring_status)
            const isHrManager = values?.assignee_id == 6;
            const { hiring_status: _omit, ...cleanValues } = values;
            const payload = {
              ...cleanValues,
              pdf_url: uploadedUrl,
              status: isHrManager ? "pending_hr_manager" : "pending_manager",
              is_manager_approve: !!isHrManager,
              // is_hod_approve: !!isHrManager,
              is_hr_manager_approve: false,
              created_by: user?.id,
              updated_by: user?.id,
            };


            // 4) Create offer request
            const success = await createOfferRequest(payload);

            // 5) Mark candidate offer status
            await updateCandidate(values.candidate_id, { offer_letter: "pending" });

            if (success) resetForm();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <OfferRequestFields
          candidates={candidates}
          candidatesLoading={candidatesLoading}
          fetchCandidates={fetchCandidates}
          managers={managers}
          managersLoading={managersLoading}
          updateLoading={updateLoading}
        />
      </Formik>
    </div>
  );
};

export default OfferRequestForm;

/* ===================== CHILD FIELDS COMPONENT ===================== */
const OfferRequestFields = ({
  candidates,
  candidatesLoading,
  fetchCandidates,
  managers,
  managersLoading,
  updateLoading,
}) => {
  const { values, setFieldValue, isSubmitting } = useFormikContext();

  // pre-onboarding gate state
  // 'idle' | 'checking' | 'passed' | 'failed' | 'missing' | 'error'
  const [preOnboardingStatus, setPreOnboardingStatus] = useState("idle");
  const [preOnboardingTasks, setPreOnboardingTasks] = useState([]);

  // When hiring_status changes → reset candidate and reload options
  useEffect(() => {
    setFieldValue("candidate_id", "");
    setPreOnboardingStatus("idle");
    setPreOnboardingTasks([]);
    fetchCandidates(values.hiring_status);
  }, [values.hiring_status, fetchCandidates, setFieldValue]);

  /**
   * Handle candidate selection and evaluate pre-onboarding:
   * Join 'assigned_task' -> 'tasks' on task_id.
   * Consider only rows where tasks.task_type = 'pre_on_boarding'.
   * RULE: If ANY row is 'completed' => PASSED (wins over failures).
   * Otherwise, if any 'failed' => FAILED, else => MISSING.
   */
  const handleCandidateSelection = async (selectedCandidateId) => {
    const candidateIdNum =
      typeof selectedCandidateId === "string"
        ? Number(selectedCandidateId)
        : selectedCandidateId;

    setFieldValue("candidate_id", candidateIdNum || "");
    setPreOnboardingTasks([]);
    setPreOnboardingStatus(candidateIdNum ? "checking" : "idle");

    if (!candidateIdNum) return;

    try {
      const { data, error } = await supabase
        .from("assigned_tasks") // singular table
        .select("status, task_id, tasks!inner(id, task_type)")
        .eq("candidate_id", candidateIdNum)
        .eq("tasks.task_type", "pre_on_boarding");

      if (error) throw error;

      const rows = data || [];
      setPreOnboardingTasks(rows.map((r) => r.tasks));

      if (rows.length === 0) {
        setPreOnboardingStatus("missing"); // no pre_on_boarding tasks found
        return;
      }

      const toLower = (s) => (s ?? "").toString().toLowerCase();

      // ✅ If ANY row is 'completed' → PASSED (wins over failures)
      const hasCompleted = rows.some((r) => toLower(r.status) === "completed");
      if (hasCompleted) {
        setPreOnboardingStatus("passed");
        return;
      }

      // Otherwise, if any 'failed' → FAILED
      const hasFailed = rows.some((r) => toLower(r.status) === "failed");
      if (hasFailed) {
        setPreOnboardingStatus("failed");
      } else {
        // neither completed nor failed (maybe pending/in_progress)
        setPreOnboardingStatus("missing");
      }
    } catch (e) {
      console.error("Pre-onboarding check failed:", e);
      setPreOnboardingStatus("error");
    }
  };

  const housingAllowance =
    values.salary ? ((values.salary * 3) / 12).toFixed(2) : "";
  const travelAllowance = values.salary ? (values.salary * 0.1).toFixed(2) : "";
  const totalSalary =
    values.salary
      ? (
          parseFloat(values.salary) +
          parseFloat((values.salary * 3) / 12) +
          parseFloat(values.salary * 0.1)
        ).toFixed(2)
      : "";

  const canSubmit =
    values.candidate_id &&
    preOnboardingStatus === "passed" &&
    !isSubmitting &&
    !updateLoading;

  return (
    <Form className="space-y-4">
      {/* Radio drives candidate filter */}
      <div>
        <FormikRadioGroup name="hiring_status" options={recommendationOptions} />
      </div>

      {/* Candidate select (resets on radio change, calls handleCandidateSelection on change) */}
      <div>
        <FormikSelectField
          as="select"
          name="candidate_id"
          className="w-full border p-2 rounded"
          options={candidates}
          selectKey="id"
          label="Candidate"
          getOptionLabel={(c) =>
            `${c.first_name || ""} ${c.second_name || ""} ${c.third_name || ""} ${
              c.forth_name || ""
            } ${c.family_name || ""}`.trim()
          }
          disabled={candidatesLoading}
          loading={candidatesLoading}
          placeholder={candidatesLoading ? "Loading candidates..." : "Select a candidate"}
          onChange={(eOrValue) => {
            const possibleId =
              eOrValue?.target?.value ?? eOrValue?.value ?? eOrValue?.id ?? eOrValue;
            handleCandidateSelection(Number(possibleId));
          }}
        />
      </div>

      {/* Gate feedback */}
      <div className="text-sm">
        {preOnboardingStatus === "checking" && (
          <span>Checking pre-onboarding tasks…</span>
        )}
        {values.candidate_id && preOnboardingStatus === "passed" && (
          <span className="text-green-600">
            Pre-onboarding passed. You can submit the offer.
          </span>
        )}
        {values.candidate_id && preOnboardingStatus === "failed" && (
          <span className="text-red-600">
            Pre-onboarding failed for this candidate. Submission is blocked.
          </span>
        )}
        {values.candidate_id && preOnboardingStatus === "missing" && (
          <span className="text-orange-600">
            No completed pre-onboarding tasks found. Submission is blocked.
          </span>
        )}
        {values.candidate_id && preOnboardingStatus === "error" && (
          <span className="text-red-600">
            Pre hiring task for this candidate is not completed.
          </span>
        )}
      </div>

      {/* Manager select */}
      <div>
        <FormikSelectField
          as="select"
          name="assignee_id"
          className="w-full border p-2 rounded"
          options={managers}
          selectKey="id"
          label="Approval Required From Manager"
          getOptionLabel={(e) =>
            `${e?.employee_code || ""} - ${e?.candidates?.full_name || ""}`
          }
          disabled={managersLoading}
          loading={managersLoading}
        />
      </div>

      {/* Compensation */}
      <div>
        <FormikInputField label="Basic Salary" name="salary" type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Housing Allowance</label>
          <input
            value={housingAllowance}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label>Travel Allowance</label>
          <input
            value={travelAllowance}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label>Total Salary</label>
          <input
            value={totalSalary}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>
      </div>

      {/* Note */}
      <div>
        <FormikInputField label="Note" name="note_ar" rows={4} />
      </div>

      {/* PDF Preview */}
      <div className="border p-4 rounded bg-gray-50 mt-6">
        <h3 className="font-semibold mb-2">PDF Preview</h3>
        <JobOfferDocument
          data={{
            candidate:
              candidates.find((cand) => cand.id === values.candidate_id) || {},
            basic_salary: values.salary,
            housing_allowance: housingAllowance || 0,
            transportation_allowance: travelAllowance || 0,
            total_salary: totalSalary || 0,
            note_en: values.note_en,
            note_ar: values.note_ar,
          }}
        />
      </div>

      {/* Actions */}
      <div className="text-right flex justify-end gap-4 mt-4">
        <SubmitButton
          type="button"
          onClick={() => {
            const element = document.getElementById("offer-pdf-preview");
            import("html2pdf.js").then((html2pdf) => {
              html2pdf.default().from(element).save("OfferLetter.pdf");
            });
          }}
          title="Download Offer Letter"
          variant="outlined"
        />
        <SubmitButton
          type="submit"
          title="Submit Offer"
          isLoading={isSubmitting || updateLoading}
          disabled={!canSubmit}
        />
      </div>
    </Form>
  );
};
