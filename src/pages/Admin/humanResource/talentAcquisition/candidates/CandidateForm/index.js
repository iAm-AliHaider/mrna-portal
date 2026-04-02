import { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { Country, State, City } from "country-state-city";
import PageWrapperWithHeading from "../../../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import FormikInputField from "../../../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../../../components/common/FormikSelectField";
import FileUploadField from "../../../../../../components/common/FormikFileUpload";
import InformationForm from "./InformationForm";
import HealthForm from "./healthForm";

import SubmitButton from "../../../../../../components/common/SubmitButton";
import EducationTable from "./educationTableForm";
import CertificationTable from "./certificateTableForm";
import TabBar from "./tabs";
import ExperienceTable from "./experienceTableForm";
import LanguageTable from "./languagesTableForm";
import CandidateExperienceForm from "./candidateExperienceForm";
import CompetencyTable from "./skillsTableForm";
import RelativesTable from "./relativesTableForm";
import {
  supaBaseCreateCall,
  supaBaseCreateMultipleCall,
  supaBaseFilteredEqualCall,
  supaBasegetAllCall,
} from "../../../../../../utils/common";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../../../../supabaseClient";
import { getCandidateValidationSchema } from "../../../../../../utils/validationSchemas";
import {
  generateCandidateCode,
  hashPassword,
} from "../../../../../../utils/helper";
import { useCandidateVerificationEmail } from "../../../../../../utils/hooks/useCanidateVerificationEmail";
import { useUser } from "../../../../../../context/UserContext";
import { useDepartments } from "../../../../../../utils/hooks/api/useDepartments";
import { useDesignationsByDepartment } from "../../../../../../utils/hooks/api/useDesignationsByDepartment";
import FormikCheckbox from "../../../../../../components/common/FormikCheckbox";

if (!window.supabase) window.supabase = supabase;

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource" },
  {
    label: "Candidates",
    link: "/admin/human-resource/talent-acquisition/candidates",
  },
  { title: "Add Candidate" },
];

const CandidateForm = ({ isPublicView = false }) => {
  const { id } = useParams();
  const { user } = useUser();
  const employeeId = user?.id;
  const companyId = user?.company_id;
  const navigate = useNavigate();
  // Local state for country & state options
  const {
    departments: departmentData,
    loading: departmentLoading,
    error: departmentError,
  } = useDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const {
    designations: designationData,
    loading: designationLoading,
    error: designationError,
  } = useDesignationsByDepartment(selectedDepartment);
  const { message, signUp } = useCandidateVerificationEmail();
  const [isCustomDesignation, setIsCustomDesignation] = useState(false);
  const [customDesignation, setCustomDesignation] = useState("");
  const [isCustomVacancy, setIsCustomVacancy] = useState(false);
  const [customVacancy, setCustomVacancy] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState([]);
  const [activeTab, setActiveTab] = useState("Education");
  const [branches, setBranches] = useState([]);
  const [organizationalUnits, setOrganizationalUnits] = useState([]);
  const [selectedOrganizationalUnits, setSelectedOrganizationalUnits] =
    useState();
  const [organizationalChilds, setOrganizationalChilds] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  // State for department and designation names in edit mode
  const [departmentName, setDepartmentName] = useState("");
  // Your existing initialValues
  const [initialValues, setInitialValues] = useState({
    candidateNumber: generateCandidateCode(),
    department: "",
    designation: "",
    customDesignation: "",
    customVacancy: "",
    vacancy: "",
    filingDate: new Date().toISOString().split("T")[0],
    uploadCV: null,
    firstNameAr: "",
    secondNameAr: "",
    thirdNameAr: "",
    fourthNameAr: "",
    familyNameAr: "",
    firstNameEn: "",
    secondNameEn: "",
    thirdNameEn: "",
    fourthNameEn: "",
    familyNameEn: "",
    nationalId: "",
    national_id_issue: "",
    national_id_expiry: "",
    nationality: "",
    uploadNationalID: null,
    gender: "male",
    maritalStatus: "single",
    familyMembers: "",
    religion: "",
    country: "",
    bloodType: "",
    state: "",
    city: "",
    poBox: "",
    zipCode: "",
    street_name: "",
    neighbour_name: "",
    building_number: "",
    additional_number: "",
    telephone: "",
    mobile: "",
    otherPhone: "",
    relative_name: "",
    email: "",
    address: "",
    notes: "",
    birthPlace: "",
    dateOfBirth: "",
    drivingLicense: false,
    passportType: "",
    passportNumber: "",
    issuePlace: "",
    issueDate: null,
    expiryDate: null,
    uploadPassport: null,
    // highSchoolAverage: "",
    // highSchoolStream: "",
    education: [
      {
        education: "",
        major: "",
        otherMajor: "",
        instituteName: "",
        grade: "",
        passingYear: "",
      },
    ],
    certifications: [
      {
        certificate: "",
        institute: "",
        certificationDate: "",
        country: "",
        expiryDate: "",
        attachment: "",
      },
    ],
    has_expierence: "",
    experience: [
      {
        company_name: "",
        jobTitle: "",
        industry: "",
        country: "",
        city: "",
        salary: "",
        currency: "",
        fromDate: "",
        toDate: "",
        currentlyWorking: false,
        reason: "",
        source: "",
      },
    ],
    languages: [
      {
        language: "English",
        read: "",
        write: "",
        speak: "",
      },
    ],
    competencies: [{ type: "", name: "", level: "" }],
    relatives: [
      {
        relative: "",
        branch: "",
        unit: "",
        department: "",
        division: "",
        section: "",
        jobTitle: "",
      },
    ],
    height: "",
    weight: "",
    dangerious_disease: "",
    disease_details: "",
    mental_illness: "",
    illness_details: "",
    surgery: "",
    suregry_details: "",
    drugs: "",
    drugs_details: "",
    defaulted: "",
    defaulted_details: "",
    dismissed: "",
    dismissed_details: "",
    extra_hours: "",
    extra_hours_details: "",
    relative: "",
    relatives_details: "",
    experienceYears: "",
    numberOfSubordinates: "",
    expectedSalary: "",
    computerSkills: "",
    availablePosition: "",
    currentBenefits: "",
    password: "",
    confirm_password: "",
    licence_number: "",
    licence_expiry_date: null,
    licence_attachment: "",
    vacancy: "",
    disclaimer: false,
  });

  // Fetch candidate data if editing
  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const { data: candidateData, error } = await window.supabase
          .from("candidates")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !candidateData) {
          console.error("Candidate not found or error returned:", {
            error,
            candidateData,
          });
          throw error || new Error("Not found");
        }

        // Set the selected county and state to trigger state and city options loading
        setSelectedCounty(candidateData.country);
        setSelectedState(candidateData.state);

        // Fetch department name for display
        if (candidateData.department) {
          const { data: dept } = await supabase
            .from("organizational_units")
            .select("name")
            .eq("id", candidateData.department)
            .single();
          setDepartmentName(dept?.name || "");
        } else {
          setDepartmentName("");
        }

        // Fetch designation name if designation is an ID
        let designationName = "";
        if (candidateData.designation) {
          const { data: designationData } = await supabase
            .from("designations")
            .select("name")
            .eq("id", candidateData.designation)
            .single();
          if (designationData) designationName = designationData.name;
        }
        let vacancyTitle = "";
        if (candidateData.vacancy) {
          const { data: vacancyData } = await supabase
            .from("vacancy")
            .select("title")
            .eq("id", candidateData.vacancy)
            .single();
          if (vacancyData) vacancyTitle = vacancyData.title;
        }

        // Handle custom designation and vacancy
        if (candidateData.own_designation) {
          setCustomDesignation(candidateData.own_designation);
          setIsCustomDesignation(true);
        } else {
          setCustomDesignation("");
          setIsCustomDesignation(false);
        }

        if (candidateData.own_vacancy) {
          setCustomVacancy(candidateData.own_vacancy);
          setIsCustomVacancy(true);
        } else {
          setCustomVacancy("");
          setIsCustomVacancy(false);
        }

        // Log follow-up API calls for related data
        const [
          education,
          certifications,
          experience,
          languages,
          competencies,
          relatives,
        ] = await Promise.all([
          window.supabase.from("education").select("*").eq("candidate_id", id),
          window.supabase
            .from("certificates")
            .select("*")
            .eq("candidate_id", id),
          window.supabase.from("experience").select("*").eq("candidate_id", id),
          window.supabase.from("languages").select("*").eq("candidate_id", id),
          window.supabase
            .from("competencies")
            .select("*")
            .eq("candidate_id", id),
          window.supabase
            .from("candidate_referral")
            .select(
              `
            *,
            branch:branch_id(name),
            unit:unit_id(name),
            department:department_id(name)
          `
            )
            .eq("candidate_id", id),
        ]);
        // IMPORTANT: Include IDs in the mapped data for proper update handling
        const formattedInitialValues = {
          candidateNumber:
            candidateData.candidate_no || generateCandidateCode(),
          department: candidateData.department
            ? candidateData.department.toString()
            : "",
          designation: candidateData?.designation
            ? candidateData.designation.toString()
            : "",
          designationName: designationName || "",
          customDesignation: candidateData?.own_designation || "",
          customVacancy: candidateData?.own_vacancy || "",
          own_designation: candidateData?.own_designation,
          own_vacancy: candidateData?.own_vacancy,
          vacancy: candidateData?.vacancy
            ? candidateData.vacancy.toString()
            : "",
          vacancyTitle: vacancyTitle || "",
          filingDate: candidateData.filing_date || "",
          uploadCV: candidateData.cv || null,
          firstNameAr: candidateData.first_name_ar || "",
          secondNameAr: candidateData.second_name_ar || "",
          thirdNameAr: candidateData.third_name_ar || "",
          fourthNameAr: candidateData.fourth_name_ar || "",
          familyNameAr: candidateData.family_name_ar || "",
          firstNameEn: candidateData.first_name || "",
          secondNameEn: candidateData.second_name || "",
          thirdNameEn: candidateData.third_name || "",
          fourthNameEn: candidateData.forth_name || "",
          familyNameEn: candidateData.family_name || "",
          nationalId: candidateData.national_id || "",
          national_id_issue: candidateData.national_id_issue || "",
          national_id_expiry: candidateData.national_id_expiry || "",
          nationality: candidateData.nationality || "",
          uploadNationalID: candidateData.national_image || null,
          gender: candidateData.gender || "male",
          maritalStatus: candidateData.marital_status || "single",
          familyMembers: candidateData.family_members || "",
          religion: candidateData.religion || "",
          country: candidateData.country || "",
          bloodType: candidateData.blood_group || "",
          state: candidateData.state || "",
          city: candidateData?.city || "",
          poBox: candidateData.po_box || "",
          zipCode: candidateData.zip_code || "",
          street_name: candidateData.street_name || "",
          neighbour_name: candidateData.neighbour_name || "",
          building_number: candidateData.building_number || "",
          additional_number: candidateData.additional_number || "",
          telephone: candidateData.telephone || "",
          mobile: candidateData.mobile || "",
          otherPhone: candidateData.other_number || "",
          relative_name: candidateData.relative_name || "",
          email: candidateData.email || "",
          address: candidateData.address || "",
          notes: candidateData.notes || "",
          birthPlace: candidateData.birth_place || "",
          dateOfBirth: candidateData.date_of_birth || "",
          drivingLicense: candidateData.driving_license || false,
          passportType: candidateData.passport_type || "",
          passportNumber: candidateData.passport_number || "",
          issuePlace: candidateData.issue_place || "",
          issueDate: candidateData.issue_date || null,
          expiryDate: candidateData.expiry_date || null,
          uploadPassport: candidateData.passport_image || null,
          height: candidateData.height || null,
          weight: candidateData.weight || null,
          dangerious_disease: candidateData.dangerious_disease || "",
          disease_details: candidateData.disease_details || "",
          mental_illness: candidateData.mental_illness || "",
          illness_details: candidateData.illness_details || "",
          surgery: candidateData.surgery || "",
          suregry_details: candidateData.suregry_details || "",
          drugs: candidateData.drugs || "",
          drugs_details: candidateData.drugs_details || "",
          defaulted: candidateData.defaulted || "",
          defaulted_details: candidateData.defaulted_details || "",
          dismissed: candidateData.dismissed || "",
          dismissed_details: candidateData.dismissed_details || "",
          extra_hours: candidateData.extra_hours || "",
          extra_hours_details: candidateData.extra_hours_details || "",
          relative: candidateData.relative || "",
          relatives_details: candidateData.relatives_details || "",
          // highSchoolAverage: candidateData.high_school_average || "",
          // highSchoolStream: candidateData.high_school_stream || "",
          // Include IDs for proper update handling
          education: (education?.data || []).map((e) => ({
            id: e.id, // CRITICAL: Include the ID for updates
            education: e.education || "",
            major: e.major || "",
            otherMajor: e.other_major || "",
            instituteName: e.institute_name || "",
            grade: e.grade || "",
            passingYear: e.passing_year ? String(e.passing_year) : "",
            attachment: e.attachment || "",
          })),
          certifications: (certifications?.data || []).map((c) => ({
            id: c.id, // CRITICAL: Include the ID for updates
            certificate: c.name || "",
            institute: c.institute || "",
            certificationDate: c.cert_date || "",
            country: c.country || "",
            expiryDate: c.expiry_date || null,
            attachment: c.attachment || "",
          })),
          has_expierence: candidateData.has_expierence || "",
          experience: (experience?.data || []).map((ex) => ({
            id: ex.id, // CRITICAL: Include the ID for updates
            company_name: ex.company_name || "",
            jobTitle: ex.job_title || "",
            industry: ex.industry || "",
            country: ex.country || "",
            city: ex.city || "",
            salary: ex.salary ? String(ex.salary) : "",
            currency: ex.currency || "",
            fromDate: ex.from_date || "",
            toDate: ex.to_date || "",
            currentlyWorking: ex.currently_working || false,
            reason: ex.reason_for_leaving || "",
            source: ex.source || "",
          })),
          languages: (languages?.data || []).map((l) => ({
            id: l.id, // CRITICAL: Include the ID for updates
            language: l.name || "",
            read: l.read || "",
            write: l.write || "",
            speak: l.speak || "",
          })),
          competencies: (competencies?.data || []).map((c) => ({
            id: c.id, // CRITICAL: Include the ID for updates
            type: c.type || "",
            name: c.name || "",
            level: c.level || "",
          })),
          relatives: (relatives?.data || []).map((r) => ({
            id: r.id,
            relative: r.referrer_name || "",
            relationship: r.relationship || "",
            branch: r.branch_id ? String(r.branch_id) : "",
            branch_name: r.branch?.name || "",
            unit: r.unit_id ? String(r.unit_id) : "",
            unit_name: r.unit?.name || "",
            department: r.department_id ? String(r.department_id) : "",
            department_name: r.department?.name || "",
            division: r.division || "",
            section: r.section || "",
            jobTitle: r.job_title || "",
          })),
          experienceYears: candidateData.experience_years
            ? String(candidateData.experience_years)
            : "",
          numberOfSubordinates: candidateData.number_of_subordinates
            ? String(candidateData.number_of_subordinates)
            : "",
          expectedSalary: candidateData.expected_salary
            ? String(candidateData.expected_salary)
            : "",
          computerSkills: candidateData.computer_skills || "",
          availablePosition: candidateData.available_position || "",
          currentBenefits: candidateData.current_benefits || "",
          password: "",
          confirm_password: "",
          licence_number: candidateData.licence_number || "",
          licence_expiry_date: candidateData.licence_expiry_date || null,
          licence_attachment: candidateData.licence_attachment || "",
          disclaimer: candidateData.disclaimer || false,
        };
        setCurrentPassword(candidateData.password);
        // First load departments for the unit
        const unitsWithRelatives = relatives?.data
          ?.filter((r) => r.unit_id)
          .map((r) => r.unit_id);

        if (unitsWithRelatives?.length > 0) {
          const { data: departmentsData } = await window.supabase
            .from("organizational_units")
            .select("*")
            .eq("parent_id", unitsWithRelatives[0]);

          if (departmentsData) {
            const sortedDepartments = departmentsData.map((item) => ({
              label: item.name,
              value: item.id.toString(),
            }));
            setOrganizationalChilds(sortedDepartments);
          }

          // Then set the unit to maintain the selection
          setSelectedOrganizationalUnits(unitsWithRelatives[0]);
        }

        // Finally set the initial values
        setInitialValues(formattedInitialValues);
        // Ensure selectedDepartment is set so designations load in edit mode
        setSelectedDepartment(candidateData.department?.toString());
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to fetch candidate data");
      } finally {
        setLoading(false);
      }
    };

    // Only run when id changes and id exists
    if (id) {
      fetchCandidate();
    }
  }, [id]); // Only depend on id

  // Alternative approach: Add a loading state check
  // useEffect(() => {
  //   const fetchCandidate = async () => {
  //     if (!id || loading) return // Prevent multiple calls
  //
  //     // ... rest of your code
  //   }
  //
  //   fetchCandidate()
  // }, [id, loading])

  // If you're using a form library like Formik, you might also need:
  // useEffect(() => {
  //   if (initialValues && Object.keys(initialValues).length > 0) {
  //     // Reset form with new values
  //     formik.resetForm({ values: initialValues })
  //   }
  // }, [initialValues])

  useEffect(() => {
    if (selectedOrganizationalUnits) getDepartments();
  }, [selectedOrganizationalUnits]);

  const getDepartments = async () => {
    try {
      const vacanciesData = await supaBaseFilteredEqualCall(
        "organizational_units",
        "parent_id",
        selectedOrganizationalUnits
      );

      const sortedData = vacanciesData?.map((item) => ({
        label: item.name,
        value: item.id?.toString(),
      }));

      setOrganizationalChilds(sortedData || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setOrganizationalChilds([]);
    }
  };
  const getAllData = async () => {
    try {
      const department = await supaBasegetAllCall("organizational_units");
      const vacanciesData = await supaBasegetAllCall("vacancy");
      const designation = await supaBasegetAllCall("designations");
      const vacancy = await supaBasegetAllCall("vacancy");
      const branchesData = await supaBasegetAllCall("branches");

      const sortedBranches = branchesData?.map((item) => ({
        value: item.id?.toString(),
        label: item.name,
      }));
      const sortedData = department?.map((item) => ({
        value: item.id?.toString(),
        label: item.name,
      }));
      const sortedVacancy = vacanciesData?.map((item) => ({
        label: item.title,
        value: item.id.toString(),
        education: item.education,
      }));
      const sortedDesignations = designation?.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
      setBranches(sortedBranches);
      setOrganizationalUnits(sortedData);

      // const filteredVacancies = vacanciesData?.filter((vac) => {
      //   // Normalize possible education field in vacancy
      //   const vacEdu = vac.education || vac.EDUCATION || vac.required_education || vac.requiredEducation || '';
      //   if (!vacEdu) return false;
      //   // Check if any education in values.education matches
      //   return (values.education || []).some((edu) => {
      //     return vacEdu.toLowerCase() === (edu.education || '').toLowerCase();
      //   });
      // });
      setVacancies(sortedVacancy);
      setDesignations(sortedDesignations);
    } catch (err) {
      console.error("Something went wrong", err);
    }
  };

  // On mount → fetch organizational units & all countries
  useEffect(() => {
    getAllData();
    // Build countryOptions once
    const allCountries = Country.getAllCountries();
    const formatted = allCountries?.map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
    setCountryOptions(formatted);
  }, []);

  useEffect(() => {
    if (selectedCounty) {
      const states = State.getStatesOfCountry(selectedCounty);
      const formatted = states?.map((s) => ({
        label: s.name,
        value: s.isoCode,
      }));
      setStateOptions([]); // clear previous state
      setStateOptions(formatted);
    } else {
      setStateOptions([]);
    }


    
  }, [selectedCounty]);



  useEffect(() => {
    if (selectedCounty && selectedState) {
      const cities = City.getCitiesOfState(selectedCounty, selectedState);
      const formatted = cities?.map((c) => ({
        label: c.name,
        value: c.name, // city has no ISOCode
      }));

      setCityOptions(formatted);
    } else {
      setCityOptions([]);
    }
  }, [selectedCounty, selectedState]);

  // Handle submit with validation
  const handleSubmit = async (
    values,
    { setSubmitting, setFieldError, validateForm, resetForm }
  ) => {
    // Trigger validation before submission
    const errors = await validateForm(values);
    if (Object.keys(errors).length > 0) {
      console.error("Validation errors:", errors);
      toast.error("Please fix the validation errors before submitting");
      setSubmitting(false);
      return;
    }

    if (id) {
      try {
        setLoading(true);
        let password = initialValues.password;
        if (values.password !== password)
          password = hashPassword(values.password);
        // ✅ Define payload for updating the main candidate record
        const candidatePayload = {
          department: values.department ? Number(values.department) : null,
          designation: isCustomDesignation
            ? null
            : values.designation
            ? Number(values.designation)
            : null,
          own_designation: isCustomDesignation
            ? values.customDesignation
            : null,
          vacancy: isCustomVacancy
            ? null
            : values.vacancy
            ? Number(values.vacancy)
            : null,
          own_vacancy: isCustomVacancy ? values.customVacancy : null,
          filing_date: values.filingDate,
          cv: values.uploadCV,
          first_name: values.firstNameEn,
          second_name: values.secondNameEn,
          third_name: values.thirdNameEn,
          forth_name: values.fourthNameEn,
          family_name: values.familyNameEn,
          national_id: values.nationalId,
          national_id_issue: values.national_id_issue,
          national_id_expiry: values.national_id_expiry,
          nationality: values.nationality,
          national_image: values.uploadNationalID,
          gender: values.gender,
          marital_status: values.maritalStatus || "single",
          family_members:
            values.maritalStatus === "married" ? +values.familyMembers : 0,
          blood_group: values.bloodType,
          religion: values.religion,
          country: values.country,
          state: values.state,
          city: values.city,
          po_box: values.poBox,
          zip_code: values.zipCode,
          street_name: values.street_name,
          neighbour_name: values.neighbour_name,
          building_number: values.building_number,
          additional_number: values.additional_number,
          telephone: values.telephone,
          mobile: values.mobile,
          other_number: values.otherPhone,
          relative_name: values.relative_name,
          email: values.email,
          driving_license: values.drivingLicense,
          address: values.address,
          notes: values.notes,
          birth_place: values.birthPlace,
          date_of_birth: values.dateOfBirth,
          passport_type: values.passportType,
          passport_number: values.passportNumber,
          issue_place: values.issuePlace,
          issue_date: values.issueDate,
          expiry_date: values.expiryDate,
          passport_image: values.uploadPassport,
          // high_school_average: values.highSchoolAverage,
          // high_school_stream: values.highSchoolStream,
          has_expierence: values.has_expierence,
          experience_years: values.experienceYears
            ? Number(values.experienceYears)
            : null,
          number_of_subordinates: values.numberOfSubordinates
            ? Number(values.numberOfSubordinates)
            : null,
          expected_salary: values.expectedSalary
            ? Number(values.expectedSalary)
            : null,
          computer_skills: values.computerSkills,
          available_position: values.availablePosition,
          current_benefits: values.currentBenefits,
          password: password || currentPassword,
          company_id: companyId || 1,
          created_by: employeeId || null,
          licence_number: values.licence_number,
          licence_expiry_date: values.licence_expiry_date ?? null,
          licence_attachment: values.licence_attachment,
          height: values.height,
          weight: values.weight,
          dangerious_disease: values.dangerious_disease || "",
          disease_details: values.disease_details || "",
          mental_illness: values.mental_illness || "",
          illness_details: values.illness_details || "",
          surgery: values.surgery || "",
          suregry_details: values.suregry_details || "",
          drugs: values.drugs || "",
          drugs_details: values.drugs_details || "",
          defaulted: values.defaulted || "",
          defaulted_details: values.defaulted_details || "",
          dismissed: values.dismissed || "",
          dismissed_details: values.dismissed_details || "",
          extra_hours: values.extra_hours || "",
          extra_hours_details: values.extra_hours_details || "",
          relative: values.relative || "",
          relatives_details: values.relatives_details || "",
          disclaimer: values.disclaimer,
        };

        // 1. Update main candidate record
        const candidateResult = await window.supabase
          .from("candidates")
          .update(candidatePayload)
          .eq("id", id);

        if (candidateResult.error) {
          throw new Error(
            `Failed to update candidate: ${candidateResult.error.message}`
          );
        }

        // 2. Handle Education Updates and Inserts
        const educationUpdates = [];
        const educationInserts = [];

        values.education.forEach((row) => {
          if (row.id) {
            // Update existing record
            educationUpdates.push({
              id: row.id,
              employee_id: null,
              education: row.education,
              major: row.major,
              other_major: row.otherMajor || null,
              instituteName: row.instituteName,
              grade: row.grade,
              passingYear: row.passingYear
                ? Number.parseInt(row.passingYear, 10)
                : null,
              type: null,
              company_id: companyId || 1,
              created_by: employeeId || null,
              attachment: row.attachment || null,
            });
          } else if (row.education || row.major || row.instituteName) {
            // Insert new record
            educationInserts.push({
              candidate_id: id,
              employee_id: null,
              education: row.education,
              major: row.major,
              other_major: row.otherMajor || null,
              instituteName: row.instituteName,
              grade: row.grade,
              passingYear: row.passingYear
                ? Number.parseInt(row.passingYear, 10)
                : null,
              type: null,
              company_id: companyId || 1,
              created_by: employeeId || null,
              attachment: row.attachment || null,
            });
          }
        });

        // Execute education updates
        if (educationUpdates.length > 0) {
          await Promise.all(
            educationUpdates.map((row) =>
              window.supabase
                .from("education")
                .update({
                  employee_id: row.employee_id,
                  education: row.education,
                  major: row.major,
                  other_major: row.other_major,
                  institute_name: row.instituteName,
                  grade: row.grade,
                  passing_year: row.passingYear,
                  type: row.type,
                  company_id: row.company_id,
                  created_by: row.created_by,
                  attachment: row.attachment,
                })
                .eq("id", row.id)
            )
          );
        }

        // Execute education inserts
        if (educationInserts.length > 0) {
          const educationResult = await window.supabase
            .from("education")
            .insert(educationInserts);

          if (educationResult.error) {
            throw new Error(
              `Failed to insert education: ${educationResult.error.message}`
            );
          }
        }

        // 3. Handle Certifications Updates and Inserts
        const certificateUpdates = [];
        const certificateInserts = [];

        values.certifications.forEach((row) => {
          if (row.id) {
            certificateUpdates.push({
              id: row.id,
              employee_id: null,
              name: row.certificate,
              institute: row.institute,
              cert_date: row.certificationDate || null,
              attachment: row.attachment || null,
              country: row.country,
              expiry_date: row.expiryDate || null,
              company_id: companyId || 1,
              created_by: employeeId || null,
            });
          } else if (row.certificate || row.institute) {
            certificateInserts.push({
              candidate_id: id,
              employee_id: null,
              name: row.certificate,
              institute: row.institute,
              cert_date: row.certificationDate || null,
              attachment: row.attachment || null,
              country: row.country,
              expiry_date: row.expiryDate || null,
              company_id: companyId || 1,
              created_by: employeeId || null,
            });
          }
        });

        // Execute certificate updates
        if (certificateUpdates.length > 0) {
          await Promise.all(
            certificateUpdates.map((row) =>
              window.supabase
                .from("certificates")
                .update({
                  employee_id: row.employee_id,
                  name: row.name,
                  institute: row.institute,
                  cert_date: row.cert_date,
                  country: row.country,
                  expiry_date: row.expiry_date,
                  company_id: row.company_id,
                  created_by: row.created_by,
                })
                .eq("id", row.id)
            )
          );
        }

        // Execute certificate inserts
        if (certificateInserts.length > 0) {
          const certificateResult = await window.supabase
            .from("certificates")
            .insert(certificateInserts);

          if (certificateResult.error) {
            throw new Error(
              `Failed to insert certificates: ${certificateResult.error.message}`
            );
          }
        }

        // 4. Handle Languages Updates and Inserts
        const languageUpdates = [];
        const languageInserts = [];

        values.languages.forEach((row) => {
          if (row.id) {
            languageUpdates.push({
              id: row.id,
              employee_id: null,
              company_id: companyId || 1,
              name: row.language,
              read: row.read,
              write: row.write,
              speak: row.speak,
              created_by: employeeId || null,
            });
          } else if (row.language) {
            languageInserts.push({
              candidate_id: id,
              employee_id: null,
              company_id: companyId || 1,
              name: row.language,
              read: row.read,
              write: row.write,
              speak: row.speak,
              created_by: employeeId || null,
            });
          }
        });

        // Execute language updates
        if (languageUpdates.length > 0) {
          await Promise.all(
            languageUpdates.map((row) =>
              window.supabase
                .from("languages")
                .update({
                  employee_id: row.employee_id,
                  company_id: row.company_id,
                  name: row.name,
                  read: row.read,
                  write: row.write,
                  speak: row.speak,
                  created_by: row.created_by,
                })
                .eq("id", row.id)
            )
          );
        }

        // Execute language inserts
        if (languageInserts.length > 0) {
          const languageResult = await window.supabase
            .from("languages")
            .insert(languageInserts);

          if (languageResult.error) {
            throw new Error(
              `Failed to insert languages: ${languageResult.error.message}`
            );
          }
        }

        // 5. Handle Competencies Updates and Inserts
        const competencyUpdates = [];
        const competencyInserts = [];

        values.competencies.forEach((row) => {
          if (row.id) {
            competencyUpdates.push({
              id: row.id,
              employee_id: null,
              company_id: companyId || 1,
              name: row.competency,
              type: row.type,
              level: row.level,
              created_by: employeeId || null,
            });
          } else if (row.competency || row.type) {
            competencyInserts.push({
              candidate_id: id,
              employee_id: null,
              company_id: companyId || 1,
              name: row.competency,
              type: row.type,
              level: row.level,
              created_by: employeeId || null,
            });
          }
        });

        // Execute competency updates
        if (competencyUpdates.length > 0) {
          await Promise.all(
            competencyUpdates.map((row) =>
              window.supabase
                .from("competencies")
                .update({
                  employee_id: row.employee_id,
                  company_id: row.company_id,
                  name: row.name,
                  type: row.type,
                  level: row.level,
                  created_by: row.created_by,
                })
                .eq("id", row.id)
            )
          );
        }

        // Execute competency inserts
        if (competencyInserts.length > 0) {
          const competencyResult = await window.supabase
            .from("competencies")
            .insert(competencyInserts);

          if (competencyResult.error) {
            throw new Error(
              `Failed to insert competencies: ${competencyResult.error.message}`
            );
          }
        }

        // 6. Handle Experience Updates and Inserts (if needed)
        const experienceUpdates = [];
        const experienceInserts = [];

        if (values.experience) {
          values.experience.forEach((row) => {
            if (row.id) {
              experienceUpdates.push({
                id: row.id,
                employee_id: null,
                company_id: companyId || 1,
                company_name: row.company_name,
                job_title: row.jobTitle,
                industry: row.industry,
                country: row.country,
                city: row.city,
                salary: row.salary ? Number.parseFloat(row.salary) : null,
                currency: row.currency,
                from_date: row.fromDate || null,
                to_date: row.currentlyWorking ? null : row.toDate || null,
                currently_working: row.currentlyWorking || false,
                reason_for_leaving: row.reason || null,
                source: row.source || null,
                available_positions: values.availablePosition || null,
                current_benefits: values.currentBenefits || null,
                created_by: employeeId || null,
              });
            } else if (row.company_name || row.jobTitle) {
              experienceInserts.push({
                candidate_id: id,
                employee_id: null,
                company_id: companyId || 1,
                company_name: row.company_name,
                job_title: row.jobTitle,
                industry: row.industry,
                country: row.country,
                city: row.city,
                salary: row.salary ? Number.parseFloat(row.salary) : null,
                currency: row.currency,
                from_date: row.fromDate || null,
                to_date: row.currentlyWorking ? null : row.toDate || null,
                currently_working: row.currentlyWorking || false,
                reason_for_leaving: row.reason || null,
                source: row.source || null,
                available_positions: values.availablePosition || null,
                current_benefits: values.currentBenefits || null,
                created_by: employeeId || null,
              });
            }
          });

          // Execute experience updates
          if (experienceUpdates.length > 0) {
            await Promise.all(
              experienceUpdates.map((row) =>
                window.supabase
                  .from("experience")
                  .update({
                    employee_id: row.employee_id,
                    company_id: row.company_id,
                    company_name: row.company_name,
                    job_title: row.job_title,
                    industry: row.industry,
                    country: row.country,
                    city: row.city,
                    salary: row.salary,
                    currency: row.currency,
                    from_date: row.from_date,
                    to_date: row.currently_working ? null : row.to_date,
                    currently_working: row.currently_working,
                    reason_for_leaving: row.reason_for_leaving,
                    source: row.source,
                    available_positions: row.available_positions,
                    current_benefits: row.current_benefits,
                    created_by: row.created_by,
                  })
                  .eq("id", row.id)
              )
            );
          }

          // Execute experience inserts
          if (experienceInserts.length > 0) {
            const experienceResult = await window.supabase
              .from("experience")
              .insert(experienceInserts);

            if (experienceResult.error) {
              throw new Error(
                `Failed to insert experience: ${experienceResult.error.message}`
              );
            }
          }
        }

        // 7. Handle Relatives/Referrals Updates and Inserts
        const referralUpdates = [];
        const referralInserts = [];

        values.relatives.forEach((row) => {
          if (row.id) {
            referralUpdates.push({
              id: row.id,
              referrer_name: row.relative,
              relationship: row.relationship || null,
              branch_id: row.branch ? Number(row.branch) : null,
              unit_id: row.unit ? Number(row.unit) : null,
              department_id: row.department ? Number(row.department) : null,
              division: row.division || null,
              section: row.section || null,
              job_title: row.jobTitle || null,
              company_id: companyId || 1,
              created_by: employeeId || null,
            });
          } else if (row.relative) {
            referralInserts.push({
              candidate_id: id,
              referrer_name: row.relative,
              relationship: row.relationship || null,
              branch_id: row.branch ? Number(row.branch) : null,
              unit_id: row.unit ? Number(row.unit) : null,
              department_id: row.department ? Number(row.department) : null,
              division: row.division || null,
              section: row.section || null,
              job_title: row.jobTitle || null,
              company_id: companyId || 1,
              created_by: employeeId || null,
            });
          }
        });

        // Execute referral updates
        if (referralUpdates.length > 0) {
          await Promise.all(
            referralUpdates.map((row) =>
              window.supabase
                .from("candidate_referral")
                .update({
                  referrer_name: row.referrer_name,
                  relationship: row.relationship,
                  branch_id: row.branch_id,
                  unit_id: row.unit_id,
                  department_id: row.department_id,
                  division: row.division,
                  section: row.section,
                  job_title: row.job_title,
                  created_by: row.created_by,
                  company_id: row.company_id,
                })
                .eq("id", row.id)
            )
          );
        }

        // Execute referral inserts
        if (referralInserts.length > 0) {
          const referralResult = await window.supabase
            .from("candidate_referral")
            .insert(referralInserts);

          if (referralResult.error) {
            throw new Error(
              `Failed to insert referrals: ${referralResult.error.message}`
            );
          }
        }

        toast.success("Candidate updated successfully");
        !isPublicView &&
          navigate("/admin/human-resource/talent-acquisition/candidates");
      } catch (err) {
        console.error("Update failed", err);
        toast.error(`Failed to update candidate: ${err.message}`);
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
      return;
    }

    let can_id;
    try {
      let password = hashPassword(values.password);
      const candidatePayload = {
        candidate_no: values.candidateNumber,
        department: values.department ? Number(values.department) : null,
        company_id: companyId || 1,
        designation: isCustomDesignation
          ? null
          : values.designation
          ? Number(values.designation)
          : null,
        own_designation: isCustomDesignation ? values.customDesignation : null,
        vacancy: isCustomVacancy
          ? null
          : values.vacancy
          ? Number(values.vacancy)
          : null,
        own_vacancy: isCustomVacancy ? values.customVacancy : null,
        filing_date: values.filingDate,
        cv: values.uploadCV,
        first_name: values.firstNameEn,
        second_name: values.secondNameEn,
        third_name: values.thirdNameEn,
        forth_name: values.fourthNameEn,
        family_name: values.familyNameEn,
        national_id: values.nationalId,
        national_id_issue: values.national_id_issue,
        national_id_expiry: values.national_id_expiry,
        nationality: values.nationality,
        national_image: values.uploadNationalID,
        gender: values.gender,
        blood_group: values.bloodType,
        religion: values.religion,
        country: values.country,
        state: values.state,
        city: values.city,
        po_box: values.poBox,
        zip_code: values.zipCode,
        street_name: values.street_name,
        neighbour_name: values.neighbour_name,
        building_number: values.building_number,
        additional_number: values.additional_number,
        telephone: values.telephone,
        mobile: values.mobile,
        other_number: values.otherPhone,
        relative_name: values.relative_name,
        email: values.email,
        driving_license: values.drivingLicense,
        address: values.address,
        notes: values.notes,
        birth_place: values.birthPlace,
        date_of_birth: values.dateOfBirth,
        passport_type: values.passportType,
        passport_number: values.passportNumber,
        issue_place: values.issuePlace,
        issue_date: values.issueDate,
        expiry_date: values.expiryDate,
        passport_image: values.uploadPassport,
        // high_school_average: values.highSchoolAverage,
        // high_school_stream: values.highSchoolStream,
        has_expierence: values.has_expierence,
        experience_years: values.experienceYears,
        number_of_subordinates: values.numberOfSubordinates,
        expected_salary: values.expectedSalary,
        computer_skills: values.computerSkills,
        available_position: values.availablePosition,
        current_benefits: values.currentBenefits,
        marital_status: values.maritalStatus || "single",
        family_members:
          values.maritalStatus === "married" ? +values.familyMembers : 0,
        created_by: employeeId || null,
        password: password,
        licence_number: values.licence_number,
        licence_expiry_date: values.licence_expiry_date ?? null,
        licence_attachment: values.licence_attachment,
        height: values.height,
        weight: values.weight,
        dangerious_disease: values.dangerious_disease || "",
        disease_details: values.disease_details || "",
        mental_illness: values.mental_illness || "",
        illness_details: values.illness_details || "",
        surgery: values.surgery || "",
        suregry_details: values.suregry_details || "",
        drugs: values.drugs || "",
        drugs_details: values.drugs_details || "",
        defaulted: values.defaulted || "",
        defaulted_details: values.defaulted_details || "",
        dismissed: values.dismissed || "",
        dismissed_details: values.dismissed_details || "",
        extra_hours: values.extra_hours || "",
        extra_hours_details: values.extra_hours_details || "",
        relative: values.relative || "",
        relatives_details: values.relatives_details || "",
        disclaimer: values.disclaimer,
      };

      const submitCandidate = await supaBaseCreateCall(
        "candidates",
        candidatePayload
      );
      can_id = submitCandidate?.id;

      // Prepare child data
      const educationPayloads = values.education
        ?.filter((row) => row.education || row.major || row.instituteName)
        .map((row) => ({
          candidate_id: submitCandidate?.id,
          employee_id: null,
          education: row.education,
          major: row.major,
          other_major: row.otherMajor || null,
          institute_name: row.instituteName,
          grade: row.grade,
          passing_year: row.passingYear
            ? Number.parseInt(row.passingYear, 10)
            : null,
          type: null,
          company_id: companyId || 1,
          created_by: employeeId || null,
          attachment: row.attachment || null,
        }));

      const certificatePayloads = values.certifications
        ?.filter((cert) => cert.certificate || cert.institute)
        .map((cert) => ({
          candidate_id: submitCandidate?.id,
          employee_id: null,
          name: cert.certificate,
          institute: cert.institute,
          cert_date: cert.certificationDate || null,
          attachment: cert.attachment || null,
          country: cert.country,
          expiry_date: cert.expiryDate || null,
          company_id: companyId || 1,
          created_by: employeeId || null,
        }));

      const experiencePayloads = values.experience
        ?.filter((row) => row.company_name || row.jobTitle)
        .map((row) => ({
          candidate_id: submitCandidate?.id,
          employee_id: null,
          company_id: companyId || 1,
          company_name: row.company_name,
          job_title: row.jobTitle,
          industry: row.industry,
          country: row.country,
          city: row.city,
          salary: row.salary ? Number.parseFloat(row.salary) : null,
          currency: row.currency,
          from_date: row.fromDate || null,
          to_date: row.currentlyWorking ? null : row.toDate || null,
          currently_working: row.currentlyWorking || false,
          reason_for_leaving: row.reason || null,
          source: row.source || null,
          available_positions: values.availablePosition || null,
          current_benefits: values.currentBenefits || null,
          created_by: employeeId || null,
        }));

      const languagePayloads = values.languages
        ?.filter((row) => row.language)
        .map((row) => ({
          candidate_id: submitCandidate?.id,
          employee_id: null,
          company_id: companyId || 1,
          name: row.language,
          read: row.read,
          write: row.write,
          speak: row.speak,
          created_by: employeeId || null,
        }));

      const competencyPayloads = (values?.competencies ?? [])
        .filter((row) => (row?.name ?? "").trim() !== "")
        .map((row) => ({
          candidate_id: submitCandidate?.id ?? null,
          employee_id: null,
          company_id: companyId ?? 1,
          name: row.name, // <-- was row.competency
          type: row.type ?? "",
          level: row.level ?? null,
          created_by: employeeId ?? null,
        }));

      const referralPayloads = values.relatives
        ?.filter((row) => row.relative)
        .map((row) => ({
          candidate_id: submitCandidate?.id,
          referrer_name: row.relative,
          relationship: row.relationship || null,
          branch_id: row.branch ? Number(row.branch) : null,
          unit_id: row.unit ? Number(row.unit) : null,
          department_id: row.department ? Number(row.department) : null,
          division: row.division || null,
          section: row.section || null,
          job_title: row.jobTitle || null,
          company_id: companyId || 1,
          created_by: employeeId || null,
        }));

      if (submitCandidate?.id) {
        // Insert new child rows
        await Promise.all(
          [
            educationPayloads?.length > 0 &&
              supaBaseCreateMultipleCall("education", educationPayloads),
            certificatePayloads?.length > 0 &&
              supaBaseCreateMultipleCall("certificates", certificatePayloads),
            experiencePayloads?.length > 0 &&
              supaBaseCreateMultipleCall("experience", experiencePayloads),
            languagePayloads?.length > 0 &&
              supaBaseCreateMultipleCall("languages", languagePayloads),
            competencyPayloads?.length > 0 &&
              supaBaseCreateMultipleCall("competencies", competencyPayloads),
            referralPayloads?.length > 0 &&
              supaBaseCreateMultipleCall(
                "candidate_referral",
                referralPayloads
              ),
          ].filter(Boolean)
        );

        const candidateName = {
          first_name: candidatePayload?.first_name,
          second_name: candidatePayload?.second_name,
          third_name: candidatePayload?.third_name,
          forth_name: candidatePayload?.forth_name,
        };
        if (can_id) {
          await signUp(candidatePayload?.email, candidateName, can_id);
        }

        // Create assigned tasks for the candidate (only for new candidates)

        // try {
        //   // First, create the tasks in the tasks table
        //   const newTasks = [
        //     {
        //       name: "Perform SIMH check",
        //       description: "Perform SIMH check for the candidate",
        //       status: "active",
        //       organizational_structure_id: values.department
        //         ? Number(values.department)
        //         : null,
        //       type: "general",
        //       task_type: "pre_on_boarding",
        //     },
        //     {
        //       name: "Make inquiry in financial crime",
        //       description: "Make inquiry in financial crime for the candidate",
        //       status: "active",
        //       organizational_structure_id: values.department
        //         ? Number(values.department)
        //         : null,
        //       type: "general",
        //       task_type: "pre_on_boarding",
        //     },
        //   ];

        //   // Insert tasks and get their IDs
        //   const { data: createdTasks, error: tasksError } = await supabase
        //     .from("tasks")
        //     .insert(newTasks)
        //     .select("id");

        //   console.log({ createdTasks });
        //   const AssignTaskdataPayload = createdTasks?.map((item) => {
        //     return {
        //       task_id: item.id,
        //       assigned_to_id: item.assigned_id_master,
        //       candidate_id: submitCandidate?.id,
        //       status: "unassigned",
        //     };
        //   });
        //   console.log({ AssignTaskdataPayload });
        //   const { taskData: createdUnassignedTasks, error: AssigntasksError } =
        //     await supabase
        //       .from("assigned_tasks")
        //       .insert(AssignTaskdataPayload)
        //       .select("id");
        // } catch (err) {
        //   console.error("Error creating tasks:", err);
        //   toast.error("Failed to create tasks");
        // }

        try {
  // 1. Fetch tasks dynamically based on conditions
  const { data: fetchedTasks, error: fetchError } = await supabase
    .from("tasks")
    .select("id, assigned_id_master") // only fetch needed columns
    .eq("employment_type_id", 21)
    .eq("task_type", "pre_on_boarding")
    .eq("status", "active"); // optional: only active tasks


  if (fetchError) {
    throw fetchError;
  }

  if (!fetchedTasks || fetchedTasks.length === 0) {
    console.warn("⚠️ No tasks found for pre_on_boarding with employment_type_id=21");
    return;
  }


  // 2. Prepare payload for assigned_tasks
  const AssignTaskdataPayload = fetchedTasks.map((task) => ({
    task_id: task.id,
    candidate_id: submitCandidate?.id,
    status: "unassigned",
  }));


  // 3. Insert into assigned_tasks
  const { data: createdAssignedTasks, error: assignError } = await supabase
    .from("assigned_tasks")
    .insert(AssignTaskdataPayload)
    .select("id");

  if (assignError) {
    throw assignError;
  }

  toast.success("Pre-onboarding tasks assigned successfully!");
} catch (err) {
  console.error("❌ Error creating tasks:", err);
  toast.error("Failed to assign pre-onboarding tasks");
}


        toast.success("Candidate has been added successfully");
        !isPublicView &&
          navigate("/admin/human-resource/talent-acquisition/candidates");
        // resetForm();
      } else {
        toast.error("Candidate has not been added, try again");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to submit candidate data");
    }
  };

  return (
    <PageWrapperWithHeading
      title={id ? "Update Candidate" : "Add Candidate"}
      items={breadcrumbItems}
      isPublicView={isPublicView}
    >
      <div
        className={`${
          isPublicView ? "h-[calc(100vh-80px)]" : "h-[calc(100vh-222px)]"
        } flex flex-col`}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={
            id
              ? getCandidateValidationSchema(true)
              : getCandidateValidationSchema(false)
          }
          onSubmit={handleSubmit}
          enableReinitialize
          validationContext={{ isUpdate: !!id }}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form className="flex flex-col flex-1 overflow-hidden p-4 space-y-4 bg-white rounded-lg shadow-md">
              <div className="overflow-y-auto space-y-6 flex-1">
                <div className="text-lg font-bold">Candidate Information</div>

                {/* Debug validation errors - Remove this in production */}
                {/* {process.env.NODE_ENV === "development" && Object?.keys(errors)?.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800">Validation Errors:</h4>
                      <pre className="text-sm text-red-600 mt-2">{JSON.stringify(errors, null, 2)}</pre>
                    </div>
                  )}  */}

                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <FormikInputField
                    name="candidateNumber"
                    label="Candidate Number"
                    disabled
                  />

                  {/* Department field: show name in disabled input in edit mode, select in add mode */}
                  {/* {id && !isPublicView ? (
                    <FormikInputField
                      name="department"
                      label="Our Departments"
                      value={departmentName}
                      disabled
                    />
                  ) : (
                    <FormikSelectField
                      name="department"
                      label="Our Departments"
                      options={departmentData}
                      onChange={(value) => {
                        setFieldValue("department", value);
                        setSelectedDepartment(value);
                        setFieldValue("designation", ""); // reset designation
                      }}
                      required
                      disabled={!!id && !isPublicView}
                    />
                  )} */}

                  <FormikInputField
                    name="filingDate"
                    label="Filing Date"
                    placeholder="MM/DD/YYYY"
                    type="date"
                    required
                    disabled
                    max="2100-12-31"
                  />

                  <FileUploadField
                    label="Upload CV"
                    type="file"
                    name="uploadCV"
                    onChange={(url) => setFieldValue("uploadCV", url)}
                    required
                    disabled={!!id && !isPublicView}
                  />
                </div>

                <InformationForm
                  values={values}
                  setFieldValue={setFieldValue}
                  countryOptions={countryOptions}
                  stateOptions={stateOptions}
                  setSelectedCounty={setSelectedCounty}
                  cityOptions={cityOptions}
                  setSelectedState={setSelectedState}
                  id={id}
                  isPublicView={isPublicView}
                />

                <div className="text-lg font-bold">
                  Academic Qualifications & Training Courses
                </div>
                {/* TABS */}
                <div className="my-2">
                  <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {activeTab === "Education" && (
                  <EducationTable
                    values={values}
                    id={id}
                    isPublicView={isPublicView}
                  />
                )}
                {activeTab === "Certifications" && (
                  <CertificationTable
                    values={values}
                    countryOptions={countryOptions}
                    id={id}
                    isPublicView={isPublicView}
                  />
                )}
                {activeTab === "Experiences" && (
                  <ExperienceTable
                    values={values}
                    countryOptions={countryOptions}
                    id={id}
                    isPublicView={isPublicView}
                  />
                )}
                {activeTab === "Languages" && (
                  <LanguageTable
                    values={values}
                    id={id}
                    isPublicView={isPublicView}
                  />
                )}
                {activeTab === "Skills" && (
                  <CompetencyTable
                    values={values}
                    id={id}
                    isPublicView={isPublicView}
                  />
                )}
                {activeTab === "Relatives" &&
                  (branches ? (
                    <RelativesTable
                      values={values}
                      organizationalChilds={organizationalChilds}
                      setSelectedOrganizationalUnits={
                        setSelectedOrganizationalUnits
                      }
                      organizationalUnits={organizationalUnits}
                      branches={branches}
                      id={id}
                      isPublicView={isPublicView}
                    />
                  ) : (
                    <div>Loading branches...</div>
                  ))}

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Department field: show name in disabled input in edit mode, select in add mode */}
                  {id && !isPublicView ? (
                    <FormikInputField
                      name="department"
                      label="Our Departments"
                      value={departmentName}
                      disabled
                    />
                  ) : (
                    <FormikSelectField
                      name="department"
                      label="Our Departments"
                      options={departmentData}
                      onChange={(value) => {
                        setFieldValue("department", value);
                        setSelectedDepartment(value);
                        setFieldValue("designation", ""); // reset designation
                      }}
                      required
                      disabled={!!id && !isPublicView}
                    />
                  )}

                  {/* Designation and Vacancy on the same row */}
                  {id && !isPublicView ? (
                    <>
                      {/* <div className="grid grid-cols-2 gap-4"> */}
                      <FormikInputField
                        name="designation"
                        label="Designation"
                        value={initialValues?.designationName || ""}
                        disabled
                      />
                      <FormikInputField
                        name="vacancy"
                        label="Vacancy"
                        value={initialValues?.vacancyTitle || ""}
                        disabled
                      />
                      {/* </div> */}
                      {/* Show custom fields if they exist */}
                      {initialValues?.own_designation && (
                        <div className="mt-2">
                          <FormikInputField
                            name="customDesignation"
                            label="Your own Designation"
                            value={initialValues.own_designation}
                            disabled
                          />
                        </div>
                      )}
                      {initialValues.own_vacancy && (
                        <div className="mt-2">
                          <FormikInputField
                            name="customVacancy"
                            label="Your own Vacancy"
                            value={initialValues.own_vacancy}
                            disabled
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* <div className="grid grid-cols-2 gap-4"> */}
                      <FormikSelectField
                        name="designation"
                        label="Designation"
                        options={[
                          ...(designationData || []),
                          { label: "Others", value: "others" },
                        ]}
                        onChange={(value) => {
                          setFieldValue("designation", value);
                          setIsCustomDesignation(value === "others");
                          if (value !== "others") {
                            setCustomDesignation("");
                            setFieldValue("customDesignation", "");
                          }
                        }}
                        required
                        value={
                          designationData?.find(
                            (opt) =>
                              opt.value ===
                              (isCustomDesignation
                                ? "others"
                                : values.designation)
                          )?.value ||
                          (isCustomDesignation ? "others" : values.designation)
                        }
                      />
                      <FormikSelectField
                        name="vacancy"
                        label="Vacancy"
                        options={[
                          ...(vacancies?.filter((v) => {
                            const candidateEducations =
                              values.education?.map((e) =>
                                (e.education || "").toLowerCase()
                              ) || [];
                            return (
                              v.education &&
                              candidateEducations.includes(
                                (v.education || "").toLowerCase()
                              )
                            );
                          }) || []),
                          { label: "Others", value: "others" },
                        ]}
                        onChange={(value) => {
                          setFieldValue("vacancy", value);
                          setIsCustomVacancy(value === "others");

                          if (value !== "others") {
                            setCustomVacancy("");
                            setFieldValue("customVacancy", "");
                          }
                        }}
                        required
                        value={
                          vacancies?.find((opt) => {
                            const candidateEducations =
                              values.education?.map((e) =>
                                (e.education || "").toLowerCase()
                              ) || [];
                            return (
                              opt.value ===
                                (isCustomVacancy ? "others" : values.vacancy) &&
                              opt.education &&
                              candidateEducations.includes(
                                (opt.education || "").toLowerCase()
                              )
                            );
                          })?.value ||
                          (isCustomVacancy ? "others" : values.vacancy)
                        }
                      />

                      {/* <FormikSelectField
  name="vacancy"
  label="Vacancy"
  options={[...(vacancies || []), { label: "Others", value: "others" }]}
  value={
    isCustomVacancy
      ? "others"
      : (values.vacancy ?? "").toString()
  }
  onChange={(value) => {
    setFieldValue("vacancy", value);
    setIsCustomVacancy(value === "others");
    if (value !== "others") {
      setCustomVacancy("");
      setFieldValue("customVacancy", "");
    }
  }}
  required
  disabled={!!id && !isPublicView}
/> */}
                      {/* </div> */}
                      {(isCustomDesignation ||
                        (id &&
                          (values.customDesignation ||
                            initialValues.customDesignation))) && (
                        <div className="mt-2">
                          <FormikInputField
                            name="customDesignation"
                            label="Your own Designation"
                            required
                          />
                        </div>
                      )}
                      {(isCustomVacancy ||
                        (id &&
                          (values.customVacancy ||
                            initialValues.customVacancy))) && (
                        <div className="mt-2">
                          <FormikInputField
                            name="customVacancy"
                            label="Your own Vacancy"
                            required
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* CANDIDATE EXPERIENCE FORM */}
                <HealthForm
                  vacancies={vacancies}
                  values={values}
                  id={id}
                  isPublicView={isPublicView}
                  setFieldValue={setFieldValue}
                />

                {/* CANDIDATE EXPERIENCE FORM */}
                <CandidateExperienceForm
                  vacancies={vacancies}
                  id={id}
                  isPublicView={isPublicView}
                />
                <div className="text-lg font-bold">Set Password</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <FormikInputField
                    name="password"
                    label="Password"
                    type="password"
                    required={!id}
                    placeholder={"Enter password"}
                    disabled={!!id && !isPublicView}
                  />
                  <FormikInputField
                    name="confirm_password"
                    label="Confirm Password"
                    type="password"
                    required={!id}
                    placeholder={"Confirm password"}
                    disabled={!!id && !isPublicView}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <FormikCheckbox
                    name="disclaimer"
                    checked={values.disclaimer}
                    label={
                      <p>
                        I, the undersigned, declare that all information
                        provided is true and correct, and I take full
                        responsibility for any incorrect information, which may
                        lead to termination if I am employed.<br></br>This
                        declaration shall be considered an integral part of the
                        employment contract between myself and the company if I
                        am appointed as one of its employees.
                      </p>
                    }
                    disabled={!!id && !isPublicView}
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="mt-4 sticky bottom-0 flex justify-end">
                <SubmitButton
                  title={id && !isPublicView ? "" : id ? "Update" : "Add"}
                  type="submit"
                  isLoading={isSubmitting || loading}
                  disabled={isSubmitting || (!!id && !isPublicView)}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </PageWrapperWithHeading>
  );
};

export default CandidateForm;
