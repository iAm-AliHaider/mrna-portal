"use client";
import { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchInput from "../../../../components/common/searchField";
import { useUser } from "../../../../context/UserContext";
import toast from "react-hot-toast";
import InterviewScheduleForm from "./form";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  INTERVIEW_SCHEDULE_TABS,
  INTERVIEW_TYPES_TABS,
} from "../../../../utils/constants";
import {
  useInterviewScheduleList,
  useScheduleAnInterview,
} from "../../../../utils/hooks/api/candidates";
import UserTableCell from "../../../../components/common/UserTableCell";
// import {
//   sendFirstInterviewEmail,
//   sendInterviewerEmail,
//   sendSecondInterviewEmail,
//   sendThirdInterviewEmail,
// } from "../../../../utils/emailSender";
import {
  sendFirstInterviewEmail,
  sendInterviewerEmail,
  sendSecondInterviewEmail,
  sendThirdInterviewEmail,
} from "../../../../utils/emailSenderHelper";
import { supabase } from "../../../../supabaseClient";
import ViewInterviewNoteModal from "../../../Employees/recruitment/viewInterviewModal";
import { useNavigate } from "react-router-dom";
import { useGetAllBranches } from "../../../../utils/hooks/api/organizationalStructure";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource", href: "#" },
  { title: "Interview Schedule" },
];

const InterviewSchedule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(4);
  const [reportType, setReportType] = useState("first_interview");
  const [openForm, setOpenForm] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [currentInterviewType, setCurrentInterviewType] = useState("scheduled");
  const [viewNoteModalOpen, setViewNoteModalOpen] = useState(false);
  const [selectedNoteData, setSelectedNoteData] = useState("");
  const [otherInterviewers, setOtherInterviewers] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();

  const { accounts: branches = [], loading: branchesLoading } =
    useGetAllBranches();

  const { data, totalPages, count, loading, refetch } =
    useInterviewScheduleList(
      currentPage - 1,
      perPage,
      searchQuery,
      reportType,
      currentInterviewType
    );


  const { scheduleInterview, loading: scheduleLoading } =
    useScheduleAnInterview();

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
              `/admin/human-resource/talent-acquisition/candidates/add/${row.id}`
            )
          }
        >
          {row?.first_name +
            " " +
            row?.second_name +
            " " +
            row?.third_name +
            " " +
            row?.forth_name +
            " " +
            row?.family_name || ""}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      type: "custom",
      render: (row) => row?.email || row?.candidates?.email,
    },
    {
      key: "vacancy_title",
      label: "Position Applied For",
      type: "custom",
      render: (row) => row?.vacancy_title || row?.candidates?.vacancy_title,
    },
    {
      key: "mobile",
      label: "Phone",
      type: "custom",
      render: (row) => row?.mobile || row?.candidates?.mobile,
    },
    // {
    //   key: "jobVacancy",
    //   label: "Position Applied For",
    //   type: "custom",
    //   render: (row) => {
    //     console.log("row", row);
    //     return row?.candidate?.vacancy?.title || "-"
    //   },
    // },
    {
      key: "date",
      label: "Date",
      type: "custom",
      render: (row) => (
        <span className="w-full text-center">
          {row?.scheduled_interview?.[`${reportType}_date`] || "-"}
        </span>
      ),
    },
    {
      key: "time",
      label: "Time",
      type: "custom",
      render: (row) => {
        return (
          <span className="w-full text-center">
            {row?.scheduled_interview?.[`${reportType}_time`] || "-"}
          </span>
        );
      },
    },
    {
      key: "interviewer",
      label: "Interviewer",
      type: "custom",
      render: (row) => {
        // console.log("hello", row?.scheduled_interview)
        const filedName =
          reportType === "first_interview"
            ? "interviewer_id"
            : `${reportType.split("_")[0]}_interviewer_id`;
        return currentInterviewType === "scheduled" ? (
          <UserTableCell id={row?.scheduled_interview?.[filedName]} />
        ) : (
          <span className="w-full text-center">-</span>
        );
      },
    },
    {
      key: "note_one",
      label: "Notes one",
      type: "custom",
      render: (row) =>
        row?.scheduled_interview?.note_one ? (
          <button
            className="text-blue-600 underline text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNoteData(row?.scheduled_interview?.note_one);
              setViewNoteModalOpen(true);
            }}
          >
            View
          </button>
        ) : (
          "-"
        ),
    },
    {
      key: "note_two",
      label: "Notes two",
      type: "custom",
      render: (row) =>
        row?.scheduled_interview?.note_two ? (
          <button
            className="text-blue-600 underline text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNoteData(row?.scheduled_interview?.note_two);
              setViewNoteModalOpen(true);
            }}
          >
            View
          </button>
        ) : (
          "-"
        ),
    },
    {
      key: "note_three",
      label: "Notes three",
      type: "custom",
      render: (row) =>
        row?.scheduled_interview?.note_three ? (
          <button
            className="text-blue-600 underline text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNoteData(row?.scheduled_interview?.note_three);
              setViewNoteModalOpen(true);
            }}
          >
            View
          </button>
        ) : (
          "-"
        ),
    },
  ];

  const onRowClick = async (id) => {
    const candidate = data.find((c) => c.id === id);
    if (!candidate) return;
    setCurrentData(candidate);
    setOpenForm(true);
  };

  const handleToggleChange = (_, newType) => {
    if (newType) {
      setReportType(newType);
      setCurrentPage(1);
    }
  };

  //   const handleSubmit = async (values, { setSubmitting }) => {
  //     // try {
  //     //   let newRow = {
  //     //     candidate_id: currentData?.id || null,
  //     //     first_interview_time:
  //     //       values?.first_interview_time ||
  //     //       currentData?.scheduled_interview?.first_interview_time ||
  //     //       null,
  //     //     first_interview_date:
  //     //       values?.first_interview_date ||
  //     //       currentData?.scheduled_interview?.first_interview_date ||
  //     //       null,
  //     //     second_interview_time:
  //     //       values?.second_interview_time ||
  //     //       currentData?.scheduled_interview?.second_interview_time ||
  //     //       null,
  //     //     second_interview_date:
  //     //       values?.second_interview_date ||
  //     //       currentData?.scheduled_interview?.second_interview_date ||
  //     //       null,
  //     //     third_interview_time:
  //     //       values?.third_interview_time ||
  //     //       currentData?.scheduled_interview?.third_interview_time ||
  //     //       null,
  //     //     third_interview_date:
  //     //       values?.third_interview_date ||
  //     //       currentData?.scheduled_interview?.third_interview_date ||
  //     //       null,
  //     //     interviewer_id:
  //     //       values?.interviewer_id ||
  //     //       currentData?.scheduled_interview?.interviewer_id ||
  //     //       null,
  //     //     second_interviewer_id:
  //     //       values?.second_interviewer_id ||
  //     //       currentData?.scheduled_interview?.second_interviewer_id ||
  //     //       null,
  //     //     third_interviewer_id:
  //     //       values?.third_interviewer_id ||
  //     //       currentData?.scheduled_interview?.third_interviewer_id ||
  //     //       null,
  //     //       first_interview_panel_member_one_id:
  //     //       values?.first_interview_panel_member_one_id ||
  //     //       currentData?.scheduled_interview?.first_interview_panel_member_one_id ||
  //     //       null,
  //     //     first_interview_panel_member_two_id:
  //     //       values?.first_interview_panel_member_two_id ||
  //     //       currentData?.scheduled_interview?.first_interview_panel_member_two_id ||
  //     //       null,
  //     //     is_first_interview_scheduled:
  //     //       values?.is_first_interview_scheduled ||
  //     //       currentData?.scheduled_interview?.is_first_interview_scheduled ||
  //     //       false,
  //     //     is_second_interview_scheduled:
  //     //       values?.is_second_interview_scheduled ||
  //     //       currentData?.scheduled_interview?.is_second_interview_scheduled ||
  //     //       false,
  //     //     is_third_interview_scheduled:
  //     //       values?.is_third_interview_scheduled ||
  //     //       currentData?.scheduled_interview?.is_third_interview_scheduled ||
  //     //       false,
  //     //   };
  //     //   const interviewTypeField = `${reportType}_type`;
  //     //   const interviewUrlField = `${reportType}_url`;
  //     //   const interviewLocationField = `${reportType}_location`;
  //     //   const panelMembersField = `${reportType}_panel_members`;
  //     //   newRow[panelMembersField] =
  //     //     otherInterviewers.length > 0 ? otherInterviewers : null;
  //     //   newRow[interviewTypeField] = values[interviewTypeField] || null;
  //     //   newRow[interviewUrlField] =
  //     //     values[interviewTypeField] === "online"
  //     //       ? values[interviewUrlField]
  //     //       : null;
  //     //   newRow[interviewLocationField] =
  //     //     values[interviewTypeField] === "physical"
  //     //       ? values[interviewLocationField]
  //     //       : null;

  //     //   const { data, error } = await supabase
  //     //     .from("employees")
  //     //     .select(
  //     //       `
  //     //   *,
  //     //   candidates (*)
  //     // `
  //     //     )
  //     //     .eq("id", newRow?.interviewer_id)
  //     //     .single();

  //     try {
  //   let newRow = {
  //     candidate_id: currentData?.id || null,
  //     first_interview_time:
  //       values?.first_interview_time ||
  //       currentData?.scheduled_interview?.first_interview_time ||
  //       null,
  //     first_interview_date:
  //       values?.first_interview_date ||
  //       currentData?.scheduled_interview?.first_interview_date ||
  //       null,
  //     second_interview_time:
  //       values?.second_interview_time ||
  //       currentData?.scheduled_interview?.second_interview_time ||
  //       null,
  //     second_interview_date:
  //       values?.second_interview_date ||
  //       currentData?.scheduled_interview?.second_interview_date ||
  //       null,
  //     third_interview_time:
  //       values?.third_interview_time ||
  //       currentData?.scheduled_interview?.third_interview_time ||
  //       null,
  //     third_interview_date:
  //       values?.third_interview_date ||
  //       currentData?.scheduled_interview?.third_interview_date ||
  //       null,
  //     interviewer_id:
  //       values?.interviewer_id ||
  //       currentData?.scheduled_interview?.interviewer_id ||
  //       null,
  //     second_interviewer_id:
  //       values?.second_interviewer_id ||
  //       currentData?.scheduled_interview?.second_interviewer_id ||
  //       null,
  //     third_interviewer_id:
  //       values?.third_interviewer_id ||
  //       currentData?.scheduled_interview?.third_interviewer_id ||
  //       null,
  //     first_interview_panel_member_one_id:
  //       values?.first_interview_panel_member_one_id ||
  //       currentData?.scheduled_interview?.first_interview_panel_member_one_id ||
  //       null,
  //     first_interview_panel_member_two_id:
  //       values?.first_interview_panel_member_two_id ||
  //       currentData?.scheduled_interview?.first_interview_panel_member_two_id ||
  //       null,
  //     is_first_interview_scheduled:
  //       values?.is_first_interview_scheduled ||
  //       currentData?.scheduled_interview?.is_first_interview_scheduled ||
  //       false,
  //     is_second_interview_scheduled:
  //       values?.is_second_interview_scheduled ||
  //       currentData?.scheduled_interview?.is_second_interview_scheduled ||
  //       false,
  //     is_third_interview_scheduled:
  //       values?.is_third_interview_scheduled ||
  //       currentData?.scheduled_interview?.is_third_interview_scheduled ||
  //       false,
  //   };

  //   // Dynamic field names based on reportType
  //   const interviewTypeField = `${reportType}_type`;
  //   const interviewUrlField = `${reportType}_url`;
  //   const interviewLocationField = `${reportType}_location`;
  //   const panelMembersField = `${reportType}_panel_members`;

  //   // Assign other interviewers to dynamic field
  //   newRow[panelMembersField] =
  //     Array.isArray(otherInterviewers) && otherInterviewers.length > 0
  //       ? otherInterviewers
  //       : null;

  //   // Assign panel members individually
  //   if (Array.isArray(otherInterviewers) && otherInterviewers.length > 0) {
  //     if (otherInterviewers[0]) {
  //       newRow.first_interview_panel_member_one_id = otherInterviewers[0].id;
  //     }
  //     if (otherInterviewers[1]) {
  //       newRow.first_interview_panel_member_two_id = otherInterviewers[1].id;
  //     }
  //   }

  //   // Interview type/location/url
  //   newRow[interviewTypeField] = values[interviewTypeField] || null;
  //   newRow[interviewUrlField] =
  //     values[interviewTypeField] === "online" ? values[interviewUrlField] : null;
  //   newRow[interviewLocationField] =
  //     values[interviewTypeField] === "physical"
  //       ? values[interviewLocationField]
  //       : null;

  //   // Fetch interviewer details (example Supabase query)
  //   const { data, error } = await supabase
  //     .from("employees")
  //     .select(
  //       `
  //         *,
  //         candidates (*)
  //       `
  //     )
  //     .eq("id", newRow?.interviewer_id)
  //     .single();

  //       if (error) throw error;
  //       // await scheduleInterview(newRow, currentData?.scheduled_interview?.id);
  //       refetch();
  //       closeModal();
  //       if (newRow?.is_third_interview_scheduled) {
  //         await sendThirdInterviewEmail({
  //           candidate_name: `${currentData?.first_name ?? ""}
  //           ${currentData?.second_name ?? ""}
  //           ${currentData?.third_name ?? ""}
  //           ${currentData?.forth_name ?? ""}`
  //             .replace(/\s+/g, " ") // collapse multiple spaces into one
  //             .trim(),
  //           interview_date: newRow?.third_interview_date,
  //           interview_time: newRow?.third_interview_time,
  //           email: currentData?.email,
  //           interviewTypeField: newRow?.interviewTypeField,
  //           interviewUrlField: newRow?.interviewUrlField,
  //           interviewLocationField: newRow?.interviewLocationField
  //         });
  //         await sendInterviewerEmail({
  //           candidateName: `${currentData?.first_name ?? ""}
  //                   ${currentData?.second_name ?? ""}
  //                   ${currentData?.third_name ?? ""}
  //                   ${currentData?.forth_name ?? ""}`
  //             .replace(/\s+/g, " ") // collapse multiple spaces into one
  //             .trim(),
  //           interviewerName: `${data?.candidate?.first_name ?? ""}
  //                   ${data?.candidate?.second_name ?? ""}
  //                   ${data?.candidate?.third_name ?? ""}
  //                   ${data?.candidate?.forth_name ?? ""}`
  //             .replace(/\s+/g, " ") // collapse multiple spaces into one
  //             .trim(),
  //           email: data?.work_email,
  //           interviewDate: newRow?.third_interview_date,
  //           interviewTime: newRow?.third_interview_time,
  //           candidateEmail: currentData?.email,
  //           interviewTypeField: newRow?.interviewTypeField,
  //           interviewUrlField: newRow?.interviewUrlField,
  //           interviewLocationField: newRow?.interviewLocationField
  //         });
  //       } else if (newRow?.is_second_interview_scheduled) {
  //         await sendSecondInterviewEmail({
  //           candidate_name: `${currentData?.first_name ?? ""}
  //         ${currentData?.second_name ?? ""}
  //         ${currentData?.third_name ?? ""}
  //         ${currentData?.forth_name ?? ""}`
  //             .replace(/\s+/g, " ") // collapse multiple spaces into one
  //             .trim(),
  //           interview_date: newRow?.second_interview_date,
  //           interview_time: newRow?.second_interview_time,
  //           email: currentData?.email,
  //           interviewTypeField: newRow?.interviewTypeField,
  //           interviewUrlField: newRow?.interviewUrlField,
  //           interviewLocationField: newRow?.interviewLocationField
  //         });
  //         await sendInterviewerEmail({
  //           candidateName: `${currentData?.first_name ?? ""}
  //                 ${currentData?.second_name ?? ""}
  //                 ${currentData?.third_name ?? ""}
  //                 ${currentData?.forth_name ?? ""}`
  //             .replace(/\s+/g, " ") // collapse multiple spaces into one
  //             .trim(),
  //           interviewerName: `${data?.candidate?.first_name ?? ""}
  //                 ${data?.candidate?.second_name ?? ""}
  //                 ${data?.candidate?.third_name ?? ""}
  //                 ${data?.candidate?.forth_name ?? ""}`
  //             .replace(/\s+/g, " ") // collapse multiple spaces into one
  //             .trim(),
  //           email: data?.work_email,
  //           interviewDate: newRow?.second_interview_date,
  //           interviewTime: newRow?.second_interview_time,
  //           candidateEmail: currentData?.email,
  //           interviewTypeField: newRow?.interviewTypeField,
  //           interviewUrlField: newRow?.interviewUrlField,
  //           interviewLocationField: newRow?.interviewLocationField
  //         });
  //       } else if (newRow?.is_first_interview_scheduled) {
  //         debugger
  //         await sendFirstInterviewEmail({
  //           candidate_name: `${currentData?.first_name ?? ""}
  // ${currentData?.second_name ?? ""}
  // ${currentData?.third_name ?? ""}
  // ${currentData?.forth_name ?? ""}`
  //             .replace(/\s+/g, " ") // collapse multiple spaces into one
  //             .trim(),
  //           interview_date: newRow?.first_interview_date,
  //           interview_time: newRow?.first_interview_time,
  //           email: currentData?.email,
  //           interviewTypeField: newRow?.interviewTypeField,
  //           interviewUrlField: newRow?.interviewUrlField,
  //           interviewLocationField: newRow?.interviewLocationField
  //         });
  //       }
  //       await sendInterviewerEmail({
  //         candidateName: `${currentData?.first_name ?? ""}
  //                 ${currentData?.second_name ?? ""}
  //                 ${currentData?.third_name ?? ""}
  //                 ${currentData?.forth_name ?? ""}`
  //           .replace(/\s+/g, " ") // collapse multiple spaces into one
  //           .trim(),
  //         interviewerName: `${data?.candidate?.first_name ?? ""}
  //                 ${data?.candidate?.second_name ?? ""}
  //                 ${data?.candidate?.third_name ?? ""}
  //                 ${data?.candidate?.forth_name ?? ""}`
  //           .replace(/\s+/g, " ") // collapse multiple spaces into one
  //           .trim(),
  //         email: data?.work_email,
  //         interviewDate: newRow?.first_interview_time,
  //         interviewTime: newRow?.first_interview_date,
  //         candidateEmail: currentData?.email,
  //         interviewTypeField: newRow?.interviewTypeField,
  //           interviewUrlField: newRow?.interviewUrlField,
  //           interviewLocationField: newRow?.interviewLocationField
  //       });
  //     } catch (err) {
  //       toast.error(err.message || "Something went wrong. Please try again.");
  //     } finally {
  //       setSubmitting(false);
  //     }
  //   };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // 1) Dynamic field names
      const interviewTypeField = `${reportType}_type`;
      const interviewUrlField = `${reportType}_url`;
      const interviewLocationField = `${reportType}_location`;
      const panelMembersField = `${reportType}_panel_members`;

      // 2) Normalize (defend against select returning objects)
      const typeVal =
        typeof values[interviewTypeField] === "string"
          ? values[interviewTypeField]
          : values[interviewTypeField]?.value ?? null;

      const urlVal = values[interviewUrlField] ?? null;
      const locVal =
        typeof values[interviewLocationField] === "object"
          ? values[interviewLocationField]?.id ?? null // if your branch select returns object
          : values[interviewLocationField] ?? null;

      // 3) Build newRow (keep your existing static mappings)
      let newRow = {
        candidate_id: currentData?.id || null,
        first_interview_time:
          values?.first_interview_time ||
          currentData?.scheduled_interview?.first_interview_time ||
          null,
        first_interview_date:
          values?.first_interview_date ||
          currentData?.scheduled_interview?.first_interview_date ||
          null,
        second_interview_time:
          values?.second_interview_time ||
          currentData?.scheduled_interview?.second_interview_time ||
          null,
        second_interview_date:
          values?.second_interview_date ||
          currentData?.scheduled_interview?.second_interview_date ||
          null,
        third_interview_time:
          values?.third_interview_time ||
          currentData?.scheduled_interview?.third_interview_time ||
          null,
        third_interview_date:
          values?.third_interview_date ||
          currentData?.scheduled_interview?.third_interview_date ||
          null,
        interviewer_id:
          values?.interviewer_id ||
          currentData?.scheduled_interview?.interviewer_id ||
          null,
        second_interviewer_id:
          values?.second_interviewer_id ||
          currentData?.scheduled_interview?.second_interviewer_id ||
          null,
        third_interviewer_id:
          values?.third_interviewer_id ||
          currentData?.scheduled_interview?.third_interviewer_id ||
          null,
        is_first_interview_scheduled:
          values?.is_first_interview_scheduled ||
          currentData?.scheduled_interview?.is_first_interview_scheduled ||
          false,
        is_second_interview_scheduled:
          values?.is_second_interview_scheduled ||
          currentData?.scheduled_interview?.is_second_interview_scheduled ||
          false,
        is_third_interview_scheduled:
          values?.is_third_interview_scheduled ||
          currentData?.scheduled_interview?.is_third_interview_scheduled ||
          false,
      };

      // 4) Panel members (map correctly per reportType; avoid hard-coding "first_")
      newRow[panelMembersField] =
        Array.isArray(otherInterviewers) && otherInterviewers.length > 0
          ? otherInterviewers
          : null;

      // If your DB also needs flat IDs for each interview stage, compute keys dynamically:
      const panelOneKey = `${reportType}_panel_member_one_id`;
      const panelTwoKey = `${reportType}_panel_member_two_id`;
      if (Array.isArray(otherInterviewers) && otherInterviewers.length > 0) {
        newRow[panelOneKey] = otherInterviewers[0]?.id ?? null;
        newRow[panelTwoKey] = otherInterviewers[1]?.id ?? null;
      }

      // 5) Interview type, url, location
      newRow[interviewTypeField] = typeVal;
      newRow[interviewUrlField] = typeVal === "online" ? urlVal : null;
      newRow[interviewLocationField] = typeVal === "physical" ? locVal : null;

      // (Optional) Debug
      // console.log({ typeVal, urlVal, locVal, values, newRow });

      // 6) Fetch interviewer details
      const { data, error } = await supabase
        .from("employees")
        .select(`*, candidates (*)`)
        .eq("id", newRow?.interviewer_id)
        .single();

      if (error) throw error;

      await scheduleInterview(newRow, currentData?.scheduled_interview?.id);
      refetch();
      closeModal();

      // 7) Reuse normalized fields in emails (don’t access newRow.interviewTypeField literal!)
      const interviewType = typeVal;
      const interviewUrl = newRow[interviewUrlField];
      const interviewLocation = newRow[interviewLocationField];

      // Pick the right date/time based on which schedule flag is true
      const pick = (stage) => ({
        date: newRow[`${stage}_date`],
        time: newRow[`${stage}_time`],
      });


      if (newRow?.is_third_interview_scheduled) {
        const { date, time } = pick("third_interview");
        await sendThirdInterviewEmail({
          candidate_name: `${currentData?.first_name ?? ""} ${
            currentData?.second_name ?? ""
          } ${currentData?.third_name ?? ""} ${currentData?.forth_name ?? ""}`
            .replace(/\s+/g, " ")
            .trim(),
          interview_date: date,
          interview_time: time,
          email: currentData?.email,
          interviewTypeField: interviewType,
          interviewUrlField: interviewUrl,
          interviewLocationField: branches.find(b => b.id === interviewLocation)?.name || interviewLocation,
        });
        await sendInterviewerEmail({
          candidateName: `${currentData?.first_name ?? ""} ${
            currentData?.second_name ?? ""
          } ${currentData?.third_name ?? ""} ${currentData?.forth_name ?? ""}`
            .replace(/\s+/g, " ")
            .trim(),
          interviewerName: `${data?.candidate?.first_name ?? ""} ${
            data?.candidate?.second_name ?? ""
          } ${data?.candidate?.third_name ?? ""} ${
            data?.candidate?.forth_name ?? ""
          }`
            .replace(/\s+/g, " ")
            .trim(),
          email: data?.work_email,
          interviewDate: date,
          interviewTime: time,
          candidateEmail: currentData?.email,
          interviewTypeField: interviewType,
          interviewUrlField: interviewUrl,
          interviewLocationField: branches.find(b => b.id === interviewLocation)?.name || interviewLocation,
        });
      } else if (newRow?.is_second_interview_scheduled) {
        const { date, time } = pick("second_interview");
        await sendSecondInterviewEmail({
          candidate_name: `${currentData?.first_name ?? ""} ${
            currentData?.second_name ?? ""
          } ${currentData?.third_name ?? ""} ${currentData?.forth_name ?? ""}`
            .replace(/\s+/g, " ")
            .trim(),
          interview_date: date,
          interview_time: time,
          email: currentData?.email,
          interviewTypeField: interviewType,
          interviewUrlField: interviewUrl,
          interviewLocationField: branches.find(b => b.id === interviewLocation)?.name || interviewLocation,
        });
        await sendInterviewerEmail({
          candidateName: `${currentData?.first_name ?? ""} ${
            currentData?.second_name ?? ""
          } ${currentData?.third_name ?? ""} ${currentData?.forth_name ?? ""}`
            .replace(/\s+/g, " ")
            .trim(),
          interviewerName: `${data?.candidate?.first_name ?? ""} ${
            data?.candidate?.second_name ?? ""
          } ${data?.candidate?.third_name ?? ""} ${
            data?.candidate?.forth_name ?? ""
          }`
            .replace(/\s+/g, " ")
            .trim(),
          email: data?.work_email,
          interviewDate: date,
          interviewTime: time,
          candidateEmail: currentData?.email,
          interviewTypeField: interviewType,
          interviewUrlField: interviewUrl,
          interviewLocationField: branches.find(b => b.id === interviewLocation)?.name || interviewLocation,
        });
      } else if (newRow?.is_first_interview_scheduled) {
        const { date, time } = pick("first_interview");
        await sendFirstInterviewEmail({
          candidate_name: `${currentData?.first_name ?? ""} ${
            currentData?.second_name ?? ""
          } ${currentData?.third_name ?? ""} ${currentData?.forth_name ?? ""}`
            .replace(/\s+/g, " ")
            .trim(),
          interview_date: date,
          interview_time: time,
          email: currentData?.email,
          interviewTypeField: interviewType,
          interviewUrlField: interviewUrl,
          interviewLocationField: branches.find(b => b.id === interviewLocation)?.name || interviewLocation,
          // interviewLocationField: interviewLocation,
        });
        await sendInterviewerEmail({
          candidateName: `${currentData?.first_name ?? ""} ${
            currentData?.second_name ?? ""
          } ${currentData?.third_name ?? ""} ${currentData?.forth_name ?? ""}`
            .replace(/\s+/g, " ")
            .trim(),
          interviewerName: `${data?.candidate?.first_name ?? ""} ${
            data?.candidate?.second_name ?? ""
          } ${data?.candidate?.third_name ?? ""} ${
            data?.candidate?.forth_name ?? ""
          }`
            .replace(/\s+/g, " ")
            .trim(),
          email: data?.work_email,
          interviewDate: date, // (you had these two swapped previously)
          interviewTime: time, // fix here
          candidateEmail: currentData?.email,
          interviewTypeField: interviewType,
          interviewUrlField: interviewUrl,
          interviewLocationField: branches.find(b => b.id === interviewLocation)?.name || interviewLocation,
        });
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToogleInterviewType = (_, newType) => {
    if (newType) {
      setCurrentInterviewType(newType);
      setCurrentPage(1);
    }
  };

  const closeModal = () => {
    setOpenForm(false);
    setCurrentData(null);
  };

  return (
    <PageWrapperWithHeading title="Interview Schedule" items={breadcrumbItems}>
      <div className="bg-primary text-white p-3 text-center rounded-t-lg">
        <h1 className="text-lg font-semibold text-center">All Candidates</h1>
      </div>

      <div className="bg-white p-4 rounded-b-lg shadow-md flex flex-col gap-4">
        <div className="flex justify-between">
          <ToggleButtonGroup
            value={reportType}
            exclusive
            onChange={handleToggleChange}
            size="small"
          >
            {INTERVIEW_SCHEDULE_TABS.map((tab) => (
              <ToggleButton key={tab.value} value={tab.value}>
                {tab.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div className="flex justify-between items-center w-full">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          <div className="flex justify-between">
            <ToggleButtonGroup
              value={currentInterviewType}
              exclusive
              onChange={handleToogleInterviewType}
              size="small"
            >
              {INTERVIEW_TYPES_TABS.map((tab) => (
                <ToggleButton key={tab.value} value={tab.value}>
                  {tab.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </div>

        <DynamicTable
          columns={columns}
          data={data}
          currentPage={currentPage}
          totalPages={totalPages || 1}
          perPage={perPage}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          onRowClick={onRowClick}
          rowCursor={true}
          footerInfo={`Showing ${data.length} out of ${count}`}
          loading={loading}
        />

        <InterviewScheduleForm
          currentData={currentData?.scheduled_interview}
          setCurrentData={setCurrentData}
          open={openForm}
          onClose={() => setOpenForm(false)}
          handleSubmit={handleSubmit}
          use={user}
          reportType={reportType}
          scheduleLoading={scheduleLoading}
          setOtherInterviewers={setOtherInterviewers}
          otherInterviewers={otherInterviewers}
        />

        <ViewInterviewNoteModal
          open={viewNoteModalOpen}
          onClose={() => setViewNoteModalOpen(false)}
          noteData={selectedNoteData}
        ></ViewInterviewNoteModal>
      </div>
    </PageWrapperWithHeading>
  );
};

export default InterviewSchedule;
