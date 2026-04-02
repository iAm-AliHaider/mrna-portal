import React, { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Modal,
  Dialog,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../components/tables/AnnouncementsTable";
import FiltersWrapper from "../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import SearchField from "../../../components/common/searchField";
import SelectField from "../../../components/common/SelectField";
import PageWrapperWithHeading from "../../../components/common/PageHeadSection";
import { useAssignedTasks } from "../../../utils/hooks/api/useAssignedTasks";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import ActionPermissionWrapper from "./ActionPermissionWrapper";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { useCompanyEmployees } from "../../../utils/hooks/api/candidates";
import ActionModalTask from "./ActionModalTask";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Employees" },
  { title: "My Tasks" },
];

const TaskList = () => {
  const [filters, setFilters] = useState({ status: "", searchTerm: "" });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { employees, loading: loadingEmployees } = useCompanyEmployees();

  const navigate = useNavigate();
  const { user } = useUser();
  const {
    data: tasks,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    count,
    refetch,
  } = useAssignedTasks({
    assignedToId: user?.id,
    status: filters.status,
    searchTerm: filters.searchTerm,
    initialPage: 0,
    initialSize: 10,
  });

  const handleReassignTask = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }
    try {
      const { error } = await supabase
        .from("assigned_tasks")
        .update({
          assigned_to_id: selectedEmployee,
          status: "assigned",
        })
        .eq("id", selectedTask.id);

      if (error) throw error;

      toast.success("Task reassigned successfully");
      setIsReassignModalOpen(false);
      setSelectedTask(null);
      setSelectedEmployee(null);
      refetch();
    } catch (error) {
      toast.error("Failed to reassign task: " + error.message);
    }
  };

  const handleRowClick = (row) => {
    if (row?.status.toLowerCase() === "completed") {
      toast.error("Task is already completed");
      return;
    }
    setSelectedTask(row);
    setIsReassignModalOpen(true);
  };

  const columns = [
    {
      key: "candidate_name",
      label: "Candidate Name",
      type: "custom",
      render: (row) => (
        <div
          onClick={() => handleRowClick(row)}
          className="cursor-pointer hover:text-blue-600"
        >
          {/* {JSON.stringify(row) || ""} */}
          {row?.employee_name || ""}
        </div>
      ),
    },
    {
      key: "task_name",
      label: "Task Title",
      type: "custom",
      render: (row) => (
        <div
          onClick={() => handleRowClick(row)}
          className="cursor-pointer hover:text-blue-600"
        >
          {row.task_name || ""}
        </div>
      ),
    },
    {
      key: "task_type",
      label: "Task Type",
      type: "custom",
      render: (row) => (
        <div
          onClick={() => handleRowClick(row)}
          className="cursor-pointer hover:text-blue-600"
        >
          {row.task_type || ""}
        </div>
      ),
    },
    {
      key: "task_description",
      label: "Note",
      type: "description",
      render: (row) => row.task_description || "",
    },
    {
      key: "task_attachment",
      label: "Attachments",
      type: "description",
      render: (row) => row.task_attachment || "",
    },
    {
      key: "status",
      label: "Status",
      type: "chip",
    },
    {
      key: "assigned_at",
      label: "Receive Date",
      type: "custom",
      render: (row) => (
        <div
          onClick={() => handleRowClick(row)}
          className="cursor-pointer hover:text-blue-600"
        >
          {row.assigned_at
            ? new Date(row.assigned_at).toLocaleDateString()
            : ""}
        </div>
      ),
    },
    {
      key: "action",
      label: "Actions",
      type: "custom",
      render: (row) => <ActionModalTask refetch={refetch} row={row} />,
    },
  ];

  const handleSearch = (value) =>
    setFilters((prev) => ({ ...prev, searchTerm: value }));

  return (
    <PageWrapperWithHeading title="My Tasks" items={breadcrumbItems}>
      <Box className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <Box className="flex justify-between items-center w-full">
          <SearchField
            value={filters.searchTerm}
            onChange={handleSearch}
            placeholder="Serach by task title..."
          />
          <Box className="flex gap-4">
            {/* <SelectField
              options={[{ label: 'All', value: '' }, { label: 'Pending', value: 'Pending' }, { label: 'Completed', value: 'Completed' }]}
              placeholder="Status"
              value={filters.status}
              onChange={(val) => handleFilterChange('status', val)}
            /> */}
            {/* <FiltersWrapper onApplyFilters={refetch} resetFilters={resetFilters}>
              <ListFilter
                values={filters}
                label="Type"
                options={[]}
                handleChange={handleFilterChange}
                placeholder="Select Type"
              />
            </FiltersWrapper> */}
          </Box>
        </Box>

        <DynamicTable
          columns={columns}
          data={tasks}
          loading={loading}
          showCheckbox
          onSelectChange={() => {}}
          footerInfo={`${count} tasks`}
          currentPage={page + 1}
          totalPages={Math.ceil(count / pageSize)}
          perPage={pageSize}
          onPageChange={(p) => setPage(p - 1)}
          onPerPageChange={(n) => setPageSize(n)}
        />

        <Dialog
          open={isReassignModalOpen}
          onClose={() => {
            setIsReassignModalOpen(false);
            setSelectedTask(null);
            setSelectedEmployee(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Reassign Task</h2>
            <p className="mb-4 ">Task: {selectedTask?.task_name}</p>

            <SelectField
              label="Select Employee"
              options={
                employees
                  ?.filter((emp) => emp.id !== selectedTask?.assigned_to_id) // Exclude current user
                  ?.map((emp) => ({
                    label: emp.candidates?.full_name,
                    value: emp.id,
                  })) || []
              }
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              placeholder="Select employee to reassign"
              disabled={loadingEmployees}
              className="mb-4"
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outlined"
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setSelectedTask(null);
                  setSelectedEmployee(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleReassignTask}
                disabled={!selectedEmployee}
              >
                Reassign
              </Button>
            </div>
          </div>
        </Dialog>
      </Box>
    </PageWrapperWithHeading>
  );
};

export default TaskList;
