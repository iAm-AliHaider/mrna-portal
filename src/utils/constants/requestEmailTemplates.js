export const requestEmailTemplates = {
  "Leave Request": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Leave Request Submitted</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has submitted a leave request for approval from date: ${requestData?.start_date} to date: ${requestData?.end_date}.</p>
    <p>Please review and take the necessary action.</p>
  `,

  "Loan Request": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Loan Request Received</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has applied for a company loan.</p>
    <h3>Loan Details</h3>
    <ul style="list-style-type: disc; margin-left: 20px;">
      <li>Loan Amount: ${requestData?.requested_amount}</li>
      <li>Repayment Period: ${requestData?.duration} months</li>
      <li>Purpose: ${requestData?.reason}</li>
      <li>Requested Date: ${requestData?.request_date}</li>
    </ul>
    <p>Kindly review and process accordingly.</p>
  `,

  "Resignation Request": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Resignation Submitted</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has submitted a resignation request.</p>
    <p>The request for Resignation was submitted on the date ${requestData?.effected_date} and the reason for the resignation is the ${requestData?.resignation}. 
    ${requestData?.last_working_date} will be considered as last day of the ${employeeName}.</p>
    <p>Please initiate the offboarding process.</p>
  `,

  "Documents Request": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Documents Request</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has requested for the ${requestData?.document_type} documents.</p>
    <p>Kindly review and share the required files.</p>
  `,

  "Master Data Request": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Master Data Update Request</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has requested updates to their ${requestData?.type} record.</p>
    <p>Please review and make the necessary corrections.</p>
  `,

  "Allowance Request": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Allowance Request Received</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has requested for the allowance following the reason "${requestData?.reason}" of Amount:${requestData?.amount} on Date: ${requestData?.requested_date}.</p>
    <p>Review and process according to HR policy.</p>
  `,

  "Attendance Request": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Attendance Adjustment Request</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has submitted an ${requestData?.request_type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")} request related to attendance for the
    date: ${requestData?.original_date}.</p>
    <h4>Request Details:</h4>
    <ul style="list-style-type: disc; margin-left: 20px;">
      <li>Reason: ${requestData?.reason}</li>
      <li>Date: ${requestData?.original_date}</li>
      <li>Start Time: ${requestData?.start_time || "N/A"}</li>
      <li>End Time: ${requestData?.end_time || "N/A"}</li>
    </ul>
    <p>Please verify and update the attendance records accordingly.</p>
  `,

  "Expense Claim Request": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Expense Claim Submitted</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has submitted an expense claim of amount ${requestData?.amount} for Reason: ${requestData?.reason} on Date:${requestData?.requested_date} for approval.</p>
    <p>Kindly review and approve or reject based on receipts and policies.</p>
  `,

  "Advance Salary": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Advance Salary Request</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has applied for an advance salary payment. His Salary is ${requestData?.amount} requested on ${requestData?.requested_date}, metioned the reason ${requestData?.reason}.</p>
    <p>Please process as per company policy.</p>
  `,

  "Asset Transaction": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>Asset Allotment Request</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has requested for an allotment of Asset to Employee.</p>
    <p>Please process as per company policy.</p>
  `,

  "General Documents": (employeeName, employeeId, requestData) => `
    <div class="header">
      <h2>General Document Request</h2>
    </div>
    <p>${employeeName} (Employee ID: ${employeeId}) has submitted a general document request.</p>
    <p>Review and respond accordingly.</p>
  `,
};

// export const approvalEmailTemplate =  {
//   "Leave Approval": (employeeName, employeeId, requestData) => `
//     <div class="header">
//       <h2>Leave Request Submitted</h2>
//     </div>
//     <p>${employeeName} (Employee ID: ${employeeId}) has submitted a leave request for approval from date: ${requestData?.start_date} to date: ${requestData?.end_date}.</p>
//     <p>Please review and take the necessary action.</p>
//   `,
// }
