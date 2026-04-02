import React, { useEffect } from "react";
import { FieldArray, useFormikContext } from "formik";
import DeleteIcon from "@mui/icons-material/Delete";
import FormikSelectField from "../../../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../../../components/common/FormikInputField";
import SubmitButton from "../../../../../../components/common/SubmitButton";

const branchOptions = [
  { label: "Branch 1", value: "branch_1" },
  { label: "Branch 2", value: "branch_2" },
];

const unitOptions = [
  { label: "Unit 1", value: "unit_1" },
  { label: "Unit 2", value: "unit_2" },
];

const departmentOptions = [
  { label: "Department 1", value: "department_1" },
  { label: "Department 2", value: "department_2" },
];

const divisionOptions = [
  { label: "Division 1", value: "division_1" },
  { label: "Division 2", value: "division_2" },
];

const sectionOptions = [
  { label: "Section 1", value: "section_1" },
  { label: "Section 2", value: "section_2" },
];

const jobTitleOptions = [
  { label: "Job Title 1", value: "job_title_1" },
  { label: "Job Title 2", value: "job_title_2" },
];

const RelativesTable = ({
  values,
  branches,
  setSelectedOrganizationalUnits,
  organizationalChilds,
  organizationalUnits,
  id,
  isPublicView,
  isHideItems = false,
}) => {
  const { setFieldValue } = useFormikContext();
  const disabled = !!id && !isPublicView;

  const handleUnitChange = (value, index) => {
    setFieldValue(`relatives[${index}].unit`, value);
    setSelectedOrganizationalUnits(value);
    // Clear department when unit changes
    setFieldValue(`relatives[${index}].department`, "");
    setFieldValue(`relatives[${index}].department_name`, "");
  };

  const handleDepartmentChange = (value, index) => {
    const selectedDept = organizationalChilds?.find((d) => d.value === value);
    setFieldValue(`relatives[${index}].department`, value);
    setFieldValue(
      `relatives[${index}].department_name`,
      selectedDept?.label || ""
    );
  };

  return (
    <FieldArray name="relatives">
      {({ push, remove }) => (
        <div className="w-full">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 bg-gray-100 py-4 px-4 text-sm font-semibold text-gray-700">
            <div className="col-span-2">Relatives</div>
            <div className="col-span-1">Branch</div>
            <div className="col-span-1">Unit</div>
            <div className="col-span-1">Department</div>
            <div className="col-span-2">Division</div>
            <div className="col-span-2">Section</div>
            <div className="col-span-2">Job Title</div>
            <div className="col-span-1"></div>
          </div>

          {/* Rows */}
          {values?.relatives?.map((relative, index) => {
            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-gray-200"
              >
                <div className="col-span-2">
                  <FormikInputField
                    name={`relatives[${index}].relative`}
                    placeholder=""
                    disabled={disabled}
                  />
                </div>
                <div className="col-span-1">
                  <FormikSelectField
                    name={`relatives[${index}].branch`}
                    placeholder="Select"
                    options={branches}
                    value={relative.branch}
                    displayValue={relative.branch_name}
                    disabled={disabled}
                  />
                </div>
                <div className="col-span-1">
                  <FormikSelectField
                    name={`relatives[${index}].unit`}
                    placeholder="Select"
                    options={organizationalUnits}
                    value={relative.unit}
                    displayValue={relative.unit_name}
                    onChange={(value) => handleUnitChange(value, index)}
                    disabled={disabled}
                    // required
                  />
                </div>
                <div className="col-span-1">
                  <FormikSelectField
                    name={`relatives[${index}].department`}
                    placeholder="Select"
                    options={organizationalChilds}
                    value={relative.department}
                    displayValue={relative.department_name}
                    onChange={(value) => handleDepartmentChange(value, index)}
                    disabled={disabled}
                  />
                </div>
                <div className="col-span-2">
                  <FormikInputField
                    name={`relatives[${index}].division`}
                    placeholder=""
                    disabled={disabled}
                  />
                </div>
                <div className="col-span-2">
                  <FormikInputField
                    name={`relatives[${index}].section`}
                    placeholder=""
                    disabled={disabled}
                  />
                </div>
                <div className="col-span-2">
                  <FormikInputField
                    name={`relatives[${index}].jobTitle`}
                    placeholder=""
                    disabled={disabled}
                  />
                </div>
                {!isHideItems && (
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 rounded-md bg-primary text-white hover:bg-primary-dark"
                      disabled={disabled}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {!isHideItems && (
            <div className="flex justify-center mt-4">
              <SubmitButton
                type="button"
                onClick={() =>
                  push({
                    relative: "",
                    branch: "",
                    branch_name: "",
                    unit: "",
                    unit_name: "",
                    department: "",
                    department_name: "",
                    division: "",
                    section: "",
                    jobTitle: "",
                  })
                }
                title="+ Add New Record"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      )}
    </FieldArray>
  );
};

export default RelativesTable;
