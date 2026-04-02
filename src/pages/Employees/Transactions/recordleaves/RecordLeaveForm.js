"use client";
import * as Yup from 'yup';
import { Formik, Form } from "formik";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import SubmitButton from "../../../../components/common/SubmitButton";
import FileUploadField from "../../../../components/common/FormikFileUpload";

const initialValues = {
  employeeNumber: "",
  leaveType: "",
  vacationBalance: "",
  leaveOwner: "",
  startTime: "",
  returnTime: "",
  actualEndTime: "",
  notes: "",
  vacationType: "",
  startDate: "",
  returnDate: "",
  eveningLastDay: "",
  morningLastDay: "",
  lastReceivedDate: "",
  refNumber: "",
  finalNotes: "",
};

const validationSchema = Yup.object().shape({
  notes: Yup.string().optional().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
  finalNotes: Yup.string().optional().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
});

const leaveTypeOptions = [
  { value: "", label: "Select Leave Type" },
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
];

const vacationTypeOptions = [
  { value: "", label: "Select Vacation Type" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
];

const RecordLeaveForm = () => {
  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Add Leave Record
        </Typography>
      </Box>

      <Box className="breadcrumb-container">
        <Breadcrumbs separator=">">
          <Link underline="hover" color="inherit" href="/home">
            <HomeIcon sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/transactions/leaves">
            Leave Records
          </Link>
          <Typography color="text.primary">Add Leave Record</Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white rounded-lg shadow-md">
        <Formik
          initialValues={initialValues}
          onSubmit={() => {}}
          validationSchema={validationSchema}
        >
          {() => (
            <Form className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Employee Number Section */}
           

              {/* Leave Request Fields Section */}
              <div className="bg-gray-100 space-y-5 p-5 rounded-lg">
                {/* First row */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikSelectField
                      name="leaveType"
                      label="Leave Type"
                      options={leaveTypeOptions}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="vacationBalance"
                      label="Vacation Balance"
                      type="number"
                      fullWidth
                    />
                  </Box>
                </Box>

                {/* Second row */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="leaveOwner"
                      label="Leave Owner"
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="startTime"
                      label="Start Time"
                      type="time"
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="returnTime"
                      label="Return Time"
                      type="time"
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="actualEndTime"
                      label="Actual End Time"
                      type="time"
                      fullWidth
                    />
                  </Box>
                </Box>

                {/* Third row */}
                <Box sx={{ mt: 2 }}>
                  <FormikInputField
                    name="notes"
                    label="Notes"
                    type="textarea"
                    fullWidth
                    multiline
                    minRows={3}
                  />
                </Box>

                <FileUploadField name="attachment" label="Attachment" />
              </div>

              {/* Vacation Details Section */}
              <div className="bg-gray-100 space-y-5 p-5 rounded-lg">
                {/* First row */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikSelectField
                      name="vacationType"
                      label="Vacation Type"
                      options={vacationTypeOptions}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="startDate"
                      label="Start Date"
                      type="date"
                      fullWidth
                      max="2100-12-31"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="returnDate"
                      label="Return Date"
                      type="date"
                      fullWidth
                      max="2100-12-31"
                    />
                  </Box>
                </Box>

                {/* Second row */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="eveningLastDay"
                      label="Evening Last Day"
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="morningLastDay"
                      label="Morning Last Day"
                      fullWidth
                    />
                  </Box>
                </Box>

                {/* Third row */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="lastReceivedDate"
                      label="Last Received Date"
                      type="date"
                      fullWidth
                      max="2100-12-31"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="refNumber"
                      label="Ref Number"
                      type="number"
                      fullWidth
                    />
                  </Box>
                </Box>
              </div>

              {/* Final Notes Section */}
              <div className="bg-gray-100 space-y-5 p-5 rounded-lg">
                <Box sx={{ mt: 2 }}>
                  <FormikInputField
                    name="finalNotes"
                    label="Notes"
                    type="textarea"
                    fullWidth
                    multiline
                    minRows={3}
                  />
                </Box>
              </div>

              {/* Employee Search Section */}
              <div className="bg-gray-100 space-y-5 p-5 rounded-lg flex flex-row gap-5">
                <h1 className="text-lg font-bol">
                  You can chose any employee by entering the employee code
                </h1>
                <div className="flex-1">
                  <FormikInputField
                    name="employeeCode"
                    label="Replacement employee code"
                    type="number"
                    fullWidth
                  />
                </div>
                <div className="flex-1">
                  <FileUploadField
                    name="attachment"
                    label="Vacation Attachment"
                  />
                </div>
              </div>

              {/* Submit button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <SubmitButton title="Submit" type="submit" />
              </Box>
            </Form>
          )}
        </Formik>
      </div>
    </Box>
  );
};

export default RecordLeaveForm;
