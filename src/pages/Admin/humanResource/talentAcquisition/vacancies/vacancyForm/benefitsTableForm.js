import React from "react";
import { useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";

const BenefitsTable = () => {
  const { values } = useFormikContext();
  
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Employee Benefits</h3>
        <FormikInputField
          name="benefits"
          label="Benefits"
          placeholder="Enter employee benefits and perks..."
          rows={8}
        />
      </div>
    </div>
  );
};

export default BenefitsTable; 