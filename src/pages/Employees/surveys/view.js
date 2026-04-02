import React from "react";
import { useParams } from "react-router-dom";
import SurveyForm from "./form";
import { useViewEmployeeSurveyId } from "../../../utils/hooks/api/employeeMySurvey";

const ViewMySurvey = () => {
  const params = useParams();
  const surveyId = params.id;
  const { data, loading } = useViewEmployeeSurveyId(surveyId);

  if (loading) return <div>Loading...</div>;

  return data?.id ? <SurveyForm data={data} isView={false} /> : null;
};

export default ViewMySurvey;
