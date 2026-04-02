import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";

export function useTrainingReport(year = null) {
  const [data, setData] = useState({
    totalTrainings: 0,
    completedTrainings: 0,
    scheduledTrainings: 0,
    employeesTrained: 0,
    byMonth: [],
    byCategory: [],
    topTrainers: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentYear = year || new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      const yearEnd = `${currentYear}-12-31`;

      // Total trainings
      const { count: totalTrainings } = await supabase
        .from("trainings")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false)
        .gte("start_date", yearStart)
        .lte("start_date", yearEnd);

      // Completed trainings
      const { count: completedTrainings } = await supabase
        .from("trainings")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false)
        .eq("status", "completed")
        .gte("start_date", yearStart)
        .lte("start_date", yearEnd);

      // Scheduled trainings
      const { count: scheduledTrainings } = await supabase
        .from("trainings")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false)
        .eq("status", "scheduled")
        .gte("start_date", yearStart)
        .lte("start_date", yearEnd);

      // Employees trained (unique)
      const { data: enrollmentData } = await supabase
        .from("course_applications")
        .select("employee_id")
        .eq("is_deleted", false)
        .eq("status", "completed");

      const uniqueEmployees = new Set((enrollmentData || []).map((e) => e.employee_id));

      // Trainings by month
      const { data: monthlyData } = await supabase
        .from("trainings")
        .select("start_date")
        .eq("is_deleted", false)
        .gte("start_date", yearStart)
        .lte("start_date", yearEnd);

      const monthMap = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      (monthlyData || []).forEach((t) => {
        const month = new Date(t.start_date).getMonth();
        monthMap[month] = (monthMap[month] || 0) + 1;
      });
      const byMonth = monthNames.map((name, idx) => ({
        month: name,
        count: monthMap[idx] || 0,
      }));

      // By category
      const { data: categoryData } = await supabase
        .from("trainings")
        .select(`
          course:trainings_course_id_fkey(
            category:asset_categories!courses_category_id_fkey(name)
          )
        `)
        .eq("is_deleted", false)
        .gte("start_date", yearStart)
        .lte("start_date", yearEnd);

      const catMap = {};
      (categoryData || []).forEach((t) => {
        const catName = t.course?.category?.name || "Uncategorized";
        catMap[catName] = (catMap[catName] || 0) + 1;
      });
      const byCategory = Object.entries(catMap).map(([name, count]) => ({ name, count }));

      setData({
        totalTrainings: totalTrainings || 0,
        completedTrainings: completedTrainings || 0,
        scheduledTrainings: scheduledTrainings || 0,
        employeesTrained: uniqueEmployees.size,
        byMonth,
        byCategory,
        topTrainers: [],
      });
    } catch (err) {
      setError(err);
      toast.error("Failed to fetch training report");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
