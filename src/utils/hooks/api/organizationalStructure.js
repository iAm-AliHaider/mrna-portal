import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useOrganizationalUnitHierarchy() {
  const [structures, setStructures] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHierarchy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase
        .from("organizational_units")
        .select("*")
        .eq("status", "active")
        .is("parent_id", null)
        .eq("is_deleted", false);

      if (rpcError) {
        setError(rpcError);
        toast.error(`Error fetching hierarchy: ${rpcError.message}`);
      } else {
        setStructures(data ?? []);
      }
    } catch (err) {
      setError(err);
      toast.error(`Unexpected error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  return {
    structures,
    loading,
    error,
    refetch: fetchHierarchy,
  };
}

export function useGetUnitChildrens() {
  const [childrens, setChildrens] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchChildrens = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      if (!id) {
        setChildrens([]);
        setLoading(false);
        return;
      }
      const { data, error: rpcError } = await supabase
        // .from("organizational_units")
        .from("employees")
        .select("*")
        // .eq("status", "active")
        // .eq("parent_id", id)
        .eq("organizational_unit_id", id)
        .eq("is_deleted", false);

      if (rpcError) {
        setError(rpcError);
        toast.error(`Error fetching hierarchy: ${rpcError.message}`);
      } else {
        setChildrens(data ?? []);
      }
    } catch (err) {
      setError(err);
      toast.error(`Unexpected error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    childrens,
    loading,
    error,
    fetchChildrens,
  };
}

export function useGetAllBranches() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllBranches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("branches")
        .select("*")
        .eq("is_deleted", false);

      if (fetchError) {
        setError(fetchError);
        toast.error(`Error fetching branches: ${fetchError.message}`);
      } else {
        setAccounts(data ?? []);
      }
    } catch (err) {
      setError(err);
      toast.error(`Unexpected error fetching branches: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBranches();
  }, [fetchAllBranches]);

  return {
    accounts,
    loading,
    error,
    refetch: fetchAllBranches,
  };
}

export function useAddOrganizationalUnit() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addOrganizationalUnit = useCallback(async (unit) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...unit,
        updated_by: user?.id ?? null,
      };
      const { data: insertedUnits, error: insertError } = await supabase
        .from("organizational_units")
        .insert([payload])
        .select("*");

      if (insertError) {
        setError(insertError);
        toast.error(`Error adding unit: ${insertError.message}`);
      }
      toast.success("Unit created successfully");
      return insertedUnits;
    } catch (err) {
      setError(err);
      toast.error(`Unexpected error adding unit: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addOrganizationalUnit,
    loading,
    error,
  };
}

export function useUpdateOrganizationalUnit() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateOrganizationalUnit = useCallback(
    async (id, updates) => {
      setLoading(true);
      setError(null);

      try {
        // merge in updated_by = current user
        const payload = {
          ...updates,
          updated_by: user?.id ?? null,
        };

        const { data: updatedUnits, error: updateError } = await supabase
          .from("organizational_units")
          .update(payload)
          .eq("id", id)
          .select("*");

        if (updateError) {
          setError(updateError);
          toast.error(`Error updating unit: ${updateError.message}`);
        }
        toast.success("Unit updated successfully");
        return updatedUnits;
      } catch (err) {
        setError(err);
        toast.error(`Unexpected error updating unit: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  return {
    updateOrganizationalUnit,
    loading,
    error,
  };
}

export function useDeleteOrganizationalUnit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteOrganizationalUnit = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let { data: vacRef, error: vacError } = await supabase
        .from("vacancy")
        .select("id")
        .eq("organizational_unit_id", id);

      if (vacError) throw vacError;
      if (vacRef && vacRef.length > 0) {
        toast.error("Cannot delete: there are vacancies assigned to this unit");
        return;
      }

      let { data: empRef, error: empError } = await supabase
        .from("employees")
        .select("id")
        .eq("organizational_unit_id", id);

      if (empError) throw empError;

      if (empRef && empRef.length > 0) {
        toast.error("Cannot delete: there are employees assigned to this unit");
        return;
      }

      const { data: updatedUnits, error: updateError } = await supabase
        .from("organizational_units")
        .update({ is_deleted: true })
        .eq("id", id)
        .select("*");

      if (updateError) throw empError;

      toast.success("Unit deleted successfully");
      return updatedUnits;
    } catch (err) {
      setError(err);
      toast.error(`Unexpected error deleting unit: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteOrganizationalUnit,
    loading,
    error,
  };
}
