import React from "react";
import { useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";

const DeductionsTable = () => {
  const { values } = useFormikContext();
  
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Salary Deductions</h3>
        <FormikInputField
          name="deductions"
          label="Deductions"
          placeholder="Enter salary deductions and withholdings..."
          rows={8}
        />
      </div>
    </div>
  );
};

export default DeductionsTable; 