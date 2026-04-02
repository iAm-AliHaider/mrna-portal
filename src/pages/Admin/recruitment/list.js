"use client";
import { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import { useGetInterviewScheduleList } from "../../../utils/hooks/api/candidates";
// import UserTableCell from '../../../components/common/UserTableCell'
import PageWrapperWithHeading from "../../../components/common/PageHeadSection";

import DynamicTable from "../../../components/tables/AnnouncementsTable";
import ViewInterviewNoteModal from "../../Employees/recruitment/viewInterviewModal";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Recruitment", href: "#" },
  { title: "Interviews List" },
];

const InterviewsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(4);
  const [viewNoteModalOpen, setViewNoteModalOpen] = useState(false);
  const [selectedNoteData, setSelectedNoteData] = useState("");

  const { data, totalPages, count, loading } = useGetInterviewScheduleList(
    currentPage - 1,
    perPage,
    ""
  );

  const columns = [
    {
      key: "name",
      label: "Name",
      type: "custom",
      render: (row) => (
        <span>{row?.candidate?.full_name}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      type: "custom",
      render: (row) => row?.email || row?.candidate?.email,
    },
    {
      key: "jobVacancy",
      label: "Position Applied For",
      type: "custom",
      render: (row) => row?.candidate?.vacancy?.title || "-",
    },
    // {
    //   key: "first_interviewer",
    //   label: "1st Interviewer",
    //   type: "description",
    //   render: (row) => {
    //     const main = `${row?.interviewer_one?.employee_code || ""} - ${row?.interviewer_one?.candidate?.full_name || ""}` || '';
    //     const panel = row?.first_interview_panel_members?.map(member => member.name).join(', ') || '';
    //     return (
    //       <>
    //         {main || ''}
    //         {panel && <><br />Panel: {panel}</>}
    //       </>
    //     );
    //   }
    // },
    // {
    //   key: "second_interviewer",
    //   label: "2nd Interviewer",
    //   type: "description",
    //   render: (row) => {
    //     const main = `${row?.second_interviewer?.employee_code || ""} - ${row?.second_interviewer?.candidate?.full_name || ""}`;
    //     const panel = row?.second_interview_panel_members?.map(member => member.name).join(', ') || '';
    //     return (
    //       <>
    //         {main || ''}
    //         {panel && <><br />Panel: {panel}</>}
    //       </>
    //     );
    //   }
    // },
    // {
    //   key: "third_interviewer",
    //   label: "3rd Interviewer",
    //   type: "description",
    //   render: (row) => {
    //     const main = `${row?.third_interviewer?.employee_code || ""} - ${row?.third_interviewer?.candidate?.full_name || ""}`;
    //     const panel = row?.third_interview_panel_members?.map(member => member.name).join(', ') || '';
    //     return (
    //       <>
    //         {main || ''}
    //         {panel && <><br />Panel: {panel}</>}
    //       </>
    //     );
    //   }
    // },

   {
  key: "first_interviewer",
  label: "1st Interviewer",
  type: "custom",
  render: (row) => {
    const main =
      `${row?.interviewer_one?.employee_code || ""} - ${
        row?.interviewer_one?.candidate?.full_name || ""
      }` || "";

    const panelMembers = row?.first_interview_panel_members || [];

    return (
      <div style={{ whiteSpace: "normal", wordBreak: "break-word", overflow: "visible" }}>
        {main && <div>{main}</div>}
        {panelMembers.length > 0 && (
          <div className="mt-1">
            <strong>Panel:</strong>
            {panelMembers.map((member, index) => (
              <div key={index}>{member.name}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
},
{
  key: "second_interviewer",
  label: "2nd Interviewer",
  type: "custom",
  render: (row) => {
    const main =
      `${row?.second_interviewer?.employee_code || ""} - ${
        row?.second_interviewer?.candidate?.full_name || ""
      }` || "";

    const panelMembers = row?.second_interview_panel_members || [];

    return (
      <div style={{ whiteSpace: "normal", wordBreak: "break-word", overflow: "visible" }}>
        {main && <div>{main}</div>}
        {panelMembers.length > 0 && (
          <div className="mt-1">
            <strong>Panel:</strong>
            {panelMembers.map((member, index) => (
              <div key={index}>{member.name}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
},
{
  key: "third_interviewer",
  label: "3rd Interviewer",
  type: "custom",
  render: (row) => {
    const main =
      `${row?.third_interviewer?.employee_code || ""} - ${
        row?.third_interviewer?.candidate?.full_name || ""
      }` || "";

    const panelMembers = row?.third_interview_panel_members || [];

    return (
      <div style={{ whiteSpace: "normal", wordBreak: "break-word", overflow: "visible" }}>
        {main && <div>{main}</div>}
        {panelMembers.length > 0 && (
          <div className="mt-1">
            <strong>Panel:</strong>
            {panelMembers.map((member, index) => (
              <div key={index}>{member.name}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
},


    {
  key: "note_one",
  label: "Note 1st Interview",
  type: "custom",
  render: (row) => {
    // Parse panel members (supports array or JSON string)
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

    const panel = parsePanelMembers(row?.first_interview_panel_members);

    // Explicit field mapping you requested
    const interviewerNote = row?.note_one;
    const panel1Note = row?.first_interview_panel_member_one_note;
    const panel2Note = row?.first_interview_panel_member_two_note;

    const items = [
      { label: "Interviewer", value: interviewerNote },
      // Show Panel Member 1 if there is at least one panelist OR the note exists
      {
        label: "Member 1",
        value: panel1Note,
        show: panel.length >= 1 || !!panel1Note,
      },
      // Show Panel Member 2 if there are at least two panelists OR the note exists
      {
        label: "Member 2",
        value: panel2Note,
        show: panel.length >= 2 || !!panel2Note,
      },
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
{
  key: "note_two",
  label: "Note 2nd Interview",
  type: "custom",
  render: (row) => {
    // Parse panel members (array or JSON string)
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

    const panel = parsePanelMembers(row?.second_interview_panel_members);

    // Explicit field mapping
    const interviewerNote = row?.note_two;
    const panel1Note = row?.second_interview_panel_member_one_note;
    const panel2Note = row?.second_interview_panel_member_two_note;

    const items = [
      { label: "Interviewer", value: interviewerNote },
      { label: "Member 1", value: panel1Note, show: panel.length >= 1 || !!panel1Note },
      { label: "Member 2", value: panel2Note, show: panel.length >= 2 || !!panel2Note },
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
{
  key: "note_three",
  label: "Note 3rd Interview",
  type: "custom",
  render: (row) => {
    // Parse panel members (array or JSON string)
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

    const panel = parsePanelMembers(row?.third_interview_panel_members);

    // Explicit field mapping
    const interviewerNote = row?.note_three;
    const panel1Note = row?.third_interview_panel_member_one_note;
    const panel2Note = row?.third_interview_panel_member_two_note;

    const items = [
      { label: "Interviewer", value: interviewerNote },
      { label: "Member 1", value: panel1Note, show: panel.length >= 1 || !!panel1Note },
      { label: "Member 2", value: panel2Note, show: panel.length >= 2 || !!panel2Note },
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


    // {
    //   key: "note_one",
    //   label: "Note 1st Interview",
    //   type: "custom",
    //   render: (row) =>
    //     row?.note_one ? (
    //       <button
    //         className="text-blue-600 underline text-sm"
    //         onClick={(e) => {
    //           e.stopPropagation();
    //           setSelectedNoteData(row?.note_one);
    //           setViewNoteModalOpen(true);
    //         }}
    //       >
    //         View
    //       </button>
    //     ) : (
    //       "-"
    //     ),
    // },
    // {
    //   key: "note_two",
    //   label: "Note 2nd Interview",
    //   type: "custom",
    //   render: (row) =>
    //     row?.note_two ? (
    //       <button
    //         className="text-blue-600 underline text-sm"
    //         onClick={(e) => {
    //           e.stopPropagation();
    //           setSelectedNoteData(row?.note_two);
    //           setViewNoteModalOpen(true);
    //         }}
    //       >
    //         View
    //       </button>
    //     ) : (
    //       "-"
    //     ),
    // },
    // {
    //   key: "note_three",
    //   label: "Note 3rd Interview",
    //   type: "custom",
    //   render: (row) =>
    //     row?.note_three ? (
    //       <button
    //         className="text-blue-600 underline text-sm"
    //         onClick={(e) => {
    //           e.stopPropagation();
    //           setSelectedNoteData(row?.note_three);
    //           setViewNoteModalOpen(true);
    //         }}
    //       >
    //         View
    //       </button>
    //     ) : (
    //       "-"
    //     ),
    // },
  ];

  return (
    <PageWrapperWithHeading title="Interviews List" items={breadcrumbItems}>
      <div className="bg-primary text-white p-3 text-center rounded-t-lg">
        <h1 className="text-lg font-semibold text-center">All Interviews</h1>
      </div>

      <div className="bg-white p-4 rounded-b-lg shadow-md flex flex-col gap-4">
        <DynamicTable
          columns={columns}
          data={data}
          currentPage={currentPage}
          totalPages={totalPages || 1}
          perPage={perPage}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          footerInfo={`Showing ${data.length} out of ${count}`}
          loading={loading}
        />
      </div>

      <ViewInterviewNoteModal
        open={viewNoteModalOpen}
        onClose={() => setViewNoteModalOpen(false)}
        noteData={selectedNoteData}
      ></ViewInterviewNoteModal>
    </PageWrapperWithHeading>
  );
};

export default InterviewsList;
