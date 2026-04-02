import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import StatusChangeList from "../../../../components/common/StatusChangeList";
import { useLocationChanges, useCreateLocationChange, useUpdateLocationChange } from "../../../../utils/hooks/api/useLocationChanges";
import { useBranches } from "../../../../utils/hooks/api/useBranches";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Location Change" },
];

const LocationChangePage = () => {
  const { data: branches = [] } = useBranches();

  const branchOptions = (branches || []).map((b) => ({
    label: b.name || `Location ${b.id}`,
    value: b.id,
  }));

  const formConfig = {
    oldLabel: "Current Location",
    newLabel: "New Location",
    oldValueKey: "old_location",
    newValueKey: "new_location",
    oldOptions: branchOptions,
    newOptions: branchOptions,
  };

  return (
    <StatusChangeList
      title="Location Change Request"
      singularTitle="Location Change"
      hookData={useLocationChanges}
      hookCreate={useCreateLocationChange}
      hookUpdate={useUpdateLocationChange}
      breadcrumbItems={breadcrumbItems}
      formConfig={formConfig}
    />
  );
};

export default LocationChangePage;
