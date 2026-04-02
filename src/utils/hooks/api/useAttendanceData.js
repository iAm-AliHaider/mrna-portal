import { useEffect, useState } from "react";
import { supabase } from '../../../supabaseClient'

const useAttendanceData = (params) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!params) {
        setLoading(false);    
        return
    };
    const { employeeId, month, year } = params;
    const fetchAttendance = async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc("get_daily_attendance_report", {
        p_employee_id: employeeId,
        p_month: month,
        p_year: year,
        p_limit: 100,
        p_offset: 0,
      });

      if (error) setError(error);
      else setData(data);

      setLoading(false);
    };

    fetchAttendance();
  }, [params]);

  return { data, loading, error };
};

export default useAttendanceData;
