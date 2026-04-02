import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, Button, Stack } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import DynamicTable from "../../../components/tables/AnnouncementsTable";
import AnnouncementModal from "../../../components/common/Modal/announcement";
import SurveyFormModal from "./SurveyFormModal";

const columns = [
  { key: "employee_code", label: "Employee Code" },
  { key: "survey_title", label: "Survey Title" },
  { key: "questionnaire_type", label: "Questionnaire Type" },
  { key: "priority", label: "Priority" },
  { key: "creation_date", label: "Creation Date" },
];

const ServaysListModal = ({ user }) => {
  const [openModal, setOpenModal] = useState(false);
  const [surveys, setSurveys] = useState();
  const [loadingSurveys, setLoadingSurveys] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  async function fetchServeys() {
    setLoadingSurveys(true);
    const { data, error } = await supabase.rpc("get_surveys_for_employee", {
      p_employee_id: user?.id,
      p_company_id: user?.company_id,
    });

    if (error) {
      console.error(error);
      toast.error("Could not load surveys");
      setSurveys([]);
    } else {
      if (data?.length) {
        const rows = (data || [])
          .filter(
            (row) =>
              row?.priority?.toLowerCase() === "high" && !row.submission_date
          )
          .map((row) => ({
            id: row.survey_id,
            employee_code: row.employee_code,
            employee_name: row.employee_name,
            survey_title: row.survey_title,
            status: row.status,
            creation_date: row?.creation_date
              ? new Date(row.creation_date).toLocaleDateString()
              : "",
            priority: row.priority,
            questionnaire_type: row.questionnaire_type,
          }));

        
        if (rows?.length) {
          setSurveys(rows);
          setOpenModal(true);
        } else {
          setSurveys([]);
          setOpenModal(false);
        }
      }
    }
    setLoadingSurveys(false);
  }

  useEffect(() => {
    if (user) {
      fetchServeys();
    }
  }, [user]);

  return (
    <>
      <Dialog open={openModal} maxWidth="lg" fullWidth>
        <DialogTitle>My Surveys</DialogTitle>
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <DynamicTable
            columns={columns}
            data={surveys}
            loading={loadingSurveys}
            showPagination={false}
            onRowClick={(id) => setCurrentData(id)}
            rowCursor={true}
          />
          {currentData ? (
            <SurveyFormModal
              currentData={currentData}
              setCurrentData={setCurrentData}
              refetchServeys={fetchServeys}
            />
          ) : null}
        </div>
      </Dialog>
    </>
  );
};

export default ServaysListModal;
