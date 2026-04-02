"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import DynamicTable from "../../../../components/tables/AnnouncementsTable"
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection"
import HomeIcon from "@mui/icons-material/Home"
import SearchField from "../../../../components/common/searchField"
import FiltersWrapper from "../../../../components/common/FiltersWrapper"
import ListFilter from "./filters"
import TrainingAndCoursesForm from "./form"
import AddIcon from "@mui/icons-material/Add"
import { useGetCourseApplications, useCreateCourseApplication } from "../../../../utils/hooks/api/courseApplication"
import { useUser } from "../../../../context/UserContext"
import SelectField from "../../../../components/common/SelectField"
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow"

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Training And Courses" },
  { title: "Training And Courses" },
]

const TrainingAndCourses = () => {
 
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [openFormModal, setOpenFormModal] = useState(false)
  const [filters, setFilters] = useState({
    course_name: "",
    created_from: "",
    created_to: "",
    status: "",
  });

  const { user } = useUser()
  const employeeId = user?.id;
  const { createCourseApplication } = useCreateCourseApplication();
  const { applications, loading, totalPages, count, refetch } = useGetCourseApplications(
    page, 
    searchQuery, 
    filters, 
    perPage, 
    'TrainingAndDevelopment', 
    user?.id
  )

  // Helper function to check if course start date has passed
  const isCourseStartDatePassed = (requiredDate) => {
    if (!requiredDate) {
      return false;
    }
    
    const today = new Date();
    const courseDate = new Date(requiredDate);
    
    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    courseDate.setHours(0, 0, 0, 0);
    
    return courseDate < today;
  };



  useEffect(() => {
    if (user?.id) {
      refetch()
    }
  }, [refetch, user?.id])

  const columns = [
    { key: "courseName", label: "Course Name" },
    { key: "createdOn", label: "Created On" },
    { key: "publisher", label: "Publisher" },
    { key: "courseDetails", label: "Course Details", type: "description", render: row => row?.courseDetails },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "attachment",
      label: "View Course",
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
              >
                View Course
              </Button>
          </a>
        ) : null
      ),
    },
  ]

  const handleOpenForm = () => setOpenFormModal(true)
  const handleCloseForm = () => setOpenFormModal(false)

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({
      ...prev,
      ...newValues,
    }))
    setPage(0)
  }
  

  const resetFilters = () => {
    setFilters({
      course_name: "",
      created_from: "",
      publisher: "",
      created_to: "",
      status: "",
    })
    setPage(0)
      refetch()
  }



  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        course_id: values.course_id,
        required_date: values.required_date,
        determine_need: values.determine_need,
        attachment_path: values.attachment_path,
        applicant_id: employeeId,
        status: 'approved',
        created_at: new Date().toISOString(),
      };

      const result = await createCourseApplication(payload);
      refetch()
      if (result) {
        handleCloseForm();
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
        title="Training And Courses"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="Add Course / Training"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          
            <>
              <div className="flex justify-between items-center w-full">
                <SearchField 
                  value={searchQuery} 
                  onChange={(value) => {
                    setSearchQuery(value);
                    setPage(0); // Reset to first page when search changes
                  }} 
                  placeholder="Search" 
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
                  value={filters?.status || ""}
                  onChange={(value) => handleChangeFilter('status', value)}
                />
              </div>
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

              <DynamicTable
                columns={columns}
                data={applications}
                footerInfo={`Applications out of ${count}`}
                currentPage={page + 1}
                totalPages={totalPages}
                perPage={perPage}
                onPageChange={(p) => setPage(p - 1)}
                onPerPageChange={setPerPage}
                loading={loading}
              />
            </>
        </div>
      </PageWrapperWithHeading>
      <TrainingAndCoursesForm open={openFormModal} onClose={handleCloseForm} handleSubmit={handleSubmit} loading={loading} />
      
    </React.Fragment>
  )
}

export default TrainingAndCourses