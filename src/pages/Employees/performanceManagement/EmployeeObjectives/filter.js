import React from "react";
import InputField from "../../../../components/common/FormikInputField/Input";

const ListFilter = ({ values, handleChange, options }) => {
  
  return (
    <>
      <InputField
        label="Start Period"
        type="date"
        name="start_period"
        value={values.leave_from}
        onChange={(event) => handleChange("start_period", event)}
        max="2100-12-31"
      />
      <InputField
        label="End Period"
        type="date"
        name="end_period"
        value={values.leave_to}
        onChange={(event) => handleChange("end_period", event)}
        max="2100-12-31"
      />
    </>
  );
};

export default ListFilter;
