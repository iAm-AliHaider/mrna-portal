import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../supabaseClient";

const SuggestionsCard = () => {
  const { user } = useUser();
  const [rows, setRows] = useState([]);
  const reqRef = useRef(0); // guards against stale responses

  useEffect(() => {
    const role = user?.role;
    const userId = user?.id;

    // wait until user is loaded
    if (!role || !userId) {
      setRows([]);
      return;
    }

    let cancelled = false;
    const myReq = ++reqRef.current;

    (async () => {
      try {
        let query = supabase
          .from("grievance_suggestions")
          .select("*")
          .eq("is_deleted", false);

        if (role === "hr" || role === "hr_manager") {
          // HR sees all (already covered by is_deleted=false)
        } else {
          // employee view
          query = query.eq("escalation_level", userId);
        }

        const { data: res, error } = await query;

        if (error) throw error;
        // only set state if this is the latest request and not cancelled
        if (!cancelled && myReq === reqRef.current) {
          setRows(Array.isArray(res) ? res : []);
          // console.log(role === "hr" || role === "hr_manager" ? "for hr" : "for employee", res);
        }
      } catch (e) {
        if (!cancelled && myReq === reqRef.current) setRows([]);
        // optional: toast.error(e.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.role, user?.id]); // re-run only when these stabilize

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-white text-sm font-semibold mb-3">
        Suggestion & Grievance
      </div>
      <div className="flex flex-col p-4 space-y-2">
        <ol>
          {rows.length > 0 &&
            rows.map((item, index) => (
              <li key={item.id ?? index}>
                <div className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="capitalize font-semibold">
                      {String(item.category || "")
                        .split("_")
                        .join(" ")}
                    </div>
                    <div className="text-right capitalize">{item.urgency}</div>
                  </div>
                  <div className="w-full text-left">
                    {item.report_type}
                  </div>
                </div>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
};

export default SuggestionsCard;
