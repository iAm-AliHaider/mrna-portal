import React from "react";
import { useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";

const AssetsCategoryTable = () => {
  const { values } = useFormikContext();
  
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Assets Category</h3>
        <FormikInputField
          name="assets_category"
          label="Assets Category"
          placeholder="Enter assets category and equipment requirements..."
          rows={8}
        />
      </div>
    </div>
  );
};

export default AssetsCategoryTable; 