import React from "react";
import { FormControlLabel, Radio, RadioGroup, Checkbox } from "@mui/material";
import InputField from "../../../../components/common/FormikInputField/Input";


const ListFilter = ({ values, handleChange }) => {
  return (
    <React.Fragment>
      {/* First row: Course Name */}
      <div className="flex flex-col justify-start items-start mt-2">
        <InputField
          label="Course Name"
          type="text"
          value={values.course_name}
          name="course_name"
          onChange={(event) => handleChange("course_name", event.target.value)}
          placeholder="Enter course name"
        />
      </div>
      
      {/* Second row: Created From and Created To dates */}
      <div className="flex gap-2 mt-2">
        <div className="w-full">
          <InputField
            label="Created From"
            type="date"
            value={values.created_from}
            name="created_from"
            onChange={(event) => handleChange("created_from", event.target.value)}
          />
        </div>
        <div className="w-full">
          <InputField
            label="Created To"
            type="date"
            value={values.created_to}
            name="created_to"
            onChange={(event) => handleChange("created_to", event.target.value)}
          />
        </div>
      </div>
      {/* <div className="w-full mt-2">
          <span className="text-sm font-medium">Trainer</span>
          <RadioGroup
            row
            name="trainer_type"
            value={values.trainer_type || ""}
            onChange={e => handleChange("trainer_type", e.target.value)}
          >
            <FormControlLabel value="internal_trainer" control={<Radio />} label="Internal Trainer" />
            <FormControlLabel value="external_trainer" control={<Radio />} label="External Trainer" />
          </RadioGroup>
        </div> */}
    
    
     
    </React.Fragment>
  );
};
export default ListFilter;
