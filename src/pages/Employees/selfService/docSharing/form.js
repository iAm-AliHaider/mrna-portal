"use client"
import { Formik, Form } from "formik"
import { Typography } from "@mui/material"
import * as Yup from "yup"
import FormikSelectField from "../../../../components/common/FormikSelectField"
import FormikInputField from "../../../../components/common/FormikInputField"
import FormikCheckbox from "../../../../components/common/FormikCheckbox"
import Modal from "../../../../components/common/Modal"
import SubmitButton from "../../../../components/common/SubmitButton"
import FileUploadField from "../../../../components/common/FormikFileUpload"
import { useCreateGeneralDocument, useUpdateGeneralDocument } from "../../../../utils/hooks/api/useGeneralDocuments"
import { useOrganizationalUnits } from "../../../../utils/hooks/api/useOrganizationalUnits"
import { useUser } from "../../../../context/UserContext"
import { useEffect, useState } from "react"

const initialValues = {
  title: "",
  description: "",
  attachment_url: null,
  department_id: "",
  organization: false,
}

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  attachment_url: Yup.mixed().nullable(),
  department_id: Yup.string(),
  organization: Yup.boolean(),
})

const DocumentForm = ({ onClose, open, editingDocument, handleSubmit }) => {
  const { user } = useUser();
  const [organization, setOrganization] = useState(false);
  const { createDocument, loading: createLoading } = useCreateGeneralDocument();
  const { updateDocument, loading: updateLoading } = useUpdateGeneralDocument();
  const { organizationalUnits, loading: departmentsLoading } = useOrganizationalUnits();
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Check if user has HR role
  const isHRUser = user?.role === 'hr' || user?.role === 'admin' || user?.role === 'hr_manager';

  // If not HR user, don't render the form
  if (!isHRUser) {
    return null;
  }

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let result;
      
      if (editingDocument) {
        // Update existing document
        result = await updateDocument(editingDocument.id, values);
      } else {
        // Create new document
        result = await createDocument(values);
      }

      if (result) {
        handleSubmit();
        resetForm();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const handleClose = () => {
    onClose();
  }

  return (
    <Modal onClose={handleClose} title={editingDocument ? "Edit General Document" : "Add General Document"} open={open}>
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={editingDocument ? {
            title: editingDocument.title || "",
            description: editingDocument.description || "",
            attachment_url: editingDocument.attachment_url || null,
            department_id: editingDocument.department_id?.toString() || "",
            organization: editingDocument.organization || false,
          } : initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ isValid, isSubmitting, values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              <FormikInputField 
                name="title" 
                label="Document Title" 
                required 
                placeholder="Enter document title"
              />

              <FormikInputField 
                name="description" 
                label="Description" 
                textarea 
                rows={4}
                required 
                placeholder="Enter document description"
              />

              {!values.organization && organizationalUnits.length > 0 && (
                <FormikSelectField 
                  name="department_id" 
                  label="Department" 
                  options={organizationalUnits} 
                  required 
                  placeholder={departmentsLoading ? "Loading departments..." : "Select department"}
                  disabled={departmentsLoading}
                />
              )}

              <FormikCheckbox
                name="organization"
                label="Departmental Document"
                description="Check this if this document should only be visible to employees in the selected department. Leave unchecked to make it visible to all employees."
              />

              <FileUploadField
                name="attachment_url"
                label="Document Attachment"
                accept={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png']}
                onUploadStart={() => setIsFileUploading(true)}
                onUploadComplete={() => setIsFileUploading(false)}
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <SubmitButton
                  title={editingDocument ? "Update" : "Create"}
                  type="submit"
                  disabled={!isValid || isSubmitting || createLoading || updateLoading || isFileUploading || departmentsLoading}
                  style={{
                    backgroundColor: "#3f51b5",
                    color: "white",
                    textTransform: "none",
                    padding: "8px 24px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}

export default DocumentForm
