import React, { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { useMyApprovalsList } from "../../../utils/hooks/api/approvals";
import { ROLES } from "../../../utils/constants";

const LeavesApprovalCard = () => {
  const { user } = useUser();
  const [reportType, setReportType] = useState("leave_requests");
  const [pendingLeaves, setPendingLeaves] = useState([]);

  // Default pagination + filters
  const currentPage = 0;
  const perPage = 15;
  const searchQuery = "";
  const empCode = "";

  // ✅ Reuse your main hook
  const { approvalsData, loading, error, refetch } = useMyApprovalsList(
    currentPage,
    perPage,
    searchQuery,
    reportType,
    empCode
  );


  // 🔹 On mount, fetch only pending leaves for managers
  useEffect(() => {
    if (!user) return;

    // Run this once user info is available
    if (user.role === ROLES.MANAGER) {
      // Refetch ensures the hook pulls latest data
      refetch({
        status: "pending",
        is_approved: false,
      });
    }
  }, [user]);

  // 🔹 Filter only pending approvals from hook data
  useEffect(() => {
    // debugger
    if (approvalsData) {
      const filtered = approvalsData.filter(
        (item) => item.status?.toLowerCase() === "pending"
      );
      setPendingLeaves(filtered);
    }
  }, [approvalsData, user]);

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Pending Leaves for Approval
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        {loading && <div className="text-gray-500 text-center">Loading…</div>}

        {!loading && error && (
          <div className="text-red-500 text-center">
            Error loading leaves. Check console.
          </div>
        )}

        {!loading && !error && pendingLeaves.length === 0 && (
          <div className="text-gray-500 text-center">No pending leaves</div>
        )}

        {!loading &&
          pendingLeaves.map((leave) => {
            const employee =
              leave?.employee || leave?.employees || leave?.candidate || {};
            const employeeName = leave?.employee?.candidate?.full_name || "";
            return (
              <div
                key={leave.id}
                className="bg-gray-50 rounded-md p-3 shadow-sm flex flex-col gap-1"
              >
                <div className="text-sm font-medium text-gray-800 leading-snug flex justify-between">
                  <div>{employeeName}</div>
                  <div>{leave.leave_type}</div>
                </div>

                <div className="text-xs text-gray-500">
                  {leave.start_date || "—"} → {leave.end_date || "—"}
                </div>

                <div className="text-sm text-gray-700 truncate">
                  {leave.reason || leave.notes || "No reason provided"}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default LeavesApprovalCard;

// import React, { useEffect, useState } from "react";
// import { useUser } from "../../../context/UserContext";
// import { supabase } from "../../../supabaseClient";
// import { ROLES } from "../../../utils/constants";

// const LeavesApprovalCard = () => {
//   const { user } = useUser();
//   const [approvalsData, setApprovalsData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const userOrgId = user?.organizational_unit_id;

//   useEffect(() => {
//     // run whenever user becomes available / changes
//     // leavesFetcher();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user]);

//   return (
//     <div className="bg-white rounded-xl shadow border w-full">
//       {/* Header */}
//       <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
//         Pending Leaves for Approval
//       </div>

//       {/* Events List */}
//       <div className="flex flex-col gap-3 p-4">
//         {loading && <div className="text-gray-500 text-center">Loading…</div>}

//         {!loading && error && (
//           <div className="text-red-500 text-center">
//             Error loading leaves. Check console for details.
//           </div>
//         )}

//         {!loading && approvalsData.length === 0 && !error && (
//           <div className="text-gray-500 text-center">No pending Leaves</div>
//         )}

//         {!loading &&
//           approvalsData.map((leave, index) => {
//             const employeeName =
//               leave?.employees?.name || leave?.employees?.full_name || "";
//             const employeeEmail =
//               leave?.employees?.email || leave?.employees?.employee_email || "";
//             return (
//               <div
//                 key={leave.id || index}
//                 className="bg-gray-50 rounded-md p-3 shadow-sm flex flex-col gap-2"
//               >
//                 <div className="text-sm text-gray-800 leading-snug">
//                   {employeeName || employeeEmail || `Request #${leave.id}`}
//                 </div>

//                 <div className="text-xs text-gray-500">
//                   {leave.start_date || "—"} to {leave.end_date || "—"}
//                 </div>

//                 <div className="text-sm text-gray-700">
//                   {leave.reason || leave.notes || "No reason provided"}
//                 </div>
//               </div>
//             );
//           })}
//       </div>
//     </div>
//   );
// };

// export default LeavesApprovalCard;
