import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { useUser } from "../../../context/UserContext";
import { ROLES } from "../../constants";

export const useOfferRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOfferRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("offer_requests")
      .select("*, candidates(*)")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      toast.error("Failed to load offer requests");
    } else {
      setData(data);
    }
    setLoading(false);
  }, []);

  const createOfferRequest = useCallback(async (payload) => {
    if (!payload?.candidate_id) {
      toast.error("Candidate is required");
      return null;
    }

    // Step 1: Check for existing active offer request
    const { data: existing, error: checkError } = await supabase
      .from("offer_requests")
      .select("id")
      .eq("candidate_id", payload.candidate_id)
      .eq("is_deleted", false)
      .maybeSingle();

    if (checkError) {
      toast.error("Failed to check existing offer");
      return null;
    }

    if (existing) {
      toast.error("An active offer request already exists for this candidate");
      return null;
    }

    // Step 2: Proceed to insert
    const { data, error } = await supabase
      .from("offer_requests")
      .insert(payload)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create offer request");
      return null;
    }

    toast.success("Offer request created");
    return data;
  }, []);

  const updateOfferRequest = useCallback(async (id, updates) => {
    const { error } = await supabase
      .from("offer_requests")
      .update(updates)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update offer request");
      return false;
    }
    toast.success("Offer request updated");
    return true;
  }, []);

  const softDeleteOfferRequest = useCallback(async (id) => {
    const { error } = await supabase
      .from("offer_requests")
      .update({ is_deleted: true })
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete offer request");
      return false;
    }
    toast.success("Offer request deleted");
    return true;
  }, []);

  return {
    data,
    loading,
    error,
    fetchOfferRequests,
    createOfferRequest,
    updateOfferRequest,
    softDeleteOfferRequest,
  };
};

export const useOfferRequestById = (id) => {
  const [offerRequest, setOfferRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOfferRequestById = useCallback(async () => {
    if (!id) {
      toast.error("Offer request ID is missing");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("offer_requests")
      .select("*, candidates(*)")
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (error) {
      setError(error.message);
      toast.error("Failed to load offer request");
    } else {
      setOfferRequest(data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchOfferRequestById();
  }, [fetchOfferRequestById]);

  return {
    offerRequest,
    loading,
    error,
  };
};

export function useOfferRequestsList({ page, perPage, status, searchQuery }) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("offer_requests")
        .select("*, candidate:candidates(*)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * perPage, (page + 1) * perPage - 1)
        .eq("is_deleted", false);

      if (user?.role === ROLES.MANAGER) {
        query = query.eq("assignee_id", user?.id);
      }

      if (status === "pending") {
        query = query.ilike("status", "%pending%");
      } else if (status === "rejected") {
        query = query.neq("rejection_reason", "");
      } else if (status) {
        query = query.eq("status", status);
      }

      if (searchQuery) {
        query = query
          .ilike("candidate.full_name", `%${searchQuery}%`)
          .not("candidate", "is", null)
          .neq("candidate.full_name", "");
      }

      const { data: rows, error, count } = await query;


      if (error) {
        toast.error("Failed to load approvals");
        console.error("Supabase fetch error:", error);
      } else {
        // Map status to 'pending' if it contains 'pending'
        // setData(rows || []);
        // const mappedRows = (rows || []).map((row) => {
        //   if (row.status && row.status.toLowerCase().includes("pending")) {
        //     return { ...row, task_status: "pending" };
        //   } else if (
        //     row.status &&
        //     row.status.toLowerCase().includes("rejected" || "reject")
        //   ) {
        //     return { ...row, task_status: "rejected" };
        //   }
        //   return row;
        // });
        // setData(mappedRows);

        const mappedRows = (rows ?? []).map(row => {
  const s = String(row?.status ?? '').toLowerCase();
  let task_status = row.task_status ?? null;

  if (s.includes('pending')) task_status = 'pending';
  else if (s.includes('reject')) task_status = 'rejected';   // matches reject, rejected, rejection
  else if (s.includes('complete')) task_status = 'completed';
  else if (s.includes('approve')) task_status = 'approved';
  else task_status = row.status

  return { ...row, task_status };
});

setData(mappedRows);

        setTotalPages(Math.ceil((count || 0) / perPage));
      }
    } catch (err) {
      toast.error("Unexpected error occurred");
      console.error("Unexpected fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, status, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    totalPages,
    loading,
    refetch: fetchData,
  };
}

export const useGetManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("employees")
      .select("*, candidates(*)") // or use alias like 'candidate:candidates(*)' if needed
      .eq("is_deleted", false)
      .or(
        'role_columns->roles.cs.["manager"],' +
          'role_columns->roles.cs.["hr_manager"]'
      );

    // console.log("managers", managers);

    if (error) {
      setError(error.message);
      toast.error("Failed to fetch managers");
      setManagers([]);
    } else {
      setManagers(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  return {
    managers,
    loading,
    error,
    refetch: fetchManagers,
  };
};
