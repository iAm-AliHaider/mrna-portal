import React, { useState, useEffect } from "react";
import "./style.css";
import NewTerminationRequestForm from "./form";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchField from "../../../../components/common/searchField";
// import FiltersWrapper from '../../../../components/common/FiltersWrapper'
import SelectField from "../../../../components/common/SelectField";
// import ListFilter from "./filters";
// import CustomMenu from "../../../../components/common/CustomMenu";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
import {
  useTerminationRequests,
  useCreateTerminationRequest,
} from "../../../../utils/hooks/api/terminationRequests";
import { useUser } from "../../../../context/UserContext";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { useGetDepartmentHeads } from "../../../../utils/hooks/api/emplyees";
import { transactionEmailSender } from "../../../../utils/helper";


const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Termination Request" },
];

const TerminationRequestPage = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
  });

  const { terminationData, totalPages, loading, refetch } =
    useTerminationRequests(page, searchQuery, filters, perPage);
  const { createTerminationRequest } = useCreateTerminationRequest();
  // const { data: employees = [], loading: employeesLoading } = useEmployees();

  // const [selectedIds, setSelectedIds] = useState([])
  const [openFormModal, setOpenFormModal] = useState(false);
  const [localTerminationData, setLocalTerminationData] = useState([]);

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  // useEffect(() => {
  //   setLocalTerminationData(terminationData || [])
  //   if(employees && terminationData){

  //   }
  // }, [terminationData, employees])

  useEffect(() => {
    if (terminationData) {
    }
  }, [terminationData]);

  const columns = [
    {
      key: "employee_id",
      label: "Employee",
      type: "custom",
      render: (row) => {
        const first = row?.employee?.candidate?.first_name ?? "";
        const last = row?.employee?.candidate?.family_name ?? "";
        const full = `${first} ${last}`.trim();
        return full || "-";
      },
    },
    { key: "subject", label: "Subject" },
    { key: "effected_date", label: "Effected Date" },
    { key: "termination", label: "Termination" },
    { key: "last_working_date", label: "Last Working Date" },
    {
      key: "attachment",
      label: "Attachment",
      type: "custom",
      render: (row) =>
        row.attachment ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.open(row.attachment, "_blank")}
          >
            View Attachment
          </Button>
        ) : (
          "-"
        ),
    },
    { key: "status", label: "Status", type: "chip" },
  ];

  const [selectedTerminationId, setSelectedTerminationId] = useState(null);

  // const handleEdit = row => {
  //   setSelectedTerminationId(row.id)
  //   setOpenFormModal(true)
  // }

  const handleCreate = () => {
    setSelectedTerminationId(null);
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
  };

            const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
    const { heads, fetchDepartmentHeads } = useGetDepartmentHeads();

  

  const handleSubmit = async (values, { setSubmitting }) => {

       
  const org_id = values.organizational_unit_id
    // Fetch both Manager & HOD
    const { manager, hod } = await fetchDepartmentHeads(org_id);

     // Remove organizational_unit_id from payload
    const { organizational_unit_id, ...restValues } = values;

     // Update workflow
    const updatedWorkflow = (workflow_employees || []).map((emp) => {
      let updatedEmp = { ...emp, status: "pending" }; // set all to pending

      // If manager found → update only that object
      if (emp.role === "manager" && manager) {
        updatedEmp.id = manager.id || null;
        updatedEmp.name = manager.candidates?.first_name || "Manager";
            }

      // If HOD found → update only that object
      if (emp.role === "hod" && hod) {
        updatedEmp.id = hod.id || null;
        updatedEmp.name = hod.candidates?.first_name || "HOD";

      }

      // If manager/hod is null → do NOT modify that role object at all
      return updatedEmp;
    });

    const payload = {
      ...restValues,
      // employee_id: employeeId,
      created_by: employeeId,
      updated_by: employeeId,
      status_workflow : updatedWorkflow

    };



    try {
      await createTerminationRequest(payload);
      await transactionEmailSender(user, payload, "New Termination Request", `New Termination Request`);
      
      handleCloseFormModal();
      refetch();
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Termination Request"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Add Termination Request"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setPage(0); // Reset to first page when search changes
              }}
            />
            <div className="w-[300px]">
              <SelectField
                options={statusOptions}
                placeholder="Status"
                value={filters.status}
                onChange={(value) => handleStatusChange(value)}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={terminationData}
            footerInfo={`Termination Requests out of ${terminationData.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <NewTerminationRequestForm
        open={openFormModal}
        onClose={handleCloseFormModal}
        id={selectedTerminationId}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </React.Fragment>
  );
};

export default TerminationRequestPage;
