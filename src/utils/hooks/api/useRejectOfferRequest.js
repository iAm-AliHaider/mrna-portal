// useRejectOfferRequest.js

import { useState } from "react";
import { supabase } from "../../../../supabaseClient";
import toast from "react-hot-toast";

export const useRejectOfferRequest = () => {
  const [loading, setLoading] = useState(false);

  const rejectRequest = async (id, reason = "") => {
    setLoading(true);

    const { error } = await supabase
      .from("offer_requests")
      .update({
        status: "rejected",
        rejection_reason: reason, // ✅ Do NOT touch is_manager_approve or is_hr_manager_approve
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to reject offer");
    } else {
      toast.success("Offer rejected");
    }

    setLoading(false);
  };

  return { rejectRequest, loading };
};
