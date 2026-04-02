import React from "react";
import { FormControlLabel, Radio, RadioGroup, Checkbox } from "@mui/material";
import InputField from "../../../../components/common/FormikInputField/Input";
import SelectField from "../../../../components/common/SelectField";

const COURSE_OPTIONS = [
  { value: "it", label: "IT" },
  { value: "hr", label: "HR" },
  { value: "finance", label: "Finance" },
  { value: "", label: "All" },
];

const STATUS = [
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "pending", label: "Pending" },
  { value: "", label: "All" },
];

const ListFilter = ({ values, handleChange, courseOptions = [] }) => {
  return (
    <React.Fragment>
      <div className="flex flex-col gap-4">
        {/* <div className="w-full">
          <SelectField
            label="Course Name"
            options={courseOptions}
            value={values.course_id || ""}
            onChange={(value) => handleChange("course_id", value)}
            placeholder="Select Course"
          />
        </div> */}
       
        <div className="flex gap-2">
          <div className="w-full">
            <InputField
              label="Created From"
              type="date"
              value={values.created_from || ""}
              name="created_from"
              onChange={(e) => handleChange("created_from", e.target.value)}
              placeholder="Select start date"
              max="2100-12-31"
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
              max="2100-12-31"
            />
          </div>
        </div>
      </div>
      {/* First row: Course radio options */}
   
    </React.Fragment>
  );
};
export default ListFilter;
