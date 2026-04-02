import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export const useSubmittedSurveysList = (
  page = 0,
  perPage = 10,
  searchTerm = ""
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useUser();
  const companyId = user?.company_id;

  const fetchSubmittedSurveys = async () => {
    if (!companyId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {

      let query = supabase
        .from("survey_assignments")
        .select(
          `
          *,
          survey: surveys!survey_assignments_survey_id_fkey!inner(
            id,
            survey_name,
            survey_type,
            priority,
            status,
            created_at,
            company_id
          ),
          employee: employees!survey_assignments_employee_id_fkey (
            id,
            employee_code,
            candidate: candidates!employees_candidate_id_fkey (
              id,
              first_name,
              second_name,
              third_name,
              forth_name,
              family_name
            )
          )
        `,
          { count: "exact" }
        )
        .not("survey_response", "is", null)
        .eq("survey.company_id", companyId)
        .order("updated_at", { ascending: false });

      if (searchTerm?.trim()) {
        query = query.filter(
          "survey.survey_name",
          "ilike",
          `%${searchTerm.trim()}%`
        );
        // query = query.or(`survey.survey_name.ilike.%${searchTerm}%`)
      }

      // Pagination
      const from = page * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data: surveyData, error: dataError, count } = await query;

      if (dataError) {
        console.error("Data error:", dataError);
        throw dataError;
      }

      // Transform the data to match the expected format
      const transformedData = surveyData.map((item) => ({
        survey_id: item.survey?.id,
        employee_code: item.employee?.employee_code || "N/A",
        employee_name: `${item.employee?.candidate?.first_name || ""} ${
          item.employee?.candidate?.second_name || ""
        } ${item.employee?.candidate?.third_name || ""} ${
          item.employee?.candidate?.forth_name || ""
        } ${item.employee?.candidate?.family_name || ""}`,
        questionnaire_type: item.survey?.survey_type || "",
        survey_title: item.survey?.survey_name || "",
        priority: item.survey?.priority || "",
        status: item.response_status || "",
        creation_date: item.survey?.created_at,
        submission_date: item.updated_at,
      }));

      setData(transformedData);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching submitted surveys:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmittedSurveys();
  }, [companyId, page, perPage, searchTerm]);

  const refetch = () => {
    fetchSubmittedSurveys();
  };

  return {
    submittedSurveysData: data,
    totalCount,
    loading,
    error,
    refetch,
  };
};
