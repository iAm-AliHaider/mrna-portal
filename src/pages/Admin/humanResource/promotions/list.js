import React, { useState } from "react";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import CustomMenu from "../../../../components/common/CustomMenu";
import { useAllPromotions, useUpdatePromotion } from "../../../../utils/hooks/api/usePromotions";
import { useUser } from "../../../../context/UserContext";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Human Resource" },
  { title: "Promotions" },
];

const PromotionsListPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", department: "" });

  const { user } = useUser();
  const { data, totalPages, loading, refetch } = useAllPromotions(
    page,
    searchQuery,
    filters,
    perPage
  );

  const { update } = useUpdatePromotion();
  const { handleApproval } = useGenericFlowEmployees();

  const formatEmployeeName = (emp) => {
    if (!emp?.candidates) return "Unknown";
    const c = emp.candidates;
    return `${emp.employee_code || ""} - ${c.first_name || ""} ${c.second_name || ""} ${c.third_name || ""} ${c.forth_name || ""} ${c.family_name || ""}`.trim();
  };

  const handleApprove = async (row) => {
    const payload = { status: "approved" };
    await update(row.id, payload);
    refetch();
  };

  const handleReject = async (row, reason) => {
    const payload = { status: "declined", rejection_reason: reason };
    await update(row.id, payload);
    refetch();
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => formatEmployeeName(row.employee),
    },
    { key: "old_designation", label: "Current Designation" },
    { key: "new_designation", label: "New Designation" },
    { key: "effective_date", label: "Effective Date", type: "date" },
    { key: "created_at", label: "Request Date", type: "date" },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "reason",
      label: "Reason",
      type: "description",
      render: (row) => row?.reason || "-",
    },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <CustomMenu
          items={[
            {
              label: "View Details",
              action: () => console.log("View", row.id),
            },
            ...(row.status === "pending" ? [
              {
                label: "Approve",
                action: () => handleApprove(row),
                danger: false,
              },
              {
                label: "Reject",
                action: () => handleReject(row, "Rejected by HR"),
                danger: true,
              },
            ] : []),
          ]}
        />
      ),
    },
  ];

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Promotions Management"
        items={breadcrumbItems}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search by employee name or reason..."
            />
            <div className="w-[200px]">
              <SelectField
                options={statusOptions}
                placeholder="Status"
                value={filters.status}
                onChange={(v) => { setFilters((p) => ({ ...p, status: v })); setPage(0); }}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Promotion Records: ${data.length}`}
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

export default PromotionsListPage;
