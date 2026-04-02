import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import CustomMenu from "../../../../components/common/CustomMenu";
import ExitInterviewForm from "./form";
import {
  useExitInterviews,
  useCreateExitInterview,
  useUpdateExitInterview,
} from "../../../../utils/hooks/api/useExitInterviews";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Exit Interview" },
];

const ExitInterviewPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "" });

  const { data, totalPages, loading, refetch } = useExitInterviews(page, searchQuery, filters, perPage, false);
  const { create } = useCreateExitInterview();
  const { update } = useUpdateExitInterview();

  const [openFormModal, setOpenFormModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [viewOnlyMode, setViewOnlyMode] = useState(false);

  const handleCreate = () => { setSelectedId(null); setViewOnlyMode(false); setOpenFormModal(true); };

  const handleViewDetails = (row) => {
    setSelectedId(row);
    setViewOnlyMode(true);
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => setOpenFormModal(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedId && typeof selectedId !== "number") {
        await update(selectedId, values);
      } else {
        await create(values);
      }
      handleCloseFormModal();
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "reason_for_leaving",
      label: "Reason for Leaving",
      render: (row) => row?.reason_for_leaving ? row.reason_for_leaving.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—",
    },
    {
      key: "feedback",
      label: "Feedback",
      type: "description",
      render: (row) => (row?.feedback?.substring(0, 80) || "—") + (row?.feedback?.length > 80 ? "..." : ""),
    },
    {
      key: "recommendations",
      label: "Recommendations",
      type: "description",
      render: (row) => (row?.recommendations?.substring(0, 60) || "—") + (row?.recommendations?.length > 60 ? "..." : ""),
    },
    { key: "status", label: "Status", type: "chip", render: (row) => row?.status || "pending" },
    { key: "created_at", label: "Submitted On", type: "date" },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => <CustomMenu items={[{ label: "View Details", action: () => handleViewDetails(row) }]} />,
    },
  ];

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading title="Exit Interview" items={breadcrumbItems} action={handleCreate} buttonTitle="Submit Exit Interview" Icon={AddIcon}>
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField value={searchQuery} onChange={(v) => { setSearchQuery(v); setPage(0); }} placeholder="Search by reason or feedback..." />
            <div className="w-[200px]">
              <SelectField options={statusOptions} placeholder="Status" value={filters.status} onChange={(v) => { setFilters((p) => ({ ...p, status: v })); setPage(0); }} />
            </div>
          </div>
          <DynamicTable
            columns={columns}
            data={data.map((row) => ({ ...row }))}
            footerInfo={`Exit Interviews: ${data.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
            onRowClick={handleViewDetails}
          />
        </div>
      </PageWrapperWithHeading>
      <ExitInterviewForm onClose={handleCloseFormModal} open={openFormModal} id={selectedId} formData={data} handleSubmit={handleSubmit} isViewOnly={viewOnlyMode} loading={loading} />
    </React.Fragment>
  );
};

export default ExitInterviewPage;
