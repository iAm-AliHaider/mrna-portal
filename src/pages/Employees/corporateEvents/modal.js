import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const CorporateEventModal = ({ open, onClose, event }) => {
  if (!event) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Event Details</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          <b>Name:</b> {event.name}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <b>Description:</b> {event.description}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <b>Location:</b> {event.location}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <b>Start Date:</b> {event.start_date}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <b>End Date:</b> {event.end_date}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <b>Date:</b> {event.date}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorporateEventModal;
