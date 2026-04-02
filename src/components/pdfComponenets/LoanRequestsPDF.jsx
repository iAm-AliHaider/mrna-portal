import React, { useRef } from "react";
import "./LoanRequestsPDF.css";

const cellStyle = {
  border: "1px solid #ccc",
  padding: "4px",
  fontWeight: 550,
  fontSize: "8pt",
};

const LoanRequestsPDF = ({ data, employee }) => {
  const pdfRef = useRef();

  return (
    <div ref={pdfRef} id="pdf-content" className="pdf-wrapper">
      {/* HEADER */}
      <section style={{ marginBottom: "1cm" }}>
        <h2>Loan Requests Report</h2>
        <table className="info-table">
          <tbody>
          <tr>
              <td><strong>Employee Name:</strong> {employee.full_name}</td>
              <td><strong>Designation:</strong> {employee.designation_name}</td>
              <td><strong>Account Status:</strong> {employee.user_status || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Employee Code:</strong> {employee.employee_code}</td>
              <td><strong>Employment Status:</strong> {employee.employment_status}</td>
              <td><strong>Department:</strong> {employee.department}</td>
            </tr>
            <tr>
              <td><strong>Mobile:</strong> {employee.mobile}</td>
              <td><strong>Employment Type:</strong> {employee.employment_type}</td>
              <td><strong>Shift:</strong> {employee.shift}</td>
            </tr>
            <tr>
              <td><strong>Work Email:</strong> {employee.work_email}</td>
              <td><strong>Permanent Email:</strong> {employee.permanent_email}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* TABLE */}
      <section>
        <h2>Requests</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th style={cellStyle}>Request Date</th>
              <th style={cellStyle}>Requested Amount</th>
              <th style={cellStyle}>Approved Amount</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Reason</th>
              <th style={cellStyle}>Notes</th>
              <th style={cellStyle}>Manager Approve</th>
                            <th style={cellStyle}>HOD Approve</th>
              <th style={cellStyle}>HR Approve</th>
              <th style={cellStyle}>HR Manager Approve</th>
              <th style={cellStyle}>Reminder Count</th>
              <th style={cellStyle}>Escalated</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{item?.request_date}</td>
                <td style={cellStyle}>{item?.requested_amount}</td>
                <td style={cellStyle}>{item?.approved_amount}</td>
                <td style={cellStyle}>{item?.status}</td>
                <td style={cellStyle}>{item?.reason}</td>
                <td style={cellStyle}>{item?.notes}</td>
                <td style={cellStyle}>{item?.is_manager_approve}</td>
                <td style={cellStyle}>{item?.is_hod_approve}</td>
                <td style={cellStyle}>{item?.is_hr_approve}</td>
                <td style={cellStyle}>{item?.is_hr_manager_approve}</td>
                <td style={cellStyle}>{item?.reminder_count}</td>
                <td style={cellStyle}>
                  {item.escalated ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FOOTER */}
      <aside className="pdf-footer">
        This is an electronically generated report. No signature is required.
      </aside>
    </div>
  );
};

export default LoanRequestsPDF;
