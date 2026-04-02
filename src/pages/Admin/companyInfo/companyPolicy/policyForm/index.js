// PolicyForm.jsx
import { Formik, Form } from "formik";
import * as Yup from "yup";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageWrapperWithHeading from "../../../../../components/common/PageHeadSection";
import FormikInputField from "../../../../../components/common/FormikInputField";
import { supabase } from "../../../../../supabaseClient";
import FormikSelectField from "../../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../../components/common/SubmitButton";
import FormikCheckbox from "../../../../../components/common/FormikCheckbox";
import { useUser } from "../../../../../context/UserContext";


// === Breadcrumbs ===

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Company Info" },
  {
    title: "Add Company Policy",
    href: "/admin/company-info/policy",
  },
];

// === Status Data ===

const statusData = [
  {
    id: 1,
    value: "active",
    label: "Active",
  },
  {
    id: 2,
    value: "in active",
    label: "In Active",
  },
];

// === Validation schema ===
const validationSchema = Yup.object({
  name: Yup.string().required("Policy name is required"),
  // description: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
  //   return !value || value.trim().length > 0;
  // }).required("Description is required"),
  status: Yup.string().required("Status is required"),
  effective_from: Yup.date().required("Date is required")
    .required("Date is required"),
  applicable_to: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }).required("Applicable is required"),
});

const PolicyForm = ({ data }) => {
    const { user } = useUser();

  const isEditMode = data && data.id;
  const navigate = useNavigate();

  const initialValues = {
    name: data?.name || "",
    effective_from: new Date().toISOString().split('T')[0] || "",
    status: data?.status || "",
    applicable_to: data?.applicable_to || "",
    description: data?.description || "",
    document_url: data?.document_url || "",
    created_by_id: data?.created_by_id || "",
    is_mandatory: data?.is_mandatory || false,
  };

  // --- On form submit: insert policy & refresh the table ---
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const newRow = {
        name: values.name,
        description: values.description,
        status: values.status,
        effective_from: values.effective_from,
        applicable_to: values.applicable_to || null,
        is_mandatory: values.is_mandatory || false,
        document_url: values.document_url || null,
        created_by_id: user?.id,
      };
      if (isEditMode) {
        const { error } = await supabase
          .from("policy")
          .update(newRow)
          .eq("id", data.id);

        if (error) {
          throw new Error("Error updating policy:", error.message);
        }
        toast.success("Policy updated successfully");
        navigate(-1);
        return;
      }

      const { error } = await supabase.from("policy").insert([newRow]);
      if (error) {
        throw new Error("Error creating policy:", error.message);
      }
      toast.success("Policy created successfully");
      navigate(-1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapperWithHeading title="Add Company Policy" items={breadcrumbItems}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="overflow-y-auto h-[calc(100vh-320px)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormikInputField
                  name="name"
                  label="Name"
                  placeholder="Enter name"
                  required
                />
                <FormikInputField
                  name="effective_from"
                  label="Date to Fill By"
                  type="date"
                  required
                  disabled
                  max="2100-12-31"
                />

                <FormikSelectField
                  name="status"
                  label="Status"
                  options={statusData.map((s) => ({
                    label: s.label,
                    value: s.value,
                  }))}
                  placeholder="Select Status"
                  required={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikInputField
                  name="applicable_to"
                  label="Applicable"
                  rows={4}
                  required={true}
                />
                <FormikInputField
                  name="description"
                  label="Description"
                  rows={4}
                  // required={true}
                />
              </div>
              <div>
                <FormikCheckbox
                  label="Mandatory"
                  name="is_mandatory"
                  rows={4}
                  required={false}
                />
              </div>

              <div className="mt-6 pt-6 border-t flex justify-end pr-4">
                <SubmitButton
                  type="submit"
                  isLoading={isSubmitting}
                  title={isEditMode ? "Update Policy" : "Create Policy"}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </PageWrapperWithHeading>
  );
};

export default PolicyForm;
