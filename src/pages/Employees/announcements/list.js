import React, { useEffect, useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import "./style.css";

import DynamicTable from "../../../components/tables/AnnouncementsTable";
import { supabase } from "../../../supabaseClient";
import PageWrapperWithHeading from "../../../components/common/PageHeadSection";
import SearchInput from "../../../components/common/searchField";
import { useUser } from "../../../context/UserContext";
import toast from "react-hot-toast";
import { Button } from "@mui/material";
import { supaBaseUpdateById } from "../../../utils/common";
const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Employees" },
  { title: "My Announcements" },
];

export default function AnnouncementList() {
  const { user } = useUser();
  const employeeId = user?.id ?? null;

  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchAnnouncements();
  }, [searchQuery, currentPage, perPage, employeeId]);

  async function fetchAnnouncements() {
    if (!employeeId) return;
    setLoading(true);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm   = String(today.getMonth()+1).padStart(2,'0');
    const dd   = String(today.getDate()).padStart(2,'0');
    const dateString = `${yyyy}-${mm}-${dd}`;  // e.g. "2025-06-27"
    
    const { data, error } = await supabase.rpc("get_my_announcements", {
      p_employee_id: employeeId,
      p_company_id: user?.company_id,
      p_search: searchQuery.trim() || null,
      p_limit: perPage,
      p_offset: (currentPage - 1) * perPage,
      p_today: dateString || null,
    });

    if (error) {
      console.error("Error fetching announcements:", error.message);
      toast.error("Failed to load announcements");
      setAnnouncements([]);
      setTotalCount(0);
    } else {
      setAnnouncements(
        data.map((row) => ({
          id: row.announcement_id,
          read_status: row.read_status === "read" ? "Read" : "Unread",
          reference_no: row.reference_no,
          title: row.title,
          announcement_status: row.announcement_status,
          active_date: row.active_date,
          created_by_name: row.created_by_name,
          attachment_path: row.attachment_path,
          is_liked: row.is_liked,
          _overall_count: row.overall_count,
          description: row.description,
        }))
      );
      setTotalCount(data.length ? data[0].overall_count : 0);
    }

    setLoading(false);
  }
  const tableHeaders = [
    {
      key: "mark_as_read",
      label: "Mark As Read",
      type: "custom",
      render: (row) => (
        <Button
          size="small"
          disabled={row?.read_status == "Read" ? true : false}
          variant="contained"
          onClick={() => markAsRead(row?.id)}
        >
          Read
        </Button>
      ),
    },
    { key: "read_status", label: "Read/Unread" },
    { key: "reference_no", label: "Reference No." },
    { key: "title", label: "Title", alignRight: true },
    { key: "description", label: "Description", alignRight: true,type:'description',render: (value) => value?.description },
    { key: "announcement_status", label: "Status", type: "html" },
    { key: "active_date", label: "Date" },
    {
      key: "is_liked",
      label: "Mark As Agree",
      type: "custom",
      render: (row) => (
        <Button
          size="small"
          disabled={row?.is_liked}
          variant="contained"
          onClick={() => markAsLiked(row?.id)}
        >
          Agree
        </Button>
      ),
    },
    { key: "created_by_name", label: "Created By" },
    { key: "attachment_path", label: "Download", type: "custom", render: (row) => (
      <Button
        size="small"
        variant="contained"
        disabled={!row.attachment_path}
        onClick={() => window.open(row.attachment_path, "_blank")}
      >
        Download
      </Button>
    ) },
  ];
  async function markAsRead(announcementId) {
    if (!employeeId) return;
    // 1) see if an acknowledgement already exists
    const { data: existing, error: selErr } = await supabase
      .from("announcement_acknowledgements")
      .select("id")
      .match({ announcement_id: announcementId, employee_id: employeeId })
      .single();

    if (selErr && selErr.code !== "PGRST116") {
      // PGRST116 means “no rows” on single()
      console.error("Lookup error:", selErr.message);
      toast.error("Could not mark as read");
      return;
    }

    if (existing) {
      // already marked
      toast.success("Already marked as read");
      return;
    }

    // 2) insert new acknowledgement
    const { error: insErr } = await supabase
      .from("announcement_acknowledgements")
      .insert({
        announcement_id: announcementId,
        employee_id: employeeId,
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      });

    if (insErr) {
      console.error("Insert error:", insErr.message);
      toast.error("Could not mark as read");
    } else {
      toast.success("Marked as read");
      fetchAnnouncements();
    }
  }
  async function markAsLiked(announcementId) {
    if (!employeeId) return;
    try {
      // 1) see if an acknowledgement already exists
      const { data: existing, error: selErr } = await supabase
        .from("announcement_acknowledgements")
        .select("id")
        .match({ announcement_id: announcementId, employee_id: employeeId })
        .single();

      if (selErr && selErr.code !== "PGRST116") {
        // PGRST116 means “no rows” on single()
        console.error("Lookup error:", selErr.message);
        toast.error("Could not mark as read");
        return;
      }
      if (!existing) {
        const { error: insErr } = await supabase
          .from("announcement_acknowledgements")
          .insert({
            announcement_id: announcementId,
            employee_id: employeeId,
            acknowledged: true,
            acknowledged_at: new Date().toISOString(),
            is_liked: true,
          });
      } else {
        await supaBaseUpdateById("announcement_acknowledgements", existing.id, {
          is_liked: true,
        });
      }
      // 2) insert new acknowledgement

      toast.success("Announcement Liked");
      fetchAnnouncements();
    } catch (err) {
      console.error("Lookup error:", err);
      toast.error("Could not mark as read");
    }
  }

  return (
    <PageWrapperWithHeading title="My Announcements" items={breadcrumbItems}>
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search title or ref…"
          />
        </div>

        {/* Data Table */}
        <DynamicTable
          columns={tableHeaders}
          data={announcements}
          loading={loading}
          showMenu={false}
          footerInfo={`Announcements out of ${totalCount}`}
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / perPage) || 1}
          perPage={perPage}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          onAction={(row, key) => {
            if (key === "attachment_path") {
              window.open(row.attachment_path, "_blank");
            }
          }}
        />
      </div>
    </PageWrapperWithHeading>
  );
}
