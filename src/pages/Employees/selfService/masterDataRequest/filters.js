import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import CheckboxField from "../../../../components/common/FormikCheckbox/CheckboxField";
import InputField from "../../../../components/common/FormikInputField/Input";

const DOCUMENT_TYPES = [
  { value: "iqama", label: "Iqama" },
  { value: "visa", label: "Visa" },
  { value: "family_visa", label: "Family Visa" },
  { value: "salary_certificate", label: "Salary Certificate" },
  { value: "employment_certificate", label: "Employment Certificate" },
  { value: "visa_letter", label: "Visa Letter" },
  { value: "recommendation_letter", label: "Recommendation Letter" },
  { value: "experience_letter", label: "Experience Letter" },
  { value: "other_documents", label: "Other Documents" },
  { value: "", label: "All" },
];

const STATUS = [
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "pending", label: "Pending" },
  { value: "", label: "All" },
];

const ListFilter = ({ values, handleChange, options }) => {
  return (
    <React.Fragment>
      <div className="flex flex-col justify-start items-start mt-2">
        <span className="text-sm font-medium">Document Type</span>
        <RadioGroup
          name="document_type"
          value={values.document_type}
          onChange={(event) =>
            handleChange("document_type", event.target.value)
          }
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
            placeholder="Abdur Rehman"
            onChange={(event) => handleChange("author", event)}
          />
        </div>
      </div>
      <div className="flex gap-6 mt-2">
        <CheckboxField
          onChange={(event) =>
            handleChange("is_read_only", event.target.checked)
          }
          label="Read only"
          checked={values.is_read_only}
          className="mt-3"
        />
        <CheckboxField
          onChange={(event) =>
            handleChange("is_approvals", event.target.checked)
          }
          label="Approvals"
          checked={values.is_approvals}
          className="mt-3"
        />
      </div>
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
