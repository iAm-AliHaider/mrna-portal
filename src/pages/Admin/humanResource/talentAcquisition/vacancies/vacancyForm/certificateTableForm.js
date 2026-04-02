import React from "react";
import { useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";

const CertificationTable = () => {
  const { values } = useFormikContext();
  
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Certification Requirements</h3>
        <FormikInputField
          name="certificates"
          label="Certification Requirements"
          placeholder="Enter certification requirements and qualifications..."
          rows={8}
        
        />
      </div>
    </div>
  );
};

export default CertificationTable;
