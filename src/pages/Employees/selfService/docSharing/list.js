"use client"

import React, { useState, useEffect } from "react"
import "./style.css"
import DocumentForm from "./form"
import { Button, Chip } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DynamicTable from "../../../../components/tables/AnnouncementsTable"
import "./style.css"
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection"
import HomeIcon from "@mui/icons-material/Home"
import SearchField from "../../../../components/common/searchField"
import FiltersWrapper from "../../../../components/common/FiltersWrapper"
import ListFilter from "./filters"
import DeleteIcon from "@mui/icons-material/Delete"
import { useGeneralDocuments, useDeleteGeneralDocument } from "../../../../utils/hooks/api/useGeneralDocuments"
import { useOrganizationalUnits } from "../../../../utils/hooks/api/useOrganizationalUnits"
import { useUser } from "../../../../context/UserContext"
import { toast } from "react-hot-toast"
import EditIcon from "@mui/icons-material/Edit"
import CustomMenu from "../../../../components/common/CustomMenu"
import { ROLES } from "../../../../utils/constants"

const breadcrumbItems = [{ href: "/home", icon: HomeIcon }, { title: "Self Service" }, { title: "General Documents" }]

const DocumentsPage = () => {
  const { user } = useUser();
  const [selectedIds, setSelectedIds] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [openFormModal, setOpenFormModal] = useState(false)
  const [openFilters, setOpenFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [editingDocument, setEditingDocument] = useState(null)
  const [filters, setFilters] = useState({
    department_id: "",
    organization: "",
    status: "",
  })

  // Check if user has HR role
  const isHRUser = user?.role === 'hr' || user?.role === 'admin' || user?.role === 'hr_manager';


  // Use the general documents hook
  const { 
    documentsData, 
    totalPages, 
    loading, 
    refetch 
  } = useGeneralDocuments(currentPage, searchQuery, filters, perPage);

  // Use the delete hook
  const { deleteDocument, loading: deleteLoading } = useDeleteGeneralDocument();

  // Use the organizational units hook for departments
  const { organizationalUnits, loading: departmentsLoading } = useOrganizationalUnits();

  const columns = [
    { key: "title", label: "Document Title" },
    { key: "description", label: "Description", type: "description", render: row => row?.description },
    { 
      key: "created_at", 
      label: "Created On",
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    { 
      key: "created_by", 
      label: "Author",
      render: (row) => row.created_by_name || "N/A"
    },
    { 
      key: "department_id", 
      label: "Department",
      render: (row) => row.department_name || "N/A"
    },
    {
      key: "organization",
      label: "Organization",
      type: "custom",
      render: (row) => (
        <Chip
          label={row.organization ? "Departmental" : "General"}
          size="small"
          style={{
            backgroundColor: row.organization ? "#e3f2fd" : "#f3e5f5",
            color: row.organization ? "#1976d2" : "#7b1fa2",
            fontWeight: "500",
            fontSize: "12px",
          }}
        />
      ),
    },
    {
      key: "attachment_url",
      label: "Attachment",
      type: "custom",
      render: (row) => (
        row.attachment_url ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.open(row.attachment_url, '_blank')}
          >
            View Document
          </Button>
        ) : (
          <span className="text-gray-500 text-sm">-</span>
        )
      ),
    },
   
    ...(isHRUser ? [{
      type: 'custom',
      label: 'Actions',
      width: '10%',
      render: row => (
        <CustomMenu
          items={[
            {
              label: 'Edit',
              icon: <EditIcon fontSize='small' />,
              action: () => handleEdit(row),
            },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize='small' />,
              action: () => handleDelete(row.id),
              danger: true
            }
          ]}
        />
      )
    }] : []),
  ]

  const handleOpenForm = () => {
    setEditingDocument(null);
    setOpenFormModal(true);
  }

  const handleCloseForm = () => {
    setOpenFormModal(false);
    setEditingDocument(null);
  }

  const handleEdit = (document) => {
    setEditingDocument(document);
    setOpenFormModal(true);
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const result = await deleteDocument(id);
      if (result) {
        refetch();
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} document(s)?`)) {
      const result = await deleteDocument(selectedIds);
      if (result) {
        refetch();
        setSelectedIds([]);
      }
    }
  }

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilter = (newValues) => {
    setFilters(newValues);
    setCurrentPage(0);
  }

  const resetFilters = () => {
    setFilters({
      department_id: "",
      organization: "",
      status: "",
    });
    setCurrentPage(0);
  }

  const handleSubmit = () => {
    handleCloseForm();
    refetch();
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  }

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(0);
  }

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="General Documents"
        items={breadcrumbItems}
        action={isHRUser ? handleOpenForm : undefined}
        buttonTitle={isHRUser ? "Add General Document" : undefined}
        Icon={isHRUser ? AddIcon : undefined}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <DynamicTable
            columns={columns}
            data={documentsData}
            // showCheckbox={isHRUser}
            onSelectChange={(ids) => setSelectedIds(ids)}
            onAction={() => {}}
            footerInfo={`${documentsData.length} Documents out of ${documentsData.length}`}
            currentPage={currentPage}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <DocumentForm 
        open={openFormModal} 
        onClose={handleCloseForm} 
        handleSubmit={handleSubmit}
        editingDocument={editingDocument}
      />
    </React.Fragment>
  )
}

export default DocumentsPage
