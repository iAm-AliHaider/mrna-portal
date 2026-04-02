import React, { useRef } from "react";
import "./HiringPDF.css";

const HiringReportPDF = ({ data, duration }) => {
  const pdfRef = useRef();

  const cellStyle = {
    border: "1px solid #ccc",
    padding: "4px",
    fontWeight: 550,
    fontSize: "8pt",
  };

  return (
    <div ref={pdfRef} id="pdf-content" className="pdf-wrapper">
      <section style={{ marginBottom: "1cm" }}>
        <h2>Hiring Report</h2>
        <table className="info-table">
          <tbody>
            <tr>
              <td>
                <strong>Report Duration:</strong> Last {duration}
              </td>
              <td>
                <strong>Total Hired:</strong> {data.length}
              </td>
              <td>
                <strong>Generated On:</strong> {new Date().toLocaleDateString()}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* HIRING DATA TABLE */}
      <section>
        <h3 style={{ marginBottom: "0.5cm" }}>Hired Employees</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th style={cellStyle}>Employee Code</th>
              <th style={cellStyle}>Name</th>
              <th style={cellStyle}>Email</th>
              <th style={cellStyle}>Mobile</th>
              <th style={cellStyle}>Designation</th>
              <th style={cellStyle}>Branch</th>
              <th style={cellStyle}>Department</th>
              <th style={cellStyle}>Employment type</th>
              <th style={cellStyle}>Hired At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((emp) => (
              <tr key={emp.id}>
                <td style={cellStyle}>{emp.employee_code}</td>
                <td style={cellStyle}>
                  {[
                    emp.candidates?.first_name,
                    emp.candidates?.second_name,
                    emp.candidates?.family_name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </td>
                <td style={cellStyle}>{emp.candidates?.email}</td>
                <td style={cellStyle}>{emp.candidates?.mobile}</td>
                <td style={cellStyle}>{emp.designations?.name}</td>
                <td style={cellStyle}>{emp.branches?.name}</td>
                <td style={cellStyle}>{emp.organizational_units?.name}</td>
                <td style={cellStyle}>{emp.employment_types?.employment_type}</td>
                <td style={cellStyle}>
                  {new Date(emp.created_at).toLocaleDateString()}
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

export default HiringReportPDF;
