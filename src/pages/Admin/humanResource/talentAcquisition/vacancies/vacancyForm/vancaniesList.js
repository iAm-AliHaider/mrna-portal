// VacancyTable.jsx
import React, { useState, useEffect } from "react";
import DynamicTable from "../../../../../../components/tables/AnnouncementsTable";
import { supabase } from "../../../../../../supabaseClient";
import { Button } from "@mui/material";

const vacancyColumns = [
  { key: "jobTitle", label: "Job Title" },
  { key: "vacanciesToFill", label: "Number of vacancies to be filled" },
  { key: "positionsFilled", label: "Number of positions already filled" },
  { key: "positionsRemaining", label: "Remaining positions to fill" },
  { key: "vacancyDeadline", label: "Date to fill vacancy by" },
  {
    key: "actions",
    label: "",
    type: "custom",
    render: (row) => (
      <Button
        variant="contained"
        color="primary"
        onClick={() => alert(`Showing results for ${row.jobTitle}`)}
      >
        Show Results
      </Button>
    ),
  },
];

const VacancyTable = ({ reloadKey = 0 }) => {
  const [vacancyData, setVacancyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Whenever `reloadKey` changes, re-fetch from Supabase
  useEffect(() => {
    const fetchVacancies = async () => {
      setLoading(true);
      // For simplicity, we assume positionsFilled = 0 for now.
      const { data, error } = await supabase
        .from("vacancy")
        .select("id, title, no_of_vacancies, date_to_fill_by")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vacancies:", error.message);
        setVacancyData([]);
      } else {
        const rows = data.map((v) => ({
          id: v.id,
          jobTitle: v.title,
          vacanciesToFill: v.no_of_vacancies,
          positionsFilled: 0, // Placeholder; adjust if you have that field
          positionsRemaining: v.no_of_vacancies, // no_of_vacancies − positionsFilled
          vacancyDeadline: v.date_to_fill_by
            ? new Date(v.date_to_fill_by).toLocaleDateString()
            : "-",
          actions: "Show Results",
        }));
        setVacancyData(rows);
      }
      setLoading(false);
    };

    fetchVacancies();
  }, [reloadKey]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "1rem" }}>Loading…</div>;
  }

  return (
    <DynamicTable
      columns={vacancyColumns}
      data={vacancyData}
      showCheckbox={true}
      footerInfo={`Showing ${vacancyData.length
        .toString()
        .padStart(2, "0")} vacancies`}
      onColumnAction={(rowId, key) => {
        if (key === "actions") {
          const row = vacancyData.find((r) => r.id === rowId);
          if (row) alert(`Showing results for ${row.jobTitle}`);
        }
      }}
      showPagination={false}
    />
  );
};

export default VacancyTable;
