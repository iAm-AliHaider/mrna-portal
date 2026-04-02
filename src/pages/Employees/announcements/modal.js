import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, Button, Stack } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import DynamicTable from "../../../components/tables/AnnouncementsTable";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AnnouncementModal from "../../../components/common/Modal/announcement";

const columns = [
  { key: "title", label: "Name" },
  { key: "reference_no", label: "Reference No" },
  { key: "description", label: "Description" },
  { key: "active_date", label: "Active Date", type: "date" },
  // {
  //   key: 'like',
  //   label: 'Mark as Like',
  //   type: 'button',
  //   icon: <DownloadIcon fontSize='small' />,
  //   width: '11%'
  // },
  // {
  //   key: 'attachment_path',
  //   label: 'Download',
  //   type: 'button',
  //   buttonLabel: 'Download',
  //   icon: <DownloadIcon fontSize='small' />,
  //   width: '8%'
  // }
];

const AnnouncementsModal = ({ user }) => {
  const [openModal, setOpenModal] = useState(false);
  const [announcements, setAnnouncements] = useState();
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [read, setRead] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const handleAnnouncementLike = async (id, status) => {
    let payload = {
      announcement_id: id,
      employee_id: user.id,
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
    };
    if (status === "agree") {
      payload = { ...payload, is_liked: true };
    } else if (status === "disagree") {
      payload = { ...payload, is_dislike: true };
    }
    const { error } = await supabase
      .from("announcement_acknowledgements")
      .insert(payload);

    if (error) {
      console.error("Error inserting acknowledgements:", error.message);
      toast.error("Failed to acknowledge announcements");
    } else {
      fetchAnnouncements();
    }
  };

  const handleReallAll = async () => {
    const payload = announcements.map((announcement) => ({
      announcement_id: announcement.id,
      employee_id: user.id,
      acknowledged: true,
      is_liked: false,
      acknowledged_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("announcement_acknowledgements")
      .insert(payload);

    if (error) {
      console.error("Error inserting acknowledgements:", error.message);
      toast.error("Failed to acknowledge announcements");
    } else {
      toast.success("All announcements marked as read");
      setRead(true);
      setOpenModal(false);
    }
  };

  async function fetchAnnouncements() {
    setLoadingAnnouncements(true);
    const { data, error } = await supabase.rpc(
      "get_my_mandatory_announcements",
      {
        p_employee_id: user?.id,
        p_company_id: user?.company_id,
      }
    );

    if (error) {
      console.error(error);
      toast.error("Could not load announcements");
      setAnnouncements([]);
    } else {
      if (data?.length) {
        setAnnouncements(
          data.map((row) => ({
            id: row.announcement_id,
            read_status: row.read_status,
            reference_no: row.reference_no,
            title: row.title,
            announcement_status: row.announcement_status,
            active_date: row.active_date,
            created_by_name: row.created_by_name,
            attachment_path: row.attachment_path,
            // description: row.description
            description: /<\/?[a-z][\s\S]*>/i.test(row.description) ? (
              <span dangerouslySetInnerHTML={{ __html: row.description }} />
            ) : (
              row.description
            ),
          }))
        );
        setOpenModal(true);
      } else {
        setAnnouncements([]);
        setOpenModal(false);
      }
    }
    setLoadingAnnouncements(false);
  }

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  // const handleColumnAction = (row, column) => {
  //   if (column === 'attachment_path') {
  //     if (!row.attachment_path) {
  //       toast.error('No file available for download.')
  //       return
  //     }

  //     const link = document.createElement('a')
  //     link.href = row.attachment_path
  //     link.download = row.title || 'attachment'
  //     document.body.appendChild(link)
  //     link.click()
  //     document.body.removeChild(link)
  //   }

  //   if (column === 'like') {
  //     handleAnnouncementLike(row.id)
  //     toast.success(`Liked: ${row.title}`)
  //   }
  // }
  const handleAllLikes = async () => {
    const payload = announcements.map((announcement) => ({
      announcement_id: announcement.id,
      employee_id: user.id,
      acknowledged: true,
      is_liked: true,
      acknowledged_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("announcement_acknowledgements")
      .insert(payload);

    if (error) {
      console.error("Error inserting acknowledgements:", error.message);
      toast.error("Failed to acknowledge announcements");
    } else {
      setLiked(true);
      setOpenModal(false);
    }
  };

  const onRowClick = async (id) => {
    try {
      const getSingleData = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();
      if (!getSingleData?.data?.id) {
        toast.error("can not found data");
        return;
      }
      setCurrentData(getSingleData?.data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  return (
    <>
      <Dialog open={openModal} maxWidth="lg" fullWidth>
        <DialogTitle>Announcement</DialogTitle>
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <DynamicTable
            columns={columns}
            data={announcements}
            loading={loadingAnnouncements}
            showPagination={false}
            // onAction={handleColumnAction}
            onRowClick={onRowClick}
            rowCursor={true}
          />
          {currentData?.id ? (
            <AnnouncementModal
              currentData={currentData}
              setCurrentData={setCurrentData}
              handleAnnouncementLike={handleAnnouncementLike}
              announcmentLikeAction={true}
            />
          ) : null}
          {/* <Stack direction='row' justifyContent='flex-end' mt={3} gap={2}>
            <Button
              variant={liked ? 'contained' : 'outlined'}
              color='success'
              onClick={handleAllLikes}
              startIcon={<ThumbUpIcon />}
            >
              Agree All
            </Button>
            <Button
              variant={read ? 'contained' : 'outlined'}
              color='primary'
              size='large'
              startIcon={<MenuBookIcon />}
              onClick={handleReallAll}
            >
              {read ? 'Read All ✔' : 'Read All'}
            </Button>
          </Stack> */}
        </div>
      </Dialog>
    </>
  );
};

export default AnnouncementsModal;
