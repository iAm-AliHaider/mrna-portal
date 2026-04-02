import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import StatusChangeList from "../../../../components/common/StatusChangeList";
import { useFamilyStatusChanges, useCreateFamilyStatusChange, useUpdateFamilyStatusChange } from "../../../../utils/hooks/api/useFamilyStatusChanges";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Family Status Change" },
];

const familyStatusOptions = [
  { label: "Single", value: "Single" },
  { label: "Married", value: "Married" },
  { label: "Divorced", value: "Divorced" },
  { label: "Widowed", value: "Widowed" },
  { label: "Separated", value: "Separated" },
];

const FamilyStatusChangePage = () => {
  const formConfig = {
    oldLabel: "Current Status",
    newLabel: "New Status",
    oldValueKey: "old_status",
    newValueKey: "new_status",
    oldOptions: familyStatusOptions,
    newOptions: familyStatusOptions,
  };

  return (
    <StatusChangeList
      title="Family Status Change Request"
      singularTitle="Family Status Change"
      hookData={useFamilyStatusChanges}
      hookCreate={useCreateFamilyStatusChange}
      hookUpdate={useUpdateFamilyStatusChange}
      breadcrumbItems={breadcrumbItems}
      formConfig={formConfig}
    />
  );
};

export default FamilyStatusChangePage;
