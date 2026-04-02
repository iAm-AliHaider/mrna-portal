import React from "react";
import usePageData from "../../../../utils/hooks/usePageData";

// import all sub-sections here
import GeneralInformation from "./sections/GeneralInformation";
import JobInformation from "./sections/JobInformation";
import EmploymentInformation from "./sections/EmploymentInformation";
import PersonalInformation from "./sections/PersonalInformation";
import IDTypes from "./sections/IDTypes";
import Attachments from "./sections/Attachments";
import ScheduledInterviews from "./sections/ScheduledInterviews";
import WorkAddress from "./sections/WorkAddress";
import HomeAddress from "./sections/HomeAddress";
import VacationRequest from "./sections/VacationRequest";
import TicketRequest from "./sections/TicketRequest";
import LeavesRecords from "./sections/LeavesRecords";
import OfficialLetters from "./sections/OfficialLetters";
import BusinessTravels from "./sections/BusinessTravels";
import { LoanRequestPage2 } from "../../selfService/loanRequest/list";
import { DocumentsRequests2 } from "../../selfService/documentsRequests/list";
import { SuggestionsAndGrievanceList2 } from "../../selfService/suggestionsAndGrievance/list";

const sectionComponentMap = {
  general: GeneralInformation,
  job: JobInformation,
  employment: EmploymentInformation,
  personal: PersonalInformation,
  "id-types": IDTypes,
  attachments: Attachments,
  interviews: ScheduledInterviews,
  "work-address": WorkAddress,
  "home-address": HomeAddress,
  vacation: VacationRequest,
  ticket: TicketRequest,
  leaves: LeavesRecords,
  letters: OfficialLetters,
  travels: BusinessTravels,
  loan: LoanRequestPage2,
  document: DocumentsRequests2,
  grievance: SuggestionsAndGrievanceList2,
};

const Records = () => {
  const { section } = usePageData();
  const SectionComponent = sectionComponentMap[section] || GeneralInformation;

  return (
    <div className="py-4 px-6 bg-white rounded-lg shadow-md w-full">
      <SectionComponent />
    </div>
  );
};

export default Records;
