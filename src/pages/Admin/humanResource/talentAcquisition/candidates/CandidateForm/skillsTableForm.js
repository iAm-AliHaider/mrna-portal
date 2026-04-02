// import React from "react";
// import { FieldArray, useFormikContext } from "formik";

// import DeleteIcon from "@mui/icons-material/Delete";
// import SubmitButton from "../../../../../../components/common/SubmitButton";
// import FormikSelectField from "../../../../../../components/common/FormikSelectField";
// import FormikInputField from "../../../../../../components/common/FormikInputField";

// const competencyTypeOptions = [
//   { label: "Type 1", value: "type_1" },
//   { label: "Type 2", value: "type_2" },
// ];

// const competencyOptions = [
//   { label: "Competency 1", value: "competency_1" },
//   { label: "Competency 2", value: "competency_2" },
// ];

// const competencyNames = [
//   { label: "Microsoft Office", value: "microsoft_office" },
//   { label: "Dealing with people", value: "dealing_with_people" },
// ];

// const competencyLevelOptions = [
//   { label: "0", value: "0" },
//   { label: "1", value: "1" },
//   { label: "2", value: "2" },
//   { label: "3", value: "3" },
//   { label: "4", value: "4" },
//   { label: "5", value: "5" },
//   { label: "6", value: "6" },
//   { label: "7", value: "7" },
//   { label: "8", value: "8" },
//   { label: "9", value: "9" },
//   { label: "10", value: "10" },
// ];

// const CompetencyTable = ({ id, isPublicView }) => {
//   const { values } = useFormikContext();
//   const disabled = !!id && !isPublicView;
//   return (
//     <FieldArray name="competencies">
//       {({ push, remove }) => (
//         <div className="w-full">
//           <div className="grid grid-cols-12 gap-2 bg-gray-100 py-4 px-4 text-sm font-semibold text-gray-700">
//             <div className="col-span-4">Skills Set</div>
//             <div className="col-span-3">Skills Level</div>
//             <div className="col-span-1" />
//           </div>

//           {values?.competencies?.map((_, index) => (
//             <div
//               key={index}
//               className="grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-gray-200"
//             >

//               <div className="col-span-4">
//                 <FormikInputField
//                   name={`competencies[${index}].name`}
//                   placeholder=""
//                   disabled={disabled}
//                 />
//               </div>
//               <div className="col-span-3">
//                 <FormikSelectField
//                   name={`competencies[${index}].level`}
//                   options={competencyLevelOptions}
//                   placeholder="Select level"
//                   disabled={disabled}
//                 />
//               </div>
//               <div className="col-span-1 flex justify-end">
//                 <button
//                   type="button"
//                   onClick={() => remove(index)}
//                   className="p-2 rounded-md bg-primary text-white hover:bg-primary-dark"
//                   disabled={disabled}
//                 >
//                   <DeleteIcon fontSize="small" />
//                 </button>
//               </div>
//             </div>
//           ))}

//           <div className="flex justify-center mt-4">
//             <SubmitButton
//               type="button"
//               onClick={() =>
//                 push({
//                   type: "",
//                   name: "",
//                   level: "",
//                 })
//               }
//               title="+ Add New Record"
//               disabled={disabled}
//             />
//           </div>
//         </div>
//       )}
//     </FieldArray>
//   );
// };

// export default CompetencyTable;

import React, { useEffect } from "react";
import { FieldArray, useFormikContext } from "formik";

import DeleteIcon from "@mui/icons-material/Delete";
import SubmitButton from "../../../../../../components/common/SubmitButton";
import FormikSelectField from "../../../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../../../components/common/FormikInputField";

const competencyNames = [
  { label: "Microsoft Office", value: "microsoft_office" },
  { label: "Dealing with people", value: "dealing_with_people" },
  { label: "Computer Skills", value: "computer_skills" },
];

const competencyLevelOptions = [
  { label: "Weak", value: "Weak" },
  { label: "Fair", value: "Fair" },
  { label: "Good", value: "Good" },
];

const isEmptyStr = (v) => v == null || String(v).trim() === "";
const isBlankRow = (r) =>
  !r || (isEmptyStr(r.type) && isEmptyStr(r.name) && isEmptyStr(r.level));

const CompetencyTable = ({ id, isPublicView, isHideItems = false }) => {
  const { values, setFieldValue } = useFormikContext();
  const disabledGlobally = !!id && !isPublicView;

  // Seed two fixed rows if competencies is empty OR only contains blank row(s)
  useEffect(() => {
    const comps = values?.competencies;
    if (!Array.isArray(comps)) return;

    const allBlank = comps.length === 0 || comps.every(isBlankRow);
    if (allBlank) {
      const seeded = competencyNames.slice(0, 3).map((n) => ({
        type: "",
        name: n.label, // fixed label
        level: "",
        locked: true, // non-editable & non-removable
      }));
      setFieldValue("competencies", seeded);
    }
  }, [values?.competencies, setFieldValue]);

  return (
    <FieldArray name="competencies">
      {({ push, remove }) => (
        <div className="w-full">
          <div className="grid grid-cols-12 gap-2 bg-gray-100 py-4 px-4 text-sm font-semibold text-gray-700">
            <div className="col-span-5">Skills Set</div>
            <div className="col-span-5">Skills Level</div>
            <div className="col-span-1" />
          </div>

          {(values?.competencies || []).map((row, index) => {
            const locked = !!row?.locked;
            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-gray-200"
              >
                <div className="col-span-5">
                  <FormikInputField
                    name={`competencies[${index}].name`}
                    placeholder=""
                    disabled={disabledGlobally || locked} // names for seeded rows are not changeable
                  />
                </div>

                <div className="col-span-5">
                  <FormikSelectField
                    name={`competencies[${index}].level`}
                    options={competencyLevelOptions}
                    placeholder="Select level"
                    disabled={disabledGlobally} // level stays editable unless globally disabled
                  />
                </div>

                {!isHideItems && (
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className={`p-2 rounded-md text-white ${
                        disabledGlobally || locked
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-primary hover:bg-primary-dark"
                      }`}
                      disabled={disabledGlobally || locked} // cannot remove seeded rows
                      aria-label="Delete competency"
                      title={
                        locked ? "This competency cannot be removed" : "Delete"
                      }
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
                    type: "",
                    name: "",
                    level: "",
                    locked: false,
                  })
                }
                title="+ Add New Record"
                disabled={disabledGlobally}
              />
            </div>
          )}
        </div>
      )}
    </FieldArray>
  );
};

export default CompetencyTable;
