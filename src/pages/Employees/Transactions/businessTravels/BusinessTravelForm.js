"use client";
import { Formik, Form } from "formik";
import { Box, Typography, Breadcrumbs, Link, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikRadioGroup from "../../../../components/common/RadioGroup";
import FormikFileUpload from "../../../../components/common/FormikFileUpload";
import SubmitButton from "../../../../components/common/SubmitButton";
import { useUser } from "../../../../context/UserContext";
import { useCreateBusinessTravel } from "../../../../utils/hooks/api/businessTravels";
import toast from "react-hot-toast/headless";
import * as Yup from "yup";
import React, { useState, useEffect } from "react";
import { Country, City } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";



const validationSchema = Yup.object({
  reference: Yup.string().required("Reference is required"),
  business_travel_definition: Yup.string().required("Business travel definition is required"),
  from_date: Yup.date()
    .required("From date is required")
    .test("not-past-date", "From date cannot be in the past", function (value) {
      if (!value) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  to_date: Yup.date()
    .required("To date is required")
    .test("not-before-from-date", "To date cannot be before from date", function (value) {
      const { from_date } = this.parent;
      if (!from_date || !value) return true;
      const fromDate = new Date(from_date);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(value);
      toDate.setHours(0, 0, 0, 0);
      return toDate >= fromDate;
    }),
  country: Yup.string().required("Country is required"),
  city: Yup.string().required("City is required"),
  daily_per_diem_rate: Yup.number().positive("Must be positive").required("Daily per diem rate is required"),
  daily_accommodation_rate: Yup.number().positive("Must be positive").required("Daily accommodation rate is required"),
  daily_transportation_rate: Yup.number().positive("Must be positive").required("Daily transportation rate is required"),
  fixed_pay_per_trip: Yup.number().positive("Must be positive").required("Fixed pay per trip is required"),
  ticket_value: Yup.number().positive("Must be positive").required("Ticket value is required"),
  days_basis: Yup.string().required("Days basis is required"),
  travel_days: Yup.number().positive("Must be positive").required("Travel days is required"),
  per_diem_days: Yup.number().positive("Must be positive").required("Per diem days is required"),
  amount_due: Yup.number().positive("Must be positive").required("Amount due is required"),
  preferred_airline: Yup.string().required("Preferred airline is required"),
  notes: Yup.string(),
});

const initialValues = {
  reference: `REF${Math.floor(100000 + Math.random() * 900000)}`, // Auto-generated reference
  business_travel_definition: "",
  time_sheet_project: "1", // Static ID as requested
  from_date: "",
  to_date: "",
  country: "",
  city: "",
  daily_per_diem_rate: "",
  daily_accommodation_rate: "",
  daily_transportation_rate: "",
  fixed_pay_per_trip: "",
  ticket_value: "",
  days_basis: "numberOfDays",
  travel_days: "",
  per_diem_days: "",
  amount_due: "",
  preferred_airline: "",
  file_attachment: null,
  notes: "",
};

const daysBasisOptions = [
  { value: "numberOfDays", label: "Number of days" },
  { value: "numberOfNights", label: "Number of nights" },
];

const BusinessTravelForm = () => {
  const { user } = useUser();
  const { createBusinessTravel, loading } = useCreateBusinessTravel();
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { workflow_employees } = useGenericFlowEmployees();

  // ✅ Load all countries
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formatted = allCountries.map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
    setCountryOptions(formatted);
  }, []);

  // ✅ Load all cities for selected country
  useEffect(() => {
    if (selectedCountry) {
      const cities = City.getCitiesOfCountry(selectedCountry);
      const formatted = cities.map((c) => ({
        label: c.name,
        value: c.name,
      }));
      setCityOptions(formatted);
    } else {
      setCityOptions([]);
    }
  }, [selectedCountry]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    try {
      const countryObj = countryOptions.find((c) => c.value === values.country);

      const payload = {
        ...values,
        country: countryObj?.label || values.country,
        employee_id: user?.id,
        created_by: user?.id,
        updated_by: user?.id,
        is_deleted: false,
        status_workflow: workflow_employees,
      };


      await createBusinessTravel(payload);
      await transactionEmailSender(user, payload, "Business Travel Request", `Business Travel Request`);
      
      toast.success("Business travel created successfully");
      resetForm();
      navigate("/transactions/travels");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to create business travel");
      setIsSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <div className="flex justify-between items-center">
          <Typography variant="h5" fontWeight={600}>
            Add Business Travel
          </Typography>
        </div>
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
          <Link underline="hover" color="inherit" href="/transactions/travels">
            Business Travels
          </Link>
          <Typography color="text.primary">Add Business Travel</Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white rounded-lg shadow-md">
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ setFieldValue, values }) => (
            <Form className="flex-1 p-5 overflow-y-auto">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                {/* First row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                  <FormikInputField name="reference" label="Reference" disabled fullWidth />
                  <FormikInputField name="business_travel_definition" label="Business Travel Definition" fullWidth />
                  <FormikSelectField
                    name="country"
                    label="Country"
                    options={countryOptions}
                    value={values.country}
                    onChange={(value) => {
                      setFieldValue("country", value);
                      setSelectedCountry(value);
                      setFieldValue("city", "");
                    }}
                    fullWidth
                  />
                  <FormikSelectField
                    name="city"
                    label="City"
                    options={cityOptions}
                    value={values.city}
                    onChange={(value) => {
                      setFieldValue("city", value);
                    }}
                    fullWidth
                  />
                </div>

                {/* Second row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                  <FormikInputField name="from_date" label="From Date" type="date" fullWidth max="2100-12-31" />
                  <FormikInputField name="to_date" label="To Date" type="date" fullWidth max="2100-12-31" />
                  <FormikInputField name="daily_per_diem_rate" label="Daily Per Diem Rate" type="number" fullWidth />
                  <FormikInputField name="daily_accommodation_rate" label="Daily Accommodation Rate" type="number" fullWidth />
                </div>

                {/* Third row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                  <FormikInputField name="daily_transportation_rate" label="Daily Transportation Rate" type="number" fullWidth />
                  <FormikInputField name="fixed_pay_per_trip" label="Fixed Pay Per Trip" type="number" fullWidth />
                  <FormikInputField name="ticket_value" label="Ticket Value" type="number" fullWidth />
                  <FormikInputField name="travel_days" label="Travel Days" type="number" fullWidth />
                </div>

                {/* Fourth row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                  <FormikInputField name="per_diem_days" label="Per Diem Days" type="number" fullWidth />
                  <FormikInputField name="amount_due" label="Amount Due" type="number" fullWidth />
                  <FormikInputField name="preferred_airline" label="Preferred Airline" fullWidth />
                  <FormikFileUpload name="file_attachment" label="File Attachment" fullWidth />
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <FormikInputField name="notes" label="Justification" multiline rows={3} fullWidth />
                </div>

                {/* Days calculation section */}
                <div className="mt-6">
                  <Typography variant="subtitle2" className="mb-3">
                    Days calculated according to
                  </Typography>
                  <FormikRadioGroup name="days_basis" options={daysBasisOptions} row />
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

export default BusinessTravelForm;





// "use client";
// import { Formik, Form } from "formik";
// import { Box, Typography, Breadcrumbs, Link, Button } from "@mui/material";
// import HomeIcon from "@mui/icons-material/Home";
// import UploadIcon from "@mui/icons-material/Upload";
// import DownloadIcon from "@mui/icons-material/Download";
// import FormikSelectField from "../../../../components/common/FormikSelectField";
// import FormikInputField from "../../../../components/common/FormikInputField";
// import FormikRadioGroup from "../../../../components/common/RadioGroup";
// import FormikFileUpload from "../../../../components/common/FormikFileUpload";
// import SubmitButton from "../../../../components/common/SubmitButton";
// import { useUser } from '../../../../context/UserContext';
// import { useCreateBusinessTravel } from "../../../../utils/hooks/api/businessTravels";
// import toast from "react-hot-toast/headless";
// import * as Yup from "yup";
// import React, { useState, useEffect } from "react";
// import { Country, State, City } from "country-state-city";
// import { useNavigate } from "react-router-dom";
// import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";

// const validationSchema = Yup.object({
//   reference: Yup.string().required("Reference is required"),
//   business_travel_definition: Yup.string().required("Business travel definition is required"),
//   from_date: Yup.date()
//     .required("From date is required")
//     .test('not-past-date', 'From date cannot be in the past', function(value) {
//       if (!value) return true;
      
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const selectedDate = new Date(value);
//       selectedDate.setHours(0, 0, 0, 0);
      
//       return selectedDate >= today;
//     }),
//   to_date: Yup.date()
//     .required("To date is required")
//     .test('not-before-from-date', 'To date cannot be before from date', function(value) {
//       const { from_date } = this.parent;
//       if (!from_date || !value) return true;
      
//       const fromDate = new Date(from_date);
//       fromDate.setHours(0, 0, 0, 0);
//       const toDate = new Date(value);
//       toDate.setHours(0, 0, 0, 0);
      
//       return toDate >= fromDate;
//     }),
//   country: Yup.string().required("Country is required"),
//   city: Yup.string().required("City is required"),
//   daily_per_diem_rate: Yup.number().positive("Must be positive").required("Daily per diem rate is required"),
//   daily_accommodation_rate: Yup.number().positive("Must be positive").required("Daily accommodation rate is required"),
//   daily_transportation_rate: Yup.number().positive("Must be positive").required("Daily transportation rate is required"),
//   fixed_pay_per_trip: Yup.number().positive("Must be positive").required("Fixed pay per trip is required"),
//   ticket_value: Yup.number().positive("Must be positive").required("Ticket value is required"),
//   days_basis: Yup.string().required("Days basis is required"),
//   travel_days: Yup.number().positive("Must be positive").required("Travel days is required"),
//   per_diem_days: Yup.number().positive("Must be positive").required("Per diem days is required"),
//   amount_due: Yup.number().positive("Must be positive").required("Amount due is required"),
//   preferred_airline: Yup.string().required("Preferred airline is required"),
//   notes: Yup.string(),
// });

// const initialValues = {
//   // reference: "",
//   reference: `REF${Math.floor(100000 + Math.random() * 900000)}`, // Auto-generated reference
//   business_travel_definition: "",
//   time_sheet_project: "1", // Static ID as requested
//   from_date: "",
//   to_date: "",
//   country: "",
//   city: "",
//   daily_per_diem_rate: "",
//   daily_accommodation_rate: "",
//   daily_transportation_rate: "",
//   fixed_pay_per_trip: "",
//   ticket_value: "",
//   days_basis: "numberOfDays",
//   travel_days: "",
//   per_diem_days: "",
//   amount_due: "",
//   preferred_airline: "",
//   file_attachment: null,
//   notes: "",
// };

// const daysBasisOptions = [
//   { value: "numberOfDays", label: "Number of days" },
//   { value: "numberOfNights", label: "Number of nights" },
// ];

// const BusinessTravelForm = () => {
//   const { user } = useUser();
//   const { createBusinessTravel, loading } = useCreateBusinessTravel();
//   const [countryOptions, setCountryOptions] = useState([]);
//   const [stateOptions, setStateOptions] = useState([]);
//   const [selectedCountry, setSelectedCountry] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const allCountries = Country.getAllCountries();
//     const formatted = allCountries?.map((c) => ({
//       label: c.name,
//       value: c.isoCode,
//     }));
//     setCountryOptions(formatted);
//   }, []);

//   useEffect(() => {
//     if (selectedCountry) {
//       const states = State.getStatesOfCountry(selectedCountry);
//       const formatted = states?.map((s) => ({
//         label: s.name,
//         value: s.isoCode,
//       }));
//       setStateOptions(formatted);
//     } else {
//       setStateOptions([]);
//     }
//   }, [selectedCountry]);

//   const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();


//   const handleSubmit = async (values, { setSubmitting, resetForm }) => {
//     setIsSubmitting(true);
//     try {
//       const payload = {
//         ...values,
//         employee_id: user?.id,
//         created_by: user?.id,
//         updated_by: user?.id,
//         is_deleted: false,
//         status_workflow: workflow_employees
//       };

//       await createBusinessTravel(payload);
//       toast.success("Business travel created successfully");
//       resetForm();
//       navigate("/transactions/travels");
//     } catch (err) {
//       console.error("Submission failed:", err);
//       toast.error("Failed to create business travel");
//       setIsSubmitting(false);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Box className="page-wrapper">
//       <Box className="page-header">
//         <div className="flex justify-between items-center">
//           <Typography variant="h5" fontWeight={600}>
//             Add Business Travel
//           </Typography>
//           {/* <div className="flex gap-2">
//             <Button
//               variant="outlined"
//               startIcon={<UploadIcon />}
//               size="small"
//               className="text-blue-600 border-blue-600"
//             >
//               Upload CSV
//             </Button>
//             <Button
//               variant="contained"
//               startIcon={<DownloadIcon />}
//               size="small"
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               Download Template
//             </Button>
//           </div> */}
//         </div>
//       </Box>

//       <Box className="breadcrumb-container">
//         <Breadcrumbs separator=">">
//           <Link underline="hover" color="inherit" href="/home">
//             <HomeIcon sx={{ mr: 0.5 }} />
//             Home
//           </Link>
//           <Link underline="hover" color="inherit" href="/transactions">
//             Transactions
//           </Link>
//           <Link
//             underline="hover"
//             color="inherit"
//             href="/transactions/travels"
//           >
//             Business Travels
//           </Link>
//           <Typography color="text.primary">Add Business Travel</Typography>
//         </Breadcrumbs>
//       </Box>

//       <div className="bg-white rounded-lg shadow-md">
//         <Formik
//           initialValues={initialValues}
//           validationSchema={validationSchema}
//           onSubmit={handleSubmit}
//         >
//           {({ setFieldValue }) => (
//             <Form className="flex-1 p-5 overflow-y-auto">
//               {/* Employee Selection Section */}
           

//               {/* Business Travel Details Section */}
//               <div className="bg-gray-100 p-4 rounded-lg mb-4">
//                 {/* First row */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
//                   <FormikInputField
//                     name="reference"
//                     label="Reference"
//                     disabled
//                     fullWidth
//                   />
//                   <FormikInputField
//                     name="business_travel_definition"
//                     label="Business Travel Definition"
//                     fullWidth
//                   />
//                   <FormikSelectField
//                     name="country"
//                     label="Country"
//                     options={countryOptions}
//                     onChange={(value) => {
//                       const countryObj = countryOptions.find(c => c.value === value);
//                       setFieldValue("country", countryObj?.label || value); // store full name
//                       setSelectedCountry(value); // still use code for state lookup
//                       setFieldValue("city", ""); // Reset city when country changes
//                     }}
//                     fullWidth
//                   />
//                   <FormikSelectField
//                     name="city"
//                     label="City"
//                     options={stateOptions}
//                     onChange={(value) => {
//                       const stateObj = stateOptions.find(s => s.value === value);
//                       setFieldValue("city", stateObj?.label || value); // store full name
//                     }}
//                     fullWidth
//                   />
//                 </div>

//                 {/* Second row */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
//                   <FormikInputField
//                     name="from_date"
//                     label="From Date"
//                     type="date"
//                     fullWidth
//                     InputLabelProps={{ shrink: true }}
//                     max="2100-12-31"
//                   />
//                   <FormikInputField
//                     name="to_date"
//                     label="To Date"
//                     type="date"
//                     fullWidth
//                     InputLabelProps={{ shrink: true }}
//                     max="2100-12-31"
//                   />
//                   <FormikInputField
//                     name="daily_per_diem_rate"
//                     label="Daily Per Diem Rate"
//                     type="number"
//                     fullWidth
//                   />
//                   <FormikInputField
//                     name="daily_accommodation_rate"
//                     label="Daily Accommodation Rate"
//                     type="number"
//                     fullWidth
//                   />
//                 </div>

//                 {/* Third row */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
//                   <FormikInputField
//                     name="daily_transportation_rate"
//                     label="Daily Transportation Rate"
//                     type="number"
//                     fullWidth
//                   />
//                   <FormikInputField
//                     name="fixed_pay_per_trip"
//                     label="Fixed Pay Per Trip"
//                     type="number"
//                     fullWidth
//                   />
//                   <FormikInputField
//                     name="ticket_value"
//                     label="Ticket Value"
//                     type="number"
//                     fullWidth
//                   />
//                   <FormikInputField
//                     name="travel_days"
//                     label="Travel Days"
//                     type="number"
//                     fullWidth
//                   />
//                 </div>

//                 {/* Fourth row */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
//                   <FormikInputField
//                     name="per_diem_days"
//                     label="Per Diem Days"
//                     type="number"
//                     fullWidth
//                   />
//                   <FormikInputField
//                     name="amount_due"
//                     label="Amount Due"
//                     type="number"
//                     fullWidth
//                   />
//                   <FormikInputField
//                     name="preferred_airline"
//                     label="Preferred Airline"
//                     fullWidth
//                   />
//                   <FormikFileUpload
//                     name="file_attachment"
//                     label="File Attachment"
//                     fullWidth
//                   />
//                 </div>

//                 {/* Notes */}
//                 <div className="mb-4">
//                   <FormikInputField
//                     name="notes"
//                     label="Justification"
//                     multiline
//                     rows={3}
//                     fullWidth
//                   />
//                 </div>

//                 {/* Days calculation section */}
//                 <div className="mt-6">
//                   <Typography variant="subtitle2" className="mb-3">
//                     Days calculated according to
//                   </Typography>
//                   <FormikRadioGroup
//                     name="days_basis"
//                     options={daysBasisOptions}
//                     row
//                   />
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
//                 <SubmitButton title="Add" type="submit" isLoading={loading || isSubmitting} disabled={isSubmitting} />
//               </Box>
//             </Form>
//           )}
//         </Formik>
//       </div>
//     </Box>
//   );
// };

// export default BusinessTravelForm;
