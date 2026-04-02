import React, { useState } from "react";
import Modal from "../Modal";
import InputField from "../FormikInputField/Input";
import SubmitButton from "../SubmitButton";

const ActionModal = ({
  open,
  onClose,
  title = "Reject Request",
  description = "Please add reason for rejection.",
  onReject,
  loading = false,
  buttonTitle = "Reject",
}) => {
  const [rejectReason, setRejectReason] = useState("");

  const handleChange = (e) => {
    setRejectReason(e.target.value);
  };

  const handleReject = () => {
    onReject(rejectReason);
  };

  return (
    <div
      data-no-rowclick
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Modal open={open} onClose={onClose} title={title}>
        <p className="text-gray-700 text-lg">{description}</p>
        <InputField
          label="Reason"
          value={rejectReason}
          onChange={handleChange}
          required
          rows={4}
        />
        <div className="mt-4 flex justify-center items-center gap-12">
          <SubmitButton
            type="button"
            onClick={onClose}
            variant="secondary"
            title="Cancel"
          />
          <SubmitButton
            variant="danger"
            onClick={handleReject}
            isLoading={loading}
            title={buttonTitle}
            type="button"
            disabled={!rejectReason}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ActionModal;
