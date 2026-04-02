// src/hooks/useSignUp.js
import { useState } from "react";
import CryptoJS from "crypto-js";
// import {sendCandidateVerificationEmail} from '../emailSender'
import {sendCandidateVerificationEmail} from '../emailSenderHelper'

export function useCandidateVerificationEmail() {
  const [message, setMessage] = useState(null);

  const signUp = async (email,candidateName,candidate_id) => {
    setMessage(null);

    try {
      const tokenPayload = JSON.stringify({ candidate_id: candidate_id });
      const encrypted = CryptoJS.AES.encrypt(
        tokenPayload,
        process.env.REACT_APP_ENCRYPTION_KEY
      ).toString();

      // 3) Build your verification link
      const link = `${process.env.REACT_APP_SYSTEM_URL}?token=${encodeURIComponent(encrypted)}`;

      // 4) Send the email via EmailJS
      
      await sendCandidateVerificationEmail("template_titg22u", {
                name: `
        ${candidateName?.first_name ?? ""}
        ${candidateName?.second_name ?? ""}
        ${candidateName?.third_name ?? ""}
        ${candidateName?.forth_name ?? ""}
      `
                  .replace(/\s+/g, " ") // collapse multiple spaces into one
                  .trim(),
                company_name: "MRNA", // get them from company table
                support_email: "support@mrna.com", // get them from company table
                email:email,
                canidate_sigup: link,
                company_website: "mrna.com",// get them from company table
                company_icon:'www.mrna.com' // get them from company table
              });

      setMessage("✅ Verification email sent! Check your inbox.");
      return true;
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to send verification email.");
      return false;
    }
  };

  return {  message, signUp };
}
