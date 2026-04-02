import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { useUser } from "../../../context/UserContext";

const ChatsCard = () => {
  const { user } = useUser();
  const [recentChats, setRecentChats] = useState([]);

  useEffect(() => {
    if (user?.candidate_id) {
      fetchAllPartners();
    } else {
      setRecentChats([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.candidate_id]);

  const fetchAllPartners = async () => {
    try {
      const { data, error } = await supabase.rpc("get_recent_chat_partners", {
        p_user_id: user?.candidate_id,
      });
      if (error) throw error;

      if (!data?.length) {
        setRecentChats([]);
        return;
      }

      // For each partner, fetch the latest message BETWEEN current user and that partner
      const chats = await Promise.all(
        data.map(async (item) => {
          // Use item.*, not data.*
          const partnerId =
            item?.candidate_id ?? item?.receiver_id ?? item?.sender_id;
          const latestMessage = await fetchMessages(
            user?.candidate_id,
            partnerId
          );
          return { ...item, latestMessage };
        })
      );

      setRecentChats(chats);
    } catch (err) {
      toast.error(err?.message || "Failed to load chats");
      setRecentChats([]);
    }
  };

  const fetchMessages = async (meId, partnerId) => {
    // Guard against undefined ids to avoid Bad Request
    if (!meId || !partnerId) return null;

    const { data, error } = await supabase
      .from("private_messages")
      .select("*")
      // fetch any message where sender/receiver are either of the two ids
      .in("sender_id", [meId, partnerId])
      .in("receiver_id", [meId, partnerId])
      .order("sent_at", { ascending: false }) // latest first
      .limit(1)
      .maybeSingle(); // no error if 0 rows

    if (error) {
      // Do not toast on every cell; just return null to keep UI clean
      return null;
    }
    return data;
  };

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Chats
      </div>

      <ul className="overflow-y-auto flex-1 px-1">
        {recentChats.map((userItem) => (
          <li key={userItem?.candidate_id ?? userItem?.id}>
            <div
              type="button"
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition text-sm"
            >
              {[
                userItem?.first_name,
                userItem?.second_name,
                userItem?.third_name,
                userItem?.forth_name,
              ]
                .filter(Boolean)
                .join(" ") || "Unnamed"}
              {/* render a snippet of the latest message if available */}
              <div className="pr-4 pb-2 text-xs text-gray-600">
                {userItem?.latestMessage?.content ||
                  userItem?.latestMessage?.text ||
                  "No messages yet"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatsCard;
