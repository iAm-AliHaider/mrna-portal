// MeetingRoomBookingsPage.js
import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import SelectField from "../../../../components/common/SelectField";
import ListFilter from "./filter";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import {
  useMeetingRoomBookings,
  useDeleteMeetingRoomBooking,
} from "../../../../utils/hooks/api/meetingRoomBookings";
import toast from "react-hot-toast/headless";

const MeetingRoomBookingsPage = () => {
  const { user } = useUser();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
    meeting_code: "",
    from_date: "",
    to_date: "",
    notes: "",
  });

  const navigate = useNavigate();

  // Fetch meeting room bookings with search and filters
  const { meetingRoomData, totalPages, loading, error, count, refetch } =
    useMeetingRoomBookings(
      currentPage,
      searchQuery,
      filters,
      perPage,
      user?.id
    );

  // Delete functionality
  const { deleteMeetingRoomBooking, loading: deleteLoading } =
    useDeleteMeetingRoomBooking();

  const columns = [
    { key: "meeting_code", label: "Meeting Code" },
    { key: "room_name", label: "Room Name" },
    { key: "room_code", label: "Room Code" },
    { key: "from_date", label: "From Date" },
    { key: "to_date", label: "To Date" },
    { key: "meeting_start_time", label: "Start Time" },
    { key: "meeting_end_time", label: "End Time" },
    // { key: "status", label: "Status", type: "chip" }
  ];

  const formatToAMPM = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    const minute = m;
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12; // 0 -> 12
    return `${hour}:${minute} ${ampm}`;
  };

  // Transform data for table display
  const formatYMDUTC = (ymd) => {
    if (!ymd) return "-";
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
      timeZone: "UTC",
    });
  };

  const transformData = (data) => {
    return data.map((item) => ({
      ...item,
      from_date: formatYMDUTC(item.from_date),
      to_date: formatYMDUTC(item.to_date),
      meeting_start_time: formatToAMPM(item.meeting_start_time) || "-",
      meeting_end_time: formatToAMPM(item.meeting_end_time) || "-",
      created_at: item.created_at
        ? new Date(item.created_at).toLocaleDateString(undefined, {
            timeZone: "UTC",
          })
        : "-",
    }));
  };

  const transformedData = transformData(meetingRoomData || []);

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  const breadcrumbItems = [
    { href: "/home", icon: null },
    { title: "Transactions" },
    { title: "Meeting Room Bookings" },
  ];

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      meeting_code: "",
      from_date: "",
      to_date: "",
      notes: "",
    });
    setCurrentPage(0);
  };

  const handleAddForm = () => {
    navigate("/transactions/meetings/meetingRoomBookingForm");
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      await deleteMeetingRoomBooking(selectedIds);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(0);
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (error) {
    toast.error("Failed to load meeting room bookings");
  }

  return (
    <PageWrapperWithHeading
      title="Meeting Room Bookings"
      items={breadcrumbItems}
      buttonTitle="Add Meeting Room Booking"
      action={handleAddForm}
      Icon={AddIcon}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by room name or room code or meeting code..."
          />
          <div className="flex gap-4">
            <div className="w-[300px]">
              <SelectField
                options={statusOptions}
                placeholder="Status"
                value={filters.status}
                onChange={handleStatusChange}
              />
            </div>
          </div>
        </div>

        <DynamicTable
          columns={columns}
          data={transformedData}
          onSelectChange={(ids) => setSelectedIds(ids)}
          footerInfo={`Bookings out of ${count || 0}`}
          currentPage={currentPage + 1} // Convert 0-based to 1-based for UI
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={(page) => setCurrentPage(page - 1)} // Convert 1-based UI back to 0-based
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(0); // Always reset page on limit change
          }}
          loading={loading}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default MeetingRoomBookingsPage;
