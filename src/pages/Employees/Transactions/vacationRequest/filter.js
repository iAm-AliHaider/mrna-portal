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

const ListFilter = ({ values, handleChange, employeeOptions = [] }) => {
  return (
    <>
      {/* 1. Employee Number Select */}
      <SelectField
        name="employeeNumber"
        label="Employee Number"
        options={employeeOptions}
        fullWidth
        value={values.employeeNumber}
        onChange={handleChange}
      />

      {/* 2. Filter by Date Type Radio */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Filter by Date
        </Typography>
        <RadioGroup
          row
          name="dateType"
          value={values.dateType || "transaction_date"}
          onChange={(e) => handleChange("dateType", e.target.value)}
        >
          <FormControlLabel
            value="transaction_date"
            control={<Radio />}
            label="Transaction Date"
          />
          <FormControlLabel
            value="date_of_entry"
            control={<Radio />}
            label="Date of Entry"
          />
        </RadioGroup>
      </Box>

      {/* 3. From Date */}
      <InputField
        label="From Date"
        type="date"
        name="fromDate"
        value={values.fromDate}
        onChange={(event) => handleChange("fromDate", event.target.value)}
        max="2100-12-31"
      />

      {/* 4. To Date */}
      <InputField
        label="To Date"
        type="date"
        name="toDate"
        value={values.toDate}
        onChange={(event) => handleChange("toDate", event.target.value)}
        max="2100-12-31"
      />
    </>
  );
};

export default ListFilter;
