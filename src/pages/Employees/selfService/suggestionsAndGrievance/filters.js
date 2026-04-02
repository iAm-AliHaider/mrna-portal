import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import InputField from "../../../../components/common/FormikInputField/Input";

const CATEGORY_OPTIONS = [
  { value: "workspace_issues", label: "Workspace Issues" },
  { value: "policy_suggestions", label: "Policy Suggestions" },
  { value: "team_conflicts", label: "Team Conflicts" },
];
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

const ListFilter = ({ values, handleChange }) => {
  return (
    <React.Fragment>
      <div className="flex flex-col justify-start items-start mt-2">
        <span className="text-sm font-medium">Category</span>
        <RadioGroup
          name="category"
          value={values.category}
          onChange={(event) => handleChange("category", event.target.value)}
          className="flex !flex-row"
        >
          {CATEGORY_OPTIONS.map((item, index) => (
            <FormControlLabel
              key={`${item.value}-${index}`}
              value={item.value}
              control={<Radio />}
              label={item.label}
            />
          ))}
        </RadioGroup>
      </div>
      <div className="flex flex-col justify-start items-start mt-2">
        <span className="text-sm font-medium">Priority</span>
        <RadioGroup
          name="priority"
          value={values.priority}
          onChange={(event) => handleChange("priority", event.target.value)}
          className="flex !flex-row"
        >
          {PRIORITY_OPTIONS.map((item, index) => (
            <FormControlLabel
              key={`${item.value}-${index}`}
              value={item.value}
              control={<Radio />}
              label={item.label}
            />
          ))}
        </RadioGroup>
      </div>
      <div className="flex gap-2 mt-2">
        <div className="w-full">
          <InputField
            label="Created From"
            type="date"
            value={values.created_from || ""}
            name="created_from"
            onChange={e => handleChange("created_from", e.target.value)}
            max="2100-12-31"
          />
        </div>
        <div className="w-full">
          <InputField
            label="Created To"
            type="date"
            value={values.created_to || ""}
            name="created_to"
            onChange={e => handleChange("created_to", e.target.value)}
            max="2100-12-31"
          />
        </div>
      </div>
    </React.Fragment>
  );
};
export default ListFilter;
