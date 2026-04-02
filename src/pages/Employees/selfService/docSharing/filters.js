import React from "react";
import { FormControlLabel, Radio, RadioGroup, Checkbox } from "@mui/material";
import InputField from "../../../../components/common/FormikInputField/Input";

const DOCUMENT_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Image" },
  { value: "report", label: "Report" },
  { value: "", label: "All" },
];

const STATUS = [
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "pending", label: "Pending" },
  { value: "", label: "All" },
];

const ListFilter = ({ values, handleChange }) => {
  return (
    <React.Fragment>
      {/* First row: Document Type radio options */}
      <div className="flex flex-col justify-start items-start mt-2">
        <span className="text-sm font-medium">Document Type</span>
        <RadioGroup
          name="document_type"
          value={values.document_type}
          onChange={(event) => handleChange("document_type", event.target.value)}
          className="flex !flex-row"
        >
          {DOCUMENT_TYPES.map((item, index) => (
            <FormControlLabel
              key={`${item.value}-${index}`}
              value={item.value}
              control={<Radio />}
              label={item.label}
            />
          ))}
        </RadioGroup>
      </div>
      {/* Second row: Creation Date and Author */}
      <div className="flex gap-2 mt-2">
        <div className="w-full">
          <InputField
            label="Creation Date"
            type="date"
            value={values.creation_date}
            name="creation_date"
            onChange={(event) => handleChange("creation_date", event)}
            max="2100-12-31"
          />
        </div>
        <div className="w-full">
          <InputField
            label="Author"
            type="text"
            value={values.author}
            name="author"
            onChange={(event) => handleChange("author", event)}
          />
        </div>
      </div>
      {/* Third row: Read Only and Approval checkboxes */}
      <div className="flex gap-6 mt-2">
        <FormControlLabel
          control={
            <Checkbox
              checked={values.read_only}
              onChange={(event) => handleChange("read_only", event.target.checked)}
            />
          }
          label="Read Only"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={values.approval}
              onChange={(event) => handleChange("approval", event.target.checked)}
            />
          }
          label="Approval"
        />
      </div>
      {/* Last row: Status radio options */}
      <div className="flex flex-col justify-start items-start mt-2">
        <span className="text-sm font-medium">Status</span>
        <RadioGroup
          name="status"
          value={values.status}
          onChange={(event) => handleChange("status", event.target.value)}
          className="flex !flex-row"
        >
          {STATUS.map((item, index) => (
            <FormControlLabel
              key={`${item.value}-${index}`}
              value={item.value}
              control={<Radio />}
              label={item.label}
            />
          ))}
        </RadioGroup>
      </div>
    </React.Fragment>
  );
};
export default ListFilter;
