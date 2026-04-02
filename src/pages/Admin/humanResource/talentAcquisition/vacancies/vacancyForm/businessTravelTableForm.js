import React from "react";
import { useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";

const BusinessTravelTable = () => {
  const { values } = useFormikContext();
  
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Business Travel Requirements</h3>
        <FormikInputField
          name="business_travel"
          label="Business Travel"
          placeholder="Enter business travel requirements and policies..."
          rows={8}
          
        />
      </div>
    </div>
  );
};

export default BusinessTravelTable; 