import React, { useState, useEffect } from "react";
import { Dialog, Button, Stack, Box, Typography } from "@mui/material";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import DynamicTable from "../../tables/AnnouncementsTable";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const columns = [
  {
    key: "title",
    label: "Employee",
    type: "custom",
  },
  {
    key: "like",
    label: "Agreed",
    type: "custom",
    render: (row) => (row?.is_liked ? <ThumbUpIcon color="success" /> : <></>),
  },
  {
    key: "dislike",
    label: "Disagreed",
    type: "custom",
    render: (row) =>
      row?.is_dislike ? <ThumbDownIcon color="error" /> : <></>,
  },
];

const AnnouncementViewsModal = ({
  selectedID,
  setSelectedID,
  title,
  setCurrentData,
}) => {
  const [openModal, setOpenModal] = useState(true);
  const [read, setRead] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsData, setAnnouncementsData] = useState([]);

  const handleClose = async (status) => {};

  const fetchData = async (announcementId) => {
    try {
      const { data, error } = await supabase
        .from("announcement_acknowledgements")
        .select("*")
        .eq("announcement_id", announcementId);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("can not found data");
        setAnnouncements([]);
        setAnnouncementsData([]);
        return;
      }

      setAnnouncements(data); // single set
    } catch (err) {
      toast.error("Failed to load data");
      setAnnouncements([]);
      setAnnouncementsData([]);
    }
  };

  useEffect(() => {
    let cancelled = false;

    if (!selectedID) {
      setAnnouncements([]);
      setAnnouncementsData([]);
      return;
    }

    // reset dependent state on selection change
    setAnnouncements([]);
    setAnnouncementsData([]);

    (async () => {
      await fetchData(selectedID);
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedID]);

  // BATCH employee fetch instead of per-item calls
  const fetchEmployee = async (empIDs, ackList) => {
    try {
      if (!empIDs.length) {
        setAnnouncementsData([]);
        return;
      }

      const { data, error } = await supabase
        .from("employees")
        .select(
          `
          id,
          employee_code,
          candidate_id,
          candidates:candidates!employees_candidate_id_fkey(
            first_name,
            second_name,
            third_name,
            forth_name,
            family_name
          )
        `
        )
        .in("id", empIDs);

      if (error) throw error;

      const ackByEmp = new Map(
        (ackList || []).map((a) => [
          a.employee_id,
          { is_liked: a.is_liked, is_dislike: a.is_dislike },
        ])
      );

      const merged = (data || []).map((e) => {
        const c = e?.candidates || {};
        const title =
          [
            c.first_name,
            c.second_name,
            c.third_name,
            c.forth_name,
            c.family_name,
          ]
            .filter(Boolean)
            .join(" ") ||
          e.employee_code ||
          "Unknown";

        const flags = ackByEmp.get(e.id) || {};
        return {
          id: e.id,
          title: `${e.id} - ${title}`,
          is_dislike: !!flags.is_dislike,
          is_liked: !!flags.is_liked,
        };
      });

      setAnnouncementsData(merged); // single set
    } catch (err) {
      toast.error("Failed to load data");
      setAnnouncementsData([]);
    }
  };

  useEffect(() => {
    let cancelled = false;

    if (!announcements || announcements.length === 0) {
      setAnnouncementsData([]);
      return;
    }

    const empIDs = Array.from(
      new Set(announcements.map((a) => a.employee_id).filter(Boolean))
    );

    (async () => {
      await fetchEmployee(empIDs, announcements);
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [announcements]);

  const handleModalClose = async () => {
    setOpenModal(false);
    setSelectedID(null);
    setCurrentData(null);
  };

  return (
    <Dialog open={openModal} maxWidth="md" fullWidth>
      <Box sx={{ padding: 3, backgroundColor: "white", borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>

        <DynamicTable
          columns={columns}
          data={announcementsData}
          // onSelectChange={onSelectChange}
          // currentPage={currentPage}
          // totalPages={totalPages || 1}
          // perPage={perPage}
          // onPageChange={(p) => setCurrentPage(p)}
          // onPerPageChange={setPerPage}

          rowCursor={true}
        />

        {/* {announcementsData && announcementsData.length > 0 ? (
          announcementsData.map((item) => <p key={item.id}>{item.title}</p>)
        ) : (
          <></>
        )} */}

        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleModalClose}
          >
            Close
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default AnnouncementViewsModal;
