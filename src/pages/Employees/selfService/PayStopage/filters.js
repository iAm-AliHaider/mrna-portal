import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import InputField from "../../../../components/common/FormikInputField/Input";

const ListFilter = ({ values, handleChange }) => {
  return (
    <React.Fragment>
      <div className="flex gap-2 mt-2">
      </div>
      <div className="flex gap-2 mt-2">
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
      <div className="flex gap-2 mt-2">
        <div className="w-full">
          <InputField
            label="Minimum Amount"
            type="number"
            value={values.min_amount || ''}
            name="min_amount"
            onChange={(e) => handleChange("min_amount", e.target.value)}
            placeholder="Enter minimum amount"
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
            placeholder="Enter maximum amount"
            min={0}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default ListFilter; 