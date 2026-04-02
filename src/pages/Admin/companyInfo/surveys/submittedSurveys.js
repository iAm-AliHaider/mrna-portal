import React, { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchInput from "../../../../components/common/searchField";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import CustomMenu from "../../../../components/common/CustomMenu";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useNavigate } from "react-router-dom";
import { useSubmittedSurveysList } from "../../../../utils/hooks/api/submittedSurveys";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Company Info" },
  { title: "Submitted Surveys" },
];

export default function SubmittedSurveysPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Use the submitted surveys hook
  const { 
    submittedSurveysData, 
    totalCount, 
    loading, 
    error 
  } = useSubmittedSurveysList(currentPage - 1, perPage, searchQuery);

  const handleSurveyView = (surveyId) => {
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
        <CustomMenu
          items={[
            {
              label: "View Response",
              icon: <RemoveRedEyeIcon fontSize="small" />,
              action: () => handleSurveyView(row?.survey_id),
            },
          ]}
        />
      ),
    },
  ];

  // Transform data for display
  const transformedData = submittedSurveysData.map(item => ({
    ...item,
    creation_date: new Date(item.creation_date).toLocaleDateString(),
    submission_date: new Date(item.submission_date).toLocaleDateString(),
  }));

  return (
    <PageWrapperWithHeading title="Submitted Surveys" items={breadcrumbItems}>
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
          data={transformedData}
          showCheckbox={false}
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / perPage) || 1}
          perPage={perPage}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={(n) => {
            setPerPage(n);
            setCurrentPage(1);
          }}
          footerInfo={`Showing ${transformedData.length} of ${totalCount} submitted surveys`}
          loading={loading}
        />
      </div>
    </PageWrapperWithHeading>
  );
} 