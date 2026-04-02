import React from "react";
import CustomBreadcrumbs from "../BreadCrumbs";
import EmployeeTabsMenu from "../../recordScreenMenuTabs";
import SubmitButton from "../SubmitButton";

const PageWrapperWithHeading = ({
  children,
  items,
  title = "",
  isEmployeeRecordView = false,
  action = null,
  buttonTitle = title === "Announcements" ? "+ Add Announcements" : "+ Add New",
  Icon = null,
  isPublicView = false,
  disabled = false
}) => {
  return (
    <div className="gap-4">
      <div className="flex justify-between items-center gap-4">
        <p className="mb-4 font-bold text-xl">{title}</p>
        {action && <SubmitButton onClick={action} title={buttonTitle} Icon={Icon} disabled={disabled} />}
      </div>
      <div className="flex justify-between items-center gap-4">
        {!isPublicView && <CustomBreadcrumbs items={items} />}
        {isEmployeeRecordView && <EmployeeTabsMenu />}
      </div>

      {children}
    </div>
  );
};

export default PageWrapperWithHeading;
