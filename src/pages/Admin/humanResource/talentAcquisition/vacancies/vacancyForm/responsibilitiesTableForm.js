import React from "react";
import { useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";

const ResponsibilitiesTable = () => {
  const { values } = useFormikContext();
  
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Job Responsibilities</h3>
        <FormikInputField
          name="responsibilities"
          label="Responsibilities"
          placeholder="Enter job responsibilities and duties..."
          rows={8}
        />
      </div>
    </div>
  );
};

export default ResponsibilitiesTable; 