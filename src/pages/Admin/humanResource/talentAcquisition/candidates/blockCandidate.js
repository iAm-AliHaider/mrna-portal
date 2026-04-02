import React, { useState } from "react";
import { Dialog, Button, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from '../../../../../components/common/FormikInputField'


const BlockCandidate = ({ handleBlock, closeModal }) => {
  const [openModal, setOpenModal] = useState(true);

  const validationSchema = Yup.object().shape({
    block_reason: Yup.string().trim().required("Reason is required"),
  });

  const initialValues = {
    block_reason: "",
  };

  const handleClose = () => {
    setOpenModal(false);
    closeModal();
  };

  return (
    <Dialog open={openModal} maxWidth="md" fullWidth onClose={handleClose}>
      <div className="p-5">
        <Typography variant="h5" gutterBottom className="px-5">
          Block Candidate
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, helpers) => handleBlock(values, helpers)}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-4 mt-4 px-5">
              <div className="grid grid-cols-1 gap-4">

                <FormikInputField
  label="Reason"
  name="block_reason"
  placeholder="Write the reason for blocking…"
  rows={5}
  required
  inputStyle={{
    fontSize: '1.1em',
  }}
/>

              </div>

              <div className="mt-4 sticky bottom-0 flex justify-end gap-3">
                <Button
                  variant="outlined"
                  title="Cancel"
                  type="button"
                  size="large"
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Block
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Dialog>
  );
};

export default BlockCandidate;
