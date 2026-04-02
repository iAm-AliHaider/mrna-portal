// AttendanceRequestPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Paper,
  TextField,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import NewAttendanceRequestForm from "./form";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filter";
import { supabase } from "../../../../supabaseClient"; // adjust this import to your setup
import CustomMenu from "../../../../components/common/CustomMenu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUser } from "../../../../context/UserContext";
import {
  useAttendanceRequests,
  useCreateAttendanceRequest,
  useUpdateAttendanceRequest,
  useDeleteAttendanceRequest,
  useAttendanceDuplicateCheck,
} from "../../../../utils/hooks/api/attendanceRequests";
import SelectField from "../../../../components/common/SelectField";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";

const AttendanceRequestPage = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [selectedEditId, setSelectedEditId] = useState(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [filters, setFilters] = useState({
    original_date: "",
    new_time: "",
    check_type: "",
  });

  const { attendanceData, totalPages, loading, refetch } =
    useAttendanceRequests(page, searchQuery, filters, perPage);
  const { createAttendanceRequest } = useCreateAttendanceRequest();
  const { checkAttendanceDuplicate } = useAttendanceDuplicateCheck();
  const { updateAttendanceRequest } = useUpdateAttendanceRequest();
  const { deleteAttendanceRequest } = useDeleteAttendanceRequest();

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "declined", label: "Declined" },
  ];

  const CHECK_TYPE_OPTIONS = [
    { value: "check_in", label: "Check In" },
    { value: "check_out", label: "Check Out" },
  ];

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPage(0); // Reset to first page when filter changes
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filter changes
  };

  const resetFilters = () => {
    const resetFilters = {
      original_date: "",
      new_time: "",
      check_type: "",
    };
    setFilters(resetFilters);
    setPage(0);
    refetch(resetFilters);
  };

  // Breadcrumbs
  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Self Service" },
    { title: "Attendance Request" },
  ];

  // Column definitions remain the same
  const columns = [
    { key: "original_date", label: "Date" },
    { key: "new_time", label: "Time" },
    { key: "check_type", label: "Check Type" },
    { key: "request_type", label: "Request Type" },
    {
      key: "reason",
      label: "Reason",
      type: "description",
      render: (row) => row?.reason,
    },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "rejection_reason",
      label: "Rejection Reason (if applicable)",
      type: "description",
      render: (row) => row?.rejection_reason,
    },
    // {
    //   type: 'custom',
    //   label: 'Actions',
    //   width: '10%',
    //   render: row => (
    //     <CustomMenu
    //       items={[
    //         {
    //           label: 'Edit',
    //           icon: <EditIcon fontSize='small' />,
    //           action: () => handleEdit(row),
    //         },
    //         {
    //           label: 'Delete',
    //           icon: <DeleteIcon fontSize='small' />,
    //           action: () => handleDelete(row),
    //           danger: true,
    //         },
    //       ]}
    //     />
    //   )
    // }
  ];

  // UI handlers
  const handleOpenForm = () => setOpenFormModal(true);
  const handleCloseForm = () => setOpenFormModal(false);

  // Edit handler
  const handleEdit = (row) => {
    setSelectedEditId(row.id);
    setOpenFormModal(true);
  };

  // Delete handler
  const handleDelete = (row) => {
    // await supabase.from('attendance_requests').update({ is_deleted: true }).eq('id', row.id);
    // fetchAttendanceRequests();
  };

    const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();


  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      employee_id: employeeId,
      created_by: employeeId,
      updated_by: employeeId,
      new_time: values.new_time ? values.new_time : null,
      check_type: values.check_type ? values.check_type : null,
      start_time: values.start_time ? values.start_time : null,
      end_time: values.end_time ? values.end_time : null,
      check_type: values.check_type ? values.check_type : null,
      reason: values.reason ? values.reason : null,
      status_workflow: workflow_employees
    };


    const recordExists = await checkAttendanceDuplicate({
      employee_id: payload.employee_id,
      request_type: payload.request_type,
      original_date: payload.original_date,
      start_time: payload.start_time,
      end_time: payload.end_time,
      showToast: true,
    });

    if(recordExists && recordExists.exists) return;

    await createAttendanceRequest(payload);
    let subject = payload?.request_type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") + " Request"
    await transactionEmailSender(user, payload, "Attendance Request", subject);
    handleCloseForm();
    refetch();
    setSubmitting(false);
  };
  const handleApplyFilter = (newValues) => {
    const updatedFilters = { ...filters, ...newValues };
    setFilters(updatedFilters);
    setPage(0);
    refetch(updatedFilters);
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Don't apply filters automatically
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Attendance Request"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="New Attendance Request"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* Search + Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
            {/* Search Field */}
            <SearchField
              value={searchQuery}
              placeholder="Search by reason..."
              onChange={(val) => {
                setSearchQuery(val);
                setPage(0); // Reset to first page when search changes
              }}
            />

            {/* Filters */}
            <div className="flex gap-4">
              <div className="w-[300px]">
                <SelectField
                  options={statusOptions}
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
                    handleChange={handleChangeFilter}
                  />
                </FiltersWrapper>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <DynamicTable
            columns={columns}
            data={attendanceData.map((row) => ({
              ...row,
              rejection_reason:
                row.status === "declined" ? row.reason || "-" : "-",
              new_time: row.new_time
                ? row.new_time
                : `${row.start_time}-${row.end_time}`,
              request_type: row.request_type
                ? row.request_type
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                : "-",
            }))}
            footerInfo={`Attendance Requests out of ${attendanceData?.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      {/* "New Attendance Request" Modal */}
      <NewAttendanceRequestForm
        open={openFormModal}
        onClose={handleCloseForm}
        id={selectedEditId}
        attendanceData={attendanceData}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </React.Fragment>
  );
};

export default AttendanceRequestPage;
