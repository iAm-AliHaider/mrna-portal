import React, { useRef } from "react";
import './AttendancePDF.css'
const AttendancePDF = ({ data, employee }) => {
  const pdfRef = useRef();

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
        <h2>Default Employee Attendance Report</h2>
        <table className="info-table">
          <tbody>
            <tr>
              <td><strong>Employee Name:</strong> {employee.full_name}</td>
              <td><strong>Designation:</strong> {employee.designation_name}</td>
              <td><strong>Account Status:</strong> <span>{employee.user_status}</span></td>
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
          {employee?.notes}
        </div>
      </section>
      {/* TABLE */}
      <section>
        <h2>Attendance Sheet</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th style={cellStyle}>Employee Code</th>
              <th style={cellStyle}>Full Name</th>
              <th style={cellStyle}>Designation Name</th>
              <th style={cellStyle}>Check In Time</th>
              <th style={cellStyle}>Check Out Time</th>
              <th style={cellStyle}>Break Start Time</th>
              <th style={cellStyle}>Break End Time</th>
              <th style={cellStyle}>Break Availed</th>
              <th style={cellStyle}>Time In Office</th>
              <th style={cellStyle}>Attendance Date</th>
              <th style={cellStyle}>Overall Count</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{item.employee_code}</td>
                <td style={cellStyle}>{item.full_name}</td>
                <td style={cellStyle}>{item.designation_name}</td>
                <td style={cellStyle}>{item.check_in_time}</td>
                <td style={cellStyle}>{item.check_out_time}</td>
                <td style={cellStyle}>{item.break_start_time}</td>
                <td style={cellStyle}>{item.break_end_time}</td>
                <td style={cellStyle}>{item.break_availed}</td>
                <td style={cellStyle}>{item.time_in_office}</td>
                <td style={cellStyle}>{item.attendance_date}</td>
                <td style={cellStyle}>{item.overall_count}</td>
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

export default AttendancePDF;