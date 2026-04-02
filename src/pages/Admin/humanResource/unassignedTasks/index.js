import React, { useState, useEffect } from "react";
import { useUser } from "../../../../context/UserContext";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import { usePreOnboardingUnassignedTasks } from "../../../../utils/hooks/api/useUnassignedTasks";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import SearchField from "../../../../components/common/searchField";
import SelectField from "../../../../components/common/SelectField";
import CustomMenu from "../../../../components/common/CustomMenu";
import AssignmentModal from "./AssignmentModal";
import { Button } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource" },
  { title: "Pre-Hiring Tasks" },
];

const UnassignedTasks = () => {
  const { user } = useUser();
  const { tasks, loading, error, refetch, assignTask, updateTask, deleteTask } =
    usePreOnboardingUnassignedTasks();
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
    task_type: "",
  });

  const navigate = useNavigate();
  // Modal state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
    const [selectedTaskAssignedIDMaster, setSelectedTaskAssignedIDMaster] = useState(null);


  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  // Filter tasks based on search term and filters
  useEffect(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.organizational_structure?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          task.task_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    // Apply task type filter
    if (filters.task_type) {
      filtered = filtered.filter(
        (task) => task.task_type === filters.task_type
      );
    }

    setFilteredTasks(filtered);
  }, [searchTerm, filters, tasks]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTasks.length / perPage);
  const startIndex = page * perPage;
  const endIndex = startIndex + perPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(0); // Reset to first page when searching
  };

  const handleOpenAssignmentModal = (task) => {
    setSelectedTask(task);
    setSelectedTaskAssignedIDMaster(task.task.assigned_id_master);
    setAssignmentModalOpen(true);
  };

  const columns = [
    {
      key: "name",
      label: "Task Name",
      type: "custom",
      render: (row) => row?.task?.name || row?.name,
    },
    {
      key: "description",
      label: "Description",
      type: "description",
      render: (row) => row?.task?.description,
    },
    {
      key: "task_type",
      label: " Task Type",
      type: "custom",
      render: (row) => <span className="capitalize">{row?.task?.type}</span>,
    },
    {
      key: "candidate",
      label: "Candidate",
      type: "custom",
      render: (row) => (
        <div
          style={{
            cursor: "pointer",
            color: "#007bff",
            textDecoration: "underline",
          }}
          onClick={() =>
            navigate(
              `/admin/human-resource/talent-acquisition/candidates/add/${row.candidate?.id}`
            )
          }
        >
          {row.candidate?.full_name || ""}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "chip",
    },
    {
      key: "actions",
      type: "custom",
      label: "Actions",
      render: (row) => (
        <CustomMenu
          items={[
            {
              label: "Assign Task",
              icon: <AssignmentIcon fontSize="small" />,
              action: () => handleOpenAssignmentModal(row),
            },
          ]}
        />
      ),
    },
  ];

  const onClose = () => {
    setAssignmentModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <PageWrapperWithHeading
      title="Pre-Hiring Tasks"
      items={breadcrumbItems}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search tasks..."
          />
          <div className="flex gap-4">
            <div className="w-[200px]">
              <SelectField
                options={statusOptions}
                placeholder="Status"
                value={filters.status}
                onChange={handleStatusChange}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Table */}
        <DynamicTable
          columns={columns}
          data={paginatedTasks}
          footerInfo={`Unassigned Tasks out of ${filteredTasks.length}`}
          currentPage={page + 1}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={(p) => setPage(p - 1)}
          onPerPageChange={setPerPage}
          loading={loading}
        />

        {/* Assignment Modal */}
        <AssignmentModal
          open={assignmentModalOpen}
          onClose={onClose}
          taskId={selectedTask?.task_id}
          taskName={selectedTask?.name}
          selectedTaskAssignedIDMaster={selectedTaskAssignedIDMaster}
          refetch={refetch}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default UnassignedTasks;
