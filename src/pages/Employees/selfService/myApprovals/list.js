// MyApprovalsPage.js
import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import { useMyApprovalsList } from "../../../../utils/hooks/api/approvals";
import ApprovalStepper from "../../../../components/common/ApprovalHistory";
import {
  APPROVALS_TYPE_TABS,
  TRANSACTION_TYPE_MAP,
} from "../../../../utils/constants";
import { useEmployeesData } from "../../../../utils/hooks/api/emplyees";
import ActionPermissionWrapper from "./ActionPermissionWrapper";
import { useTransactionColumns } from "../../../../utils/hooks/useTransactionColumns";
import NewDocumentForm from "../documentsRequests/form";
import { useSingleMyDocument } from "../../../../utils/hooks/api/documents";
import NewLeaveRequestForm from "../leaveRequest/form";
import UpdateEffectiveDate from "../resignationRequest/updateEffectiveDate";


const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "My Approvals" },
];

const MyApprovalsPage = () => {
  const [reportType, setReportType] = useState("loan_requests");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(4);
  const [empCode, setEmpCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewOnlyMode, setViewOnlyMode] = useState(true);
  const [openFormModal, setOpenFormModal] = useState(false);
    const [openUpdateDateModal, setOpenUpdateDateModal] = useState(false);

  const [resData, setResData] = useState(null);
  const [filters, setFilters] = useState({
    is_approved: false,
    status: "",
    creation_date: "",
    last_update: "",
  });

  const { approvalsData, totalPages, count, loading, refetch } =
    useMyApprovalsList(
      currentPage - 1,
      perPage,
      searchQuery,
      reportType,
      empCode
    );
    
  // console.log({ approvalsData });
  const { getMyDocument } = useSingleMyDocument();
  const { data, loading: empLoading } = useEmployeesData();


  // console.log("-------------", reportType);

  const onDocumentRowClick = async (row) => {
    // console.log("Report clicked:", reportType);
    // console.log("row clicked:", row);
    if (reportType === "event_request" || reportType === "suggestion_request" || reportType === "loan_requests" || reportType === "resignation_request") {
    } else {
      let response;
      
      if (reportType === "leave_requests") {
        // console.log("Leave request clicked", approvalsData);
        // console.log("Row clicked:", row);
        response = approvalsData.find((item) => item.id === row);
      } else {
        response = await getMyDocument(row);
      }

      // setEditDoc(row);
      setViewOnlyMode(true);
      setOpenFormModal(true);
      setResData(response);
    }
  };

      const onMasterDataRowClick = async (row) => {
   
  };


    const onEffectedDateChange = async (row) => {
      setOpenUpdateDateModal(true);
            setResData(row);

  };

const transactionColumns = useTransactionColumns(
  reportType,
  {
    onDocumentRowClick,
    onMasterDataRowClick,
    onEffectedDateChange,
  }
);



  // const transactionColumns = useTransactionColumns(
  //   reportType,
  //   onDocumentRowClick,
  //   onMasterDataRowClick,
  //   onEffectedDateChange
  // );

  const handleCloseForm = () => {
    setOpenFormModal(false);
  };

    const handleCloseDateForm = () => {
    setOpenUpdateDateModal(false);

    refetch();
  };

  const columns = [
    ...(reportType === "event_request" || reportType === "suggestion_request"
      ? []
      : [
          {
            key: "employee_number",
            label: "Employee Name",
            type: "custom",
            render: (row) => (
              <span>{`${row?.employee?.candidate?.first_name || ""} ${
                row?.employee?.candidate?.family_name || ""
              }`}</span>
            ),
          },
        ]),
    ...(reportType === "event_request" || reportType === "suggestion_request"
      ? []
      : [
          {
            key: "reason",
            label: "Description",
            type: "description",
            render: (row) => (
              <span>
                {TRANSACTION_TYPE_MAP[reportType]?.title}
                {" - "}
                {row?.reason ??
                  row?.resignation ??
                  row?.description ??
                  row?.notes ??
                  row?.custom_details}
              </span>
            ),
          },
        ]),

    ...transactionColumns,
    {
      key: "escalated",
      label: "Escalated",
      type: "custom",
      render: (row) => (row.escalated ? "Yes" : "No"),
    },
    { key: "status", label: "Approval Status", type: "chip" },
    { key: "updated_at", label: "Last Updated", type: "date" },
    // { key: 'transactionStatus', label: 'Transaction Status', type: 'progress' },
    // {
    //   key: "history",
    //   label: "Approval History",
    //   type: "custom",
    //   width: "250px",
    //   render: (row) => <ApprovalStepper {...row} />,
    // },
    {
  key: "history",
  label: "Approval History",
  type: "custom",
  width: "250px",
  render: (row) => (
    <ApprovalStepper status_workflow={row.status_workflow || []} />
  ),
},
    {
      key: "action",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <ActionPermissionWrapper
          refetch={refetch}
          row={row}
          reportType={reportType}
        />
      ),
    },
  ];

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = () => {
    refetch(filters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      is_approved: false,
      status: "all",
      creation_date: "",
      last_update: "",
    });
    refetch();
  };
  const handleToggleChange = (_, newType) => {
    if (newType) {
      setReportType(newType);
      setCurrentPage(1);
    }
  };

  const handleQueryChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDetailView = (row) => {
    alert("Row clicked: " + row.id);
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading title="My Approvals" items={breadcrumbItems}>
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-end">
            <ToggleButtonGroup
              value={reportType}
              exclusive
              onChange={handleToggleChange}
              size="small"
            >
              {APPROVALS_TYPE_TABS.map((tab) => (
                <ToggleButton key={tab.value} value={tab.value}>
                  {tab.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField value={searchQuery} onChange={handleQueryChange} />
            <div className="flex gap-4">
              <div className="w-[300px]">
                <SelectField
                  options={data}
                  placeholder="Employee Number"
                  getOptionLabel={(option) =>
                    `${option?.employee_code} - ${option?.first_name || ""} ${
                      option?.family_name || ""
                    }`
                  }
                  onChange={(value) => setEmpCode(value)}
                  value={empCode}
                  loading={empLoading}
                  selectKey="employee_code"
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
            data={approvalsData}
            onAction={() => {}}
            footerInfo={`Showing ${approvalsData.length} of ${count} Approvals`}
            currentPage={currentPage}
            totalPages={totalPages || 1}
            perPage={perPage}
            onPageChange={(p) => setCurrentPage(p)}
            onPerPageChange={setPerPage}
            onRowClick={onDocumentRowClick}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      {resData?.id && (
        <NewDocumentForm
          open={openFormModal}
          onClose={handleCloseForm}
          // onSubmit={handleFormSubmit}
          editDoc={null}
          loading={loading}
          isViewOnly={viewOnlyMode}
          resData={resData}
          setResData={setResData}
        />
      )}
      {resData?.id && reportType === "leave_requests" && (
        <NewLeaveRequestForm
          onClose={handleCloseForm}
          open={openFormModal}
          id={resData?.id}
          leaveData={approvalsData}
          handleSubmit={() => {}}
          // departmentEmployees={departmentEmployees}
          isViewOnly={viewOnlyMode}
          loading={loading}
        />
      )}


            {resData?.id && reportType === "resignation_request" && (
        <UpdateEffectiveDate
          onClose={handleCloseDateForm}
          open={openUpdateDateModal}
          id={resData?.id}
          data={resData}
          handleSubmit={() => {}}
          isViewOnly={viewOnlyMode}
          loading={loading}
        />
      )}
      
    </React.Fragment>
  );
};

export default MyApprovalsPage;
