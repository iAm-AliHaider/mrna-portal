import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Flight, 
  Build, 
  Business, 
  BusinessCenter, 
  DirectionsCar, 
  Security 
} from "@mui/icons-material";
import { useDashboardRequests } from "../../../utils/hooks/api/dashboard";

const SelfServiceCard = () => {
  const navigate = useNavigate();
  const { requestStats, recentRequests, loading, error } = useDashboardRequests();
  // Dynamic stats based on real data
  const stats = [
    { 
      label: "Pending for my approval/ review", 
      count: requestStats.pending, 
      footer: "Pending/ History" 
    },
    { 
      label: "My Pending Request", 
      count: requestStats.pending, 
      footer: "Details" 
    },
    { 
      label: "My Completed (in last 30 days)", 
      count: requestStats.completed, 
      footer: "Details" 
    },
    { 
      label: "My Approved Requests", 
      count: requestStats.approved, 
      footer: "Details" 
    },
  ];

  // Use recent requests as frequent items
  const frequentItems = recentRequests.length > 0 
    ? recentRequests.map(req => `${req.title} (${req.status})`)
    : ["No recent requests"];

  const quickAccessIcons = [
    { icon: <Flight className="text-indigo-600" />, label: "Travel" },
    { icon: <Build />, label: "Purchasing" },
    { icon: <Business />, label: "Maintenance" },
    { icon: <BusinessCenter />, label: "Governmental" },
    { icon: <DirectionsCar />, label: "Messaging & Parking" },
    { icon: <Security />, label: "User Access & Comms" },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border w-full flex flex-col gap-5">
        <div>
          <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
            Self Service
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="bg-gray-100 rounded-md rounded-t-md text-center text-sm">
                <div className="text-xs font-medium  text-white rounded-t-md p-2 h-8 bg-gray-300 animate-pulse"></div>
                <div className="text-2xl font-bold text-gray-800 my-1 p-2 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="text-xs text-gray-500 p-2 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow border w-full flex flex-col gap-5">
        <div>
          <div className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-t-md mb-3">
            Self Service
          </div>
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">Failed to load request data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border w-full flex flex-col gap-5">
      {/* Self Service Panel */}
      <div>
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          Self Service
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
          {stats.map((item, index) => (
            <div key={index} className="bg-gray-100 rounded-md rounded-t-md text-center text-sm">
              <div className="text-xs font-medium text-white bg-pink-600 rounded-t-md p-2">{item.label}</div>
              <div className="text-2xl font-bold text-gray-800 my-1 p-2">{item.count}</div>
              <div className="text-xs text-gray-500 p-2">{item.footer}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Frequent */}
      <div className="p-4">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          My Recent Requests
        </div>
        <div className="flex flex-col gap-2">
          {frequentItems.map((item, i) => (
            <div key={i} className="bg-gray-50 px-4 py-2 rounded-md text-sm text-gray-700">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Flight Request Callout */}
      <div className="bg-gray-50 rounded-md p-4 text-center ">
        <div className="text-indigo-700 flex justify-center mb-2">
          <Flight sx={{ fontSize: 28 }} />
        </div>
        <div className="font-medium text-sm text-gray-700 mb-2">Have to book a flight?</div>
        <button onClick={() => navigate("/self/documents-requests")} className="bg-primary text-white text-xs px-4 py-1 rounded-md hover:bg-indigo-800 transition">
          Submit a Request
        </button>
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-3 gap-4 p-4 text-xs text-center text-gray-600">
        {quickAccessIcons.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="text-xl">{item.icon}</div>
            <div>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelfServiceCard;
