import { useParams } from "react-router-dom";
import SurveyForm from "./form";
import { useResponseEmployeeSurvey } from "../../../utils/hooks/api/employeeMySurvey";

const ResponseMySurvey = () => {
  const params = useParams();
  const surveyId = params.id;
  const { data, loading } = useResponseEmployeeSurvey(surveyId);

  if (loading) return <div>Loading...</div>;

  return <SurveyForm data={data} isView={true} />;
};

export default ResponseMySurvey;
