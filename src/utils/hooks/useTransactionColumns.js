import { useMemo } from "react";
import { differenceInCalendarDays, parseISO, addDays, format } from 'date-fns'
import { Button } from "@mui/material";
import { useSingleMyDocument } from "./api/documents";
import { ChangeRequestView } from "../../components/common/ChangeRequestView";
import { useUser } from '../../context/UserContext'
import { ROLES } from "../constants";


export function useTransactionColumns(type, {onDocumentRowClick, onMasterDataRowClick, onEffectedDateChange}) {
    const { user } = useUser()

  return useMemo(() => {
    const baseColumns = [
      { key: "created_at", label: "Creation Date", type: "date" },
      { key: "updated_at", label: "Last Updated", type: "date" },
    ];

    switch (type) {
      case "loan_requests":
        return [
          {
            key: "loan_type",
            label: "Loan Type",
            type: "custom",
            render: (row) => row?.loan_type?.name,
          },
          { key: "requested_amount", label: "Amount" },
          {
            key: "duration",
            label: "Duration Months",
            type: "custom",
            render: (row) => row?.duration,
          },
        ];

      case "advance_salary":
        return [
          { key: "amount", label: "Requested Amount" },
          { key: "requested_date", label: "Requested Date", type: "date" },
        ];

      case "pay_stopage":
        return [
          { key: "amount", label: "Stoppage Amount" },
          { key: "requested_date", label: "Requested Date", type: "date" },
        ];
      case "leave_requests":
        return [
          {
            key: "leave_type",
            label: "Leave Type",
            type: "custom",
            render: (row) => (
              <span className="capitalize">{`${
                row?.leave_qouta?.leave_type?.name || ""
              }-${row?.leave_qouta?.leave_type?.type || ""}`}</span>
            ),
          },
          { key: "start_date", label: "Start Date", type: "date" },
          { key: "end_date", label: "End Date", type: "date" },
          {
            key: "no_of_days",
            label: "No. of Days",
            type: "custom",
            render: (row) => {
              if (!row?.start_date || !row?.end_date) return "-";
              try {
                const start = parseISO(row?.start_date);
                const end = parseISO(row?.end_date);
                const days = differenceInCalendarDays(end, start) + 1;
                return days > 0 ? days : "Invalid Range";
              } catch {
                return "-";
              }
            },
          },
        ];

      case "allowance_requests":
        return [
          { key: "amount", label: "Requested Amount" },
          { key: "requested_date", label: "Requested Date", type: "date" },
          {
            key: "is_repeatable",
            label: "Repeatable",
            type: "custom",
            render: (row) => (row?.is_repeatable ? "Yes" : "No"),
          },
        ];

      case "attendance_requests":
        return [
          {
            key: "request_type",
            label: "Attendance Type",
            type: "custom",
            render: (row) => (
              <span className="capitalize">
                {row?.request_type?.replace("_", " ")}
              </span>
            ),
          },
          { key: "original_date", label: "Date", type: "date" },
          { key: "new_time", label: "Time" },
        ];

      case "resignation_request":

      return [
        {
            key: "Subject",
            label: "Subject",
            type: "description",
            render: (row) => row?.subject,
          },
//          {
//   key: "effected_date",
//   label: "Effective Date",
//   type: "custom",
//   render: (row) => {
//     return (
//       <div
//         onClick={() => onEffectedDateChange(row)}
//         style={{
//           display: "inline-block",
//           padding: "6px 10px",
//           border: "1px solid #ccc",
//           borderRadius: "6px",
//           backgroundColor: "#fff",
//           cursor: "pointer",
//           minWidth: "130px",
//           textAlign: "center",
//           color: "#333",
//           transition: "all 0.2s ease-in-out",
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.borderColor = "#1976d2";
//           e.currentTarget.style.boxShadow = "0 0 4px rgba(25, 118, 210, 0.3)";
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.borderColor = "#ccc";
//           e.currentTarget.style.boxShadow = "none";
//         }}
//       >
//         {row?.effected_date ? row.effected_date : "Select Date"}
//       </div>
//     );
//   },
// },
{
  key: "effected_date",
  label: "Effective Date",
  type: "custom",
  render: (row) => {
    const isRejectedOrApproved =
      row?.status === "rejected" || row?.status === "approved";

    // ✅ Editable only if user is HR/HR_MANAGER AND status is not rejected/approved
    const canEdit =
      (user?.role === ROLES.HR || user?.role === ROLES.HR_MANAGER) &&
      !isRejectedOrApproved;

    return (
      <div
        onClick={() => {
          if (canEdit) onEffectedDateChange(row);
        }}
        style={{
          display: "inline-block",
          padding: "6px 10px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          backgroundColor: canEdit ? "#fff" : "#f5f5f5",
          cursor: canEdit ? "pointer" : "not-allowed",
          minWidth: "130px",
          textAlign: "center",
          color: canEdit ? "#333" : "#555",
          transition: "all 0.2s ease-in-out",
          opacity: canEdit ? 1 : 0.9,
        }}
        onMouseEnter={(e) => {
          if (canEdit) {
            e.currentTarget.style.borderColor = "#1976d2";
            e.currentTarget.style.boxShadow =
              "0 0 4px rgba(25, 118, 210, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (canEdit) {
            e.currentTarget.style.borderColor = "#ccc";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        {row?.effected_date ? row.effected_date : "Select Date"}
      </div>
    );
  },
},

          {key: 'last_working_date', label: 'Expected Last Day', type: 'custom'},
          { key: 'attachment', label: 'Attachment', type: 'attachment' },
      ];

      case "termination_request":
      case "end_contract_request":
        return [
          // { key: "resignation_type", label: "Type" },
          {
            key: "Subject",
            label: "Subject",
            type: "description",
            render: (row) => row?.subject,
          },
          { key: 'effected_date', label: 'Effective Date', type: 'date' },
          {key: 'last_working_date', label: 'Expected Last Day', type: 'custom'},
          { key: 'attachment', label: 'Attachment', type: 'attachment' },
        ];

        
      // case "termination_request":
      //   return [
      //     // { key: "resignation_type", label: "Type" },
      //     {
      //       key: "Subject",
      //       label: "Subject",
      //       type: "description",
      //       render: (row) => row?.subject,
      //     },
      //     { key: 'effected_date', label: 'Effective Date', type: 'date' },
      //     {key: 'last_working_date', label: 'Expected Last Day', type: 'custom'},
      //     { key: 'attachment', label: 'Attachment', type: 'attachment' },
      //   ];

        
      // case "end_contract_request":
      //   return [
      //     // { key: "resignation_type", label: "Type" },
      //     {
      //       key: "Subject",
      //       label: "Subject",
      //       type: "description",
      //       render: (row) => row?.subject,
      //     },
      //     { key: 'effected_date', label: 'Effective Date', type: 'date' },
      //     {key: 'last_working_date', label: 'Expected Last Day', type: 'custom'},
      //     { key: 'attachment', label: 'Attachment', type: 'attachment' },
      //   ];

      case "vacation_requests":
        return [
          { key: "vacation_type", label: "Vacation Type" },
          { key: "start_date", label: "Departure Date", type: "date" },
          { key: "return_date", label: "Return Date", type: "date" },
          { key: "paid_days", label: "Paid" },
          { key: "unpaid_days", label: "Unpaid" },
        ];

      case "ticket_requests":
        return [
          { key: "country", label: "Country" },
          { key: "city", label: "City" },
          { key: "ticket_class", label: "Ticket Class" },
          { key: "departure_date", label: "Departure Date", type: "date" },
          { key: "return_date", label: "Return Date", type: "date" },
        ];

      case "business_travels":
        return [
          { key: "country", label: "Country" },
          { key: "city", label: "City" },
          { key: "from_date", label: "Start Date", type: "date" },
          { key: "to_date", label: "End Date", type: "date" },
          { key: "preferred_airline", label: "Preferred Airline" },
          { key: "amount_due", label: "Amount Due" },
        ];

      case "my_documents":
        return [
          {
            key: "document_type",
            label: "Document Type",
            type: "custom",
          },
          {
            key: "Details",
            label: "Details",
            type: "custom",
            render: (row) => {
              return (
                <>
                  <Button onClick={() => onDocumentRowClick(row)}>info</Button>
                </>
              );
            },
          },
          // {
          //   key: "file_name",
          //   label: "File Name",
          //   type: "custom",

          // },
          // { key: "docume", label: "Vacation Type" },
          // { key: "start_date", label: "Departure Date", type: "date" },
          // { key: "return_date", label: "Return Date", type: "date" },
          // { key: "paid_days", label: "Paid" },
          // { key: "unpaid_days", label: "Unpaid" },
        ];

      case "master_data_request":
        return [
          {
            key: "type",
            label: "Request Type",
            type: "custom",
            render: (row) => (
              <span className="capitalize">{row?.type?.replace("_", " ")}</span>
            ),
          },
          {
            key: "old_value",
            label: "Old Value",
            type: "custom",
            render: (row) => <ChangeRequestView request={row} isOld={true} />,  
          },
          {
            key: "new_value",
            label: "New Value",
            type: "custom",
            render: (row) => <ChangeRequestView request={row} isOld={false} />,  
          },
          {
            key: "Details",
            label: "Details",
            type: "custom",
            render: (row) => {
              return (
                <>
                  <Button onClick={() => onMasterDataRowClick(row)}>info</Button>
                </>
              );
            },
          },
          // {
          //   key: "file_name",
          //   label: "File Name",
          //   type: "custom",

          // },
          // { key: "docume", label: "Vacation Type" },
          // { key: "start_date", label: "Departure Date", type: "date" },
          // { key: "return_date", label: "Return Date", type: "date" },
          // { key: "paid_days", label: "Paid" },
          // { key: "unpaid_days", label: "Unpaid" },
        ];

      case "course_applications":
        return [
          { key: "created_at", label: "Created On", type: "date" },
          {
            key: "publisher",
            label: "Publisher",
            type: "custom",
            render: (row) => row?.courses?.publisher,
          },
          {
            key: "courseDetails",
            label: "Course Details",
            type: "description",
            render: (row) => row?.determine_need,
          },
          {
            key: "attachment",
            label: "View Course",
            type: "custom",
            render: (row) => (
              <>
                {row?.attachment_path ? (
                  <a
                    href={row?.attachment_path}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="contained" size="small" color="primary">
                      View Course
                    </Button>
                  </a>
                ) : null}
              </>
            ),
          },
        ];
      case "overtime_requests":
        return [
          { key: "year", label: "Year" },
          { key: "hours", label: "Hours" },
          { key: "minutes", label: "Minutes" },
          { key: "amount", label: "Amount" },
        ];
        case "event_request": 
        return[
          { key: "name", label: "Event Name" },
          { key: "description", label: "Description" },

          { key: "start_date", label: "Start Time" },
          { key: "end_date", label: "End Time"},
          { key: "date", label: "Date Time", type: "date" },
          { key: "location", label: "Location" },

        ]
        case "suggestion_request": 
        return[
             
          { key: "type", label: "Type",  type: "custom", render: (row) => <span className="capitalize">{row?.report_type}</span>},
          { key: "category", label: "Category",  type: "custom",  render: (row) => (
        <div className="capitalize">
          {row?.category ? row?.category?.replace("_", " ") : ""}
        </div>
      ), },
                    { key: "urgency", label: "Urgency",  type: "custom",
      render: (row) => (
        <div className="capitalize">
          {row?.urgency ? row?.urgency?.replace("_", " ") : ""}
        </div>
      ), },

        ]
      default:
        return baseColumns;
    }
  }, [type]);
}

  // start_date: eventData.start_date,
  //         end_date: eventData.end_date,
  //         name: eventData.name,
  //         location: eventData.location,
  //         date: eventData.date,
  //         description: eventData.description,
  //         status: eventData.status,
  //         created_by_id: user.id,
  //         company_id: eventData.company_id || 1,
  //         is_deleted: false,