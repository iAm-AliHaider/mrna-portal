import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../../components/common/SubmitButton";
import FormikRadioGroup from "../../../../../components/common/RadioGroup";
import { useEmployeeRecord } from "../../../../../context/EmployeeRecordContext";
import {
  useGetAllEmployeeFormOptions,
  useUpdateEmployeeRecord,
} from "../../../../../utils/hooks/api/employeeRecords";
import SelectField from "../../../../../components/common/SelectField";
import { Country } from "country-state-city";

import EducationTable from "../../../../Admin/humanResource/talentAcquisition/candidates/CandidateForm/educationTableForm";
import CertificationTable from "../../../../Admin/humanResource/talentAcquisition/candidates/CandidateForm/certificateTableForm";
import TabBar from "../../../../Admin/humanResource/talentAcquisition/candidates/CandidateForm/tabs";
import ExperienceTable from "../../../../Admin/humanResource/talentAcquisition/candidates/CandidateForm/experienceTableForm";
import LanguageTable from "../../../../Admin/humanResource/talentAcquisition/candidates/CandidateForm/languagesTableForm";
import CompetencyTable from "../../../../Admin/humanResource/talentAcquisition/candidates/CandidateForm/skillsTableForm";
import RelativesTable from "../../../../Admin/humanResource/talentAcquisition/candidates/CandidateForm/relativesTableForm";

import { useGetUnitChildrens } from "../../../../../utils/hooks/api/organizationalStructure";
import { supabase } from "../../../../../supabaseClient";
import toast from "react-hot-toast";

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

const initialValues = {
  first_name: "",
  second_name: "",
  third_name: "",
  fourth_name: "",
  family_name: "",
  gender: "male",
  maritalStatus: "",
  religion: "",
  designation: "",
  officialTitle: "",
  branch_id: "",
  license: "",
  accessCardNumber: "",
  secondAccessCardNumber: "",

  manager: "",
  access_card_id: "",
  bank_info: "",
  allowances: "",

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
};

const validationSchema = Yup.object({
  first_name: Yup.string().required("First Name is required"),
  family_name: Yup.string().required("Family Name is required"),
});

const GeneralInformationForm = () => {
  const { record, loading, empCode, setEmpCode, loadRecord } =
    useEmployeeRecord();

  const [countryOptions, setCountryOptions] = useState([]);

  const {
    designations,
    branches,
    units,
    employees,
    employmentTypes,
    loading: optionsLoading,
  } = useGetAllEmployeeFormOptions();

  const { updateRecord, loading: updateLoading } = useUpdateEmployeeRecord();
  const {
    childrens,
    loading: managersLoading,
    fetchChildrens,
  } = useGetUnitChildrens();

  const [managerNames, setManagerNames] = useState([]);
  const [candidatePs, setCandidateps] = useState([]);

  const [activeTab, setActiveTab] = useState("Education");
  const [id, setId] = useState(null);
  const isPublicView = false;

  useEffect(() => {
    if (record) {
      // console.log("Employee record updated:", record);
      setId(record.candidates?.id);
    }
  }, [record]);

  // On mount → fetch organizational units & all countries
  useEffect(() => {
    // Build countryOptions once
    const allCountries = Country.getAllCountries();
    const formatted = allCountries?.map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
    setCountryOptions(formatted);
  }, []);


  const getEmployeesDataList = async (id) => {
    await fetchChildrens(id);
  };

  useEffect(() => {
    if (record?.organizational_unit_id) {
      getEmployeesDataList(record?.organizational_unit_id);
    }
  }, [record?.organizational_unit_id]);

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(
          "id, first_name, second_name, third_name, forth_name, family_name"
        )
        .eq("is_deleted", false)
        .eq("is_employee", true);

      if (error) {
        console.error("Error fetching candidates:", error);
        return;
      }
      setCandidateps(data);
    };

    fetchCandidates();
  }, []);

  const getCandidateName = (candidate) => {
    if (!candidate) return "No Name";
    return [
      candidate.first_name,
      candidate.second_name,
      candidate.third_name,
      candidate.forth_name,
      candidate.family_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  useEffect(() => {
    if (!childrens?.length || !candidatePs?.length) return;

    const names = childrens
      .filter((emp) => emp.role_columns?.roles?.includes("manager"))
      .map((manager) => {
        const candidate = candidatePs.find(
          (c) => c.id === manager.candidate_id
        );
        return getCandidateName(candidate);
      })
      .filter((name) => name !== "No Name"); // optional, skip missing

    setManagerNames(names);
  }, [childrens, candidatePs]);

  const {
    candidates,
    branch_id,
    user_status,
    organizational_unit_id,
    employment_type_id,
    education,
    certifications,
    experience,
    languages,
    competencies,
    relatives,
  } = record || {};

  const initialValuesWithRecord = {
    ...initialValues,
    first_name: candidates?.first_name || "",
    second_name: candidates?.second_name || "",
    third_name: candidates?.third_name || "",
    forth_name: candidates?.forth_name || "",
    family_name: candidates?.family_name || "",
    gender: candidates?.gender || "",
    maritalStatus: candidates?.marital_status || "",
    religion: candidates?.religion || "",
    designation: candidates?.designation || "",
    officialTitle: candidates?.official_title || "",
    branch_id: branch_id || "",
    license: candidates?.license || "",
    organizational_unit_id: organizational_unit_id || "",
    employment_type_id: employment_type_id || "",
    basic_salary: record?.basic_salary || 0,
    housing_allowance: record?.housing_allowance || 0,
    transportation_allowance: record?.transportation_allowance || 0,
    total_salary: record?.total_salary || 0,
    // accessCardNumber: candidates?.access_card_number || '',
    // secondAccessCardNumber: candidates?.second_access_card_number || ''

    // manager: record?.manager_id || "",
    // access_card_id: record?.access_card_id || "",
    // bank_info: record?.bank_info || "",
    // allowances: `Basic: ${record?.basic_salary || 0}, Housing: ${
    //   record?.housing_allowance || 0
    // }, Transportation: ${record?.transportation_allowance || 0}`,
    /////////////////////////

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
    has_expierence: candidates?.has_expierence || "",
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
  };

  const handleSubmit = async (values) => {
    const candidate = {
      id: candidates?.id || "",
      first_name: values?.first_name || "",
      second_name: values?.second_name || "",
      third_name: values?.third_name || "",
      forth_name: values?.forth_name || "",
      family_name: values?.family_name || "",
      gender: values?.gender || "",
      // marital_status: values?.marital_status || '',
      religion: values?.religion || "",
      designation: values?.designation || "",
      // officialTitle: values?.official_title || ''
    };
    const employee = {
      id: record?.id || "",
      branch_id: values?.branch_id || "",
      organizational_unit_id: values.organizational_unit_id,
      employment_type_id: values.employment_type_id,
      basic_salary: parseFloat(values?.basic_salary) || 0,
      housing_allowance: parseFloat(values?.housing_allowance) || 0,
      transportation_allowance:
        parseFloat(values?.transportation_allowance) || 0,
      total_salary: parseFloat(values?.total_salary) || 0,
      // access_card_number: values?.access_card_number || '',
      // license: values?.license || ''
    };

    await updateRecord({ employee, candidate });
    loadRecord();
  };

  return (
    <React.Fragment>
      <div className="grid grid-cols-12 gap-2 bg-gray-50 p-4 rounded-lg mb-4">
        <div className="col-span-9">
          <SelectField
            name="employee_number"
            label="Employee Number"
            options={employees || []}
            selectKey="employee_code"
            getOptionLabel={(option) =>
              `${option.candidates.first_name || ""} 
              ${option.candidates.second_name || ""} 
              ${option.candidates.third_name || ""} 
              ${option.candidates.forth_name || ""} 
              ${option.candidates.family_name || ""} (${option.employee_code})`
            }
            value={empCode}
            onChange={setEmpCode}
          />
        </div>
        <div className="col-span-3 flex justify-end items-end">
          <SubmitButton
            title="Reterieve Employee Record"
            onClick={loadRecord}
            type="button"
            className="h-[48px] w-full"
            isLoading={loading}
          />
        </div>
      </div>

      <Formik
        initialValues={initialValuesWithRecord}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => {
          const handleSalaryChange = (e) => {
            const value = parseFloat(e.target.value) || 0;

            const housing = (value * 3) / 12;
            const transport = value * 0.1;
            const total = value + housing + transport;

            setFieldValue("basic_salary", value);
            setFieldValue("housing_allowance", housing.toFixed(2));
            setFieldValue("transportation_allowance", transport.toFixed(2));
            setFieldValue("total_salary", total.toFixed(2));
          };
          return (
            <Form>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-6">
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
                  {/* <FormikSelectField
                  name='maritalStatus'
                  label='Marital Status'
                  options={maritalStatusOptions}
                /> */}
                  <FormikSelectField
                    name="religion"
                    label="Religion"
                    options={religionOptions}
                  />
                  <FormikSelectField
                    name="employment_type_id"
                    label="Employment Type"
                    options={employmentTypes || []}
                    disabled={optionsLoading}
                    selectKey="id"
                    getOptionLabel={(option) => option.employment_type}
                  />
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
                  <FormikSelectField
                    name="designation"
                    label="Employee Designation"
                    options={designations || []}
                    disabled={optionsLoading}
                    selectKey="id"
                    getOptionLabel={(option) => option.name}
                  />
                  {/* <FormikSelectField
                  name='officialTitle'
                  label='Official Title'
                  options={designationOptions}
                /> */}
                  <FormikSelectField
                    name="branch_id"
                    label="Branch"
                    required
                    options={branches || []}
                    disabled={optionsLoading}
                    selectKey="id"
                    getOptionLabel={(option) => option.name}
                  />
                  {/* <FormikSelectField
                  name='license'
                  label='License'
                  options={licenseOptions}
                /> */}
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <FormikInputField
                    name="basic_salary"
                    label="Basic Salary"
                    onChange={handleSalaryChange}
                    type="number"
                  />
                  <FormikInputField
                    name="housing_allowance"
                    label="Housing Allowance"
                    disabled
                  />
                  <FormikInputField
                    name="transportation_allowance"
                    label="Transportation Allowance"
                    disabled
                  />
                  <FormikInputField
                    name="total_salary"
                    label="Total Salary"
                    disabled
                  />
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
                  <FormikSelectField
                    name="organizational_unit_id"
                    label="Department"
                    required
                    options={units || []}
                    disabled={optionsLoading}
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
                          user_status === "active"
                            ? "bg-green-200 text-green-600 border-green-600"
                            : "bg-orange-200 text-orange-600 border-orange-600"
                        } text-xs font-medium px-3 py-1 rounded-full border`}
                      >
                        {user_status === "active" ? "Active" : "Inactive"}
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

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
                  <FormikInputField
                    name="managerNames"
                    label="Managers"
                    disabled
                    value={managerNames.join(", ")} // show names separated by commas
                  />
                  <FormikInputField
                    name="access_card_id"
                    label="Access Card ID"
                    disabled
                  />
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <FormikInputField
                    name="bank_info"
                    label="Bank Information"
                    disabled
                  />
                  <FormikInputField
                    name="allowances"
                    label="Allowances Summary"
                    disabled
                    placeholder="Auto-calculated from salary breakdown"
                  />
                  <FormikInputField
                    name="probation_period"
                    label="Probation Period"
                    disabled
                    placeholder="Probation Period"
                  />
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
                    isHideItems={true}
                  />
                )}
                {activeTab === "Certifications" && (
                  <CertificationTable
                    values={initialValuesWithRecord}
                    countryOptions={countryOptions}
                    id={id}
                    isPublicView={isPublicView}
                    isHideItems={true}
                  />
                )}
                {activeTab === "Experiences" && (
                  <ExperienceTable
                    values={initialValuesWithRecord}
                    countryOptions={countryOptions}
                    id={id}
                    isPublicView={isPublicView}
                    isHideItems={true}
                  />
                )}
                {activeTab === "Languages" && (
                  <LanguageTable
                    values={initialValuesWithRecord}
                    id={id}
                    isPublicView={isPublicView}
                    isHideItems={true}
                  />
                )}
                {activeTab === "Skills" && (
                  <CompetencyTable
                    values={initialValuesWithRecord}
                    id={id}
                    isPublicView={isPublicView}
                    isHideItems={true}
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
                      isHideItems={true}
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
          );
        }}
      </Formik>
    </React.Fragment>
  );
};

export default GeneralInformationForm;
