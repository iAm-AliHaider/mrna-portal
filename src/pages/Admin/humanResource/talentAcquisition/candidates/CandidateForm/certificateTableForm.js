import React from "react";
import { FieldArray, useFormikContext } from "formik";
import FormikSelectField from "../../../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../../../components/common/FormikInputField";
import DeleteIcon from "@mui/icons-material/Delete";
import SubmitButton from "../../../../../../components/common/SubmitButton";
import FileUploadField from "../../../../../../components/common/FormikFileUpload";
import FormikPinUpload from "../../../../../../components/common/FormikPinUpload";

const CertificationTable = ({
  countryOptions,
  id,
  isPublicView,
  isHideItems = false,
}) => {
  const { values, validateForm } = useFormikContext();
  const disabled = !!id && !isPublicView;
  return (
    <FieldArray name="certifications">
      {({ push, remove }) => (
        <div className="w-full">
          <div className="grid grid-cols-12 gap-2 bg-gray-100 py-4 px-4 text-sm font-semibold text-gray-700">
            <div className="col-span-2 pl-2">
              Certificate<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-1 pl-2">
              Institute<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-2 pl-2">
              Certification Date<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-2 pl-2">
              Country<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-2 pl-2">
              Expiry Date<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-2 pl-2 text-center">
              Attachment<span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-1"></div>
          </div>

          {values?.certifications?.map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-gray-200"
            >
              <div className="col-span-2">
                <FormikInputField
                  name={`certifications[${index}].certificate`}
                  placeholder=""
                  disabled={disabled}
                  required
                />
              </div>
              <div className="col-span-1">
                <FormikInputField
                  name={`certifications[${index}].institute`}
                  placeholder=""
                  disabled={disabled}
                  required
                />
              </div>
              <div className="col-span-2">
                <FormikInputField
                  name={`certifications[${index}].certificationDate`}
                  placeholder="MM/DD/YYYY"
                  type="date"
                  disabled={disabled}
                  max="2100-12-31"
                  required
                />
              </div>
              <div className="col-span-2">
                <FormikSelectField
                  name={`certifications[${index}].country`}
                  placeholder="Select"
                  options={countryOptions}
                  disabled={disabled}
                  required
                />
              </div>
              <div className="col-span-2">
                <FormikInputField
                  name={`certifications[${index}].expiryDate`}
                  placeholder="MM/DD/YYYY"
                  type="date"
                  disabled={disabled}
                  max="2100-12-31"
                  required
                />
              </div>
              <div className="col-span-2 flex justify-center items-center h-full">
                <FormikPinUpload
                  name={`certifications[${index}].attachment`}
                  disabled={disabled}
                  required
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
                    <DeleteIcon size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {!isHideItems && (
            <div className="flex justify-center mt-4">
              <SubmitButton
                type="button"
                onClick={async () => {
                  const validationErrors = await validateForm();
                  if (
                    !validationErrors.certifications ||
                    validationErrors.certifications.length === 0
                  ) {
                    push({
                      certificate: "",
                      institute: "",
                      certificationDate: "",
                      country: "",
                      expiryDate: "",
                    });
                  }
                }}
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

export default CertificationTable;
