import React from "react";
import { useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";

const CompetencyTable = () => {
  const { values } = useFormikContext();
  
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Competency Requirements</h3>
        <FormikInputField
          name="competencies"
          label="Competency Requirements"
          placeholder="Enter competency requirements and skills..."
          rows={8}
          
        />
      </div>
    </div>
  );
};

export default CompetencyTable;
