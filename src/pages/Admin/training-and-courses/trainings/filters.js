import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import InputField from "../../../../components/common/FormikInputField/Input";
import SelectField from "../../../../components/common/SelectField";

const ListFilter = ({ values, handleChange, courseOptions = [] }) => {
  return (
    <React.Fragment>
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <SelectField
            label="Training Name"
            options={courseOptions}
            value={values.course_id || ""}
            onChange={(value) => handleChange("course_id", value)}
            placeholder="Select Training"
          />
        </div>
        <div className="w-full">
          <SelectField
            label="Publisher"
            options={[
              { value: "Marketing Department", label: "Marketing Department" },
              { value: "Finance Department", label: "Finance Department" },
              { value: "IT Department", label: "IT Department" },
            ]}
            value={values.publisher || ""}
            onChange={(value) => handleChange("publisher", value)}
            placeholder="Select Publisher"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-full">
            <InputField
              label="Created From"
              type="date"
              value={values.created_from || ""}
              name="created_from"
              onChange={(e) => handleChange("created_from", e.target.value)}
              placeholder="Select start date"
            />
          </div>
          <div className="w-full">
            <InputField
              label="Created To"
              type="date"
              value={values.created_to || ""}
              name="created_to"
              onChange={(e) => handleChange("created_to", e.target.value)}
              placeholder="Select end date"
            />
          </div>
        </div>
        <div className="w-full mt-2">
          <span className="text-sm font-medium">Trainer</span>
          <RadioGroup
            row
            name="trainer_type"
            value={values.trainer_type || ""}
            onChange={e => handleChange("trainer_type", e.target.value)}
          >
            <FormControlLabel value="internal_trainer" control={<Radio />} label="Internal Trainer" />
            <FormControlLabel value="external_trainer" control={<Radio />} label="External Trainer" />
          </RadioGroup>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ListFilter;
