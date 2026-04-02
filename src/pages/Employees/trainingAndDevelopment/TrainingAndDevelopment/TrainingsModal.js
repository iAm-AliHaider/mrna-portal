import React, { useState, useEffect, useRef } from "react";
import { Button, Dialog, DialogTitle } from "@mui/material";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabaseClient";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import { uploadFile } from "../../../../utils/s3";
import { useUpdateCourseApplication } from "../../../../utils/hooks/api/courseApplication";

const CourseTrainingsModal = ({ user }) => {
  const [openModal, setOpenModal] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);
  const { updateCourseApplication } = useUpdateCourseApplication();

  async function fetchTrainings() {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Start with LEFT JOIN to avoid “no relationship found” issues.
      // If you KNOW your FK token, replace courses(*) with:
      // courses:courses!course_applications_course_id_fkey( ... )
      const { data, error } = await supabase
        .from("course_applications")
        .select(
          `
          id,
          applicant_id,
          status,
          created_at,
          attachment_path,
          required_date,
          determine_need,
          course_id,
          courses (
            course_name,
            course_details,
            publisher,
            is_training,
            upload_certificate_date
          ),
          certificate_attachment
        `,
          { count: "exact" }
        )
        .eq("applicant_id", user.id) // 👈 lowercase "id"
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[fetchTrainings] error:", error);
        toast.error("Could not load trainings.");
        setRows([]);
        setOpenModal(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const filtered = (data || []).filter((row) => {
        if (!row.courses?.upload_certificate_date) return false;
        const certDate = new Date(row.courses.upload_certificate_date);
        certDate.setHours(0, 0, 0, 0);
        return certDate < today && !row.certificate_attachment; // only past dates
      });

      const mapped =
        (filtered || []).map((r) => {
          const c = r.courses || {};
          return {
            id: r.id,
            course_name: c.course_name ?? "",
            publisher: c.publisher ?? "",
            type: c.is_training ? "Training" : "Course",
            applied_on: r.created_at
              ? new Date(r.created_at).toLocaleDateString()
              : "",
            status: r.status ?? "",
            upload_certificate_date: c.upload_certificate_date
              ? new Date(c.upload_certificate_date).toLocaleDateString()
              : "-",
          };
        }) ?? [];

      setRows(mapped);
      setOpenModal(mapped.length > 0); // open only if we have rows
    } catch (e) {
      console.error("[fetchTrainings] exception:", e);
      toast.error("Something went wrong loading trainings.");
      setRows([]);
      setOpenModal(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      if (user?.id) await fetchTrainings();
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  // Trigger file picker for a specific row
  const onClickUploadCertificate = (row) => {
    setUploadTarget(row);
    fileInputRef.current?.click();
  };

  // Handle actual file upload using the same util as FileUploadField
  const onFilePicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset input
    if (!file || !uploadTarget) return;

    try {
      setUploadingId(uploadTarget.id);

      const uploadedUrl = await uploadFile(file);

      // ✅ call the returned function, not the hook
      await updateCourseApplication(uploadTarget.id, {
        certificate_attachment: uploadedUrl,
        // upload_certificate_date: new Date().toISOString(),
      });

      await fetchTrainings();
      toast.success("Certificate uploaded.");
    } catch (err) {
      console.error("Upload certificate error:", err);
      toast.error("Upload failed.");
    } finally {
      setUploadingId(null);
      setUploadTarget(null);
    }
  };

  const columns = [
    { key: "course_name", label: "Course" },
    { key: "publisher", label: "Publisher" },
    { key: "type", label: "Type" }, // Training / Course
    { key: "applied_on", label: "Applied On" },
    { key: "upload_certificate_date", label: "Certificate  Upload Due" },
    {
      key: "certificate_attachment",
      label: "Certificate Attachment",
      type: "custom",
      render: (row) => {
        const isApproved =
          String(row?.status || "").toLowerCase() === "approved";

        return (
          <Button
            variant="contained"
            size="small"
            color="primary"
            disabled={!isApproved || uploadingId === row?.id}
            onClick={() => onClickUploadCertificate(row)}
          >
            {uploadingId === row?.id
              ? "Uploading..."
              : row?.certificate_attachment
              ? "Replace Certificate"
              : "Upload Certificate"}
          </Button>
        );
      },
    },
  ];

  return (
    <Dialog open={openModal} maxWidth="lg" fullWidth>
      <DialogTitle>My Trainings & Courses</DialogTitle>
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <input
          type="file"
          accept="application/pdf,image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onFilePicked}
        />
        <DynamicTable
          columns={columns}
          data={rows}
          loading={loading}
          showPagination={false}
          onRowClick={(id) => {
            // handle row click (optional)
          }}
          rowCursor={true}
        />
      </div>
    </Dialog>
  );
};

export default CourseTrainingsModal;
