import React, { useState, useEffect } from "react";
import { Dialog, Box } from "@mui/material";
import SurveyForm from "./form";
import { useViewEmployeeSurveyId } from "../../../utils/hooks/api/employeeMySurvey";

const SurveyFormModal = ({
  currentData,
  setCurrentData,
  refetchServeys
}) => {
  const [openModal, setOpenModal] = useState(true);
  const { data, loading } = useViewEmployeeSurveyId(currentData);

  const handleModalClose = async () => {
    setOpenModal(false);
    setCurrentData(null);
    refetchServeys();
  };

  return (
    <Dialog open={openModal} maxWidth="lg" fullWidth>
      <Box sx={{ padding: 3, backgroundColor: "white", borderRadius: 2 }}>
        {loading ? <div>Loading...</div> : <SurveyForm data={data} handleClose={handleModalClose} modalView={true} />}
      </Box>
    </Dialog>
  );
};

export default SurveyFormModal;
