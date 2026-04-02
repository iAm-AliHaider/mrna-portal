import { useState, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import Storage from "../../storage";
import { verifyPassword } from "../../helper";
import { sendWelcomeEmail } from "../../emailSenderHelper";

export function useLogin() {
  const [loading, setLoading] = useState(false);

  // 🔹 LOGIN FUNCTION
  const login = useCallback(
    async (values, { resetForm }) => {
      setLoading(true);
      const cleanUsername = values.username.trim();

      try {
        // STEP 1: Try work_email match
        const { data: workEmailUser, error: workEmailError } = await supabase
          .from("candidates")
          .select("*")
          .eq("work_email", cleanUsername)
          .eq("is_deleted", false)
          .single();

        if (workEmailUser && !workEmailError) {
          const isValid = verifyPassword(values.password, workEmailUser.password);
          if (!isValid) throw new Error("Invalid password");

          const { data: emp, error: empError } = await supabase
            .from("employees")
            .select("*")
            .eq("candidate_id", workEmailUser.id)
            .eq("company_employee_status", "active")
            .eq("is_deleted", false)
            .single();

          if (emp && !empError) {
            await sendEmailHelper(workEmailUser);
            toast.success("Login successful");
            resetForm();
            return { data: { ...workEmailUser, ...emp }, error: null };
          }
        }

        // STEP 2: Try email match for candidate portal
        const { data: emailUser, error: emailError } = await supabase
          .from("candidates")
          .select("*")
          .eq("email", cleanUsername)
          .eq("is_employee", false)
          .eq("is_deleted", false)
          .single();

        if (emailUser && !emailError) {
          if (emailUser.email_verification === false) {
            return { data: emailUser, error: new Error("Email not verified") };
          }

          // Check if offer is expired
          const isOfferExpired = await checkOfferExpired(emailUser.id);
          if (isOfferExpired) {
            toast.error("Offer expired, please contact HR");
            return { data: null, error: new Error("Offer expired") };
          }

          const isValid = verifyPassword(values.password, emailUser.password);
          if (!isValid) throw new Error("Invalid password");

          await sendEmailHelper(emailUser);
          toast.success("Login successful");
          resetForm();
          return { data: emailUser, error: null };
        }

        // STEP 3: Not found
        throw new Error("User not found or inactive");
      } catch (err) {
        if (err.message === "Invalid password") {
          toast.error(err.message);
        } else {
          toast.error(
            "Login Failed, User not found or inactive, If you are employee, try to login with your work email."
          );
        }
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 🔹 CHANGE PASSWORD FUNCTION
const handleChangePassword = useCallback(async (userId, newPassword) => {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .update({ password: newPassword, is_password_reset: true })
      .eq("id", userId)
      .select();   // 👈 ensures updated row is returned

    if (error) {
      toast.error("Failed to update password");
      return { error };
    }


    toast.success("Password updated successfully. Please login again.");
    return { success: true, data };
  } catch (err) {
    console.error("Change password error:", err);
    toast.error("Something went wrong");
    return { error: err };
  }
}, []);


  return { login, loading, handleChangePassword };
}

// --------- EMAIL + OFFER HELPERS -----------
export const sendEmailHelper = async (user, templateId = "template_tqwewj6") => {
  if (!user?.email) {
    console.warn("User email is missing, skipping email send.");
    return;
  }

  try {
    const name = `
      ${user?.first_name ?? ""}
      ${user?.second_name ?? ""}
      ${user?.third_name ?? ""}
      ${user?.forth_name ?? ""}
    `
      .replace(/\s+/g, " ")
      .trim();

    const payload = {
      name,
      email: user?.email,
      company_name: "MRNA",
      company_email: "support@mrna.com",
      company_website: "mrna.com",
    };

    await sendWelcomeEmail(templateId, payload);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    toast.error("Failed to send welcome email");
  }
};

export const checkOfferExpired = async (candidateId) => {
  if (!candidateId) return false;

  const { data, error } = await supabase
    .from("offer_requests")
    .select("created_at")
    .eq("candidate_id", Number(candidateId))
    .eq("status", "approved")
    .eq("is_hr_manager_approve", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching offer:", error);
    throw error;
  }

  if (!data) {
    return false;
  }

  const createdAt = new Date(data.created_at);
  const now = new Date();
  const msInDay = 1000 * 60 * 60 * 24;
  const ageDays = (now - createdAt) / msInDay;

  return ageDays >= 30;
};
