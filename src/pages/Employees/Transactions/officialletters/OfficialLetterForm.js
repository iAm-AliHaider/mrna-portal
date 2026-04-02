import { useState } from "react";
import * as Yup from 'yup';
import { Formik, Form } from "formik";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import SubmitButton from "../../../../components/common/SubmitButton";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import { useUser } from '../../../../context/UserContext';
import { useCreateOfficialLetter } from "../../../../utils/hooks/api/officialLetters";
import toast from "react-hot-toast/headless";
import { useNavigate } from "react-router-dom";
import { useOfficialLetterCategories } from "../../../../utils/hooks/api/officialLetterCategories";

const initialValues = {
  category_id: "",
  letter_type: "",
  letter_date: new Date().toISOString().split('T')[0],
  // letter_destination: "",
  reason: "",
  reference_number: "",
  notes: "",
};

const validationSchema = Yup.object().shape({
  category_id: Yup.string().required('Category is required'),
  letter_type: Yup.string().required('Letter type is required'),
  letter_date: Yup.date().required('Letter date is required'),
  // letter_destination: Yup.string().required('Letter destination is required'),
  reason: Yup.string().required('Reason is required'),
  reference_number: Yup.string().required('Reference number is required'),
  notes: Yup.string().required('Letter Body is required').test('no-spaces', 'Empty spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
});

const categoryOptions = [
  { value: "general", label: "General" },
  { value: "vacation", label: "Vacation" },
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
];

const letterTypeOptions = [
  { value: "request", label: "Request" },
  { value: "notification", label: "Notification" },
  { value: "approval", label: "Approval" },
  { value: "rejection", label: "Rejection" },
];

const OfficialLetterForm = () => {
  const { user } = useUser();
  const { createOfficialLetter, loading } = useCreateOfficialLetter();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categoriesData, } = useOfficialLetterCategories(currentPage, searchQuery, filters, perPage);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        employee_id: user?.id,
        created_by: user?.id,
        updated_by: user?.id,
        status: 'pending'
      };

      const result = await createOfficialLetter(payload);
      
      if (result) {
        toast.success("Official letter created successfully");
        resetForm();
        navigate("/transactions/letters");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to create official letter");
      setIsSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Add Official Letter
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
            href="/transactions/letters"
          >
            Official Letters
          </Link>
          <Typography color="text.primary">Add Official Letter</Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white rounded-lg shadow-md">
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {({ isSubmitting }) => (
            <Form className="flex-1 overflow-y-auto p-5">
              {/* Section 1: Employee Information */}
             

              {/* Section 2: Letter Details */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  <FormikSelectField
                    name="category_id"
                    label="Category"
                    options={categoriesData?.map(category => ({
                      value: category.id.toString(),
                      label: category.category
                    })) || []}
                    fullWidth
                  />
                  <FormikSelectField
                    name="letter_type"
                    label="Letter Type"
                    options={letterTypeOptions}
                    fullWidth
                  />
                  <FormikInputField
                    name="letter_date"
                    label="Letter Date"
                    type="date"
                    fullWidth
                    disabled
                    max="2100-12-31"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {/* <FormikInputField
                    name="letter_destination"
                    label="Letter Destination"
                    fullWidth
                  /> */}
                  <FormikInputField
                    name="reason"
                    label="Reason for Requesting"
                    fullWidth
                  />
                  <FormikInputField
                    name="reference_number"
                    label="Reference Number"
                    fullWidth
                  />
                </div>

                <FormikInputField
                  name="notes"
                  label="Letter Body"
                  multiline
                  rows={3}
                  fullWidth
                  required
                />
              </div>

              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                <SubmitButton 
                  title="Add Official Letter" 
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

export default OfficialLetterForm;
