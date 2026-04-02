// VacancyForm.jsx
import React, { useState, useEffect, useMemo } from "react";

import { Formik, Form, FieldArray, useFormikContext } from "formik";

import FormikSelectField from "../../../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../../../components/common/FormikInputField";
import FormikCheckbox from "../../../../../../components/common/FormikCheckbox";
import SubmitButton from "../../../../../../components/common/SubmitButton";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../../../components/common/PageHeadSection";
// import VacancyTable from './vancaniesList'
import { supabase } from "../../../../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useCompanyEmployees } from "../../../../../../utils/hooks/api/emplyees";
import toast from "react-hot-toast";
import { vacancyValidationSchema } from "../../../../../../utils/validations/vacancyValidation";
import TabBar from "./tabs";
import EducationTable from "./educationTableForm";
import CertificationTable from "./certificateTableForm";
import CompetencyTable from "./competencyTableForm";
import ResponsibilitiesTable from "./responsibilitiesTableForm";
import DeductionsTable from "./deductionsTableForm";
import BusinessTravelTable from "./businessTravelTableForm";
import BenefitsTable from "./benefitsTableForm";
import AssetsCategoryTable from "./assetsCategoryTableForm";
import TrainingAndCoursesTable from "./trainingAndCoursesTableForm";
import { Country } from "country-state-city";
import { useVacancyDuplicateCheck } from "../../../../../../utils/hooks/api/vacancies";
import TiptapField from "../../../../../../components/TextEditor";
import Button from '@mui/material/Button'
import DeleteIcon from "@mui/icons-material/Delete";

// Stop typing more than 4 digits in the YEAR (first segment of YYYY-MM-DD)
export const handleDateBeforeInput = (e) => {
  // Only care about digit insertions
  const isInsert =
    e.inputType === "insertText" || e.inputType === "insertCompositionText";
  const char = e.data;
  if (!isInsert || !/^\d$/.test(char)) return;

  const input = e.target;
  const { selectionStart, selectionEnd, value } = input;

  // Current year segment = chars before the first "-"
  const yearEndIdx =
    value.indexOf("-") === -1 ? value.length : value.indexOf("-");
  const caretInYear = selectionStart <= yearEndIdx;

  // If caret is in the year AND year already has 4 digits AND we're not replacing a selection → block
  const year = value.slice(0, yearEndIdx).replace(/\D/g, "");
  const replacing = selectionEnd > selectionStart; // user selected text
  if (caretInYear && year.length >= 4 && !replacing) {
    e.preventDefault();
  }
};

// Clamp any overflow to 4-digit year after the fact (edge cases/IME)
export const handleDateInput = (e) => {
  const input = e.target;
  let v = input.value || "";

  // If someone manages to shove more digits in the year, slice it back
  // Expect value like "YYYY-MM-DD" while typing in many browsers
  const parts = v.split("-");
  if (parts.length > 0 && parts[0].length > 4) {
    parts[0] = parts[0].slice(0, 4);
    v = parts.join("-");
  }

  // Optionally, keep month/day to 2 chars while typing
  if (parts.length > 1 && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
  if (parts.length > 2 && parts[2].length > 2) parts[2] = parts[2].slice(0, 2);

  input.value = parts.join("-");
};

// Sanitize pasted content → keep only YYYY-MM-DD with a 4-digit year
export const handleDatePaste = (e) => {
  const text = (e.clipboardData || window.clipboardData).getData("text");
  if (!text) return;

  // Pull digits, map to YYYY-MM-DD
  const digits = text.replace(/\D/g, "");
  if (!digits) return;

  const yyyy = digits.slice(0, 4);
  if (yyyy.length < 4) return; // let browser handle as usual

  const mm = digits.slice(4, 6);
  const dd = digits.slice(6, 8);
  const safe = [yyyy, mm, dd].filter(Boolean).join("-");

  e.preventDefault();
  const input = e.target;
  input.value = safe;
  // Fire a synthetic input event so Formik picks it up if needed
  const evt = new Event("input", { bubbles: true });
  input.dispatchEvent(evt);
};

// === Breadcrumbs ===
const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource" },
  { title: "Talent Acquisition" },
  {
    title: "Vacancies",
    href: "/admin/human-resource/talent-acquisition/vacancies",
  },
  { title: "Add Vacancy" },
];

const jobLevelOptions = [
  { label: "Entry Level", value: "Entry Level" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Mid-level", value: "Mid-level" },
  { label: "Senior", value: "Senior" },
  { label: "Executive", value: "Executive" },
];

// === Compute tomorrow's date string ===
const today = new Date();
const tomorrow = new Date(today);
tomorrow?.setDate(tomorrow?.getDate() + 1);
const tomorrowStr = tomorrow?.toISOString()?.split("T")[0];

const VacancyForm = ({ data = {} }) => {
  // --- Dropdown state ---
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [surveys, setSurveys] = useState([]);

  // Loading flags
  const [loadingDesignations, setLoadingDesignations] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [loadingTableData, setLoadingTableData] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const { employees: companyEmployees, loading: loadingEmployees } =
    useCompanyEmployees();

  const isEditMode = data && data.id;

  const navigate = useNavigate();

  // State for initial values
  const [initialValues, setInitialValues] = useState({
    title: "",
    vacancies_to_fill: "",
    date_to_fill_by_start: [],
    date_to_fill_by_end: [],
    survey_id: "",
    notes: "",
    organizational_unit_id: "",
    designation_id: "",
    external_applicant_description: "",
    // New fields
    reporting_to: "",
    employment_grade: "",
    start_step: "",
    end_step: "",
    salary_range_objectives: "",
    core_function: "",
    years_of_experience: "",
    job_level: "",
    ticket_level: "",
    number_of_tickets_per_year: "",
    core_competency_weight: "",
    technical_competency_weight: "",
    // overtime_type: "",
    additional_salary_definition: "",
    // debit_account: "",
    // no_of_positions: "",
    career_paths: "",
    active: true,
    allow_promotion_outside_path: false,
    allow_sussesion_plan: false,
    eligibility_for_bonuses_from_appraisal: false,
    // New text fields
    responsibilities: "",
    deductions: "",
    business_travel: "",
    benefits: "",
    assets_category: "",
    training_and_courses: "",
    // New simple text fields
    education: "",
    certificates: "",
    competencies: "",
  });

  const [activeTab, setActiveTab] = useState("Education");
  // const [selectedDeptId, setSelectedDeptId] = useState();
  const { checkDuplicate } = useVacancyDuplicateCheck();

  // Fetch vacancy data if editing
  useEffect(() => {
    const fetchVacancy = async () => {
      if (!isEditMode || !data?.id) return;

      setLoadingTableData(true);

      try {
        // Log follow-up API calls for related data
        const [education, certifications, competencies] = await Promise.all([
          supabase.from("education").select("*").eq("vacancy_id", data.id),
          supabase.from("certificates").select("*").eq("vacancy_id", data.id),
          supabase.from("competencies").select("*").eq("vacancy_id", data.id),
        ]);

        // Format the initial values with fetched data
        const formattedInitialValues = {
          title: data?.title || "",
          vacancies_to_fill: data?.no_of_vacancies || "",
          // date_to_fill_by: data?.date_to_fill_by || "",
          date_to_fill_by_start: data?.date_to_fill_by_start || [],
          date_to_fill_by_end: data?.date_to_fill_by_end || [],
          survey_id: String(data?.survey_id || ""),
          notes: data?.notes || "",
          organizational_unit_id: String(data?.organizational_unit_id || ""),
          designation_id: String(data?.designation_id || ""),
          external_applicant_description:
            data?.external_applicant_description || "",
          // New fields
          reporting_to: data?.reporting_to || "",
          employment_grade: data?.employment_grade || "",
          start_step: data?.start_step || "",
          end_step: data?.end_step || "",
          salary_range_objectives: data?.salary_range_objectives || "",
          core_function: data?.core_function || "",
          years_of_experience: data?.years_of_experience || "",
          job_level: data?.job_level || "",
          ticket_level: data?.ticket_level || "",
          number_of_tickets_per_year: data?.number_of_tickets_per_year || "",
          core_competency_weight: data?.core_competency_weight || "",
          technical_competency_weight: data?.technical_competency_weight || "",
          // overtime_type: data?.overtime_type || "",
          additional_salary_definition:
            data?.additional_salary_definition || "",
          // debit_account: data?.debit_account || "",
          // no_of_positions: data?.no_of_positions || "",
          career_paths: data?.career_paths || "",
          active: data?.active !== undefined ? data.active : true,
          allow_promotion_outside_path:
            data?.allow_promotion_outside_path || false,
          allow_sussesion_plan: data?.allow_sussesion_plan || false,
          eligibility_for_bonuses_from_appraisal:
            data?.eligibility_for_bonuses_from_appraisal || false,
          // Include IDs for proper update handling
          education_table: (education?.data || []).map((e) => ({
            id: e.id, // CRITICAL: Include the ID for updates
            education: e.education || "",
            major: e.major || "",
            otherMajor: e.other_major || "",
            instituteName: e.institute_name || "",
            grade: e.grade || "",
            passingYear: e.passing_year ? String(e.passing_year) : "",
          })),
          certifications_table: (certifications?.data || []).map((c) => ({
            id: c.id, // CRITICAL: Include the ID for updates
            certificate: c.name || "",
            institute: c.institute || "",
            certificationDate: c.cert_date || "",
            country: c.country || "",
            expiryDate: c.expiry_date || "",
          })),
          competencies_table: (competencies?.data || []).map((c) => ({
            id: c.id, // CRITICAL: Include the ID for updates
            type: c.type || "",
            name: c.name || "",
            level: c.level || "",
          })),
          // New text fields
          responsibilities: data?.responsibilities || "",
          deductions: data?.deductions || "",
          business_travel: data?.business_travel || "",
          benefits: data?.benefits || "",
          assets_category: data?.assets_category || "",
          training_and_courses: data?.training_and_courses || "",
          // New simple text fields
          education: data?.education || "",
          certificates: data?.certificates || "",
          competencies: data?.competencies || "",
        };

        // Set the initial values
        setInitialValues(formattedInitialValues);
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to fetch vacancy data");
      } finally {
        setLoadingTableData(false);
      }
    };

    // Only run when data.id changes and data.id exists
    if (data?.id) {
      fetchVacancy();
    }
  }, [data?.id, isEditMode]);

  // --- Table refresh logic ---
  // const [tableKey, setTableKey] = useState(0)
  // const refreshTable = () => setTableKey(prev => prev + 1)

  useEffect(() => {
    const fetchDesignations = async () => {
      setLoadingDesignations(true);
      const { data, error } = await supabase
        .from("designations")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) {
        console.error("Error fetching designations:", error.message);
      } else {
        const opts = data.map((d) => ({
          label: d.name,
          value: d.id.toString(),
        }));
        setDesignations(opts);
      }
      setLoadingDesignations(false);
    };
    fetchDesignations();
  }, []);

  // --- Fetch departments (organizational_units) on mount ---
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase
        .from("organizational_units")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) {
        console.error("Error fetching departments:", error.message);
      } else {
        const opts = data.map((d) => ({
          label: d.name,
          value: d.id.toString(),
        }));
        setDepartments(opts);
      }
      setLoadingDepartments(false);
    };
    fetchDepartments();
  }, []);

  // --- Fetch surveys on mount ---
  useEffect(() => {
    const fetchSurveys = async () => {
      setLoadingSurveys(true);
      const { data, error } = await supabase
        .from("surveys")
        .select("id, survey_name")
        .order("survey_name", { ascending: true });
      if (error) {
        console.error("Error fetching surveys:", error.message);
      } else {
        const opts = data.map((s) => ({
          label: s.survey_name,
          value: s.id.toString(),
        }));
        setSurveys(opts);
      }
      setLoadingSurveys(false);
    };
    fetchSurveys();
  }, []);

  // --- Initialize country options ---
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formatted = allCountries?.map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
    setCountryOptions(formatted);
  }, []);

  // --- Generate employment grade options (30-40) ---
  const employmentGradeOptions = [];
  for (let i = 30; i <= 40; i++) {
    employmentGradeOptions.push({
      label: i.toString(),
      value: i.toString(),
    });
  }

  // --- Generate step options (3-7) ---
  const stepOptions = [];
  for (let i = 3; i <= 7; i++) {
    stepOptions.push({
      label: i.toString(),
      value: i.toString(),
    });
  }

  // --- On form submit: insert vacancy & refresh the table ---
  //   const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  //     try {
  //       const newRow = {
  //         title: values.title,
  //         no_of_vacancies: Number(values.vacancies_to_fill),
  //         // date_to_fill_by: values.date_to_fill_by,
  //                   date_to_fill_by_start: values?.date_to_fill_by_start,
  // date_to_fill_by_end: values?.date_to_fill_by_end,
  //         survey_id: values.survey_id ? Number(values.survey_id) : null,
  //         notes: values.notes || null,
  //         organizational_unit_id: Number(values.organizational_unit_id),
  //         designation_id: Number(values.designation_id),
  //         external_applicant_description:
  //           values.external_applicant_description || null,
  //         available_vacancy: true, // default
  //         status: "open", // default
  //         company_id: 1, // adjust as needed
  //         // New fields
  //         reporting_to: values.reporting_to ? Number(values.reporting_to) : null,
  //         employment_grade: values.employment_grade || null,
  //         start_step: values.start_step || null,
  //         end_step: values.end_step || null,
  //         salary_range_objectives: values.salary_range_objectives || null,
  //         core_function: values.core_function || null,
  //         years_of_experience: values.years_of_experience
  //           ? Number(values.years_of_experience)
  //           : null,
  //         job_level: values.job_level || null,
  //         ticket_level: values.ticket_level || null,
  //         number_of_tickets_per_year: values.number_of_tickets_per_year
  //           ? Number(values.number_of_tickets_per_year)
  //           : null,
  //         core_competency_weight: values.core_competency_weight
  //           ? Number(values.core_competency_weight)
  //           : null,
  //         technical_competency_weight: values.technical_competency_weight
  //           ? Number(values.technical_competency_weight)
  //           : null,
  //         // overtime_type: values.overtime_type || null,
  //         additional_salary_definition:
  //           values.additional_salary_definition || null,
  //         // debit_account: values.debit_account || null,
  //         // no_of_positions: values.no_of_positions
  //         //   ? Number(values.no_of_positions)
  //         //   : null,
  //         career_paths: values.career_paths || null,
  //         active: values.active,
  //         allow_promotion_outside_path: values.allow_promotion_outside_path,
  //         allow_sussesion_plan: values.allow_sussesion_plan,
  //         eligibility_for_bonuses_from_appraisal:
  //           values.eligibility_for_bonuses_from_appraisal,
  //         // New text fields
  //         responsibilities: values.responsibilities || null,
  //         deductions: values.deductions || null,
  //         business_travel: values.business_travel || null,
  //         benefits: values.benefits || null,
  //         assets_category: values.assets_category || null,
  //         training_and_courses: values.training_and_courses || null,
  //         // New simple text fields
  //         education: values.education || "",
  //         certificates: values.certificates || "",
  //         competencies: values.competencies || "",
  //       };

  //       let vacancyId;

  //       if (isEditMode) {
  //         const { error } = await supabase
  //           .from("vacancy")
  //           .update(newRow)
  //           .eq("id", data.id);

  //         if (error) {
  //           throw new Error("Error updating vacancy:", error.message);
  //         }
  //         vacancyId = data.id;
  //       } else {
  //         const { data: newVacancy, error } = await supabase
  //           .from("vacancy")
  //           .insert([newRow])
  //           .select();

  //         if (error) {
  //           throw new Error("Error creating vacancy:", error.message);
  //         }
  //         vacancyId = newVacancy[0].id;
  //       }

  //       // Save education records
  //       if (values.education_table && values.education_table.length > 0) {
  //         const educationData = values.education_table.map((edu) => ({
  //           vacancy_id: vacancyId,
  //           employee_id: null,
  //           education: edu.education,
  //           major: edu.major,
  //           other_major: edu.otherMajor || null,
  //           institute_name: edu.instituteName,
  //           grade: edu.grade,
  //           passing_year: edu.passingYear ? Number(edu.passingYear) : null,
  //           type: null,
  //           company_id: 1,
  //           created_by: 1,
  //         }));

  //         if (isEditMode) {
  //           // Delete existing education records and insert new ones
  //           await supabase.from("education").delete().eq("vacancy_id", vacancyId);
  //         }

  //         const { error: educationError } = await supabase
  //           .from("education")
  //           .insert(educationData);

  //         if (educationError) {
  //           console.error("Error saving education records:", educationError);
  //         }
  //       }

  //       // Save certification records
  //       if (
  //         values.certifications_table &&
  //         values.certifications_table.length > 0
  //       ) {
  //         const certificationData = values.certifications_table.map((cert) => ({
  //           vacancy_id: vacancyId,
  //           employee_id: null,
  //           name: cert.certificate,
  //           institute: cert.institute,
  //           cert_date: cert.certificationDate,
  //           country: cert.country,
  //           expiry_date: cert.expiryDate,
  //           company_id: 1,
  //           created_by: 1,
  //         }));

  //         if (isEditMode) {
  //           // Delete existing certification records and insert new ones
  //           await supabase
  //             .from("certificates")
  //             .delete()
  //             .eq("vacancy_id", vacancyId);
  //         }

  //         const { error: certificationError } = await supabase
  //           .from("certificates")
  //           .insert(certificationData);

  //         if (certificationError) {
  //           console.error(
  //             "Error saving certification records:",
  //             certificationError
  //           );
  //         }
  //       }

  //       // Save competency records
  //       if (values.competencies_table && values.competencies_table.length > 0) {
  //         const competencyData = values.competencies_table.map((comp) => ({
  //           vacancy_id: vacancyId,
  //           employee_id: null,
  //           type: comp.type,
  //           name: comp.name,
  //           level: comp.level,
  //           company_id: 1,
  //           created_by: 1,
  //         }));

  //         if (isEditMode) {
  //           // Delete existing competency records and insert new ones
  //           await supabase
  //             .from("competencies")
  //             .delete()
  //             .eq("vacancy_id", vacancyId);
  //         }

  //         const { error: competencyError } = await supabase
  //           .from("competencies")
  //           .insert(competencyData);

  //         if (competencyError) {
  //           console.error("Error saving competency records:", competencyError);
  //         }
  //       }

  //       toast.success(
  //         isEditMode
  //           ? "Vacancy updated successfully"
  //           : "Vacancy created successfully"
  //       );
  //       navigate(-1);
  //     } catch (err) {
  //       toast.error(err.message);
  //     } finally {
  //       setSubmitting(false);
  //     }
  //   };

  // --- On form submit: insert vacancy & refresh the table ---
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    // helper: safe normalize 'YYYY-MM-DD' or throw
    const toISO = (d) => {
      if (!d) return "";
      // Form date input already yields "YYYY-MM-DD"; keep as-is
      // If your source might be Date objects, uncomment next line:
      // if (d instanceof Date) return d.toISOString().slice(0, 10);
      return String(d).slice(0, 10);
    };

    try {
      if (
        values.title &&
        values.organizational_unit_id &&
        values.designation_id && !isEditMode
      ) {
        const exists = await checkDuplicate({
          title: values.title,
          organizational_unit_id: values.organizational_unit_id,
          designation_id: values.designation_id,
          caseInsensitive: true,
          showToast: true,
        });
        if (exists.exists) return;
      }

      // 1) Normalize arrays
      const startsRaw = Array.isArray(values.date_to_fill_by_start)
        ? values.date_to_fill_by_start
        : [];
      const endsRaw = Array.isArray(values.date_to_fill_by_end)
        ? values.date_to_fill_by_end
        : [];

      // ensure equal length based on the longer one (guard)
      const n = Math.max(startsRaw.length, endsRaw.length);

      const starts = Array.from({ length: n }, (_, i) =>
        toISO(startsRaw[i] || "")
      );
      const ends = Array.from({ length: n }, (_, i) => toISO(endsRaw[i] || ""));

      // 2) Validate: no blanks allowed for either date
      const missingIdx = starts.findIndex((s, i) => !s || !ends[i]);
      if (n > 0 && missingIdx !== -1) {
        throw new Error(
          `Please complete start and end date for vacancy #${missingIdx + 1}.`
        );
      }

      // 3) Optionally, enforce end >= start (client-side safety in case Yup missed it)
      const badOrderIdx = starts.findIndex((s, i) => s > ends[i]);
      if (badOrderIdx !== -1) {
        throw new Error(
          `End date must be on or after start date for vacancy #${
            badOrderIdx + 1
          }.`
        );
      }

      // 4) Compute vacancies from arrays (more reliable than the input field)
      const noOfVacancies = n;


         // Merge description points into external_applicant_description
      let mergedDescription = values.external_applicant_description || "";

      if (values.description_points && values.description_points.length > 0) {
        const list = values.description_points
          .filter((p) => p && p.trim() !== "")
          .map((p, i) => `${i + 1}- ${p.trim()}`)
          .join("\n");

        mergedDescription =
          mergedDescription + "\n" + list; // append numbered list
      }

      const newRow = {
        title: values.title,
        no_of_vacancies: Number(noOfVacancies),

        // send arrays exactly as captured
        date_to_fill_by_start: starts, // e.g., ['2025-09-15', '2025-09-20', ...]
        date_to_fill_by_end: ends,

        survey_id: values.survey_id ? Number(values.survey_id) : null,
        notes: values.notes || null,
        organizational_unit_id: Number(values.organizational_unit_id),
        designation_id: Number(values.designation_id),
        external_applicant_description:
          mergedDescription || null,

        available_vacancy: true, // default
        status: "open", // default
        company_id: 1, // adjust as needed

        // New fields
        reporting_to: values.reporting_to ? Number(values.reporting_to) : null,
        employment_grade: values.employment_grade || null,
        start_step: values.start_step || null,
        end_step: values.end_step || null,
        salary_range_objectives: values.salary_range_objectives || null,
        core_function: values.core_function || null,
        years_of_experience: values.years_of_experience
          ? Number(values.years_of_experience)
          : null,
        job_level: values.job_level || null,
        ticket_level: values.ticket_level || null,
        number_of_tickets_per_year: values.number_of_tickets_per_year
          ? Number(values.number_of_tickets_per_year)
          : null,
        core_competency_weight: values.core_competency_weight
          ? Number(values.core_competency_weight)
          : null,
        technical_competency_weight: values.technical_competency_weight
          ? Number(values.technical_competency_weight)
          : null,

        additional_salary_definition:
          values.additional_salary_definition || null,
        career_paths: values.career_paths || null,
        active: values.active,
        allow_promotion_outside_path: values.allow_promotion_outside_path,
        allow_sussesion_plan: values.allow_sussesion_plan,
        eligibility_for_bonuses_from_appraisal:
          values.eligibility_for_bonuses_from_appraisal,

        // New text fields
        responsibilities: values.responsibilities || null,
        deductions: values.deductions || null,
        business_travel: values.business_travel || null,
        benefits: values.benefits || null,
        assets_category: values.assets_category || null,
        training_and_courses: values.training_and_courses || null,

        // New simple text fields
        education: values.education || "",
        certificates: values.certificates || "",
        competencies: values.competencies || "",
      };



      // let vacancyId;

      // if (isEditMode) {
      //   const { error } = await supabase
      //     .from("vacancy")
      //     .update(newRow)
      //     .eq("id", data.id);

      //   if (error) {
      //     throw new Error(`Error updating vacancy: ${error.message}`);
      //   }
      //   vacancyId = data.id;
      // } else {
      //   const { data: newVacancy, error } = await supabase
      //     .from("vacancy")
      //     .insert([newRow])
      //     .select();

      //   if (error) {
      //     throw new Error(`Error creating vacancy: ${error.message}`);
      //   }
      //   vacancyId = newVacancy[0].id;
      // }

      // // Save education records
      // if (values.education_table && values.education_table.length > 0) {
      //   const educationData = values.education_table.map((edu) => ({
      //     vacancy_id: vacancyId,
      //     employee_id: null,
      //     education: edu.education,
      //     major: edu.major,
      //     other_major: edu.otherMajor || null,
      //     institute_name: edu.instituteName,
      //     grade: edu.grade,
      //     passing_year: edu.passingYear ? Number(edu.passingYear) : null,
      //     type: null,
      //     company_id: 1,
      //     created_by: 1,
      //   }));

      //   if (isEditMode) {
      //     await supabase.from("education").delete().eq("vacancy_id", vacancyId);
      //   }

      //   const { error: educationError } = await supabase
      //     .from("education")
      //     .insert(educationData);

      //   if (educationError) {
      //     console.error("Error saving education records:", educationError);
      //   }
      // }

      // // Save certification records
      // if (
      //   values.certifications_table &&
      //   values.certifications_table.length > 0
      // ) {
      //   const certificationData = values.certifications_table.map((cert) => ({
      //     vacancy_id: vacancyId,
      //     employee_id: null,
      //     name: cert.certificate,
      //     institute: cert.institute,
      //     cert_date: cert.certificationDate || null,
      //     country: cert.country || null,
      //     expiry_date: cert.expiryDate || null,
      //     company_id: 1,
      //     created_by: 1,
      //   }));

      //   if (isEditMode) {
      //     await supabase
      //       .from("certificates")
      //       .delete()
      //       .eq("vacancy_id", vacancyId);
      //   }

      //   const { error: certificationError } = await supabase
      //     .from("certificates")
      //     .insert(certificationData);

      //   if (certificationError) {
      //     console.error(
      //       "Error saving certification records:",
      //       certificationError
      //     );
      //   }
      // }

      // // Save competency records
      // if (values.competencies_table && values.competencies_table.length > 0) {
      //   const competencyData = values.competencies_table.map((comp) => ({
      //     vacancy_id: vacancyId,
      //     employee_id: null,
      //     type: comp.type,
      //     name: comp.name,
      //     level: comp.level,
      //     company_id: 1,
      //     created_by: 1,
      //   }));

      //   if (isEditMode) {
      //     await supabase
      //       .from("competencies")
      //       .delete()
      //       .eq("vacancy_id", vacancyId);
      //   }

      //   const { error: competencyError } = await supabase
      //     .from("competencies")
      //     .insert(competencyData);

      //   if (competencyError) {
      //     console.error("Error saving competency records:", competencyError);
      //   }
      // }

      // toast.success(
      //   isEditMode
      //     ? "Vacancy updated successfully"
      //     : "Vacancy created successfully"
      // );
      // navigate(-1);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDeptId = initialValues.organizational_unit_id;

  // Filter employees by selected department
  const filteredEmployees = useMemo(() => {
    if (!selectedDeptId) return [];
    return (companyEmployees || []).filter(
      (emp) =>
        String(emp.organizational_unit_id) === String(selectedDeptId) &&
        (emp?.role_columns?.roles.includes("manager") || emp?.role_columns?.roles.includes("hr_manager"))
    );
  }, [companyEmployees, selectedDeptId]);

  // console.log("company Employees", filteredEmployees)

  // In your component scope
  // const handleDepartmentChange = (next, values) => {
  const handleDepartmentChange = async (next, values) => {
    // Works for <select> events or react-select objects
    const nextValue =
      next && typeof next === "object" && "target" in next
        ? next.target.value
        : next?.value ?? next;

    const newInitials = {
      ...values, // keep everything user has typed so far
      organizational_unit_id: String(nextValue ?? ""),
      reporting_to: "", // clear when department changes
    };

    setInitialValues(newInitials);

    if (values.title && nextValue && values.designation_id) {
      const { exists } = await checkDuplicate({
        title: values.title,
        organizational_unit_id: String(nextValue ?? ""),
        designation_id: values.designation_id,
        caseInsensitive: true,
        showToast: true,
      });

      if (exists) return; // stop if duplicate found
    }
  };

  // TITLE change
  const handleTitleChange = async (eOrVal, values) => {
    const nextTitle =
      typeof eOrVal === "object" && "target" in eOrVal
        ? eOrVal.target.value
        : eOrVal;

    // Update form

    const newInitials = {
      ...values, // keep everything user has typed so far
      title: nextTitle,
    };

    setInitialValues(newInitials);

    if (nextTitle && values.organizational_unit_id && values.designation_id) {
      const exists = await checkDuplicate({
        title: nextTitle,
        organizational_unit_id: values.organizational_unit_id,
        designation_id: values.designation_id,
        caseInsensitive: true,
        showToast: true,
      });
      if (exists) return; // stop further actions if needed
    }
  };

  // DESIGNATION change
  const handleDesignationChange = async (next, values) => {
    const nextDesignation =
      next && typeof next === "object" && "target" in next
        ? next.target.value
        : next?.value ?? next;

    const newInitials = {
      ...values, // keep everything user has typed so far
      designation_id: String(nextDesignation ?? ""),
    };

    setInitialValues(newInitials);

    if (values.title && values.organizational_unit_id && nextDesignation) {
      const exists = await checkDuplicate({
        title: values.title,
        organizational_unit_id: values.organizational_unit_id,
        designation_id: String(nextDesignation ?? ""),
        caseInsensitive: true,
        showToast: true,
      });
      if (exists) return;
    }
  };

  const handleVacanciesChange = (e, values) => {
    const n = Math.max(0, parseInt(e.target.value || "0", 10) || 0);

    // use current form values, not initialValues
    const currentStarts = values.date_to_fill_by_start || [];
    const currentEnds = values.date_to_fill_by_end || [];

    const starts = Array.from({ length: n }, (_, i) => currentStarts[i] || "");
    const ends = Array.from({ length: n }, (_, i) => currentEnds[i] || "");

    const newInitials = {
      ...values, // preserve all current form values
      vacancies_to_fill: String(n ?? ""),
      date_to_fill_by_start: starts,
      date_to_fill_by_end: ends,
    };

    setInitialValues(newInitials);
  };

  return (
    <PageWrapperWithHeading title="Add Vacancy" items={breadcrumbItems}>
      <Formik
        initialValues={initialValues}
        validationSchema={vacancyValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-6">
            <div className="overflow-y-auto h-[calc(100vh-320px)] space-y-6">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormikInputField
                    name="title"
                    label="Job Title"
                    placeholder="Enter job title"
                    required
                    onChange={(e) => handleTitleChange(e, values)}
                  />

                  {/* <FormikInputField
                    name="arabic_title"
                    label="Arabic Job Title"
                    placeholder="Enter Arabic job title"
                  /> */}

                  <FormikSelectField
                    name="designation_id"
                    label="Designation"
                    options={designations}
                    placeholder={
                      loadingDesignations ? "Loading…" : "Select Designation"
                    }
                    disabled={loadingDesignations}
                    required
                    onChange={(optOrEvent) =>
                      handleDesignationChange(optOrEvent, values)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormikSelectField
                    name="organizational_unit_id"
                    label="Department"
                    options={departments}
                    placeholder={
                      loadingDepartments ? "Loading…" : "Select Department"
                    }
                    disabled={loadingDepartments}
                    required
                    onChange={(optOrEvent) =>
                      handleDepartmentChange(optOrEvent, values)
                    }
                  />

                  <FormikSelectField
                    name="reporting_to"
                    label="Reporting To"
                    placeholder={
                      loadingEmployees ? "Loading…" : "Select employee"
                    }
                    options={(filteredEmployees || []).map((emp) => {
                      const code = emp.employee_code || "";
                      const name = [
                        emp.candidates?.first_name,
                        emp.candidates?.second_name,
                        emp.candidates?.third_name,
                        emp.candidates?.forth_name,
                        emp.candidates?.family_name,
                      ]
                        .filter(Boolean)
                        .join(" ");
                      let label = "";
                      if (code && name) label = `${code} - ${name}`;
                      else if (code) label = code;
                      else if (name) label = name;
                      else label = emp.id;
                      return { label, value: emp.id };
                    })}
                    disabled={loadingEmployees}
                  />

                  <FormikSelectField
                    name="job_level"
                    label="Job Level"
                    placeholder="Select job level"
                    options={jobLevelOptions}
                    required
                  />
                </div>
              </div>

              {/* Vacancy Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Vacancy Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormikInputField
                    name="vacancies_to_fill"
                    label="Number of Vacancies to Fill"
                    placeholder="Enter number"
                    type="number"
                    required
                    inputProps={{ min: 0 }}
                    onChange={(e) => handleVacanciesChange(e, values)}
                     
                    //           onChange={(e) => {
                    //             const raw = e.target.value;
                    //             // sanitize to non-negative integer
                    //             const n = Math.max(0, parseInt(raw || "0", 10) || 0);

                    //                  const newInitials = {
                    //   ...initialValues,
                    //   vacancies_to_fill: String(n ?? "")
                    // };

                    //     setInitialValues(newInitials);

                    //           }}
                  />
                </div>

                {Number(initialValues.vacancies_to_fill) > 0 && (
                  <div className="mt-6 space-y-4">
                    {initialValues.date_to_fill_by_start?.map((_, idx) => (
                      <div                                                      
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <div className="md:col-span-1">
                          <div className="text-sm font-medium text-gray-700">
                            Vacancy #{idx + 1}
                          </div>
                        </div>

                        <FormikInputField
                          name={`date_to_fill_by_start[${idx}]`}
                          label="Start Date"
                          type="date"
                          required
                          max="2100-12-31"
                          inputProps={{ min: tomorrowStr, max: "9999-12-31" }}
                        />

                        <FormikInputField
                          name={`date_to_fill_by_end[${idx}]`}
                          label="End Date"
                          type="date"
                          required
                          max="2100-12-31"
                          inputProps={{ min: tomorrowStr, max: "9999-12-31" }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormikInputField
                    name="vacancies_to_fill"
                    label="Number of Vacancies to Fill"
                    placeholder="Enter number"
                    type="number"
                    required
                  />
                
                  <FormikInputField
                    name="start_date"
                    label="Start Date"
                    type="date"
                    required
                    inputProps={{ min: tomorrowStr, max: "12/31/9999" }}
                  />

                    <FormikInputField
                    name="end_date"
                    label="End Date"
                    type="date"
                    required
                    inputProps={{ min: tomorrowStr }}
                    max="2100-12-31"
                  />
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormikSelectField
                    name="survey_id"
                    label="Candidate Survey"
                    options={surveys}
                    placeholder={loadingSurveys ? "Loading…" : "Select Survey"}
                    disabled={loadingSurveys}
                  />

                  <FormikInputField
                    name="years_of_experience"
                    label="Years of Experience"
                    placeholder="Enter years of experience"
                    type="number"
                    step="0.1"
                  />

                  <FormikInputField
                    name="core_function"
                    label="Core Function"
                    placeholder="Enter core function"
                  />
                </div>
              </div>

              {/* Salary and Benefits Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Salary and Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormikSelectField
                    name="employment_grade"
                    label="Employment Grade"
                    options={employmentGradeOptions}
                    placeholder="Select employment grade"
                  />

                  <FormikSelectField
                    name="start_step"
                    label="Employment Level"
                    options={stepOptions}
                    placeholder="Select Employment Level"
                  />

                  {/* <FormikSelectField
                    name="end_step"
                    label="End Step"
                    options={stepOptions}
                    placeholder="Select end step"
                  /> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormikInputField
                    name="salary_range_objectives"
                    label="Salary Range Objectives"
                    placeholder="Enter salary range objectives"
                    rows={3}
                  />

                  <FormikInputField
                    name="additional_salary_definition"
                    label="Additional Benifits"
                    placeholder="Enter additional benifits"
                    rows={3}
                  />
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormikInputField
                    name="debit_account"
                    label="Debit Account"
                    placeholder="Enter debit account"
                  />

                  <FormikInputField
                    name="overtime_type"
                    label="Overtime Type"
                    placeholder="Enter overtime type"
                  />
                </div> */}
              </div>

              {/* Competency and Performance Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Competency and Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormikInputField
                    name="core_competency_weight"
                    label="Core Competency Weight"
                    placeholder="Enter weight (0-100)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                  />

                  <FormikInputField
                    name="technical_competency_weight"
                    label="Technical Competency Weight"
                    placeholder="Enter weight (0-100)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                  />

                  <FormikInputField
                    name="ticket_level"
                    label="Ticket Level"
                    placeholder="Enter ticket level"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormikInputField
                    name="number_of_tickets_per_year"
                    label="Number of Tickets per Year"
                    placeholder="Enter number of tickets"
                    type="number"
                  />

                  <FormikInputField
                    name="career_paths"
                    label="Career Paths"
                    placeholder="Enter career paths"
                    rows={3}
                  />
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Additional Information
                </h3>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormikInputField
                    name="notes"
                    label="Notes"
                    rows={4}
                    required={false}
                  />
                
                

                                <TiptapField name="external_applicant_description" label="Job Description " />

                </div> */}
                <div className="grid grid-cols-1 gap-4">
  <FormikInputField
    name="notes"
    label="Notes"
    rows={4}
    required={false}
  />
  
{/* === Job Description (Default Point 1) === */}
<div className="flex items-center gap-2 mt-2">
  {/* Number shown beside the input */}
  <div className="w-6 text-gray-700 font-semibold text-right">1.</div>

  {/* Input field aligned horizontally */}
  <div className="flex-1">
    <FormikInputField
      name="external_applicant_description"
      placeholder="Job Description"
      rows={4}
      required={false}
      label="Job Description" // remove top label for clean inline layout
    />
  </div>
</div>

{/* === Dynamic Description Points (2, 3, 4, etc.) === */}
<FieldArray name="description_points">
  {({ push, remove }) => (
    <div className="space-y-2 mt-4">
      {values.description_points &&
        values.description_points.map((_, idx) => (
          <div key={idx} className="flex items-center gap-2 mt-2">
            {/* Dynamic numbering beside input */}
            <div className="w-6 text-gray-700 font-semibold text-right">
              {idx + 2}.
            </div>

            {/* Input field */}
            <div className="flex-1">
              <FormikInputField
                name={`description_points[${idx}]`}
                placeholder={`Description Point #${idx + 2}`}
                required={false}
                label=""
              />
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="p-2 rounded-md text-white bg-primary hover:bg-primary-dark"
              aria-label="Delete"
              title="Delete"
            >
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        ))}

      {/* Add Button */}
      <div className="flex justify-end items-center mt-3">
        <Button
          variant="contained"
          onClick={() => push("")}
          className="bg-primary hover:bg-primary-dark"
        >
          Add Description Point
        </Button>
      </div>
    </div>
  )}
</FieldArray>


</div>

              </div>

              {/* Settings Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormikCheckbox name="active" label="Active" />
                  <FormikCheckbox
                    name="allow_promotion_outside_path"
                    label="Allow Promotion Outside Path"
                  />
                  <FormikCheckbox
                    name="allow_sussesion_plan"
                    label="Allow Succession Plan"
                  />
                  <FormikCheckbox
                    name="eligibility_for_bonuses_from_appraisal"
                    label="Eligible for Bonuses from Appraisal"
                  />
                </div>
              </div>
              <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
              {activeTab === "Education" && <EducationTable values={values} />}
              {activeTab === "Certifications" && (
                <CertificationTable values={values} />
              )}
              {activeTab === "Competencies" && (
                <CompetencyTable values={values} />
              )}
              {activeTab === "Responsibilities" && (
                <ResponsibilitiesTable values={values} />
              )}
              {activeTab === "Deductions" && (
                <DeductionsTable values={values} />
              )}
              {activeTab === "Business Travel" && (
                <BusinessTravelTable values={values} />
              )}
              {activeTab === "Benefits" && <BenefitsTable values={values} />}
              {activeTab === "Assets Category" && (
                <AssetsCategoryTable values={values} />
              )}
              {activeTab === "Training and Courses" && (
                <TrainingAndCoursesTable values={values} />
              )}
              <div className="mt-6 pt-6 border-t flex justify-end pr-4">
                <SubmitButton
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  title={isEditMode ? "Update Vacancy" : "Create Vacancy"}
                />
              </div>

              {/* <div className="pt-10">
                <VacancyTable reloadKey={tableKey} />
              </div> */}
            </div>
          </Form>
        )}
      </Formik>
    </PageWrapperWithHeading>
  );
};

export default VacancyForm;





// {/* === Job Description (Default Point 1) === */}
// <div className="flex items-start gap-2 mt-2">
//   {/* Number before input */}
//   <div className="w-6 text-gray-700 font-semibold text-right pt-2">1.</div>

//   {/* Input field with label above */}
//   <div className="flex-1">
//     <FormikInputField
//       name="external_applicant_description"
//       label="Job Description"
//       rows={4}
//       required={false}
//     />
//   </div>
// </div>

// {/* === Dynamic Description Points (2, 3, 4, etc.) === */}
// <FieldArray name="description_points">
//   {({ push, remove }) => (
//     <div className="space-y-2 mt-4">
//       {values.description_points &&
//         values.description_points.map((_, idx) => (
//           <div key={idx} className="flex items-start gap-2 mt-2">
//             {/* Number before each input */}
//             <div className="w-6 text-gray-700 font-semibold text-right pt-2">
//               {idx + 2}.
//             </div>

//             {/* Input field */}
//             <div className="flex-1">
//               <FormikInputField
//                 name={`description_points[${idx}]`}
//                 placeholder={`Description Point #${idx + 2}`}
//                 required={false}
//                 label=""
//               />
//             </div>

//             {/* Delete button at the end */}
//             <button
//               type="button"
//               onClick={() => remove(idx)}
//               className="p-2 rounded-md text-white bg-primary hover:bg-primary-dark"
//               aria-label="Delete"
//               title="Delete"
//             >
//               <DeleteIcon fontSize="small" />
//             </button>
//           </div>
//         ))}

//       {/* Add Description Button */}
//       <div className="flex justify-end items-center mt-3">
//         <Button
//           variant="contained"
//           onClick={() => push("")}
//           className="bg-primary hover:bg-primary-dark"
//         >
//           Add Description Point
//         </Button>
//       </div>
//     </div>
//   )}
// </FieldArray>
