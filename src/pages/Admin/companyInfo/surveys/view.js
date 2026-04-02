import React from "react";
import { useParams } from "react-router-dom";
import Surveys from "./surveys";
import { useViewSurveyId } from "../../../../utils/hooks/api/surveys";


const ViewSurvey = () => {
  const params = useParams();
  const surveyId = params.id;
  const { data, loading } = useViewSurveyId(surveyId);

  if (loading) return <div>Loading...</div>;

  return <Surveys data={data} />;
};

export default ViewSurvey;
