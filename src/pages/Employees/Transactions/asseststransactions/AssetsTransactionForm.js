"use client";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikRadioGroup from "../../../../components/common/RadioGroup";
import SubmitButton from "../../../../components/common/SubmitButton";
import {
  useCreateAssetsTransaction,
  ASSIGNMENT_TYPE_OPTIONS,
} from "../../../../utils/hooks/api/assetsTransactions";
import { useCompanyEmployeesWithoutMyId, useGetDepartmentHeads } from "../../../../utils/hooks/api/emplyees";
import { useAssetCategories } from "../../../../utils/hooks/api/assetCategories";
import assetsTransactionValidationSchema from "../../../../utils/validations/assetsTransactionValidation";
import { useUser } from "../../../../context/UserContext";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";

const initialValues = {
  assignment_type: "add_asset_to_employee",
  asset_category_id: "",
  asset_id: null,
  asset_code: "",
  asset_value: "",
  serial_number: "",
  asset_note: "",
  from_date: "",
  // to_date: "",
  notes: "",
  assigned_to: ""
};

const AssetsTransactionForm = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { createAssetsTransaction, loading } = useCreateAssetsTransaction();
  const { employees, loading: employeesLoading } = useCompanyEmployeesWithoutMyId();
  const { categoryOptions, loading: categoriesLoading } = useAssetCategories();

    // const { employees, loading } = useAllEmployees();
    // console.log({ employees });

        const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
        const { heads, fetchDepartmentHeads } = useGetDepartmentHeads();
        
    

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    // Decide status based on assignment_type
    const status =
      values.assignment_type === "take_asset_from_employee"
        ? "pending"
        : "approved";


        const org_id = values.organizational_unit_id

    // Fetch both Manager & HOD
    const { manager, hod } = await fetchDepartmentHeads(org_id);

     // Remove organizational_unit_id from payload
    const { organizational_unit_id, ...restValues } = values;



let payload = {
  ...restValues,
  employee_id: user?.id,
  status,
  created_by: user?.id || 1,
  updated_by: user?.id || 1,
};




// Add workflow only if status is pending
if (status === "pending") {

    // Update workflow
    const updatedWorkflow = (workflow_employees || []).map((emp) => {
      let updatedEmp = { ...emp }; // set all to pending

      // If manager found → update only that object
      if (emp.role === "manager" && manager) {
        updatedEmp.id = manager.id || null;
        updatedEmp.name = manager?.candidates?.first_name || manager.name || "Manager";
        updatedEmp.status = "pending";

            }

      // If HOD found → update only that object
      if (emp.role === "hod" && hod) {
        updatedEmp.id = hod.id || null;
        updatedEmp.name = hod?.candidates?.first_name || hod.name || "HOD";
        updatedEmp.status = "pending";

      }

      // If manager/hod is null → do NOT modify that role object at all
      return updatedEmp;
    });


  payload = {
    ...payload,
    status_workflow: updatedWorkflow,
  };
}

    
    const result = await createAssetsTransaction(payload);
    await transactionEmailSender(user, payload, "Asset Transaction", `Add Asset to Employee`);

    if (result) {
      resetForm();
      navigate("/transactions/assets");
    }
  } catch (error) {
    console.error("Error creating assets transaction:", error);
  } finally {
    setSubmitting(false);
  }
};


  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Add Assets Transaction
        </Typography>
      </Box>

      <Box className="breadcrumb-container">
        <Breadcrumbs separator=">">
          <Link underline="hover" color="inherit" href="/home">
            <HomeIcon sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/transactions">
            Transactions
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/transactions/assets-transactions"
          >
            Assets Transactions
          </Link>
          <Typography color="text.primary">Add Assets Transaction</Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white rounded-lg shadow-md">
        <Formik
          initialValues={initialValues}
          validationSchema={assetsTransactionValidationSchema}
          onSubmit={handleSubmit}
        >
          {/* {({ isSubmitting }) => ( */}
            {({ isSubmitting, values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto p-5">
              {/* Employee Selection Section */}
              {/* <div className="bg-gray-100 p-4 rounded-lg mb-4 space-y-5"> */}
                {/* <Box sx={{ width: "50%" }}>
                  <FormikSelectField
                    name="employee_id"
                    label="Employee Number"
                    options={employees}
                    fullWidth
                  />
                </Box> */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employee Name
                    </label>
                    <div className="text-sm text-gray-900">
                      Reem Fathi Hussein Eid
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Job Title
                    </label>
                    <div className="text-sm text-gray-900">General Manager</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employment Status
                    </label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Attendance Status
                    </label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        On Vacation
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <div className="text-sm text-gray-900">Head Office</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employment Date
                    </label>
                    <div className="text-sm text-gray-900">25/04/23</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <div className="text-sm text-gray-900">ISS Business</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <div className="text-sm text-gray-900">Sales</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Division
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Section
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>
                </div> */}
              {/* </div> */}

              {/* Assets Transaction Details Section */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <Typography variant="h6" className="mb-4">
                  Assets Transaction Details
                </Typography>

                {/* Assignment Type Section */}
                <div className="mb-6">
                  <Typography variant="subtitle2" className="mb-3">
                    Assignment Type
                  </Typography>
                  <FormikRadioGroup
                    name="assignment_type"
                    options={ASSIGNMENT_TYPE_OPTIONS}
                    row={false}
                  />
                </div>

                {/* Asset Category and Asset Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              <FormikSelectField
                name="assigned_to"
                label="Employee"
                options={employees}
                placeholder="Select Employee"
                getOptionLabel={(option) =>
                  `${option?.employee_code} - ${option?.candidates?.first_name} ${option?.candidates?.second_name} ${option?.candidates?.third_name} ${option?.candidates?.forth_name} ${option?.candidates?.family_name}`
                }
                selectKey="id"
                onChange={(selected) => {
                  // 1) Normalize to an employee object
                  const selectedId =
                    typeof selected === "object" ? selected?.id : selected;
                
                  const selectedEmp =
                    typeof selected === "object" && selected?.role_columns
                      ? selected
                      : (employees || []).find(e => String(e?.id) === String(selectedId));
                
                  // 2) Persist the selected employee id in the form
                  setFieldValue("assigned_to", selectedId);
                  setFieldValue("organizational_unit_id", selectedEmp?.organizational_unit_id)
                
                  
                
                  // 4) Store roles in Formik (use whatever field names you prefer)
                  // setFieldValue("selected_employee_roles", roles, false);
                  // setFieldValue("selected_employee_primary_role", roles[0] || null, false);
                }}
                // onChange={handleChange}
                // disabled={loading}
                required
              />

                  <FormikSelectField
                    name="asset_category_id"
                    label="Asset Category"
                    options={categoryOptions}
                    fullWidth
                    loading={categoriesLoading}
                    placeholder="Select Asset Category"
                  />
                 
                </div>

                {/* Asset Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <FormikInputField
                    name="asset_id"
                    label="Asset ID"
                    type="number"
                    fullWidth
                    placeholder="Asset ID (optional)"
                  />
                  <FormikInputField
                    name="asset_code"
                    label="Asset Code"
                    fullWidth
                    placeholder="Enter asset code"
                  />
                 
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <FormikInputField
                    name="asset_value"
                    label="Asset Value"
                    type="number"
                    fullWidth
                    placeholder="Enter asset value"
                  />
                  <FormikInputField
                    name="serial_number"
                    label="Serial Number"
                    fullWidth
                    placeholder="Enter serial number"
                  />
                  
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                  <FormikInputField
                    name="from_date"
                    label="From Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    max="2100-12-31"
                  />

                  {/* <FormikInputField
                    name="to_date"
                    label="To Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    max="2100-12-31"
                  /> */}
                </div>

                {/* Asset Note */}
                <div className="mb-6">
                  <FormikInputField
                    name="asset_note"
                    label="Asset Note"
                    multiline
                    minRows={3}
                    fullWidth
                    placeholder="Enter asset note"
                  />
                </div>

                {/* General Notes */}
                <div className="mb-6">
                  <FormikInputField
                    name="notes"
                    label="Notes"
                    multiline
                    minRows={3}
                    fullWidth
                    placeholder="Enter additional notes (optional)"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
              <SubmitButton title="Add" type="submit" isLoading={loading || isSubmitting} disabled={isSubmitting} />
              </Box>
            </Form>
          )}
        </Formik>
      </div>
    </Box>
  );
};

export default AssetsTransactionForm;
