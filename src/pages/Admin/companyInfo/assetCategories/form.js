import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import assetCategoryValidationSchema from '../../../../utils/validations/assetCategoryValidation';
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SubmitButton from "../../../../components/common/SubmitButton";
import InputField from "../../../../components/common/FormikInputField";
import HomeIcon from "@mui/icons-material/Home";
import { useUser } from '../../../../context/UserContext';
import { useCreateAssetCategory, useUpdateAssetCategory } from "../../../../utils/hooks/api/assetCategories";
import { useAssetCategory } from "../../../../utils/hooks/api/assetCategories";
import toast from "react-hot-toast/headless";

const AssetCategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const employeeId = user?.id;

  const initialValues = {
    name: '',
    description: '',
  };

  const [initialValuesState, setInitialValues] = useState(initialValues);

  // API hooks
  const { createAssetCategory, loading: createLoading } = useCreateAssetCategory();
  const { updateAssetCategory, loading: updateLoading } = useUpdateAssetCategory();
  const { data: category, loading: categoryLoading } = useAssetCategory(id);

  // Set initial values when editing
  useEffect(() => {
    if (id && category) {
      setInitialValues({
        name: category.name || '',
        description: category.description || '',
      });
    } else {
      setInitialValues(initialValues);
    }
  }, [id, category]);

  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Company Info", href: "/admin/company-info/asset-categories" },
    { title: id ? "Edit Asset Category" : "New Asset Category" },
  ];

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        updated_by: employeeId,
        is_deleted: false,
      };

      if (id) {
        // Update existing category
        await updateAssetCategory(id, payload);
        toast.success("Asset category updated successfully");
      } else {
        // Create new category
        payload.created_by = employeeId;
        await createAssetCategory(payload);
        toast.success("Asset category created successfully");
      }

      // Navigate back to list
      navigate("/admin/company-info/asset-categories");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to save asset category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/company-info/asset-categories");
  };

  if (id && categoryLoading) {
    return (
      <PageWrapperWithHeading
        title={id ? "Edit Asset Category" : "New Asset Category"}
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
      title={id ? "Edit Asset Category" : "New Asset Category"}
      items={breadcrumbItems}
    >
      <Formik
        enableReinitialize
        initialValues={initialValuesState}
        validationSchema={assetCategoryValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, isSubmitting }) => (
          <Form className="flex flex-col gap-4 mt-4">
            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 gap-4">
                <InputField 
                  name="name" 
                  label="Category Name" 
                  placeholder="Enter category name"
                  required
                />

                <InputField 
                  name="description" 
                  label="Description" 
                  placeholder="Enter category description"
                  multiline
                  rows={4}
                  required
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

export default AssetCategoryForm; 