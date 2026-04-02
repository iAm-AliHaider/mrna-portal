import React, { useState, useEffect, useCallback } from "react";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import CustomTable from "../../../../components/tables/customeTable";
import { supabase } from "../../../../supabaseClient";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Reports" },
  { title: "Performance Report" },
];

const PerformanceReportPage = () => {
  const [data, setData] = useState({
    totalObjectives: 0,
    completedObjectives: 0,
    pendingObjectives: 0,
    averageRating: 0,
    topPerformers: [],
    objectivesByDepartment: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Objectives counts
      const { count: totalObjectives } = await supabase
        .from("employee_objectives")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false);

      const { count: completedObjectives } = await supabase
        .from("employee_objectives")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false)
        .eq("status", "completed");

      const { count: pendingObjectives } = await supabase
        .from("employee_objectives")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false)
        .eq("status", "in_progress");

      // Average rating from appraisals
      const { data: appraisals } = await supabase
        .from("appraisal_ratings")
        .select("rating");

      const avgRating = appraisals?.length
        ? (appraisals.reduce((sum, a) => sum + (a.rating || 0), 0) / appraisals.length).toFixed(2)
        : 0;

      setData({
        totalObjectives: totalObjectives || 0,
        completedObjectives: completedObjectives || 0,
        pendingObjectives: pendingObjectives || 0,
        averageRating: avgRating,
        topPerformers: [],
        objectivesByDepartment: [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Performance Report"
        items={breadcrumbItems}
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-blue-600">{data.totalObjectives}</div>
              <div className="text-gray-600 mt-1">Total Objectives</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-green-600">{data.completedObjectives}</div>
              <div className="text-gray-600 mt-1">Completed</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-orange-600">{data.pendingObjectives}</div>
              <div className="text-gray-600 mt-1">In Progress</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-purple-600">{data.averageRating}</div>
              <div className="text-gray-600 mt-1">Avg. Rating</div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
            {data.topPerformers?.length > 0 ? (
              <CustomTable
                headers={["Employee", "Rating", "Objectives Completed"]}
                data={data.topPerformers.map((p) => ({
                  Employee: p.name,
                  Rating: p.rating,
                  "Objectives Completed": p.completed,
                }))}
                showCheckbox={false}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No performance data available</p>
            )}
          </div>
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default PerformanceReportPage;
