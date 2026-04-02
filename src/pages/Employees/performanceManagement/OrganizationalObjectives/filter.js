import React from "react";
import SelectField from "../../../../components/common/SelectField";
import InputField from "../../../../components/common/FormikInputField/Input";

const ListFilter = ({ values, handleChange, options, orgUnitOptions }) => {
  return (
    <>
      <SelectField
        name="generalObjectivesGroup"
        label="Company"
        options={options || []}
        fullWidth
        value={values.generalObjectivesGroup}
        onChange={handleChange}
      />
      <SelectField
        name="organizationalUnit"
        label="Organizational Unit"
        options={orgUnitOptions || []}
        fullWidth
        value={values.organizationalUnit}
        onChange={handleChange}
      />
      <InputField
        label="Leave From"
        type="date"
        name="leave_from"
        value={values.leave_from}
        onChange={(event) => handleChange("leave_from", event)}
        max="2100-12-31"
      />
      <InputField
        label="Leave To"
        type="date"
        name="leave_to"
        value={values.leave_to}
        onChange={(event) => handleChange("leave_to", event)}
        max="2100-12-31"
      />
    </>
  );
};

export default ListFilter;
