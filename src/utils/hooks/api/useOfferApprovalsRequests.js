import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../supabaseClient";

export const useOfferApprovalsRequests = ({
  page,
  rowsPerPage,
  searchQuery,
  status,
}) => {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("offer_requests")
      .select("*, candidates(*)", { count: "exact" })
      .eq("is_deleted", false)
      .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1)
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.ilike("candidates.first_name", `%${searchQuery}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, count, error } = await query;

    if (!error) {
      setData(data || []);
      setTotalPages(Math.ceil((count || 0) / rowsPerPage));
    }

    setLoading(false);
  }, [page, rowsPerPage, searchQuery, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, totalPages, loading, refetch: fetchData };
};
