import React from "react";
import html2pdf from "html2pdf.js";

const DownloadPDFButton = ( {reportName} ) => {
  const handleDownload = () => {
    const element = document.getElementById("pdf-content");
    const opt = {
      margin:       0,
      filename:     `${reportName}_${new Date().toISOString().slice(0, 10)}.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: "in", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <button onClick={handleDownload} style={{ marginTop: "20px", padding: "8px 16px", background: "#60D0E4", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
      Download PDF
    </button>
  );
};

export default DownloadPDFButton;
