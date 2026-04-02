import React, { useState } from "react";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import FormikInputField from "../../../../components/common/FormikInputField";
import { useLeaveSchedule } from "../../../../utils/hooks/api/useLeaveSchedule";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Human Resource" },
  { title: "Leave Schedule" },
];

const LeaveSchedulePage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", month: "" });

  const { user } = useUser();
  const { data, totalPages, loading, refetch } = useLeaveSchedule(
    page,
    searchQuery,
    filters,
    perPage
  );

  const formatEmployeeName = (emp) => {
    if (!emp?.candidates) return "Unknown";
    const c = emp.candidates;
    return `${emp.employee_code || ""} - ${c.first_name || ""} ${c.second_name || ""} ${c.third_name || ""} ${c.forth_name || ""} ${c.family_name || ""}`.trim();
  };

  const getStatusBadge = (row) => {
    const m = row.is_manager_approve?.toLowerCase();
    const h = row.is_hr_approve?.toLowerCase();
    const hm = row.is_hr_manager_approve?.toLowerCase();
    if (m === "approved" && h === "approved" && hm === "approved") return "approved";
    if (m === "declined" || h === "declined" || hm === "declined") return "declined";
    return "pending";
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => formatEmployeeName(row.employee),
    },
    { key: "leave_type", label: "Leave Type" },
    { key: "start_date", label: "From", type: "date" },
    { key: "end_date", label: "To", type: "date" },
    {
      key: "days",
      label: "Days",
      render: (row) => {
        if (!row.start_date || !row.end_date) return "-";
        const start = new Date(row.start_date);
        const end = new Date(row.end_date);
        return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      },
    },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "approval_status",
      label: "Approval Flow",
      render: (row) => {
        const m = row.is_manager_approve || "pending";
        const h = row.is_hr_approve || "pending";
        const hm = row.is_hr_manager_approve || "pending";
        return (
          <div className="flex gap-1 text-xs">
            <span className={`px-2 py-0.5 rounded ${m === "approved" ? "bg-green-100 text-green-700" : m === "declined" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
              M:{m.charAt(0).toUpperCase()}
            </span>
            <span className={`px-2 py-0.5 rounded ${h === "approved" ? "bg-green-100 text-green-700" : h === "declined" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
              HR:{h.charAt(0).toUpperCase()}
            </span>
            <span className={`px-2 py-0.5 rounded ${hm === "approved" ? "bg-green-100 text-green-700" : hm === "declined" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
              HRM:{hm.charAt(0).toUpperCase()}
            </span>
          </div>
        );
      },
    },
    {
      key: "reason",
      label: "Reason",
      type: "description",
      render: (row) => row?.reason || "-",
    },
  ];

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  // Get current month for default filter
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Leave Schedule"
        items={breadcrumbItems}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search by employee name or leave type..."
            />
            <div className="flex gap-4">
              <div className="w-[150px]">
                <SelectField
                  options={statusOptions}
                  placeholder="Status"
                  value={filters.status}
                  onChange={(v) => { setFilters((p) => ({ ...p, status: v })); setPage(0); }}
                />
              </div>
              <div className="w-[180px]">
                <FormikInputField
                  name="month"
                  label="Month"
                  type="month"
                  value={filters.month}
                  onChange={(e) => {
                    setFilters((p) => ({ ...p, month: e.target.value }));
                    setPage(0);
                  }}
                />
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Department Leave Schedule: ${data.length} records`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default LeaveSchedulePage;
