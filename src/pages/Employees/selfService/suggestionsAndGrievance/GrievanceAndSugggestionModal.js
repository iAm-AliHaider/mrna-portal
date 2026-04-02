import React, { useState } from "react";
import { useUser } from "../../../../context/UserContext";
import { useUpdateSuggestionsAndGrievance } from "../../../../utils/hooks/api/suggestionsAndGrievance";
import SelectField from "../../../../components/common/SelectField";
import { toast } from "react-hot-toast";
import InputField from "../../../../components/common/FormikInputField/Input";

import { useCompanyEmployeesWithoutMyId } from "../../../../utils/hooks/api/emplyees";

import Modal from "../../../../components/common/Modal";
import { Button } from "@mui/material";
const GrievanceAndSuggestionModal = ({
  isOpen,
  onClose,
  selectedRecord,
  loading,
  onStatusUpdate,
}) => {
  const { user } = useUser();
  const { updateSuggestionsAndGrievance, loading: updateLoading } =
    useUpdateSuggestionsAndGrievance();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  // inside your component:
  const [delegateEmployeeId, setDelegateEmployeeId] = useState(null);

  // robust handler (works whether SelectField passes an option object or a raw value)
  const handleEscalationChange = (val) => {
    // If your SelectField returns { value, label }
    if (val && typeof val === "object" && "value" in val) {
      setDelegateEmployeeId(val.value ?? null);
    } else {
      // If it returns a raw value or a native event
      const raw = val?.target?.value !== undefined ? val.target.value : val;
      setDelegateEmployeeId(raw ?? null);
    }
  };

  // Allow HR, HR Manager, or the user assigned to the record to update status
  // let canUpdateStatus =
  // (user?.role === "hr" ||
  //  user?.role === "hr_manager" ||
  //  user?.id === selectedRecord?.assigned_to_id ||
  //   user?.id === selectedRecord?.escalation_level && selectedRecord.report_type === "grievance"
  // )  &&
  // selectedRecord?.status !== "declined" &&
  // selectedRecord?.status !== "close";

  // // Special case: reporter can update if their grievance is accepted
  // if (
  //   user?.id === selectedRecord?.reporter_employee_id &&
  //   selectedRecord?.report_type === "grievance" &&
  //   selectedRecord?.status === "accepted"
  // ) {
  //   canUpdateStatus = true;
  // }

  // Helpers
  const isHR = user?.role === "hr" || user?.role === "hr_manager";
  const isAssignee = user?.id === selectedRecord?.assigned_to_id;
  const isEscalationOwner =
    user?.id === selectedRecord?.escalation_level &&
    selectedRecord?.report_type === "grievance";

  const isReporterAcceptedGrievance =
    user?.id === selectedRecord?.reporter_employee_id &&
    selectedRecord?.report_type === "grievance" &&
    selectedRecord?.status === "accepted";

  const isStatusOpen =
    selectedRecord?.status !== "declined" && selectedRecord?.status !== "close";

  let canUpdateStatus;

  // HR/HR Manager rule:
  // - false if status is "accepted"
  // - true if record is escalated
  // - otherwise false
  if (isHR) {
    if (selectedRecord?.status === "accepted") {
      canUpdateStatus = false;
    } else if (selectedRecord?.escalated === true) {
      canUpdateStatus = true && isStatusOpen;
    } else {
      canUpdateStatus = false;
    }
  } else {
    // Everyone else follows the general rule
    canUpdateStatus =
      (isAssignee || isEscalationOwner || isReporterAcceptedGrievance) &&
      isStatusOpen;
  }

  const { employees, loading: employeesLoading } =
    useCompanyEmployeesWithoutMyId();

  // Transform employee data to match the expected format for dropdowns
  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label:
      `${emp?.employee_code || ""} - ${emp.candidates?.first_name || ""} ${
        emp.candidates?.second_name || ""
      } ${emp.candidates?.third_name || ""} ${
        emp.candidates?.forth_name || ""
      } ${emp.candidates?.family_name || ""}`.trim() || `Employee #${emp.id}`,
  }));

  // Get status options based on report type
  const getStatusOptions = (reportType) => {
    if (reportType === "suggestion") {
      return [
        { label: "Pending", value: "pending" },
        { label: "Accepted", value: "accepted" },
        { label: "Declined", value: "declined" },
        { label: "Close", value: "close" },
      ];
    } else if (reportType === "grievance") {
      const isReporter = selectedRecord?.reporter_employee_id === user?.id;
      // Reporter sees "Close", everyone else sees "Solved"
      const finalLabel = isReporter ? "Close" : "Solved";
      const finalValue = isReporter ? "close" : "solved";

      return [
        { label: "Pending", value: "pending" },
        { label: "Accept", value: "accepted" },
        { label: "In Action", value: "in_action" },
        { label: finalLabel, value: finalValue },
      ];
    }
    return [];
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !selectedRecord || !statusNote.trim()) {
      toast.error("Please provide a note for the status update.");
      return;
    }

    try {
      const result = await updateSuggestionsAndGrievance(
        selectedRecord.id,
        selectedStatus,
        statusNote,
        delegateEmployeeId,
        user,
        selectedRecord
      );
      if (result && !result.error) {
        setSelectedStatus("");
        setStatusNote("");
        setDelegateEmployeeId("");
        if (onStatusUpdate) onStatusUpdate();
        onClose();
      }
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status.");
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateStr) => dateStr || "—";
  const formatEmployeeArray = (employees) => {
    if (!employees || !Array.isArray(employees)) return "—";
    return employees.map((emp) => emp.first_name || "Unknown").join(", ");
  };

  const getLabelClass = (value) =>
    `inline-block px-1.5 py-0.5 text-xs rounded border ${
      value === "High"
        ? "text-red-700 border-red-300 bg-red-50"
        : value === "Medium"
        ? "text-yellow-700 border-yellow-300 bg-yellow-50"
        : value === "Low"
        ? "text-green-700 border-green-300 bg-green-50"
        : "text-gray-600 border-gray-300 bg-gray-50"
    }`;

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-700 border-yellow-300 bg-yellow-50";
      case "accepted":
        return "text-green-700 border-green-300 bg-green-50";
      case "in_action":
        return "text-blue-700 border-blue-300 bg-blue-50";
      case "declined":
        return "text-red-700 border-red-300 bg-red-50";
      default:
        return "text-gray-600 border-gray-300 bg-gray-50";
    }
  };

  // Use shared Modal component
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Suggestion & Grievance Details"
    >
      {loading ? (
        <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
      ) : selectedRecord ? (
        <div className="space-y-3">
          {/* Status Update Section for HR */}
          {!canUpdateStatus && (
            <div className="text-sm italic mb-3 font-medium text-md text-center text-red-900">
              This record is marked as "{selectedRecord?.status}" and cannot be
              updated.
            </div>
          )}
          {canUpdateStatus && (
            <section className="bg-gray-50 p-3 rounded-lg border">
              <h3 className="text-md font-semibold text-primary mb-2 border-b border-gray-200 pb-1">
                Update Status
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <SelectField
                      options={getStatusOptions(selectedRecord.report_type)}
                      placeholder="Select new status"
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                    />
                  </div>
                </div>
                {selectedStatus && (
                  <div>
                    <InputField
                      label="Status Note"
                      placeholder="Add a note about this status change (required)"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      required
                      className="mt-2 w-full"
                    />
                  </div>
                )}

                {user?.id === selectedRecord?.escalation_level &&
                  selectedRecord.report_type === "grievance" && (
                    <div>
                      <SelectField
                        name="escalation_level"
                        label="Delegate to another employee"
                        options={employeeOptions}
                        isLoading={employeesLoading}
                        value={delegateEmployeeId} // string/number
                        onChange={handleEscalationChange}
                        // onValueChange={handleEscalationChange}
                      />
                    </div>
                  )}
              </div>
              <div className="flex flex-row-reverse mt-3">
                <Button
                  onClick={handleStatusUpdate}
                  variant="contained"
                  disabled={!selectedStatus || updateLoading}
                  className="px-3 py-1  bg-primary text-white text-xs rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updateLoading ? "Updating..." : "Update"}
                </Button>
              </div>
            </section>
          )}

          {/* Basic Info & Dates Combined */}
          <section>
            <h3 className="text-md font-semibold text-primary mb-1 border-b border-gray-200 pb-1">
              Basic Information
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Field label="Type" value={selectedRecord.report_type} />
              <Field label="Category" value={selectedRecord.category} />
              <Field
                label="Status"
                value={
                  <span
                    className={`inline-block px-1.5 py-0.5 text-xs rounded border ${getStatusClass(
                      selectedRecord.status
                    )}`}
                  >
                    {selectedRecord.status}
                  </span>
                }
              />
              <Field
                label="Urgency"
                value={
                  <span className={getLabelClass(selectedRecord.urgency)}>
                    {selectedRecord.urgency}
                  </span>
                }
              />
              <Field
                label="Priority"
                value={
                  <span className={getLabelClass(selectedRecord.priority)}>
                    {selectedRecord.priority}
                  </span>
                }
              />
              <Field
                label="Report Date"
                value={formatDate(selectedRecord.report_date)}
              />
            </div>
          </section>

          {/* People Involved */}
          <section>
            <h3 className="text-md font-semibold text-primary mb-1 border-b border-gray-200 pb-1">
              People Involved
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Field
                label="Reporter"
                value={selectedRecord.reporter_name || "—"}
              />
              <Field
                label="Assigned To"
                value={selectedRecord.assigned_to_name || "—"}
              />
              <Field
                label="Reviewed By"
                value={selectedRecord.reviewed_by_name || "—"}
              />
              <Field
                label="Created By"
                value={selectedRecord.created_by_name || "—"}
              />
              <Field
                label="Employees Involved"
                value={formatEmployeeArray(selectedRecord.employees_involved)}
              />
              <Field
                label="Witnesses"
                value={formatEmployeeArray(selectedRecord.witnesses)}
              />
            </div>
          </section>

          {/* Content */}
          <section>
            <h3 className="text-md font-semibold text-primary mb-1 border-b border-gray-200 pb-1">
              Content & Notes
            </h3>
            <div className="space-y-1 text-xs">
              <Field
                label="Description"
                value={selectedRecord.description || "—"}
              />
              <Field
                label="Action Expected"
                value={selectedRecord.action_expected || "—"}
              />
              <Field
                label="Action Taken"
                value={selectedRecord.action_taken || "—"}
              />
              <Field
                label="Review Notes"
                value={selectedRecord.review_notes || "—"}
              />
              <Field
                label="Resolution Notes"
                value={selectedRecord.resolution_notes || "—"}
              />
            </div>
          </section>

          {/* Additional Info */}
          <section>
            <h3 className="text-md font-semibold text-primary mb-1 border-b border-gray-200 pb-1">
              Additional Information
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Field
                label="Closed Date"
                value={formatDate(selectedRecord.closed_date)}
              />
              <Field
                label="Resolution Date"
                value={formatDate(selectedRecord.resolution_date)}
              />
              <Field
                label="Escalation Level"
                value={selectedRecord.escalation_level || "Not set"}
              />
              <Field
                label="Created At"
                value={formatDate(selectedRecord.created_at)}
              />
              <Field
                label="Updated At"
                value={formatDate(selectedRecord.updated_at)}
              />
              <Field label="Record ID" value={selectedRecord.id} />
            </div>
          </section>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">
          No data available
        </div>
      )}
    </Modal>
  );
};

// Reusable field component
const Field = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-xs font-medium mb-0.5">{label}</p>
    <p className="text-gray-800 text-xs">{value}</p>
  </div>
);

export default GrievanceAndSuggestionModal;
