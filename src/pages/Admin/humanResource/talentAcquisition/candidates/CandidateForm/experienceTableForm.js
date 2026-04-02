import { FieldArray, useFormikContext } from "formik";
import FormikInputField from "../../../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../../../components/common/SubmitButton";
import FormikCheckbox from "../../../../../../components/common/FormikCheckbox";
import DeleteIcon from "@mui/icons-material/Delete";

// const countryOptions = [
//   { label: "Saudi Arabia", value: "saudi_arabia" },
//   { label: "UAE", value: "uae" },
//   { label: "Qatar", value: "qatar" },
// ];

const ExperienceOption = [
  { label: "Experienced", value: "have experience" },
  { label: "No Experience", value: "no experience" },
];

const currencyOptions = [
  { label: "SAR", value: "sar" },
  { label: "USD", value: "usd" },
];

const ExperienceTable = ({
  countryOptions,
  setDeletedExperienceIds,
  id,
  isPublicView,
  isHideItems = false,
}) => {
  const { values, setFieldValue } = useFormikContext();
  const disabled = !!id && !isPublicView;

  const handleCurrentlyWorkingChange = (index, checked) => {
    setFieldValue(`experience[${index}].currentlyWorking`, checked);
    if (checked) {
      // If currently working, clear the to_date
      setFieldValue(`experience[${index}].toDate`, "");
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FormikSelectField
          name="has_expierence"
          label="Has Experience"
          options={ExperienceOption}
          required={true}
          disabled={disabled}
          onChange={(value) => {
            setFieldValue("has_expierence", value);
          }}
        />
      </div>

      {values.has_expierence === "have experience" && (
        <FieldArray name="experience">
          {({ push, remove }) => (
            <div className="w-full">
              <div className="grid grid-cols-13 gap-2 bg-gray-100 py-4 px-4 text-sm font-semibold text-gray-700">
                <div className="col-span-1 pl-2">Company</div>
                <div className="col-span-1 pl-2">Job Title</div>
                <div className="col-span-1 pl-2">Industry</div>
                <div className="col-span-1 pl-2">Country</div>
                <div className="col-span-1 pl-2">City</div>
                <div className="col-span-1 pl-2">Salary</div>
                <div className="col-span-1 pl-2">Currency</div>
                <div className="col-span-1 pl-2">From Date</div>
                <div className="col-span-1 pl-2">To Date</div>
                <div className="col-span-1 pl-2">Currently Working</div>
                <div className="col-span-1 pl-2">Reason of Leaving</div>
                <div className="col-span-1 pl-2">Source</div>
                <div className="col-span-1 pl-2"></div>
              </div>

              {values?.experience?.map((row, index) => (
                <div
                  key={row.id || index}
                  className="grid grid-cols-13 gap-2 py-2 px-4 items-center border-b border-gray-200"
                >
                  <div className="col-span-1">
                    <FormikInputField
                      name={`experience[${index}].company_name`}
                      placeholder=""
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikInputField
                      name={`experience[${index}].jobTitle`}
                      placeholder=""
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikInputField
                      name={`experience[${index}].industry`}
                      placeholder=""
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikSelectField
                      name={`experience[${index}].country`}
                      options={countryOptions}
                      placeholder="Select"
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikInputField
                      name={`experience[${index}].city`}
                      placeholder=""
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikInputField
                      name={`experience[${index}].salary`}
                      placeholder=""
                      type="number"
                      // required
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikSelectField
                      name={`experience[${index}].currency`}
                      options={currencyOptions}
                      placeholder="Select"
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikInputField
                      name={`experience[${index}].fromDate`}
                      type="date"
                      disabled={disabled}
                      max="2100-12-31"
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikInputField
                      name={`experience[${index}].toDate`}
                      type="date"
                      disabled={row.currentlyWorking || disabled}
                      max="2100-12-31"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <FormikCheckbox
                      name={`experience[${index}].currentlyWorking`}
                      onChange={(checked) =>
                        handleCurrentlyWorkingChange(index, checked)
                      }
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikInputField
                      name={`experience[${index}].reason`}
                      placeholder=""
                      disabled={disabled}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormikInputField
                      name={`experience[${index}].source`}
                      placeholder=""
                      disabled={disabled}
                    />
                  </div>
                  {!isHideItems && (
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (row.id && setDeletedExperienceIds) {
                            setDeletedExperienceIds((prev) => [
                              ...prev,
                              row.id,
                            ]);
                          }
                          remove(index);
                        }}
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
                    title="+ Add New Record"
                    onClick={() =>
                      push({
                        id: undefined,
                        company_name: "",
                        jobTitle: "",
                        industry: "",
                        country: "",
                        city: "",
                        salary: "",
                        currency: "",
                        fromDate: "",
                        toDate: "",
                        currentlyWorking: false,
                        reason: "",
                        source: "",
                      })
                    }
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          )}
        </FieldArray>
      )}
    </>
  );
};

export default ExperienceTable;
