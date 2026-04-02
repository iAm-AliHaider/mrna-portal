import React, { useState } from "react";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchField from "../../../../components/common/searchField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { useAssetHistory } from "../../../../utils/hooks/api/useAssetHistory";
import { useAssetsForMaintenance } from "../../../../utils/hooks/api/useAssetMaintenance";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Asset Management" },
  { title: "History" },
];

const AssetHistoryPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const { data: assets = [] } = useAssetsForMaintenance();
  const { data, totalPages, loading } = useAssetHistory(selectedAssetId, page, perPage);

  const assetOptions = [
    { label: "All Assets", value: "" },
    ...(assets || []).map((a) => ({
      label: `${a.name} (${a.serial_number || "N/A"})`,
      value: a.id,
    })),
  ];

  const formatEmployeeName = (emp) => {
    if (!emp?.candidates) return "System";
    const c = emp.candidates;
    return `${emp.employee_code || ""} - ${c.first_name || ""} ${c.second_name || ""}`.trim();
  };

  const columns = [
    { key: "asset", label: "Asset", render: (row) => row.asset?.name || "-" },
    { key: "serial_number", label: "Serial No.", render: (row) => row.asset?.serial_number || "-" },
    { key: "action_type", label: "Action Type" },
    { key: "created_at", label: "Date", type: "date" },
    { key: "performed_by", label: "Performed By", render: (row) => formatEmployeeName(row.performed_by) },
    {
      key: "old_value",
      label: "Previous Value",
      type: "description",
      render: (row) => row?.old_value || "-",
    },
    {
      key: "new_value",
      label: "New Value",
      type: "description",
      render: (row) => row?.new_value || "-",
    },
    {
      key: "notes",
      label: "Notes",
      type: "description",
      render: (row) => row?.notes || "-",
    },
  ];

  // Filter data based on search query
  const filteredData = searchQuery
    ? data.filter((row) =>
        row.asset?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.action_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data;

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Asset History"
        items={breadcrumbItems}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => setSearchQuery(v)}
              placeholder="Search by asset, action, or notes..."
            />
            <div className="w-[300px]">
              <FormikSelectField
                name="asset_id"
                label="Filter by Asset"
                options={assetOptions}
                value={selectedAssetId || ""}
                onChange={(v) => {
                  setSelectedAssetId(v || null);
                  setPage(0);
                }}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={filteredData}
            footerInfo={`Asset History Records: ${filteredData.length}`}
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

export default AssetHistoryPage;
