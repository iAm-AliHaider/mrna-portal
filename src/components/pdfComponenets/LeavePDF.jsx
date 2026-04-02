import React, { useRef } from "react";
import './LeavePDF.css';

const LeavePDF = ({ data, employee }) => {
  const pdfRef = useRef();
  const { quota = [], requests = [] } = data;

  const cellStyle = {
    border: "1px solid #ccc",
    padding: "4px",
    fontWeight: 550,
    fontSize: "8pt",
  };
  return (
    <div ref={pdfRef} id="pdf-content" className="pdf-wrapper">
      {/* HEADER */}
      <section style={{ marginBottom: "1cm" }}>
        <h2>Default Employee Leave Report</h2>
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

      {/* NOTES */}
      <section style={{ marginBottom: "1cm", marginTop: "0.5cm" }}>
        <h3 style={{ marginBottom: "0.5cm", textTransform: "uppercase", color: "#60D0E4" }}>Notes</h3>
        <div style={{ border: "1px solid #ccc", padding: "12px", fontSize: "9pt", borderRadius: "4px" }}>
          {employee.notes || 'N/A'}
        </div>
      </section>

      {/* LEAVE QUOTA TABLE */}
      <section style={{ marginBottom: "1cm" }}>
        <h3 style={{ marginBottom: "0.5cm" }}>Leave Quota</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th style={cellStyle}>Leave Type</th>
              <th style={cellStyle}>Available</th>
              <th style={cellStyle}>Availed</th>
              <th style={cellStyle}>Total</th>
              <th style={cellStyle}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {quota.map((q, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{q.leave_type?.name}</td>
                <td style={cellStyle}>{q.available_leaves}</td>
                <td style={cellStyle}>{q.availed_leaves}</td>
                <td style={cellStyle}>{q.total_leaves}</td>
                <td style={cellStyle}>{new Date(q.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* LEAVE RECORDS TABLE */}
      <section>
        <h3 style={{ marginBottom: "0.5cm" }}>Leave Records</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th style={cellStyle}>Type</th>
              <th style={cellStyle}>Start Date</th>
              <th style={cellStyle}>End Date</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Replacement</th>
              <th style={cellStyle}>Request Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{r.leave_type_name}</td>
                <td style={cellStyle}>{r.start_date}</td>
                <td style={cellStyle}>{r.end_date}</td>
                <td style={cellStyle}>{r.status}</td>
                <td style={cellStyle}>{r.replacement_employee_code}</td>
                <td style={cellStyle}>{new Date(r.created_at).toLocaleDateString()}</td>
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

export default LeavePDF;
