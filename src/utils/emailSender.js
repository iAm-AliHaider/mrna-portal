// DEPRECATED: Use emailService.js directly
// This file re-exports for backward compatibility
export {
  sendWelcomeEmail,
  sendCandidateVerificationEmail,
  sendOfferEmail,
  sendContractEmail,
  sendOfferAcceptedEmail,
  sendContractAcceptedEmail,
  sendOfferRejectedEmail,
  sendContractRejectedEmail,
  sendFirstInterviewEmail,
  sendSecondInterviewEmail,
  sendThirdInterviewEmail,
  sendInterviewerEmail,
  sendContractRefusedEmail,
  sendNewTaskEmail,
  sendWorkEmailNotification,
} from "./emailService";
