import React from "react";
import Modal from "./index";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SubmitButton from "../SubmitButton";

const AlertModal = ({
  open,
  onClose,
  title,
  description,
  type,
  onConfirm,
  loading,
  buttonTitle
}) => {
  const getModalStyles = (type) => {
    switch (type) {
      case "success":
        return {
          titleColor: "text-green-500",
          icon: <CheckCircleIcon className="text-green-500" sx={{ fontSize: 40 }} />,
          variant: "success",
          buttonTextColor: "text-white",
        };
      case "warning":
        return {
          titleColor: "text-orange-500",
          icon: <WarningAmberIcon className="text-orange-500" sx={{ fontSize: 80 }} />,
          variant: "warning",
          buttonTextColor: "text-white",
        };
      case "danger":
        return {
          titleColor: "text-red-500",
          icon: <ErrorOutlineIcon className="text-red-500" sx={{ fontSize: 80 }} />,
          variant: "danger",
          buttonTextColor: "text-white",
        };
      case "confirm":
        return {
          titleColor: "text-primary",
          icon: <CheckCircleIcon className="text-green-600" sx={{ fontSize: 80 }} />,
          variant: "primary",
          buttonTextColor: "text-white",
        };
      default:
        return {
          titleColor: "text-primary",
          icon: null,
          variant: "primary",
          buttonTextColor: "text-white",
        };
    }
  };

  const styles = getModalStyles(type);

  return (
    <Modal open={open} onClose={onClose} headless={true}>
      <div className="w-full text-center flex flex-col items-center justify-center gap-2">
        {styles.icon && <div className="mb-4">{styles.icon}</div>}
        <h1
          className={`text-xl font-semibold ${styles.titleColor}`}
          id="alert-modal-title"
        >
          {title}
        </h1>
        <p className="text-lg mt-2" id="alert-modal-description">
          {description}
        </p>
        <div className="mt-4 flex items-center gap-12">
          <SubmitButton type='button' onClick={onClose} variant="secondary" title="Cancel" />
          <SubmitButton
            type='button'
            onClick={onConfirm}
            title={buttonTitle}
            variant={styles.variant}
            isLoading={loading}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal;
