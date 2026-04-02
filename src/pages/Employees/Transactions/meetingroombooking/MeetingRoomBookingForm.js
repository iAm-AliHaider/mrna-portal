"use client";
import { Formik, Form } from "formik";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import SubmitButton from "../../../../components/common/SubmitButton";
import { useUser } from "../../../../context/UserContext";
import { useCreateMeetingRoomBooking } from "../../../../utils/hooks/api/meetingRoomBookings";
import toast from "react-hot-toast/headless";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../../supabaseClient";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";

const validationSchema = Yup.object({
  room_name: Yup.string().required("Room name is required"),
  room_code: Yup.string().required("Room code is required"),
  meeting_code: Yup.string().required("Meeting code is required"),
  from_date: Yup.date()
    .required("From date is required")
    .test("not-past-date", "From date cannot be in the past", function (value) {
      if (!value) return true;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);

      return selectedDate >= today;
    }),
  to_date: Yup.date()
    .required("To date is required")
    .min(Yup.ref("from_date"), "To date must be after from date"),
  meeting_start_time: Yup.string().required("Meeting start time is required"),
  meeting_end_time: Yup.string()
    .required("Meeting end time is required")
    .test(
      "different-times",
      "Start time and end time cannot be same",
      function (value) {
        const { meeting_start_time } = this.parent;
        if (!meeting_start_time || !value) return true;

        return value !== meeting_start_time;
      }
    ),
  phone_number: Yup.number()
    .positive("Must be positive")
    .required("Phone number is required"),
  notes: Yup.string(),
});

const generateRoomCode = () => {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RM-${randomPart}`;
};

const columns = [
  { key: "room_name", label: "Room Name" },
  { key: "from_date", label: "From Date" },
  { key: "to_date", label: "To Date" },
  { key: "meeting_start_time", label: "Start Time" },
  { key: "meeting_end_time", label: "End Time" },
];

const BookMeetingRoomForm = () => {
  const { user } = useUser();
  const { createMeetingRoomBooking, loading } = useCreateMeetingRoomBooking();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomCapacity, setRoomCapacity] = useState("");
  const [meetingData, setMeetingData] = useState([]);
  const [transformedData, setTransformedData] = useState([]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("meeting_room_bookings")
        .select("*", { count: "exact" })
        .eq("is_deleted", false);

      if (error) throw error;
      setMeetingData(data || []);
    } catch (e) {
      console.error("[fetchBookings] exception:", e);
      toast.error("Something went wrong loading meetings.");
      setMeetingData([]);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const ROOM_CAPACITY = {
    "Meeting Room 1": "12 persons",
    "Meeting Room 2": "8 persons",
  };

  const initialValues = {
    room_name: "",
    room_code: generateRoomCode(),
    meeting_code: "",
    from_date: "",
    to_date: "",
    meeting_start_time: "",
    meeting_end_time: "",
    contains_projector: false,
    contains_video_conf_equipment: false,
    contains_telephone: false,
    phone_number: user?.mobile || "",
    notes: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        created_by: user?.id,
        updated_by: user?.id,
        is_deleted: false,
      };

      await createMeetingRoomBooking(payload);
      toast.success("Meeting room booking created successfully");
      resetForm();
      navigate("/transactions/meetings");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to create meeting room booking");
      setIsSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

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

  // Room change handler
  const handleRoomChange = (value, setFieldValue) => {
    setFieldValue("room_name", value);
    setRoomCapacity(ROOM_CAPACITY[value] || "");

    // filter upcoming bookings for selected room
    const today = new Date().toISOString().split("T")[0];
    const filtered = (meetingData || []).filter(
      (b) => b.room_name === value && b.from_date >= today && !b.is_deleted
    );

    // transform for table
    const transformed = filtered.map((b) => ({
      room_name: b.room_name,
      from_date: b.from_date,
      to_date: b.to_date,
      meeting_start_time: formatToAMPM(b.meeting_start_time),
      meeting_end_time: formatToAMPM(b.meeting_end_time),
    }));

    setTransformedData(transformed);
  };

  return (
    <Box className="page-wrapper bg-red-400 p-5">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Book Meeting Room
        </Typography>
        <Box className="breadcrumb-container">
          <Breadcrumbs separator=">">
            <Link underline="hover" color="inherit" href="/home">
              <HomeIcon sx={{ mr: 0.5 }} />
              Home
            </Link>
            <Link underline="hover" color="inherit" href="/transactions">
              Transactions
            </Link>
            <Link
              underline="hover"
              color="inherit"
              href="/transactions/meeting-room-bookings"
            >
              Meeting Room Bookings
            </Link>
            <Typography color="text.primary">Book Meeting Room</Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      <div className="bg-white rounded-lg shadow-md p-5">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto">
              {/* Meeting Booking Details Section */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                {/* First row - Room Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <FormikSelectField
                    name="room_name"
                    label="Room Name"
                    options={[
                      { label: "Meeting Room 1", value: "Meeting Room 1" },
                      { label: "Meeting Room 2", value: "Meeting Room 2" },
                    ]}
                    onChange={(value) => handleRoomChange(value, setFieldValue)}
                    fullWidth
                  />
                  <FormikInputField
                    name="room_capacity"
                    label="Capacity"
                    value={roomCapacity}
                    fullWidth
                    readOnly
                  />
                  <FormikInputField
                    name="room_code"
                    label="Room Code"
                    fullWidth
                    readOnly
                  />
                </div>

                {/* Second row - Meeting Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <FormikInputField
                    name="meeting_code"
                    label="Meeting Code"
                    type="text"
                    fullWidth
                  />
                  <FormikInputField
                    name="from_date"
                    label="From Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    max="2100-12-31"
                  />
                  <FormikInputField
                    name="to_date"
                    label="To Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    max="2100-12-31"
                  />
                </div>

                {/* Third row - Time Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <FormikInputField
                    name="meeting_start_time"
                    label="Meeting Start Time"
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormikInputField
                    name="meeting_end_time"
                    label="Meeting End Time"
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormikInputField
                    name="phone_number"
                    label="Phone Number"
                    type="number"
                    fullWidth
                  />
                </div>

                {/* Equipment checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <FormControlLabel
                    disabled
                    control={
                      <Checkbox
                        checked={values.room_name === "Meeting Room 1"}
                        onChange={(e) =>
                          setFieldValue("contains_projector", e.target.checked)
                        }
                      />
                    }
                    label="Contains projector"
                  />
                  <FormControlLabel
                    disabled
                    control={
                      <Checkbox
                        checked={values.room_name === "Meeting Room 1"}
                        onChange={(e) =>
                          setFieldValue(
                            "contains_video_conf_equipment",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Contains video conferencing equipment"
                  />
                  <FormControlLabel
                    disabled
                    control={
                      <Checkbox
                        checked={values.room_name === "Meeting Room 1"}
                        onChange={(e) =>
                          setFieldValue("contains_telephone", e.target.checked)
                        }
                      />
                    }
                    label="Contains telephone"
                  />
                </div>

                {/* Show upcoming bookings for this room */}
                {transformedData && transformedData.length > 0 && (
                  <>
                    <h2>Already Booked Slots</h2>
                    <DynamicTable
                      className="mb-2"
                      columns={columns}
                      data={transformedData}
                      loading={loading}
                      showPagination={false}
                    />
                  </>
                )}

                {/* Notes */}
                <div className="mb-4 mt-4">
                  <FormikInputField
                    name="notes"
                    label="Notes"
                    multiline
                    rows={3}
                    fullWidth
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                <SubmitButton
                  title="Book"
                  type="submit"
                  loading={loading || isSubmitting}
                  disabled={isSubmitting}
                />
              </Box>
            </Form>
          )}
        </Formik>
      </div>
    </Box>
  );
};

export default BookMeetingRoomForm;
