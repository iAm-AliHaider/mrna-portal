import React, { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import RestoreIcon from "@mui/icons-material/Restore"; // Recent
import PersonIcon from "@mui/icons-material/Person"; // My Posts
import ArchiveIcon from "@mui/icons-material/Archive"; // Archive

const tabOptions = [
    { key: "recent", label: "Recent", icon: <RestoreIcon /> },
    { key: "myposts", label: "My Posts", icon: <PersonIcon /> },
    { key: "archive", label: "Archive", icon: <ArchiveIcon /> },
  ];
  

const tabData = {
  recent: [
    { text: "New Office Opening", time: "10:45am - 10 Dec 2024" },
    { text: "Family Visit Visa temporarily on hold by Government", time: "10:45am - 21 Dec 2024" },
    { text: "Get ready for the NEW Year!!!", time: "10:45am - 27 Dec 2024" },
  ],
  myPosts: [
    { text: "I suggested the Wellness Wednesday idea", time: "9:00am - 5 Nov 2024" },
    { text: "Posted about remote work guide", time: "2:30pm - 19 Oct 2024" },
  ],
  archive: [
    { text: "Company Townhall Feedback", time: "10:00am - 20 Sep 2024" },
    { text: "Ideas for Office Renovation", time: "3:45pm - 8 Aug 2024" },
  ],
};

const MessageBoardCard = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const [input, setInput] = useState("");

  const currentMessages = tabData[activeTab] || [];

  return (
    <div className="bg-white rounded-xl shadow border  w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Announcments
      </div>

      {/* Tabs */}
      <div className="p-4">
      <div className="flex text-xs font-medium rounded-md  border border-gray-300 overflow-hidden">
  {tabOptions.map(({ key, label, icon }, index) => {
    const isActive = activeTab === key;
    return (
      <button
        key={key}
        onClick={() => setActiveTab(key)}
        className={`
          flex items-center gap-1 justify-center flex-1 px-2 py-1.5 transition-all duration-150
          ${isActive ? "bg-indigo-50 text-indigo-600 font-medium" : "bg-white text-gray-600 hover:text-indigo-500"}
          ${index !== tabOptions.length - 1 ? "border-r border-gray-300" : ""}
        `}
      >
        {React.cloneElement(icon, {
          fontSize: "small",
          className: isActive ? "text-indigo-600" : "text-gray-500",
          style: { fontSize: '16px' }
        })}
        <span className="text-xs">{label}</span>
      </button>
    );
  })}
</div>


      {/* Messages */}
      <div className="flex flex-col gap-2 mt-2  min-h-[120px]">
        {currentMessages.length > 0 ? (
          currentMessages.map((msg, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-md p-2 text-sm flex justify-between items-start"
            >
              <span className="w-3/5">{msg.text}</span>
              <span className="text-xs text-gray-500 text-right">{msg.time}</span>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-400 text-center mt-4">No messages yet.</div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center mt-2">
        <input
          className="flex-1 border border-gray-300 text-sm rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Type your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-primary text-white px-4 py-2 rounded-r-md">
          <SendIcon fontSize="small" />
        </button>
      </div>
      </div>
    </div>
  );
};

export default MessageBoardCard;
