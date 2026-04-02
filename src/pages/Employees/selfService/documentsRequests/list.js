// pages/admin/human-resource/self-service/my-documents/index.tsx

"use client";

import React, { useEffect, useState } from "react";
import "./style.css";
import NewDocumentForm from "./form";
import { Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import {
  useMyDocuments,
  useMyDocuments2,
  useCreateMyDocument,
  useUpdateMyDocument,
  useDeleteMyDocument,
  useSingleMyDocument,
  useMrnaPaidDocument,
} from "../../../../utils/hooks/api/documents";
import { useUser } from "../../../../context/UserContext";
import CustomMenu from "../../../../components/common/CustomMenu";
import SelectField from "../../../../components/common/SelectField";
import toast from "react-hot-toast";
import { useLeaveRequests } from "../../../../utils/hooks/api/leaveRequests";
import { useEmployeeRecord } from "../../../../context/EmployeeRecordContext";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Documents" },
];

const DocumentsRequests = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [filters, setFilters] = useState({
    is_start_half_day: false,
    is_end_half_day: false,
    status: "",
    type: "",
    leave_from: "",
    leave_to: "",
  });
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const { user } = useUser();
  const employeeId = user?.id;
  const [resData, setResData] = useState(null);

  const {
    documents: data,
    totalPages,
    count,
    loading,
    refetch,
  } = useMyDocuments(page, searchQuery, filters, perPage);

  const { getMyDocument } = useSingleMyDocument();

  const { createMyDocument, loading: loadingCreate } = useCreateMyDocument();
  const { updateMyDocument, loading: loaingUpdate } = useUpdateMyDocument();
  const { deleteMyDocument, loading: loadingDelete } = useDeleteMyDocument();
  const { checkMrnaFeeAllowedForEmployee, loading: loadingMarnaPaidCheck } =
    useMrnaPaidDocument();

  const [pageLeave, setPageLeave] = useState(0);
  const [perPageLeave, setPerPageLeave] = useState(10);
  const [searchQueryLeave, setSearchQueryLeave] = useState("");
  const [filtersLeave, setFiltersLeave] = useState({
    is_start_half_day: false,
    is_end_half_day: false,
    status: "",
    type: "",
    leave_from: "",
    leave_to: "",
  });

  const { leaveData, refetch: fetchLeaveRequests } = useLeaveRequests(
    pageLeave,
    searchQueryLeave,
    filtersLeave,
    perPageLeave
  );

  const [viewOnlyMode, setViewOnlyMode] = useState(false);

  const [annualLeaveData, setAnnualLeaveData] = useState([]);

  useEffect(() => {
    if (Array.isArray(leaveData) && leaveData.length > 0) {
      const filtered = leaveData.filter(
        (leave) => leave.leave_type === "Annual Leave"
      );
      setAnnualLeaveData(filtered);

    }
  }, [leaveData]);

  const columns = [
    {
      key: "custom_title",
      label: "Title",
      type: "description",
      render: (row) => row?.custom_title,
    },
    {
      key: "document_type",
      label: "Document Type",
      type: "custom",
      render: (row) => (
        <div className="capitalize">
          {row?.document_type ? row?.document_type?.replace("_", " ") : ""}
        </div>
      ),
    },
    {
      key: "file_name",
      label: "File Name",
      type: "custom",
      render: (row) => (
        <span className="capitalize">
          {row?.file_path ? row?.file_path?.split("/")?.pop() : ""}
        </span>
      ),
    },
    // { key: 'file_path', label: 'File Path' },
    {
      key: "attachment",
      label: "Attachment",
      type: "custom",
      render: (row) =>
        row?.file_path ? (
          <a href={row?.file_path} target="_blank" rel="noopener noreferrer">
            <Button variant="outlined" size="small">
              Attachment
            </Button>
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
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
    //           action: () => {
    //             setEditDoc(row)
    //             setOpenFormModal(true)
    //           }
    //         },
    //         {
    //           label: 'Delete',
    //           icon: <DeleteIcon fontSize='small' />,
    //           action: () => deleteMyDocument(row?.id),
    //           danger: true
    //         }
    //       ]}
    //     />
    //   )
    // }
  ];

  const handleOpenForm = () => {
    setEditDoc(null);
    setOpenFormModal(true);
  };

  const handleCloseForm = () => {
    setEditDoc(null);
    setViewOnlyMode(false);
    setOpenFormModal(false);
    setResData(null);
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
  };

  const resetFilters = () => {
    setFilters({
      is_start_half_day: false,
      is_end_half_day: false,
      status: "",
      type: "",
      leave_from: "",
      leave_to: "",
    });
  };

  const handleDelete = async (id) => {
    await deleteMyDocument(id);
    setSelectedIds([]);
    refetch();
  };

    const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();


  const handleFormSubmit = async (values) => {
    if (values.fees_paid_by === "mrna_paid") {
      const allowed = await checkMrnaFeeAllowedForEmployee(employeeId);
      if (!allowed) {
        toast.error(
          `You already availed this facility with in an year from Mrna`
        );
        return; // block submit
      }
    }

    const today = new Date()?.toISOString()?.split("T")[0];

    const payload = {
      ...values,
      author_id: employeeId,
      created_by: employeeId,
      updated_by: employeeId,
      created_on: today,
    };

    payload.status = "pending";

 
    if (user?.role === "hr_manager") {
      payload.status = "approved";
    }

    if (editDoc && editDoc?.id) {
      await updateMyDocument(editDoc?.id, payload);
    } else {
            payload.status_workflow = workflow_employees

      await createMyDocument(payload);
      
      let subject = `${payload?.document_type.split("_").join(" ")} request`;
      subject = subject.charAt(0).toUpperCase() + subject.slice(1);
      await transactionEmailSender(user, payload, "Documents Request", subject);
    }
    setOpenFormModal(false);
    setEditDoc(null);
    refetch();
  };

  // const handleCloseForm = () => {
  //   setOpenFormModal(false);
  //   setEditDoc(null);
  //   setViewOnlyMode(false);
  // };

  return (
    <>
      <PageWrapperWithHeading
        title="Document Request"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="Add Document"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField value={searchQuery} onChange={setSearchQuery} />
            <div className="flex gap-4">
              <div className="w-[300px]">
                <SelectField
                  options={[
                    { label: "Pending", value: "pending" },
                    { label: "Approved", value: "approved" },
                    { label: "Declined", value: "declined" },
                  ]}
                  placeholder="Status"
                  value={filters.status}
                  onChange={(value) => handleChangeFilter("status", value)}
                />
              </div>
              {/* <div className='filter-buttons'>
                <FiltersWrapper
                  onApplyFilters={handleApplyFilter}
                  resetFilters={resetFilters}
                >
                  <ListFilter
                    values={filters}
                    label='Type'
                    options={[]}
                    handleChange={handleChangeFilter}
                    placeholder='Select Type'
                  />
                </FiltersWrapper>
              </div> */}
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Documents out of ${count}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
            onRowClick={async (row) => {
              setEditDoc(row);
              setViewOnlyMode(true);
              setOpenFormModal(true);
              const response = await getMyDocument(row);
              setResData(response);
            }}
          />
        </div>
      </PageWrapperWithHeading>
      <NewDocumentForm
        open={openFormModal}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editDoc={editDoc}
        loading={loading}
        isViewOnly={viewOnlyMode}
        resData={resData}
        setResData={setResData}
        annualLeaveData={annualLeaveData}
      />
    </>
  );
};

export const DocumentsRequests2 = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [filters, setFilters] = useState({
    is_start_half_day: false,
    is_end_half_day: false,
    status: "",
    type: "",
    leave_from: "",
    leave_to: "",
  });
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  // const { user } = useUser();
  // const employeeId = user?.id;
  const { record } = useEmployeeRecord();

  const employeeId = record?.id;

  const [resData, setResData] = useState(null);

  const {
    documents: data,
    totalPages,
    count,
    loading,
    refetch,
  } = useMyDocuments2(page, searchQuery, filters, perPage);

  const { getMyDocument } = useSingleMyDocument();

  const { createMyDocument, loading: loadingCreate } = useCreateMyDocument();
  const { updateMyDocument, loading: loaingUpdate } = useUpdateMyDocument();
  const { deleteMyDocument, loading: loadingDelete } = useDeleteMyDocument();
  const { checkMrnaFeeAllowedForEmployee, loading: loadingMarnaPaidCheck } =
    useMrnaPaidDocument();

  const [pageLeave, setPageLeave] = useState(0);
  const [perPageLeave, setPerPageLeave] = useState(10);
  const [searchQueryLeave, setSearchQueryLeave] = useState("");
  const [filtersLeave, setFiltersLeave] = useState({
    is_start_half_day: false,
    is_end_half_day: false,
    status: "",
    type: "",
    leave_from: "",
    leave_to: "",
  });

  const { leaveData, refetch: fetchLeaveRequests } = useLeaveRequests(
    pageLeave,
    searchQueryLeave,
    filtersLeave,
    perPageLeave
  );

  const [viewOnlyMode, setViewOnlyMode] = useState(false);

  const [annualLeaveData, setAnnualLeaveData] = useState([]);

  useEffect(() => {
    if (Array.isArray(leaveData) && leaveData.length > 0) {
      const filtered = leaveData.filter(
        (leave) => leave.leave_type === "Annual Leave"
      );
      setAnnualLeaveData(filtered);

    }
  }, [leaveData]);

  const columns = [
    {
      key: "custom_title",
      label: "Title",
      type: "description",
      render: (row) => row?.custom_title,
    },
    {
      key: "document_type",
      label: "Document Type",
      type: "custom",
      render: (row) => (
        <div className="capitalize">
          {row?.document_type ? row?.document_type?.replace("_", " ") : ""}
        </div>
      ),
    },
    {
      key: "file_name",
      label: "File Name",
      type: "custom",
      render: (row) => (
        <span className="capitalize">
          {row?.file_path ? row?.file_path?.split("/")?.pop() : ""}
        </span>
      ),
    },
    // { key: 'file_path', label: 'File Path' },
    {
      key: "attachment",
      label: "Attachment",
      type: "custom",
      render: (row) =>
        row?.file_path ? (
          <a href={row?.file_path} target="_blank" rel="noopener noreferrer">
            <Button variant="outlined" size="small">
              Attachment
            </Button>
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
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
    //           action: () => {
    //             setEditDoc(row)
    //             setOpenFormModal(true)
    //           }
    //         },
    //         {
    //           label: 'Delete',
    //           icon: <DeleteIcon fontSize='small' />,
    //           action: () => deleteMyDocument(row?.id),
    //           danger: true
    //         }
    //       ]}
    //     />
    //   )
    // }
  ];

  const handleOpenForm = () => {
    setEditDoc(null);
    setOpenFormModal(true);
  };

  const handleCloseForm = () => {
    setEditDoc(null);
    setViewOnlyMode(false);
    setOpenFormModal(false);
    setResData(null);
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
  };

  const resetFilters = () => {
    setFilters({
      is_start_half_day: false,
      is_end_half_day: false,
      status: "",
      type: "",
      leave_from: "",
      leave_to: "",
    });
  };

  // const handleCloseForm = () => {
  //   setOpenFormModal(false);
  //   setEditDoc(null);
  //   setViewOnlyMode(false);
  // };

  return (
    <>
      {/* <PageWrapperWithHeading
        title="Document Request"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="Add Document"
        Icon={AddIcon}
      > */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <SearchField value={searchQuery} onChange={setSearchQuery} />
          <div className="flex gap-4">
            {/* <div className="w-[300px]">
              <SelectField
                options={[
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Declined", value: "declined" },
                ]}
                placeholder="Status"
                value={filters.status}
                onChange={(value) => handleChangeFilter("status", value)}
              />
            </div> */}
            {/* <div className='filter-buttons'>
                <FiltersWrapper
                  onApplyFilters={handleApplyFilter}
                  resetFilters={resetFilters}
                >
                  <ListFilter
                    values={filters}
                    label='Type'
                    options={[]}
                    handleChange={handleChangeFilter}
                    placeholder='Select Type'
                  />
                </FiltersWrapper>
              </div> */}
          </div>
        </div>

        <DynamicTable
          columns={columns}
          data={data}
          footerInfo={`Documents out of ${count}`}
          currentPage={page + 1}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={(p) => setPage(p - 1)}
          onPerPageChange={setPerPage}
          loading={loading}
          onRowClick={async (row) => {
            setEditDoc(row);
            setViewOnlyMode(true);
            setOpenFormModal(true);
            const response = await getMyDocument(row);
            setResData(response);
          }}
        />
      </div>
      {/* </PageWrapperWithHeading> */}
      {/* <NewDocumentForm
        open={openFormModal}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editDoc={editDoc}
        loading={loading}
        isViewOnly={viewOnlyMode}
        resData={resData}
        setResData={setResData}
        annualLeaveData={annualLeaveData}
      /> */}
    </>
  );
};

export default DocumentsRequests;
