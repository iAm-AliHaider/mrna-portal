import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { supaBasegetAllCall } from '../../common';
import { toast } from 'react-hot-toast';

export function useOrganizationalUnits() {
  const [organizationalUnits, setOrganizationalUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrganizationalUnits = useCallback(async (isCancelled) => {
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }

      const data = await supaBasegetAllCall("organizational_units");
      
      if (isCancelled()) return;

      const sortedData = data?.map((item) => ({
        value: item.id?.toString(),
        label: item.name,
      })) || [];
      
      setOrganizationalUnits(sortedData);
    } catch (err) {
      if(!isCancelled()) {
        setError(err);
        toast.error(`Error fetching organizational units: ${err.message}`);
      }
    } finally {
      if(!isCancelled()) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchOrganizationalUnits(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchOrganizationalUnits]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchOrganizationalUnits(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchOrganizationalUnits]);

  return { organizationalUnits, loading, error, refetch };
} 