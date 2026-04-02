import React from "react";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../supabaseClient";
import { useState, useEffect } from "react";

const StatusCards = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    active: { general: 0, mandatory: 0 },
    upcoming: { general: 0, mandatory: 0 },
    pending: { general: 0, mandatory: 0 },
    expired: { general: 0, mandatory: 0, item: null },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskStats();
  }, [user?.id]);

  async function fetchTaskStats() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: tasks } = await supabase
        .from("assigned_tasks")
        .select("*, task:tasks(*)")
        .or(`assigned_to_id.eq.${user.id},employee_id.eq.${user.id}`);

      if (!tasks) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const result = {
        active: { general: 0, mandatory: 0 },
        upcoming: { general: 0, mandatory: 0 },
        pending: { general: 0, mandatory: 0 },
        expired: { general: 0, mandatory: 0, item: null },
      };

      tasks.forEach((t) => {
        const taskType = t.task?.task_type === "mandatory" ? "mandatory" : "general";
        const status = t.status?.toLowerCase();

        if (status === "completed") return;

        if (status === "overdue" || status === "expired") {
          result.expired[taskType]++;
          if (!result.expired.item && t.task) {
            result.expired.item = {
              name: t.task.name,
              date: t.assigned_at,
            };
          }
        } else if (status === "pending") {
          result.pending[taskType]++;
        } else if (status === "in_progress") {
          result.active[taskType]++;
        } else {
          result.upcoming[taskType]++;
        }
      });

      setStats(result);
    } catch (err) {
      console.error("Failed to fetch task stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      title: "Active",
      bgColor: "#3D3D7A",
      general: stats.active.general,
      mandatory: stats.active.mandatory,
    },
    {
      title: "Upcoming",
      bgColor: "#2D4A6F",
      general: stats.upcoming.general,
      mandatory: stats.upcoming.mandatory,
    },
    {
      title: "Pending",
      bgColor: "#4A7C7C",
      general: stats.pending.general,
      mandatory: stats.pending.mandatory,
    },
    {
      title: "Expired",
      bgColor: "#C94A4A",
      general: stats.expired.general,
      mandatory: stats.expired.mandatory,
      item: stats.expired.item,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="h-10 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{display:'flex',gap:16,marginBottom:24}}>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{flex:1,backgroundColor:'#fff',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.1)',border:'1px solid #e5e7eb'}}
        >
          <div style={{backgroundColor:card.bgColor,padding:'12px 16px',textAlign:'center'}}>
            <span style={{color:'#fff',fontSize:14,fontWeight:600}}>
              {card.title}
            </span>
          </div>
          <div className="p-4">
            {card.item ? (
              <div>
                <p className="text-sm text-gray-700 font-medium truncate">
                  {card.item.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {card.item.date
                    ? new Date(card.item.date).toLocaleDateString()
                    : ""}
                </p>
                <button className="mt-2 text-xs text-primary font-medium hover:underline">
                  View
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-gray-800">
                    {card.general}
                  </p>
                  <p className="text-xs text-gray-500">General</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-gray-800">
                    {card.mandatory}
                  </p>
                  <p className="text-xs text-gray-500">Mandatory</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;
