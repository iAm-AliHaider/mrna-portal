import React, { useState, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const tabOptions = [
  { key: "active", label: "Active" },
  { key: "expired", label: "Expired" },
];

const AnnouncmentsCard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeAnnouncements, setActiveAnnouncements] = useState([]);
  const [expiredAnnouncements, setExpiredAnnouncements] = useState([]);
  const { user } = useUser();
  const employeeId = user?.id ?? null;

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line
  }, [employeeId, user?.company_id]);

  async function fetchAnnouncements() {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateString = `${yyyy}-${mm}-${dd}`;
    try {
      const { data, error } = await supabase.rpc("get_my_announcements", {
        p_employee_id: employeeId,
        p_company_id: user?.company_id,
        p_search: null,
        p_limit: 10,
        p_offset: 0,
        p_today: dateString || null,
      });


      if (error) throw error;
      // Split into active/expired based on announcement_status or active_date
      const now = new Date();
      const active = [];
      const expired = [];
      data.forEach((row) => {
        // If announcement_status is 'active' or active_date >= today
        if (
          (row.announcement_status &&
            row.announcement_status.toLowerCase() === "active") ||
          (row.active_date && new Date(row.active_date) >= now)
        ) {
          active.push({
            text: row.title,
            time: row.active_date,
            ...row,
          });
        } else {
          expired.push({
            text: row.title,
            time: row.active_date,
            ...row,
          });
        }
      });
      setActiveAnnouncements(active.slice(0, 5));
      setExpiredAnnouncements(expired.slice(0, 5));
    } catch (err) {
      setError("Failed to fetch announcements");
      toast.error("Failed to load announcements");
      setActiveAnnouncements([]);
      setExpiredAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  const currentMessages =
    activeTab === "active" ? activeAnnouncements : expiredAnnouncements;

  return (
    <div className="bg-white rounded-xl shadow border  w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Announcments
      </div>

      {/* Tabs */}
      <div className="p-4">
        <div className="flex text-xs font-medium rounded-md  border border-gray-300 overflow-hidden">
          {tabOptions.map(({ key, label }, index) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={
                  `flex-1 px-2 py-1.5 transition-all duration-150 ` +
                  (isActive
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "bg-white text-gray-600 hover:text-indigo-500") +
                  (index !== tabOptions.length - 1
                    ? " border-r border-gray-300"
                    : "")
                }
              >
                <span className="text-xs">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-2 mt-2  min-h-[120px]">
          {loading ? (
            <div className="text-sm text-gray-400 text-center mt-4">
              Loading...
            </div>
          ) : error ? (
            <div className="text-sm text-red-400 text-center mt-4">{error}</div>
          ) : currentMessages.length > 0 ? (
            currentMessages.map((msg, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-md p-2 text-sm flex justify-between items-start"
              >
                <span className="w-3/5">{msg.text}</span>
                <span className="text-xs text-gray-500 text-right">
                  {msg.time}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 text-center mt-4">
              No messages yet.
            </div>
          )}
        </div>

        {/* Input */}
        {/* <div className="flex items-center mt-2">
          <input
            className="flex-1 border border-gray-300 text-sm rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Type your text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="bg-primary text-white px-4 py-2 rounded-r-md">
            <SendIcon fontSize="small" />
          </button>
        </div> */}
        <div className="pt-4 text-center">
          <button
            onClick={() => navigate("/employees/announcements")}
            className="text-indigo-600 text-sm hover:underline"
          >
            See Listing
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncmentsCard;
