import React from "react";
import InputField from "../../../../components/common/FormikInputField/Input";
import SelectField from "../../../../components/common/SelectField";
import { Select } from "@mui/material";
import { SURVEYS_OPTIONS } from "../../../../utils/constants";

const ListFilter = ({ values, handleChange }) => {

  const handleSelectChange = (e) => {
    handleChange("status", e.target.value);
  };

  return (
    <React.Fragment>
      <div className="flex flex-col gap-2">
        <SelectField
          label="Status"
          name="status"
          options={SURVEYS_OPTIONS}
          placeholder="Select Status"
          value={values.status || ""}
          onChange={(value) => handleChange("status", value)}
          // selectKey = "value"
        />
        
        <div className="grid grid-cols-1 gap-2">
          <InputField
            label="From"
            type="date"
            name="created_from"
            value={values.created_from || ""}
            onChange={(e) => handleChange("created_from", e.target.value)}
            max="2100-12-31"
          />
          <InputField
            label="To"
            type="date"
            name="created_to"
            value={values.created_to || ""}
            onChange={(e) => handleChange("created_to", e.target.value)}
            max="2100-12-31"
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default ListFilter;
