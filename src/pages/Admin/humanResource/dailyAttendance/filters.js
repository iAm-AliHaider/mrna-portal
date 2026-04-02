import React from "react";
import { FormControlLabel, Checkbox } from "@mui/material";
import InputField from "../../../../components/common/FormikInputField/Input";

const ListFilter = ({ values, handleChange }) => {
  return (
    <React.Fragment>
      {/* Only row: Start Date and End Date */}
      <div className="flex gap-2 mt-2">
        <div className="w-full">
          <InputField
            label="Start Date"
            type="date"
            value={values.start_date}
            name="start_date"
            onChange={(event) => handleChange("start_date", event)}
          />
        </div>
        <div className="w-full">
          <InputField
            label="End Date"
            type="date"
            value={values.end_date}
            name="end_date"
            onChange={(event) => handleChange("end_date", event)}
          />
        </div>
      </div>
      {/* Last row: All checkboxes */}
      <div className="flex gap-6 mt-2">
        <FormControlLabel
          control={
            <Checkbox
              checked={values.overtime_employees}
              onChange={(event) => handleChange("overtime_employees", event.target.checked)}
            />
          }
          label="Overtime Employees"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={values.early_checkouts_employees}
              onChange={(event) => handleChange("early_checkouts_employees", event.target.checked)}
            />
          }
          label="Early Checkouts Employees"
        />
        
      </div>
      <div className="flex gap-6 mt-2">
      <FormControlLabel
          control={
            <Checkbox
              checked={values.check_in}
              onChange={(event) => handleChange("check_in", event.target.checked)}
            />
          }
          label="Check In"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={values.check_out}
              onChange={(event) => handleChange("check_out", event.target.checked)}
            />
          }
          label="Check Out"
        />
        
      </div>
    </React.Fragment>
  );
};
export default ListFilter;
