import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function useTrainingDashboard(year = null) {
  const [data, setData] = useState({
    totalTrainings: 0,
    enrolledEmployees: 0,
    completed: 0,
    inProgress: 0,
    upcoming: 0,
    certificationsIssued: 0,
    trainersCount: 0,
    completionRate: 0,
    byMonth: [],
    topCourses: [],
    upcomingSessions: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const currentYear = year || new Date().getFullYear();
        const yearStart = `${currentYear}-01-01`;
        const yearEnd = `${currentYear}-12-31`;
        const now = new Date().toISOString().split("T")[0];

        const [
          totalRes, enrolledRes, completedRes, upcomingRes,
          trainersRes, courseAppRes, trainingsRes
        ] = await Promise.all([
          supabase.from("trainings").select("id", { count: "exact", head: true }).eq("is_deleted", false).gte("start_date", yearStart).lte("start_date", yearEnd),
          supabase.from("course_applications").select("employee_id", { count: "exact" }).eq("is_deleted", false),
          supabase.from("course_applications").select("id", { count: "exact", head: true }).eq("is_deleted", false).eq("status", "completed"),
          supabase.from("trainings").select("*, course:courses(course_name, status)", { count: "exact", head: true }).eq("is_deleted", false).gte("start_date", now).eq("status", "scheduled"),
          supabase.from("courses").select("id", { count: "exact", head: true }).eq("is_training", true),
          supabase.from("course_applications").select("employee_id, course_id").eq("is_deleted", false),
          supabase.from("trainings").select("*, course:courses(course_name)").eq("is_deleted", false).gte("start_date", now).order("start_date", { ascending: true }).limit(10),
        ]);

        const uniqueEnrolled = new Set((enrolledRes.data || []).map(e => e.employee_id));
        const completedCount = completedRes.count || 0;
        const enrolledCount = uniqueEnrolled.size;
        const totalCount = totalRes.count || 0;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Top courses by enrollment
        const courseMap = {};
        (courseAppRes.data || []).forEach(app => {
          courseMap[app.course_id] = (courseMap[app.course_id] || 0) + 1;
        });
        const topCourses = Object.entries(courseMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([course_id, count]) => ({ course_id: parseInt(course_id), enrollment: count }));

        // Trainings by month
        const { data: monthlyData } = await supabase
          .from("trainings").select("start_date")
          .eq("is_deleted", false)
          .gte("start_date", yearStart)
          .lte("start_date", yearEnd);
        const monthMap = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        (monthlyData || []).forEach(t => {
          const month = new Date(t.start_date).getMonth();
          monthMap[month] = (monthMap[month] || 0) + 1;
        });
        const byMonth = monthNames.map((name, idx) => ({ month: name, count: monthMap[idx] || 0 }));

        setData({
          totalTrainings: totalCount,
          enrolledEmployees: enrolledCount,
          completed: completedCount,
          inProgress: Math.max(0, enrolledCount - completedCount),
          upcoming: upcomingRes.count || 0,
          certificationsIssued: completedCount,
          trainersCount: trainersRes.count || 0,
          completionRate,
          byMonth,
          topCourses,
          upcomingSessions: trainingsRes.data || [],
        });
      } catch (err) {
        console.error("Training dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [year]);

  return { data, loading };
}
