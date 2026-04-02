import React, { useEffect, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../../components/common/FormikSelectField";
import FormikRadioGroup from "../../../../../components/common/RadioGroup";
import SubmitButton from "../../../../../components/common/SubmitButton";
import FormikCheckbox from "../../../../../components/common/FormikCheckbox";
import FileUploadField from "../../../../../components/common/FormikFileUpload";
import { useEmployeeRecord } from "../../../../../context/EmployeeRecordContext";
import { Country } from "country-state-city";
import FormikMultiSelectField from "../../../../../components/common/FormikMultiSelectField";
import { useUpdateEmployeeRecord } from "../../../../../utils/hooks/api/employeeRecords";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const maritalStatusOptions = [
  { label: "Married", value: "married" },
  { label: "Single", value: "single" },
  { label: "Divorced", value: "divorced" },
];

const religionOptions = [
  { label: "Islam", value: "Islam" },
  { label: "Christian", value: "Christian" },
  { label: "Hindu", value: "Hindu" },
  { label: "Other", value: "Other" },
];

const militaryStatusOptions = [
  { label: "Exempted", value: "exempted" },
  { label: "Postponed", value: "postponed" },
  { label: "Completed", value: "completed" },
];

const validationSchema = Yup.object({
  date_of_birth: Yup.string().required("Date of Birth is required"),
  marital_status: Yup.string().required("Marital Status is required"),
  religion: Yup.string().required("Religion is required"),
  gender: Yup.string().required("Gender is required"),

  exempted_reason: Yup.string().when("military_status", {
    is: "exempted",
    then: (schema) => schema.required("Exemption reason is required"),
    otherwise: (schema) => schema.nullable(),
  }),

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

const PersonalInformation = () => {
  const { record, loadRecord } = useEmployeeRecord();
  const [countryOptions, setCountryOptions] = React.useState([]);
  const cand = record?.candidates || {};

  const { updateRecord, loading: updateLoading } = useUpdateEmployeeRecord();

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formatted = allCountries?.map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
    setCountryOptions(formatted);
  }, []);
  const initialValues = useMemo(
    () => ({
      gender: cand?.gender || "male",
      marital_status: cand?.marital_status || "",
      date_of_birth: cand?.date_of_birth || "",
      // hijriDateOfBirth: cand?.hijri_date_of_birth || '',
      birth_place: cand?.birth_place || "",
      // birth_place_en: cand?.birth_place_en || '',
      religion: cand?.religion || "",
      mother_name: cand?.mother_name || "",
      is_extended_retirement: cand?.is_extended_retirement || false,
      is_smoker: cand?.is_smoker || false,
      is_enrolled_in_education: cand?.enrolled_in_education || false,
      tax_id: cand?.tax_id || "",
      military_status: cand?.military_status || "exempted",
      exempted_reason: cand?.exempted_reason || "",
      postponed_until: cand?.postponed_until || null,
      completed_on: cand?.completed_on || null,
      electronic_signature: cand?.electronic_signature || "",
      registration_place: cand?.registration_place || "",
      nationality: cand?.nationality || "",
      other_nationalities: cand?.other_nationalities || "",
      social_security_no: cand?.social_security_no || "",
      national_id: cand?.national_id || "",
      national_id_expiry: cand?.national_id_expiry || "",
      expiry_date: cand?.expiry_date || "",
      passport_number: cand?.passport_number || "",
    }),
    [cand]
  );

  const handleSubmit = async (values) => {
    const candidate = {
      id: cand?.id || "",
      ...values,
    };

    await updateRecord({ candidate });
    loadRecord();
  };

  return (
    <div className="flex flex-col">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {() => (
          <Form className="flex-1 overflow-y-auto p-4">
            <div className="bg-gray-50 rounded-lg p-4 h-[calc(100vh-380px)] overflow-y-auto space-y-6 scrollbar-hide">
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
                <FormikInputField
                  name="national_id_expiry"
                  label="National ID Expiry Date"
                  type="date"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikInputField
                  name="passport_number"
                  label="Passport No."
                  type="number"
                />
                <FormikInputField
                  name="expiry_date"
                  label="Passport Expiry Date"
                  type="date"
                  max="2100-12-31"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 bg-white border-t flex justify-end">
              <SubmitButton
                title="Save & Update"
                type="submit"
                isLoading={updateLoading}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PersonalInformation;
