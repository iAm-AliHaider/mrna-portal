import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import branchValidationSchema from '../../../../utils/validations/branchValidation';
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SubmitButton from "../../../../components/common/SubmitButton";
import InputField from "../../../../components/common/FormikInputField";
import HomeIcon from "@mui/icons-material/Home";
import { useUser } from '../../../../context/UserContext';
import { useCreateBranch, useUpdateBranch } from "../../../../utils/hooks/api/branches";
import { useBranch } from "../../../../utils/hooks/api/branches";
import toast from "react-hot-toast/headless";

const BranchForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const employeeId = user?.id;

  const initialValues = {
    name: '',
    short_code: '',
    lat: '',
    long: '',
  };

  const [initialValuesState, setInitialValues] = useState(initialValues);

  // API hooks
  const { createBranch, loading: createLoading } = useCreateBranch();
  const { updateBranch, loading: updateLoading } = useUpdateBranch();
  const { data: branch, loading: branchLoading } = useBranch(id);

  // Set initial values when editing
  useEffect(() => {
    if (id && branch) {
      setInitialValues({
        name: branch.name || '',
        short_code: branch.short_code || '',
        lat: branch.lat || '',
        long: branch.long || '',
      });
    } else {
      setInitialValues(initialValues);
    }
  }, [id, branch]);

  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Company Info", href: "/admin/company-info/branches" },
    { title: id ? "Edit Branch" : "New Branch" },
  ];

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        name: values.name.trim(),
        short_code: values.short_code.trim(),
        lat: values.lat ? parseFloat(values.lat) : null,
        long: values.long ? parseFloat(values.long) : null,
        company_id: user?.company_id,
        updated_by: employeeId,
        is_deleted: false,
      };

      if (id) {
        // Update existing branch
        await updateBranch(id, payload);
        toast.success("Branch updated successfully");
      } else {
        // Create new branch
        payload.created_by = employeeId;
        await createBranch(payload);
        toast.success("Branch created successfully");
      }

      // Navigate back to list
      navigate("/admin/company-info/branches");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to save branch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/company-info/branches");
  };

  if (id && branchLoading) {
    return (
      <PageWrapperWithHeading
        title={id ? "Edit Branch" : "New Branch"}
        items={breadcrumbItems}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </PageWrapperWithHeading>
    );
  }

  return (
    <PageWrapperWithHeading
      title={id ? "Edit Branch" : "New Branch"}
      items={breadcrumbItems}
    >
      <Formik
        enableReinitialize
        initialValues={initialValuesState}
        validationSchema={branchValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, isSubmitting }) => (
          <Form className="flex flex-col gap-4 mt-4">
            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  name="name" 
                  label="Branch Name" 
                  placeholder="Enter branch name"
                  required
                />

                <InputField 
                  name="short_code" 
                  label="Short Code" 
                  placeholder="Enter short code"
                 
                />

                <InputField 
                  name="lat" 
                  label="Latitude" 
                  placeholder="Enter latitude (optional)"
                  type="number"
                  step="any"
                />

                <InputField 
                  name="long" 
                  label="Longitude" 
                  placeholder="Enter longitude (optional)"
                  type="number"
                  step="any"
                />
              </div>
              <hr className="my-4" />
            </div>
            
            <div className="mt-4 sticky bottom-0 flex justify-end space-x-2">
              <SubmitButton 
                variant="outlined" 
                title="Cancel" 
                type="button"
                onClick={handleCancel}
              />
              <SubmitButton 
                title={id ? "Update" : "Submit"} 
                type="submit" 
                isLoading={isSubmitting || createLoading || updateLoading}
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </PageWrapperWithHeading>
  );
};

export default BranchForm; 