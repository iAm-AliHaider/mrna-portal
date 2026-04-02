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

const TASK_STATUS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

const ListFilter = ({ values, handleChange, options, onApply, onClear }) => {
  return (
    <React.Fragment>
      {/* Task Status Radio */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Task Status
        </Typography>
        <RadioGroup
          row
          name="status"
          value={values.status || "pending"}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          {TASK_STATUS.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </Box>

      {/* Task List Dropdown */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Task List
        </Typography>
        <TextField
          select
          fullWidth
          value={values.task || ""}
          onChange={(e) => handleChange("task", e.target.value)}
          displayEmpty
          size="small"
          placeholder="Select"
        >
          <MenuItem value="">
            <em>Select</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* From Date and To Date */}
      <div className="display flex flex-row gap-2 mt-2">
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium mb-1" htmlFor="from-date">
            From Date
          </label>
          <InputField
            id="from-date"
            label=""
            type="date"
            value={values.creation_date}
            name="creation_at"
            onChange={(event) => handleChange("creation_date", event)}
            max="2100-12-31"
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium mb-1" htmlFor="to-date">
            To Date
          </label>
          <InputField
            id="to-date"
            label=""
            type="date"
            value={values.last_update}
            name="last_update"
            onChange={(event) => handleChange("last_update", event)}
            max="2100-12-31"
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default ListFilter;
