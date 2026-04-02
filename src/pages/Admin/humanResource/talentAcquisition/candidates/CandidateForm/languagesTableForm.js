import { FieldArray, useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../../../components/common/SubmitButton";
import DeleteIcon from "@mui/icons-material/Delete";

const proficiencyOptions = [
  { label: "Weak", value: "poor" },
  { label: "Good", value: "good" },
  { label: "Excellent", value: "excellent" },
];

const LanguageTable = ({ id, isPublicView, isHideItems = false }) => {
  const { values, validateForm } = useFormikContext();
  const disabled = !!id && !isPublicView;
  return (
    <FieldArray name="languages">
      {({ push, remove }) => (
        <div className="w-full">
          <div className="grid grid-cols-12 gap-2 bg-gray-100 py-4 px-4 text-sm font-semibold text-gray-700">
            <div className="col-span-3">
              Language
              <span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-3">
              Read
              <span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-3">
              Write
              <span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-2">
              Speak
              <span className="text-red-500 ml-1">*</span>
            </div>
            <div className="col-span-1"></div>
          </div>

          {values?.languages?.map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-gray-200"
            >
              <div className="col-span-3">
                <FormikInputField
                  name={`languages[${index}].language`}
                  placeholder=""
                  disabled={disabled}
                  required
                />
              </div>
              <div className="col-span-3">
                <FormikSelectField
                  name={`languages[${index}].read`}
                  options={proficiencyOptions}
                  placeholder="Select"
                  disabled={disabled}
                  required
                />
              </div>
              <div className="col-span-3">
                <FormikSelectField
                  name={`languages[${index}].write`}
                  options={proficiencyOptions}
                  placeholder="Select"
                  disabled={disabled}
                  required
                />
              </div>
              <div className="col-span-2">
                <FormikSelectField
                  name={`languages[${index}].speak`}
                  options={proficiencyOptions}
                  placeholder="Select"
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
                    <DeleteIcon fontSize="small" />
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
                    !validationErrors.languages ||
                    validationErrors.languages.length === 0
                  ) {
                    push({
                      language: "",
                      read: "",
                      write: "",
                      speak: "",
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

export default LanguageTable;
