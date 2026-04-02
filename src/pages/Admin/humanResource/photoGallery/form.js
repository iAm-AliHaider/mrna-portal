import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import photoValidationSchema from '../../../../utils/validations/photoValidation';
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import toast from "react-hot-toast/headless";

const NewPhotoForm = ({ open, onClose, id, photos, handleSubmit, loading }) => {
  const initialValues = {
    photo_url: '',
  };

  const [initialValuesState, setInitialValues] = useState(initialValues);
  const [isFileUploading, setIsFileUploading] = useState(false);

  useEffect(() => {
    if (id && photos && photos.length > 0) {
      const row = photos.find(l => l.id === id);
      if(row){
        setInitialValues({
          photo_url: row.photo_url || '',
        });
      }
    } else {
      setInitialValues(initialValues);
    }
  }, [id, photos]);

  const handleFileUploadStart = () => {
    setIsFileUploading(true);
  };

  const handleFileUploadComplete = () => {
    setIsFileUploading(false);
  };

  return (
    <Modal onClose={onClose} title={id ? "Edit Photo" : "New Photo"} open={open}>
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={initialValuesState}
          validationSchema={photoValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, isSubmitting }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
             <FileUploadField 
               name='photo_url' 
               label='Upload File' 
               accept={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
               onUploadStart={handleFileUploadStart}
               onUploadComplete={handleFileUploadComplete}
             />

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton 
                  variant="outlined" 
                  title="Cancel" 
                  type="button"
                  onClick={onClose}
                />
                <SubmitButton 
                  title="Save" 
                  type="submit" 
                  isLoading={isSubmitting || loading}
                  disabled={!isValid || isFileUploading || isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewPhotoForm;