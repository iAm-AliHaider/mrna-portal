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

const states = [
  { label: "Riyadh", value: "Riyadh" },
  { label: "Jeddah", value: "Jeddah" },
];

const passportTypes = [
  { label: "Official", value: "official" },
  { label: "Diplomatic", value: "diplomatic" },
];

const highSchoolStreams = [
  { label: "Science", value: "science" },
  { label: "Arts", value: "arts" },
];

const InformationForm = ({
  values,
  setFieldValue,
  countryOptions,
  stateOptions,
  setSelectedCounty,
  cityOptions,
  setSelectedState,
  id,
  isPublicView,
}) => {
  const disabled = !!id && !isPublicView;
  const isNonSaudi =
    values?.nationality && !["SA"].includes(values.nationality);
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <React.Fragment>
      <div className="text-lg font-bold">Candidate Information</div>

      <div className="p-4 bg-gray-50 rounded-lg space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {/* <FormikInputField
            name="firstNameAr"
            label="First Name in Arabic"
            required
          /> */}
          {/* <FormikInputField name="secondNameAr" label="Second Name in Arabic" />
          <FormikInputField name="thirdNameAr" label="Third Name in Arabic" />
          <FormikInputField name="fourthNameAr" label="Fourth Name in Arabic" /> */}
          {/* <FormikInputField
            name="familyNameAr"
            label="Family Name in Arabic"
            required
          /> */}

          <FormikInputField
            name="firstNameEn"
            label="First Name "
            required
            disabled={disabled}
          />
          <FormikInputField
            name="secondNameEn"
            label="Second Name "
            disabled={disabled}
          />
          <FormikInputField
            name="thirdNameEn"
            label="Third Name"
            disabled={disabled}
          />
          <FormikInputField
            name="fourthNameEn"
            label="Fourth Name "
            disabled={disabled}
          />
          <FormikInputField
            name="familyNameEn"
            label="Family Name "
            required
            disabled={disabled}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormikInputField
            name="nationalId"
            label="National ID"
            required
            type="text"
            disabled={disabled}
          />

          <FormikInputField
            name="national_id_issue"
            label="National ID Issue Date"
            required
            type="date"
            disabled={disabled}
            max="2100-12-31"
          />

          <FormikInputField
            name="national_id_expiry"
            label="National ID Expiry Date"
            required
            type="date"
            disabled={disabled}
            max="2100-12-31"
          />

          <FormikSelectField
            name="nationality"
            label="Nationality"
            options={countryOptions}
            required
            onChange={(value) => {
              setFieldValue("nationality", value);
            }}
            disabled={disabled}
          />

          <FileUploadField
            label="Upload National ID"
            type="file"
            name="uploadNationalID"
            onChange={(url) => setFieldValue("uploadNationalID", url)}
            required
            disabled={!!id && !isPublicView}
          />
          <div className="flex flex-col justify-start items-start mt-2">
            <span className="text-sm font-medium">Gender</span>
            <RadioGroup
              name="gender"
              value={values.gender}
              onChange={(event) => setFieldValue("gender", event.target.value)}
              className="flex !flex-row"
              disabled={disabled}
            >
              <FormControlLabel
                value="male"
                control={<Radio disabled={disabled} />}
                label="Male"
              />
              <FormControlLabel
                value="female"
                control={<Radio disabled={disabled} />}
                label="Female"
              />
            </RadioGroup>
          </div>
          <div className="flex flex-col justify-start items-start mt-2">
            <span className="text-sm font-medium">Marital Status</span>
            <RadioGroup
              name="maritalStatus"
              value={values.maritalStatus || "single"}
              onChange={(event) =>
                setFieldValue("maritalStatus", event.target.value)
              }
              className="flex !flex-row"
              disabled={disabled}
            >
              <FormControlLabel
                value="single"
                control={<Radio disabled={disabled} />}
                label="Single"
              />
              <FormControlLabel
                value="married"
                control={<Radio disabled={disabled} />}
                label="Married"
              />
            </RadioGroup>
          </div>
          {values.maritalStatus === "married" && (
            <FormikInputField
              name="familyMembers"
              label="Number of Family Members"
              type="number"
              min="1"
              required
              disabled={disabled}
            />
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormikSelectField
            name="religion"
            label="Religion"
            options={[
              { label: "Islam", value: "Islam" },
              { label: "Christan", value: "Christan" },
              { label: "Hindu", value: "Hindu" },
              { label: "Others", value: "Others" },
            ]}
            required
            disabled={disabled}
          />
          <FormikSelectField
            name="bloodType"
            label="Blood Group"
            options={[
              { label: "A+", value: "A+" },
              { label: "A−", value: "A−" },
              { label: "B+", value: "B+" },
              { label: "B−", value: "B−" },
              { label: "AB+", value: "AB+" },
              { label: "AB−", value: "AB−" },
              { label: "O+", value: "O+" },
              { label: "O−", value: "O−" },
            ]}
            required
            disabled={disabled}
          />
          <FormikSelectField
            name="country"
            label="Country"
            options={countryOptions}
            onChange={(value) => {
              setFieldValue("country", value);
              setSelectedCounty(value);
            }}
            required
            disabled={disabled}
          />
          <FormikSelectField
            name="state"
            label="States"
            options={stateOptions}
            onChange={(value) => {
              setFieldValue("state", value);
              setSelectedState(value);
            }}
            required
            disabled={disabled}
          />
          <FormikSelectField
            name="city"
            label="City"
            options={cityOptions}
            onChange={(value) => {
              setFieldValue("city", value);
            }}
            required
            disabled={disabled}
          />

          <FormikInputField
            name="poBox"
            label="P.O. Box"
            type="text"
            required
            disabled={disabled}
          />
          <FormikInputField
            name="zipCode"
            label="Zip Code"
            type="text"
            required
            disabled={disabled}
          />
          <FormikInputField
            name="street_name"
            label="Street Name"
            type="text"
            required
            disabled={disabled}
          />
          <FormikInputField
            name="neighbour_name"
            label="Neighborhood Name"
            type="text"
            required
            disabled={disabled}
          />
          <FormikInputField
            name="building_number"
            label="Building Number"
            type="text"
            required
            disabled={disabled}
          />
          <FormikInputField
            name="additional_number"
            label="Additional Number"
            type="text"
            required
            disabled={disabled}
          />

          <div className="flex flex-col">
            <label className="text-sm  ">
              Telephone<span className="text-red-500 ml-1"></span>
            </label>
            <Field name="telephone">
              {({ field, form }) => (
                <PhoneInput
                  country={values.phoneCountryCode || "sa"}
                  value={field.value || ""}
                  onChange={(value) =>
                    form.setFieldValue("telephone", value || "")
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
                  disabled={disabled}
                />
              )}
            </Field>
          </div>
          <div className="flex flex-col">
            <label className="text-sm ">
              Applicant’s Mobile Number
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Field name="mobile">
              {({ field, form }) => (
                <PhoneInput
                  country={values.phoneCountryCode || "sa"}
                  value={field.value || ""}
                  onChange={(value) =>
                    form.setFieldValue("mobile", value || "")
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
                  disabled={disabled}
                />
              )}
            </Field>
          </div>
          <div className="flex flex-col">
            <label className="text-sm ">
              Relative’s Mobile Number
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Field name="otherPhone">
              {({ field, form }) => (
                <PhoneInput
                  country={values.phoneCountryCode || "sa"}
                  value={field.value || ""}
                  onChange={(value) =>
                    form.setFieldValue("otherPhone", value || "")
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
                  disabled={disabled}
                />
              )}
            </Field>
          </div>
          <FormikInputField
            name="relative_name"
            label="Relative’s Name"
            type="text"
            required
            disabled={disabled}
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <FormikInputField
              name="email"
              label="Email"
              required
              disabled={disabled}
            />
          </div>
          <FormikCheckbox
            name="drivingLicense"
            label="Driving License"
            disabled={disabled}
          />
        </div>
        {values.drivingLicense && (
          <div className="grid grid-cols-3 gap-4 mt-2">
            <FormikInputField
              name="licence_number"
              label="Driving License Number"
              required
              disabled={disabled}
            />
            <FormikInputField
              name="licence_expiry_date"
              label="Driving License Expiry Date"
              type="date"
              required
              disabled={disabled}
              max="2100-12-31"
            />
            <FormikPinUpload
              name="licence_attachment"
              label="Driving licence attachment"
              required
              disabled={disabled}
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormikInputField
            name="address"
            label="Address"
            rows={4}
            required
            disabled={disabled}
          />
          <FormikInputField
            name="notes"
            label="Notes"
            rows={4}
            disabled={disabled}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormikInputField
            name="birthPlace"
            label="Birth Place"
            required
            disabled={disabled}
          />
          <FormikInputField
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            required
            disabled={disabled}
            max="2100-12-31"
          />
        </div>
        <div className="grid grid-cols-6 gap-5">
          <FormikSelectField
            name="passportType"
            label="Passport Type"
            options={passportTypes}
            required={isNonSaudi}
            disabled={disabled}
          />
          <FormikInputField
            name="passportNumber"
            label="Passport Number"
            type="text"
            required={isNonSaudi}
            disabled={disabled}
          />
          <FormikInputField
            name="issuePlace"
            label="Issue Place"
            required={isNonSaudi}
            disabled={disabled}
          />
          <FormikInputField
            name="issueDate"
            label="Issue Date"
            type="date"
            required={isNonSaudi}
            disabled={disabled}
            max="2100-12-31"
          />
          <FormikInputField
            name="expiryDate"
            label="Expiry Date"
            type="date"
            required={isNonSaudi}
            disabled={disabled}
            max="2100-12-31"
          />
          <FileUploadField
            label="Upload Passport"
            type="file"
            name="uploadPassport"
            onChange={(url) => setFieldValue("uploadPassport", url)}
            required
            disabled={!!id && !isPublicView}
          />
        </div>
        {/* <div className="grid grid-cols-2 gap-4">
          <FormikInputField
            name="highSchoolAverage"
            label="High School Average"
            type="number"
            required
            disabled={disabled}
          />
          <FormikInputField
            name="highSchoolStream"
            label="High School Stream"
            disabled={disabled}
          />
        </div> */}
      </div>
    </React.Fragment>
  );
};
export default InformationForm;
