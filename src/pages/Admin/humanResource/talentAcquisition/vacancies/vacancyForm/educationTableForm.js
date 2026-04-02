import React from "react";
import { useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../../../components/common/FormikSelectField";

const educationOptions = [
  { label: "High School", value: "high_school" },
  { label: "Bachelors", value: "bachelors" },
  { label: "Masters", value: "masters" },
  { label: "PhD", value: "phd" },
];

const EducationTable = () => {
  const { values } = useFormikContext();

  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Education Requirements
        </h3>
        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <FormikSelectField
            name="education"
            label="Education Level"
            options={educationOptions}
            placeholder="Select"
            required
          />
        </div>
        <FormikInputField
          name="education"
          label="Education Requirements"
          placeholder="Enter education requirements and qualifications..."
          rows={8}
        />
      </div>
    </div>
  );
};

export default EducationTable;
