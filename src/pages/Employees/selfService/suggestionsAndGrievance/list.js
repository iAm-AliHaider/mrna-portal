import React, { useState } from "react";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import { Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import {
  useGrievanceSuggestions,
  useGetSingleGrievanceSuggestion,
  useGrievanceSuggestions2,
} from "../../../../utils/hooks/api/suggestionsAndGrievance";
import SelectField from "../../../../components/common/SelectField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import SearchField from "../../../../components/common/searchField";
import { toast } from "react-hot-toast";
import GrievanceAndSuggestionModal from "./GrievanceAndSugggestionModal";
import { useUser } from "../../../../context/UserContext";
import DownloadAttachmentsModal from "../../../../components/common/downloadAttachmentsModal";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_action", label: "In Action" },
  { value: "declined", label: "Declined" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "declined":
      return "error";
    default:
      return "default";
  }
};

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Suggestions & Grievances" },
];

const SuggestionsAndGrievanceList = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentOptions, setAttachmentOptions] = useState([]);

  const { data, totalPages, count, loading, refetch } = useGrievanceSuggestions(
    page,
    searchQuery,
    filters,
    perPage,
    user
  );
  const { getSingleGrievanceSuggestion, loading: singleLoading } =
    useGetSingleGrievanceSuggestion();

  const canAdd = user?.role === "employee";

  const handleApplyFilter = (newValues) => {
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      type: "",
    });
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1); // Reset page when searching
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const onRowClick = async (id) => {
    try {
      const { data: singleData, error } = await getSingleGrievanceSuggestion(
        id
      );
      if (error) {
        toast.error("Cannot find data");
        return;
      }
      setSelectedRecord(singleData);
      setIsModalOpen(true);
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openAttachmentsModal = (attachment) => {
    setAttachmentOptions([
      {
        label: decodeURIComponent(attachment.split("/").pop()),
        value: attachment,
      },
    ]);
    setAttachmentModalOpen(true);
  };

  const getPageTitle = () => {
    switch (user?.role) {
      case "employee":
        return "My Suggestions & Grievances";
      case "manager":
        return "Department Suggestions & Grievances";
      case "hr":
      case "hr_manager":
        return "All Suggestions & Grievances";
      default:
        return "Suggestions & Grievances";
    }
  };

  const columns = [
    {
      key: "report_type",
      label: "Type",
      type: "custom",
      render: (row) => <span className="capitalize">{row?.report_type}</span>,
    },
    {
      key: "category",
      label: "Category",
      type: "custom",
      render: (row) => (
        <div className="capitalize">
          {row?.category ? row?.category?.replace("_", " ") : ""}
        </div>
      ),
    },
    {
      key: "urgency",
      label: "Urgency",
      type: "custom",
      render: (row) => (
        <div className="capitalize">
          {row?.urgency ? row?.urgency?.replace("_", " ") : ""}
        </div>
      ),
    },
    // { key: "priority", label: "Priority" },
    { key: "created_at", label: "Created At", type: "date" },
    {
      key: "review_notes",
      label: "Review Notes",
      type: "description",
      render: (row) => {
        let notes = [];

        try {
          notes = JSON.parse(row?.review_notes || "[]");
        } catch (e) {
          console.error("Invalid review_notes JSON", e);
        }

        return notes?.length > 0 ? (
          <div className="space-y-4">
            {notes.map((item, index) => (
              <div
                key={index}
                className="border p-3 rounded bg-gray-50 shadow-sm text-sm text-gray-800"
              >
                <div>
                  <strong>Note By:</strong> {item.updated_by}
                </div>
                <div>
                  <strong>Status:</strong> {item.status}
                </div>
                <div>
                  <strong>Note:</strong> {item.note}
                </div>
              </div>
            ))}
          </div>
        ) : (
          ""
        );
      },
    },
    {
      key: "status",
      label: "Status",
      type: "chip",
      render: (value) => (
        <Chip
          label={value}
          color={getStatusColor(value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      key: "attachments",
      label: "Attachments",
      type: "custom",
      render: (row) => {
        // console.log("row", row);
        return (
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              openAttachmentsModal(row.attachment || "");
            }}
            disabled={!row.attachment}
          >
            View
          </Button>
        );
      },
    },
  ];

  return (
    <PageWrapperWithHeading
      title={getPageTitle()}
      items={breadcrumbItems}
      action={() => navigate("/self/suggestions-grievance/add")}
      buttonTitle={"Add Suggestion & Grievance"}
      Icon={AddIcon}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <SearchField
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by catagory..."
          />
          <div className="flex gap-4">
            <div className="w-[300px]">
              <SelectField
                options={STATUS_OPTIONS}
                placeholder="Status"
                value={filters.status}
                onChange={handleStatusChange}
              />
            </div>
            <div className="filter-buttons">
              <FiltersWrapper
                onApplyFilters={handleApplyFilter}
                resetFilters={resetFilters}
              >
                <ListFilter
                  values={filters}
                  label="Type"
                  options={[]}
                  handleChange={handleChangeFilter}
                  placeholder="Select Type"
                />
              </FiltersWrapper>
            </div>
          </div>
        </div>
        <DynamicTable
          columns={columns}
          data={data}
          loading={loading}
          currentPage={page + 1}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={(p) => setPage(p - 1)}
          onPerPageChange={setPerPage}
          onRowClick={onRowClick}
          onSearch={setSearchQuery}
          footerInfo={`Showing ${data.length} of ${count} items`}
          // showCheckbox={false}
          showPagination={true}
        />
      </div>

      <GrievanceAndSuggestionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedRecord={selectedRecord}
        loading={singleLoading}
        onStatusUpdate={refetch}
      />
      <DownloadAttachmentsModal
        open={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        attachmentOptions={attachmentOptions}
      />
    </PageWrapperWithHeading>
  );
};

export const SuggestionsAndGrievanceList2 = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentOptions, setAttachmentOptions] = useState([]);

  const { data, totalPages, count, loading, refetch } =
    useGrievanceSuggestions2(page, searchQuery, filters, perPage, user);
  const { getSingleGrievanceSuggestion, loading: singleLoading } =
    useGetSingleGrievanceSuggestion();

  const canAdd = user?.role === "employee";

  const handleApplyFilter = (newValues) => {
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      type: "",
    });
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1); // Reset page when searching
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const onRowClick = async (id) => {
    try {
      const { data: singleData, error } = await getSingleGrievanceSuggestion(
        id
      );
      if (error) {
        toast.error("Cannot find data");
        return;
      }
      setSelectedRecord(singleData);
      setIsModalOpen(true);
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openAttachmentsModal = (attachment) => {
    setAttachmentOptions([
      {
        label: decodeURIComponent(attachment.split("/").pop()),
        value: attachment,
      },
    ]);
    setAttachmentModalOpen(true);
  };

  const getPageTitle = () => {
    switch (user?.role) {
      case "employee":
        return "My Suggestions & Grievances";
      case "manager":
        return "Department Suggestions & Grievances";
      case "hr":
      case "hr_manager":
        return "All Suggestions & Grievances";
      default:
        return "Suggestions & Grievances";
    }
  };

  const columns = [
    {
      key: "report_type",
      label: "Type",
      type: "custom",
      render: (row) => <span className="capitalize">{row?.report_type}</span>,
    },
    {
      key: "category",
      label: "Category",
      type: "custom",
      render: (row) => (
        <div className="capitalize">
          {row?.category ? row?.category?.replace("_", " ") : ""}
        </div>
      ),
    },
    {
      key: "urgency",
      label: "Urgency",
      type: "custom",
      render: (row) => (
        <div className="capitalize">
          {row?.urgency ? row?.urgency?.replace("_", " ") : ""}
        </div>
      ),
    },
    // { key: "priority", label: "Priority" },
    { key: "created_at", label: "Created At", type: "date" },
    {
      key: "review_notes",
      label: "Review Notes",
      type: "description",
      render: (row) => {
        let notes = [];

        try {
          notes = JSON.parse(row?.review_notes || "[]");
        } catch (e) {
          console.error("Invalid review_notes JSON", e);
        }

        return notes?.length > 0 ? (
          <div className="space-y-4">
            {notes.map((item, index) => (
              <div
                key={index}
                className="border p-3 rounded bg-gray-50 shadow-sm text-sm text-gray-800"
              >
                <div>
                  <strong>Note By:</strong> {item.updated_by}
                </div>
                <div>
                  <strong>Status:</strong> {item.status}
                </div>
                <div>
                  <strong>Note:</strong> {item.note}
                </div>
              </div>
            ))}
          </div>
        ) : (
          ""
        );
      },
    },
    {
      key: "status",
      label: "Status",
      type: "chip",
      render: (value) => (
        <Chip
          label={value}
          color={getStatusColor(value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      key: "attachments",
      label: "Attachments",
      type: "custom",
      render: (row) => {
        // console.log("row", row);
        return (
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              openAttachmentsModal(row.attachment || "");
            }}
            disabled={!row.attachment}
          >
            View
          </Button>
        );
      },
    },
  ];

  return (
    // <PageWrapperWithHeading
    //   title={getPageTitle()}
    //   items={breadcrumbItems}
    //   action={() => navigate("/self/suggestions-grievance/add")}
    //   buttonTitle={"Add Suggestion & Grievance"}
    //   Icon={AddIcon}
    // >
    <>
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <SearchField
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by catagory..."
          />
          {/* <div className="flex gap-4">
          <div className="w-[300px]">
            <SelectField
              options={STATUS_OPTIONS}
              placeholder="Status"
              value={filters.status}
              onChange={handleStatusChange}
            />
          </div>
          <div className="filter-buttons">
            <FiltersWrapper
              onApplyFilters={handleApplyFilter}
              resetFilters={resetFilters}
            >
              <ListFilter
                values={filters}
                label="Type"
                options={[]}
                handleChange={handleChangeFilter}
                placeholder="Select Type"
              />
            </FiltersWrapper>
          </div>
        </div> */}
        </div>
        <DynamicTable
          columns={columns}
          data={data}
          loading={loading}
          currentPage={page + 1}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={(p) => setPage(p - 1)}
          onPerPageChange={setPerPage}
          onRowClick={onRowClick}
          onSearch={setSearchQuery}
          footerInfo={`Showing ${data.length} of ${count} items`}
          // showCheckbox={false}
          showPagination={true}
        />
      </div>

      <GrievanceAndSuggestionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedRecord={selectedRecord}
        loading={singleLoading}
        onStatusUpdate={refetch}
      />
      <DownloadAttachmentsModal
        open={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        attachmentOptions={attachmentOptions}
      />
    </>
    // </PageWrapperWithHeading>
  );
};

export default SuggestionsAndGrievanceList;
