import React from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  MenuItem,
} from "@mui/material";
import InputField from "../../../components/common/FormikInputField/Input";

const ListFilter = ({ values, handleChange, candidateOptions = [] }) => {
  return (
    <React.Fragment>
      {/* 1. Candidate Number Select */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Candidate Number
        </Typography>
        <TextField
          select
          fullWidth
          value={values.candidateNumber || ""}
          onChange={(e) => handleChange("candidateNumber", e.target.value)}
          displayEmpty
          size="small"
          placeholder="Select Candidate Number"
        >
          <MenuItem value="">
            <em>Select</em>
          </MenuItem>
          {candidateOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

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
        onChange={(event) => handleChange("fromDate", event)}
        max="2100-12-31"
      />

      {/* 4. To Date */}
      <InputField
        label="To Date"
        type="date"
        name="toDate"
        value={values.toDate}
        onChange={(event) => handleChange("toDate", event)}
        max="2100-12-31"
      />
    </React.Fragment>
  );
};

export default ListFilter;
