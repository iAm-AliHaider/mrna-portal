import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { useUser } from "../../context/UserContext";
import FormikInputField from "../../components/common/FormikInputField";
import FormikRadioGroup from "../../components/common/RadioGroup";
import FormikSelectField from "../../components/common/FormikSelectField";
import SubmitButton from "../../components/common/SubmitButton";
import { useEmployeeRecord } from "../../context/EmployeeRecordContext";
import {
  useGetAllEmployeeFormOptions,
  useUpdateEmployeeRecord,
} from "../../utils/hooks/api/employeeRecords";
import ProfileImageUploader from "./profileImage";
import { Country } from "country-state-city";
import FormikCheckbox from "../../components/common/FormikCheckbox";
import FormikMultiSelectField from "../../components/common/FormikMultiSelectField";
import FileUploadField from "../../components/common/FormikFileUpload";

import EducationTable from "../Admin/humanResource/talentAcquisition/candidates/CandidateForm/educationTableForm";
import CertificationTable from "../Admin/humanResource/talentAcquisition/candidates/CandidateForm/certificateTableForm";
import TabBar from "../Admin/humanResource/talentAcquisition/candidates/CandidateForm/tabs";
import ExperienceTable from "../Admin/humanResource/talentAcquisition/candidates/CandidateForm/experienceTableForm";
import LanguageTable from "../Admin/humanResource/talentAcquisition/candidates/CandidateForm/languagesTableForm";
import CompetencyTable from "../Admin/humanResource/talentAcquisition/candidates/CandidateForm/skillsTableForm";
import RelativesTable from "../Admin/humanResource/talentAcquisition/candidates/CandidateForm/relativesTableForm";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const religionOptions = [
  { label: "Islam", value: "Islam" },
  { label: "Christan", value: "Christan" },
  { label: "Hindu", value: "Hindu" },
  { label: "Others", value: "Others" },
];

const maritalStatusOptions = [
  { label: "Married", value: "married" },
  { label: "Single", value: "single" },
  { label: "Divorced", value: "divorced" },
];

const militaryStatusOptions = [
  { label: "Exempted", value: "exempted" },
  { label: "Postponed", value: "postponed" },
  { label: "Completed", value: "completed" },
];

const validationSchema = Yup.object({
  first_name: Yup.string().required("First Name is required"),
  family_name: Yup.string().required("Family Name is required"),
  date_of_birth: Yup.string().required("Date of Birth is required"),
  marital_status: Yup.string().required("Marital Status is required"),
  religion: Yup.string().required("Religion is required"),
  gender: Yup.string().required("Gender is required"),

  // exempted_reason: Yup.string().when('military_status', {
  //   is: 'exempted',
  //   then: schema => schema.required('Exemption reason is required'),
  //   otherwise: schema => schema.nullable()
  // }),

  completed_on: Yup.date().when("military_status", {
    is: "completed",
    then: (schema) => schema.required("Completion date is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  postponed_until: Yup.date().when("military_status", {
    is: "postponed",
    then: (schema) => schema.required("Postponed until date is required"),
    otherwise: (schema) => schema.nullable(),
  }),
});

const UserProfile = () => {
  const { user, setUser } = useUser();
  const [countryOptions, setCountryOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("Education");
  const [id, setId] = useState(null);
  const isPublicView = false;

  const [details, setDetails] = useState({
    education: [],
    certifications: [],
    experience: [],
    languages: [],
    competencies: [],
    relatives: [],
  });

  const {
    designations,
    branches,
    units,
    employmentTypes,
    loading: optionsLoading,
  } = useGetAllEmployeeFormOptions();

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formatted = allCountries?.map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
    setCountryOptions(formatted);
  }, []);

  const { updateRecord, loading: updateLoading } = useUpdateEmployeeRecord();

  const initialValuesWithRecord = {
    first_name: user?.first_name || "",
    second_name: user?.second_name || "",
    third_name: user?.third_name || "",
    forth_name: user?.forth_name || "",
    family_name: user?.family_name || "",
    gender: user?.gender || "",
    maritalStatus: user?.marital_status || "",
    religion: user?.religion || "",
    designation: user?.designation || "",
    officialTitle: user?.official_title || "",
    branch_id: user?.branch_id || "",
    license: user?.license || "",
    organizational_unit_id: user?.organizational_unit_id || "",
    employment_type_id: user?.employment_type_id || "",
    profile_image: user?.profile_image || "",
    marital_status: user?.marital_status || "",
    date_of_birth: user?.date_of_birth || "",
    birth_place: user?.birth_place || "",
    mother_name: user?.mother_name || "",
    is_extended_retirement: user?.is_extended_retirement || false,
    is_smoker: user?.is_smoker || false,
    is_enrolled_in_education: user?.enrolled_in_education || false,
    tax_id: user?.tax_id || "",
    military_status: user?.military_status || "exempted",
    exempted_reason: user?.exempted_reason || "",
    postponed_until: user?.postponed_until || null,
    completed_on: user?.completed_on || null,
    electronic_signature: user?.electronic_signature || "",
    registration_place: user?.registration_place || "",
    nationality: user?.nationality || "",
    national_id_expiry: user?.national_id_expiry ? user.national_id_expiry : "",
    expiry_date: user?.expiry_date ? user.expiry_date : "",
    other_nationalities: user?.other_nationalities || "",
    social_security_no: user?.social_security_no || "",
    national_id: user?.national_id || "",
    work_email: user?.work_email || "",
    email: user?.email || "",

    education: (details?.education || []).map((e) => ({
      id: e.id, // CRITICAL: Include the ID for updates
      education: e.education || "",
      major: e.major || "",
      otherMajor: e.other_major || "",
      instituteName: e.institute_name || "",
      grade: e.grade || "",
      passingYear: e.passing_year ? String(e.passing_year) : "",
      attachment: e.attachment || "",
    })),
    certifications: (details?.certifications || []).map((c) => ({
      id: c.id, // CRITICAL: Include the ID for updates
      certificate: c.name || "",
      institute: c.institute || "",
      certificationDate: c.cert_date || "",
      country: c.country || "",
      expiryDate: c.expiry_date || null,
      attachment: c.attachment || "",
    })),
    has_expierence: details?.candidates?.has_expierence || "",
    experience: (details?.experience || []).map((ex) => ({
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
    languages: (details?.languages || []).map((l) => ({
      id: l.id, // CRITICAL: Include the ID for updates
      language: l.name || "",
      read: l.read || "",
      write: l.write || "",
      speak: l.speak || "",
    })),
    competencies: (details?.competencies || []).map((c) => ({
      id: c.id, // CRITICAL: Include the ID for updates
      type: c.type || "",
      name: c.name || "",
      level: c.level || "",
    })),
    relatives: (details?.relatives || []).map((r) => ({
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
  };

  useEffect(() => {
    if (!initialValuesWithRecord) return;
    setId(initialValuesWithRecord.candidate_id);

    const fetchDetails = async () => {
      const [
        { data: education, error: eduError },
        { data: certifications, error: certError },
        { data: experience, error: expError },
        { data: languages, error: langError },
        { data: competencies, error: compError },
        { data: relatives, error: relError },
      ] = await Promise.all([
        window.supabase
          .from("education")
          .select("*")
          .eq("candidate_id", user?.candidate_id),
        window.supabase
          .from("certificates")
          .select("*")
          .eq("candidate_id", user?.candidate_id),
        window.supabase
          .from("experience")
          .select("*")
          .eq("candidate_id", user?.candidate_id),
        window.supabase
          .from("languages")
          .select("*")
          .eq("candidate_id", user?.candidate_id),
        window.supabase
          .from("competencies")
          .select("*")
          .eq("candidate_id", user?.candidate_id),
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
          .eq("candidate_id", user?.candidate_id),
      ]);

      if (
        eduError ||
        certError ||
        expError ||
        langError ||
        compError ||
        relError
      ) {
        console.error("One or more queries failed:", {
          eduError,
          certError,
          expError,
          langError,
          compError,
          relError,
        });
      }

      setDetails({
        education,
        certifications,
        experience,
        languages,
        competencies,
        relatives,
      });
    };

    fetchDetails();
  }, [initialValuesWithRecord]);

  const handleSubmit = async (values) => {
    const candidate = {
      id: user?.candidate_id || "",
      first_name: values?.first_name || "",
      second_name: values?.second_name || "",
      third_name: values?.third_name || "",
      forth_name: values?.forth_name || "",
      family_name: values?.family_name || "",
      gender: values?.gender || "",
      // marital_status: values?.marital_status || '',
      religion: values?.religion || "",
      designation: values?.designation || null,
      marital_status: values?.marital_status || "",
      date_of_birth: values?.date_of_birth || "",
      // hijriDateOfBirth: values?.hijri_date_of_birth || '',
      birth_place: values?.birth_place || "",
      // birth_place_en: values?.birth_place_en || '',
      mother_name: values?.mother_name || "",
      is_extended_retirement: values?.is_extended_retirement || false,
      is_smoker: values?.is_smoker || false,
      is_enrolled_in_education: values?.enrolled_in_education || false,
      tax_id: values?.tax_id || "",
      military_status: values?.military_status || "exempted",
      exempted_reason: values?.exempted_reason || "",
      postponed_until: values?.postponed_until || null,
      completed_on: values?.completed_on || null,
      electronic_signature: values?.electronic_signature || "",
      registration_place: values?.registration_place || "",
      nationality: values?.nationality || "",
      national_id_expiry: values?.national_id_expiry || null,
      expiry_date: values?.expiry_date || null,
      other_nationalities: values?.other_nationalities || "",
      social_security_no: values?.social_security_no || "",
      national_id: values?.national_id || "",
      // officialTitle: values?.official_title || ''
    };
    const employee = {
      id: user?.id || "",
      branch_id: values?.branch_id || "",
      organizational_unit_id: values.organizational_unit_id,
      employment_type_id: values.employment_type_id || null,
      profile_image: values?.profile_image,
      work_email: values?.work_email || "",

      // access_card_number: values?.access_card_number || '',
      // license: values?.license || ''
    };

    await updateRecord({ employee, candidate });

    // const promises = [
    //   ...values.education.map(
    //     (e) =>
    //       window.supabase
    //         .from("education")
    //         .upsert({ ...e, candidate_id: candidate.id }) // upsert ensures insert/update
    //   ),
    //   ...values.certifications.map((c) =>
    //     window.supabase
    //       .from("certificates")
    //       .upsert({ ...c, candidate_id: candidate.id })
    //   ),
    //   ...values.experience.map((ex) =>
    //     window.supabase
    //       .from("experience")
    //       .upsert({ ...ex, candidate_id: candidate.id })
    //   ),
    //   ...values.languages.map((l) =>
    //     window.supabase
    //       .from("languages")
    //       .upsert({ ...l, candidate_id: candidate.id })
    //   ),
    //   ...values.competencies.map((c) =>
    //     window.supabase
    //       .from("competencies")
    //       .upsert({ ...c, candidate_id: candidate.id })
    //   ),
    //   ...values.relatives.map((r) =>
    //     window.supabase
    //       .from("candidate_referral")
    //       .upsert({ ...r, candidate_id: candidate.id })
    //   ),
    // ];

    // await Promise.all(promises);

    setUser({ ...user, ...values });
  };

  return (
    <React.Fragment>
      <Formik
        initialValues={initialValuesWithRecord}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-6">
              <ProfileImageUploader name="profile_image" />
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-5">
                <FormikInputField
                  name="first_name"
                  label="First Name"
                  required
                />
                <FormikInputField name="second_name" label="Second Name" />
                <FormikInputField name="third_name" label="Third Name" />
                <FormikInputField name="forth_name" label="Fourth Name" />
                <FormikInputField
                  name="family_name"
                  label="Family Name"
                  required
                />
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <FormikRadioGroup
                  name="gender"
                  label="Gender"
                  options={genderOptions}
                />
                <FormikSelectField
                  name="religion"
                  label="Religion"
                  options={religionOptions}
                />
                <FormikSelectField
                  name="employment_type_id"
                  label="Employment Type"
                  options={employmentTypes || []}
                  disabled
                  selectKey="id"
                  getOptionLabel={(option) => option.employment_type}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikInputField name="email" label="Email" disabled />
                <FormikInputField
                  name="work_email"
                  label="Work Email"
                  disabled
                />
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
                <FormikSelectField
                  name="designation"
                  label="Employee Designation"
                  options={designations || []}
                  disabled
                  selectKey="id"
                  getOptionLabel={(option) => option.name}
                />

                <FormikSelectField
                  name="branch_id"
                  label="Branch"
                  required
                  options={branches || []}
                  disabled
                  selectKey="id"
                  getOptionLabel={(option) => option.name}
                />
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
                <FormikSelectField
                  name="organizational_unit_id"
                  label="Department"
                  required
                  options={units || []}
                  disabled
                  selectKey="id"
                  getOptionLabel={(option) => option.name}
                />
                {/* <FormikInputField
                  name='accessCardNumber'
                  label='Access Card Number'
                />
                <FormikInputField
                  name='secondAccessCardNumber'
                  label='Second Access Card Number'
                /> */}
                <div className="flex gap-8 mt-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-1">
                      Employment Status
                    </span>
                    <span
                      className={`${
                        user?.user_status === "active"
                          ? "bg-green-200 text-green-600 border-green-600"
                          : "bg-orange-200 text-orange-600 border-orange-600"
                      } text-xs font-medium px-3 py-1 rounded-full border`}
                    >
                      {user?.user_status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {/* <div>
                    <span className='text-sm font-medium text-gray-700 block mb-1'>
                      Attendance Status
                    </span>
                    <span className='bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full border border-purple-300'>
                      Working
                    </span>
                  </div> */}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikRadioGroup
                  name="gender"
                  label="Gender"
                  options={genderOptions}
                />
                <FormikSelectField
                  name="marital_status"
                  label="Marital Status"
                  options={maritalStatusOptions}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikInputField
                  name="date_of_birth"
                  label="Date of Birth"
                  type="date"
                />
                <FormikInputField name="birth_place" label="Place of Birth" />
                {/* <FormikInputField
                  name='hijriDateOfBirth'
                  label='Hijri Date of Birth'
                  type='date'
                /> */}
              </div>

              {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField name='birth_place' label='Place of Birth' />
                <FormikInputField
                  name='birth_place_en'
                  label='Place of Birth in English'
                />
              </div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikSelectField
                  name="religion"
                  label="Religion"
                  options={religionOptions}
                />
                <FormikInputField name="mother_name" label="Mother Name" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormikCheckbox
                  name="is_extended_retirement"
                  label="Extended retirement"
                />
                <FormikCheckbox name="is_smoker" label="Smoker" />
                <FormikCheckbox
                  name="is_enrolled_in_education"
                  label="Employee enrolled in education"
                />
              </div>

              <FormikInputField name="tax_id" label="Employee tax id" />

              {/* <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormikRadioGroup
                  name='military_status'
                  label='Military Service'
                  options={militaryStatusOptions}
                />
                <FormikInputField
                  name='exempted_reason'
                  label='Exempted Reason'
                />
                <FormikInputField
                  name='postponed_until'
                  label='Postponed Until'
                  type='date'
                />
              </div> */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* <FormikInputField
                  name='completed_on'
                  label='Completed On'
                  type='date'
                /> */}
                <FileUploadField
                  name="electronic_signature"
                  label="Electronic Signature"
                />
                <FormikInputField
                  name="registration_place"
                  label="Registration Place"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikSelectField
                  name="nationality"
                  label="Nationality"
                  options={countryOptions}
                />
                <FormikInputField
                  name="national_id_expiry"
                  label="National ID Expiry Date"
                  type="date"
                />
                <FormikMultiSelectField
                  name="other_nationalities"
                  label="Other Nationalities"
                  options={countryOptions}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikInputField
                  name="social_security_no"
                  label="Social Security No."
                />
                <FormikInputField name="national_id" label="National ID No." />
              </div>
              {/* TABS */}
              <div className="my-2">
                <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              {activeTab === "Education" && (
                <EducationTable
                  values={initialValuesWithRecord}
                  id={id}
                  isPublicView={isPublicView}
                />
              )}
              {activeTab === "Certifications" && (
                <CertificationTable
                  values={initialValuesWithRecord}
                  countryOptions={countryOptions}
                  id={id}
                  isPublicView={isPublicView}
                />
              )}
              {activeTab === "Experiences" && (
                <ExperienceTable
                  values={initialValuesWithRecord}
                  countryOptions={countryOptions}
                  id={id}
                  isPublicView={isPublicView}
                />
              )}
              {activeTab === "Languages" && (
                <LanguageTable
                  values={initialValuesWithRecord}
                  id={id}
                  isPublicView={isPublicView}
                />
              )}
              {activeTab === "Skills" && (
                <CompetencyTable
                  values={initialValuesWithRecord}
                  id={id}
                  isPublicView={isPublicView}
                />
              )}
              {activeTab === "Relatives" &&
                (branches ? (
                  <RelativesTable
                    values={initialValuesWithRecord}
                    organizationalChilds={null}
                    setSelectedOrganizationalUnits={null}
                    organizationalUnits={null}
                    branches={branches}
                    id={id}
                    isPublicView={isPublicView}
                  />
                ) : (
                  <div>Loading branches...</div>
                ))}
            </div>
            <div className="flex justify-end border-t pt-4">
              <SubmitButton
                title="Save & Update"
                type="submit"
                isLoading={updateLoading}
              />
            </div>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

export default UserProfile;
