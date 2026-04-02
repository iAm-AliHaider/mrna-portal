"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
} from "@mui/material";
import * as Yup from "yup";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import { Formik, Form } from "formik";
import FormikRadioGroup from "../../../../components/common/RadioGroup";
import useUserData from "../../../../utils/hooks/api/user";
import { supaBaseFilteredEqualCall } from "../../../../utils/common";
import { useUser } from "../../../../context/UserContext";
import LoanRequestsPDF from "../../../../components/pdfComponenets/LoanRequestsPDF";
import DownloadPDFButton from "../../../../components/pdfComponenets/DownloadPDFButton";
import useLoanRequestsData from "../../../../utils/hooks/api/useLoanRequestsData";
import toast from "react-hot-toast";

const initialValues = {
  employeeNumber: null,
  month: "",
  year: "",
  reportName: "Default Loan Requests Report",
  workEmail: false,
  permanentEmail: false,
  permanentEmailAddress: "",
  notes: "",
};

const validationSchema = Yup.object({
  notes: Yup.string()
    .optional()
    .test("no-spaces", "Empty spaces are not allowed", (value) =>
      value ? value.trim().length > 0 : true
    ),
    permanentEmailAddress: Yup.string().when('permanentEmail', {
      is: true,
      then: (schema) => schema
        .email('Please enter a valid email address')
        .required('Email is required when Personal Email is checked'),
      otherwise: (schema) => schema
    })
});

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];
const reportNameOptions = [
  {
    value: "Default Loan Requests Report",
    label: "Default Loan Requests Report",
  },
];

const getFullName = (c) =>
  [
    c?.first_name,
    c?.second_name,
    c?.third_name,
    c?.forth_name,
    c?.family_name,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

const LoanRequestsReport = () => {
  const [loanParams, setLoanParams] = useState({
    month: null,
    year: null,
    employeeId: null,
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const { data: employeeDetails, loading: userLoading } = useUserData(employeeId);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const isEmployeeSelected = !!employeeId;
  const [pdfData, setPdfData] = useState({
    requests: null,
    employee: null,
  });
  const { user } = useUser();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      // Normalize roles array & check for “manager”
      const roles = user?.role_columns?.roles ?? [];
      const hasManager = roles.includes('manager');
      // Decide which field/value to use
      const useOrg = hasManager && Boolean(user?.organizational_unit_id);
      const filterField = useOrg ? 'organizational_unit_id' : 'company_id';
      const filterValue = useOrg
        ? user.organizational_unit_id
        : user?.company_id;

      // If neither org nor company is set, bail out
      if (!filterValue) {
        console.warn('No organizational_unit_id or company_id to filter on.');
        setEmployeeOptions([]);
        return;
      }

      try {
                        // Fetch & map to { value, label } shape
const employees = await supaBaseFilteredEqualCall(
  "employees",
  filterField,
  filterValue
);

const options = (employees || []).map(
  ({
    id,
    employee_code,
    candidates,
  }) => ({
    value: id,
    label:
      `${employee_code || ""} - ${candidates?.first_name || ""} ${
        candidates?.second_name || ""
      } ${candidates?.third_name || ""} ${candidates?.forth_name || ""} ${
        candidates?.family_name || ""
      }`
        .replace(/\s+/g, " ")
        .trim() || `Employee #${id}`,
  })
);

setEmployeeOptions(options);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };
    fetchEmployeeData();
  }, [user?.id]);

  const { data: requestsData, error, loading: requestsLoading } =
    useLoanRequestsData(
      loanParams.month && loanParams.year && loanParams.employeeId
        ? loanParams
        : null
    );

  useEffect(() => {
    if (requestsData && employeeDetails) {
      setPdfData({
        requests: requestsData,
        employee: {
          full_name: getFullName(employeeDetails.candidates),
          employee_code: employeeDetails.employee_code || "N/A",
          employment_status: employeeDetails.employee_status || "N/A",
          department:
            employeeDetails.organizational_units?.name || "N/A",
          designation_name: employeeDetails.designation?.name || "N/A",
          employment_type: employeeDetails.employement_type?.name || "N/A",
          user_status: employeeDetails.user_status || "N/A",
          mobile: employeeDetails.candidates?.mobile || "N/A",
          work_email: employeeDetails.work_email || "N/A",
          shift: `${employeeDetails.shift_start_time || "00:00:00"} - ${
            employeeDetails.shift_end_time || "00:00:00"
          }`,
          month: loanParams.month,
          year: loanParams.year,
        },
      });
    }
  }, [requestsData, employeeDetails, loanParams]);

  const handleSubmit = (values) => {
    if (!values.employeeNumber) {
      toast.error("Please select an employee");
      return;
    }
    setIsFormSubmitted(true);
    setLoanParams({
      month: values.month,
      year: values.year,
      employeeId: values.employeeNumber,
    });
  };

  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Loan Requests Report
        </Typography>
      </Box>

      <Box className="breadcrumb-container">
        <Breadcrumbs separator=">">
          <Link underline="hover" color="inherit" href="/home">
            <HomeIcon sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/reports">
            Reports
          </Link>
          <Typography color="text.primary">
            Loan Requests Report
          </Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white rounded-lg shadow-md">
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          disabled={!isEmployeeSelected}
          enableReinitialize
        >
          {({ values, setFieldValue, resetForm }) => (
            <Form className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Employee Selection Section */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <Box sx={{ width: "50%" }}>
                  <FormikSelectField
                    name="employeeNumber"
                    label="Employee Number"
                    options={employeeOptions}
                    placeholder="Select an employee"
                    fullWidth
                    required
                    onChange={(e) => {
                      const val = e?.target?.value ?? e;
                      resetForm({
                        values: { ...initialValues, employeeNumber: val },
                      });
                      setEmployeeId(val);
                      setIsFormSubmitted(false);
                      setPdfData({ requests: null, employee: null });
                    }}
                  />
                </Box>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {/* First Column */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Employee Name:
                      </span>{" "}
                      <span className="text-sm text-gray-900">
                        {getFullName(employeeDetails?.candidates)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Employee Code:
                      </span>{" "}
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.employee_code}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Email:
                      </span>{" "}
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.candidates?.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Mobile:
                      </span>{" "}
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.candidates?.mobile}
                      </span>
                    </div>
                  </div>

                  {/* Second Column */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Designation:
                      </span>{" "}
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.designation?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Employment Status:
                      </span>{" "}
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.employee_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Employment Type:
                      </span>{" "}
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.employement_type?.name}
                      </span>
                    </div>
                  </div>

                  {/* Third Column */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Account Status:
                      </span>{" "}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                        {employeeDetails?.user_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Department:
                      </span>{" "}
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.organizational_units?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Shift:
                      </span>{" "}
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.shift_start_time} -{" "}
                        {employeeDetails?.shift_end_time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Configuration Section */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <FormikSelectField
                    name="month"
                    label="Month"
                    options={monthOptions}
                    fullWidth
                    required
                    disabled={!isEmployeeSelected}
                  />
                  <FormikInputField
                    name="year"
                    label="Year"
                    type="number"
                    fullWidth
                    required
                    disabled={!isEmployeeSelected}
                  />
                  <FormikSelectField
                    name="reportName"
                    label="Report Name"
                    options={reportNameOptions}
                    fullWidth
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.workEmail}
                        onChange={(e) =>
                          setFieldValue("workEmail", e.target.checked)
                        }
                        disabled={!isEmployeeSelected}
                      />
                    }
                    label="Work Email"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.permanentEmail}
                        onChange={(e) => {
                          setFieldValue(
                            "permanentEmail",
                            e.target.checked
                          );
                          if (!e.target.checked)
                            setFieldValue("permanentEmailAddress", "");
                        }}
                        disabled={!isEmployeeSelected}
                      />
                    }
                    label="Personal Email"
                  />
                  {values.permanentEmail && (
                    <div className="grid grid-cols-1 mb-6">
                      <Box sx={{ mt: 1, width: "100%" }}>
                        <FormikInputField
                          name="permanentEmailAddress"
                          label="Personal Email Address"
                          placeholder="Enter personal email address"
                          fullWidth
                          disabled={!isEmployeeSelected}
                        />
                      </Box>
                    </div>
                  )}
                </div>

                <FormikInputField
                  name="notes"
                  label="Notes"
                  multiline
                  rows={4}
                  fullWidth
                  disabled={!isEmployeeSelected}
                />
              </div>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  p: 2,
                }}
              >
                <Button
                  variant="contained"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  type="submit"
                >
                  Show Report
                </Button>
              </Box>
            </Form>
          )}
        </Formik>

        {isFormSubmitted ? (
          requestsLoading ? (
            <div className="mt-6 p-4 border rounded-lg text-center">
              <CircularProgress />
              <p>Generating report...</p>
            </div>
          ) : error ? (
            <div className="mt-6 p-4 border rounded-lg bg-red-50 text-red-600">
              Error loading loan requests: {error.message}
            </div>
          ) : pdfData.requests && pdfData.employee ? (
            <div className="mt-6 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Report Preview</h3>
                <DownloadPDFButton
                  data={pdfData.requests}
                  employee={pdfData.employee}
                  reportName={"Loan_Requests_Report"}
                />
              </div>
              <div
                className="border rounded-lg p-4 overflow-y-auto"
                style={{
                  maxHeight: "70vh",
                  boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
                }}
              >
                <div className="w-full" style={{ minWidth: "1000px" }}>
                  <LoanRequestsPDF
                    data={pdfData.requests}
                    employee={pdfData.employee}
                  />
                </div>
              </div>
            </div>
          ) : null
        ) : null}
      </div>
    </Box>
  );
};

export default LoanRequestsReport;
