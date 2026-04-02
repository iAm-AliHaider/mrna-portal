import React from "react";
import { Form } from "formik";
import SelectField from "../../../../components/common/SelectField";
import InputField from "../../../../components/common/FormikInputField/Input";

const ListFilter = ({ values, handleChange, options }) => {
  return (
    <>
      <SelectField
        name="PerformanceLevel"
        label="Performance Level"
        options={options || []}
        fullWidth
      />
      <InputField
        label="Appraisal Date"
        type="date"
        name="apraisal_date"
        value={values.apraisal_date}
        onChange={(event) => handleChange("apraisal_date", event)}
        max="2100-12-31"
      />
      <InputField
        label="Date of Entry"
        type="entry_date"
        name="entry_date"
        value={values.entry_date}
        onChange={(event) => handleChange("entry_date", event)}
      />
    </>
  );
};

export default ListFilter;
