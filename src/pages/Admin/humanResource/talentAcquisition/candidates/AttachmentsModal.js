import React from 'react';
import Modal from '../../../../../components/common/Modal';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const AttachmentsModal = ({ open, onClose, candidate }) => {
  if (!candidate) return null;


  return (
    <Modal open={open} onClose={onClose} title="Attachments">
      <div className="space-y-4">
        {candidate.cv && (
          <div className="flex items-center justify-between">
            <span>CV</span>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => window.open(candidate.cv, '_blank')}
            >
              Download
            </Button>
          </div>
        )}
        {candidate.national_image && (
          <div className="flex items-center justify-between">
            <span>National ID Card</span>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => window.open(candidate.national_image, '_blank')}
            >
              Download
            </Button>
          </div>
        )}

        {candidate.passport_image && (
          <div className="flex items-center justify-between">
            <span>Passport</span>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => window.open(candidate.passport_image, '_blank')}
            >
              Download
            </Button>
          </div>
        )}

         {candidate.education?.[0] && (
          <div className="flex items-center justify-between">
            <span>Education</span>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => window.open(candidate.education?.[0]?.attachment, '_blank')}
            >
              Download
            </Button>
          </div>
        )}

        {candidate.certificates?.[0] && (
          <div className="flex items-center justify-between">
            <span>Certificate</span>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => window.open(candidate.certificates?.[0]?.attachment, '_blank')}
            >
              Download
            </Button>
          </div>
        )}

        
        {candidate.licence_attachment && (
          <div className="flex items-center justify-between">
            <span>Licence Attachment</span>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => window.open(candidate.licence_attachment, '_blank')}
            >
              Download
            </Button>
          </div>
        )}
        {/* Add more attachments here if needed */}
        {!candidate.cv && !candidate.licence_attachment && (
          <div>No attachments available.</div>
        )}
      </div>
    </Modal>
  );
};

export default AttachmentsModal; 