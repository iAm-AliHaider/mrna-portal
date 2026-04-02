import React, { useState } from "react";
import { Formik, Form } from "formik";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import SubmitButton from "../../../../components/common/SubmitButton";
import { useCreateOvertimeRequest } from "../../../../utils/hooks/api/overtimeRequests";
import { useUser } from "../../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  overtimeRequestValidationSchema,
  validateOvertimeRequest,
} from "../../../../utils/validations/overtimeRequestValidation";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";



const initialValues = {
  date: "",
  hours: "",
  minutes: "",
  amount: "",
  task: "",
  status_workflow: [],
};

const OverTimeRequestForm = () => {
  const { createOvertimeRequest, loading } = useCreateOvertimeRequest();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hours, setHours] = useState(0);

  const { user } = useUser();

  const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();

  const handleSubmit = async (values) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }
    setIsSubmitting(true);
    // Parse the date to get day, month, year
    const date = new Date(values.date);
    const day = date.getDate();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();

    // ✅ Force all employee statuses to "pending" if they have a valid id
    const workflow = (workflow_employees || []).map((emp) => ({
      ...emp,
      status: emp.id ? "pending" : emp.status, // keep approved fallback if no id
    }));

    // Construct the payload with static employee_id
    const payload = {
      employee_id: user.id,
      day: day,
      month: month,
      year: year,
      hours: parseInt(values.hours),
      minutes: parseInt(values.minutes),
      amount: parseFloat(values.amount),
      task: values.task.toString(),
      status: "pending",
      created_by: user.id,
      updated_by: user.id,
      status_workflow: workflow,
    };

    const result = await createOvertimeRequest(payload);
    await transactionEmailSender(user, payload, "Overtime Request", `Overtime Request`);
    
    if (result.success) {
      toast.success("Overtime request created successfully");
      navigate("/transactions/overtime");
    } else {
      toast.error(result.error || "Failed to create overtime request");
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Add Overtime Request
        </Typography>
      </Box>

      <Box className="breadcrumb-container">
        <Breadcrumbs separator=">">
          <Link underline="hover" color="inherit" href="/home">
            <HomeIcon sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/transactions/overtime">
            Overtime Requests
          </Link>
          <Typography color="text.primary">Add Overtime Request</Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <Formik
          initialValues={initialValues}
          validationSchema={overtimeRequestValidationSchema}
          validate={validateOvertimeRequest}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, setFieldError, values }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              <div className="bg-gray-100 p-4 space-y-5 rounded-lg">
                {/* First row */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  {/* Date Field */}
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="date"
                      label="Date"
                      type="date"
                      fullWidth
                      error={touched.date && errors.date}
                      helperText={touched.date && errors.date}
                      min={new Date().toISOString().split("T")[0]}
                      max="2100-12-31"
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        const dateObj = new Date(selectedDate);
                        const dayName = dateObj.toLocaleDateString("en-US", {
                          weekday: "long",
                        });

                        const allowedHours =
                          dayName === "Thursday" || dayName === "Friday"
                            ? 8
                            : 2;
                        setHours(allowedHours);

                        // ✅ Reset hours field when date changes
                        setFieldValue("date", selectedDate);
                        setFieldValue("hours", ""); // clear existing hours
                        setFieldValue("minutes", ""); 
                        setFieldError("hours", undefined);
                      }}
                    />
                  </Box>

                  {/* Hours Field */}
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="hours"
                      label={`Hours (Max: ${hours})`}
                      type="number"
                      fullWidth
                      value={values.hours}
                      error={touched.hours && errors.hours}
                      helperText={
                        touched.hours && errors.hours
                          ? errors.hours
                          : `You can enter up to ${hours} hours`
                      }
                      onChange={(e) => {
                        const input = e.target.value.replace(/^0+(?=\d)/, ""); // remove leading 0s
                        const currentMinutes = parseInt(values.minutes || 0);
                        const inputHours = Number(input) || 0;

                        const totalMinutes = inputHours * 60 + currentMinutes;
                        const allowedMinutes = hours * 60;

                        if (totalMinutes > allowedMinutes) {
                          setFieldError(
                            "hours",
                            `Total time cannot exceed ${hours} hours`
                          );
                        } else {
                          setFieldError("hours", undefined);
                          setFieldValue("hours", input);
                        }
                      }}
                    />
                  </Box>

                  {/* Minutes Field */}
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="minutes"
                      label="Minutes"
                      type="number"
                      fullWidth
                      value={values.minutes}
                      error={touched.minutes && errors.minutes}
                      helperText={
                        touched.minutes && errors.minutes
                          ? errors.minutes
                          : `Minutes should not exceed ${hours * 60} total`
                      }
                      onChange={(e) => {
                        const input = e.target.value.replace(/^0+(?=\d)/, ""); // remove leading 0s
                        const currentHours = parseInt(values.hours || 0);
                        const inputMinutes = Number(input) || 0;

                        const totalMinutes = currentHours * 60 + inputMinutes;
                        const allowedMinutes = hours * 60;

                        if (totalMinutes > allowedMinutes) {
                          setFieldError(
                            "minutes",
                            `Total time cannot exceed ${hours} hours`
                          );
                        } else if (inputMinutes >= 60) {
                          setFieldError(
                            "minutes",
                            "Minutes cannot be 60 or more"
                          );
                        } else {
                          setFieldError("minutes", undefined);
                          setFieldValue("minutes", input);
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Tasks */}
                <Box sx={{ flex: 1 }}>
                  <FormikInputField
                    name="task"
                    label="Task"
                    type="text"
                    fullWidth
                    error={touched.task && errors.task}
                    helperText={touched.task && errors.task}
                  />
                </Box>

                {/* Amount */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="amount"
                      label="Amount"
                      type="number"
                      step="0.01"
                      fullWidth
                      error={touched.amount && errors.amount}
                      helperText={touched.amount && errors.amount}
                    />
                  </Box>
                </Box>
              </div>

              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <SubmitButton
                  title="Add"
                  type="submit"
                  isLoading={loading || isSubmitting}
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

export default OverTimeRequestForm;
