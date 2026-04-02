import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../supabaseClient";
import { Avatar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

const ActivitiesTable = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 7;

  useEffect(() => {
    fetchTasks();
  }, [user?.id]);

  async function fetchTasks() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("assigned_tasks")
        .select("*, task:tasks(*), assigned_employee:employees!assigned_tasks_assigned_to_id_fkey(first_name, work_email, profile_image, candidate_id, candidates(first_name, family_name)), assigner:employees!assigned_tasks_employee_id_fkey(first_name, work_email, profile_image, candidate_id, candidates(first_name, family_name))")
        .or(`assigned_to_id.eq.${user.id},employee_id.eq.${user.id}`)
        .order("assigned_at", { ascending: false });

      setTasks(data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = tasks.filter((t) => {
    if (!searchTerm) return true;
    const name = t.task?.name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const getAssignerName = (t) => {
    const emp = t.assigner;
    if (!emp) return "System";
    const cand = emp.candidates;
    if (cand) return `${cand.first_name || ""} ${cand.family_name || ""}`.trim();
    return emp.first_name || emp.work_email || "Unknown";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border w-full mt-6">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-white text-sm font-semibold">
          Activities / Tasks
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border w-full mt-6">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-white text-sm font-semibold">
        Activities / Tasks
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 flex-1 max-w-xs">
            <SearchIcon className="text-gray-400 mr-2" fontSize="small" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search tasks..."
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
          <span className="text-xs text-gray-500">
            Showing {paginated.length} of {filtered.length} tasks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase">
                <th className="px-3 py-2">Task List</th>
                <th className="px-3 py-2">Task</th>
                <th className="px-3 py-2">Receive Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Assigned By</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((t, i) => (
                  <tr
                    key={t.id || i}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-3 text-xs">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          t.task?.task_type === "mandatory"
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {t.task?.task_type === "mandatory"
                          ? "Mandatory"
                          : "General"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-800">
                        {t.task?.name || "Untitled"}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {t.task?.description || ""}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {t.assigned_at
                        ? new Date(t.assigned_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[t.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t.status?.replace("_", " ") || "Unknown"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={t.assigner?.profile_image}
                          sx={{ width: 24, height: 24 }}
                        />
                        <span className="text-xs text-gray-700">
                          {getAssignerName(t)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-sm text-gray-500"
                  >
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-xs text-primary font-medium disabled:text-gray-400"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-full text-xs font-medium ${
                      page === currentPage
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-xs text-primary font-medium disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesTable;
