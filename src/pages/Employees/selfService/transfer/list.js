import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import StatusChangeList from "../../../../components/common/StatusChangeList";
import { useTransfers, useCreateTransfer, useUpdateTransfer } from "../../../../utils/hooks/api/useTransfers";
import { useBranches } from "../../../../utils/hooks/api/useBranches";
import { useDepartments } from "../../../../utils/hooks/api/useDepartments";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Transfer" },
];

const TransferPage = () => {
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();

  const branchOptions = (branches || []).map((b) => ({
    label: b.name || `Branch ${b.id}`,
    value: b.id,
  }));

  const departmentOptions = (departments || []).map((d) => ({
    label: d.name || `Department ${d.id}`,
    value: d.id,
  }));

  const formConfig = {
    oldLabel: "Current Branch",
    newLabel: "New Branch",
    oldValueKey: "old_branch_id",
    newValueKey: "new_branch_id",
    oldOptions: branchOptions,
    newOptions: branchOptions,
  };

  return (
    <StatusChangeList
      title="Transfer Request"
      singularTitle="Transfer"
      hookData={useTransfers}
      hookCreate={useCreateTransfer}
      hookUpdate={useUpdateTransfer}
      breadcrumbItems={breadcrumbItems}
      formConfig={formConfig}
    />
  );
};

export default TransferPage;
