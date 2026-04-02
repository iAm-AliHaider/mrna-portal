// AssetsTransactionsPage.js
import React, { useState } from "react";
import { Button } from "@mui/material";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filter";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { useUser } from "../../../../context/UserContext";
import {
  useAssetsTransactions,
  useDeleteAssetsTransaction,
  ASSIGNMENT_TYPE_OPTIONS
} from "../../../../utils/hooks/api/assetsTransactions";

const AssetsTransactionsPage = () => {
  const { user } = useUser();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({
    employee_id: "",
    assignment_type: "",
    status: "",
    from_date: "",
    to_date: "",
  });

  // Check if user has HR or admin role
  const canAddTransaction = user?.role === 'hr' || user?.role === 'admin' || user?.role === 'hr_manager';

  const navigate = useNavigate();
  const { transactionsData, totalPages, count, loading, refetch } =
    useAssetsTransactions(currentPage, searchQuery, filters, perPage);
  const { deleteAssetsTransaction, loading: deleteLoading } =
    useDeleteAssetsTransaction();


// Build a fast lookup map once
const ASSIGNMENT_TYPE_LABEL_BY_VALUE = Object.fromEntries(
  ASSIGNMENT_TYPE_OPTIONS.map(o => [o.value, o.label])
);

// Normalize and resolve label; falls back gracefully
const getAssignmentTypeLabel = (value) => {
  if (value == null) return "";
  const raw = String(value).trim();

  // try exact key
  if (ASSIGNMENT_TYPE_LABEL_BY_VALUE[raw]) return ASSIGNMENT_TYPE_LABEL_BY_VALUE[raw];

  // try normalized (handles "Add Asset To Employee", "add asset to employee", etc.)
  const normalized = raw.toLowerCase().replace(/\s+/g, "_");
  if (ASSIGNMENT_TYPE_LABEL_BY_VALUE[normalized]) return ASSIGNMENT_TYPE_LABEL_BY_VALUE[normalized];

  // last resort: try matching by label text
  const byLabel = ASSIGNMENT_TYPE_OPTIONS.find(
    o => o.label.toLowerCase() === raw.toLowerCase()
  );
  return byLabel ? byLabel.label : raw;
};


const rows = transactionsData.map(r => ({
  ...r,
  assignment_type_label: getAssignmentTypeLabel(r.assignment_type),
}));


  const columns = [
    // { key: "employeeNumber", label: "Employee Number" },
    { key: "employeeName", label: "Employee Name" },
      { key: "assignment_type_label", label: "Assignment Type" },

    // { key: "assignment_type", label: "Assignment Type" },
  //   { 
  //   key: "assignment_type", 
  //   label: "Assignment Type",
  //   render: (row) => getAssignmentTypeLabel(row?.assignment_type) 
  // },
    { key: "asset_code", label: "Asset Code" },
    { key: "asset_note", label: "Asset Notes", type: 'description', render: row => row?.asset_note },
    { key: "assetCategoryName", label: "Asset Category" },
    { key: "from_date", label: "From Date" },
    { key: "to_date", label: "To Date" },
    // { key: "status", label: "Status", type: "chip" },
    // { key: "createdBy", label: "Created By" },
    { key: "createdDate", label: "Created Date" },
    { key: "status", label: "Status", type: "chip" },

  ];

  const employeeOptions = Array.from(
    new Set(transactionsData.map((row) => row.employeeName))
  ).map((name) => ({ value: name, label: name }));

  const breadcrumbItems = [
    { href: "/home", icon: null },
    { title: "Transactions" },
    { title: "Assets Transactions" },
  ];

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      employee_id: "",
      assignment_type: "",
      status: "",
      from_date: "",
      to_date: "",
    });
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(0);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      const result = await deleteAssetsTransaction(selectedIds);
      if (result) {
        setSelectedIds([]);
        refetch();
      }
    } catch (error) {
      console.error("Error deleting assets transactions:", error);
    }
  };

  return (
    <PageWrapperWithHeading
      title="Assets Transactions"
      items={breadcrumbItems}
      buttonTitle={canAddTransaction ? "Add Assets Transaction" : null}
      action={canAddTransaction ? () => navigate("/transactions/assets/assetsTransactionForm") : null}
      Icon={canAddTransaction ? AddIcon : null}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField value={searchQuery} placeholder="Search by Code or assets notes..." onChange={setSearchQuery} />
        </div>

        <DynamicTable
          columns={columns}
          data={rows}
          showCheckbox={false}
          onSelectChange={(ids) => setSelectedIds(ids)}
          footerInfo={`Assets transactions out of ${count}`}
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={setPerPage}
          loading={loading}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default AssetsTransactionsPage;
