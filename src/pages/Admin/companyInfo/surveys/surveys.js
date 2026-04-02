import React, { useEffect, useState } from "react";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
import { useUser } from "../../../../context/UserContext";
import { supabase } from "../../../../supabaseClient";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { SURVEYS_OPTIONS } from "../../../../utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGetAllBranches } from "../../../../utils/hooks/api/organizationalStructure";
import { useCompanyEmployeesWithoutMyId } from "../../../../utils/hooks/api/emplyees";

const survey_typeOptions = [
  { label: "Survey", value: "survey" },
  { label: "Quiz", value: "quiz" },
  { label: "Poll", value: "poll" },
];

const priorityOptions = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const ONE_OF_THREE_MSG = "Select at least one of Employees, Departments, or Branches";

const Surveys = ({ data }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isEditMode = !!(data && data.id);

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const { accounts: branches = [], loading: loadingBranches } = useGetAllBranches();
  const { employees, loading: employeesLoading } = useCompanyEmployeesWithoutMyId();

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label:
      `${emp?.employee_code || ""} - ${emp.candidates?.first_name || ""} ${
        emp.candidates?.second_name || ""
      } ${emp.candidates?.third_name || ""} ${emp.candidates?.forth_name || ""} ${
        emp.candidates?.family_name || ""
      }`
        .replace(/\s+/g, " ")
        .trim() || `Employee #${emp.id}`,
  }));

  const initialValues = {
    survey_name: data?.survey_name || "",
    survey_type: data?.survey_type || "",
    priority: data?.priority || "",
    status: data?.status || "",
    branch_id: data?.branch_id || [],       // arrays for multi-selects
    department_id: data?.department_id || [],
    employee_id: data?.employee_id || [],
    created_by_id: user?.id,
    group_by: data?.group_by || null,
    questions:
      data?.survey_questions?.map((q) => ({
        question: q.question_text,
        options: q.options || ["", ""],
      })) || [
        {
          question: "",
          options: ["", ""],
        },
      ],
  };

  // --- Validation: one of employee_id, department_id, branch_id must be filled ---
  const oneOfThree = function (current) {
    const { employee_id, department_id, branch_id } = this.parent;
    const hasEmp = Array.isArray(employee_id) && employee_id.length > 0;
    const hasDept = Array.isArray(department_id) && department_id.length > 0;
    const hasBranch = Array.isArray(branch_id) && branch_id.length > 0;
    return hasEmp || hasDept || hasBranch;
  };

  const validationSchema = Yup.object().shape({
    survey_name: Yup.string().required("Name is required"),
    survey_type: Yup.string().required("Survey type is required"),
    priority: Yup.string().required("Priority is required"),
    status: Yup.string().required("Status is required"),

    // Remove strict per-field requirements and enforce "one of three" across them:
    employee_id: Yup.array().of(Yup.mixed()).test("one-of-three", ONE_OF_THREE_MSG, oneOfThree),
    department_id: Yup.array().of(Yup.mixed()).test("one-of-three", ONE_OF_THREE_MSG, oneOfThree),
    branch_id: Yup.array().of(Yup.mixed()).test("one-of-three", ONE_OF_THREE_MSG, oneOfThree),

    questions: Yup.array()
      .of(
        Yup.object().shape({
          question: Yup.string().required("Question is required"),
          options: Yup.array()
            .of(Yup.string().required("Option is required"))
            .min(1, "At least one option is required")
            .max(10, "Maximum 10 options allowed"),
        })
      )
      .min(1, "At least one question is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const newSurvey = {
        survey_name: values.survey_name,
        survey_type: values.survey_type,
        status: values.status,
        priority: values.priority,
        group_by: values.group_by || null,
        created_by_id: user?.id,
        company_id: user.company_id,
      };

      const { data: insertData, error: insertError } = await supabase
        .from("surveys")
        .insert([newSurvey])
        .select("id")
        .single();

      if (insertError || !insertData) {
        throw new Error("Survey creation failed: " + (insertError?.message || "Unknown error"));
      }

      const survey_id = insertData.id;

      const hasEmployees = Array.isArray(values.employee_id) && values.employee_id.length > 0;
      const hasDepartments = Array.isArray(values.department_id) && values.department_id.length > 0;
      const hasBranch = Array.isArray(values.branch_id) && values.branch_id.length > 0;

      // Priority: Employees > Departments > Branches
      if (hasEmployees) {
        const employeeRows = values.employee_id.map((eid) => ({
          employee_id: Number(eid),
          survey_id,
        }));
        const { error: empLinkErr } = await supabase.from("employee_surveys").insert(employeeRows);
        if (empLinkErr) throw new Error("Error linking employees: " + empLinkErr.message);
      } else if (hasDepartments) {
        const departmentRows = values.department_id.map((deptId) => ({
          department_id: parseInt(deptId, 10),
          survey_id,
        }));
        const { error: deptInsertError } = await supabase
          .from("department_surveys")
          .insert(departmentRows);
        if (deptInsertError) throw new Error("Error linking departments: " + deptInsertError.message);
      } else if (hasBranch) {
        const branchRows = values.branch_id.map((branchId) => ({
          branch_id: parseInt(branchId, 10),
          survey_id,
        }));
        const { error: branchInsertError } = await supabase
          .from("branch_surveys")
          .insert(branchRows);
        if (branchInsertError) throw new Error("Error linking branches: " + branchInsertError.message);
      }

      const questions = values.questions.map((q) => ({
        survey_id,
        question_text: q.question,
        options: q.options,
      }));

      const { error: questionInsertError } = await supabase
        .from("survey_questions")
        .insert(questions);

      if (questionInsertError) {
        await supabase.from("surveys").delete().eq("id", survey_id);
        throw new Error("Adding questions failed: " + questionInsertError.message);
      }

      toast.success("Survey created successfully!");
      navigate(-1);
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase
        .from("organizational_units")
        .select("id, name")
        .eq("is_deleted", false)
        .order("name", { ascending: true });

      if (!error && data) {
        setDepartments(data.map((d) => ({ label: d.name, value: d.id.toString() })));
      } else {
        toast.error("Failed to load departments", error?.message);
      }
      setLoadingDepartments(false);
    };
    fetchDepartments();
  }, []);

  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Company Info", href: "#" },
    { title: "Surveys" },
  ];

  return (
    <PageWrapperWithHeading title="Surveys" items={breadcrumbItems}>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="flex flex-col gap-4 mt-4">
            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                <FormikInputField label="Name" name="survey_name" required={!isEditMode} disabled={isEditMode} />
                <FormikSelectField
                  label="Survey Type"
                  name="survey_type"
                  options={survey_typeOptions}
                  required={!isEditMode}
                  placeholder="Select survey type"
                  disabled={isEditMode}
                />
                <FormikSelectField
                  label="Priority"
                  name="priority"
                  options={priorityOptions}
                  required={!isEditMode}
                  placeholder="Select priority"
                  disabled={isEditMode}
                />
                <FormikSelectField
                  label="Status"
                  name="status"
                  options={SURVEYS_OPTIONS}
                  required={!isEditMode}
                  placeholder="Select Status"
                  disabled={isEditMode}
                />

                {/* Branch (hide if department(s) or employee(s) chosen) */}
                <div
                  className="grid grid-cols gap-4 mt-4"
                  style={{
                    display:
                      (Array.isArray(values.department_id) && values.department_id.length > 0) ||
                      (Array.isArray(values.employee_id) && values.employee_id.length > 0)
                        ? "none"
                        : "block",
                  }}
                >
                  <FormikMultiSelectField
                    name="branch_id"
                    label="Branches"
                    options={branches.map((b) => ({ label: b.name, value: String(b.id) }))}
                    disabled={loadingBranches}
                    placeholder="Select"
                    handleChange={(list) => {
                      setFieldValue("branch_id", list);
                      if (Array.isArray(list) && list.length > 0) {
                        setFieldValue("department_id", []);
                        setFieldValue("employee_id", []);
                      }
                    }}
                  />
                </div>

                {/* Departments (hide if branch(es) or employee(s) chosen) */}
                <div
                  className="grid grid-cols gap-4 mt-4"
                  style={{
                    display:
                      (Array.isArray(values.branch_id) && values.branch_id.length > 0) ||
                      (Array.isArray(values.employee_id) && values.employee_id.length > 0)
                        ? "none"
                        : "block",
                  }}
                >
                  <FormikMultiSelectField
                    name="department_id"
                    label="Departments"
                    options={departments}
                    disabled={loadingDepartments}
                    placeholder="Select"
                    handleChange={(list) => {
                      setFieldValue("department_id", list);
                      if (Array.isArray(list) && list.length > 0) {
                        setFieldValue("branch_id", []);
                        setFieldValue("employee_id", []);
                      }
                    }}
                  />
                </div>

                {/* Employees (hide if branch(es) or department(s) chosen) */}
                <div
                  className="grid grid-cols gap-4 mt-4"
                  style={{
                    display:
                      (Array.isArray(values.branch_id) && values.branch_id.length > 0) ||
                      (Array.isArray(values.department_id) && values.department_id.length > 0)
                        ? "none"
                        : "block",
                  }}
                >
                  <FormikMultiSelectField
                    name="employee_id"
                    label="Employees"
                    options={employeeOptions}
                    disabled={employeesLoading}
                    handleChange={(list) => {
                      setFieldValue("employee_id", list);
                      if (Array.isArray(list) && list.length > 0) {
                        setFieldValue("department_id", []);
                        setFieldValue("branch_id", []);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500 mt-2">
                Note: Choose Employees <i>or</i> Departments <i>or</i> Branches. At least one is required.
              </div>

              <hr className="my-4" />

              <FieldArray name="questions">
                {({ push: pushQuestion, remove: removeQuestion }) => (
                  <>
                    {!isEditMode && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Questions</span>
                        <Button
                          variant="outlined"
                          size="small"
                          type="button"
                          onClick={() => pushQuestion({ question: "", options: ["", ""] })}
                        >
                          Add Question
                        </Button>
                      </div>
                    )}

                    {values.questions.map((q, idx) => (
                      <div key={idx} className="mb-4 p-3 bg-white rounded shadow-sm border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Question {idx + 1}</span>
                          {!isEditMode && values.questions.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              type="button"
                              onClick={() => removeQuestion(idx)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <FormikInputField
                          label=""
                          name={`questions[${idx}].question`}
                          required={!isEditMode}
                          disabled={isEditMode}
                        />

                        <FieldArray name={`questions[${idx}].options`}>
                          {({ push: pushOption, remove: removeOption }) => (
                            <div className="mt-2 grid grid-cols-2 gap-4">
                              {q.options.map((_, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2 mb-2">
                                  <div className="!w-full">
                                    <FormikInputField
                                      label={`Option ${optIdx + 1}`}
                                      name={`questions[${idx}].options[${optIdx}]`}
                                      required={!isEditMode}
                                      disabled={isEditMode}
                                    />
                                  </div>
                                  <div className="flex">
                                    {!isEditMode && q.options.length > 2 && (
                                      <RemoveIcon
                                        onClick={() => removeOption(optIdx)}
                                        className="cursor-pointer"
                                      />
                                    )}
                                    {!isEditMode &&
                                      q.options.length < 10 &&
                                      optIdx === q.options.length - 1 && (
                                        <AddIcon
                                          onClick={() => pushOption("")}
                                          className="cursor-pointer"
                                        />
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </FieldArray>
                      </div>
                    ))}
                  </>
                )}
              </FieldArray>
            </div>

            <div className="mt-4 sticky bottom-0 flex justify-end">
              {!isEditMode && (
                <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}>
                  Submit
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </PageWrapperWithHeading>
  );
};

export default Surveys;



// import React, { useEffect, useState } from "react";
// import { Formik, Form, FieldArray } from "formik";
// import * as Yup from "yup";
// import { Button } from "@mui/material";
// import FormikInputField from "../../../../components/common/FormikInputField";
// import HomeIcon from "@mui/icons-material/Home";
// import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
// import FormikSelectField from "../../../../components/common/FormikSelectField";
// import { useUser } from "../../../../context/UserContext";
// import { supabase } from "../../../../supabaseClient";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import { SURVEYS_OPTIONS } from "../../../../utils/constants";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import { useGetAllBranches } from "../../../../utils/hooks/api/organizationalStructure";
// import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
// import { useCompanyEmployeesWithoutMyId } from "../../../../utils/hooks/api/emplyees";

// const survey_typeOptions = [
//   { label: "Survey", value: "survey" },
//   { label: "Quiz", value: "quiz" },
//   { label: "Poll", value: "poll" },
// ];
// const priorityOptions = [
//   { label: "High", value: "high" },
//   { label: "Medium", value: "medium" },
//   { label: "Low", value: "low" },
// ];

// const Surveys = ({ data }) => {
//   const { user } = useUser();
//   const navigate = useNavigate();
//   const isEditMode = data && data.id;

//   const [departments, setDepartments] = useState([]);
//   const [loadingDepartments, setLoadingDepartments] = useState(true);
//   const { accounts: branches = [], loading: loadingBranches } =
//     useGetAllBranches();
//   const { employees, loading: employeesLoading } =
//     useCompanyEmployeesWithoutMyId();

//   // // Transform employee data to match the expected format for dropdowns
//   // const employeeOptions = employees.map((emp) => ({
//   //   value: emp.id,
//   //   label:
//   //     `${emp?.employee_code || ""} - ${emp.candidates?.first_name || ""} ${
//   //       emp.candidates?.second_name || ""
//   //     } ${emp.candidates?.third_name || ""} ${
//   //       emp.candidates?.forth_name || ""
//   //     } ${emp.candidates?.family_name || ""}`.trim() || `Employee #${emp.id}`,
//   // }));

//   const employeeOptions = employees.map((emp) => ({
//             value: emp.id,
//             label:
//               `${emp?.employee_code || ""} - ${emp.candidates?.first_name || ""} ${
//                 emp.candidates?.second_name || ""
//               } ${emp.candidates?.third_name || ""} ${emp.candidates?.forth_name || ""} ${
//                 emp.candidates?.family_name || ""
//               }`
//                 .replace(/\s+/g, " ")
//                 .trim() || `Employee #${emp.id}`,
//           }));

//   const initialValues = {
//     survey_name: data?.survey_name || "",
//     survey_type: data?.survey_type || "",
//     priority: data?.priority || "",
//     status: data?.status || "",
//     branch_id: data?.branch_id || [],
//       department_id: data?.department_id || [],
//       employee_id:  data?.employee_id  || [],
//     // department_id: data?.department_id ? String(data.department_id) : "",
//     created_by_id: user?.id,
//     group_by: data?.group_by || null,
//     questions: data?.survey_questions.map((q) => ({
//       question: q.question_text,
//       options: q.options || ["", ""],
//     })) || [
//       {
//         question: "",
//         options: ["", ""],
//       },
//     ],
//   };
  

//   const validationSchema = Yup.object().shape({
//     survey_name: Yup.string().required("Name is required"),
//     survey_type: Yup.string().required("Survey type is required"),
//     priority: Yup.string().required("Priority is required"),
//     // department_id: Yup.string().required("Department is required"),
//     status: Yup.string().required("Status is required"),
//     employee_id: Yup.array()
//       .min(1, "At least one employee must be selected")
//       .required("Employees are required"),
//     questions: Yup.array()
//       .of(
//         Yup.object().shape({
//           question: Yup.string().required("Question is required"),
//           options: Yup.array()
//             .of(Yup.string().required("Option is required"))
//             .min(1, "At least one option is required")
//             .max(10, "Maximum 10 options allowed"),
//         })
//       )
//       .min(1, "At least one question is required"),
//   });

//   const handleSubmit = async (values, { setSubmitting }) => {
//     setSubmitting(true);
//     try {
//       const newSurvey = {
//         survey_name: values.survey_name,
//         survey_type: values.survey_type,
//         status: values.status,
//         priority: values.priority,
//         group_by: values.group_by || null,
//         // department_id: values.department_id
//         //   ? Number(values.department_id)
//         //   : null,
//         created_by_id: user?.id,
//         company_id: user.company_id,
//       };

//       // console.log("servey payload", newSurvey);
//       // debugger

//       const { data: insertData, error: insertError } = await supabase
//         .from("surveys")
//         .insert([newSurvey])
//         .select("id")
//         .single();

//       if (insertError || !insertData) {
//         throw new Error("Survey creation failed: " + insertError.message);
//       }

//       const survey_id = insertData.id;


//           const hasEmployees = Array.isArray(values?.employee_id) && values.employee_id.length > 0;
//           const hasDepartments = Array.isArray(values?.department_id) && values.department_id.length > 0;
//           const hasBranch = Array.isArray(values?.branch_id) && values.branch_id.length > 0;
          
        
//             // If org-wide, we're done
//               if (hasEmployees) {
//                 // ✅ Link selected employees (adjust table name/columns if yours differ)
//                 const employeeRows = values.employee_id.map((eid) => ({
//                   employee_id: Number(eid),
//                 survey_id: survey_id,
//                 }));
        
//                 const { error: empLinkErr } = await supabase
//                   .from("employee_surveys")
//                   .insert(employeeRows);
        
//                 if (empLinkErr) {
//                   throw new Error("Error linking employees: " + empLinkErr.message);
//                 }
//               } else if (hasDepartments) {
//                 // ✅ Link selected departments (existing behavior)
//                 const departmentRows = values.department_id.map((deptId) => ({
//                   department_id: parseInt(deptId, 10),
//                   survey_id: survey_id,
//                 }));
        
//                 const { error: deptInsertError } = await supabase
//                   .from("department_surveys")
//                   .insert(departmentRows);
        
//                 if (deptInsertError) {
//                   throw new Error("Error linking departments: " + deptInsertError.message);
//                 }
//               }
//               else if (hasBranch) {
//                 // ✅ Link selected departments (existing behavior)
//                 const branchRows = values.branch_id.map((branchId) => ({
//                   branch_id_id: parseInt(branchId, 10),
//                   survey_id: survey_id,
//                 }));
        
//                 const { error: branchInsertError } = await supabase
//                   .from("branch_surveys")
//                   .insert(branchInsertError);
        
//                 if (branchInsertError) {
//                   throw new Error("Error linking departments: " + branchInsertError.message);
//                 }
//               }
            


//       const questions = values.questions.map((q) => ({
//         survey_id,
//         question_text: q.question,
//         options: q.options,
//       }));

//       const { error: questionInsertError } = await supabase
//         .from("survey_questions")
//         .insert(questions);

//       if (questionInsertError) {
//         await supabase.from("surveys").delete().eq("id", survey_id);
//         throw new Error(
//           "Adding questions failed: " + questionInsertError.message
//         );
//       }
//       toast.success("Survey created successfully!");
//       navigate(-1);
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       setLoadingDepartments(true);
//       const { data, error } = await supabase
//         .from("organizational_units")
//         .select("id, name")
//         .eq("is_deleted", false)
//         .order("name", { ascending: true });

//       if (!error && data) {
//         setDepartments(
//           data.map((d) => ({ label: d.name, value: d.id.toString() }))
//         );
//       } else {
//         toast.error("Failed to load departments", error?.message);
//       }
//       setLoadingDepartments(false);
//     };
//     fetchDepartments();
//   }, []);

//   const breadcrumbItems = [
//     { href: "/home", icon: HomeIcon },
//     { title: "Company Info", href: "#" },
//     { title: "Surveys" },
//   ];

//   return (
//     <PageWrapperWithHeading title="Surveys" items={breadcrumbItems}>
//       <Formik
//         initialValues={initialValues}
//         validationSchema={validationSchema}
//         onSubmit={handleSubmit}
//       >
//         {({ values, isSubmitting, setFieldValue }) => (
//           <Form className="flex flex-col gap-4 mt-4">
//             <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
//               <div className="grid grid-cols-3 gap-4">
//                 <FormikInputField
//                   label="Name"
//                   name="survey_name"
//                   required={isEditMode ? false : true}
//                   disabled={isEditMode}
//                 />
//                 <FormikSelectField
//                   label="Survey Type"
//                   name="survey_type"
//                   options={survey_typeOptions}
//                   required={isEditMode ? false : true}
//                   placeholder="Select survey type"
//                   disabled={isEditMode}
//                 />
//                 <FormikSelectField
//                   label="Priority"
//                   name="priority"
//                   options={priorityOptions}
//                   required={isEditMode ? false : true}
//                   placeholder="Select priority"
//                   disabled={isEditMode}
//                 />
//                 {/* <FormikMultiSelectField
//                   label="Department"
//                   name="department_id"
//                   options={departments}
//                   placeholder="Select department"
//                   disabled={
//                     isEditMode ||
//                     loadingDepartments ||
//                     (!!values.branch_id && values.branch_id !== "")
//                   }
//                   helperText={
//                     !!values.branch_id && values.branch_id !== ""
//                       ? "Department selection is disabled because a branch is already selected."
//                       : ""
//                   }
//                   onChange={(value) => {
//                     setFieldValue("department_id", value);
//                     if (value && value !== "") {
//                       setFieldValue("branch_id", "");
//                     }
//                   }}
//                 /> */}

//                 {/* <FormikMultiSelectField
//                   label="Branch"
//                   name="branch_id"
//                   options={branches}
//                   getOptionLabel={(option) => option?.name || ""}
//                   selectKey="id"
//                   placeholder="Select branch"
//                   disabled={
//                     isEditMode ||
//                     loadingBranches ||
//                     (!!values.department_id && values.department_id !== "")
//                   }
//                   helperText={
//                     !!values.department_id && values.department_id !== ""
//                       ? "Branch selection is disabled because a department is already selected."
//                       : ""
//                   }
//                   onChange={(value) => {
//                     setFieldValue("branch_id", value);
//                     if (value && value !== "") {
//                       setFieldValue("department_id", "");
//                     }
//                   }}
//                 /> */}

//                 <FormikSelectField
//                   label="Status"
//                   name="status"
//                   options={SURVEYS_OPTIONS}
//                   required={isEditMode ? false : true}
//                   placeholder="Select Status"
//                   disabled={isEditMode}
//                 />

//                 {/* <FormikMultiSelectField
//                   name="employees_involved"
//                   label="Employees Involved"
//                   options={employeeOptions}
//                   required
//                   disabled={employeesLoading}
//                 /> */}




//                  {/* Branch (hidden when org OR department chosen OR employees chosen) */}
//               <div
//                 className="grid grid-cols gap-4 mt-4"
//                 style={{
//                   display:
//                     values.for_organization ||
//                     (Array.isArray(values.department_id) && values.department_id.length > 0) ||
//                     (Array.isArray(values.employee_id) && values.employee_id.length > 0)
//                       ? "none"
//                       : "block",
//                 }}
//               >
//                 <FormikSelectField
//                   name="branch_id"
//                   label="Branch"
//                   options={branches}
//                   disabled={loadingDepartments}
//                   placeholder="Select"
//                 />
//               </div>

//               {/* Departments (hidden when org OR branch chosen OR employees chosen) */}
//               <div
//                 className="grid grid-cols gap-4 mt-4"
//                 style={{
//                   display:
//                     values.for_organization ||
//                     (values.branch_id && String(values.branch_id).length > 0) ||
//                     (Array.isArray(values.employee_id) && values.employee_id.length > 0)
//                       ? "none"
//                       : "block",
//                 }}
//               >
//                 <FormikMultiSelectField
//                   name="department_id"
//                   label="Departments"
//                   options={departments}
//                   disabled={loadingDepartments}
//                   placeholder="Select"
//                 />
//               </div>

//               {/* Employees (hidden when org OR branch chosen OR department chosen) */}
//               <div
//                 className="grid grid-cols gap-4 mt-4"
//                 style={{
//                   display:
//                     values.for_organization ||
//                     (values.branch_id && String(values.branch_id).length > 0) ||
//                     (Array.isArray(values.department_id) && values.department_id.length > 0)
//                       ? "none"
//                       : "block",
//                 }}
//               >
//                 <FormikMultiSelectField
//                   name="employee_id"
//                   label="Employees"
//                   options={employeeOptions}
//                   disabled={loadingDepartments}
//                   // optional: when selecting employees, clear others
//                   handleChange={(list) => {
//                     setFieldValue("employee_id", list);
//                     if (Array.isArray(list) && list.length > 0) {
//                       setFieldValue("department_id", []);
//                       setFieldValue("branch_id", []);
//                     }
//                   }}
//                 />
//               </div>
//               </div>
//               <div className="text-sm text-gray-500 mt-2">
//                 Note: If no department or branch is selected, it will be applied
//                 to all departments and branches.
//               </div>

//               <hr className="my-4" />

//               <FieldArray name="questions">
//                 {({ push: pushQuestion, remove: removeQuestion }) => (
//                   <>
//                     {!isEditMode && (
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="font-semibold">Questions</span>
//                         <Button
//                           variant="outlined"
//                           size="small"
//                           type="button"
//                           onClick={() =>
//                             pushQuestion({ question: "", options: ["", ""] })
//                           }
//                         >
//                           Add Question
//                         </Button>
//                       </div>
//                     )}

//                     {values.questions.map((q, idx) => (
//                       <div
//                         key={idx}
//                         className="mb-4 p-3 bg-white rounded shadow-sm border"
//                       >
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="font-medium">
//                             Question {idx + 1}
//                           </span>
//                           {!isEditMode && values.questions.length > 1 && (
//                             <Button
//                               variant="outlined"
//                               color="error"
//                               size="small"
//                               type="button"
//                               onClick={() => removeQuestion(idx)}
//                             >
//                               Remove
//                             </Button>
//                           )}
//                         </div>

//                         <FormikInputField
//                           label=""
//                           name={`questions[${idx}].question`}
//                           required={isEditMode ? false : true}
//                           disabled={isEditMode}
//                         />
//                         <FieldArray name={`questions[${idx}].options`}>
//                           {({ push: pushOption, remove: removeOption }) => (
//                             <div className="mt-2 grid grid-cols-2 gap-4">
//                               {q.options.map((_, optIdx) => (
//                                 <div
//                                   key={optIdx}
//                                   className="flex items-center gap-2 mb-2"
//                                 >
//                                   <div className="!w-full">
//                                     <FormikInputField
//                                       label={`Option ${optIdx + 1}`}
//                                       name={`questions[${idx}].options[${optIdx}]`}
//                                       required={isEditMode ? false : true}
//                                       disabled={isEditMode}
//                                     />
//                                   </div>
//                                   <div
//                                     className={`flex ${
//                                       optIdx + 1
//                                     } ? 'pt-5':''}`}
//                                   >
//                                     {!isEditMode && q.options.length > 2 && (
//                                       <RemoveIcon
//                                         onClick={() => removeOption(optIdx)}
//                                         className="cursor-pointer"
//                                       />
//                                     )}
//                                     {!isEditMode &&
//                                       q.options.length < 10 &&
//                                       optIdx === q.options.length - 1 && (
//                                         <AddIcon
//                                           onClick={() => pushOption("")}
//                                           className="cursor-pointer"
//                                         />
//                                       )}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </FieldArray>
//                       </div>
//                     ))}
//                   </>
//                 )}
//               </FieldArray>
//             </div>

//             <div className="mt-4 sticky bottom-0 flex justify-end">
//               {!isEditMode && (
//                 <Button
//                   variant="contained"
//                   isLoading={isSubmitting}
//                   color="primary"
//                   type="submit"
//                   disabled={isSubmitting}
//                 >
//                   Submit
//                 </Button>
//               )}
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </PageWrapperWithHeading>
//   );
// };

// export default Surveys;
