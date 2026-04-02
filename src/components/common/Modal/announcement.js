import React, { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  Stack,
  Box,
  Typography,
  Link,
  Tooltip,
  IconButton,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import InfoIcon from "@mui/icons-material/Info";
import DownloadIcon from "@mui/icons-material/Download";
const AnnouncementModal = ({
  currentData,
  setCurrentData,
  announcmentLikeAction,
  handleAnnouncementLike,
  isAdmin = false,
}) => {
  const [openModal, setOpenModal] = useState(true);
  const [read, setRead] = useState(false);
  const [isDocument, setIsDocument] = useState(false);
  const handleClose = async (status) => {
    if (currentData) {
      handleAnnouncementLike(currentData?.id, status);
      setOpenModal(false);
      setCurrentData(null);
    }
  };
  useEffect(() => {
    if (currentData && currentData?.attachment_path) {
      setIsDocument(true);
    }
    // else if (enableClose) {
    //   setIsDocument(true);
    // }
  }, [currentData]);
  const handleModalClose = async () => {
    setOpenModal(false);
    setCurrentData(null);
  };

  return (
    <Dialog open={openModal} maxWidth="md" fullWidth>
      <Box sx={{ padding: 3, backgroundColor: "white", borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Title: {currentData?.title || "No title available"}
        </Typography>

        <Typography
          variant="body1"
          color="textSecondary"
          paragraph
          className="flex"
        >
          <strong>Description: </strong>

          {/* {currentData?.description || 'No description available'} */}
          <span
            className="ml-3"
            dangerouslySetInnerHTML={{
              __html: currentData?.description
                ? currentData?.description
                : "No description available",
            }}
          />
        </Typography>

        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>Attachment: </strong>
            {currentData?.attachment_path ? (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  window.open(currentData.attachment_path, "_blank");
                  setIsDocument(false);
                }}
              >
                Download Attachment
              </Button>
            ) : (
              "No attachment available"
            )}
          </Typography>
        </Box>

        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
          {isDocument && (
            <Tooltip title="Please download the attachment first">
              <IconButton color="primary">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          )}
          {announcmentLikeAction && (
            <Button
              variant={read ? "contained" : "outlined"}
              color="success"
              disabled={isDocument}
              size="large"
              startIcon={<ThumbUpIcon />}
              onClick={() => {handleClose("agree")}}
            >
              Agree
            </Button>
          )}

          {!isAdmin && (
            <Button
              variant={read ? "contained" : "outlined"}
              color="error"
              disabled={isDocument}
              size="large"
              startIcon={<ThumbDownIcon />}
              onClick={() => {handleClose("disagree")}}
            >
              Disagree
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={handleModalClose}
            >
              Close
            </Button>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
};

export default AnnouncementModal;
