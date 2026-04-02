"use client"

import React, { useState, useEffect } from "react"
import { Button, Chip } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import DynamicTable from "../../../../components/tables/AnnouncementsTable"
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection"
import HomeIcon from "@mui/icons-material/Home"
import SearchField from "../../../../components/common/searchField"
import FiltersWrapper from "../../../../components/common/FiltersWrapper"
import ListFilter from "./filters"
import CoursesForm from "./form"
import AddIcon from "@mui/icons-material/Add"
import { useGetTrainingsAndCourses, useCreateTrainingAndDevelopment, useUpdateTrainingAndDevelopment, useGetTrainingAndDevelopmentById, useDeleteTrainingAndDevelopment } from "../../../../utils/hooks/api/trainingAndDevelopment"
import { useUser } from "../../../../context/UserContext"
import SelectField from "../../../../components/common/SelectField"
import CustomMenu from "../../../../components/common/CustomMenu"
import toast from 'react-hot-toast';
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow"

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Training And Courses" },
  { title: "Courses" },
]

const Courses = () => {
  const { user } = useUser()
  const employeeId = user?.id;
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [openFormModal, setOpenFormModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState({
    status: "",
    course_id: "",
    publisher: "",
    created_from: "",
    created_to: "",
  })

  const [openFilters, setOpenFilters] = useState(false)
  const { getTrainingsAndCourses, courses, loading, refetch, totalPages, count } = useGetTrainingsAndCourses(
    page, 
    searchQuery, 
    filters, 
    perPage, 
    'TrainingAndDevelopment', 
    user?.id
  )
  const { createTrainingAndDevelopment } = useCreateTrainingAndDevelopment();
  const { updateTrainingAndDevelopment } = useUpdateTrainingAndDevelopment();
  const { data: editingData, loading: editingLoading } = useGetTrainingAndDevelopmentById(editingId);
  const { deleteTrainingAndDevelopment } = useDeleteTrainingAndDevelopment();

  useEffect(() => {
    if (user?.id) {
      refetch()
    }
  }, [refetch, user?.id])

  const handleOpenForm = () => {
    setEditingId(null);
    setOpenFormModal(true);
  }
  
  const handleCloseForm = () => {
    setOpenFormModal(false);
    setEditingId(null);
  }

  const handleEdit = (id) => {
    setEditingId(id);
    setOpenFormModal(true);
  }

  const handleDelete = async (id) => {
  
      try {
        const result = await deleteTrainingAndDevelopment(id);
        if (result) {
          toast.success('Course deleted successfully!');
          refetch(); // Refresh the list after deletion
        }
      } catch (err) {
        console.error('Error deleting course:', err);
      }
    
  }

  const columns = [
    { key: "course_name", label: "Course Name" },
    { key: "created_at", label: "Created On" },
    { key: "publisher", label: "Publisher" },
    { key: "course_details", label: "Course Details", type: 'description', render: (row) => row.course_details },
    { key: "duration", label: "Duration" },
    {
      key: "status",
      label: "Status",
      type: "chip"
    },
    {
      key: "attachment",
      label: "Attachment",
      type: "custom",
      render: (row) => (
        row?.attachment_path ? (
          <a
            href={row?.attachment_path}
            target="_blank"
            rel="noopener noreferrer"
          >
             <Button
                variant="contained"
                size="small"
                color="primary"
                style={{ marginRight: row.status === "Approved" ? 8 : 0 }}
              >
                View Course
              </Button>
          </a>
        ) : null
      ),
    },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        row.status === 'pending' ? (
          <CustomMenu
            items={[
              {
                label: 'Edit',
                icon: <EditIcon fontSize='small' />,
                action: () => handleEdit(row.id),
              },
              {
                label: 'Delete',
                icon: <DeleteIcon fontSize='small' />,
                action: () => handleDelete(row.id),
                danger: true
              }
            ]}
          />
        ) : null
      ),
    },
  ]

  const handleChangeFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset page when filter changes
  }

  const handleApplyFilter = (newValues) => {
    setFilters(prev => ({ ...prev, ...newValues }));
    setPage(0);
    refetch();
  }

  const resetFilters = () => {
    setFilters({
      status: "",
      course_id: "",
      publisher: "",
      created_from: "",
      created_to: "",
    });
    setPage(0);
    refetch();
  }

    const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();


  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        is_training: false,
        course_name: values.course_name,
        course_details: values.course_details,
        employee_ids: values.employee_ids,
        department_ids: values.department_ids,
        branch_ids: values.branch_ids,
        attachment_path: values.attachment_path,
        location: values.attachment_path,
        publisher: values.publisher,
        created_at: values.created_at,
        end_at: values.end_at,
        upload_certificate_date: values.upload_certificate_date,
        created_by: employeeId,
        duration: values.duration,
        internal_trainer: values.trainer_type === 'internal_trainer' ? values.internal_trainer : null,
        external_trainer: values.trainer_type === 'external_trainer' ? values.external_trainer : "",
      };

      let result;
      if (editingId) {
        // Update existing course
        result = await updateTrainingAndDevelopment(editingId, payload);
      } else {


        payload.status_workflow = workflow_employees

        // Create new course
        result = await createTrainingAndDevelopment(payload);
      }

      if (result) {
        handleCloseForm()
        refetch()
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading 
        title="Courses"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="Add Course"
        Icon={AddIcon}>
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField 
              value={searchQuery} 
              onChange={(value) => {
                setSearchQuery(value);
                setPage(0); // Reset to first page when search changes
              }} 
              placeholder="Search by course name..." 
            />
            <div className="flex gap-2">
              <div className='w-[300px]'>
                <SelectField 
                  options={[
                    { label: 'Pending', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Declined', value: 'declined' },
                  ]} 
                  placeholder='Status' 
                  value={filters.status}
                  onChange={(value) => handleChangeFilter('status', value)}
                />
              </div>
              <FiltersWrapper
                onApplyFilters={handleApplyFilter}
                resetFilters={resetFilters}
                open={openFilters}
                setOpen={setOpenFilters}
              >
                <ListFilter
                  values={filters}
                  handleChange={handleChangeFilter}
                  courseOptions={courses.map(course => ({
                    value: course.id,
                    label: course.course_name
                  }))}
                />
              </FiltersWrapper>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={courses}
            // showCheckbox={false}
            // onSelectChange={(ids) => setSelectedIds(ids)}
            // onAction={() => {}}
            footerInfo={`Courses out of ${count}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <CoursesForm 
        open={openFormModal} 
        onClose={handleCloseForm} 
        handleSubmit={handleSubmit} 
        loading={loading || editingLoading}
        editingData={editingData}
        isEditing={!!editingId}
      />
    </React.Fragment>
  )
}

export default Courses
