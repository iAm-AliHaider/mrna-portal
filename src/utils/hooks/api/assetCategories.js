import { useState, useEffect, useCallback } from "react";
import { supabase } from '../../../supabaseClient';
import { supaBasegetAllCall } from '../../common';
import toast from "react-hot-toast";

// Fetch all asset categories with pagination
export function useAssetCategories(page = 0, searchQuery = '', perPage = 10) {
  const [categoriesData, setCategoriesData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async (isCancelled) => {
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('asset_categories')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setCategoriesData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setCategoriesData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
      setCategoryOptions(
        (data || []).map((r) => ({
          label: r.name || `Category #${r.id}`,
          value: r.id,
        }))
      );
    } catch (err) {
      if(!isCancelled()) {
        setError(err);
      }
    } finally {
      if(!isCancelled()) {
        setLoading(false);
      }
    }
  }, [page, searchQuery, perPage]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchCategories(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchCategories]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchCategories(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchCategories]);
  

  return { categoriesData, totalPages, categoryOptions, error, count, loading, refetch };
}

// Create sample data for testing
export async function createSampleAssetCategories() {
  try {
    const sampleData = [
      {
        name: "Electronics",
        description: "Electronic devices and equipment including computers, phones, and accessories",
        created_by: 1,
        updated_by: 1
      },
      {
        name: "Furniture",
        description: "Office furniture including desks, chairs, cabinets, and tables",
        created_by: 1,
        updated_by: 1
      },
      {
        name: "Vehicles",
        description: "Company vehicles including cars, trucks, and transportation equipment",
        created_by: 1,
        updated_by: 1
      },
      {
        name: "Machinery",
        description: "Industrial machinery and equipment for production and manufacturing",
        created_by: 1,
        updated_by: 1
      }
    ];

    const { data, error } = await supabase
      .from("asset_categories")
      .insert(sampleData)
      .select();

    if (error) {
      console.error("Error creating sample data:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error in createSampleAssetCategories:", err);
    throw err;
  }
}

// Create new asset category
export function useCreateAssetCategory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAssetCategory = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('asset_categories')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Asset category created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createAssetCategory, loading, error };
}

// Update asset category
export function useUpdateAssetCategory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateAssetCategory = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('asset_categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Asset category updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateAssetCategory, loading, error };
}

// Delete asset category (soft delete)
export function useDeleteAssetCategory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteAssetCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('asset_categories');

      if (Array.isArray(id)) {
        query = query.update({ is_deleted: true }).in('id', id);
      } else {
        query = query.update({ is_deleted: true }).eq('id', id);
      }

      const { data, error } = await query.select();

      if (error) {
        setError(error);
        toast.error(`Deletion failed: ${error.message}`);
        return null;
      }

      toast.success('Asset category deleted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteAssetCategory, loading, error };
}

// Get single asset category by ID
export function useAssetCategory(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssetCategory = useCallback(async (isCancelled) => {
    if (!id) return;
    
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }

      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setData(null);
        return;
      }

      setData(data);
    } catch (err) {
      if(!isCancelled()) {
        setError(err);
      }
    } finally {
      if(!isCancelled()) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchAssetCategory(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchAssetCategory]);

  return { data, loading, error };
} 