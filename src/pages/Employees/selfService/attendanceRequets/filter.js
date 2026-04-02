import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import InputField from "../../../../components/common/FormikInputField/Input";
import SelectField from "../../../../components/common/SelectField";

const STATUS = [
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "pending", label: "Pending" },
  { value: "", label: "all" },
];

const CHECK_TYPE_OPTIONS = [
  { value: "check_in", label: "Check In" },
  { value: "check_out", label: "Check Out" },
];

const ListFilter = ({ values, handleChange, options }) => {
  return (
    <React.Fragment>
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <InputField
            label="Original Date"
            type="date"
            value={values.original_date || ""}
            name="original_date"
            onChange={(event) => handleChange("original_date", event.target.value)}
            max="2100-12-31"
          />
        </div>
        <div className="w-full">
          <InputField
            label="New Time"
            type="time"
            value={values.new_time || ""}
            name="new_time"
            onChange={(event) => handleChange("new_time", event.target.value)}
          />
        </div>
        <div className="w-full">
          <SelectField 
            options={CHECK_TYPE_OPTIONS}
            placeholder="Check Type"
            value={values.check_type || ""}
            onChange={(value) => handleChange("check_type", value)}
          />
        </div>
      </div>
      {/* <div className="flex gap-2 mt-2">
        <div className="w-full">
          <InputField
            label="From Date"
            type="date"
            value={values.leave_from}
            name="date_from"
            onChange={(event) => handleChange("date_from", new Date(event.target.value).toISOString())}
          />
        </div>
        <div className="w-full">
          <InputField
            label="To Date"
            type="date"
            value={values.leave_to}
            name="date_to"
            onChange={(event) => handleChange("date_to", new Date(event.target.value).toISOString())}
          />
        </div>
      </div> */}
      {/* <div className="flex flex-col justify-start items-start mt-2">
        <span className="text-sm font-medium">Status</span>
        <RadioGroup
          name="status"
          value={values.status}
          onChange={(event) => handleChange("status", event.target.value)}
          className="flex !flex-row"
        >
          {STATUS.map((item, index) => {
            return (
              <FormControlLabel
                key={`${item.value}-${index}`}
                value={item.value}
                control={<Radio />}
                label={item.label}
              />
            );
          })}
        </RadioGroup>
      </div> */}
    </React.Fragment>
  );
};
export default ListFilter;
