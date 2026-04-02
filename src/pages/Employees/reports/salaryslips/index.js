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
} from "@mui/material";
import * as Yup from "yup";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import { Formik, Form } from "formik";

const initialValues = {
  employeeNumber: "401",
  month: "",
  year: "",
  reportName: "Default Employee Salary Slip",
  workEmail: false,
  permanentEmail: false,
  showOvertimeDetails: false,
  showRangeOfMonth: false,
  notes: "",
};

const validationSchema = Yup.object({
  notes: Yup.string().optional().test('no-spaces', 'Spaces are not allowed', value => {
      return !value || value.trim().length > 0;
    }),
});

const employeeOptions = [{ value: "401", label: "401" }];
const monthOptions = [
  { value: "January", label: "January" },
  { value: "February", label: "February" },
  { value: "March", label: "March" },
  { value: "April", label: "April" },
  { value: "May", label: "May" },
  { value: "June", label: "June" },
  { value: "July", label: "July" },
  { value: "August", label: "August" },
  { value: "September", label: "September" },
  { value: "October", label: "October" },
  { value: "November", label: "November" },
  { value: "December", label: "December" },
];
const reportNameOptions = [
  {
    value: "Default Employee Salary Slip",
    label: "Default Employee Salary Slip",
  },
];

const EmployeeSalarySlipReportPage = () => {
  const [employeeInfo, setEmployeeInfo] = useState(null);

  useEffect(() => {
    // Simulate fetching employee info
    setEmployeeInfo({
      name: "Muhammad Ali",
      jobTitle: "Application Support Specialist",
      branch: "Main",
      employmentDate: "25/04/23",
      unit: "IT Department",
      department: "Application Support Specialist",
      employmentStatus: "Active",
      attendanceStatus: "Active",
      division: "-",
      section: "-",
      subSectionLevel1: "-",
      subSectionLevel2: "-",
    });
  }, []);

  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Employee (s) Salary Slip Reports
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
            Employee (s) Salary Slip Reports
          </Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white rounded-lg shadow-md">
        <Formik
          initialValues={initialValues}
          onSubmit={() => {}}
          validationSchema={validationSchema}
        >
          {({ values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Employee Selection Section */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <Box sx={{ width: "50%" }}>
                  <FormikSelectField
                    name="employeeNumber"
                    label="Employee Number"
                    options={employeeOptions}
                    fullWidth
                    required
                  />
                </Box>
                {employeeInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* First Column */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Employee Name:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Branch:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.branch}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Division:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.division}
                        </span>
                      </div>
                    </div>

                    {/* Second Column */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Job Title:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.jobTitle}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Employment Date:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.employmentDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Section:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.section}
                        </span>
                      </div>
                    </div>

                    {/* Third Column */}
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Employment Status:{" "}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          {employeeInfo.employmentStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Unit:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Department:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.department}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Sub-Section Level 1:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.subSectionLevel1}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Sub-Section Level 2:{" "}
                        </span>
                        <span className="text-sm text-gray-900">
                          {employeeInfo.subSectionLevel2}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
                  />
                  <FormikInputField
                    name="year"
                    label="Year"
                    fullWidth
                    required
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
                      />
                    }
                    label="Work Email"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.permanentEmail}
                        onChange={(e) =>
                          setFieldValue("permanentEmail", e.target.checked)
                        }
                      />
                    }
                    label="Permanent Email"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.showOvertimeDetails}
                        onChange={(e) =>
                          setFieldValue("showOvertimeDetails", e.target.checked)
                        }
                      />
                    }
                    label="Show overtime payment details"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.showRangeOfMonth}
                        onChange={(e) =>
                          setFieldValue("showRangeOfMonth", e.target.checked)
                        }
                      />
                    }
                    label="Show report for a range of month"
                  />
                </div>

                {/* Notes */}
                <FormikInputField
                  name="notes"
                  label="Notes"
                  multiline
                  minRows={4}
                  fullWidth
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
                <Button
                  variant="outlined"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2"
                >
                  Send Salary Slip to Email
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </div>
    </Box>
  );
};

export default EmployeeSalarySlipReportPage;
