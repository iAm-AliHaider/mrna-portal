import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SubmitButton from "../SubmitButton";

const FilterModal = ({
  open,
  onClose,
  children,
  title = "Designation Form",
  description,
  handleApply = () => {},
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="!pb-1">{title}</DialogTitle>
      <span className="pl-6">{description}</span>
      <DialogContent className="space-y-4">
        {children}
      </DialogContent>
      <DialogActions>
        <SubmitButton
          onClick={onClose}
          title="Clear Filters"
          variant="outlined"
          color="secondary"
        />
        <SubmitButton onClick={handleApply} title="Apply" />
      </DialogActions>
    </Dialog>
  );
};

export default FilterModal;
