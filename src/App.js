import "./App.css";
import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import { AuthOutlet } from "./components/AuthOutlet";
import { CandidateOutlet } from "./components/AuthOutlet/CandidateOutlet";
import { EmployeeRecordProvider } from "./context/EmployeeRecordContext";

// ============================================================
// Lazy-loaded page components (code-split for performance)
// ============================================================
const Dashboard = lazy(() => import("./pages/home/dashboard"));
const MySurveysPage = lazy(() => import("./pages/Employees/surveys/mySurvays"));
const AnnouncementList = lazy(() => import("./pages/Employees/announcements/list"));
const TaskList = lazy(() => import("./pages/Employees/Task/list"));
const ScheduleInterview = lazy(() => import("./pages/Employees/Task/scheduleInterview"));
const DailyAttendanceTransactionsPage = lazy(() => import("./pages/Employees/attendance/dailyAttendance/list"));
const MyApprovalsPage = lazy(() => import("./pages/Employees/selfService/myApprovals/list"));
const MyTransactionsPage = lazy(() => import("./pages/Employees/selfService/myTransactions/list"));
const ActionsCreatedByMeList = lazy(() => import("./pages/Employees/selfService/actionsCreatedbyMe/list"));
const LeaveRequestPage = lazy(() => import("./pages/Employees/selfService/leaveRequest/list"));
const LoanRequestPage = lazy(() => import("./pages/Employees/selfService/loanRequest/list"));
const AdvanceSalaryPage = lazy(() => import("./pages/Employees/selfService/AdvanceSalary/list"));
const SalarySlipsPage = lazy(() => import("./pages/Employees/selfService/salarySlips/list"));
const ExpenseClaimRequestPage = lazy(() => import("./pages/Employees/selfService/ExpenseClaimRequest/list"));
const AttendanceRequestPage = lazy(() => import("./pages/Employees/selfService/attendanceRequets/list"));
const OrganizationalObjectivesPage = lazy(() => import("./pages/Employees/performanceManagement/OrganizationalObjectives/list"));
const OrganizationalObjectivesForm = lazy(() => import("./pages/Employees/performanceManagement/OrganizationalObjectives/OrganizationalObjectivesForm"));
const DepartmentalObjectivesPage = lazy(() => import("./pages/Employees/performanceManagement/DepartmentalObjectives/list"));
const DepartmentalObjectivesForm = lazy(() => import("./pages/Employees/performanceManagement/DepartmentalObjectives/DepartmentalObjectivesForm"));
const EditDepartmentalObjective = lazy(() => import("./pages/Employees/performanceManagement/DepartmentalObjectives/EditDepartmentalObjective"));
const EmployeesObjectivesPage = lazy(() => import("./pages/Employees/performanceManagement/EmployeeObjectives/list"));
const AppraisalsPage = lazy(() => import("./pages/Employees/performanceManagement/appraisal/list"));
const OvertimeRequestsPage = lazy(() => import("./pages/Employees/Transactions/overtimerequest/list"));
const VacationRequestsPage = lazy(() => import("./pages/Employees/Transactions/vacationRequest/list"));
const TicketRequestsPage = lazy(() => import("./pages/Employees/Transactions/ticketRequest/list"));
const RecordLeavesPage = lazy(() => import("./pages/Employees/Transactions/recordleaves/list"));
const SurveyResponsesPage = lazy(() => import("./pages/Employees/Transactions/surveyResponse/list"));
const OfficialLettersPage = lazy(() => import("./pages/Employees/Transactions/officialletters/list"));
const BusinessTravelsPage = lazy(() => import("./pages/Employees/Transactions/businessTravels/list"));
const MeetingRoomBookingsPage = lazy(() => import("./pages/Employees/Transactions/meetingroombooking/list"));
const AssetsTransactionsPage = lazy(() => import("./pages/Employees/Transactions/asseststransactions/list"));
const EmployeeSalarySlipReportPage = lazy(() => import("./pages/Employees/reports/salaryslips"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage/notFoundPage"));
const General = lazy(() => import("./pages/Admin/companyInfo/general/general"));
const OrganizationalStructure = lazy(() => import("./pages/Admin/companyInfo/organizationalStructure/structure"));
const HolidaysDefinition = lazy(() => import("./pages/Admin/companyInfo/holidayDefinition/list"));
const OfficialLetterCategories = lazy(() => import("./pages/Admin/companyInfo/officialLetterCategories/officialLetterCategories"));
const AssetCategories = lazy(() => import("./pages/Admin/companyInfo/assetCategories"));
const AssetCategoryForm = lazy(() => import("./pages/Admin/companyInfo/assetCategories/form"));
const Branches = lazy(() => import("./pages/Admin/companyInfo/branches"));
const BranchForm = lazy(() => import("./pages/Admin/companyInfo/branches/form"));
const OfficialLetterCategoriesList = lazy(() => import("./pages/Admin/companyInfo/officialLetterCategories/list"));
const EmploymentType = lazy(() => import("./pages/Admin/jobInfo/employmentType/list"));
const VacanciesList = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/vacancies/list"));
const CandidatesList = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/candidates/list"));
const DesignationsList = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/designations/list"));
const SuccessionPlanningForm = lazy(() => import("./pages/Admin/humanResource/succession/succession"));
const SuccessionPlanningList = lazy(() => import("./pages/Admin/humanResource/succession/list"));
const SignIn = lazy(() => import("./pages/Signin/SigninForm"));
const ForgotPassword = lazy(() => import("./pages/Employees/ForgotPassword/ForgotPasswordForm"));
const ResetPassword = lazy(() => import("./pages/ResetPassword/ResetPasswordForm"));
const OffBoardingTaskAssignmentForm = lazy(() => import("./pages/Admin/humanResource/offboarding/offboarding"));
const OnBoardingTaskAssignmentForm = lazy(() => import("./pages/Admin/humanResource/onboarding/onboarding"));
const VacancyForm = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/vacancies/vacancyForm"));
const HolidayForm = lazy(() => import("./pages/Admin/companyInfo/holidayDefinition/form"));
const EmploymentTypeForm = lazy(() => import("./pages/Admin/jobInfo/employmentType/form"));
const CandidateForm = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/candidates/CandidateForm"));
const DesignationForm = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/designations/DesignationForm"));
const EmployeeRecords = lazy(() => import("./pages/Employees/employeeRecords"));
const ManualAttendance = lazy(() => import("./pages/Employees/attendance/manualAttendance"));
const EmployeeObjectivesForm = lazy(() => import("./pages/Employees/performanceManagement/EmployeeObjectives/EmployeeObjectivesForm"));
const AppraisalForm = lazy(() => import("./pages/Employees/performanceManagement/appraisal/AppraisalForm"));
const ScheduledInterviewsPage = lazy(() => import("./pages/hiring/scheduleInterviews/listing"));
const Announcements = lazy(() => import("./pages/Admin/humanResource/announcements/Announcments"));
const OverTimeRequestForm = lazy(() => import("./pages/Employees/Transactions/overtimerequest/OverTimeRequestForm"));
const VacationRequestForm = lazy(() => import("./pages/Employees/Transactions/vacationRequest/VacationRequestForm"));
const TicketRequestForm = lazy(() => import("./pages/Employees/Transactions/ticketRequest/TicketRequestForm"));
const RecordLeaveForm = lazy(() => import("./pages/Employees/Transactions/recordleaves/RecordLeaveForm"));
const SurvayResponseForm = lazy(() => import("./pages/Employees/Transactions/surveyResponse/survayResponseForm"));
const OfficialLetterForm = lazy(() => import("./pages/Employees/Transactions/officialletters/OfficialLetterForm"));
const BusinessTravelForm = lazy(() => import("./pages/Employees/Transactions/businessTravels/BusinessTravelForm"));
const MeetingRoomBookingForm = lazy(() => import("./pages/Employees/Transactions/meetingroombooking/MeetingRoomBookingForm"));
const AssetsTransactionForm = lazy(() => import("./pages/Employees/Transactions/asseststransactions/AssetsTransactionForm"));
const DailyAttendanceReportPage = lazy(() => import("./pages/Employees/reports/dailyattendancereport"));
const DailyLeaveReport = lazy(() => import("./pages/Employees/reports/leaveReport"));
const MyDocuments = lazy(() => import("./pages/Employees/selfService/myDocuments/list"));
const Surveys = lazy(() => import("./pages/Admin/companyInfo/surveys/surveys"));
const AllowanceRequestList = lazy(() => import("./pages/Employees/selfService/allowanceRequest/list"));
const TrainingAndDevelopment = lazy(() => import("./pages/Employees/trainingAndDevelopment/TrainingAndDevelopment/list"));
const TrainingAndCourses = lazy(() => import("./pages/Admin/training-and-courses/training-and-courses/list"));
const Courses = lazy(() => import("./pages/Admin/training-and-courses/courses/list"));
const Trainings = lazy(() => import("./pages/Admin/training-and-courses/trainings/list"));
const DocumentsPage = lazy(() => import("./pages/Employees/selfService/docSharing/list"));
const DailyAttendance = lazy(() => import("./pages/Admin/humanResource/dailyAttendance/list"));
const EditVacancy = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/vacancies/vacancyForm/editVacancy"));
const PolicyForm = lazy(() => import("./pages/Admin/companyInfo/companyPolicy/policyForm"));
const PolicyList = lazy(() => import("./pages/Admin/companyInfo/companyPolicy/policy"));
const EditPolicy = lazy(() => import("./pages/Admin/companyInfo/companyPolicy/policyForm/editPolicy"));
const EditEmploymentType = lazy(() => import("./pages/Admin/jobInfo/employmentType/editEmploymentType"));
const PublicCandidateForm = lazy(() => import("./pages/PublicCandidateForm"));
const ResignationRequestPage = lazy(() => import("./pages/Employees/selfService/resignationRequest/list"));
const TerminationRequestPage = lazy(() => import("./pages/Employees/selfService/terminationRequest/list"));
const ContractEndRequest = lazy(() => import("./pages/Employees/selfService/endOfContract/list"));
const WarningRequestPage = lazy(() => import("./pages/Employees/selfService/warnings/list"));
const MyWarningsPage = lazy(() => import("./pages/Employees/selfService/myWarnings/list"));
const DocumentsRequests = lazy(() => import("./pages/Employees/selfService/documentsRequests/list"));
const DocumentsApproval = lazy(() => import("./pages/Employees/selfService/myDocuments/list"));
const InterviewSchedule = lazy(() => import("./pages/Admin/humanResource/interviewSchedule/InterviewSchedule"));
const OffBoardingRequestPage = lazy(() => import("./pages/Employees/selfService/offBoardingRequest/list"));
const OffBoardingApprovalsPage = lazy(() => import("./pages/Employees/selfService/offBoardingApprovals/list"));
const EmployeeDashboard = lazy(() => import("./pages/dashboard"));
const SelfServiceDashboard = lazy(() => import("./pages/Employees/selfService/dashboard"));
const AttendanceDashboard = lazy(() => import("./pages/Employees/attendance/dashboard"));
const PerformanceDashboard = lazy(() => import("./pages/Employees/performanceManagement/dashboard"));
const TransactionDashboard = lazy(() => import("./pages/Employees/Transactions/dashboard"));
const JobInfoDashboard = lazy(() => import("./pages/Admin/jobInfo/dashboard"));
const HumanResaurcesDashboard = lazy(() => import("./pages/Admin/humanResource/dashboard"));
const SuggestionsAndGrievanceList = lazy(() => import("./pages/Employees/selfService/suggestionsAndGrievance/list"));
const SuggestionsAndGrievanceForm = lazy(() => import("./pages/Employees/selfService/suggestionsAndGrievance/suggestionAndGrievanceForm"));
const ScheduledInterviews = lazy(() => import("./pages/Employees/recruitment"));
const SurveyList = lazy(() => import("./pages/Admin/companyInfo/surveys/list"));
const ViewSurvey = lazy(() => import("./pages/Admin/companyInfo/surveys/view"));
const ViewMySurvey = lazy(() => import("./pages/Employees/surveys/view"));
const MyJustificationsPage = lazy(() => import("./pages/Employees/selfService/justificationRequest/myJustifications"));
const ManagerJustificationInquiries = lazy(() => import("./pages/Employees/selfService/justificationRequest/managerJustificationInquiries"));
const ResponseMySurvey = lazy(() => import("./pages/Employees/surveys/response"));
const PhotoGallery = lazy(() => import("./pages/Admin/humanResource/photoGallery"));
const EmployeePhotoGallery = lazy(() => import("./pages/Employees/selfService/photoGallery/PhotoGallery"));
const CombinedDashboard = lazy(() => import("./pages/dashboard"));
const SubmittedSurveysPage = lazy(() => import("./pages/Admin/companyInfo/surveys/submittedSurveys"));
const EditEmployeeObjective = lazy(() => import("./pages/Employees/performanceManagement/EmployeeObjectives/EditEmployeeObjectives"));
const EditOrganizationalObjective = lazy(() => import("./pages/Employees/performanceManagement/OrganizationalObjectives/EditOrganizationalObjective"));
const AppraisalsReviewList = lazy(() => import("./pages/Employees/performanceManagement/appraisalReview/list"));
const AppraisalsReviewPage = lazy(() => import("./pages/Employees/performanceManagement/appraisalReview/review"));
const ReviewAssessmentPage = lazy(() => import("./pages/Employees/performanceManagement/appraisalReview/viewAssesment"));
const EmployeeAppraisalAssessmentPage = lazy(() => import("./pages/Employees/performanceManagement/appraisalReview/employeeViewAssesment"));
const MyAppraisalsReviewList = lazy(() => import("./pages/Employees/performanceManagement/myAppraisals/list"));
const InterviewsList = lazy(() => import("./pages/Admin/recruitment/list"));
const InspirationVideos = lazy(() => import("./pages/Admin/humanResource/inspiration/InspirationVideos"));
const MessagingPage = lazy(() => import("./pages/chatApp/wrapper"));
const LoanRequestsReport = lazy(() => import("./pages/Employees/reports/LoanRequestsReport"));
const CorporateEventsList = lazy(() => import("./pages/Employees/corporateEvents/list"));
const CorporateEventForm = lazy(() => import("./pages/Employees/corporateEvents/form"));
const LeaveBalanceReport = lazy(() => import("./pages/Employees/reports/leaveBalanceReport"));
const HiringReport = lazy(() => import("./pages/Employees/reports/HiringReports"));
const UserProfile = lazy(() => import("./pages/userProfile"));
const OfferRequestForm = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/offerRequest/form"));
const OfferRequestApprovals = lazy(() => import("./pages/Employees/selfService/offerLetterApprovals/OfferRequestApprovals"));
const CandidateOfferLetter = lazy(() => import("./pages/PublicCandidatePortal/OfferLetter"));
const UploadOfferLetterDocuments = lazy(() => import("./pages/PublicCandidatePortal/UploadOfferLetterDocument"));
const RegenerateOfferRequestForm = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/offerRequest/RegenerateOfferForm"));
const ContractsList = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/contractRequest/list"));
const ContractRequestForm = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/contractRequest/form"));
const OfficialContract = lazy(() => import("./pages/PublicCandidatePortal/Contract"));
const UploadContractDocuments = lazy(() => import("./pages/PublicCandidatePortal/UploadContractDocument"));
const UnassignedTasks = lazy(() => import("./pages/Admin/humanResource/unassignedTasks"));
const OnboardingTasksPage = lazy(() => import("./pages/Employees/OnboardingTasks"));
const OffboardingTasksPage = lazy(() => import("./pages/Employees/OffboardingTasks"));
const PayStopagePage = lazy(() => import("./pages/Employees/selfService/PayStopage/list"));
const JustificationRequest = lazy(() => import("./pages/Employees/selfService/justificationRequest/list"));
const RecruitmentPage = lazy(() => import("./pages/Admin/recruitment/recruitment"));
const MasterDataRequest = lazy(() => import("./pages/Employees/selfService/masterDataRequest/list"));
const OffersList = lazy(() => import("./pages/Admin/humanResource/talentAcquisition/offerRequest/list"));
const EditMasterTask = lazy(() => import("./pages/Admin/jobInfo/masterTask/editMasterTask"));

// NEW PAGE IMPORTS
const LeaveEncashmentPage = lazy(() => import("./pages/Employees/selfService/leaveEncashment/list"));
const LeaveAdjustmentPage = lazy(() => import("./pages/Employees/selfService/leaveAdjustment/list"));
const OfficialHoursPermissionPage = lazy(() => import("./pages/Employees/selfService/officialHoursPermission/list"));
const PersonalHoursPermissionPage = lazy(() => import("./pages/Employees/selfService/personalHoursPermission/list"));
const PromotionPage = lazy(() => import("./pages/Employees/selfService/promotion/list"));
const TransferPage = lazy(() => import("./pages/Employees/selfService/transfer/list"));
const GradeChangePage = lazy(() => import("./pages/Employees/selfService/gradeChange/list"));
const DepartmentChangePage = lazy(() => import("./pages/Employees/selfService/departmentChange/list"));
const LocationChangePage = lazy(() => import("./pages/Employees/selfService/locationChange/list"));
const FamilyStatusChangePage = lazy(() => import("./pages/Employees/selfService/familyStatusChange/list"));
const LeaveSchedulePage = lazy(() => import("./pages/Admin/humanResource/leaveSchedule/list"));
const PromotionsListPage = lazy(() => import("./pages/Admin/humanResource/promotions/list"));
const AssetTrackingPage = lazy(() => import("./pages/Admin/assetManagement/tracking/list"));
const AssetMaintenancePage = lazy(() => import("./pages/Admin/assetManagement/maintenance/list"));
const AssetHistoryPage = lazy(() => import("./pages/Admin/assetManagement/history/list"));
const AssetDisposalPage = lazy(() => import("./pages/Admin/assetManagement/disposal/list"));
const AssetManagementDashboard = lazy(() => import("./pages/Admin/assetManagement/index"));
const AssetCatalogPage = lazy(() => import("./pages/Admin/assetManagement/catalog"));
const AssetFormPage = lazy(() => import("./pages/Admin/assetManagement/form"));
const AssetReportsPage = lazy(() => import("./pages/Admin/assetManagement/reports"));
const ShiftManagementPage = lazy(() => import("./pages/Admin/shiftManagement/index"));
const ShiftRosterPage = lazy(() => import("./pages/Admin/shiftManagement/roster"));
const RosterRequestsPage = lazy(() => import("./pages/Admin/shiftManagement/rosterRequests"));
const EmployeeRosterPage = lazy(() => import("./pages/Admin/shiftManagement/employeeRoster"));
const RecruitmentDashboardPage = lazy(() => import("./pages/Admin/recruitment/dashboard"));
const JobRequisitionsPage = lazy(() => import("./pages/Admin/recruitment/jobRequisitions"));
const HolidayCalendarPage = lazy(() => import("./pages/Admin/companyInfo/holidayCalendar/holidayCalendar"));
const TravelDashboardPage = lazy(() => import("./pages/Employees/Transactions/travelDashboard/index"));
const TrainingDashboardPage = lazy(() => import("./pages/Admin/training-and-courses/dashboard/index"));
const AssetReportPage = lazy(() => import("./pages/Employees/reports/assetReport/list"));
const TrainingCalendarPage = lazy(() => import("./pages/Admin/training-and-courses/calendar/list"));
const LearningPathwaysPage = lazy(() => import("./pages/Admin/training-and-courses/learningPathways/list"));
const CertificationsPage = lazy(() => import("./pages/Admin/training-and-courses/certifications/list"));
const AssessmentsPage = lazy(() => import("./pages/Admin/training-and-courses/assessments/list"));
const TrainersPage = lazy(() => import("./pages/Admin/training-and-courses/trainers/list"));
const AnnualPlanPage = lazy(() => import("./pages/Admin/training-and-courses/annualPlan/list"));
const TrainingReportPage = lazy(() => import("./pages/Employees/reports/trainingReport/list"));
const CompensationDashboardPage = lazy(() => import("./pages/Employees/performanceManagement/compensationDashboard/list"));
const BonusIncentivesPage = lazy(() => import("./pages/Employees/performanceManagement/bonusIncentives/list"));
const SalaryHistoryPage = lazy(() => import("./pages/Employees/performanceManagement/salaryHistory/list"));
const CareerDevelopmentPage = lazy(() => import("./pages/Employees/performanceManagement/careerDevelopment/list"));
const PerformanceReportPage = lazy(() => import("./pages/Employees/reports/performanceReport/list"));

// Loading fallback for lazy components
const PageLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e0e0e0", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
      <p style={{ marginTop: 16, color: "#666" }}>Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <Router>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AuthOutlet />}>
            <Route
              path="/user-profile"
              element={
                <Layout>
                  <UserProfile />
                </Layout>
              }
            />
            <Route
              path="/public/chat"
              element={
                <Layout>
                  <MessagingPage />
                </Layout>
              }
            />
            <Route
              path="/home"
              element={
                <Layout>
                  <CombinedDashboard />
                </Layout>
              }
            />
            <Route
              path="/employees/records"
              element={
                <Layout>
                  <EmployeeRecordProvider>
                    <EmployeeRecords />
                  </EmployeeRecordProvider>
                </Layout>
              }
            />
            <Route
              path="/employees/surveys"
              element={
                <Layout>
                  <MySurveysPage />
                </Layout>
              }
            />
            <Route
              path="/employees/surveys/:id"
              element={
                <Layout>
                  <ViewMySurvey />
                </Layout>
              }
            />
            <Route
              path="/employees/surveys/response/:id"
              element={
                <Layout>
                  <ResponseMySurvey />
                </Layout>
              }
            />
            <Route
              path="/employees/announcements"
              element={
                <Layout>
                  <AnnouncementList />
                </Layout>
              }
            />
            <Route
              path="/employees/corporate-events"
              element={
                <Layout>
                  <CorporateEventsList />
                </Layout>
              }
            />
            <Route
              path="/employees/corporate-events/add"
              element={
                <Layout>
                  <CorporateEventForm />
                </Layout>
              }
            />
            <Route
              path="/employees/corporate-events/edit/:id"
              element={
                <Layout>
                  <CorporateEventForm />
                </Layout>
              }
            />
            <Route
              path="/employees/tasks"
              element={
                <Layout>
                  <TaskList />
                </Layout>
              }
            />
            <Route
              path="/employees/onboarding-tasks"
              element={
                <Layout>
                  <OnboardingTasksPage />
                </Layout>
              }
            />
            <Route
              path="/employees/offboarding-tasks"
              element={
                <Layout>
                  <OffboardingTasksPage />
                </Layout>
              }
            />

            <Route
              path="/recruitment/scheduled-interviews"
              element={
                <Layout>
                  <ScheduledInterviews />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <EmployeeDashboard />
                </Layout>
              }
            />

            {/* selfService =========================================================================================================== */}

            <Route
              path="/self/my-approvals"
              element={
                <Layout>
                  <MyApprovalsPage />
                </Layout>
              }
            />

            <Route
              path="/self/transactions"
              element={
                <Layout>
                  <MyTransactionsPage />
                </Layout>
              }
            />
             <Route
              path="/self/my-justifications"
              element={
                <Layout>
                  <MyJustificationsPage />
                </Layout>
              }
            />
            <Route
              path="/self/justification-inquiries"
              element={
                <Layout>
                  <ManagerJustificationInquiries />
                </Layout>
              }
            />
            <Route
              path="/self/actions"
              element={
                <Layout>
                  <ActionsCreatedByMeList />
                </Layout>
              }
            />
            <Route
              path="/self/leave-request"
              element={
                <Layout>
                  <LeaveRequestPage />
                </Layout>
              }
            />
            <Route
              path="/self/my-documents"
              element={
                <Layout>
                  <MyDocuments />
                </Layout>
              }
            />
            <Route
              path="/self/documents-requests"
              element={
                <Layout>
                  <DocumentsRequests />
                </Layout>
              }
            />
            <Route
              path="/self/master-data-request"
              element={
                <Layout>
                  <MasterDataRequest />
                </Layout>
              }
            />
            <Route
              path="/self/documents-approvals"
              element={
                <Layout>
                  <DocumentsApproval />
                </Layout>
              }
            />
            <Route
              path="/self/loan-request"
              element={
                <Layout>
                  <LoanRequestPage />
                </Layout>
              }
            />

            <Route
              path="/self/advance-salary"
              element={
                <Layout>
                  <AdvanceSalaryPage />
                </Layout>
              }
            />
            <Route
              path="/self/salary-slips"
              element={
                <Layout>
                  <SalarySlipsPage />
                </Layout>
              }
            />
            <Route
              path="/self/claims"
              element={
                <Layout>
                  <ExpenseClaimRequestPage />
                </Layout>
              }
            />
            <Route
              path="/self/attendance-request"
              element={
                <Layout>
                  <AttendanceRequestPage />
                </Layout>
              }
            />
            <Route
              path="/self/allowance-request"
              element={
                <Layout>
                  <AllowanceRequestList />
                </Layout>
              }
            />
            <Route
              path="/self/off-boarding-request"
              element={
                <Layout>
                  <OffBoardingRequestPage />
                </Layout>
              }
            />
            <Route
              path="/self/off-boarding-approvals"
              element={
                <Layout>
                  <OffBoardingApprovalsPage />
                </Layout>
              }
            />
            <Route
              path="/self/documents"
              element={
                <Layout>
                  <DocumentsPage />
                </Layout>
              }
            />
            <Route
              path="/self/photo-gallery"
              element={
                <Layout>
                  <EmployeePhotoGallery />
                </Layout>
              }
            />
            <Route
              path="/self/pay-stopage"
              element={
                <Layout>
                  <PayStopagePage />
                </Layout>
              }
            />

 <Route
              path="/self/justification-request"
              element={
                <Layout>
                  <JustificationRequest />
                </Layout>
              }
            />

            <Route
              path="/hr/offer-approvals"
              element={
                <Layout>
                  <OfferRequestApprovals />
                </Layout>
              }
            />

            <Route
              path="/admin/human-resource/talent-aquisition/contracts-list"
              element={
                <Layout>
                  <ContractsList />
                </Layout>
              }
            />

            <Route
              path="/admin/human-resource/talent-aquisition/contracts-list/create"
              element={
                <Layout>
                  <ContractRequestForm />
                </Layout>
              }
            />

            {/* hiring ===========================================================================================================*/}
            <Route
              path="/hiring/interviews"
              element={
                <Layout>
                  <ScheduledInterviewsPage />
                </Layout>
              }
            />
            <Route
              path="/hiring/interviews/newInterview"
              element={
                <Layout>
                  <ScheduleInterview />
                </Layout>
              }
            />

            <Route
              path="/attendance/daily"
              element={
                <Layout>
                  <DailyAttendanceTransactionsPage />
                </Layout>
              }
            />
            <Route
              path="/attendance/manual"
              element={
                <Layout>
                  <ManualAttendance />
                </Layout>
              }
            />
            <Route
              path="/attendance/dashboard"
              element={
                <Layout>
                  <AttendanceDashboard />
                </Layout>
              }
            />

            <Route
              path="/admin/human-resource/talent-aquisition/offer-request"
              element={
                <Layout>
                  <OfferRequestForm />
                </Layout>
              }
            />

            <Route
              path="/admin/human-resource/talent-aquisition/offers-list"
              element={
                <Layout>
                  <OffersList />
                </Layout>
              }
            />

            <Route
              path="/admin/human-resource/talent-aquisition/offer-request/:id/regenerate"
              element={
                <Layout>
                  <RegenerateOfferRequestForm />
                </Layout>
              }
            />
            {/* Training and Developement ============================================================================================================*/}
            <Route
              path="/training/training-and-developement"
              element={
                <Layout>
                  <TrainingAndDevelopment />
                </Layout>
              }
            />
            <Route
              path="/performance/dashboard"
              element={
                <Layout>
                  <PerformanceDashboard />
                </Layout>
              }
            />
            <Route
              path="/performance/org-objectives"
              element={
                <Layout>
                  <OrganizationalObjectivesPage />
                </Layout>
              }
            />
            <Route
              path="/performance/org-objectives/edit/:id"
              element={
                <Layout>
                  <EditOrganizationalObjective />
                </Layout>
              }
            />
            <Route
              path="/performance/org-objectives/org-obj-new"
              element={
                <Layout>
                  <OrganizationalObjectivesForm />
                </Layout>
              }
            />

            
            <Route
              path="/performance/dept-objectives"
              element={
                <Layout>
                  <DepartmentalObjectivesPage />
                </Layout>
              }
            />
            <Route
              path="/performance/dept-objectives/edit/:id"
              element={
                <Layout>
                  <EditDepartmentalObjective />
                </Layout>
              }
            />
            <Route
              path="/performance/dept-objectives/dept-obj-new"
              element={
                <Layout>
                  <DepartmentalObjectivesForm />
                </Layout>
              }
            />

            <Route
              path="/performance/employee-objectives"
              element={
                <Layout>
                  <EmployeesObjectivesPage />
                </Layout>
              }
            />

            <Route
              path="/performance/employee-objectives/edit/:id"
              element={
                <Layout>
                  <EditEmployeeObjective />
                </Layout>
              }
            />

            <Route
              path="/performance/employee-objectives/org-employees-new"
              element={
                <Layout>
                  <EmployeeObjectivesForm />
                </Layout>
              }
            />

            <Route
              path="/performance/appraisals"
              element={
                <Layout>
                  <AppraisalsPage />
                </Layout>
              }
            />
            <Route
              path="/performance/appraisals/review/:id"
              element={
                <Layout>
                  <AppraisalsReviewPage />
                </Layout>
              }
            />
            <Route
              path="/performance/appraisals/view-report/:id"
              element={
                <Layout>
                  <ReviewAssessmentPage />
                </Layout>
              }
            />
            <Route
              path="/performance/my-appraisals"
              element={
                <Layout>
                  <MyAppraisalsReviewList />
                </Layout>
              }
            />
            <Route
              path="/performance/my-appraisals/view-report/:id"
              element={
                <Layout>
                  <EmployeeAppraisalAssessmentPage />
                </Layout>
              }
            />
            <Route
              path="/performance/appraisals/review"
              element={
                <Layout>
                  <AppraisalsReviewList />
                </Layout>
              }
            />

            {/* Transactions ===========================================================================================================*/}
            <Route
              path="/transactions/dashboard"
              element={
                <Layout>
                  <TransactionDashboard />
                </Layout>
              }
            />
            <Route
              path="/transactions/overtime"
              element={
                <Layout>
                  <OvertimeRequestsPage />
                </Layout>
              }
            />
            {/* <Route
              path="/transactions/vacation"
              element={
                <Layout>
                  <VacationRequestsPage />
                </Layout>
              }
            /> */}
            <Route
              path="/transactions/vacation/vacationForm"
              element={
                <Layout>
                  <VacationRequestForm />
                </Layout>
              }
            />
            <Route
              path="/transactions/vacation/vacationForm/:id"
              element={
                <Layout>
                  <VacationRequestForm />
                </Layout>
              }
            />
            <Route
              path="/transactions/ticket"
              element={
                <Layout>
                  <TicketRequestsPage />
                </Layout>
              }
            />
            <Route
              path="/transactions/ticket/ticketRequestForm"
              element={
                <Layout>
                  <TicketRequestForm />
                </Layout>
              }
            />
            <Route
              path="/transactions/leaves"
              element={
                <Layout>
                  <RecordLeavesPage />
                </Layout>
              }
            />
            <Route
              path="/transactions/leaves/recordLeaveForm"
              element={
                <Layout>
                  <RecordLeaveForm />
                </Layout>
              }
            />
            <Route
              path="/transactions/surveys"
              element={
                <Layout>
                  <SurveyResponsesPage />
                </Layout>
              }
            />
            <Route
              path="/transactions/surveys/survayResponseForm"
              element={
                <Layout>
                  <SurvayResponseForm />
                </Layout>
              }
            />
            <Route
              path="/transactions/letters"
              element={
                <Layout>
                  <OfficialLettersPage />
                </Layout>
              }
            />
            <Route
              path="/transactions/letters/officialLetterForm"
              element={
                <Layout>
                  <OfficialLetterForm />
                </Layout>
              }
            />
            <Route
              path="/transactions/travels"
              element={
                <Layout>
                  <BusinessTravelsPage />
                </Layout>
              }
            />
            <Route
              path="/transactions/travels/businessTravelForm"
              element={
                <Layout>
                  <BusinessTravelForm />
                </Layout>
              }
            />
            <Route
              path="/transactions/meetings"
              element={
                <Layout>
                  <MeetingRoomBookingsPage />
                </Layout>
              }
            />
            <Route
              path="/transactions/meetings/meetingRoomBookingForm"
              element={
                <Layout>
                  <MeetingRoomBookingForm />
                </Layout>
              }
            />
            <Route
              path="/transactions/assets"
              element={
                <Layout>
                  <AssetsTransactionsPage />
                </Layout>
              }
            />

            <Route
              path="/transactions/overtime/overtimeForm"
              element={
                <Layout>
                  <OverTimeRequestForm />
                </Layout>
              }
            />

            <Route
              path="/transactions/assets/assetsTransactionForm"
              element={
                <Layout>
                  <AssetsTransactionForm />
                </Layout>
              }
            />

            {/* Reports   ===========================================================================================================*/}
            <Route
              path="/reports/salary-slips"
              element={
                <Layout>
                  <EmployeeSalarySlipReportPage />
                </Layout>
              }
            />
            <Route
              path="/reports/daily-attendance"
              element={
                <Layout>
                  <DailyAttendanceReportPage />
                </Layout>
              }
            />
            <Route
              path="/reports/leave"
              element={
                <Layout>
                  <DailyLeaveReport />
                </Layout>
              }
            />
            <Route
              path="/reports/loan-requests"
              element={
                <Layout>
                  <LoanRequestsReport />
                </Layout>
              }
            />
            <Route
              path="/reports/leave-balance-report"
              element={
                <Layout>
                  <LeaveBalanceReport />
                </Layout>
              }
            />
            <Route
              path="/reports/hiring"
              element={
                <Layout>
                  <HiringReport />
                </Layout>
              }
            />
            {/* Admin   ===========================================================================================================*/}
            {/* CompnayInfo   =====================================================================================================*/}
            <Route
              path="/admin/company-info/general"
              element={
                <Layout>
                  <General />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/org-structure"
              element={
                <Layout>
                  <OrganizationalStructure />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/holidays"
              element={
                <Layout>
                  <HolidaysDefinition />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/holidays/add"
              element={
                <Layout>
                  <HolidayForm />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/holidays/edit/:id"
              element={
                <Layout>
                  <HolidayForm />
                </Layout>
              }
            />
            {/* CompnayPolicy Start   =====================================================================================================*/}

            <Route
              path="/admin/company-info/policy"
              element={
                <Layout>
                  <PolicyList />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/policy/add"
              element={
                <Layout>
                  <PolicyForm />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/policy/edit/:id"
              element={
                <Layout>
                  <EditPolicy />
                </Layout>
              }
            />

            {/* CompnayPolicy End   =====================================================================================================*/}

            <Route
              path="/admin/company-info/letters-categories"
              element={
                <Layout>
                  <OfficialLetterCategoriesList />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/letters-categories/add"
              element={
                <Layout>
                  <OfficialLetterCategories />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/letters-categories/edit/:id"
              element={
                <Layout>
                  <OfficialLetterCategories />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/asset-categories"
              element={
                <Layout>
                  <AssetCategories />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/asset-categories/add"
              element={
                <Layout>
                  <AssetCategoryForm />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/asset-categories/edit/:id"
              element={
                <Layout>
                  <AssetCategoryForm />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/branches"
              element={
                <Layout>
                  <Branches />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/branches/add"
              element={
                <Layout>
                  <BranchForm />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/branches/edit/:id"
              element={
                <Layout>
                  <BranchForm />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/surveys"
              element={
                <Layout>
                  <SurveyList />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/surveys/submitted"
              element={
                <Layout>
                  <SubmittedSurveysPage />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/surveys/add"
              element={
                <Layout>
                  <Surveys />
                </Layout>
              }
            />
            <Route
              path="/admin/company-info/surveys/:id"
              element={
                <Layout>
                  <ViewSurvey />
                </Layout>
              }
            />
            <Route
              path="/self/suggestions-grievance"
              element={
                <Layout>
                  <SuggestionsAndGrievanceList />
                </Layout>
              }
            />
            <Route
              path="/self/suggestions-grievance/add"
              element={
                <Layout>
                  <SuggestionsAndGrievanceForm />
                </Layout>
              }
            />
            {/* Job Info   ===========================================================================================================*/}
            <Route
              path="/admin/job-info/dashboard"
              element={
                <Layout>
                  <JobInfoDashboard />
                </Layout>
              }
            />
            <Route
              path="/admin/job-info/employment-type"
              element={
                <Layout>
                  <EmploymentType />
                </Layout>
              }
            />
            <Route
              path="/admin/job-info/employment-type/add"
              element={
                <Layout>
                  <EmploymentTypeForm />
                </Layout>
              }
            />
            <Route
              path="/admin/job-info/employment-type/edit/:id"
              element={
                <Layout>
                  <EditEmploymentType />
                </Layout>
              }
            />
            {/* Human Resource   ====================================================================================================*/}
            <Route
              path="/admin/human-resource/dashboard"
              element={
                <Layout>
                  <HumanResaurcesDashboard />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/talent-acquisition/vacancies"
              element={
                <Layout>
                  <VacanciesList />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/talent-acquisition/vacancies/add"
              element={
                <Layout>
                  <VacancyForm />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/talent-acquisition/vacancies/edit/:id"
              element={
                <Layout>
                  <EditVacancy />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/talent-acquisition/candidates"
              element={
                <Layout>
                  <CandidatesList />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/talent-acquisition/candidates/add/:id"
              element={
                <Layout>
                  <CandidateForm />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/talent-acquisition/candidates/add"
              element={
                <Layout>
                  <CandidateForm />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/talent-acquisition/designations"
              element={
                <Layout>
                  <DesignationsList />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/talent-acquisition/designations/add/:id"
              element={
                <Layout>
                  <DesignationForm />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/talent-acquisition/designations/add"
              element={
                <Layout>
                  <DesignationForm />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/succession"
              element={
                <Layout>
                  <SuccessionPlanningForm />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/succession-planning"
              element={
                <Layout>
                  <SuccessionPlanningList />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/succession-planning/add"
              element={
                <Layout>
                  <SuccessionPlanningForm />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/succession-planning/edit/:id"
              element={
                <Layout>
                  <SuccessionPlanningForm />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/daily-attendance"
              element={
                <Layout>
                  <DailyAttendance />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/unassigned-tasks"
              element={
                <Layout>
                  <UnassignedTasks />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/announcements"
              element={
                <Layout>
                  <Announcements />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/interview-schedule"
              element={
                <Layout>
                  <InterviewSchedule />
                </Layout>
              }
            />
            <Route
              path="/admin/recruitment/interviews-list"
              element={
                <Layout>
                  <RecruitmentPage />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/off-boarding"
              element={
                <Layout>
                  <OffBoardingTaskAssignmentForm />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/on-boarding"
              element={
                <Layout>
                  <OnBoardingTaskAssignmentForm />
                </Layout>
              }
            />
             <Route
              path="/admin/human-resource/master-task"
              element={
                <Layout>
                  <EditMasterTask />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/unassigned-tasks"
              element={
                <Layout>
                  <UnassignedTasks />
                </Layout>
              }
            />
            <Route
              path="/admin/training-and-courses"
              element={
                <Layout>
                  <TrainingAndCourses />
                </Layout>
              }
            />
            <Route
              path="/admin/training-and-courses/trainings"
              element={
                <Layout>
                  <Trainings />
                </Layout>
              }
            />
            <Route
              path="/admin/training-and-courses/courses"
              element={
                <Layout>
                  <Courses />
                </Layout>
              }
            />
            <Route
              path="/inspiration-videos"
              element={
                <Layout>
                  <InspirationVideos />
                </Layout>
              }
            />
            <Route
              path="/self/resignation-request"
              element={
                <Layout>
                  <ResignationRequestPage />
                </Layout>
              }
            />
              <Route
              path="/self/resignation-onbehalf"
              element={
                <Layout>
                  <ResignationRequestPage />
                </Layout>
              }
            />
             <Route
              path="/self/termination-request"
              element={
                <Layout>
                  <TerminationRequestPage />
                </Layout>
              }
            />
              <Route
              path="/self/contract-end-request"
              element={
                <Layout>
                  <ContractEndRequest />
                </Layout>
              }
            />
            <Route
              path="/self/warnings"
              element={
                <Layout>
                  <WarningRequestPage />
                </Layout>
              }
            />
            <Route
              path="/self/my-warnings"
              element={
                <Layout>
                  <MyWarningsPage />
                </Layout>
              }
            />
            <Route
              path="/self/dashboard"
              element={
                <Layout>
                  <SelfServiceDashboard />
                </Layout>
              }
            />
            <Route
              path="/admin/human-resource/photo-gallery"
              element={
                <Layout>
                  <PhotoGallery />
                </Layout>
              }
            />
            <Route path="/" element={<SignIn />} />
          </Route>
          <Route element={<CandidateOutlet />}>
            <Route
              path="/public/candidates/update/:id"
              element={<PublicCandidateForm />}
            />
            <Route
              path="/public/candidates/offer-letter"
              element={<CandidateOfferLetter />}
            />
            <Route
              path="/public/candidates/offer-letter/:id/upload-documents"
              element={<UploadOfferLetterDocuments />}
            />
            <Route
              path="/public/candidates/contract"
              element={<OfficialContract />}
            />
            <Route
              path="/public/candidates/contract/:id/upload-documents"
              element={<UploadContractDocuments />}
            />
            {/* Candidate Landing Page */}
            {/* Edit Profile */}/{/* View Offer Letter */}
            {/* <Route path="/candidate/offers" element={<CandidateOffersPage />} /> */}
          </Route>

          <Route
            path="/public/candidates/add"
            element={<PublicCandidateForm />}
          />

          {/*Auth Signin/Signup =====================================================================================================*/}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* URL Not Found Page   ==================================================================================================*/}
          <Route path="*" element={<NotFoundPage />} />
          {/* ===== NEW SELF SERVICE ROUTES ===== */}
          <Route path="/self/leave-encashment" element={<Layout><LeaveEncashmentPage /></Layout>} />
          <Route path="/self/leave-adjustment" element={<Layout><LeaveAdjustmentPage /></Layout>} />
          <Route path="/self/official-hours-permission" element={<Layout><OfficialHoursPermissionPage /></Layout>} />
          <Route path="/self/personal-hours-permission" element={<Layout><PersonalHoursPermissionPage /></Layout>} />
          <Route path="/self/promotion" element={<Layout><PromotionPage /></Layout>} />
          <Route path="/self/transfer" element={<Layout><TransferPage /></Layout>} />
          <Route path="/self/grade-change" element={<Layout><GradeChangePage /></Layout>} />
          <Route path="/self/department-change" element={<Layout><DepartmentChangePage /></Layout>} />
          <Route path="/self/location-change" element={<Layout><LocationChangePage /></Layout>} />
          <Route path="/self/family-status-change" element={<Layout><FamilyStatusChangePage /></Layout>} />
          {/* ===== NEW ADMIN ROUTES ===== */}
          <Route path="/admin/human-resource/leave-schedule" element={<Layout><LeaveSchedulePage /></Layout>} />
          <Route path="/admin/human-resource/promotions" element={<Layout><PromotionsListPage /></Layout>} />
          <Route path="/admin/asset-management/tracking" element={<Layout><AssetTrackingPage /></Layout>} />
          <Route path="/admin/asset-management/maintenance" element={<Layout><AssetMaintenancePage /></Layout>} />
          <Route path="/admin/asset-management/history" element={<Layout><AssetHistoryPage /></Layout>} />
          <Route path="/admin/asset-management/disposal" element={<Layout><AssetDisposalPage /></Layout>} />
          <Route path="/admin/assets" element={<Layout><AssetManagementDashboard /></Layout>} />
          <Route path="/admin/assets/catalog" element={<Layout><AssetCatalogPage /></Layout>} />
          <Route path="/admin/assets/form" element={<Layout><AssetFormPage /></Layout>} />
          <Route path="/admin/assets/reports" element={<Layout><AssetReportsPage /></Layout>} />
          <Route path="/admin/shifts" element={<Layout><ShiftManagementPage /></Layout>} />
          <Route path="/admin/shifts/roster" element={<Layout><ShiftRosterPage /></Layout>} />
          <Route path="/admin/shifts/requests" element={<Layout><RosterRequestsPage /></Layout>} />
          <Route path="/admin/shifts/employee-roster" element={<Layout><EmployeeRosterPage /></Layout>} />
          <Route path="/admin/recruitment/dashboard" element={<Layout><RecruitmentDashboardPage /></Layout>} />
          <Route path="/admin/recruitment/requisitions" element={<Layout><JobRequisitionsPage /></Layout>} />
          <Route path="/admin/company-info/holiday-calendar" element={<Layout><HolidayCalendarPage /></Layout>} />
          <Route path="/transactions/travel-dashboard" element={<Layout><TravelDashboardPage /></Layout>} />
          <Route path="/admin/training-and-courses/dashboard" element={<Layout><TrainingDashboardPage /></Layout>} />
          <Route path="/reports/asset-report" element={<Layout><AssetReportPage /></Layout>} />
          <Route path="/admin/training-and-courses/calendar" element={<Layout><TrainingCalendarPage /></Layout>} />
          <Route path="/admin/training-and-courses/learning-pathways" element={<Layout><LearningPathwaysPage /></Layout>} />
          <Route path="/admin/training-and-courses/certifications" element={<Layout><CertificationsPage /></Layout>} />
          <Route path="/admin/training-and-courses/assessments" element={<Layout><AssessmentsPage /></Layout>} />
          <Route path="/admin/training-and-courses/trainers" element={<Layout><TrainersPage /></Layout>} />
          <Route path="/admin/training-and-courses/annual-plan" element={<Layout><AnnualPlanPage /></Layout>} />
          <Route path="/reports/training-report" element={<Layout><TrainingReportPage /></Layout>} />
          <Route path="/performance/compensation-dashboard" element={<Layout><CompensationDashboardPage /></Layout>} />
          <Route path="/performance/bonus-incentives" element={<Layout><BonusIncentivesPage /></Layout>} />
          <Route path="/performance/salary-history" element={<Layout><SalaryHistoryPage /></Layout>} />
          <Route path="/performance/career-development" element={<Layout><CareerDevelopmentPage /></Layout>} />
          <Route path="/reports/performance-report" element={<Layout><PerformanceReportPage /></Layout>} />
        </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
