// hooks/useEmployeesWithCandidates.js
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export function useSurvey(page = 0, pageSize = 10, searchQuery = "", employeeId  = null) {
  const [surveyData, setSurveyData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [surveyName, setSurveyName] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
     const fetchSurveys = async () => {
       // if (!employeeId?.id) return
       if (!employeeId) return;
   
       try {
         // Adjust query based on your Supabase table and column names
         const from = page * pageSize;
         const to = from + pageSize - 1;
         const { data, error, count:totalCount } = await supabase
           .from("survey_assignments")
           .select(
             `
         survey_id,
          response_id,
       survey_responses(
         submitted_at
       ),
         surveys!inner (
         id,
           survey_name,
           survey_type,
           created_at,
           employee_id,
           employees!surveys_employee_id_fkey (
             id,
             employee_code,
             user_status,
             candidate_id,
             candidates!employees_candidate_id_fkey(
               id,
               first_name,
               second_name,
               third_name,
               email
             )
           )
         )
       `,
             { count: "exact" }
           )
           .eq("employee_id", employeeId)
           .ilike("surveys.survey_name", `%${searchQuery}%`)
           .order("survey_id", { ascending: true })
           .range(from, to);
   
         if (error) {
           console.error("Error fetching surveys:", error);
           return;
         }
         setCount(totalCount || 0); 
         setTotalPages(Math.ceil((totalCount || 0) / pageSize));
   
         // setSurveyData(data);
         if (!error && data) {
           // data is an array of “survey_assignment” rows with a nested `surveys` object
           const onlySurveys = data.map((assignment) => ({
             "Employee Code":
               assignment?.surveys?.employees?.employee_code || "N/A",
             "Employee Name":
               assignment?.surveys?.employees?.candidates?.first_name +
                 " " +
                 (assignment?.surveys?.employees?.candidates?.second_name || "") +
                 " " +
                 (assignment?.surveys?.employees?.candidates?.third_name || "") ||
               "N/A",
             "Questionnaire Type": assignment?.surveys?.survey_type || "N/A",
             "Survey Name": assignment?.surveys?.survey_name || "N/A",
             "Creation Date": new Date(
               assignment?.surveys?.created_at
             ).toLocaleDateString(),
             submissionDate: assignment?.surveys?.submission_date
               ? new Date(
                   assignment?.surveys?.submission_date
                 ).toLocaleDateString()
               : "Not Submitted",
           }));
           setSurveyData(onlySurveys);
           const surveynameData = onlySurveys.map((surveyData) => ({
             label: surveyData["Survey Name"],
             value: surveyData["Survey Name"],
           }));
           setSurveyName(surveynameData);
         }
       } catch (error) {
         console.error("Error fetching surveys:", error);
        setError(error);
       }
     };
    fetchSurveys()
  }, [searchQuery, page, employeeId, pageSize]);

  return { surveyData, totalPages, surveyName, error, count };
}
