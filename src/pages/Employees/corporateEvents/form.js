import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import PageWrapperWithHeading from "../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import FormikInputField from "../../../components/common/FormikInputField";
import SubmitButton from "../../../components/common/SubmitButton";
import * as Yup from "yup";
import {
  useCreateCorporateEvent,
  useUpdateCorporateEvent,
  useCorporateEventById,
} from "../../../utils/hooks/api/corporateEvents";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../supabaseClient";
import FormikCheckbox from "../../../components/common/FormikCheckbox";
import FormikSelectField from "../../../components/common/FormikSelectField";
import FormikMultiSelectField from "../../../components/common/FormikMultiSelectField";
import { useGenericFlowEmployees } from "../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../utils/helper";


const REQUIRED_ONE_MSG =
  "Select at least one of Organization, Department, Branch or Employee";

const initialValues = {
  start_date: "",
  end_date: "",
  name: "",
  location: "",
  date: "",
  description: "",
  company_id: 1,
  branch_id: "",
  organizational_unit_ids: [],
  employee_ids: [],
  for_organization: false,
};

const validationSchema = Yup.object({
  start_date: Yup.string().required("Start date is required"),
  end_date: Yup.string().required("End date is required"),
  name: Yup.string().required("Event name is required"),
  location: Yup.string().required("Location is required"),
  date: Yup.string().required("Date is required"),
  description: Yup.string().required("Description is required"),

  for_organization: Yup.boolean().test("one-of-four", REQUIRED_ONE_MSG, function (org) {
    const { organizational_unit_ids, branch_id, employee_ids } = this.parent;
    const hasDept = Array.isArray(organizational_unit_ids) && organizational_unit_ids.length > 0;
    const hasBranch = branch_id ? true : false;
    const hasOrg = org === true;
    const hasEmp = Array.isArray(employee_ids) && employee_ids.length > 0;
    if (hasOrg || hasDept || hasBranch || hasEmp) return true;
    return this.createError({ path: "for_organization", message: " " });
  }),

  organizational_unit_ids: Yup.array()
    .of(Yup.mixed())
    .test("one-of-four", REQUIRED_ONE_MSG, function (dept) {
      const { for_organization, branch_id, employee_ids } = this.parent;
      const hasOrg = for_organization === true;
      const hasDept = Array.isArray(dept) && dept.length > 0;
      const hasBranch = branch_id ? true : false;
      const hasEmp = Array.isArray(employee_ids) && employee_ids.length > 0;
      if (hasOrg || hasDept || hasBranch || hasEmp) return true;
      return this.createError({ path: "organizational_unit_ids", message: REQUIRED_ONE_MSG });
    }),

  branch_id: Yup.mixed().test("one-of-four", REQUIRED_ONE_MSG, function (branch) {
    const { for_organization, organizational_unit_ids, employee_ids } = this.parent;
    const hasOrg = for_organization === true;
    const hasDept = Array.isArray(organizational_unit_ids) && organizational_unit_ids.length > 0;
    const hasBranch = branch ? true : false;
    const hasEmp = Array.isArray(employee_ids) && employee_ids.length > 0;
    if (hasOrg || hasDept || hasBranch || hasEmp) return true;
    return this.createError({ path: "branch_id", message: REQUIRED_ONE_MSG });
  }),
});

const CorporateEventForm = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { id } = useParams();
  const isEditMode = !!id;

  const { createCorporateEvent, loading: createLoading } = useCreateCorporateEvent();
  const { updateCorporateEvent, loading: updateLoading } = useUpdateCorporateEvent();
  const { eventData, loading: fetchLoading, error } = useCorporateEventById(id);

  const getInitialValues = () => {
    if (!isEditMode || !eventData) return initialValues;
    return {
      start_date: eventData.start_date || "",
      end_date: eventData.end_date || "",
      name: eventData.name || "",
      location: eventData.location || "",
      date: eventData.date || "",
      description: eventData.description || "",
      company_id: eventData.company_id || 1,
      for_organization: eventData.for_organization || false,
      branch_id: eventData.branch_id ? String(eventData.branch_id) : "",
      organizational_unit_ids: Array.isArray(eventData.organizational_unit_ids)
        ? eventData.organizational_unit_ids.map(String)
        : [],
      employee_ids: Array.isArray(eventData.employee_ids)
        ? eventData.employee_ids.map(String)
        : [],
    };
  };

  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const employeeId = user?.id;

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase.from("organizational_units").select("id, name");
      if (!error) {
        setDepartments(data.map((d) => ({ label: d.name, value: d.id.toString() })));
      } else {
        console.error("Error fetching departments:", error.message);
      }
      setLoadingDepartments(false);
    };

    const fetchBranches = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase.from("branches").select("id, name").eq("is_deleted", false);
      if (!error) {
        setBranches(data.map((d) => ({ label: d.name, value: d.id.toString() })));
      } else {
        console.error("Error fetching branches:", error.message);
      }
      setLoadingDepartments(false);
    };

    const fetchEmployees = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*, candidates:candidates!employees_candidate_id_fkey(*)")
        .eq("is_deleted", false)
        .neq("id", employeeId);

      if (!error) {
        const employeeOptions = data.map((emp) => ({
          value: emp.id.toString(),
          label:
            `${emp?.employee_code || ""} - ${emp.candidates?.first_name || ""} ${
              emp.candidates?.second_name || ""
            } ${emp.candidates?.third_name || ""} ${emp.candidates?.forth_name || ""} ${
              emp.candidates?.family_name || ""
            }`
              .replace(/\s+/g, " ")
              .trim() || `Employee #${emp.id}`,
        }));
        setEmployees(employeeOptions);
      } else {
        console.error("Error fetching employees:", error.message);
      }
      setLoadingDepartments(false);
    };

    fetchBranches();
    fetchDepartments();
    fetchEmployees();
  }, [employeeId]);


      const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
  

  const handleSubmit = async (values) => {

    
    const payload = {
      ...values,
      company_id: 1,
      created_by_id: user?.id,
      status: "pending",
      branch_id: values.branch_id ? Number(values.branch_id) : null,
      organizational_unit_ids: values.organizational_unit_ids.map(Number),
      employee_ids: values.employee_ids.map(Number),
      status_workflow: workflow_employees
    };


    if (isEditMode) {
      const result = await updateCorporateEvent(id, payload);
      if (result.success) navigate("/employees/corporate-events");
    } else {

      const result = await createCorporateEvent(payload);
      await transactionEmailSender(user, payload, "New Event Request", `New Event Request`);

      if (result.success) navigate("/employees/corporate-events");
    }
  };

  const getBreadcrumbItems = () => {
    const baseItems = [
      { icon: HomeIcon, href: "/home" },
      { title: "Corporate Events", href: "/employees/corporate-events" },
    ];
    if (isEditMode) baseItems.push({ title: "Edit Event" });
    else baseItems.push({ title: "Add Event" });
    return baseItems;
  };

  const getPageTitle = () => (isEditMode ? "Edit Event" : "Add Event");
  const getSubmitButtonTitle = () => (isEditMode ? "Update Event" : "Create Event");
  const getLoadingState = () => (isEditMode ? fetchLoading || updateLoading : createLoading);

  if (isEditMode && fetchLoading) {
    return (
      <PageWrapperWithHeading title={getPageTitle()} items={getBreadcrumbItems()}>
        <div className="bg-white p-6 rounded shadow-md text-center text-gray-500">Loading event data...</div>
      </PageWrapperWithHeading>
    );
  }

  if (isEditMode && error) {
    return (
      <PageWrapperWithHeading title={getPageTitle()} items={getBreadcrumbItems()}>
        <div className="bg-white p-6 rounded shadow-md text-center text-red-500">
          Error loading event data: {error}
        </div>
      </PageWrapperWithHeading>
    );
  }

  
  return (
    <PageWrapperWithHeading title={getPageTitle()} items={getBreadcrumbItems()}>
      <div className="bg-white p-6 rounded shadow-md">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-6">
              <FormikInputField name="start_date" label="Start time" type="time" />
              <FormikInputField name="end_date" label="End time" type="time" />
              <FormikInputField name="name" label="Event Name" />
              <FormikInputField name="location" label="Location" />
              <FormikInputField name="date" label="Date" type="date" max="2100-12-31" />
              <FormikInputField name="description" label="Description" multiline rows={3} />

              <div className="grid grid-cols-4 gap-4 mt-4">
                <FormikCheckbox
                  label="Organization"
                  name="for_organization"
                  handleChange={(value) => {
                    setFieldValue("for_organization", value);
                    if (value) {
                      setFieldValue("organizational_unit_ids", []);
                      setFieldValue("branch_id", "");
                      setFieldValue("employee_ids", []);
                    }
                  }}
                />
              </div>

              {/* Branch */}
              {!values.for_organization &&
                (!values.organizational_unit_ids?.length &&
                  !values.employee_ids?.length) && (
                  <FormikSelectField
                    name="branch_id"
                    label="Branch"
                    options={branches}
                    disabled={loadingDepartments}
                    placeholder="Select"
                  />
                )}

              {/* Departments */}
              {!values.for_organization &&
                !values.branch_id &&
                !values.employee_ids?.length && (
                  <FormikMultiSelectField
                    name="organizational_unit_ids"
                    label="Departments"
                    options={departments}
                    disabled={loadingDepartments}
                    placeholder="Select"
                  />
                )}

              {/* Employees */}
              {!values.for_organization &&
                !values.branch_id &&
                !values.organizational_unit_ids?.length && (
                  <FormikMultiSelectField
                    name="employee_ids"
                    label="Employees"
                    options={employees}
                    disabled={loadingDepartments}
                    placeholder="Select"
                    handleChange={(list) => {
                      setFieldValue("employee_ids", list);
                      if (list?.length > 0) {
                        setFieldValue("for_organization", false);
                        setFieldValue("organizational_unit_ids", []);
                        setFieldValue("branch_id", "");
                      }
                    }}
                  />
                )}

              <SubmitButton loading={getLoadingState()}>{getSubmitButtonTitle()}</SubmitButton>
            </Form>
          )}
        </Formik>
      </div>
    </PageWrapperWithHeading>
  );
};

export default CorporateEventForm;






// import React, {useState, useEffect} from "react";
// import { Formik, Form } from "formik";
// import { useNavigate, useParams } from "react-router-dom";
// import PageWrapperWithHeading from "../../../components/common/PageHeadSection";
// import HomeIcon from "@mui/icons-material/Home";
// import FormikInputField from "../../../components/common/FormikInputField";
// import SubmitButton from "../../../components/common/SubmitButton";
// import * as Yup from "yup";
// import {
//   useCreateCorporateEvent,
//   useUpdateCorporateEvent,
//   useCorporateEventById,
// } from "../../../utils/hooks/api/corporateEvents";
// import { useUser } from "../../../context/UserContext";
// import { supabase } from "../../../supabaseClient";
// import FormikCheckbox from "../../../components/common/FormikCheckbox";
// import FormikSelectField from "../../../components/common/FormikSelectField";
// import FormikMultiSelectField from "../../../components/common/FormikMultiSelectField";


// const REQUIRED_ONE_MSG =
//   "Select at least one of Organization, Department or Branch";


// const initialValues = {
//   start_date: "",
//   end_date: "",
//   name: "",
//   location: "",
//   date: "",
//   description: "",
//   company_id: 1,
//         branch_id: "",
//       organizational_unit_ids: [],
//       employee_ids: [], // ✅ include employees in form state
// };

// const validationSchema = Yup.object({
//   start_date: Yup.string().required("Start date is required"),
//   end_date: Yup.string().required("End date is required"),
//   name: Yup.string().required("Event name is required"),
//   location: Yup.string().required("Location is required"),
//   date: Yup.string().required("date is required"),
//   description: Yup.string().required("Description is required"),

  
//     // One-of-four validator repeated on each field so the error can anchor where user is interacting
//     for_organization: Yup.boolean().test("one-of-four", REQUIRED_ONE_MSG, function (org) {
//       const { organizational_unit_ids, branch_id, employee_ids } = this.parent;
//       const hasDept = Array.isArray(organizational_unit_ids) && organizational_unit_ids.length > 0;
//       const hasBranch = Array.isArray(branch_id) ? branch_id.length > 0 : Boolean(branch_id);
//       const hasOrg = org === true;
//       const hasEmp = Array.isArray(employee_ids) && employee_ids.length > 0;
//       if (hasOrg || hasDept || hasBranch || hasEmp) return true;
//       return this.createError({ path: "for_organization", message: " " });
//     }),
  
//     organizational_unit_ids: Yup.array()
//       .of(Yup.mixed())
//       .test("one-of-four", REQUIRED_ONE_MSG, function (dept) {
//         const { for_organization, branch_id, employee_ids } = this.parent;
//         const hasOrg = for_organization === true;
//         const hasDept = Array.isArray(dept) && dept.length > 0;
//         const hasBranch = Array.isArray(branch_id) ? branch_id.length > 0 : Boolean(branch_id);
//         const hasEmp = Array.isArray(employee_ids) && employee_ids.length > 0;
//         if (hasOrg || hasDept || hasBranch || hasEmp) return true;
//         return this.createError({ path: "organizational_unit_ids", message: REQUIRED_ONE_MSG });
//       }),
  
//     branch_id: Yup.mixed().test("one-of-four", REQUIRED_ONE_MSG, function (branch) {
//       const { for_organization, organizational_unit_ids, employee_ids } = this.parent;
//       const hasOrg = for_organization === true;
//       const hasDept = Array.isArray(organizational_unit_ids) && organizational_unit_ids.length > 0;
//       const hasBranch = Array.isArray(branch) ? branch.length > 0 : Boolean(branch);
//       const hasEmp = Array.isArray(employee_ids) && employee_ids.length > 0;
//       if (hasOrg || hasDept || hasBranch || hasEmp) return true;
//       return this.createError({ path: "branch_id", message: REQUIRED_ONE_MSG });
//     }),
  
//     // Include employee_id in the same "one-of-four" rule
//     // employee_ids: Yup.array()
//     //   .of(Yup.mixed())
//     //   .test("one-of-four", REQUIRED_ONE_MSG, function (emps) {
//     //     const { for_organization, organizational_unit_ids, branch_id } = this.parent;
//     //     const hasEmp = Array.isArray(emps) && emps.length > 0;
//     //     const hasOrg = for_organization === true;
//     //     const hasDept = Array.isArray(organizational_unit_ids) && organizational_unit_ids.length > 0;
//     //     const hasBranch = Array.isArray(branch_id) ? branch_id.length > 0 : Boolean(branch_id);
//     //     if (hasOrg || hasDept || hasBranch || hasEmp) return true;
//     //     return this.createError({ path: "employee_ids", message: REQUIRED_ONE_MSG });
//     //   }),
// });

// const CorporateEventForm = () => {
//   const navigate = useNavigate();
//   const { user } = useUser();
//   const { id } = useParams();
//   const isEditMode = !!id;
//   const { createCorporateEvent, loading: createLoading } =
//     useCreateCorporateEvent();
//   const { updateCorporateEvent, loading: updateLoading } =
//     useUpdateCorporateEvent();
//   const { eventData, loading: fetchLoading, error } = useCorporateEventById(id);

//   const getInitialValues = () => {
//     if (!isEditMode || !eventData) return initialValues;
//     return {
//       start_date: eventData.start_date || "",
//       end_date: eventData.end_date || "",
//       name: eventData.name || "",
//       location: eventData.location || "",
//       date: eventData.date || "",
//       description: eventData.description || "",
//       company_id: eventData.company_id || 1,
//       for_organization: eventData.for_organization || false,
//       branch_id: eventData.branch_id || "",
//       organizational_unit_ids: eventData.organizational_unit_ids || [],
//       employee_ids: eventData.employee_ids || [], // ✅ include employees in form state
//     };
//   };

//   console.log("=================>>>", eventData);



//     const [departments, setDepartments] = useState([]);
//     const [branches, setBranches] = useState([]);
//     const [employees, setEmployees] = useState([]);
//     const [loadingDepartments, setLoadingDepartments] = useState(true);
  
//     const employeeId = user?.id;
  
  
//     useEffect(() => {
//       const fetchContracts = async () => {
//         setLoadingDepartments(true);
//         const { data, error } = await supabase.from("organizational_units").select("id, name");
//         if (!error) {
//           setDepartments(data.map((d) => ({ label: d.name, value: d.id.toString() })));
//         } else {
//           console.error("Error fetching departments:", error.message);
//         }
//         setLoadingDepartments(false);

//       };
  
//       const fetchBranches = async () => {
//         setLoadingDepartments(true);
//         const { data, error } = await supabase
//           .from("branches")
//           .select("id, name")
//           .eq("is_deleted", false);
//         if (!error) {
//           setBranches(data.map((d) => ({ label: d.name, value: d.id.toString() })));
//         } else {
//           console.error("Error fetching branches:", error.message);
//         }
//         setLoadingDepartments(false);
//       };
  
//       const fetchEmployees = async () => {
//         setLoadingDepartments(true);
//         const { data, error } = await supabase
//           .from("employees")
//           .select("*, candidates:candidates!employees_candidate_id_fkey(*)")
//           .eq("is_deleted", false)
//           .neq("id", employeeId);
  
//         if (!error) {
//           const employeeOptions = data.map((emp) => ({
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
//           setEmployees(employeeOptions);
//         } else {
//           console.error("Error fetching employees:", error.message);
//         }
//         setLoadingDepartments(false);
//       };
  
//       fetchBranches();
//       fetchContracts();
//       fetchEmployees();
//     }, [employeeId]);





//   const handleSubmit = async (values) => {
//     console.log({ date: values.date });
//     const payload = {
//       ...values,
//       date: values.date,
//       company_id: 1,
//       created_by_id: user?.id,
//       status: 'pending'
//     };


//     if (isEditMode) {
//       const result = await updateCorporateEvent(id, payload);
//       if (result.success) navigate("/employees/corporate-events");
//     } else {
//       const result = await createCorporateEvent(payload);
//       if (result.success) navigate("/employees/corporate-events");
//     }
//   };



  
  

//   const getBreadcrumbItems = () => {
//     const baseItems = [
//       { icon: HomeIcon, href: "/home" },
//       { title: "Corporate Events", href: "/employees/corporate-events" },
//     ];
//     if (isEditMode) baseItems.push({ title: "Edit Event" });
//     else baseItems.push({ title: "Add Event" });
//     return baseItems;
//   };

//   const getPageTitle = () => (isEditMode ? "Edit Event" : "Add Event");
//   const getSubmitButtonTitle = () =>
//     isEditMode ? "Update Event" : "Create Event";
//   const getLoadingState = () =>
//     isEditMode ? fetchLoading || updateLoading : createLoading;

//   if (isEditMode && fetchLoading) {
//     return (
//       <PageWrapperWithHeading
//         title={getPageTitle()}
//         items={getBreadcrumbItems()}
//       >
//         <div className="bg-white p-6 rounded shadow-md">
//           <div className="flex justify-center items-center h-32">
//             <div className="text-gray-500">Loading event data...</div>
//           </div>
//         </div>
//       </PageWrapperWithHeading>
//     );
//   }
//   if (isEditMode && error) {
//     return (
//       <PageWrapperWithHeading
//         title={getPageTitle()}
//         items={getBreadcrumbItems()}
//       >
//         <div className="bg-white p-6 rounded shadow-md">
//           <div className="flex justify-center items-center h-32">
//             <div className="text-red-500">
//               Error loading event data: {error}
//             </div>
//           </div>
//         </div>
//       </PageWrapperWithHeading>
//     );
//   }
//   if (isEditMode && !eventData) {
//     return (
//       <PageWrapperWithHeading
//         title={getPageTitle()}
//         items={getBreadcrumbItems()}
//       >
//         <div className="bg-white p-6 rounded shadow-md">
//           <div className="flex justify-center items-center h-32">
//             <div className="text-gray-500">Event not found</div>
//           </div>
//         </div>
//       </PageWrapperWithHeading>
//     );
//   }

//   return (
//     <PageWrapperWithHeading title={getPageTitle()} items={getBreadcrumbItems()}>
//       <div className="bg-white p-6 rounded shadow-md">
//         <Formik
//           initialValues={getInitialValues()}
//           validationSchema={validationSchema}
//           onSubmit={handleSubmit}
//           enableReinitialize={true}
//         >
//           {({ values, setFieldValue }) => (
//             <Form className="space-y-6">
//               <FormikInputField
//                 name="start_date"
//                 label="Start time"
//                 type="time"
//               />
//               <FormikInputField name="end_date" label="End time" type="time" />
//               <FormikInputField name="name" label="Event Name" />
//               <FormikInputField name="location" label="Location" />
//               <FormikInputField name="date" label="Date" type="date" max="2100-12-31" />
//               <FormikInputField
//                 name="description"
//                 label="Description"
//                 multiline
//                 rows={3}
//               />

              
//               {/* Organization toggle */}
//               <div className="grid grid-cols-4 gap-4 mt-4">
//                 <FormikCheckbox
//                   label="Organization"
//                   name="for_organization"
//                   handleChange={(value) => {
//                     setFieldValue("for_organization", value);
//                     if (value) {
//                       setFieldValue("organizational_unit_ids", []);
//                       setFieldValue("branch_id", "");
//                       setFieldValue("employee_ids", []);
//                     }
//                   }}
//                 />
//               </div>

//               {/* Branch (hidden when org OR department chosen OR employees chosen) */}
//               <div
//                 className="grid grid-cols gap-4 mt-4"
//                 style={{
//                   display:
//                     values.for_organization ||
//                     (Array.isArray(values.organizational_unit_ids) && values.organizational_unit_ids.length > 0) ||
//                     (Array.isArray(values.employee_ids) && values.employee_ids.length > 0)
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
//                     (Array.isArray(values.employee_ids) && values.employee_ids.length > 0)
//                       ? "none"
//                       : "block",
//                 }}
//               >
//                 <FormikMultiSelectField
//                   name="organizational_unit_ids"
//                   label="Departments"
//                   options={departments}
//                   disabled={loadingDepartments}
//                   placeholder="Select"
//                 />
//               </div>

//               {/* Employees (hidden when org OR branch chosen OR department chosen) */}
//               {/* <div
//                 className="grid grid-cols gap-4 mt-4"
//                 style={{
//                   display:
//                     values.for_organization ||
//                     (values.branch_id && String(values.branch_id).length > 0) ||
//                     (Array.isArray(values.organizational_unit_ids) && values.organizational_unit_ids.length > 0)
//                       ? "none"
//                       : "block",
//                 }}
//               >
//                 <FormikMultiSelectField
//                   name="employee_ids"
//                   label="Employees"
//                   options={employees}
//                   disabled={loadingDepartments}
//                   placeholder="Select"

//                   // optional: when selecting employees, clear others
//                   handleChange={(list) => {
//                     setFieldValue("employee_ids", list);
//                     if (Array.isArray(list) && list.length > 0) {
//                       setFieldValue("for_organization", false);
//                       setFieldValue("organizational_unit_ids", []);
//                       setFieldValue("branch_id", "");
//                     }
//                   }}
//                 />
//               </div> */}
//               <SubmitButton loading={getLoadingState()}>
//                 {getSubmitButtonTitle()}
//               </SubmitButton>
//             </Form>
//           )}
//         </Formik>
//       </div>
//     </PageWrapperWithHeading>
//   );
// };

// export default CorporateEventForm;
