import React, { useState, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../components/common/PageHeadSection";
import SearchInput from "../../../components/common/searchField";
import DynamicTable from "../../../components/tables/AnnouncementsTable";
import CustomMenu from "../../../components/common/CustomMenu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../supabaseClient";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { useNavigate } from "react-router-dom";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Employees" },
  { title: "My Surveys" },
];

export default function MySurveysPage() {
  const { user } = useUser();
  const employeeId = user?.id;
  const companyId = user?.company_id;
  const navigate = useNavigate();

  const checkIfSubmisionDateExist = (row) => {
    return 1;
  };
  const handleSurveyView = (surveyId) => {
    navigate(`/employees/surveys/${surveyId}`);
  };
  const handleResponseSurvey = (surveyId) => {
    navigate(`/employees/surveys/response/${surveyId}`);
  };

  const surveyColumns = [
    { key: "employee_code", label: "Employee Code" },
    { key: "employee_name", label: "Employee Name" },
    { key: "questionnaire_type", label: "Questionnaire Type" },
    { key: "survey_title", label: "Survey Title" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Survey Status" },
    { key: "creation_date", label: "Creation Date" },
    { key: "submission_date", label: "Submission Date" },
    {
      type: "custom",
      label: "Actions",
      render: (row) => (
        (
          <CustomMenu
            items={[
              {
                label: "Add Response",
                icon: <QuestionAnswerIcon fontSize="small" />,
                // action: () => console.log("View", row.survey_id),
                disabled: row.submission_date !== "-",
                action: () => handleSurveyView(row?.survey_id),
              },
              {
                label: "View Response",
                icon: <RemoveRedEyeIcon fontSize="small" />,
                action: () => handleResponseSurvey(row?.survey_id),
                disabled: row.submission_date == "-",
              },
              // {
              //   label: "Edit response",
              //   icon: <EditIcon fontSize="small" />,
              //   action: () => console.log("Edit", row.survey_id),
              // }
            ]}
          />
        )
      ),
    },
  ];

  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Employees" },
    { title: "My Surveys" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [surveys, setSurveys] = useState([]);
  const [surveysLoading, setSurveyLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!employeeId || !companyId) return;

    const fetchSurveys = async () => {
      setSurveyLoading(true)
      const offset = (currentPage - 1) * perPage;
      const { data, error } = await supabase.rpc("get_surveys_for_employee", {
        p_company_id: companyId,
        p_employee_id: employeeId,
        p_search: searchQuery.trim() || null,
        p_created_from: null,
        p_created_to: null,
        p_submitted_from: null,
        p_submitted_to: null,
        p_limit: perPage,
        p_offset: offset,
      });

      if (error) {
        setSurveys([]);
        setTotalCount(0);
        setSurveyLoading(false)
      } else {
        setSurveys(
          data.map((r) => ({
            survey_id: r.survey_id,
            employee_code: r.employee_code,
            employee_name: r.employee_name,
            questionnaire_type: r.questionnaire_type,
            survey_title: r.survey_title,
            priority: r.priority,
            status: r.status,
            creation_date: new Date(r.creation_date).toLocaleDateString(),
            submission_date: r.submission_date
              ? new Date(r.submission_date).toLocaleDateString()
              : "-",
          }))
        );
        // overall_count is same on every row
        setTotalCount(data.length > 0 ? data[0].overall_count : 0);
        setSurveyLoading(false)
      }
    };

    fetchSurveys();
  }, [employeeId, companyId, searchQuery, currentPage, perPage]);

  return (
    <PageWrapperWithHeading title="My Surveys" items={breadcrumbItems}>
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search survey title..."
          />
        </div>

        <DynamicTable
          columns={surveyColumns}
          data={surveys}
          showCheckbox={false}
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / perPage) || 1}
          perPage={perPage}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          footerInfo={`Showing ${surveys.length} of ${totalCount}`}
          onAction={(row, key) => console.log("Action", key, "on", row)}
          loading={surveysLoading}
        />
      </div>
    </PageWrapperWithHeading>
  );
}
