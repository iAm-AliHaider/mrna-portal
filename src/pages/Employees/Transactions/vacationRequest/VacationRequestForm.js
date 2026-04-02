import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import SubmitButton from "../../../../components/common/SubmitButton";
import InputField from "../../../../components/common/FormikInputField/Input";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import vacationRequestValidationSchema from "../../../../utils/validations/vacationRequestValidation";
import FormikCheckbox from "../../../../components/common/FormikCheckbox";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { useVacationRequests } from "../../../../utils/hooks/api/vacationRequests";
import {
  useCreateVacationRequest,
  useUpdateVacationRequest,
} from "../../../../utils/hooks/api/vacationRequests";
import { useVacationTypes } from "../../../../utils/hooks/api/vacationTypes";
import { useBranchEmployees } from "../../../../utils/hooks/api/branchEmployees";
import { useCompanyEmployeesWithoutMyId } from "../../../../utils/hooks/api/emplyees";

const initialValues = {
  vacation_type: "",
  start_date: "",
  return_date: "",
  actual_return_date: "",
  morning_half_day: false,
  evening_half_day: false,
  paid_days: "",
  unpaid_days: "",
  holiday_days: "",
  weekend_days: "",
  last_returned_date: "",
  task_list_status: "pending",
  ref_number: "",
  status: "pending",
  description: "",
};

const VacationRequestForm = () => {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const employeeId = user?.id;
  const candidate_number = user?.candidate_no;
  const [formInitialValues, setFormInitialValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [filters] = useState({});
  const [searchQuery] = useState("");
  const [page] = useState(0);
  const [perPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { vacationRequests } = useVacationRequests(
    page,
    searchQuery,
    filters,
    perPage
  );
  const { createVacationRequest } = useCreateVacationRequest();
  const { updateVacationRequest } = useUpdateVacationRequest();
  const { vacationTypes } = useVacationTypes();
  const { employees } = useCompanyEmployeesWithoutMyId();

  // Map employees for select field
  const assignToOptions = (employees || []).map((emp) => ({
    label: `${emp.candidates.first_name} ${emp.candidates.family_name}`.trim(),
    value: emp.id,
  }));

  // Prefill form if editing
  useEffect(() => {
    if (!id || !vacationRequests?.length) return;

    const found = vacationRequests.find((v) => String(v.id) === String(id));
    if (found) {
      setFormInitialValues({
        vacation_type: found["vacation_type"] || "",
        start_date: found["start_date"] || "",
        return_date: found["return_date"] || "",
        actual_return_date: found["actual_return_date"] || "",
        morning_half_day: found["morning_half_day"] || false,
        evening_half_day: found["evening_half_day"] || false,
        paid_days: found["paid_days"] || "",
        unpaid_days: found["unpaid_days"] || "",
        holiday_days: found["holiday_days"] || "",
        weekend_days: found["weekend_days"] || "",
        last_returned_date: found["last_returned_date"] || "",
        task_list_status: found["task_list_status"] || "pending",
        ref_number: found["ref_number"] || "",
        assigned_to: found["assigned_to"] || "",
        description: found.description || "",
      });
    }
  }, [id, vacationRequests?.length]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setIsSubmitting(true);
    const payload = {
      ...values,
      employee_id: employeeId,

      ref_number: String(values["ref_number"]),
      level_management: "static-level",
      assigned_to: values.assigned_to,
      reminder_count: 0,
      escalated: false,
      updated_by: employeeId,
      created_by: employeeId,
    };

    if (user?.role === "manager") {
      payload.is_manager_approve = "approved";
    } else if (user?.role === "hr") {
      payload.is_manager_approve = "approved";
      payload.is_hr_approve = "approved";
    }

    try {
      let result;
      if (id) {
        result = await updateVacationRequest(id, payload);
      } else {
        result = await createVacationRequest(payload);
      }
      if (!result.error) {
        setLoading(false);
        navigate("/transactions/vacation");
      } else {
        setLoading(false);
        setIsSubmitting(false);
      }
    } catch (error) {
      setLoading(false);
      setIsSubmitting(false);
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          {id ? "Update Vacation Request" : "Add Vacation Request"}
        </Typography>
      </Box>

      <Box className="breadcrumb-container">
        <Breadcrumbs separator=">">
          <Link underline="hover" color="inherit" href="/home">
            <HomeIcon sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/transactions/vacation">
            Vacation Requests
          </Link>
          <Typography color="text.primary">
            {id ? "Update Vacation Request" : "Add Vacation Request"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <Formik
          enableReinitialize
          initialValues={formInitialValues}
          validationSchema={vacationRequestValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {/* Top container */}
              {/* Employee Information Section */}
              {/* <div className="bg-gray-100 space-y-5 rounded-lg p-6 mb-6"> */}
              {/* <Box sx={{ width: "50%" }}> */}
              {/* <FormikInputField
                    name="employeeNumber"
                    label="Employee Number"
                    value={candidate_number || ''}
                    fullWidth
                    disabled
                  />
                </Box> */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employee Number*
                    </label>
                    <div className="text-sm text-gray-900">{candidate_number || 'N/A'}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Job Title
                    </label>
                    <div className="text-sm text-gray-900">
                      Application Support Specialist
                    </div>
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
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employee Name
                    </label>
                    <div className="text-sm text-gray-900">Muhammad Ali</div>
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
                    <div className="text-sm text-gray-900">IT Department</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <div className="text-sm text-gray-900">
                      Application Support Specialist
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <div className="text-sm text-gray-900">Main</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Section
                    </label>
                    <div className="text-sm text-gray-900"></div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Sub-Section Level 1
                    </label>
                    <div className="text-sm text-gray-900"></div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Sub-Section Level 2
                    </label>
                    <div className="text-sm text-gray-900"></div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Division
                    </label>
                    <div className="text-sm text-gray-900"></div>
                  </div>
                </div> */}
              {/* </div> */}

              {/* Vacation Request Fields Section */}
              <div className="bg-gray-100 p-4 space-y-5 rounded-lg">
                {/* Vacation Type with Other option */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikSelectField
                      name="vacation_type"
                      label="Vacation Type"
                      options={vacationTypes}
                      fullWidth
                      onChange={(value) =>
                        setFieldValue("vacation_type", value)
                      }
                      getOptionLabel={(option) => option.label}
                      required
                    />
                  </Box>
                </Box>
                {/* Dates */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="start_date"
                      label="Start Date"
                      type="date"
                      fullWidth
                      required
                      max="2100-12-31"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="return_date"
                      label="Return Date"
                      type="date"
                      fullWidth
                      required
                      max="2100-12-31"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="actual_return_date"
                      label="Actual Return Date"
                      type="date"
                      fullWidth
                      required
                      max="2100-12-31"
                    />
                  </Box>
                </Box>
                {/* Half Day Checkboxes */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikCheckbox
                      name="morning_half_day"
                      label="Morning Half Day"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikCheckbox
                      name="evening_half_day"
                      label="Evening Half Day"
                    />
                  </Box>
                </Box>
                {/* Days fields */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="paid_days"
                      label="Paid Days"
                      type="number"
                      fullWidth
                      required
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="unpaid_days"
                      label="Unpaid Days"
                      type="number"
                      fullWidth
                      required
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="holiday_days"
                      label="Holiday Days"
                      type="number"
                      fullWidth
                      required
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="weekend_days"
                      label="Weekend Days"
                      type="number"
                      fullWidth
                      required
                    />
                  </Box>
                </Box>
                {/* Last Return Date and Ref Number */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="last_returned_date"
                      label="Last Returned Date"
                      type="date"
                      fullWidth
                      required
                      max="2100-12-31"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="ref_number"
                      label="Ref Number"
                      type="number"
                      fullWidth
                      required
                    />
                  </Box>
                </Box>
                {/* Description */}
                <Box sx={{ mt: 2 }}>
                  <FormikInputField
                    name="description"
                    label="Description"
                    type="textarea"
                    fullWidth
                    // multiline
                    minRows={4}
                  />
                </Box>
              </div>

              {/* Third section  */}
              {/* Employee Information Section */}
              <div className="bg-gray-100 space-y-5 rounded-lg p-6 mb-6">
                <h1 className="text-lg font-bold">
                  Assign to an employee from your branch
                </h1>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <FormikSelectField
                      name="assigned_to"
                      label="Assign To"
                      options={assignToOptions}
                      fullWidth
                      getOptionLabel={(option) => option.label}
                    />
                  </div>
                  <div className="flex-1">
                    {/* <FileUploadField
                      name="attachment"
                      label="Vacation Attachment"
                    /> */}
                  </div>
                </div>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employee passport expiry date
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employee residency expiry date
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employee Assets
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Unpaid Loan
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      End of service
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Additional Field
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>
                </div> */}
              </div>

              {/* Add button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <SubmitButton
                  title={id ? "Update" : "Add"}
                  type="submit"
                  loading={loading || isSubmitting}
                  disabled={isSubmitting}
                />
              </Box>
            </Form>
          )}
        </Formik>
      </div>
    </Box>
  );
};

export default VacationRequestForm;
