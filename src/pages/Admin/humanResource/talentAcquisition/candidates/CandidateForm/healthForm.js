import React, { useState } from "react";
import FormikInputField from "../../../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../../../components/common/FormikSelectField";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import FormikCheckbox from "../../../../../../components/common/FormikCheckbox";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Field } from "formik";
import FormikPinUpload from "../../../../../../components/common/FormikPinUpload";
import FileUploadField from "../../../../../../components/common/FormikFileUpload";

const yes_no_options = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const QuestionsLabels = {
  disease:
    "Do you suffer from any serious illness that may affect your job performance?",
  mental: "Do you have a history of mental illness?",
  surgery: "Have you undergone any major surgery in the past two years?",
  drugs: "Do you take any kind of narcotic drugs or (dangerous medications)?",
  defaulter: "Are you financially defaulted with any institution?",
  dismiss:
    "Have you ever been dismissed from a job due to poor performance or unsatisfactory work?",
  extend_hours: "Are you willing to work extended or unusual hours?",
  relatives:
    "Do you have relatives working as employees, board members, or committee members in Flexible Murabaha Company?",
  relative_info: "Please provide relatives information",
};

const HealthForm = ({
  values,
  setFieldValue,
  countryOptions,
  stateOptions,
  setDangeriousDeseas,
  setMentalIllness,
  setSurgery,
  cityOptions,
  setSelectedState,
  id,
  isPublicView,
}) => {
  const disabled = !!id && !isPublicView;
  const isNonSaudi =
    values?.nationality && !["SA"].includes(values.nationality);
  const [selectedDate, setSelectedDate] = useState("");
  // console.log("checking values", values);

  return (
    <React.Fragment>
      <div className="text-lg font-bold">Health Information</div>

      <div className="p-4 bg-gray-50 rounded-lg space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormikInputField
            name="weight"
            label="Weight"
            required
            type="text"
            disabled={disabled}
          />

          <FormikInputField
            name="height"
            label="Height"
            required
            type="text"
            disabled={disabled}
          />

          {/* Select: writes only "yes" or "no" into the flag */}
          <div>
            <FormikSelectField
              name="dangerious_disease" // flag
              label={QuestionsLabels.disease}
              options={yes_no_options}
              value={values.dangerious_disease || "no"}
              onChange={(val) => {
                setFieldValue("dangerious_disease", val);
                if (val === "no") setFieldValue("disease_details", ""); // clear details on No
              }}
              required
            />

            {/* Textarea: appears only when flag === "yes" */}
            {values.dangerious_disease === "yes" && (
              <FormikInputField
                name="disease_details" // value
                label="Reason"
                multiline
                rows={3}
                required
              />
            )}
          </div>

          <div>
            <FormikSelectField
              name="mental_illness" // flag
              label={QuestionsLabels.mental}
              options={yes_no_options}
              value={values.mental_illness || "no"}
              onChange={(val) => {
                setFieldValue("mental_illness", val);
                if (val === "no") setFieldValue("illness_details", ""); // clear details on No
              }}
              required
            />

            {values.mental_illness === "yes" && (
              <FormikInputField
                name="illness_details" // value
                label="Please provide details"
                multiline
                rows={3}
                required
              />
            )}
          </div>

          <div>
            <FormikSelectField
              name="surgery" // flag
              label={QuestionsLabels.surgery}
              options={yes_no_options}
              value={values.surgery || "no"}
              onChange={(val) => {
                setFieldValue("surgery", val);
                if (val === "no") setFieldValue("suregry_details", ""); // clear details on No
              }}
              required
            />

            {values.surgery === "yes" && (
              <FormikInputField
                name="suregry_details" // value
                label="Please provide details"
                multiline
                rows={3}
                required
              />
            )}
          </div>

          <div>
            <FormikSelectField
              name="drugs" // flag
              label={QuestionsLabels.drugs}
              options={yes_no_options}
              value={values.drugs || "no"}
              onChange={(val) => {
                setFieldValue("drugs", val);
                if (val === "no") setFieldValue("drugs_details", ""); // clear details on No
              }}
              required
            />

            {values.drugs === "yes" && (
              <FormikInputField
                name="drugs_details" // value
                label="Please provide details"
                multiline
                rows={3}
                required
              />
            )}
          </div>

          <div>
            <FormikSelectField
              name="defaulted" // flag
              label={QuestionsLabels.defaulter}
              options={yes_no_options}
              value={values.defaulted || "no"}
              onChange={(val) => {
                setFieldValue("defaulted", val);
                if (val === "no") setFieldValue("defaulted_details", ""); // clear details on No
              }}
              required
            />

            {values.defaulted === "yes" && (
              <FormikInputField
                name="defaulted_details" // value
                label="Please provide reason"
                multiline
                rows={3}
                required
              />
            )}
          </div>

          <div>
            <FormikSelectField
              name="dismissed" // flag
              label={QuestionsLabels.dismiss}
              options={yes_no_options}
              value={values.dismissed || "no"}
              onChange={(val) => {
                setFieldValue("dismissed", val);
                if (val === "no") setFieldValue("dismissed_details", ""); // clear details on No
              }}
              required
            />

            {values.dismissed === "yes" && (
              <FormikInputField
                name="dismissed_details" // value
                label="Please provide reason"
                multiline
                rows={3}
                required
              />
            )}
          </div>

          {/* hours and relatives */}

          <div>
            <FormikSelectField
              name="extra_hours" // flag
              label={QuestionsLabels.extend_hours}
              options={yes_no_options}
              value={values.extra_hours || "yes"}
              onChange={(val) => {
                setFieldValue("extra_hours", val);
                if (val === "yes") setFieldValue("extra_hours_details", ""); // clear details on No
              }}
              required
            />

            {values.extra_hours === "no" && (
              <FormikInputField
                name="extra_hours_details" // value
                label="Please provide reason"
                multiline
                rows={3}
                required
              />
            )}
          </div>

          <div>
            <FormikSelectField
              name="relative" // flag
              label={QuestionsLabels.relatives}
              options={yes_no_options}
              value={values.relative || "no"}
              onChange={(val) => {
                setFieldValue("relative", val);
                if (val === "no") setFieldValue("relatives_details", ""); // clear details on No
              }}
              required
            />

            {values.relative === "yes" && (
              <FormikInputField
                name="relatives_details" // value
                label="Please provide relatives details"
                multiline
                rows={3}
                required
              />
            )}
          </div>

          {/* {values.dangerious_disease && values.dangerious_disease !== "" ? (
            <FormikInputField
              name="disease_details"
              label={QuestionsLabels.disease}
              multiline
              rows={3}
            />
          ) : (
            <FormikSelectField
              name="dangerious_disease"
              label={QuestionsLabels.disease}
              options={yes_no_options}
              // value="no"
              onChange={(val) => {
                setFieldValue("dangerious_disease", "");
              }}
            />
          )} */}

          {/* <FormikSelectField
            name="dangerious_disease"
            label="Dangerous diseases"
            options={yes_no_options}
            required
            onChange={(value) => {
              setFieldValue("dangerious_disease", value);
            }}
            disabled={disabled}
          />

          
          <FormikSelectField
            name="mental_illness"
            label="Mental illness"
            options={yes_no_options}
            required
            onChange={(value) => {
              setFieldValue("mental_illness", value);
            }}
            disabled={disabled}
          />

          
          <FormikSelectField
            name="surgery"
            label="You had surgery in the last two years"
            options={yes_no_options}
            required
            onChange={(value) => {
              setFieldValue("surgery", value);
            }}
            disabled={disabled}
          /> */}
        </div>
      </div>
    </React.Fragment>
  );
};
export default HealthForm;
