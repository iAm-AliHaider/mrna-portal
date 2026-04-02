import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikDropZone from "../../../components/common/FormikDropZone";
import SubmitButton from "../../../components/common/SubmitButton";
import { useAcceptOffer } from "../../../utils/hooks/api/contract";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Alert } from "@mui/material";
import { useUpdateCandidate } from "../../../utils/hooks/api/candidates";
import { useUser } from "../../../context/UserContext";
import FormikInputField from "../../../components/common/FormikInputField";
import { format, addDays } from "date-fns";

const UploadOfferLetterDocuments = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const status = searchParams.get("status");
  const navigate = useNavigate();
  const today = format(new Date(), "yyyy-MM-dd");
  const maxJoiningDate = format(addDays(new Date(), 30), "yyyy-MM-dd");
  const initialValues = {
    joining_date: null,
    attachments: [],
  };

  const { acceptOffer, loading } = useAcceptOffer();
  const { updateCandidate, loading: updateLoading } = useUpdateCandidate();

  const validationSchema = Yup.object().shape({
    joining_date: Yup.string().required("Joining Date is required"),
    attachments: Yup.array()
      .min(1, "At least one document is required")
      .required("Document is required"),
  });

  const handleSubmit = async (values) => {
    await acceptOffer(id, values);
    await updateCandidate(user?.id, { offer_letter: "accepted" });
    navigate(-1);
  };

  return (
    <React.Fragment>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormikInputField
                name="joining_date"
                label="Joining Date"
                type="date"
                max={maxJoiningDate}
                min={today}
                required
              />
            </div>

            <FormikDropZone
              label="Upload Attachments"
              name="attachments"
              placeholder="Upload document"
              acceptedFormats={["JPG", "JPEG", "PNG", "PDF"]}
              required
            />

            {status === "accepted" ? (
              <Alert severity="warning" className="text-sm">
                You have already accepted the offer. Uploading and submitting
                new documents will{" "}
                <strong>replace the previously uploaded attachments</strong>.
                Please ensure all required files are included before proceeding.
              </Alert>
            ) : (
              <Alert severity="info" className="text-sm">
                Please make sure all documents are uploaded. By clicking submit,
                you confirm acceptance of the offer and submission of all
                attached documents.{" "}
                <strong>Only proceed if you are sure.</strong>
              </Alert>
            )}

            <div className="flex justify-end">
              <SubmitButton
                type="submit"
                title="Accept & Submit Documents"
                disabled={isSubmitting}
                isLoading={loading || updateLoading}
              />
            </div>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

export default UploadOfferLetterDocuments;
