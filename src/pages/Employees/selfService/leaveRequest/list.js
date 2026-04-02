// LeaveRequestPage.js
import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import NewLeaveRequestForm from "./form";
// import CustomMenu from '../../../../components/common/CustomMenu'
// import EditIcon from '@mui/icons-material/Edit'
// import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
// import DeleteIcon from '@mui/icons-material/Delete'
import {
  useCreateLeaveRequest,
  useLeaveRequests,
  useUpdateLeaveRequest,
} from "../../../../utils/hooks/api/leaveRequests";
import { useUser } from "../../../../context/UserContext";
import { useDepartmentEmployees } from "../../../../utils/hooks/api/departmentEmployees";
import CustomMenu from "../../../../components/common/CustomMenu";
import DeleteIcon from "@mui/icons-material/Delete";
import AlertModal from "../../../../components/common/Modal/AlertModal";
import { isFutureDate } from "../../../../utils/common";
import { useEmployeesForDropdown } from '../../../../utils/hooks/api/companyInfo'
import { useGetDepartmentManager } from "../../../../utils/hooks/api/emplyees";
import { requestsEmailSender } from "../../../../utils/emailSenderHelper";
import { transactionEmailSender } from "../../../../utils/helper";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Leave Request" },
];

const LeaveRequestPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    is_start_half_day: false,
    is_end_half_day: false,
    status: "",
    type: "",
    leave_from: "",
    leave_to: "",
  });

  const { user } = useUser();
  const employeeId = user?.id;
  const { leaveData, totalPages, loading, refetch } = useLeaveRequests(
    page,
    searchQuery,
    filters,
    perPage
  );

  // const {
  //   companyHRs, // ✅ filtered list of HR and HR Managers
  //   emploading,
  //   error,
  // } = useEmployeesForDropdown();

  // const { fetchManager } = useGetDepartmentManager();

  const { departmentEmployees } = useDepartmentEmployees();
  const [isOpen, setIsOpen] = useState(false);
  const { createLeaveRequest } = useCreateLeaveRequest();
  const { updateLeaveRequest } = useUpdateLeaveRequest();
  const [selectedIds, setSelectedIds] = useState([]);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const closeModal = () => setIsOpen(false);
  const [viewOnlyMode, setViewOnlyMode] = useState(false);

  const handleCreate = () => {
    setSelectedLeaveId(null);
    setViewOnlyMode(false);
    setOpenFormModal(true);
  };

  const handleViewDetails = (row) => {
    // let response = leaveData.find((item) => item.id === row);
    // let arr = [response];
    setSelectedLeaveId(row);
    setViewOnlyMode(true);
    setOpenFormModal(true);
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Don't apply filters automatically
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0); // Reset page when searching
  };

  const handleApplyFilter = (newValues) => {
    const updatedFilters = { ...filters, ...newValues };
    setFilters(updatedFilters);
    setPage(0);
    refetch(updatedFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      is_start_half_day: false,
      is_end_half_day: false,
      status: "",
      type: "",
      leave_from: "",
      leave_to: "",
    };
    setFilters(resetFilters);
    setPage(0);
    refetch(resetFilters);
  };

  const handleCloseFormModal = () => setOpenFormModal(false);

  // Handlers must be defined here to access state
  // const handleEdit = (row) => {
  //   setSelectedLeaveId(row.id)
  //   setOpenFormModal(true)
  // }
  const handleDelete = async (row) => {
    // await updateLeaveRequest(row.id, { is_deleted: true });
    // refetch && refetch();
    setIsOpen(row);
  };
  const handleConfirm = async (row) => {
    setLoadingAction(true);
    try {
      let isManagerApprove = "pending";
      let isHRApprove = "pending";
      let isHRManagerApprove = "pending";
      if (user?.role) {
        // console.log({ user })
        if (user?.role?.includes("manager")) {
          isManagerApprove = "approved";
        } else if (user?.role?.includes("hr")) {
          isHRApprove = "approved";
        } else {
          isHRManagerApprove = "approved";
        }
      }
      const cancelLeave = {
        created_by: employeeId,
        updated_by: employeeId,
        start_date: isOpen.start_date,
        end_date: isOpen.end_date,
        // is_start_half_day: isOpen.is_start_half_day,
        // is_end_half_day: isOpen.is_end_half_day,
        status: "cancelation_pending",
        attachment_path: isOpen.attachment_path,
        leave_type: isOpen.leave_type,
        employee_id: isOpen.employee_id,
        vacation_phone_no: isOpen.vacation_phone_no,
        replacement_employee_id: isOpen.replacement_employee_id,
        email: isOpen.email,
        leave_type_id: isOpen.leave_type_id,
        reference_leave_id: isOpen.id,
        is_manager_approve: isManagerApprove,
        is_hr_approve: isHRApprove,
        is_hr_manager_approve: isHRManagerApprove,
      };
      const { error } = await createLeaveRequest(cancelLeave);
      if (error) throw error;
      refetch();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(false);
    }
  };

  const columns = [
    { key: "leave_type", label: "Leave Type" },
    { key: "start_date", label: "Leave From" },
    { key: "end_date", label: "Leave To" },
    { key: "created_at", label: "Request Date", type: "date" },
    // { key: "is_start_half_day", label: "Is Start Half Day?", type: "checkbox" },
    // { key: "is_end_half_day", label: "Is End Half Day?", type: "checkbox" },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "reason",
      label: "Reason to apply for leave",
      type: "description",
      render: (row) => row?.reason,
    },
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
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <CustomMenu
          items={[
            {
              disabled:
                row?.is_hr_manager_approve?.toLowerCase() === "approved" &&
                isFutureDate(row.start_date) &&
                !row?.reference_leave_id
                  ? false
                  : true,
              label: "Cancel",
              icon: <DeleteIcon fontSize="small" />,
              action: () => handleDelete(row),
              danger: true,
            },
          ]}
        />
      ),
    },
  ];

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  // console.log("hr", companyHRs);
  // console.log("user")

  const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
  

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      employee_id: employeeId,
      created_by: employeeId,
      updated_by: employeeId,
      status_workflow: workflow_employees
    };

    
    try {
      if (selectedLeaveId) {
        delete payload.created_by;
        await updateLeaveRequest(selectedLeaveId, payload);
      } else {
        await createLeaveRequest(payload);
        await transactionEmailSender(user, payload, "Leave Request", `${payload?.leave_type} Request`);
      }
      handleCloseFormModal();
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Leave Request"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Add Leave Request"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by reason or leave type..."
            />
            <div className="flex gap-4">
              <div className="w-[300px]">
                <SelectField
                  options={statusOptions}
                  placeholder="Status"
                  value={filters.status}
                  onChange={(value) => handleStatusChange(value)}
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
            // data={leaveData.map((row) => ({
            //   ...row,
            //   rejection_reason:
            //     row.status === "declined" ? row.rejection_reason || "-" : "-",
            // }))}
            data={leaveData.map((row) => ({
              ...row,
              rejection_reason:
                (row.rejection_reason ?? "").toString().trim() || "-",
            }))}
            footerInfo={`Leave Requests out of ${leaveData.length}`}
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
      <NewLeaveRequestForm
        onClose={handleCloseFormModal}
        open={openFormModal}
        id={selectedLeaveId}
        leaveData={leaveData}
        handleSubmit={handleSubmit}
        departmentEmployees={departmentEmployees}
        isViewOnly={viewOnlyMode}
        ownView={true}
        // createLeaveRequest={async (payload) => { await createLeaveRequest(payload);
        //   handleCloseFormModal();
        //   refetch(); }}
        // updateLeaveRequest={async (id, payload) => { await updateLeaveRequest(id, payload);
        //   handleCloseFormModal();
        //   refetch && refetch(); }}
        // refetch={refetch}
        loading={loading}
      />
      {isOpen && (
        <AlertModal
          open={!!isOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          type={"danger"}
          title={"Cancel Leave Request"}
          description={"Are you sure you want to cancel this leave request?"}
          buttonTitle={"Okay"}
          loading={loadingAction}
        />
      )}
    </React.Fragment>
  );
};

export default LeaveRequestPage;
