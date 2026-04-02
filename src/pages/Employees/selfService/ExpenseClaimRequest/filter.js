import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import InputField from "../../../../components/common/FormikInputField/Input";

const STATUS = [
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "pending", label: "Pending" },
  { value: "", label: "all" },
];

const ListFilter = ({ values, handleChange, options }) => {
  return (
    <React.Fragment>
      <div className="flex gap-2 mt-2">
        <div className="w-full">
          <InputField
            label="From Date"
            type="date"
            value={values.leave_from}
            name="leave_from"
            onChange={(event) => handleChange("leave_from", event)}
            max="2100-12-31"
          />
        </div>
        <div className="w-full">
          <InputField
            label="To Date"
            type="date"
            value={values.leave_to}
            name="leave_to"
            onChange={(event) => handleChange("leave_to", event)}
            max="2100-12-31"
          />
        </div>
      </div>
     
    </React.Fragment>
  );
};
export default ListFilter;
