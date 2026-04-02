import React, { useState } from "react";
import "./style.css";
import NewLoanRequestForm from "./form";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchInput from "../../../../components/common/searchField";
import AllowanceRequestListForm from "./form";
import CustomMenu from '../../../../components/common/CustomMenu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAllowanceRequests, useCreateAllowanceRequest, useUpdateAllowanceRequest, useDeleteAllowanceRequest } from '../../../../utils/hooks/api/allowanceRequests';
import { useUser } from '../../../../context/UserContext';
import SelectField from "../../../../components/common/SelectField";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Allowance Request" },
];

const AllowanceRequestList = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
  });
  const { allowanceData, totalPages, loading, refetch } = useAllowanceRequests(page, searchQuery, filters, perPage);
  const { createAllowanceRequest } = useCreateAllowanceRequest();
  const { updateAllowanceRequest } = useUpdateAllowanceRequest();
  const { deleteAllowanceRequest } = useDeleteAllowanceRequest();

  const handleEdit = (row) => {
    setSelectedEditId(row.id);
    setOpenFormModal(true);
  };
  const handleDelete = async (row) => {
    // await deleteAllowanceRequest(row.id);
    // refetch();
  };
  const handleOpenForm = () => { setSelectedEditId(null); setOpenFormModal(true); };
  const handleCloseForm = () => { setOpenFormModal(false); refetch(); };
  const [selectedEditId, setSelectedEditId] = useState(null);
  const [openFormModal, setOpenFormModal] = useState(false);

  const columns = [
    { key: "amount", label: "Amount" },
    { key: "reason", label: "Reason", type: "description", render: row => row?.reason },
    { key: "requested_date", label: "Requested Date" },
    { key: "status", label: "Status", type: "chip" },
    { 
      key: "is_repeatable", 
      label: "Repeatable", 
      render: row => row?.is_repeatable ? "Yes" : "No"
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

    const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
  

  const handleSubmit = async(values, { setSubmitting }) => {
    const payload = {
      ...values,
      request_by_id: employeeId,
      created_by: employeeId,
      updated_by: employeeId,
      status_workflow: workflow_employees
    };

    
    
  
    await createAllowanceRequest(payload);
    await transactionEmailSender(user, payload, "Allowance Request", `Allowance Request`);
    handleCloseForm();
    refetch();
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }))
  }

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Allowance Request"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="New Request"
        Icon={AddIcon}
      >
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <SearchInput 
              value={searchQuery} 
              placeholder="Search by reason..."
              onChange={(value) => {
                setSearchQuery(value);
                setPage(0); 
              }} 
            />
            <div className="flex justify-end">
              <div className="w-[300px]">
                <SelectField 
                  options={[
                    { label: 'Pending', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Declined', value: 'declined' },
                  ]} 
                  placeholder="Status" 
                  value={filters.status}
                  onChange={(value) => handleStatusChange(value)}
                />
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={allowanceData}
            footerInfo={`Allowance Requests out of ${allowanceData?.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      <AllowanceRequestListForm
        open={openFormModal}
        onClose={handleCloseForm}
        id={selectedEditId}
        allowanceData={allowanceData}
       handleSubmit={handleSubmit}
       loading={loading}
      />
    </React.Fragment>
  );
};

export default AllowanceRequestList;
