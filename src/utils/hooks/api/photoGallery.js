import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

// Fetch photos with pagination
export function usePhotos(page = 1, perPage = 12) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPhotos = useCallback(async (isCancelled) => {
    if (!isCancelled) {
      setLoading(true);
      setError(null);
    }
    try {
      // Calculate range for pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      // Get total count first
      const { count, error: countError } = await supabase
        .from("uploaded_photos")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false);
      
      if (countError) throw countError;

      // Get paginated data
      const { data: rows, error: fetchError } = await supabase
        .from("uploaded_photos")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;
      
      if (!isCancelled) {
        setData(rows || []);
        setTotalCount(count || 0);
        setLoading(false);
      }
    } catch (err) {
      if (!isCancelled) {
        setError(err.message || err);
        setLoading(false);
        toast.error(`Error loading photos: ${err.message || err}`);
      }
    }
  }, [page, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchPhotos(isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [fetchPhotos]);

  return {
    data,
    loading,
    error,
    totalCount,
    refetch: fetchPhotos,
  };
}

// Create new photo
export function useCreatePhoto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPhoto = useCallback(async (photoData) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("uploaded_photos")
        .insert([photoData])
        .select()
        .single();
      if (insertError) throw insertError;
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      setLoading(false);
      toast.error(`Error creating photo: ${err.message || err}`);
      throw err;
    }
  }, []);

  return { createPhoto, loading, error };
}

// Delete photo (soft delete)
export function useDeletePhoto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deletePhoto = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from("uploaded_photos")
        .update({ is_deleted: true })
        .eq("id", id);
      if (deleteError) throw deleteError;
      setLoading(false);
      return id;
    } catch (err) {
      setError(err.message || err);
      setLoading(false);
      toast.error(`Error deleting photo: ${err.message || err}`);
      throw err;
    }
  }, []);

  return { deletePhoto, loading, error };
}