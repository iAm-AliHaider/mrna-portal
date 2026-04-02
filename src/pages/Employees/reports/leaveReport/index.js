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
import LeavePDF from "../../../../components/pdfComponenets/LeavePDF";
import DownloadPDFButton from "../../../../components/pdfComponenets/DownloadPDFButton";
import { useEmployeeLeaveQuotaSummary } from "../../../../utils/hooks/api/useEmployeeLeaveQuotaSummary";
import toast from "react-hot-toast";
const initialValues = {
  employeeNumber: null,
  month: "",
  year: "",
  reportName: "Default Employee Salary Slip",
  workEmail: false,
  permanentEmail: false,
  permanentEmailAddress: "",
  showOvertimeDetails: false,
  showRangeOfMonth: false,
  groupBy: "none",
  orderBy: "employeeCode",
  notes: "",
};

const validationSchema = Yup.object({
  notes: Yup.string().optional().test('no-spaces', 'Empty spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
  permanentEmailAddress: Yup.string().when('permanentEmail', {
        is: true,
        then: (schema) => schema
          .email('Please enter a valid email address')
          .required('Email is required when Personal Email is checked'),
        otherwise: (schema) => schema
      })
});

// const employeeOptions = [{ value: "401", label: "401" }];
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
    value: "Default Leave Report",
    label: "Default Leave Report",
  },
];

const getFullName = (employee) => {
  if (!employee) return '';
  return [
    employee.first_name,
    employee.second_name,
    employee.third_name,
    employee.forth_name,
    employee.family_name
  ]
    .filter(Boolean) // Remove any null/undefined/empty strings
    .join(' ')        // Join with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();          // Trim any leading/trailing spaces
};

const LeaveReport = () => {
  const [employeeLeaveInfo, setEmployeeLeaveInfo] = useState({
    month: null,
    year: null,
    employee_id: null
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [employeId, setEmployeId] = useState(null);
  const { data: employeeDetails, loading } = useUserData(employeId);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const isEmployeeSelected = !!employeId; // Will be true when an employee is selected
  const [pdfData, setPdfData] = useState({
    attendance: null,
    employee: null
  });
  const { user } = useUser();
  const formatEmployeeData = (employeeDetails, formValues) => {
    if (!employeeDetails) return null;

    return {
      full_name: getFullName(employeeDetails.candidates),
      designation_name: employeeDetails.designation?.name || 'N/A',
      employee_code: employeeDetails.employee_code || 'N/A',
      employment_status: employeeDetails.employee_status || 'N/A',
      department: employeeDetails.organizational_units?.name || 'N/A',
      mobile: employeeDetails.candidates?.mobile || 'N/A',
      employment_type: employeeDetails.employement_type?.name || 'N/A',
      shift: `${employeeDetails.shift_start_time || '00:00:00'} - ${employeeDetails.shift_end_time || '00:00:00'}`,
      work_email: employeeDetails.work_email ? employeeDetails.work_email : 'N/A',
      permanent_email: formValues.permanentEmailAddress ? formValues.permanentEmailAddress : 'N/A',
      notes: formValues.notes ? formValues.notes : 'N/A',
      user_status: employeeDetails.user_status || 'N/A',
    };
  };

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
        // // Fetch & map to { value, label } shape
        // const employees = await supaBaseFilteredEqualCall(
        //   'employees',
        //   filterField,
        //   filterValue
        // );
        // const options = (employees || []).map(({ id, employee_code }) => ({
        //   value: id,
        //   label: employee_code,
        // }));
        // setEmployeeOptions(options);
        
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

    // Simulate fetching employee info
  }, [user?.id]);
  const { data, error, loading: refresh } = useEmployeeLeaveQuotaSummary(
    employeeLeaveInfo.employeeId,
    {
      month: employeeLeaveInfo.month,
      year: employeeLeaveInfo.year,
    }
  );

  useEffect(() => {
    if (data && !loading && employeeDetails) {
      const formattedEmployeeData = formatEmployeeData(employeeDetails, {
        month: employeeLeaveInfo.month,
        year: employeeLeaveInfo.year,
        employeeNumber: employeeLeaveInfo.employeeId,
        permanentEmailAddress: employeeLeaveInfo.permanentEmail,
        notes: employeeLeaveInfo.notes,
      });
      setPdfData({
        leaveData: data,
        employee: formattedEmployeeData
      });
    }
  }, [data, loading, employeeDetails, employeeLeaveInfo]);

  const handleSubmit = async (values) => {
    try {
      if (!values.employeeNumber) {
        console.error('No employee selected');
        return;
      }
      setIsFormSubmitted(true); // Add this line
      setEmployeeLeaveInfo({
        month: values.month,
        year: values.year,
        employeeId: values.employeeNumber,
        workEmail: employeeDetails.work_email,
        permanentEmail: values.permanentEmailAddress,
        notes: values.notes,
        user_status: employeeDetails.user_status || 'N/A',
      });
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Failed to generate report');
    }
  };
  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Employee Leave Reports
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
            Employee Leave Reports
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
                      const selectedValue = e && e.target ? e.target.value : e;
                      resetForm({
                        values: {
                          ...initialValues,
                          employeeNumber: selectedValue
                        }
                      });
                      setEmployeId(selectedValue);
                      setIsFormSubmitted(false);
                      setPdfData({ attendance: null, employee: null });
                    }}
                  />
                </Box>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* First Column */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Employee Name:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {getFullName(employeeDetails?.candidates)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Employee Code:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.employee_code}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Email:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.candidates?.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Mobile:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.candidates?.mobile}
                      </span>
                    </div>
                  </div>

                  {/* Second Column */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Designation:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.designation?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Employment Status:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.employee_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Employment Type:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.employement_type?.name}
                      </span>
                    </div>
                  </div>

                  {/* Third Column */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Account Status:{" "}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                        {employeeDetails?.user_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Department:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.organizational_units?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Shift:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.shift_start_time} - {employeeDetails?.shift_end_time}
                      </span>
                    </div>
                    {/* <div>
                      <span className="text-sm font-medium text-gray-700">
                        Sub-Section Level 1:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.subSectionLevel1}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Sub-Section Level 2:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {employeeDetails?.subSectionLevel2}
                      </span>
                    </div> */}
                  </div>
                </div>

              </div>

              {/* Report Configuration Section */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                {/* Month, Year, Report Name */}
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

                {/* Checkboxes */}
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
                          setFieldValue("permanentEmail", e.target.checked);
                          if (!e.target.checked) {
                            setFieldValue("permanentEmailAddress", "");
                          }
                        }}
                        disabled={!isEmployeeSelected}
                      />
                    }
                    label="Personal Email"
                  />
                  {values.permanentEmail && (
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                      <Box sx={{ mt: 1, width: '100%' }}>
                        <FormikInputField
                          name="permanentEmailAddress"
                          label="Personal Email Address"
                          placeholder="Enter Personal email address"
                          fullWidth
                          disabled={!isEmployeeSelected}
                        />
                      </Box>
                    </div>
                  )}
                  {/* <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.showOvertimeDetails}
                        onChange={(e) =>
                          setFieldValue("showOvertimeDetails", e.target.checked)
                        }
                        disabled={!isEmployeeSelected}
                      />
                    }
                    label="Show Overtime Details"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.showRangeOfMonth}
                        onChange={(e) =>
                          setFieldValue("showRangeOfMonth", e.target.checked)
                        }
                        disabled={!isEmployeeSelected}
                      />
                    }
                    label="Show Range of Month"
                  /> */}
                </div>
                {/* 
                <div className="mb-6">
                  <Typography variant="subtitle2" className="mb-3">
                    Group By
                  </Typography>
                  <FormikRadioGroup
                    name="groupBy"
                    label="Group By"
                    options={[
                      { value: "none", label: "None" },
                      { value: "department", label: "Department" },
                      { value: "designation", label: "Designation" },
                    ]}
                    row
                    disabled={!isEmployeeSelected}
                  />
                </div>

                <div className="mb-6">
                  <Typography variant="subtitle2" className="mb-3">
                    Order By
                  </Typography>
                  <FormikRadioGroup
                    name="orderBy"
                    label="Order By"
                    options={[
                      { value: "employeeCode", label: "Employee Code" },
                      { value: "name", label: "Name" },
                      { value: "department", label: "Department" },
                    ]}
                    row
                    disabled={!isEmployeeSelected}
                  />
                </div> */}


                {/* Notes */}
                <FormikInputField
                  name="notes"
                  label="Notes"
                  multiline
                  // minRows={4}
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
                {/* <Button
                  variant="outlined"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2"
                  onClick={() => {
                    resetForm();
                    setEmployeId(null);
                    setIsFormSubmitted(false);
                    setPdfData({ attendance: null, employee: null });
                  }}
                >
                  Reset
                </Button> */}
                <Button
                  variant="contained"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  type="submit"
                >
                  Show Report
                </Button>
                {/* <Button
                  variant="outlined"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2"
                >
                  Send Attendance Report to Email
                </Button> */}
              </Box>
            </Form>
          )}
        </Formik>
        {isFormSubmitted ? (
          loading ? (
            <div className="mt-6 p-4 border rounded-lg text-center">
              <CircularProgress />
              <p>Generating report...</p>
            </div>
          ) : error ? (
            <div className="mt-6 p-4 border rounded-lg bg-red-50 text-red-600">
              Error loading leave data: {error.message}
            </div>
          ) : pdfData?.leaveData && pdfData?.employee ? (
            <div className="mt-6 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Report Preview</h3>
                <div>
                  <DownloadPDFButton
                  data={pdfData.attendance}
                  employee={pdfData.employee}
                    reportName={'Leave_Report'}
                  />
                </div>
              </div>
              <div
                className="border rounded-lg p-4 overflow-y-auto"
                style={{
                  maxHeight: '70vh',
                  boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
                }}
              >
                <div className="w-full" style={{ minWidth: '800px' }}>
                  <LeavePDF
                    data={pdfData.leaveData}
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

export default LeaveReport;
