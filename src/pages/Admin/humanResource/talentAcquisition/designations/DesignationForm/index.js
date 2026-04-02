import { useEffect, useState } from "react"
import { Form, Formik } from "formik"
import PageWrapperWithHeading from "../../../../../../components/common/PageHeadSection"
import HomeIcon from "@mui/icons-material/Home"
import FormikInputField from "../../../../../../components/common/FormikInputField"
import FormikSelectField from "../../../../../../components/common/FormikSelectField"
import SubmitButton from "../../../../../../components/common/SubmitButton"
import toast from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"
import { useUser } from '../../../../../../context/UserContext'
import { useDesignation, useCreateDesignation, useUpdateDesignation } from "../../../../../../utils/hooks/api/useDesignations"
import { useOrganizationalUnits } from "../../../../../../utils/hooks/api/useOrganizationalUnits"
import designationValidationSchema from "../../../../../../utils/validations/designationValidation"

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource" },
  {
    label: "Designations",
    link: "/admin/human-resource/talent-acquisition/designations",
  },
  { title: "Add Designation" },
]

const DesignationForm = () => {
  const { id } = useParams()
  const { user } = useUser();
  const employeeId = user?.id 
  const companyId = user?.company_id
  const navigate = useNavigate()
  
  const { organizationalUnits, loading: departmentsLoading } = useOrganizationalUnits()
  const { designation, loading: designationLoading, refetch: refetchDesignation } = useDesignation(id)
  const { createDesignation, loading: createLoading } = useCreateDesignation()
  const { updateDesignation, loading: updateLoading } = useUpdateDesignation()
  
  const [formInitialValues, setFormInitialValues] = useState({
    name: '',
    code: '',
    department_id: '',
    job_description: '',
    grade_id: '',
    start_step: '',
    end_step: '',
  })

  // Generate grade options (30-40)
  const gradeOptions = Array.from({ length: 11 }, (_, i) => ({
    label: (30 + i).toString(),
    value: (30 + i).toString(),
  }));

  // Generate step options (3-7)
  const stepOptions = Array.from({ length: 5 }, (_, i) => ({
    label: (3 + i).toString(),
    value: (3 + i).toString(),
  }));

  // Fetch designation data if editing
  useEffect(() => {
    if (id && designation) {
      // Update breadcrumb for edit mode
      breadcrumbItems[3].title = "Edit Designation"
  
      // Set initial values for editing
      setFormInitialValues({
        name: designation.name || '',
        code: designation.code || '',
        department_id: designation.department_id?.toString() || '',
        job_description: designation.job_description || '',
        grade_id: designation.grade_id?.toString() || '',
        start_step: designation.start_step?.toString() || '',
        end_step: designation.end_step?.toString() || '',
      })
    }
  }, [id, designation])

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true)
    
    try {
      const designationPayload = {
        name: values.name,
        code: values.code,
        department_id: values.department_id ? Number(values.department_id) : null,
        company_id: companyId || null,
        job_description: values.job_description,
        grade_id: values.grade_id ? Number(values.grade_id) : null,
        start_step: values.start_step ? Number(values.start_step) : null,
        end_step: values.end_step ? Number(values.end_step) : null,
        created_by: employeeId || null,
        updated_by: employeeId || null,
      }

      if (id) {
        // Update existing designation
        const result = await updateDesignation(id, designationPayload)
        if (result) {
          refetchDesignation()
          navigate("/admin/human-resource/talent-acquisition/designations")
        }
      } else {
        // Create new designation
        const result = await createDesignation(designationPayload)
        if (result) {
          refetchDesignation()
          navigate("/admin/human-resource/talent-acquisition/designations")
        }
      }
      
      resetForm()
    } catch (error) {
      console.error("Error submitting designation:", error)
      toast.error(error.message || "Failed to save designation")
    } finally {
      setSubmitting(false)
    }
  }

  const loading = designationLoading || departmentsLoading

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <PageWrapperWithHeading
      title={id ? "Edit Designation" : "Add Designation"}
      items={breadcrumbItems}
    >
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Formik
          initialValues={formInitialValues}
          validationSchema={designationValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-6">
              {/* Basic Information Section */}
              <div className="text-lg font-bold">Designation Information</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikInputField
                  name="name"
                  label="Designation Name"
                  placeholder="Enter designation name"
                  required
                  error={touched.name && errors.name}
                />
                
                <FormikInputField
                  name="code"
                  label="Designation Code"
                  placeholder="Enter designation code (e.g., DEV001)"
                  required
                  error={touched.code && errors.code}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikSelectField
                  name="department_id"
                  label="Department"
                  options={organizationalUnits}
                  placeholder="Select department"
                  required
                  error={touched.department_id && errors.department_id}
                />
                
                <FormikSelectField
                  name="grade_id"
                  label="Grade"
                  options={gradeOptions}
                  placeholder="Select grade"
                  required
                  error={touched.grade_id && errors.grade_id}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikSelectField
                  name="start_step"
                  label="Start Step"
                  options={stepOptions}
                  placeholder="Select start step"
                  required
                  error={touched.start_step && errors.start_step}
                />
                
                <FormikSelectField
                  name="end_step"
                  label="End Step"
                  options={stepOptions}
                  placeholder="Select end step"
                  required
                  error={touched.end_step && errors.end_step}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormikInputField
                  name="job_description"
                  label="Job Description"
                  placeholder="Enter detailed job description"
                  textarea
                  rows={4}
                  required
                  error={touched.job_description && errors.job_description}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <SubmitButton
                  type="submit"
                  disabled={isSubmitting || createLoading || updateLoading}
                  isloading={isSubmitting || createLoading || updateLoading}
                  text={id ? "Update Designation" : "Add Designation"}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </PageWrapperWithHeading>
  )
}

export default DesignationForm 