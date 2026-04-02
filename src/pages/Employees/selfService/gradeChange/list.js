import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import StatusChangeList from "../../../../components/common/StatusChangeList";
import { useGradeChanges, useCreateGradeChange, useUpdateGradeChange } from "../../../../utils/hooks/api/useGradeChanges";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Grade Change" },
];

const GradeChangePage = () => {
  const gradeOptions = [
    { label: "Grade 1", value: "Grade 1" },
    { label: "Grade 2", value: "Grade 2" },
    { label: "Grade 3", value: "Grade 3" },
    { label: "Grade 4", value: "Grade 4" },
    { label: "Grade 5", value: "Grade 5" },
    { label: "Grade 6", value: "Grade 6" },
    { label: "Grade 7", value: "Grade 7" },
    { label: "Grade 8", value: "Grade 8" },
    { label: "Grade 9", value: "Grade 9" },
    { label: "Grade 10", value: "Grade 10" },
  ];

  const formConfig = {
    oldLabel: "Current Grade",
    newLabel: "New Grade",
    oldValueKey: "old_grade",
    newValueKey: "new_grade",
    oldOptions: gradeOptions,
    newOptions: gradeOptions,
  };

  return (
    <StatusChangeList
      title="Grade Change Request"
      singularTitle="Grade Change"
      hookData={useGradeChanges}
      hookCreate={useCreateGradeChange}
      hookUpdate={useUpdateGradeChange}
      breadcrumbItems={breadcrumbItems}
      formConfig={formConfig}
    />
  );
};

export default GradeChangePage;
