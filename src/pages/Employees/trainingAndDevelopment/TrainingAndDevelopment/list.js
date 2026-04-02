// "use client";

// import React, { useState, useEffect } from "react";
// import "./style.css";
// import TrainingAndDevelopmentForm from "./form";
// import { Button } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import DynamicTable from "../../../../components/tables/AnnouncementsTable";
// import "./style.css";
// import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
// import HomeIcon from "@mui/icons-material/Home";
// import SearchField from "../../../../components/common/searchField";
// import FiltersWrapper from "../../../../components/common/FiltersWrapper";
// import ListFilter from "./filters";
// import ReportIcon from "@mui/icons-material/Assessment";
// import Feedback from "./feedback";
// import { useGetCourseApplications, useCreateCourseApplication } from "../../../../utils/hooks/api/courseApplication";
// import { useUser } from "../../../../context/UserContext";
// import SelectField from "../../../../components/common/SelectField";

// const breadcrumbItems = [
//   { href: "/home", icon: HomeIcon },
//   { title: "Self Service" },
//   { title: "Training And Development" },
// ];

// const TrainingAndDevelopment = () => {
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [openFormModal, setOpenFormModal] = useState(false);
//   const [openViewCourse, setOpenViewCourse] = useState(false);
//   const [filters, setFilters] = useState({
//     status: "",
//     type: "",
//     course_name: "",
//     created_from: "",
//     created_to: "",
//   });
//   const [openFilters, setOpenFilters] = useState(false);
//   const [selectedCourseId, setSelectedCourseId] = useState(null);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [perPage, setPerPage] = useState(10);
//   const { user } = useUser();
  
//   const { 
//     applications, 
//     totalPages, 
//     loading, 
//     count,
//     refetch
//   } = useGetCourseApplications(
//     currentPage,
//     searchQuery,
//     filters,
//     perPage,
//     'TrainingAndDevelopment',
//     user?.id
//   );

//   const { createCourseApplication} = useCreateCourseApplication();

//   const handleSubmit = async (values, { setSubmitting }) => {
//     try {
//       const payload = {
//         course_id: values.course_id,
//         required_date: values.required_date,
//         determine_need: values.determine_need,
//         attachment_path: values.attachment_path,
//         applicant_id: user?.id,
//         created_at: new Date().toISOString(),
//       };
//       if (user?.role === 'employee') {
//         payload.status = 'pending';
//       } else {
//         payload.status = 'approved';
//       }

//       const result = await createCourseApplication(payload);
//       refetch()
//       if (result) {
//         handleCloseForm();
       
//       }
//     } catch (err) {
//       console.error("Error submitting form:", err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     if (user?.id) {
//       refetch()
//     }
//   }, [refetch, user?.id])

//   // Debug effect to log applications data
//   useEffect(() => {
//     console.log('Applications data:', applications);
//     if (applications.length > 0) {
//       console.log('First application:', applications[0]);
//     }
//   }, [applications]);

//   const handleOpenForm = () => setOpenFormModal(true);
//   const handleCloseForm = () => setOpenFormModal(false);
  
//   const handleChangeFilter = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleApplyFilter = (newValues) => {
//     setFilters(newValues);
//     setCurrentPage(0); // Reset to first page when filters change
//   };

//   const resetFilters = () => {
//     setFilters({
//       status: "",
//       type: "",
//       course_name: "",
//       created_from: "",
//       created_to: "",
//     });
//     setCurrentPage(0);
//   };

//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//   };

//   const handlePerPageChange = (newPerPage) => {
//     setPerPage(newPerPage);
//     setCurrentPage(0);
//   };

//   const columns = [
//     { key: "courseName", label: "Course Name" },
//     { key: "createdOn", label: "Created On" },
//     { key: "publisher", label: "Publisher" },
//     { key: "courseDetails", label: "Course Details", type: "description", render: row => row?.courseDetails },
//     { key: "upload_certificate_date", label: "Upload Certificate Date" },
//     {
//     key: "certificate_attachment",
//     label: "Certificate Attachment",
//     type: "custom",
//     render: (row) => {
//       const isApproved = String(row?.status || "").toLowerCase() === "approved";
//       if (!row?.attachment_path) return null;

//       const btn = (
//         <Button variant="contained" size="small" color="primary" disabled={!isApproved}>
//           Upload Certificate
//         </Button>
//       );

//       // Only make it a link (clickable) when approved; otherwise show disabled button
//       return isApproved ? (
//         <a href={row.attachment_path} target="_blank" rel="noopener noreferrer">
//           {btn}
//         </a>
//       ) : (
//         btn
//       );
//     },
//   },
//     { key: "status", label: "Status", type: "chip" },
//     {
//       key: "attachment",
//       label: "View Course",
//       type: "custom",
//       render: (row) => (
//         <>
//           {row?.attachment_path ? (
//             <a
//               href={row?.attachment_path}
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <Button
//                 variant="contained"
//                 size="small"
//                 color="primary"
//               >
//                 View Course
//               </Button>
//             </a>
//           ) : null}
//         </>
//       ),
//     },
//   ];

//   return (
//     <React.Fragment>
//       <PageWrapperWithHeading
//         title="Training And Development"
//         items={breadcrumbItems}
//         action={handleOpenForm}
//         buttonTitle="Apply for Course / Training"
//         Icon={AddIcon}
//       >
//         <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
//           <div className="flex justify-between items-center w-full">
//             <SearchField 
//               value={searchQuery} 
//               onChange={(value) => {
//                 setSearchQuery(value);
//                 setCurrentPage(0); // Reset to first page when search changes
//               }} 
//             />
//             <div className="flex gap-4">
//             <div className='w-[300px]'>
//                 <SelectField 
//                   options={[
//                     { label: 'Pending', value: 'pending' },
//                     { label: 'Approved', value: 'approved' },
//                     { label: 'Declined', value: 'declined' },
//                   ]} 
//                   placeholder='Status' 
//                   value={filters?.status || ""}
//                   onChange={(value) => handleChangeFilter('status', value)}
//                 />
//               </div>
//               <div className="filter-buttons">
//                 <FiltersWrapper
//                   onApplyFilters={handleApplyFilter}
//                   resetFilters={resetFilters}
//                   open={openFilters}
//                   setOpen={setOpenFilters}
//                 >
//                   <ListFilter
//                     values={filters}
//                     label="Type"
//                     options={[
//                       { value: "Marketing Department", label: "Marketing Department" },
//                       { value: "Finance Department", label: "Finance Department" },
//                       { value: "IT Department", label: "IT Department" },
//                     ]}
//                     handleChange={handleChangeFilter}
//                     placeholder="Select Type"
//                   />
//                 </FiltersWrapper>
//               </div>
//             </div>
//           </div>

//           <DynamicTable
//             columns={columns}
//             data={applications}
//             footerInfo={`Training Courses out of ${count}`}
//             currentPage={currentPage + 1}
//             totalPages={totalPages}
//             perPage={perPage}
//             onPageChange={(p) => setCurrentPage(p - 1)}
//             onPerPageChange={setPerPage}
//             loading={loading}
//           />
//         </div>
//       </PageWrapperWithHeading>
//       <TrainingAndDevelopmentForm
//         open={openFormModal}
//         onClose={handleCloseForm}
//         handleSubmit={handleSubmit}
//         loading={loading}
//       />
//       {/* <TrainingAndDevelopmentForm
//         open={openViewCourse}
//         onClose={() => setOpenViewCourse(false)}
//       /> */}
//     </React.Fragment>
//   );
// };

// export default TrainingAndDevelopment;


"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import "./style.css";
import TrainingAndDevelopmentForm from "./form";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import ReportIcon from "@mui/icons-material/Assessment";
import Feedback from "./feedback";
import {
  useGetCourseApplications,
  useCreateCourseApplication,
  useUpdateCourseApplication, // <-- make sure this hook exists in your project
} from "../../../../utils/hooks/api/courseApplication";
import { useUser } from "../../../../context/UserContext";
import SelectField from "../../../../components/common/SelectField";
import { uploadFile } from "../../../../utils/s3"; // <-- same uploader used in FileUploadField
import { useGeneralDocument } from "../../../../utils/hooks/api/useGeneralDocuments";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";


const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Training And Development" },
];

const TrainingAndDevelopment = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openViewCourse, setOpenViewCourse] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    course_name: "",
    created_from: "",
    created_to: "",
  });
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // File upload picker & state
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadingId, setUploadingId] = useState(null); // track row id currently uploading

  const { user } = useUser();

  const {
    applications,
    totalPages,
    loading,
    count,
    refetch,
  } = useGetCourseApplications(
    currentPage,
    searchQuery,
    filters,
    perPage,
    "TrainingAndDevelopment",
    user?.id
  );

  const { createCourseApplication } = useCreateCourseApplication();
  const { updateCourseApplication } = useUpdateCourseApplication();


  const { workflow_employees } = useGenericFlowEmployees();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {

      const selectedType = values.selectedType

    const isEmployeeCourse =
      selectedType === "course" && user?.role === "employee";

      const payload = {
        course_id: values.course_id,
        required_date: values.required_date,
        determine_need: values.determine_need,
        attachment_path: values.attachment_path,
        applicant_id: user?.id,
        created_at: new Date().toISOString(),
      status: isEmployeeCourse ? "pending" : "approved",
        ...(isEmployeeCourse ? { status_workflow: workflow_employees } : {}),    
      };

      
      const result = await createCourseApplication(payload);


      if(isEmployeeCourse){
          await transactionEmailSender(user, payload, "New Course Request", `New Course Request`);
      }

      await refetch();
      if (result) {
        handleCloseForm();
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [refetch, user?.id]);

  const handleOpenForm = () => setOpenFormModal(true);
  const handleCloseForm = () => setOpenFormModal(false);

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters(newValues);
    setCurrentPage(0);
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      type: "",
      course_name: "",
      created_from: "",
      created_to: "",
    });
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(0);
  };

  // Trigger file picker for a specific row
  const onClickUploadCertificate = (row) => {
    setUploadTarget(row);
    fileInputRef.current?.click();
  };

  // Handle actual file upload using the same util as FileUploadField
  const onFilePicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset input
    if (!file || !uploadTarget) return;

    try {
      setUploadingId(uploadTarget.id);

      // (Optional) type guard like FileUploadField's `accept` can be added here if needed

      // Upload to S3 via your util
      const uploadedUrl = await uploadFile(file);

      // Update the DB row with the new certificate URL and upload date
      await updateCourseApplication(uploadTarget.id, {
        certificate_attachment: uploadedUrl,
        // upload_certificate_date: new Date().toISOString(),
      });

      await refetch();
    } catch (err) {
      console.error("Upload certificate error:", err);
    } finally {
      setUploadingId(null);
      setUploadTarget(null);
    }
  };



  const columns = [
    { key: "courseName", label: "Course Name" },
    { key: "createdOn", label: "Created On" },
    { key: "publisher", label: "Publisher" },
    { key: "courseDetails", label: "Course Details", type: "description", render: (row) => row?.courseDetails },
    { key: "upload_certificate_date", label: "Upload Certificate Date" },

   {
  key: "certificate_attachment",
  label: "Certificate Attachment",
  type: "custom",
  render: (row) => {
    const isApproved = String(row?.status || "").toLowerCase() === "approved";
    const hasCert =
      typeof row?.certificate_attachment === "string" &&
      row.certificate_attachment.trim() !== "";


    // Already uploaded → disable and show "Certificate Uploaded"
    if (hasCert) {
      return (
        <Button
          variant="contained"
          size="small"
          color="primary"
          disabled
        >
          Certificate Uploaded
        </Button>
      );
    }

    // Not uploaded yet → use existing rules (must be approved, handle uploading state)
    return (
      <Button
        variant="contained"
        size="small"
        color="primary"
        disabled={!isApproved || uploadingId === row?.id}
        onClick={() => onClickUploadCertificate(row)}
      >
        {uploadingId === row?.id
          ? "Uploading..."
          : "Upload Certificate"}
      </Button>
    );
  },
},


    { key: "status", label: "Status", type: "chip" },

    {
      key: "attachment",
      label: "View Course",
      type: "custom",
      render: (row) =>
        row?.attachment_path ? (
          <a href={row.attachment_path} target="_blank" rel="noopener noreferrer">
            <Button variant="contained" size="small" color="primary">
              View Course
            </Button>
          </a>
        ) : null,
    },
  ];

  return (
    <React.Fragment>
      {/* Hidden file input for certificate uploads (uses same approach as FileUploadField) */}
      <input
        type="file"
        accept="application/pdf,image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFilePicked}
      />

      <PageWrapperWithHeading
        title="Training And Development"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="Apply for Course / Training"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(0);
              }}
            />
            <div className="flex gap-4">
              <div className="w-[300px]">
                <SelectField
                  options={[
                    { label: "Pending", value: "pending" },
                    { label: "Approved", value: "approved" },
                    { label: "Declined", value: "declined" },
                  ]}
                  placeholder="Status"
                  value={filters?.status || ""}
                  onChange={(value) => handleChangeFilter("status", value)}
                />
              </div>
              <div className="filter-buttons">
                <FiltersWrapper
                  onApplyFilters={handleApplyFilter}
                  resetFilters={resetFilters}
                  open={openFilters}
                  setOpen={setOpenFilters}
                >
                  <ListFilter
                    values={filters}
                    label="Type"
                    options={[
                      { value: "Marketing Department", label: "Marketing Department" },
                      { value: "Finance Department", label: "Finance Department" },
                      { value: "IT Department", label: "IT Department" },
                    ]}
                    handleChange={handleChangeFilter}
                    placeholder="Select Type"
                  />
                </FiltersWrapper>
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={applications}
            footerInfo={`Training Courses out of ${count}`}
            currentPage={currentPage + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setCurrentPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      <TrainingAndDevelopmentForm
        open={openFormModal}
        onClose={handleCloseForm}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </React.Fragment>
  );
};

export default TrainingAndDevelopment;
