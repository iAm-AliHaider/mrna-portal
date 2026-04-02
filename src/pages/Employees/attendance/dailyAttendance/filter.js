import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import CheckboxField from "../../../../components/common/FormikCheckbox/CheckboxField";
import InputField from "../../../../components/common/FormikInputField/Input";
import FormikInputField from "../../../../components/common/FormikInputField";

const LEAVES_TYPES = [
  { value: "sick", label: "Sick" },
  { value: "casual", label: "Casual" },
  { value: "annual", label: "Annual" },
  { value: "", label: "all" },
];

const STATUS = [
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "pending", label: "Pending" },
  { value: "", label: "all" },
];

const ListFilter = ({ values, handleChange, reportType }) => {
  // Date Wise Report Filters
  const renderDateWiseFilters = () => (
    <React.Fragment>
      <InputField
        label="Department"
        type="select"
        value={values.department}
        name="department"
        onChange={(event) => handleChange("department", event)}
      />
      <InputField
        label="Sub Department"
        type="select"
        value={values.subDepartment}
        name="subDepartment"
        onChange={(event) => handleChange("subDepartment", event)}
      />
      <InputField
        label="Filter"
        type="select"
        value={values.filter}
        name="filter"
        onChange={(event) => handleChange("filter", event)}
        max="2100-12-31"
      />
      <InputField
        label="Select Date"
        type="date"
        value={values.date}
        name="date"
        onChange={(event) => handleChange("date", event)}
        max="2100-12-31"
      />
    </React.Fragment>
  );

  // Monthly Report Filters
  const renderMonthlyFilters = () => (
    <React.Fragment>
      <InputField
        label="Department"
        type="select"
        value={values.department}
        name="department"
        onChange={(event) => handleChange("department", event)}
      />
      <InputField
        label="Month"
        type="select"
        value={values.month}
        name="month"
        onChange={(event) => handleChange("month", event)}
      />
      <InputField
        label="Year"
        type="select"
        value={values.year}
        name="year"
        onChange={(event) => handleChange("year", event)}
      />
    </React.Fragment>
  );

  // Attendance Register Filters
  const renderRegisterFilters = () => (
    <React.Fragment>
      <InputField
        label="Department"
        type="select"
        value={values.department}
        name="department"
        onChange={(event) => handleChange("department", event)}
      />
      <InputField
        label="Week"
        type="select"
        value={values.week}
        name="week"
        onChange={(event) => handleChange("week", event)}
      />
      <InputField
        label="Month"
        type="select"
        value={values.month}
        name="month"
        onChange={(event) => handleChange("month", event)}
      />
      <InputField
        label="Year"
        type="select"
        value={values.year}
        name="year"
        onChange={(event) => handleChange("year", event)}
      />
    </React.Fragment>
  );

  // Punctuality Report Filters
  const renderPunctualityFilters = () => (
    <React.Fragment>
      <InputField
        label="Department"
        type="select"
        value={values.department}
        name="department"
        onChange={(event) => handleChange("department", event)}
      />
      <InputField
        label="Month"
        type="select"
        value={values.month}
        name="month"
        onChange={(event) => handleChange("month", event)}
      />
      <InputField
        label="Year"
        type="select"
        value={values.year}
        name="year"
        onChange={(event) => handleChange("year", event)}
      />
      <InputField
        label="Score Range"
        type="select"
        value={values.scoreRange}
        name="scoreRange"
        onChange={(event) => handleChange("scoreRange", event)}
      />
    </React.Fragment>
  );

  // Render filters based on report type
  const renderFilters = () => {
    switch (reportType) {
      case "monthly":
        return renderMonthlyFilters();
      case "register":
        return renderRegisterFilters();
      case "punctuality":
        return renderPunctualityFilters();
      case "dateWise":
      default:
        return renderDateWiseFilters();
    }
  };

  return renderFilters();
};

export default ListFilter;
