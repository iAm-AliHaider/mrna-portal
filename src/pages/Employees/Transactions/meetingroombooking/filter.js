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

const ListFilter = ({ values, handleChange }) => {
  return (
    <>

      {/* 2. Meeting Code */}
      <InputField
        label="Meeting Code"
        type="text"
        name="meeting_code"
        value={values.meeting_code || ""}
        onChange={(event) => handleChange("meeting_code", event.target.value)}
      />

      {/* 3. Filter by Date Type Radio */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Filter by Date
        </Typography>
        <RadioGroup
          row
          name="dateType"
          value={values.dateType || "from_date"}
          onChange={(e) => handleChange("dateType", e.target.value)}
        >
          <FormControlLabel
            value="from_date"
            control={<Radio />}
            label="From Date"
          />
          <FormControlLabel
            value="to_date"
            control={<Radio />}
            label="To Date"
          />
        </RadioGroup>
      </Box>

      {/* 4. From Date */}
      <InputField
        label="From Date"
        type="date"
        name="from_date"
        value={values.from_date || ""}
        onChange={(event) => handleChange("from_date", event.target.value)}
        max="2100-12-31"
      />

      {/* 5. To Date */}
      <InputField
        label="To Date"
        type="date"
        name="to_date"
        value={values.to_date || ""}
        onChange={(event) => handleChange("to_date", event.target.value)}
        max="2100-12-31"
      />

      {/* 6. Notes Search */}
      <InputField
        label="Search in Notes"
        type="text"
        name="notes"
        value={values.notes || ""}
        onChange={(event) => handleChange("notes", event.target.value)}
      />
    </>
  );
};

export default ListFilter;
