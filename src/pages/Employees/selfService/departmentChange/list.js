import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import StatusChangeList from "../../../../components/common/StatusChangeList";
import { useDepartmentChanges, useCreateDepartmentChange, useUpdateDepartmentChange } from "../../../../utils/hooks/api/useDepartmentChanges";
import { useDepartments } from "../../../../utils/hooks/api/useDepartments";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Department Change" },
];

const DepartmentChangePage = () => {
  const { data: departments = [] } = useDepartments();

  const departmentOptions = (departments || []).map((d) => ({
    label: d.name || `Department ${d.id}`,
    value: d.id,
  }));

  const formConfig = {
    oldLabel: "Current Department",
    newLabel: "New Department",
    oldValueKey: "old_department_id",
    newValueKey: "new_department_id",
    oldOptions: departmentOptions,
    newOptions: departmentOptions,
  };

  return (
    <StatusChangeList
      title="Department Change Request"
      singularTitle="Department Change"
      hookData={useDepartmentChanges}
      hookCreate={useCreateDepartmentChange}
      hookUpdate={useUpdateDepartmentChange}
      breadcrumbItems={breadcrumbItems}
      formConfig={formConfig}
    />
  );
};

export default DepartmentChangePage;
