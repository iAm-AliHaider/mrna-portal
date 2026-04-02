import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import { useDepartments } from "../../../../utils/hooks/api/useDepartments";
import { MASTER_DATA_TYPES } from "../../../../utils/constants";
import { useUser } from "../../../../context/UserContext";
import { useBranches } from "../../../../utils/hooks/api/useBranches";
import { useBranch } from "../../../../utils/hooks/api/branches";
import { useDesignation } from "../../../../utils/hooks/api/useDesignations";
import { useDesignations } from "../../../../utils/hooks/api/useDesignations";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import { Button } from "@mui/material";
import { format } from "date-fns";

const fieldMap = {
  passport_info: {
    oldKey: "old_passport_number",
    newKey: "new_passport_number",
    type: "text",
  },
  branch: { oldKey: "old_branch", newKey: "new_branch", type: "number" },
  family_size: {
    oldKey: "old_family_size",
    newKey: "new_family_size",
    type: "number",
  },
  department: {
    oldKey: "old_department",
    newKey: "new_department",
    type: "text",
  },
  designation: {
    oldKey: "old_designation",
    newKey: "new_designation",
    type: "text",
  },
  salary: { oldKey: "old_salary", newKey: "new_salary", type: "number" },
  number: {
    oldKey: "old_work_number",
    newKey: "new_work_number",
    type: "number",
  },
  address: { oldKey: "old_address", newKey: "new_address", type: "text" },
  probation: { oldKey: "reason", newKey: "reason", type: "text" },
  bank_transfer_request: { oldKey: "", newKey: "", type: "text" }
};

const MasterDataRequestForm = ({ open, onClose, onSubmit, loading }) => {
  const { user } = useUser();
  const employee = user || {};
  const [selectedType, setSelectedType] = useState("");
  const selectedField = fieldMap[selectedType];
  const [initialOldValue, setInitialOldValue] = useState("");

  const { branches: branchOptions } = useBranches();
  const { departments: departmentOptions } = useDepartments();
  const { designationNames } = useDesignations(
    0,
    "",
    useMemo(() => ({}), []),
    1000
  );

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!selectedType) return;

    let value = "";
    switch (selectedType) {
      case "passport_info":
        value = employee.passport_number || "";
        break;
      case "branch":
        value = employee.branch_id || "";
        break;
      case "family_size":
        value = employee.family_members?.toString() || "";
        break;
      case "department":
        value = employee.organizational_unit_id?.toString() || "";
        break;
      case "bank_transfer_request":
        value = employee.organizational_unit_id?.toString() || "";
        break;
      case "designation":
        value = employee.designation_type || "";
        break;
      case "salary":
        value = employee.total_salary || "";
        break;
      case "number":
        value = employee.office_number || "";
        break;
      case "address":
        value = employee.address || "";
        break;
      case "probation":
        value = "";
        break;
      default:
        value = "";
    }

    setInitialOldValue(value);
  }, [selectedType, employee]);

  return (
    <Modal title="Master Data Request" open={open} onClose={onClose}>
      <Formik
        initialValues={{
          type: selectedType || "",
          old_value: initialOldValue,
          new_value: "",
          reason: "",
        }}
        enableReinitialize
        validationSchema={Yup.object({
          type: Yup.string().required("Required"),
          old_value: Yup.string().notRequired(),
          new_value: Yup.string().when("type", {
            is: (val) => val !== "probation",
            then: (schema) => schema.required("Required"),
            otherwise: (schema) => schema.notRequired(),
          }),
          reason: Yup.string().when("type", {
            is: "probation",
            then: (schema) => schema.required("Reason is required"),
            otherwise: (schema) => schema.notRequired(),
          }),
        })}
        onSubmit={onSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="space-y-5">
            <FormikSelectField
              name="type"
              label="Type"
              options={MASTER_DATA_TYPES}
              value={selectedType}
              onChange={(value) => {
                setSelectedType(value);
                setFieldValue("type", value);
                setFieldValue("old_value", "");
                setFieldValue("new_value", "");
              }}
              required
            />

            {selectedField && (
              <>
                {selectedType === "branch" && (
                  <>
                    <FormikSelectField
                      name="old_value"
                      label="Old Branch"
                      options={branchOptions}
                      selectKey="id"
                      getOptionLabel={(option) => option.name}
                      required
                      disabled
                    />
                    <FormikSelectField
                      name="new_value"
                      label="New Branch"
                      options={branchOptions}
                      selectKey="id"
                      getOptionLabel={(option) => option.name}
                      required
                    />
                  </>
                )}

                {selectedType === "department" && (
                  <>
                    <FormikSelectField
                      name="old_value"
                      label="Old Department"
                      options={departmentOptions}
                      required
                      disabled
                    />
                    <FormikSelectField
                      name="new_value"
                      label="New Department"
                      options={departmentOptions}
                      required
                    />
                  </>
                )}

                {selectedType === "bank_transfer_request" && (
                  <>
                    <FormikInputField
                      name="bank_transfer_request_attached_new_iban"
                      label="New IBAN"
                      type="text"
                      required
                    />
                    <FormikInputField
                      name="bank_transfer_request_bank_name"
                      label="Bank Name"
                      type="text"
                      required
                    />
                    <FileUploadField
                      name="bank_transfer_request_clearance_certificate_from_old_bank"
                      label="Clearance Certificate from Old Bank"
                      required
                    />
                    <FormikInputField
                      name="custom_title"
                      label="Custom Title"
                      type="text"
                      required
                    />
                    <FormikInputField
                      name="custom_details"
                      label="Details"
                      type="textarea"
                      rows={4}
                      required
                    />

                    <FileUploadField name="file_path" label="Attachment" />

                    <FormikInputField
                      name="created_on"
                      label="Created On"
                      type="date"
                      value={today}
                      disabled
                      InputProps={{ readOnly: true }}
                      max="2100-12-31"
                    />
                  </>
                )}

                {selectedType === "designation" && (
                  <>
                    <FormikSelectField
                      name="old_value"
                      label="Old Designation"
                      options={designationNames}
                      required
                      disabled
                    />
                    <FormikSelectField
                      name="new_value"
                      label="New Designation"
                      options={designationNames}
                      required
                    />
                  </>
                )}
                {selectedType === "passport_info" && (
                  <>
                    <FormikInputField
                      name="old_value"
                      label={`Old Passport Info`}
                      type={selectedField.type}
                      required
                      disabled
                    />
                    <FormikInputField
                      name="new_value"
                      label={`New Passport Info`}
                      type={selectedField.type}
                      required
                    />
                  </>
                )}
                {selectedType === "probation" && (
                  <>
                    <FormikInputField
                      name="reason"
                      label="Reason for Probation Finish Request"
                      type="text"
                      required
                    />
                  </>
                )}

                {![
                  "branch",
                  "department",
                  "designation",
                  "probation",
                  "passport_info",
                  "bank_transfer_request",
                ].includes(selectedType) && (
                  <>
                    <FormikInputField
                      name="old_value"
                      label={`Old ${selectedType.replace("_", " ")}`}
                      type={selectedField.type}
                      required
                      disabled
                    />
                    <FormikInputField
                      name="new_value"
                      label={`New ${selectedType.replace("_", " ")}`}
                      type={selectedField.type}
                      required
                    />
                  </>
                )}
              </>
            )}

            <div className="flex justify-end gap-2">
              <SubmitButton
                title="Cancel"
                variant="outlined"
                type="button"
                onClick={onClose}
              />
              <SubmitButton title="Submit" isLoading={loading} />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default MasterDataRequestForm;
