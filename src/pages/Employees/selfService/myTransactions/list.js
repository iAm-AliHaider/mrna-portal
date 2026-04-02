// MyTransactionsPage.js
import React, { useState } from "react";
// import { Button } from '@mui/material'
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  useEsclateRequest,
  useMyTransactionsList,
  useSendReminder,
} from "../../../../utils/hooks/api/transaction";
import {
  TRANSACTION_TYPE_MAP,
  TRANSACTION_TYPE_TABS,
} from "../../../../utils/constants";
import ReminderModal from "./reminderModal";
import EscalateModal from "./esclateModal";
import ApprovalHistoryModal from "./approvalHistoryModal";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "My Transactions" },
];

const MyTransactionsPage = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [reportType, setReportType] = useState("loan_requests");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(4);
  const [searchQuery, setSearchQuery] = useState("");
  const [remindSelected, setRemindSelected] = useState(null);
  const [escalateSelected, setEsclateSelected] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    is_approved: false,
    status: "",
    created_from: "",
    created_to: "",
  });

  const { transactionsData, totalPages, count, loading, refetch } =
    useMyTransactionsList(
      currentPage - 1,
      perPage,
      searchQuery,
      reportType,
      employeeId
    );

  // console.log("fetched suggestions", transactionsData);

  const { sendReminder, loading: reminderLoading } =
    useSendReminder(reportType);
  const { esclateRequest, loading: escalateLoading } =
    useEsclateRequest(reportType);


  const columns = [
    // {
    //   key: 'employee_number',
    //   label: 'Employee Number',
    //   render: row => <div>{row?.employees?.employee_code}</div>,
    //   type: 'custom'
    // },
    {
      key: "transaction",
      label: "Transaction",
      type: "description",
      render: (row) => {
        if (reportType === "suggestion_request") {
          return <span className="capitalize">{row?.report_type}</span>;
        }
        else if (reportType === "document_requests") {
          return <span className="capitalize">{row?.custom_title}</span>;
        } else {
          return (
            <span>
              {TRANSACTION_TYPE_MAP[reportType]?.title}-
              {row?.reason ||
                row?.resignation ||
                row?.description ||
                row?.notes}
            </span>
          );
        }
      },
    },
    // { key: 'type', label: 'Type' },
    { key: "created_at", label: "Creation Date", type: "date" },
    { key: "updated_at", label: "Last Updated", type: "date" },

    { key: "status", label: "Approval Status", type: "chip" },
    // Add rejection reason column
    {
      key: "rejection_reason",
      label:
        reportType === "business_travels"
          ? "Exempted Reason"
          : "Rejection Reason",
      type: "description",
      render: (row) => {
        // if (row?.report_type === "grievance") console.log(row.escalated);

        if (reportType === "business_travels") {
          return row.exempted_reason ? (
            <span>{row.exempted_reason}</span>
          ) : null;
        } else {
          return row.rejection_reason ? (
            <span>{row.rejection_reason}</span>
          ) : null;
        }
      },
    },
    {
      key: "approvalHistory",
      label: "View Approval History",
      type: "custom",
      render: (row) => (
        <Button
          size="small"
          variant="contained"
          onClick={() => setSelected(row)}
        >
          View
        </Button>
      ),
    },
    {
      key: "escalate",
      label: "Escalate",
      type: "custom",
      render: (row) => {
        if (
          row?.report_type === "grievance" ||
          row?.report_type === "suggestion"
        ) {
          return row?.escalated ? (
            "Yes"
          ) : (
            <Button
              size="small"
              // Enable only when reminder_count < 2 AND status is accepted
              disabled={row?.reminder_count < 2}
              variant="contained"
              onClick={() => setEsclateSelected(row)}
            >
              Escalate
            </Button>
          );
        }

        // For other report types (keeping your existing rejected rule)
        return row?.escalated ? (
          "Yes"
        ) : (
          <Button
            size="small"
            disabled={row?.reminder_count < 2 || row?.status === "approved" || row?.status === "rejected"}
            variant="contained"
            onClick={() => setEsclateSelected(row)}
          >
            Escalate
          </Button>
        );
      },
    },
    {
      key: "remind",
      label: "Remind",
      type: "custom",
      render: (row) => {
        if (
          row?.report_type === "grievance" ||
          row?.report_type === "suggestion"
        ) {
          return (
            <Button
              size="small"
              variant="contained"
              onClick={() => setRemindSelected(row)}
              // disabled={!(row?.reminder_count < 2) && row.status === "accepted"}
              disabled={row?.reminder_count > 2}
            >
              Remind
            </Button>
          );
        }

        return (
          <Button
            size="small"
            variant="contained"
            onClick={() => setRemindSelected(row)}
            disabled={row?.reminder_count < 2 && row.status === "rejected"}
          >
            Remind
          </Button>
        );
      },
    },
  ];

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
    // Refetch data with new filters
    refetch({ ...filters, ...newValues });
  };

  const resetFilters = () => {
    const resetFilters = {
      is_approved: false,
      status: "",
      created_from: "",
      created_to: "",
    };
    setFilters(resetFilters);
    // Refetch data with reset filters
    refetch(resetFilters);
  };

  const handleToggleChange = (_, newType) => {
    if (newType) {
      setReportType(newType);
      setCurrentPage(1);
    }
  };

  const closeRemiderModal = () => setRemindSelected(null);
  const closeEsclateModal = () => setEsclateSelected(null);
  const closeHistoryModal = () => setSelected(null);

  const hanldeSendReminder = async () => {
    await sendReminder(remindSelected, refetch);
    closeRemiderModal();
  };

  const handleEscalateRequest = async () => {
  if (!escalateSelected) return;
  await esclateRequest(escalateSelected, refetch);
  closeEsclateModal();
};


  return (
    <React.Fragment>
      <PageWrapperWithHeading title="My Transactions" items={breadcrumbItems}>
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-end">
            <ToggleButtonGroup
              value={reportType}
              exclusive
              onChange={handleToggleChange}
              size="small"
            >
              {TRANSACTION_TYPE_TABS.map((tab) => (
                <ToggleButton key={tab.value} value={tab.value}>
                  {tab.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(0); // Reset to first page when search changes
              }}
            />
            <div className="flex gap-4">
              {/* <div className='w-[300px]'>
                <SelectField options={[]} placeholder='Employee Number' />
              </div> */}
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
                {/* <Button variant='outlined' disabled>
                Delete
              </Button> */}
              </div>
            </div>
          </div>
          <DynamicTable
            columns={columns}
            data={transactionsData}
            onAction={() => {}}
            footerInfo={`Showing ${transactionsData.length} of ${count} Transactions`}
            currentPage={currentPage}
            totalPages={totalPages || 1}
            perPage={perPage}
            onPageChange={(p) => setCurrentPage(p)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <ReminderModal
        open={!!remindSelected}
        onClose={closeRemiderModal}
        onSendReminder={hanldeSendReminder}
        loading={reminderLoading}
      />
      <EscalateModal
        open={!!escalateSelected}
        onClose={closeEsclateModal}
        onEsclate={handleEscalateRequest}
        loading={escalateLoading}
      />
      <ApprovalHistoryModal
        open={!!selected}
        onClose={closeHistoryModal}
        data={selected}
      />
    </React.Fragment>
  );
};

export default MyTransactionsPage;
