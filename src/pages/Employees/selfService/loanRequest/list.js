import React, { useState } from "react";

import "./style.css";
import NewLoanRequestForm from "./form";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import {
  useLoanRequests,
  useDeleteLoanRequest,
  useUpdateLoanRequest,
  useCreateLoanRequest,
} from "../../../../utils/hooks/api/loanRequest";
import { useUser } from "../../../../context/UserContext";
import toast from "react-hot-toast";
import { useEmployeeRecord } from "../../../../context/EmployeeRecordContext";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Loan Request" },
];

const LoanRequestPage = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  // const [selectedIds, setSelectedIds] = useState([]);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    request_date: "",
    requested_amount: "",
  });

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    // Don't reset page or apply filters automatically
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0); // Reset page when searching
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Don't apply filters automatically
  };

  const handleApplyFilter = (newValues) => {
    const updatedFilters = { ...filters, ...newValues };
    setFilters(updatedFilters);
    setPage(0); // Reset to first page when applying filters
    refetch(updatedFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      status: "",
      request_date: "",
      requested_amount: "",
    };
    setFilters(resetFilters);
    setPage(0);
    refetch(resetFilters);
  };

  const { loanData, totalPages, loading, refetch } = useLoanRequests(
    page,
    searchQuery,
    filters,
    perPage,
    employeeId
  );

  const { createLoanRequest } = useCreateLoanRequest();
  const { updateLoanRequest } = useUpdateLoanRequest();
  // const { deleteLoanRequest } = useDeleteLoanRequest();

  const columns = [
    { key: "loan_type_id", label: "Loan Type" },
    { key: "request_date", label: "Request Date" },
    { key: "requested_amount", label: "Total Loan Amount" },
    { key: "reason", label: "Reason" },
    { key: "duration", label: "Duration Months" },
    { key: "status", label: "Status", type: "chip" },
    // {
    //   type: "custom",
    //   label: "Actions",
    //   width: "10%",
    //   render: row => (
    //     <CustomMenu
    //       items={[
    //         {
    //           label: "Edit",
    //           icon: <EditIcon fontSize="small" />,
    //           action: () => handleEdit(row),
    //         },
    //         {
    //           label: "Delete",
    //           icon: <DeleteIcon fontSize="small" />,
    //           action: () => handleDelete(row),
    //         },
    //       ]}
    //     />
    //   )
    // }
  ];

  const [selectedLoanId, setSelectedLoanId] = useState(null);

  // const handleEdit = (row) => {
  //   setSelectedLoanId(row.id);
  //   setOpenFormModal(true);
  // };

  const handleCreate = () => {
    setSelectedLoanId(null);
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => setOpenFormModal(false);

  // const handleDelete = async (row) => {
  //   // await deleteLoanRequest(row.id);
  //   // setLocalLoanData(prev => prev.filter(item => item.id !== row.id));
  //   console.log("row", row);
  // };

      const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();


  const handleSubmit = async (values, { setSubmitting }) => {


    try {
      // return;
      const payload = {
        ...values,
        employee_id: employeeId,
        created_by: employeeId,
        updated_by: employeeId,
        status_workflow: workflow_employees
      };



      try {
        if (selectedLoanId) {
          delete payload.created_by;
          await updateLoanRequest(selectedLoanId, payload);
        } else {
          await createLoanRequest(payload);
          await transactionEmailSender(user, payload, "Loan Request", `Loan Request`);
        }
        handleCloseFormModal();

        refetch();
      } catch (err) {
        console.error("Submission failed:", err);
      } finally {
        setSubmitting(false);
      }
    } catch (err) {
      toast.error(err?.message ?? "something went wrong");
    }
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Loan Request"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Add Loan Request"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by reason..."
            />
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
            data={loanData.map((row) => ({
              loan_type_id: row.loan_type_name,
              request_date: row.request_date,
              requested_amount: row.requested_amount,
              duration: row.duration,
              reason: row.reason,
              status: row.status,
            }))}
            footerInfo={`Loan Requests out of ${loanData?.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <NewLoanRequestForm
        open={openFormModal}
        onClose={handleCloseFormModal}
        id={selectedLoanId}
        loanData={loanData}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </React.Fragment>
  );
};

export function LoanRequestPage2() {
  const { record } = useEmployeeRecord();
  // console.log("record in loan", record);
  // const { user } = useUser();
  // console.log("user", user);
  const employeeId = record?.id;
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  // const [selectedIds, setSelectedIds] = useState([]);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    request_date: "",
    requested_amount: "",
  });

  const statusOptions = [
    { label: "Pending", value: "pending" },
    // { label: "Approved", value: "approved" },
    // { label: "Declined", value: "declined" },
  ];

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    // Don't reset page or apply filters automatically
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0); // Reset page when searching
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Don't apply filters automatically
  };

  const handleApplyFilter = (newValues) => {
    const updatedFilters = { ...filters, ...newValues };
    setFilters(updatedFilters);
    setPage(0); // Reset to first page when applying filters
    refetch(updatedFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      status: "",
      request_date: "",
      requested_amount: "",
    };
    setFilters(resetFilters);
    setPage(0);
    refetch(resetFilters);
  };

  const { loanData, totalPages, loading, refetch } = useLoanRequests(
    page,
    searchQuery,
    filters,
    perPage,
    employeeId
  );

  const columns = [
    { key: "loan_type_id", label: "Loan Type" },
    { key: "request_date", label: "Request Date" },
    { key: "requested_amount", label: "Total Loan Amount" },
    { key: "reason", label: "Reason" },
    { key: "duration", label: "Duration Months" },
    { key: "status", label: "Status", type: "chip" },
    // {
    //   type: "custom",
    //   label: "Actions",
    //   width: "10%",
    //   render: row => (
    //     <CustomMenu
    //       items={[
    //         {
    //           label: "Edit",
    //           icon: <EditIcon fontSize="small" />,
    //           action: () => handleEdit(row),
    //         },
    //         {
    //           label: "Delete",
    //           icon: <DeleteIcon fontSize="small" />,
    //           action: () => handleDelete(row),
    //         },
    //       ]}
    //     />
    //   )
    // }
  ];

  return (
    <React.Fragment>
      {/* <PageWrapperWithHeading
        title="Loan Request"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Add Loan Request"
        Icon={AddIcon}
      > */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by reason..."
          />
          {/* <div className="flex gap-4">
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
          data={loanData.map((row) => ({
            loan_type_id: row.loan_type_name,
            request_date: row.request_date,
            requested_amount: row.requested_amount,
            duration: row.duration,
            reason: row.reason,
            status: row.status,
          }))}
          footerInfo={`Loan Requests out of ${loanData?.length}`}
          currentPage={page + 1}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={(p) => setPage(p - 1)}
          onPerPageChange={setPerPage}
          loading={loading}
        />
      </div>
      {/* </PageWrapperWithHeading> */}
      {/* <NewLoanRequestForm
        open={openFormModal}
        onClose={handleCloseFormModal}
        id={selectedLoanId}
        loanData={loanData}
        handleSubmit={handleSubmit}
        loading={loading}
      /> */}
    </React.Fragment>
  );
}

export default LoanRequestPage;
