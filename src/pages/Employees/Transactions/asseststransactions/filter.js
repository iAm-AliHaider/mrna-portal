import React from "react";
import SelectField from "../../../../components/common/SelectField";
import InputField from "../../../../components/common/FormikInputField/Input";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { ASSIGNMENT_TYPE_OPTIONS, STATUS_OPTIONS } from "../../../../utils/hooks/api/assetsTransactions";

const ListFilter = ({ values, handleChange, employeeOptions = [] }) => {
  return (
    <>
      {/* 1. Employee Select */}
      <SelectField
        name="employee_id"
        label="Employee"
        options={employeeOptions}
        fullWidth
        value={values.employee_id}
        onChange={handleChange}
      />

      {/* 2. Assignment Type Select */}
      <SelectField
        name="assignment_type"
        label="Assignment Type"
        options={ASSIGNMENT_TYPE_OPTIONS}
        fullWidth
        value={values.assignment_type}
        onChange={handleChange}
      />

      {/* 3. Status Select */}
      <SelectField
        name="status"
        label="Status"
        options={STATUS_OPTIONS}
        fullWidth
        value={values.status}
        onChange={handleChange}
      />

      {/* 4. From Date */}
      <InputField
        label="From Date"
        type="date"
        name="from_date"
        value={values.from_date}
        onChange={(event) => handleChange("from_date", event.target.value)}
        InputLabelProps={{ shrink: true }}
        max="2100-12-31"
      />

      {/* 5. To Date */}
      <InputField
        label="To Date"
        type="date"
        name="to_date"
        value={values.to_date}
        onChange={(event) => handleChange("to_date", event.target.value)}
        InputLabelProps={{ shrink: true }}
        max="2100-12-31"
      />
    </>
  );
};

export default ListFilter;
