import React from "react";
import { useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";

const TrainingAndCoursesTable = () => {
  const { values } = useFormikContext();
  
  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Training and Courses</h3>
        <FormikInputField
          name="training_and_courses"
          label="Training and Courses"
          placeholder="Enter required training programs, courses, and development opportunities..."
          rows={8}
        />
      </div>
    </div>
  );
};

export default TrainingAndCoursesTable; 