import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useCertifications(page = 0, searchQuery = "", filters = {}, perPage = 20) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isCancelled) => {
    try {
      setLoading(true);
      setError(null);
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("certifications")
        .select("*", { count: "exact" })
        .eq("is_deleted", false);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      if (filters.certificate_type) {
        query = query.eq("certificate_type", filters.certificate_type);
      }

      query = query.order("created_at", { ascending: false });
      const { data: result, error: queryError, count: totalCount } = await query.range(from, to);

      if (isCancelled()) return;

      if (queryError) {
        setError(queryError);
        setData([]);
        toast.error("Failed to fetch certifications");
        return;
      }

      setData(result || []);
      setTotalPages(Math.ceil((totalCount ?? 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchData]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
  }, [fetchData]);

  return { data, totalPages, loading, error, refetch };
}

export function useCreateCertification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("certifications")
        .insert([payload])
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Certification created!");
      return data;
    } catch (err) {
      const message = err.message || err;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

export function useEmployeeCertifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from("employee_certifications")
        .select(`
          *,
          certification:certifications!employee_certifications_certification_id_fkey(
            id,
            name,
            certificate_type
          )
        `)
        .eq("employee_id", employeeId)
        .eq("is_deleted", false)
        .order("issue_date", { ascending: false });
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export function useAllEmployeeCertifications(page = 0, searchQuery = "", perPage = 20) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (isCancelled) => {
    try {
      setLoading(true);
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("employee_certifications")
        .select(`
          *,
          certification:certifications!employee_certifications_certification_id_fkey(
            id,
            name,
            certificate_type
          ),
          employee:employees!employee_certifications_employee_id_fkey(
            id,
            employee_code,
            candidates:candidates!employees_candidate_id_fkey(
              first_name,
              second_name,
              third_name,
              forth_name,
              family_name
            )
          )
        `, { count: "exact" })
        .eq("is_deleted", false);

      if (searchQuery) {
        query = query.or(`certification.name.ilike.%${searchQuery}%`);
      }

      query = query.order("issue_date", { ascending: false });
      const { data: result, error, count: totalCount } = await query.range(from, to);

      if (isCancelled()) return;

      if (error) throw error;

      setData(result || []);
      setTotalPages(Math.ceil((totalCount ?? 0) / perPage));
    } catch (err) {
      console.error(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchData]);

  return { data, totalPages, loading, refetch: fetchData };
}
