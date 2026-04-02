import {
  People,
  Description,
  Folder,
  Article,
  Summarize,
  AttachMoney,
  Business,
  Work,
  PeopleAlt,
  VideoLibrary,
  Message,
  Event,
  Dashboard,
  Announcement,
  Inventory,
  School,
} from "@mui/icons-material";

export const DUMMY_AUTH_USERS = [
  {
    name: "Admin",
    role: "admin",
    id: 1,
    email: "admin@admin.com",
    username: "admin@admin.com",
    password: "admin",
  },
  {
    name: "Employee",
    role: "employee",
    id: 2,
    email: "employee@employee.com",
    username: "employee@employee.com",
    password: "employee",
  },
];

export const EMPLOYEE_RECORDS_MEMU = [
  {
    label: "General",
    children: [
      { label: "General Information", value: "general" },
      // { label: "Job Information", value: "job" },
      { label: "Employment Information", value: "employment" },
    ],
  },
  {
    label: "Personal",
    children: [
      { label: "Personal Information", value: "personal" },
      // { label: "Employee ID Types", value: "id-types" },
      // { label: "Attachments", value: "attachments" },
    ],
  },
  {
    label: "Hiring",
    children: [{ label: "Schedule Interviews", value: "interviews" }],
  },
  {
    label: "Contact",
    children: [
      { label: "Work Address", value: "work-address" },
      { label: "Home Address", value: "home-address" },
    ],
  },
  {
    label: "Transactions",
    children: [
      { label: "Vacation Request", value: "vacation" },
      { label: "Ticket Request", value: "ticket" },
      { label: "Leaves Records", value: "leaves" },
      { label: "Official Letters", value: "letters" },
      { label: "Business Travels", value: "travels" },
      { label: "Loan Request", value: "loan" },
      { label: "Document Request", value: "document" },
      { label: "Grievance & Suggestion", value: "grievance" },
    ],
  },
];

export const EMPLOYEE_REOCRDS_PAGE_TITLE = {
  general: {
    pageTitle: "Employee General Information",
    breadcrumbs: [
      { title: "General" },
      { title: "Employee General Information" },
    ],
  },
  job: {
    pageTitle: "Emplyee Job Information",
    breadcrumbs: [{ title: "General" }, { title: "Employee Job Information" }],
  },
  employment: {
    pageTitle: "Emplyee Employment Information",
    breadcrumbs: [{ title: "General" }, { title: "Employment Information" }],
  },
  personal: {
    pageTitle: "Emplyee Personal Information",
    breadcrumbs: [
      { title: "Personal" },
      { title: "Employee Personal Information" },
    ],
  },
  "id-types": {
    pageTitle: "Emplyee ID Types",
    breadcrumbs: [{ title: "Personal" }, { title: "Employee ID Types" }],
  },
  attachments: {
    pageTitle: "Attachments",
    breadcrumbs: [{ title: "Personal" }, { title: "Attachments" }],
  },
  interviews: {
    pageTitle: "Scheduled Interviews",
    breadcrumbs: [{ title: "Hiring" }, { title: "Scheduled Interviews" }],
  },
  "work-address": {
    pageTitle: "Employee Work Address",
    breadcrumbs: [
      { title: "Contact Info" },
      { title: "Employee Work Address" },
    ],
  },
  "home-address": {
    pageTitle: "Employee Home Address",
    breadcrumbs: [
      { title: "Contact Info" },
      { title: "Employee Home Address" },
    ],
  },
  vacation: {
    pageTitle: "Vacation Request",
    breadcrumbs: [{ title: "Transactions" }, { title: "Vacation Request" }],
  },
  ticket: {
    pageTitle: "Ticket Request",
    breadcrumbs: [{ title: "Transactions" }, { title: "Ticket Request" }],
  },
  leaves: {
    pageTitle: "Leaves Records",
    breadcrumbs: [{ title: "Transactions" }, { title: "Leaves Records" }],
  },
  letters: {
    pageTitle: "Official Letters",
    breadcrumbs: [{ title: "Transactions" }, { title: "Official Letters" }],
  },
  travels: {
    pageTitle: "Business Travels",
    breadcrumbs: [{ title: "Transactions" }, { title: "Business Travels" }],
  },
};

export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  HR: "hr",
  HOD: "hod",
  MANAGER: "manager",
  HR_MANAGER: "hr_manager",
  ALL: "all",
  CANDIDATE: "candidate",
};

export const SIDEBAR_MENU_DATA = [
  {
    label: "Company Setup",
    icon: <Business />,
    children: [
      {
        label: "General",
        path: "/admin/company-info/general",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Branches",
        path: "/admin/company-info/branches",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Organizational Structure",
        path: "/admin/company-info/org-structure",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Holidays Definition",
        path: "/admin/company-info/holidays",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Company Policy",
        path: "/admin/company-info/policy",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Official Letter Categories",
        path: "/admin/company-info/letters-categories",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },

      {
        label: "Asset Categories",
        path: "/admin/company-info/asset-categories",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Employment Type",
        path: "/admin/job-info/employment-type",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
    ],
    allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
  },
  {
    label: "People & Organization",
    icon: <People />,
    children: [
      {
        label: "Employee Records",
        path: "/employees/records",
        allowedTo: [
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.HR,
          ROLES.ADMIN,
        ],
      },
      {
        label: "Designations",
        path: "/admin/human-resource/talent-acquisition/designations",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
      },
      {
        label: "Talent Acquisition",
        children: [
          {
            label: "Vacancies",
            path: "/admin/human-resource/talent-acquisition/vacancies",
            allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
          },
          {
            label: "Candidates",
            path: "/admin/human-resource/talent-acquisition/candidates",
            allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
          },
          {
            label: "Schedule Interviews",
            path: "/admin/human-resource/interview-schedule",
            allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
          },
          {
            label: "Offer Requests",
            value: "offer-request",
            path: "/admin/human-resource/talent-aquisition/offers-list",
            allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
          },
          // {
          //   label: "Offer Requests",
          //   value: "offer-request",
          //   path: "/admin/human-resource/talent-aquisition/offer-request",
          //   allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
          // },
          {
            label: "Contracts List",
            value: "contracts-list",
            path: "/admin/human-resource/talent-aquisition/contracts-list",
            allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
          },
        ],
      },
      {
        label: "Pre-Hiring Tasks",
        path: "/admin/human-resource/unassigned-tasks",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
      },      {
        label: "Training & Courses",
        icon: <School />,
        children: [
          {
            label: "Training Calendar",
            path: "/admin/training-and-courses/calendar",
            allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER, ROLES.MANAGER, ROLES.HOD],
          },
          {
            label: "Learning Pathways",
            path: "/admin/training-and-courses/learning-pathways",
            allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
          },
          {
            label: "Certifications",
            path: "/admin/training-and-courses/certifications",
            allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
          },
          {
            label: "Assessments",
            path: "/admin/training-and-courses/assessments",
            allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
          },
          {
            label: "Trainers",
            path: "/admin/training-and-courses/trainers",
            allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
          },
          {
            label: "Annual Plan",
            path: "/admin/training-and-courses/annual-plan",
            allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
          },
          {
            label: "Reports",
            path: "/reports/training-report",
            allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
          },
        ],
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER, ROLES.MANAGER, ROLES.HOD],
      },
      {
        label: "Leave Schedule",
        path: "/admin/human-resource/leave-schedule",
        allowedTo: [ROLES.HOD, ROLES.MANAGER, ROLES.HR_MANAGER, ROLES.ADMIN],
      },
      {
        label: "Promotions",
        path: "/admin/human-resource/promotions",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
      },

      {
        label: "On Boarding Tasks Assignment",
        path: "/admin/human-resource/on-boarding",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
      },
      {
        label: "Task Master",
        path: "/admin/human-resource/master-task",
        allowedTo: [ROLES.HR_MANAGER, ROLES.ADMIN],
      },
      {
        label: "Off Boarding Tasks Assignment",
        path: "/admin/human-resource/off-boarding",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
      },
      {
        label: "On Boarding Tasks",
        path: "/employees/onboarding-tasks",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Off Boarding Tasks",
        path: "/employees/offboarding-tasks",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Succession Planning",
        path: "/admin/human-resource/succession-planning",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
      },
    ],
    allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER, ROLES.MANAGER],
  },
  {
    label: "Self Service",
    icon: <Description />,
    children: [
      {
        label: "My Documents",
        path: "/self/documents-requests",
        allowedTo: [
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR,
          ROLES.HR_MANAGER,
          ROLES.HR,
        ],
      },
      {
        label: "My Announcements",
        path: "/employees/announcements",
        allowedTo: [
          ROLES.EMPLOYEE,
          ROLES.HR,
          ROLES.HR_MANAGER,
          ROLES.MANAGER,
          ROLES.HOD,
        ],
      },
      {
        label: "My Surveys",
        path: "/employees/surveys",
        allowedTo: [
          ROLES.HR,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.ADMIN,
          ROLES.EMPLOYEE,
        ],
      },

      {
        label: "My Task",
        path: "/employees/tasks",
        allowedTo: [
          ROLES.ADMIN,
          ROLES.EMPLOYEE,
          ROLES.HR,
          ROLES.HR_MANAGER,
          ROLES.MANAGER,
          ROLES.HOD,
        ],
      },
      {
        label: "My Approvals",
        path: "/self/my-approvals",
        allowedTo: [ROLES.MANAGER, ROLES.HOD, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "My Transactions",
        path: "/self/transactions",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "My Justifications",
        path: "/self/my-justifications",
        allowedTo: [ROLES.EMPLOYEE],
      },
      {
        label: "Justification Inquiries",
        path: "/self/justification-inquiries",
        allowedTo: [ROLES.MANAGER, ROLES.HOD],
      },
      {
        label: "My Appraisals",
        path: "/performance/my-appraisals",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD],
      },
      {
        label: "My Warnings",
        path: "/self/my-warnings",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },      {
        label: "Compensation Dashboard",
        path: "/performance/compensation-dashboard",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.HR_MANAGER, ROLES.MANAGER, ROLES.HOD],
      },
      {
        label: "Bonus & Incentives",
        path: "/performance/bonus-incentives",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
      },
      {
        label: "Salary History",
        path: "/performance/salary-history",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.MANAGER, ROLES.HOD, ROLES.ADMIN],
      },
      {
        label: "Career Development",
        path: "/performance/career-development",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.HR_MANAGER, ROLES.MANAGER, ROLES.HOD],
      },

    ],
    allowedTo: [
      ROLES.HR,
      ROLES.MANAGER,
      ROLES.HOD,
      ROLES.HR_MANAGER,
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
    ],
  },
  {
    label: "Requests and Approvals",
    icon: <Description />,
    children: [
      {
        label: "Leave Request",
        path: "/self/leave-request",
        allowedTo: [
          ROLES.HR_MANAGER,
          ROLES.HR,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.EMPLOYEE,
        ],
      },
      {
        label: "Loan Request",
        path: "/self/loan-request",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "Resignation Request",
        path: "/self/resignation-request",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "Resignation On Behalf",
        path: "/self/resignation-onbehalf",
        allowedTo: [ROLES.ADMIN],
      },
      {
        label: "Termination Request",
        path: "/self/termination-request",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Contract End Request",
        path: "/self/contract-end-request",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Documents Request",
        path: "/self/documents-requests",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "Master Data Request",
        path: "/self/master-data-request",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "Allowance Request",
        path: "/self/allowance-request",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "Attendance Request",
        path: "/self/attendance-request",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "Expense Claim Request",
        path: "/self/claims",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "Warning Letter",
        path: "/self/warnings",
        allowedTo: [
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.HR,
          ROLES.ADMIN,
        ],
      },
      {
        label: "Offer Request Approvals",
        path: "/hr/offer-approvals",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.HOD, ROLES.MANAGER],
      },
      // {
      //   label: "Document Approvals",
      //   path: "/self/documents-approvals",
      //   allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.MANAGER],
      // },
      {
        label: "Off Boarding Request",
        path: "/self/off-boarding-request",
        allowedTo: [ROLES.MANAGER, ROLES.HOD, ROLES.HR],
      },
      {
        label: "Off Boarding Approval",
        path: "/self/off-boarding-approvals",
        allowedTo: [ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER, ROLES.HR],
      },
      {
        label: "Advance Salary",
        path: "/self/advance-salary",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "Pay Stoppage",
        path: "/self/pay-stopage",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Justification Request",
        path: "/self/justification-request",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      // {
      //   label: "Salary Slips",
      //   path: "/self/salary-slips",
      //   allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HR_MANAGER, ROLES.EMPLOYEE],
      // },
      {
        label: "General Documents",
        path: "/self/documents",
        allowedTo: [
          ROLES.MANAGER,
          ROLES.HR_MANAGER,
          ROLES.HOD,
          ROLES.HR,
          ROLES.EMPLOYEE,
        ],
      },
      {
        label: "Leave Encashment",
        path: "/self/leave-encashment",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Leave Adjustment",
        path: "/self/leave-adjustment",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Official Hours Permission",
        path: "/self/official-hours-permission",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Personal Hours Permission",
        path: "/self/personal-hours-permission",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Promotion",
        path: "/self/promotion",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Transfer",
        path: "/self/transfer",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Grade Change",
        path: "/self/grade-change",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Department Change",
        path: "/self/department-change",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Location Change",
        path: "/self/location-change",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
      {
        label: "Family Status Change",
        path: "/self/family-status-change",
        allowedTo: [ROLES.EMPLOYEE, ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
      },
    ],
    allowedTo: [
      ROLES.HR,
      ROLES.MANAGER,
      ROLES.HOD,
      ROLES.HR_MANAGER,
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
    ],
  },
  {
    label: "Performance Management",
    icon: <Summarize />,
    children: [
      {
        label: "Departmental Objectives",
        path: "/performance/dept-objectives",
        allowedTo: [ROLES.MANAGER, ROLES.HOD],
      },
      {
        label: "Organizational Objectives",
        path: "/performance/org-objectives",
        allowedTo: [
          ROLES.HR,
          ROLES.HR_MANAGER,
          ROLES.HOD,
          ROLES.ADMIN,
          ROLES.MANAGER,
        ],
      },
      {
        label: "Employee Objectives",
        path: "/performance/employee-objectives",
        allowedTo: [
          ROLES.HR,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.ADMIN,
          ROLES.EMPLOYEE,
        ],
      },
      {
        label: "Appraisals",
        path: "/performance/appraisals",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER],
      },

      {
        label: "Appraisals Review",
        path: "/performance/appraisals/review",
        allowedTo: [ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
    ],
    allowedTo: [
      ROLES.HR,
      ROLES.HR_MANAGER,
      ROLES.ADMIN,
      ROLES.MANAGER,
      ROLES.HOD,
      ROLES.EMPLOYEE,
    ],
  },
  {
    label: "Training & Development",
    icon: <PeopleAlt />,
    children: [
      {
        label: "Trainings",
        path: "/admin/training-and-courses/trainings",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Courses",
        path: "/admin/training-and-courses/courses",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Training And Courses",
        path: "/admin/training-and-courses",
        allowedTo: [
          ROLES.ADMIN,
          ROLES.HR,
          ROLES.HR_MANAGER,
          ROLES.HOD,
          ROLES.MANAGER,
        ],
      },
      {
        label: "Training And Developement",
        path: "/training/training-and-developement",
        allowedTo: [ROLES.EMPLOYEE],
      },
    ],
    allowedTo: [
      ROLES.ADMIN,
      ROLES.HR,
      ROLES.HR_MANAGER,
      ROLES.MANAGER,
      ROLES.HOD,
      ROLES.EMPLOYEE,
    ],
  },
  {
    label: "Attendance Management",
    icon: <Article />,
    children: [
      {
        label: "Daily Attendance Transactions",
        path: "/attendance/daily",
        allowedTo: [
          ROLES.HR,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.ADMIN,
          ROLES.EMPLOYEE,
        ],
      },
      {
        label: "Daily Attendance",
        path: "/admin/human-resource/daily-attendance",
        allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
      },
      {
        label: "Manual Attendance",
        path: "/attendance/manual",
        allowedTo: [
          ROLES.HR,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.ADMIN,
          ROLES.EMPLOYEE,
        ],
      },
    ],
    allowedTo: [
      ROLES.HR,
      ROLES.MANAGER,
      ROLES.HOD,
      ROLES.HR_MANAGER,
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
    ],
  },
  {
    label: "Business & Transactions",
    icon: <AttachMoney />,
    children: [
      {
        label: "OverTime Requests",
        path: "/transactions/overtime",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      // {
      //   label: "Vacation Request",
      //   path: "/transactions/vacation",
      //   allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
      // },
      {
        label: "Ticket Request",
        path: "/transactions/ticket",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      // {
      //   label: "Record Leaves",
      //   path: "/transactions/leaves",
      //   allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
      // },
      // {
      //   label: "Survey Responses",
      //   path: "/transactions/surveys",
      //   allowedTo: [ROLES.ALL],
      // },
      {
        label: "Official Letters",
        path: "/transactions/letters",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.ADMIN],
      },
      {
        label: "Business Travels",
        path: "/transactions/travels",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
      },
      {
        label: "Asset Transactions",
        path: "/transactions/assets",
        allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.ADMIN],
      },
      {
        label: "Meeting Room Bookings",
        path: "/transactions/meetings",
        allowedTo: [ROLES.ADMIN, ROLES.ALL],
      },
    ],
    allowedTo: [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
  },

  {
    label: "Reports",
    icon: <Article />,
    children: [
      // {
      //   label: "Employees Salary Slip Reports",
      //   path: "/reports/salary-slips",
      //   allowedTo: [ROLES.ADMIN,ROLES.MANAGER, ROLES.HR_MANAGER, ROLES.HR],
      // },
      {
        label: "Daily Attendance Report",
        path: "/reports/daily-attendance",
        allowedTo: [
          ROLES.ADMIN,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.HR,
        ],
      },
      {
        label: "Leave Report",
        path: "/reports/leave",
        allowedTo: [
          ROLES.ADMIN,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.HR,
        ],
      },
      {
        label: "Loan Requests Report",
        path: "/reports/loan-requests",
        allowedTo: [
          ROLES.ADMIN,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.HR,
        ],
      },
      {
        label: "Leave Balance Report",
        path: "/reports/leave-balance-report",
        allowedTo: [
          ROLES.ADMIN,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.HR,
        ],
      },
      {
        label: "Hiring Report",
        path: "/reports/hiring",
        allowedTo: [
          ROLES.ADMIN,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.HR,
        ],
      },
    ],
    allowedTo: [
      ROLES.ADMIN,
      ROLES.MANAGER,
      ROLES.HOD,
      ROLES.HR_MANAGER,
      ROLES.HR,
    ],
  },
  {
    label: "Surveys",
    icon: <Dashboard />,
    children: [
      {
        label: " Surveys",
        path: "/admin/company-info/surveys",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Submitted Surveys",
        path: "/admin/company-info/surveys/submitted",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
    ],
    allowedTo: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HOD, ROLES.HR],
  },
  {
    label: "Communications & Media",
    icon: <Dashboard />,
    children: [
      // {
      //   label: "Employees Salary Slip Reports",
      //   path: "/reports/salary-slips",
      //   allowedTo: [ROLES.ADMIN,ROLES.MANAGER, ROLES.HR_MANAGER, ROLES.HR],
      // },

      {
        label: "Suggestions & Grievances",
        path: "/self/suggestions-grievance",
        allowedTo: [
          ROLES.HR,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.ADMIN,
          ROLES.EMPLOYEE,
        ],
      },
      {
        label: "Inspiring Videos & Tv Interviews",
        path: "/inspiration-videos",
        allowedTo: [
          ROLES.ADMIN,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.HR_MANAGER,
          ROLES.HR,
          ROLES.EMPLOYEE,
        ],
      },
      {
        label: "Corporate Events",
        path: "/employees/corporate-events",
        allowedTo: [
          ROLES.EMPLOYEE,
          ROLES.HR,
          ROLES.HR_MANAGER,
          ROLES.MANAGER,
          ROLES.HOD,
          ROLES.ADMIN,
        ],
      },
      {
        label: "Photo Gallery",
        path: "/admin/human-resource/photo-gallery",
        allowedTo: [
          ROLES.HR,
          ROLES.HR_MANAGER,
          ROLES.ADMIN,
          ROLES.MANAGER,
          ROLES.HOD,
        ],
      },
      {
        label: "Photo Gallery",
        path: "/self/photo-gallery",
        allowedTo: [ROLES.EMPLOYEE],
      },
    ],
    allowedTo: [
      ROLES.ADMIN,
      ROLES.MANAGER,
      ROLES.HOD,
      ROLES.HR_MANAGER,
      ROLES.HR,
      ROLES.EMPLOYEE,
    ],
  },

  {
    label: "Announcements",
    icon: <Announcement />,
    path: "/admin/human-resource/announcements",
    allowedTo: [ROLES.HR, ROLES.HR_MANAGER, ROLES.ADMIN],
  },

  {
    label: "Chat App",
    icon: <Message />,
    path: "/public/chat",
    allowedTo: [
      ROLES.ADMIN,
      ROLES.MANAGER,
      ROLES.HOD,
      ROLES.HR_MANAGER,
      ROLES.HR,
      ROLES.EMPLOYEE,
    ],
  },
];

export const ROUTE_PERMISSIONS = {
  "/home": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.ADMIN,
    ROLES.EMPLOYEE,
  ],
  "/employees/records": [
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.HR,
    ROLES.ADMIN,
  ],
  "/employees/surveys": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.ADMIN,
    ROLES.EMPLOYEE,
  ],
  "/employees/announcements": [
    ROLES.HR_MANAGER,
    ROLES.EMPLOYEE,
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
  ],
  "/employees/tasks": [
    ROLES.ADMIN,
    ROLES.EMPLOYEE,
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.MANAGER,
    ROLES.HOD,
  ],
  "/employees/onboarding-tasks": [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
  "/employees/offboarding-tasks": [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],

  // Self Service routes (accessible by all)
  "/self/my-approvals": [ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER, ROLES.HR],
  "/hr/offer-approvals": [ROLES.HR, ROLES.HR_MANAGER, ROLES.HOD, ROLES.MANAGER],
  "/self/transactions": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
  "/self/my-justifications": [ROLES.EMPLOYEE],
  "/self/justification-inquiries": [ROLES.MANAGER, ROLES.HOD],

  // "/self/actions": [
  //   ROLES.HR,
  //   ROLES.MANAGER,
  //   ROLES.HR_MANAGER,
  //   ROLES.ADMIN,
  //   ROLES.EMPLOYEE,
  // ],
  "/self/leave-request": [ROLES.HR, ROLES.HR_MANAGER, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
  "/self/loan-request": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
  "/self/resignation-request": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.EMPLOYEE,
  ],
  "/self/resignation-onbehalf": [ROLES.ADMIN],
  "/self/warnings": [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.HR,
  ],
  "/self/my-warnings": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
  "/self/advance-salary": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
  "/self/pay-stopage": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.HR_MANAGER],
  "/self/justification-request": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.ADMIN,
  ],
  "/self/salary-slips": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.EMPLOYEE,
  ],
  "/self/claims": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
  "/self/attendance-request": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.EMPLOYEE,
  ],
  "/training/training-and-developement": [ROLES.EMPLOYEE],
  "/self/documents": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.EMPLOYEE,
  ],
  "/self/my-documents": [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.HR,
  ],
  "/self/master-data-request": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.EMPLOYEE,
  ],
  "/self/documents-approvals": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
  ],
  "/self/documents-requests": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.EMPLOYEE,
    ROLES.ADMIN,
    ROLES.HR_MANAGER,
  ],
  // "/self/documents-approvals": [ROLES.HR, ROLES.MANAGER, ROLES.HR_MANAGER],
  "/self/allowance-request": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.EMPLOYEE,
  ],
  "/self/off-boarding-request": [ROLES.MANAGER, ROLES.HOD, ROLES.HR],
  "/self/off-boarding-approvals": [
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.HR,
  ],
  "/self/photo-gallery": [ROLES.EMPLOYEE],
  "/self/suggestions-grievance": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.EMPLOYEE,
  ],
  // '/self/suggestions-grievance/add': [ROLES.ALL],

  // Hiring routes
  "/hiring/interviews": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.ADMIN,
  ],

  // Attendance routes
  "/attendance/manual": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.ADMIN,
    ROLES.EMPLOYEE,
  ],
  "/attendance/daily": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.ADMIN,
    ROLES.EMPLOYEE,
  ],

  // Performance Management routes
  "/performance/org-objectives": [
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.ADMIN,
  ],
  "/performance/employee-objectives": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.ADMIN,
    ROLES.EMPLOYEE,
  ],
  "/performance/appraisals": [ROLES.HR, ROLES.HR_MANAGER],
  "/performance/my-appraisals": [
    ROLES.EMPLOYEE,
    ROLES.HR,
    ROLES.HOD,
    ROLES.MANAGER,
  ],
  "/performance/appraisals/review": [ROLES.MANAGER, ROLES.HOD],
  "/performance/my-appraisals/view-report/:id": [ROLES.EMPLOYEE],
  "/performance/appraisals/view-report/:id": [
    ROLES.MANAGER,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.HR,
    ROLES.ADMIN,
  ],

  // Reports routes'

  // Transaction routes
  "/transactions/overtime": [
    ROLES.HR,
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.EMPLOYEE,
  ],
  // "/transactions/vacation": [ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
  "/transactions/ticket": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
  // "/transactions/leaves": [ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE],
  // "/transactions/surveys": [
  //   ROLES.HR,
  //   ROLES.MANAGER,
  //   ROLES.HR_MANAGER,
  //   ROLES.ADMIN,
  //   ROLES.EMPLOYEE,
  // ],
  "/transactions/letters": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.ADMIN],
  "/transactions/travels": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.EMPLOYEE],
  "/transactions/meetings": [ROLES.ADMIN, ROLES.ALL],
  "/transactions/assets": [ROLES.HR, ROLES.MANAGER, ROLES.HOD, ROLES.ADMIN],

  // Reports routes
  // "/reports/salary-slips": [
  //   ROLES.MANAGER,
  //   ROLES.HR_MANAGER,
  //   ROLES.HR,
  //   ROLES.ADMIN,
  // ],
  "/reports/daily-attendance": [
    ROLES.MANAGER,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.HR,
    ROLES.ADMIN,
  ],
  "/reports/leave": [
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.HR,
    ROLES.ADMIN,
  ],
  "/reports/loan-requests": [
    ROLES.MANAGER,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.HR,
    ROLES.ADMIN,
  ],
  "/reports/leave-balance-report": [
    ROLES.MANAGER,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.HR,
    ROLES.ADMIN,
  ],
  "/reports/hiring": [
    ROLES.MANAGER,
    ROLES.HOD,
    ROLES.HR_MANAGER,
    ROLES.HR,
    ROLES.ADMIN,
  ],

  // Inspiring Vedios routes
  "/inspiration-videos": [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.HR_MANAGER,
    ROLES.HOD,
    ROLES.HR,
    ROLES.EMPLOYEE,
  ],

  // Admin routes
  "/admin/company-info/general": [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
  "/admin/company-info/org-structure": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/company-info/holidays": [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
  "/admin/company-info/policy": [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
  "/admin/company-info/letters-categories": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/company-info/asset-categories": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/company-info/branches": [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
  "/admin/company-info/surveys": [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
  "/admin/company-info/surveys/submitted": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/job-info/employment-type": [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
  "/admin/human-resource/talent-acquisition/vacancies": [
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.ADMIN,
  ],
  "/admin/human-resource/talent-acquisition/candidates": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/human-resource/talent-acquisition/designations": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/human-resource/talent-aquisition/offer-request": [
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.ADMIN,
  ],
  "/admin/human-resource/talent-aquisition/contracts-list": [
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.ADMIN,
  ],
  "/admin/human-resource/talent-aquisition/contracts-list/create": [
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.ADMIN,
  ],
  "/admin/human-resource/on-boarding": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.ADMIN,
  ],
  "/admin/human-resource/off-boarding": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/human-resource/succession-planning": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/human-resource/succession-planning/add": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/human-resource/succession-planning/edit/:id": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/human-resource/daily-attendance": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/human-resource/announcements": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/human-resource/interview-schedule": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/training-and-courses": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.MANAGER,
    ROLES.HOD,
  ],
  "/admin/training-and-courses/courses": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
  "/admin/training-and-courses/trainings": [
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.HR_MANAGER,
  ],
};

export const TRANSACTION_TYPE_MAP = {
  advance_salary: {
    table: "advance_salary",
    select: `*, employee: employees!advance_salary_employee_id_fkey!inner(*,  candidate: candidates!employees_candidate_id_fkey (*))`,
    title: "Advance Salary Request",
  },
  pay_stopage: {
    table: "advance_salary",
    select: `*, employee: employees!advance_salary_employee_id_fkey!inner(*,  candidate: candidates!employees_candidate_id_fkey (*))`,
    title: "Salary Stoppage Request",
  },
  loan_requests: {
    table: "loan_requests",
    select: `*, employee: employees!loan_requests_created_by_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*)),
      loan_type:loan_types!loan_requests_loan_type_id_fkey!inner(*)
      `,
    title: "Loan Request",
  },
  leave_requests: {
    table: "leave_requests",
    select: `*, employee: employees!leave_requests_employee_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*)),
      leave_qouta: employee_leave_qouta!leave_requests_leave_type_id_fkey!inner(*, leave_type: leaves_vacations_insurance!employee_leave_qouta_leave_type_id_fkey!inner(*))`,
    title: "Leave Request",
  },
  allowance_requests: {
    table: "allowance_requests",
    select:
      "*, employee: employees!allowance_requests_created_by_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Allowance Request",
  },
  attendance_requests: {
    table: "attendance_requests",
    select:
      "*, employee: employees!attendance_requests_created_by_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Attendance Request",
  },
  document_requests: {
    table: "my_documents",
    select: "*",
    title: "Document Request",
  },
  appraisal_requests: {
    table: "appraisals",
    select:
      "*, employee: employees!appraisals_employee_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Appraisal Request",
    // , employee: employees!assets_transactions_assigned_to_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))
  },
   asset_requests: {
    table: "assets_transactions",
    select:
      "*, employee: employees!assets_transactions_assigned_to_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Asset Takeback Request",
  },
  resignation_request: {
    table: "resignation_request",
    select:
      "*, employee: employees!resignation_request_employee_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*), employment_type: employment_types!fk_employment_types(*))",
    title: "Resignation Request",
  },
  resignation_onbehalf: {
    table: "resignation_request",
    select:
      "*, employee: employees!resignation_request_created_by_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*), employment_type: employment_types!fk_employment_types(*))",
    title: "Resignation On Behalf",
  },
  termination_request: {
    table: "termination_request",
    select:
      "*, employee: employees!termination_request_employee_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*), employment_type: employment_types!fk_employment_types(*))",
    title: "Termination Request",
  },
  end_contract_request: {
    table: "end_contract_request",
    select:
      "*, employee: employees!end_contract_request_employee_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*), employment_type: employment_types!fk_employment_types(*))",
    title: "End of Contract Request",
  },
  vacation_requests: {
    table: "vacation_requests",
    select:
      "*, employee: employees!vacation_requests_created_by_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Vacation Request",
  },
  ticket_requests: {
    table: "ticket_requests",
    select:
      "*, employee: employees!ticket_requests_created_by_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Ticket Request",
  },
  my_documents: {
    table: "my_documents",
    select:
      "*, employee: employees!my_documents_author_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Documents Approval",
  },
  business_travels: {
    table: "business_travels",
    select:
      "*, employee:employees!business_travels_employee_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Business Travel",
  },
  overtime_requests: {
    table: "overtime_request",
    select:
      "*, employee:employees!overtime_request_employee_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Overtime Requests",
  },
  course_applications: {
    table: "course_applications",
    select: `*, courses (
            course_name,
            course_details,
            publisher,
            is_training
          ), employee:employees!course_applications_applicant_id_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))`,
    title: "Course Requests",
  },
  master_data_request: {
    table: "master_data_request",
    select:
      "*, employee: employees!master_data_request_created_by_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Master Data Request",
  },
  event_request: {
    table: "events",
    select: "*, employees ( id, organizational_unit_id)",
    title: "Events Data Request",
  },
  suggestion_request: {
    table: "grievance_suggestions",
    select:
      "*, employee: employees!grievance_suggestions_created_by_fkey!inner(*, candidate: candidates!employees_candidate_id_fkey (*))",
    title: "Suggestion Data Request",
  },
};

export const APPROVALS_TYPE_TABS = [
  {
    label: "Loan Requests",
    value: "loan_requests",
  },
  {
    label: "Advance Salary",
    value: "advance_salary",
  },
  {
    label: "Leave Requests",
    value: "leave_requests",
  },
  {
    label: "Allowance/Expense Requests",
    value: "allowance_requests",
  },
  {
    label: "Attendance Requests",
    value: "attendance_requests",
  },
  {
    label: "Asset Request",
    value: "asset_requests",
  },
  {
    label: "Appraisal Request",
    value: "appraisal_requests",
  },
  {
    label: "Resignation Requests",
    value: "resignation_request",
  },
  {
    label: "Termination Requests",
    value: "termination_request",
  },
  {
    label: "End of Contract Requests",
    value: "end_contract_request",
  },

  // {
  //   label: "Vacation Requests",
  //   value: "vacation_requests",
  // },
  {
    label: "Ticket Requests",
    value: "ticket_requests",
  },
  {
    label: "Business Travel",
    value: "business_travels",
  },
  {
    label: "Overtime Requests",
    value: "overtime_requests",
  },
  {
    label: "Course Requests",
    value: "course_applications",
  },
  {
    label: "Pay Stoppage",
    value: "pay_stopage",
  },
  {
    label: "Document Requests",
    value: "my_documents",
  },
  {
    label: "Master Data Request",
    value: "master_data_request",
  },
  {
    label: "Event Request",
    value: "event_request",
  },
  {
    label: "Suggestion Request",
    value: "suggestion_request",
  },
];

export const TRANSACTION_TYPE_TABS = [
  {
    label: "Loan Requests",
    value: "loan_requests",
  },
  {
    label: "Advance Salary",
    value: "advance_salary",
  },
  {
    label: "Leave Requests",
    value: "leave_requests",
  },
  {
    label: "Allowance/Expense Requests",
    value: "allowance_requests",
  },
  {
    label: "Attendance Requests",
    value: "attendance_requests",
  },
  {
    label: "Document Requests",
    value: "document_requests",
  },
  {
    label: "Resignation Requests",
    value: "resignation_request",
  },
  // {
  //   label: "Resignation on Behalf",
  //   value: "resignation_onbehalf",
  // },
  // {
  //   label: "Vacation Requests",
  //   value: "vacation_requests",
  // },
  {
    label: "Ticket Requests",
    value: "ticket_requests",
  },
  {
    label: "Business Travel",
    value: "business_travels",
  },
  {
    label: "Overtime Requests",
    value: "overtime_requests",
  },
  {
    label: "Course Requests",
    value: "course_applications",
  },
  {
    label: "Master Data Request",
    value: "master_data_request",
  },
  {
    label: "Suggestions & Grievance",
    value: "suggestion_request",
  },
];

// ============== Employment Data Start==================

export const JOB_STATUS = [
  {
    id: 1,
    value: "contractual",
    label: "Contractual",
  },
  {
    id: 2,
    value: "Permanent",
    label: "Permanent",
  },
];

export const RULES_DATA = [
  {
    id: 1,
    value: "self_managed",
    label: "Self Managed",
  },
  {
    id: 2,
    value: "company_managed",
    label: "Company Managed",
  },
];

export const ACCOUNT_DATA = [
  {
    id: 1,
    value: "cash",
    label: "Cash",
  },
  {
    id: 2,
    value: "bank",
    label: "Bank",
  },
];

export const POST_HIRING_TASKS = [
  {
    label: "Make an E-Mail, code attendance, Accounts & Prepare PC",
    value: "Make an E-Mail, code attendance, Accounts & Prepare PC",
  },
  {
    label:
      "Register the new employee into AML, Anti fraud & Credit advisor course training",
    value:
      "Register the new employee into AML, Anti fraud & Credit advisor course training",
  },
  {
    label: "Being certain of employee joining date & receiving his/Her Tasks",
    value: "Being certain of employee joining date & receiving his/Her Tasks",
  },
  {
    label: "Candidate Medical Check up",
    value: "Candidate Medical Check up",
  },
  {
    label: "Make an employment contract",
    value: "Make an employment contract",
  },
  {
    label: "Taking all candidate certifications & experiences, National Adress",
    value: "Taking all candidate certifications & experiences, National Adress",
  },
  {
    label: "Taking Candidate IBAN",
    value: "Taking Candidate IBAN",
  },
  {
    label:
      "New employee sign into a code of conduct & cybersecurity conduct & NDA",
    value:
      "New employee sign into a code of conduct & cybersecurity conduct & NDA",
  },
  {
    label: "Register the employee into life insurance",
    value: "Register the employee into life insurance",
  },
  {
    label: "Register the employee into medical insurance",
    value: "Register the employee into medical insurance",
  },
  {
    label: "Create to the new employee an HR Account",
    value: "Create to the new employee an HR Account",
  },
  {
    label: "Make AMN Clearance Certificate",
    value: "Make AMN Clearance Certificate",
  },
  {
    label: "Register the employee in Human Resources fund",
    value: "Register the employee in Human Resources fund",
  },
  {
    label: "Sales KYC",
    value: "Sales KYC",
  },
  {
    label: "NIC for Senior positions",
    value: "NIC for Senior positions",
  },
  {
    label:
      "Be certain that employees have passed, all mandated courses, AML, anti fraud & Credit advisor",
    value:
      "Be certain that employees have passed, all mandated courses, AML, anti fraud & Credit advisor",
  },
  {
    label: "Murabaha's products",
    value: "Murabaha's products",
  },
  {
    label: "Employee card & Access permission",
    value: "Employee card & Access permission",
  },
  {
    label: "Notifying of joining",
    value: "Notifying of joining",
  },
  {
    label: "Make an announcement of new employee",
    value: "Make an announcement of new employee",
  },
];

export const PRE_HIRING_TASKS = [
  {
    label: "Make inquiry in financial crimes",
    value: "Make inquiry in financial crimes",
  },
  {
    label: "Perform SIMH check",
    value: "Perform SIMH check",
  },
  // {
  //   label: "Prepare PC for candidate",
  //   value: "Prepare PC for candidate",
  // },
  // {
  //   label: "Share offer & Confirm joining",
  //   value: "Share offer & Confirm joining",
  // },
];

export const TERMINATION_TASKS = [
  {
    label:
      "Receive all pending tasks from resigned / terminated employees - Direct manager",
    value:
      "Receive all pending tasks from resigned / terminated employees - Direct manager",
  },
  {
    label:
      "Receive all and check if the resigned / terminated has Custody - Direct manager",
    value:
      "Receive all and check if the resigned / terminated has Custody - Direct manager",
  },
  {
    label:
      "Receive all and check if the resigned / terminated has Authorization - Direct manager",
    value:
      "Receive all and check if the resigned / terminated has Authorization - Direct manager",
  },
  {
    label:
      "Send to the Compliance Team if the resigned / terminated was on a senior position",
    value:
      "Send to the Compliance Team if the resigned / terminated was on a senior position",
  },
  {
    label: "Close emails, accounts & attendance",
    value: "Close emails, accounts & attendance",
  },
  {
    label: "Receive all phones or SIM cards",
    value: "Receive all phones or SIM cards",
  },
  {
    label: "Check if the resigned / terminated has active loans",
    value: "Check if the resigned / terminated has active loans",
  },
  {
    label:
      "Remove the resigned / terminated from medical insurance & life insurance",
    value:
      "Remove the resigned / terminated from medical insurance & life insurance",
  },
  {
    label:
      "Make double check if the resigned / terminated has no bank commitment letter",
    value:
      "Make double check if the resigned / terminated has no bank commitment letter",
  },
  {
    label: "Remove from GOSI & GIWA platforms",
    value: "Remove from GOSI & GIWA platforms",
  },
  {
    label: "Close user access",
    value: "Close user access",
  },
  {
    label: "Notifying of resigned / terminated",
    value: "Notifying of resigned / terminated",
  },
  {
    label: "Make an announcement",
    value: "Make an announcement",
  },
];

// ============== Employment Data End ==================

export const DOCUMENT_TYPES = [
  { label: "Salary Certificate", value: "salary_certificate" },
  { label: "Bank Commitment", value: "bank_commitment" },
  { label: "Bank Transfer Request", value: "bank_transfer_request" },
  { label: "Annual Leave Flight Tickets", value: "annual_leave_flight" },
  { label: "Family Flight Tickets", value: "family_flight_ticket" },
  { label: "Business Trip", value: "business_trip" },
  { label: "Chamber of Commerce with Certified", value: "chamber_of_commerce" },
  { label: "Exit Re-entry Visa", value: "exit_re_entry_visa" },
  { label: "Course Request", value: "course_request" },
  { label: "Dependents Fees Request", value: "dependents_fees_request" },
  // { label: "Candidate Check", value: "candidate_check" },
];
export const MASTER_DATA_TYPES = [
  { label: "Passport Info", value: "passport_info" },
  { label: "Branch", value: "branch" },
  { label: "Family Size", value: "family_size" },
  { label: "Department", value: "department" },
  { label: "Bank Transfer Request", value: "bank_transfer_request" },
  {
    label: "Designation",
    value: "designation",
  },
  { label: "Salary", value: "salary" },
  { label: "Office Number", value: "number" },
  { label: "Address", value: "address" },
  { label: "Probation", value: "probation" },
];

export const INTERVIEW_SCHEDULE_TABS = [
  {
    label: "First Interview",
    value: "first_interview",
  },
  {
    label: "Second Interview",
    value: "second_interview",
  },
  {
    label: "Third Interview",
    value: "third_interview",
  },
];

export const INTERVIEW_TYPES_TABS = [
  {
    label: "Scheduled",
    value: "scheduled",
  },
  {
    label: "Not Scheduled",
    value: "not_scheduled",
  },
];

export const STATUS_FILTER_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export const OFFER_STATUS_FILTER_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Declined", value: "declined" },
];

export const SURVEYS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "In Active", value: "inactive" },
  { label: "Pending", value: "pending" },
];

export const SURVEY_PRIORITY = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export const SURVEY_TYPES = [
  { label: "Survey", value: "survey" },
  { label: "Quiz", value: "quiz" },
  { label: "Poll", value: "poll" },
];

export const OFFER_FILTER_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },

  {
    label: "Asset Management",
    icon: <Inventory />,
    children: [
      {
        label: "Tracking",
        path: "/admin/asset-management/tracking",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Maintenance",
        path: "/admin/asset-management/maintenance",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "History",
        path: "/admin/asset-management/history",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Disposal",
        path: "/admin/asset-management/disposal",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
      {
        label: "Reports",
        path: "/reports/asset-report",
        allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
      },
    ],
    allowedTo: [ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],
  },

];

export const FINANCE_ORG_UNIT_ID = 7;
