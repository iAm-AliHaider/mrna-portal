import React from "react";
import { FieldArray, useFormikContext } from "formik";

import FormikSelectField from "../../../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../../../components/common/FormikInputField";
import DeleteIcon from "@mui/icons-material/Delete";
import SubmitButton from "../../../../../../components/common/SubmitButton";
import FormikPinUpload from "../../../../../../components/common/FormikPinUpload";

const educationOptions = [
  { label: "High School", value: "high_school" },
  { label: "Bachelors", value: "bachelors" },
  { label: "Masters", value: "masters" },
  { label: "PhD", value: "phd" },
];

const majorOptions = [
  { label: "Computer Science", value: "cs" },
  { label: "Business", value: "business" },
  { label: "Engineering", value: "engineering" },
  { label: "Other", value: "other" },
];

const EducationTable = ({ id, isPublicView, isHideItems = false }) => {
  const { values } = useFormikContext();
  const disabled = !!id && !isPublicView;
  return (
    <FieldArray name="education">
      {({ push, remove }) => (
        <div className="w-full">
          <div className="grid grid-cols-12 gap-2 bg-gray-100 py-4 px-4 text-sm font-semibold text-gray-700">
            <div className="col-span-2 pl-2">
              Education<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-2 pl-2">
              Major<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-2 pl-2">
              Other Major<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-2 pl-2">
              Institute Name<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-1 pl-2">
              Grade / CGPA<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-1 pl-2">
              Passing Year<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-1 pl-2 text-center">
              Attachment<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-1"></div>
          </div>

          {values?.education?.map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-gray-200"
            >
              <div className="col-span-2">
                <FormikSelectField
                  name={`education[${index}].education`}
                  options={educationOptions}
                  placeholder="Select"
                  disabled={disabled}
                />
              </div>
              <div className="col-span-2">
                <FormikInputField
                  name={`education[${index}].major`}
                  placeholder="Enter"
                  disabled={disabled}
                />
              </div>
              <div className="col-span-2">
                <FormikInputField
                  name={`education[${index}].otherMajor`}
                  placeholder=""
                  disabled={disabled}
                />
              </div>
              <div className="col-span-2">
                <FormikInputField
                  name={`education[${index}].instituteName`}
                  placeholder=""
                  disabled={disabled}
                />
              </div>
              <div className="col-span-1">
                <FormikInputField
                  name={`education[${index}].grade`}
                  placeholder=""
                  disabled={disabled}
                />
              </div>
              <div className="col-span-1">
                <FormikInputField
                  name={`education[${index}].passingYear`}
                  placeholder=""
                  disabled={disabled}
                />
              </div>
              <div className="col-span-1 flex justify-center items-center h-full">
                <FormikPinUpload
                  name={`education[${index}].attachment`}
                  label=""
                  disabled={disabled}
                  required
                />
              </div>
              {!isHideItems && (
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 rounded-md bg-primary text-white hover:bg-primary-dark"
                    disabled={disabled}
                  >
                    <DeleteIcon size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {!isHideItems && (
            <div className="flex justify-center mt-4">
              <SubmitButton
                type="button"
                onClick={() =>
                  push({
                    education: "",
                    major: "",
                    otherMajor: "",
                    instituteName: "",
                    grade: "",
                    passingYear: "",
                  })
                }
                title="+ Add New Record"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      )}
    </FieldArray>
  );
};

export default EducationTable;
