// import { useState } from "react";
// import HomeIcon from "@mui/icons-material/Home";
// import toast from "react-hot-toast";
// import { useUser } from "../../../context/UserContext";
// import PageWrapperWithHeading from "../../../components/common/PageHeadSection";
// import SearchInput from "../../../components/common/searchField";
// import DynamicTable from "../../../components/tables/AnnouncementsTable";
// import {
//   useScheduledInterviewsList,
//   useUpdateInterview,
//   useJobOfferTask
// } from "../../../utils/hooks/api/recruitment";
// import UpdateInterviewForm from "./form";
// import { getSchduledInterviewFieldName } from "../../../utils/helper";
// import ViewInterviewNoteModal from "./viewInterviewModal";
// import { useUpdateCandidate } from "../../../utils/hooks/api/candidates";
// import { useNavigate } from "react-router-dom";
// import { sendCandidateRejectEmail } from "../../../utils/emailSenderHelper";
// import { supabase } from "../../../supabaseClient";
// import CustomMenu from '../../../components/common/CustomMenu'
// import EditIcon from '@mui/icons-material/Edit'
// import DeleteIcon from '@mui/icons-material/Delete'

// const breadcrumbItems = [
//   { href: "/home", icon: HomeIcon },
//   { title: "Recruitment", href: "#" },
// ];

// const ScheduledInterviews = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [perPage, setPerPage] = useState(4);
//   const [openForm, setOpenForm] = useState(false);
//   const [currentData, setCurrentData] = useState(null);
//   const [viewNoteModalOpen, setViewNoteModalOpen] = useState(false);
//   const [selectedNoteData, setSelectedNoteData] = useState("");
//   const navigate = useNavigate();
//   const { user } = useUser();
//   const currentEmployeeId = user?.id;

//   const { interviews, totalPages, count, loading, refetch } =
//     useScheduledInterviewsList(currentPage - 1, perPage, searchQuery);

//   const { updateInterview, loading: scheduleLoading } = useUpdateInterview();
//     // const { fetchTasks, loading: taskLoading } = useJobOfferTask();

// const { fetchTasks, jobOfferTasks, loading: taskLoading } = useJobOfferTask(21);


//   const { updateCandidate, loading: updateCandidateLoading } =
//     useUpdateCandidate();


//       const handleAddNote = async (row) => {


//         const interview = interviews.find((c) => c.id === row?.id);
//             console.log("Final values", interview);

//     if (!interview) return;
//     setCurrentData(interview);
//     setOpenForm(true);
//   }

//   const columns = [
//     {
//       key: "name",
//       label: "Name",
//       type: "custom",
//       render: (row) => (
//         <div
//           style={{
//             cursor: "pointer",
//             color: "#007bff",
//             textDecoration: "underline",
//           }}
//           onClick={() =>
//             navigate(
//               `/admin/human-resource/talent-acquisition/candidates/add/${row.candidate?.id}`
//             )
//           }
//         >
//           {row.candidate?.full_name || ""}
//         </div>
//       ),
//     },
//     {
//       key: "email",
//       label: "Email",
//       type: "custom",
//       render: (row) => row?.email || row?.candidate?.email,
//     },
//     {
//       key: "vacancy_title",
//       label: "Position Applied for",
//       type: "custom",
//       render: (row) => row?.vacancy_title || row?.candidate?.vacancy_title,
//     },
//     {
//       key: "mobile",
//       label: "Phone",
//       type: "custom",
//       render: (row) => row?.mobile || row?.candidate?.mobile,
//     },
//     {
//       key: "date",
//       label: "Date",
//       type: "custom",
//       render: (row) => {
//         const { dateFieldName } = getSchduledInterviewFieldName(
//           row,
//           currentEmployeeId
//         );
//         return (
//           <span className="w-full text-center">
//             {row?.[dateFieldName] || "-"}
//           </span>
//         );
//       },
//     },
//     {
//       key: "time",
//       label: "Time",
//       type: "custom",
//       render: (row) => {
//         const { timeFieldName } = getSchduledInterviewFieldName(
//           row,
//           currentEmployeeId
//         );
//         return (
//           <span className="w-full text-center">
//             {row?.[timeFieldName] || "-"}
//           </span>
//         );
//       },
//     },
//     {
//       key: "note_one",
//       label: "Notes one",
//       type: "custom",
//       render: (row) => {
//         const parsePanelMembers = (v) => {
//           if (Array.isArray(v)) return v;
//           if (typeof v === "string") {
//             try {
//               const p = JSON.parse(v);
//               return Array.isArray(p) ? p : [];
//             } catch {
//               return [];
//             }
//           }
//           return [];
//         };
//         const isYou = (id) =>
//           id != null && String(id) === String(currentEmployeeId);

//         const panel = parsePanelMembers(row?.first_interview_panel_members);

//         const interviewerNote = row?.note_one;
//         const panel1Note = row?.first_interview_panel_member_one_note;
//         const panel2Note = row?.first_interview_panel_member_two_note;

//         const items = [
//           {
//             label: isYou(row?.interviewer_id) ? "Your Review" : "Interviewer",
//             value: interviewerNote,
//           },
//           {
//             label: isYou(row?.first_interview_panel_member_one_id)
//               ? "Your Review"
//               : "Member 1",
//             value: panel1Note,
//             show: panel.length >= 1 || !!panel1Note,
//           },
//           {
//             label: isYou(row?.first_interview_panel_member_two_id)
//               ? "Your Review"
//               : "Member 2",
//             value: panel2Note,
//             show: panel.length >= 2 || !!panel2Note,
//           },
//         ].filter((it) => it.show === undefined || it.show);

//         const hasAny = items.some((it) => it.value);
//         if (!hasAny) return "-";

//         return (
//           <div className="flex flex-col gap-1">
//             {items.map(({ label, value }, i) =>
//               value ? (
//                 <button
//                   key={i}
//                   className="text-blue-600 underline text-sm"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedNoteData(value);
//                     setViewNoteModalOpen(true);
//                   }}
//                   title={label}
//                 >
//                   {label}
//                 </button>
//               ) : null
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       key: "note_two",
//       label: "Notes two",
//       type: "custom",
//       render: (row) => {
//         const parsePanelMembers = (v) => {
//           if (Array.isArray(v)) return v;
//           if (typeof v === "string") {
//             try {
//               const p = JSON.parse(v);
//               return Array.isArray(p) ? p : [];
//             } catch {
//               return [];
//             }
//           }
//           return [];
//         };
//         const isYou = (id) =>
//           id != null && String(id) === String(currentEmployeeId);

//         const panel = parsePanelMembers(row?.second_interview_panel_members);

//         const interviewerNote = row?.note_two;
//         const panel1Note = row?.second_interview_panel_member_one_note;
//         const panel2Note = row?.second_interview_panel_member_two_note;

//         const items = [
//           {
//             label: isYou(row?.second_interviewer_id)
//               ? "Your Review"
//               : "Interviewer",
//             value: interviewerNote,
//           },
//           {
//             label: isYou(row?.second_interview_panel_member_one_id)
//               ? "Your Review"
//               : "Member 1",
//             value: panel1Note,
//             show: panel.length >= 1 || !!panel1Note,
//           },
//           {
//             label: isYou(row?.second_interview_panel_member_two_id)
//               ? "Your Review"
//               : "Member 2",
//             value: panel2Note,
//             show: panel.length >= 2 || !!panel2Note,
//           },
//         ].filter((it) => it.show === undefined || it.show);

//         const hasAny = items.some((it) => it.value);
//         if (!hasAny) return "-";

//         return (
//           <div className="flex flex-col gap-1">
//             {items.map(({ label, value }, i) =>
//               value ? (
//                 <button
//                   key={i}
//                   className="text-blue-600 underline text-sm"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedNoteData(value);
//                     setViewNoteModalOpen(true);
//                   }}
//                   title={label}
//                 >
//                   {label}
//                 </button>
//               ) : null
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       key: "note_three",
//       label: "Notes three",
//       type: "custom",
//       render: (row) => {
//         const parsePanelMembers = (v) => {
//           if (Array.isArray(v)) return v;
//           if (typeof v === "string") {
//             try {
//               const p = JSON.parse(v);
//               return Array.isArray(p) ? p : [];
//             } catch {
//               return [];
//             }
//           }
//           return [];
//         };
//         const isYou = (id) =>
//           id != null && String(id) === String(currentEmployeeId);

//         const panel = parsePanelMembers(row?.third_interview_panel_members);

//         const interviewerNote = row?.note_three;
//         const panel1Note = row?.third_interview_panel_member_one_note;
//         const panel2Note = row?.third_interview_panel_member_two_note;

//         const items = [
//           {
//             label: isYou(row?.third_interviewer_id)
//               ? "Your Review"
//               : "Interviewer",
//             value: interviewerNote,
//           },
//           {
//             label: isYou(row?.third_interview_panel_member_one_id)
//               ? "Your Review"
//               : "Member 1",
//             value: panel1Note,
//             show: panel.length >= 1 || !!panel1Note,
//           },
//           {
//             label: isYou(row?.third_interview_panel_member_two_id)
//               ? "Your Review"
//               : "Member 2",
//             value: panel2Note,
//             show: panel.length >= 2 || !!panel2Note,
//           },
//         ].filter((it) => it.show === undefined || it.show);

//         const hasAny = items.some((it) => it.value);
//         if (!hasAny) return "-";

//         return (
//           <div className="flex flex-col gap-1">
//             {items.map(({ label, value }, i) =>
//               value ? (
//                 <button
//                   key={i}
//                   className="text-blue-600 underline text-sm"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedNoteData(value);
//                     setViewNoteModalOpen(true);
//                   }}
//                   title={label}
//                 >
//                   {label}
//                 </button>
//               ) : null
//             )}
//           </div>
//         );
//       },
//     },
//      {
//       type: 'custom',
//       label: 'Actions',
//       width: '10%',
//       render: row => (
//         <CustomMenu
//           items={[
            
//             {
//               label: 'Add Note',
//               icon: <EditIcon fontSize='small' />,
//               action: () => handleAddNote(row),
//               danger: false,
//             },
//           ]}
//         />
//       )
//     }

//     // {
//     //   key: "note_one",
//     //   label: "Notes one",
//     //   type: "custom",
//     //   render: (row) =>
//     //     row?.note_one ? (
//     //       <button
//     //         className="text-blue-600 underline text-sm"
//     //         onClick={(e) => {
//     //           e.stopPropagation();
//     //           setSelectedNoteData(row.note_one);
//     //           setViewNoteModalOpen(true);
//     //         }}
//     //       >
//     //         View
//     //       </button>
//     //     ) : (
//     //       "-"
//     //     ),
//     // },
//     // {
//     //   key: "note_two",
//     //   label: "Notes two",
//     //   type: "custom",
//     //   render: (row) =>
//     //     row?.note_two ? (
//     //       <button
//     //         className="text-blue-600 underline text-sm"
//     //         onClick={(e) => {
//     //           e.stopPropagation();
//     //           setSelectedNoteData(row.note_two);
//     //           setViewNoteModalOpen(true);
//     //         }}
//     //       >
//     //         View
//     //       </button>
//     //     ) : (
//     //       "-"
//     //     ),
//     // },
//     // {
//     //   key: "note_three",
//     //   label: "Notes three",
//     //   type: "custom",
//     //   render: (row) =>
//     //     row?.note_three ? (
//     //       <button
//     //         className="text-blue-600 underline text-sm"
//     //         onClick={(e) => {
//     //           e.stopPropagation();
//     //           setSelectedNoteData(row.note_three);
//     //           setViewNoteModalOpen(true);
//     //         }}
//     //       >
//     //         View
//     //       </button>
//     //     ) : (
//     //       "-"
//     //     ),
//     // },
//   ];

//   const onRowClick = async (id) => {
//     const interview = interviews.find((c) => c.id === id);
//     if (!interview) return;
//     setCurrentData(interview);
//     setOpenForm(true);
//   };

//   const handleSubmit = async (values, { setSubmitting }, recommendation, isJobOffer) => {
//     console.log("Final values", values);

// //     if(isJobOffer){

// // const tasks = await fetchTasks(21); // employmentTypeId = 21

// //   if (tasks.length > 0) {
// //     const firstTaskId = tasks[0].id;
// //     const task_assigned_to = tasks[0].assigned_id_master;

// //     console.log("First Task ID:", firstTaskId+"="+task_assigned_to);

// //           const { data, error } = await supabase.from("assigned_tasks").insert({
// //             task_id: firstTaskId,
// //             assigned_to_id: "5",
// //             employee_id: currentEmployeeId,
// //             candidate_id: currentData?.candidate?.id,
// //             status: "pending",
// //           });

// //               console.log("Response:", data);


// //     // You can now use this ID in payload or anywhere else
// //   } else {
// //     console.log("No tasks found for employmentTypeId 21");
// //   }    
// //     }

// //  if (isJobOffer) {

// //   const tasks = await fetchTasks();

// //     if (tasks.length > 0) {
// //       const firstTaskId = tasks[0].id;
// //       const task_assigned_to = tasks[0].assigned_id_master;

// //       console.log("First Task ID:", firstTaskId, "Assigned:", task_assigned_to);

// //       const { data, error } = await supabase.from("assigned_tasks").insert({
// //         task_id: firstTaskId,
// //         assigned_to_id: task_assigned_to || "5",
// //         employee_id: currentEmployeeId,
// //         candidate_id: currentData?.candidate?.id,
// //         status: "pending",
// //       });

// //       if (error) {
// //         console.error("Insert error:", error);
// //       } else {
// //         console.log("Inserted task:", data);
// //       }
// //     } else {
// //       console.log("No tasks found for employmentTypeId 21");
// //     }
// //   }


// if (isJobOffer) {
//   const tasks = await fetchTasks();

//   if (tasks.length > 0) {
//     // Prepare an array of task records to insert
//     const taskRecords = tasks.map((task) => ({
//       task_id: task.id,
//       assigned_to_id: task.assigned_id_master || "5",
//       employee_id: currentEmployeeId,
//       candidate_id: currentData?.candidate?.id,
//       status: "pending",
//     }));

//     // Insert all tasks in one go
//     const { data, error } = await supabase
//       .from("assigned_tasks")
//       .insert(taskRecords);

//     if (error) {
//       console.error("Insert error:", error);
//     } else {
//       console.log("Inserted tasks:", data);
//     }
//   } else {
//     console.log("No tasks found for employmentTypeId 21");
//   }
// }


//     try {
//       await updateInterview(values, currentData?.id);
//       await updateCandidate(currentData?.candidate?.id, {
//         hiring_status: recommendation,
//         suiteable_for_recruitment: recommendation === "suitable_now",
//       });
//       refetch();
//       closeModal();
//       if (
//         recommendation === "suitable_future" ||
//         recommendation === "rejected"
//       ) {
//         sendCandidateRejectEmail({
//           candidate_name: `${currentData?.candidate?.first_name ?? ""}
//                 ${currentData?.candidate?.second_name ?? ""}
//                 ${currentData?.candidate?.third_name ?? ""}
//                 ${currentData?.candidate?.forth_name ?? ""}`
//             .replace(/\s+/g, " ")
//             .trim(),
//           candidateEmail: currentData?.candidate?.email,
//         });
//       }
//     } catch (err) {
//       toast.error(err.message || "Something went wrong. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const closeModal = () => {
//     setOpenForm(false);
//     setCurrentData(null);
//   };

//   return (
//     <PageWrapperWithHeading title="Interview Schedule" items={breadcrumbItems}>
//       <div className="bg-primary text-white p-3 text-center rounded-t-lg">
//         <h1 className="text-lg font-semibold text-center">All Interviews</h1>
//       </div>
//       <div className="bg-white p-4 rounded-b-lg shadow-md flex flex-col gap-4">
//         <div className="flex justify-between items-center w-full">
//           <SearchInput value={searchQuery} onChange={setSearchQuery} />
//         </div>

//         <DynamicTable
//           columns={columns}
//           data={interviews}
//           currentPage={currentPage}
//           totalPages={totalPages || 1}
//           perPage={perPage}
//           onPageChange={(p) => setCurrentPage(p)}
//           onPerPageChange={setPerPage}
//           onRowClick={onRowClick}
//           rowCursor={true}
//           footerInfo={`Showing ${interviews?.length} interviews out of ${count}`}
//           loading={loading}
//         />

//         <UpdateInterviewForm
//           currentData={currentData}
//           setCurrentData={setCurrentData}
//           open={openForm}
//           onClose={() => setOpenForm(false)}
//           handleSubmit={handleSubmit}
//           use={user}
//           scheduleLoading={scheduleLoading}
//           currentEmployeeId={currentEmployeeId}
//         />
//       </div>
//       {/* <ViewInterviewNoteModal
//         open={viewNoteModalOpen}
//         onClose={() => setViewNoteModalOpen(false)}
//         noteData={selectedNoteData}
//       /> */}
//       <ViewInterviewNoteModal
//         open={viewNoteModalOpen}
//         onClose={() => setViewNoteModalOpen(false)}
//         noteData={selectedNoteData}
//       ></ViewInterviewNoteModal>
//     </PageWrapperWithHeading>
//   );
// };

// export default ScheduledInterviews;





















import { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import toast from "react-hot-toast";
import { useUser } from "../../../context/UserContext";
import PageWrapperWithHeading from "../../../components/common/PageHeadSection";
import SearchInput from "../../../components/common/searchField";
import DynamicTable from "../../../components/tables/AnnouncementsTable";
import {
  useScheduledInterviewsList,
  useUpdateInterview,
  useJobOfferTask,
} from "../../../utils/hooks/api/recruitment";
import UpdateInterviewForm from "./form";
import { getSchduledInterviewFieldName } from "../../../utils/helper";
import ViewInterviewNoteModal from "./viewInterviewModal";
import { useUpdateCandidate } from "../../../utils/hooks/api/candidates";
import { useNavigate } from "react-router-dom";
import { sendCandidateRejectEmail } from "../../../utils/emailSenderHelper";
import { supabase } from "../../../supabaseClient";
import CustomMenu from "../../../components/common/CustomMenu";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Recruitment", href: "#" },
];

const ScheduledInterviews = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(4);
  const [openForm, setOpenForm] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [viewNoteModalOpen, setViewNoteModalOpen] = useState(false);
  const [selectedNoteData, setSelectedNoteData] = useState("");
  const navigate = useNavigate();
  const { user } = useUser();
  const currentEmployeeId = user?.id;

  const { interviews, totalPages, count, loading, refetch } =
    useScheduledInterviewsList(currentPage - 1, perPage, searchQuery);

  const { updateInterview, loading: scheduleLoading } = useUpdateInterview();
  const { fetchTasks, jobOfferTasks, loading: taskLoading } = useJobOfferTask(21);
  const { updateCandidate, loading: updateCandidateLoading } =
    useUpdateCandidate();

  const handleAddNote = async (row) => {
    const interview = interviews.find((c) => c.id === row?.id);
    if (!interview) return;
    setCurrentData(interview);
    setOpenForm(true);
  };

  // ✅ Utility — determine if Add Note should be shown for this row
  const shouldShowAddNote = (row) => {
    const id = currentEmployeeId;

    // First interview checks
    const firstCondition =
      (row?.interviewer_id === id && !row?.note_one) ||
      (row?.first_interview_panel_member_one_id === id &&
        !row?.first_interview_panel_member_one_note) ||
      (row?.first_interview_panel_member_two_id === id &&
        !row?.first_interview_panel_member_two_note);

    // Second interview checks
    const secondCondition =
      (row?.second_interviewer_id === id && !row?.note_two) ||
      (row?.second_interview_panel_member_one_id === id &&
        !row?.second_interview_panel_member_one_note) ||
      (row?.second_interview_panel_member_two_id === id &&
        !row?.second_interview_panel_member_two_note);

    // Third interview checks
    const thirdCondition =
      (row?.third_interviewer_id === id && !row?.note_three) ||
      (row?.third_interview_panel_member_one_id === id &&
        !row?.third_interview_panel_member_one_note) ||
      (row?.third_interview_panel_member_two_id === id &&
        !row?.third_interview_panel_member_two_note);

    return firstCondition || secondCondition || thirdCondition;
  };

  // ✅ Column definitions
  const columns = [
    {
      key: "name",
      label: "Name",
      type: "custom",
      render: (row) => (
        <div
          style={{
            cursor: "pointer",
            color: "#007bff",
            textDecoration: "underline",
          }}
          onClick={() =>
            navigate(
              `/admin/human-resource/talent-acquisition/candidates/add/${row.candidate?.id}`
            )
          }
        >
          {row.candidate?.full_name || ""}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      type: "custom",
      render: (row) => row?.email || row?.candidate?.email,
    },
    {
      key: "vacancy_title",
      label: "Position Applied for",
      type: "custom",
      render: (row) => row?.vacancy_title || row?.candidate?.vacancy_title,
    },
    {
      key: "mobile",
      label: "Phone",
      type: "custom",
      render: (row) => row?.mobile || row?.candidate?.mobile,
    },
    {
      key: "date",
      label: "Date",
      type: "custom",
      render: (row) => {
        const { dateFieldName } = getSchduledInterviewFieldName(
          row,
          currentEmployeeId
        );
        return <span className="w-full text-center">{row?.[dateFieldName] || "-"}</span>;
      },
    },
    {
      key: "time",
      label: "Time",
      type: "custom",
      render: (row) => {
        const { timeFieldName } = getSchduledInterviewFieldName(
          row,
          currentEmployeeId
        );
        return <span className="w-full text-center">{row?.[timeFieldName] || "-"}</span>;
      },
    },

    // ✅ Notes One
    {
      key: "note_one",
      label: "Notes one",
      type: "custom",
      render: (row) => {
        const parsePanelMembers = (v) => {
          if (Array.isArray(v)) return v;
          if (typeof v === "string") {
            try {
              const p = JSON.parse(v);
              return Array.isArray(p) ? p : [];
            } catch {
              return [];
            }
          }
          return [];
        };

        const isYou = (id) => id != null && String(id) === String(currentEmployeeId);
        const panel = parsePanelMembers(row?.first_interview_panel_members);

        const interviewerNote = row?.note_one;
        const panel1Note = row?.first_interview_panel_member_one_note;
        const panel2Note = row?.first_interview_panel_member_two_note;

        const items = [
          { label: isYou(row?.interviewer_id) ? "Your Review" : "Interviewer", value: interviewerNote },
          { label: isYou(row?.first_interview_panel_member_one_id) ? "Your Review" : "Member 1", value: panel1Note, show: panel.length >= 1 || !!panel1Note },
          { label: isYou(row?.first_interview_panel_member_two_id) ? "Your Review" : "Member 2", value: panel2Note, show: panel.length >= 2 || !!panel2Note },
        ].filter((it) => it.show === undefined || it.show);

        const hasAny = items.some((it) => it.value);
        if (!hasAny) return "-";

        return (
          <div className="flex flex-col gap-1">
            {items.map(({ label, value }, i) =>
              value ? (
                <button
                  key={i}
                  className="text-blue-600 underline text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNoteData(value);
                    setViewNoteModalOpen(true);
                  }}
                  title={label}
                >
                  {label}
                </button>
              ) : null
            )}
          </div>
        );
      },
    },

    // ✅ Notes Two
    {
      key: "note_two",
      label: "Notes two",
      type: "custom",
      render: (row) => {
        const parsePanelMembers = (v) => {
          if (Array.isArray(v)) return v;
          if (typeof v === "string") {
            try {
              const p = JSON.parse(v);
              return Array.isArray(p) ? p : [];
            } catch {
              return [];
            }
          }
          return [];
        };

        const isYou = (id) => id != null && String(id) === String(currentEmployeeId);
        const panel = parsePanelMembers(row?.second_interview_panel_members);

        const interviewerNote = row?.note_two;
        const panel1Note = row?.second_interview_panel_member_one_note;
        const panel2Note = row?.second_interview_panel_member_two_note;

        const items = [
          { label: isYou(row?.second_interviewer_id) ? "Your Review" : "Interviewer", value: interviewerNote },
          { label: isYou(row?.second_interview_panel_member_one_id) ? "Your Review" : "Member 1", value: panel1Note, show: panel.length >= 1 || !!panel1Note },
          { label: isYou(row?.second_interview_panel_member_two_id) ? "Your Review" : "Member 2", value: panel2Note, show: panel.length >= 2 || !!panel2Note },
        ].filter((it) => it.show === undefined || it.show);

        const hasAny = items.some((it) => it.value);
        if (!hasAny) return "-";

        return (
          <div className="flex flex-col gap-1">
            {items.map(({ label, value }, i) =>
              value ? (
                <button
                  key={i}
                  className="text-blue-600 underline text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNoteData(value);
                    setViewNoteModalOpen(true);
                  }}
                  title={label}
                >
                  {label}
                </button>
              ) : null
            )}
          </div>
        );
      },
    },

    // ✅ Notes Three
    {
      key: "note_three",
      label: "Notes three",
      type: "custom",
      render: (row) => {
        const parsePanelMembers = (v) => {
          if (Array.isArray(v)) return v;
          if (typeof v === "string") {
            try {
              const p = JSON.parse(v);
              return Array.isArray(p) ? p : [];
            } catch {
              return [];
            }
          }
          return [];
        };

        const isYou = (id) => id != null && String(id) === String(currentEmployeeId);
        const panel = parsePanelMembers(row?.third_interview_panel_members);

        const interviewerNote = row?.note_three;
        const panel1Note = row?.third_interview_panel_member_one_note;
        const panel2Note = row?.third_interview_panel_member_two_note;

        const items = [
          { label: isYou(row?.third_interviewer_id) ? "Your Review" : "Interviewer", value: interviewerNote },
          { label: isYou(row?.third_interview_panel_member_one_id) ? "Your Review" : "Member 1", value: panel1Note, show: panel.length >= 1 || !!panel1Note },
          { label: isYou(row?.third_interview_panel_member_two_id) ? "Your Review" : "Member 2", value: panel2Note, show: panel.length >= 2 || !!panel2Note },
        ].filter((it) => it.show === undefined || it.show);

        const hasAny = items.some((it) => it.value);
        if (!hasAny) return "-";

        return (
          <div className="flex flex-col gap-1">
            {items.map(({ label, value }, i) =>
              value ? (
                <button
                  key={i}
                  className="text-blue-600 underline text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNoteData(value);
                    setViewNoteModalOpen(true);
                  }}
                  title={label}
                >
                  {label}
                </button>
              ) : null
            )}
          </div>
        );
      },
    },

    // ✅ Actions column (Updated)
    {
      type: "custom",
      label: "Actions",
      width: "12%",
      render: (row) => {
        const canAddNote = shouldShowAddNote(row);

        return (
          <CustomMenu
            items={[
              {
                label: canAddNote ? "Add Note" : "Add Note",
                icon: canAddNote ? (
                  <EditIcon fontSize="small" />
                ) : (
                  <EditIcon fontSize="small" />
                  // <DoneIcon fontSize="small" color="success" />
                ),
                action: canAddNote ? () => handleAddNote(row) : null,
                disabled: !canAddNote,
              },
            ]}
          />
        );
      },
    },
  ];

  const onRowClick = async (id) => {
    const interview = interviews.find((c) => c.id === id);
    if (!interview) return;
    setCurrentData(interview);
    setOpenForm(true);
  };

  const handleSubmit = async (values, { setSubmitting }, recommendation, isJobOffer) => {

    // if (isJobOffer) {
    //   const tasks = await fetchTasks();
    // console.log("Final tasks", tasks);

    //   if (tasks.length > 0) {
    //     const taskRecords = tasks.map((task) => ({
    //       task_id: task.id,
    //       assigned_to_id: task.assigned_id_master || "5",
    //       employee_id: currentEmployeeId,
    //       candidate_id: currentData?.candidate?.id,
    //       status: "pending",
    //     }));

    //     const { data, error } = await supabase.from("assigned_tasks").insert(taskRecords);
    //     if (error) console.error("Insert error:", error);
    //     else console.log("Inserted tasks:", data);
    //   }
    // }

    if (isJobOffer) {
  const tasks = await fetchTasks();

  if (tasks.length > 0) {
    const candidateId = currentData?.candidate?.id;

    // ✅ Step 1: Fetch existing assigned tasks for this candidate
    const { data: existingTasks, error: existingError } = await supabase
      .from("assigned_tasks")
      .select("task_id, employee_id")
      .eq("candidate_id", candidateId);

    if (existingError) {
      console.error("Error fetching existing tasks:", existingError);
      return;
    }


    // ✅ Step 2: Filter out tasks already assigned to this employee for this candidate
    const newTasks = tasks.filter(
      (task) =>
        !existingTasks?.some(
          (et) =>
            et.task_id === task.id &&
            String(et.employee_id) === String(currentEmployeeId)
        )
    );


    if (newTasks.length > 0) {
      const taskRecords = newTasks.map((task) => ({
        task_id: task.id,
        assigned_to_id: task.assigned_id_master || "5",
        employee_id: currentEmployeeId,
        candidate_id: candidateId,
        status: "pending",
      }));

      const { data, error } = await supabase
        .from("assigned_tasks")
        .insert(taskRecords);

      if (error) console.error("Insert error:", error);
    } else {
    }
  }
}


    try {
      await updateInterview(values, currentData?.id);
      await updateCandidate(currentData?.candidate?.id, {
        hiring_status: recommendation,
        suiteable_for_recruitment: recommendation === "suitable_now",
      });
      refetch();
      closeModal();

      if (recommendation === "suitable_future" || recommendation === "rejected") {
        sendCandidateRejectEmail({
          candidate_name: `${currentData?.candidate?.first_name ?? ""} ${
            currentData?.candidate?.second_name ?? ""
          } ${currentData?.candidate?.third_name ?? ""} ${
            currentData?.candidate?.forth_name ?? ""
          }`
            .replace(/\s+/g, " ")
            .trim(),
          candidateEmail: currentData?.candidate?.email,
        });
      }
      setSubmitting(false);
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setOpenForm(false);
    setCurrentData(null);
  };

  return (
    <PageWrapperWithHeading title="Interview Schedule" items={breadcrumbItems}>
      <div className="bg-primary text-white p-3 text-center rounded-t-lg">
        <h1 className="text-lg font-semibold text-center">All Interviews</h1>
      </div>

      <div className="bg-white p-4 rounded-b-lg shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>

        <DynamicTable
          columns={columns}
          data={interviews}
          currentPage={currentPage}
          totalPages={totalPages || 1}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={setPerPage}
          // onRowClick={onRowClick}
          rowCursor={true}
          footerInfo={`Showing ${interviews?.length} interviews out of ${count}`}
          loading={loading}
        />

        <UpdateInterviewForm
          currentData={currentData}
          setCurrentData={setCurrentData}
          open={openForm}
          onClose={() => setOpenForm(false)}
          handleSubmit={handleSubmit}
          use={user}
          scheduleLoading={scheduleLoading}
          currentEmployeeId={currentEmployeeId}
        />
      </div>

      <ViewInterviewNoteModal
        open={viewNoteModalOpen}
        onClose={() => setViewNoteModalOpen(false)}
        noteData={selectedNoteData}
      />
    </PageWrapperWithHeading>
  );
};

export default ScheduledInterviews;

