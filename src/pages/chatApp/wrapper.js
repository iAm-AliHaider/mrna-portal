import { useEffect, useState } from "react";
import ChatBox from ".";
import { supabase } from "../../supabaseClient";
import { useUser } from "../../context/UserContext";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";

const drawerWidth = 240;

const MessagingPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [receiverNameMap, setReceiverNameMap] = useState({});
  const [recentChats, setRecentChats] = useState();

  const { user } = useUser();

  useEffect(() => {
    if (user?.candidate_id) {
      fetchCandidates();
      fetchAllPartners();
    }
  }, [user?.candidate_id]);

  const fetchCandidates = async () => {
    // const { data, error } = await supabase
    //   .from("candidates")
    //   .select("id, first_name, second_name, third_name, forth_name, family_name")
    //   .eq("is_employee", true);

    const { data, error } = await supabase
      .from("candidates")
      .select(
        `
    id, first_name, second_name, third_name, forth_name, family_name, is_employee,
    employees!inner ( id, employee_code )   
  `
      )
      .eq("is_employee", true);

    if (data) {
      const tempMap = {};
      data.forEach((c) => {
        const fullName = [
          c.first_name,
          c.second_name,
          c.third_name,
          c.forth_name,
          c.family_name,
        ]
          .filter(Boolean)
          .join(" ");
        tempMap[c.id] = fullName;
      });
      setEmployees(data);
      setReceiverNameMap(tempMap);
    }
  };

  const fetchAllPartners = async () => {
    const { data, error } = await supabase.rpc("get_recent_chat_partners", {
      p_user_id: user?.candidate_id,
    });

    setRecentChats(data);
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex">
      <div className="w-[200px] fixed right-0 top-20 h-screen bg-white shadow-lg pt-16 flex flex-col border-l border-gray-200 z-50">
        <h2 className="text-lg font-semibold px-4 mb-2">Chats</h2>

        <ul className="overflow-y-auto flex-1 px-1">
          {recentChats?.map((user) => (
            <li key={user?.candidate_id}>
              <button
                type="button"
                onClick={() =>
                  setSelectedReceiverId(Number(user?.candidate_id))
                }
                className={`w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition text-sm ${
                  selectedReceiverId === user?.candidate_id
                    ? "bg-gray-200 font-semibold"
                    : ""
                }`}
              >
                {[
                  user?.first_name,
                  user?.second_name,
                  user?.third_name,
                  user?.forth_name,
                  user?.family_name,
                ]
                  .filter(Boolean)
                  .join(" ") || "Unnamed"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          padding: "1rem",
          maxWidth: "600px",
          margin: "0 auto",
          height: "90%",
          flex: 1,
        }}
      >
        <h2>Message an Employee</h2>
        <select
          onChange={(e) => setSelectedReceiverId(Number(e.target.value))}
          value={selectedReceiverId}
          style={{ width: "100%", padding: "8px", marginBottom: "1rem" }}
        >
          <option value="">Select an Employee</option>
          {employees
            .filter((e) => e.id !== user?.candidate_id)
            .map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employees[0]?.employee_code} - 
                {[
                  emp.first_name,
                  emp.second_name,
                  emp.third_name,
                  emp.forth_name,
                  emp?.family_name,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </option>
            ))}
        </select>

        <ChatBox
          senderId={user?.candidate_id || null}
          receiverId={selectedReceiverId}
          senderName={"sender"}
          receiverName={"Employee"}
          onMessageSent={fetchAllPartners}
        />
      </div>
    </div>
  );
};

export default MessagingPage;
