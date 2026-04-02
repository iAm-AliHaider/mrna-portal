import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-hot-toast';
import { useUser } from '../../../context/UserContext';

// Hook for fetching general documents with pagination and filters
export function useGeneralDocuments(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [documentsData, setDocumentsData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const companyId = user?.company_id;
  const employeeId = user?.id;

  const fetchDocuments = useCallback(async (isCancelled) => {
    if (!companyId || isCancelled()) return;
    
    try {
      setLoading(true);
      setError(null);

      const from = page * perPage;
      const to = from + perPage - 1;


      let query = supabase
        .from('general_documents')
        .select('*')
        .eq('is_deleted', false)
        .eq('company_id', companyId);

    

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setDocumentsData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setDocumentsData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) {
        setError(err);
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  }, [page, searchQuery, filters, perPage, companyId, user?.role, employeeId]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocuments(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchDocuments]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocuments(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchDocuments]);

  return { documentsData, totalPages, error, count, loading, refetch };
}

// Hook for fetching a single document by ID
export function useGeneralDocument(id) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocument = useCallback(async (isCancelled) => {
    if (!id) return;
    
    try {
      if (!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      
      const { data, error } = await supabase
        .from("general_documents")
        .select("*")
        .eq("id", Number(id))
        .eq('is_deleted', false)
        .single();

      if (isCancelled()) return;

      if (error) {
        setError(error);
        toast.error(`Error fetching document: ${error.message}`);
        return;
      }

      setDocument(data);
    } catch (err) {
      if (!isCancelled()) {
        setError(err);
        toast.error(`Error fetching document: ${err.message}`);
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocument(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchDocument]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDocument(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchDocument]);

  return { document, loading, error, refetch };
}

// Hook for creating a new document
export function useCreateGeneralDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const employeeId = user?.id;
  const companyId = user?.company_id;

  const createDocument = useCallback(async (payload) => {
    if (!employeeId || !companyId) {
      toast.error('User information not available');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const documentPayload = {
        ...payload,
        company_id: companyId,
        created_by: employeeId,
        updated_by: employeeId,
        reminder_count: 0,
        escalated: false,
        is_deleted: false,
      };

      const { data, error } = await supabase
        .from('general_documents')
        .insert([documentPayload])
        .select()
        .single();

      if (error) {
        setError(error);
        toast.error(`Creation failed: ${error.message}`);
        return null;
      }

      toast.success('Document created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, [employeeId, companyId]);

  return { createDocument, loading, error };
}

// Hook for updating an existing document
export function useUpdateGeneralDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const employeeId = user?.id;

  const updateDocument = useCallback(async (id, payload) => {
    if (!employeeId) {
      toast.error('User information not available');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const documentPayload = {
        ...payload,
        updated_by: employeeId,
      };

      const { data, error } = await supabase
        .from('general_documents')
        .update(documentPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        toast.error(`Update failed: ${error.message}`);
        return null;
      }

      toast.success('Document updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, [employeeId]);

  return { updateDocument, loading, error };
}

// Hook for soft deleting a document
export function useDeleteGeneralDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const employeeId = user?.id;

  const deleteDocument = useCallback(async (id) => {
    if (!employeeId) {
      toast.error('User information not available');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('general_documents');

      if (Array.isArray(id)) {
        query = query.update({ 
          is_deleted: true,
          updated_by: employeeId 
        }).in('id', id);
      } else {
        query = query.update({ 
          is_deleted: true,
          updated_by: employeeId 
        }).eq('id', id);
      }

      const { data, error } = await query.select();

      if (error) {
        setError(error);
        toast.error(`Deletion failed: ${error.message}`);
        return null;
      }

      toast.success('Document deleted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, [employeeId]);

  return { deleteDocument, loading, error };
} 