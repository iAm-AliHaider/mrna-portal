import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikFileUpload from "../../../../components/common/FormikFileUpload";
import SubmitButton from "../../../../components/common/SubmitButton";
import ticketRequestValidationSchema from "../../../../utils/validations/ticketRequestValidation";
import { useUser } from "../../../../context/UserContext";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useCreateTicketRequest } from "../../../../utils/hooks/api/ticketRequests";
import { format } from "date-fns";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";


const TicketRequestForm = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const code = user?.employee_code;
  const candidate_number = user?.candidate_no;
  const { createTicketRequest, loading, error } = useCreateTicketRequest();
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  const ticketClassOptions = [
    { label: "First Class", value: "First Class" },
    { label: "Business Class", value: "Business Class" },
    { label: "Premium Economy Class", value: "Premium Economy Class" },
    { label: "Economy Class", value: "Economy Class" },
  ];

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formatted = allCountries?.map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
    setCountryOptions(formatted);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const states = State.getStatesOfCountry(selectedCountry);
      const formatted = states?.map((s) => ({
        label: s.name,
        value: s.isoCode,
      }));
      setStateOptions(formatted);
    } else {
      setStateOptions([]);
    }
  }, [selectedCountry]);

  const generateReferenceNumber = () => {
    return `REF-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  // const generateReferenceNumber = () => {
  //   const padded = String(currentCounter).padStart(5, "0");
  //   const ref = `REF-${padded}`;
  //   // currentCounter += 1;
  //   return ref;
  // };

  const initialValues = {
    code: code,
    departure_date: "",
    return_date: "",
    country: "",
    city: "",
    preferred_departure_time: "",
    preferred_return_time: "",
    ref_number: String(generateReferenceNumber()),
    notes: "",
    adult_number_of_tickets: "",
    child_number_of_tickets: "",
    ticket_class: "",
    adult_ticket_cost: "",
    child_ticket_cost: "",
    total_cost: "",
    vacation_attachment: "",
  };

    const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
  

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    try {
      const employeeId = user?.id;

      const totalCost =
        (parseFloat(values.adult_ticket_cost) *
          parseFloat(values.adult_number_of_tickets) || 0) +
        (parseFloat(values.child_ticket_cost) *
          parseFloat(values.child_number_of_tickets) || 0);

      const payload = {
        ...values,
        code: code,
        ref_number: String(values.ref_number),
        country:
          countryOptions.find((c) => c.value === values.country)?.label ||
          values.country,
        city:
          stateOptions.find((s) => s.value === values.city)?.label ||
          values.city,
        total_cost: totalCost, // ✅ inject calculated total
        reminder_count: 0,
        escalated: false,
        employee_id: employeeId,
        created_by: employeeId,
        updated_by: employeeId,
        status_workflow: workflow_employees
      };

      
      
      const result = await createTicketRequest(payload);
      await transactionEmailSender(user, payload, "New Ticket Request", `New Ticket Request`);
      
      if (result) {
        navigate("/transactions/ticket");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Add Ticket Requests
        </Typography>
      </Box>

      <Box className="breadcrumb-container">
        <Breadcrumbs separator=">">
          <Link underline="hover" color="inherit" href="/home">
            <HomeIcon sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/transactions/ticket">
            Ticket Requests
          </Link>
          <Typography color="text.primary">Add Ticket Requests</Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <Formik
          initialValues={initialValues}
          validationSchema={ticketRequestValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={false}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {/* Employee Info Section */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-100 p-4 space-y-5 rounded-lg">
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

              {/* Ticket Request Fields Section */}
              <div className="bg-gray-100 p-4 space-y-5 rounded-lg">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="code"
                      label="Code"
                      type="text"
                      fullWidth
                      disabled
                      value={code}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="departure_date"
                      label="Departure Date"
                      type="date"
                      fullWidth
                      max="2100-12-31"
                      min={today}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="return_date"
                      label="Return Date"
                      type="date"
                      fullWidth
                      max="2100-12-31"
                      min={today}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FormikSelectField
                      name="country"
                      label="Country"
                      options={countryOptions}
                      fullWidth
                      onChange={(value) => {
                        setFieldValue("country", value);
                        setSelectedCountry(value);
                        setFieldValue("city", "");
                      }}
                      value={values.country}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikSelectField
                      name="city"
                      label="City/State"
                      options={stateOptions}
                      fullWidth
                      onChange={(value) => {
                        setFieldValue("city", value);
                      }}
                      value={values.city}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="preferred_departure_time"
                      label="Preferred Departure Time"
                      type="time"
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormikInputField
                      name="preferred_return_time"
                      label="Preferred Return Time"
                      type="time"
                      fullWidth
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    {/* <FormikInputField
                      name="ref_number"
                      label="Ref Number"
                      type="text"
                      fullWidth
                      disabled
                    /> */}
                  </Box>
                  <Box sx={{ flex: 2 }}>
                    <FormikInputField
                      name="notes"
                      label="Justification"
                      type="text"
                      fullWidth
                      multiline
                      minRows={3}
                    />
                  </Box>
                </Box>
              </div>

              {/* Ticket Section */}
              <div className="bg-gray-100 space-y-5 rounded-lg p-6 mb-6">
                <h1 className="text-lg font-bold mb-4">Tickets</h1>
                <div className="flex flex-col md:flex-row gap-6 mb-4">
                  <div className="flex-1">
                    <FormikInputField
                      name="annual_available_tickets"
                      label="Annual Available Tickets"
                      type="number"
                      fullWidth
                      disabled
                    />
                  </div>
                  <div className="flex-1">
                    <FormikInputField
                      name="adult_number_of_tickets"
                      label="Adult Number of Tickets"
                      type="number"
                      fullWidth
                    />
                  </div>
                  <div className="flex-1">
                    <FormikInputField
                      name="child_number_of_tickets"
                      label="Child Number of Tickets"
                      type="number"
                      fullWidth
                    />
                  </div>
                  <div className="flex-1">
                    <FormikSelectField
                      name="ticket_class"
                      label="Ticket Class"
                      options={ticketClassOptions}
                      fullWidth
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6 mb-4">
                  <div className="flex-1">
                    <FormikInputField
                      name="adult_ticket_cost"
                      label="Adult Ticket Cost"
                      type="number"
                      fullWidth
                    />
                  </div>
                  <div className="flex-1">
                    <FormikInputField
                      name="child_ticket_cost"
                      label="Child Ticket Cost"
                      type="number"
                      fullWidth
                    />
                  </div>
                  <div className="flex-1">
                    <FormikInputField
                      name="total_cost"
                      label="Total Cost"
                      value={
                        (parseFloat(values.adult_ticket_cost) *
                          parseFloat(values.adult_number_of_tickets) || 0) +
                        (parseFloat(values.child_ticket_cost) *
                          parseFloat(values.child_number_of_tickets) || 0)
                      }
                      type="number"
                      fullWidth
                      disable
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6 mb-4">
                  <div className="flex-1">
                    <FormikFileUpload
                      name="vacation_attachment"
                      label="Attachments"
                    />
                  </div>
                </div>
              </div>

              {/* Add button */}
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

export default TicketRequestForm;
