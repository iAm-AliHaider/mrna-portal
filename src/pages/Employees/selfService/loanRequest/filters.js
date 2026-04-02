import React from "react";
import InputField from "../../../../components/common/FormikInputField/Input";
import SelectField from "../../../../components/common/SelectField";

const ListFilter = ({ values, handleChange, options = [], label, placeholder }) => {
  return (
    <React.Fragment>
      <div className="flex flex-col gap-4 mt-2">
        {options && options.length > 0 && (
          <div className="w-full">
            <SelectField
              label={label}
              options={options}
              value={values.loan_type_id || ''}
              onChange={(value) => handleChange("loan_type_id", value)}
              placeholder={placeholder}
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <div className="w-full">
            <InputField
              label="Created From"
              type="date"
              value={values.created_from || ''}
              name="created_from"
              onChange={(e) => handleChange("created_from", e.target.value)}
              placeholder="Select start date"
              max="2100-12-31"
            />
          </div>
          <div className="w-full">
            <InputField
              label="Created To"
              type="date"
              value={values.created_to || ''}
              name="created_to"
              onChange={(e) => handleChange("created_to", e.target.value)}
              placeholder="Select end date"
              max="2100-12-31"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-full">
            <InputField
              label="Minimum Amount"
              type="number"
              value={values.min_amount || ''}
              name="min_amount"
              onChange={(e) => handleChange("min_amount", e.target.value)}
              placeholder="Enter minimum amount..."
              min={0}
            />
          </div>
          <div className="w-full">
            <InputField
              label="Maximum Amount"
              type="number"
              value={values.max_amount || ''}
              name="max_amount"
              onChange={(e) => handleChange("max_amount", e.target.value)}
              placeholder="Enter maximum amount..."
              min={0}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ListFilter;
