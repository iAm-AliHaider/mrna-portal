import React from 'react';
import Modal from '../../../components/common/Modal';
import InterviewEvaluationForm from './intervireEvaluationForm';

const ViewInterviewNoteModal = ({ open, onClose, noteData }) => {
  let parsedNote = null;

  try {
    parsedNote = JSON.parse(noteData); // safe parse
  } catch {
    parsedNote = null; // fallback to old string
  }

  return (
    <Modal open={open} onClose={onClose} title="Interview Evaluation Summary">
      <div className="p-4">
        {parsedNote ? (
          <InterviewEvaluationForm
            initialValues={parsedNote}
            interviewerName={parsedNote?.interviewer}
            readOnly={true}
          />
        ) : (
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-700 whitespace-pre-wrap">{noteData}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ViewInterviewNoteModal;
