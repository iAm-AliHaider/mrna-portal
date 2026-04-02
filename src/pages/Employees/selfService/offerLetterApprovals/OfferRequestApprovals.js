import React, { useState } from "react";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import AlertModal from "../../../../components/common/Modal/AlertModal";
import { OFFER_STATUS_FILTER_OPTIONS } from "../../../../utils/constants";
import { supabase } from "../../../../supabaseClient";
import toast from "react-hot-toast";
import { useUser } from "../../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  useOfferRequests,
  useOfferRequestsList,
} from "../../../../utils/hooks/api/useOfferRequests";
import { Button } from "@mui/material";
import ActionModal from "../../../../components/common/ActionModal";
import DownloadAttachmentsModal from "../../../../components/common/downloadAttachmentsModal";
import OfferRequestActions from "./ActionMenu";
// import {
//   sendContractRefusedEmail,
//   sendOfferEmail,
// } from "../../../../utils/emailSender";
import {
  sendContractRefusedEmail,
  sendOfferEmail,
} from "../../../../utils/emailSenderHelper";
import OfferApprovalStepper from "../../../../components/common/ApprovalHistory/offerApprovalStepper";
import { useUpdateCandidate } from "../../../../utils/hooks/api/candidates";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Offer Request Approvals" },
];

const OfferRequestApprovalsPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentOptions, setAttachmentOptions] = useState([]);

  const { updateOfferRequest } = useOfferRequests();
  const { updateCandidate } = useUpdateCandidate();
  const { user } = useUser();
  const navigate = useNavigate();

  const { data, loading, totalPages, refetch } = useOfferRequestsList({
    page,
    perPage,
    status,
    searchQuery,
  });

  const openApprove = (row) => setModalAction({ type: "approve", row });
  const openReject = (row) => setModalAction({ type: "reject", row });
  const closeModal = () => setModalAction(null);

  const handleConfirm = async (reason = null) => {
    if (!modalAction) return;
    const { type, row } = modalAction;
    setLoadingAction(true);


    try {
      if (type === "approve") {
        let updates = {};
        let candidateUpdate = null;
        if (row.status === "pending_manager") {
          updates = { is_manager_approve: true, status: "pending_hr_manager" };
        } else if (row.status === "pending_hr_manager") {
          updates = { is_hr_manager_approve: true, status: "approved" };
          candidateUpdate = { offer_letter: "approved" };
        } else {
          toast.error("Invalid status");
          return;
        }
        const { error } = await supabase
          .from("offer_requests")
          .update({ ...updates, updated_by: user.id })
          .eq("id", row.id);

        if (error) throw error;

        if (candidateUpdate) {
          await updateCandidate(row?.candidate?.id, candidateUpdate);
        }

        toast.success("Offer approved");
        // if (error) throw error
        // toast.success('Offer approved')

        if (row.status == "pending_hr_manager") {
          await sendOfferEmail({
            jobTitle: "Software Engineer",
            candidateName: `${row?.candidate?.full_name ?? ""}`
              .replace(/\s+/g, " ")
              .trim(),
            portalLink: "https://mrna.sa",
            email: row?.candidate?.email,
            requiredDocuments: "",
          });
        }
      } else {
        const { error } = await supabase
          .from("offer_requests")
          .update({
            status: "rejected",
            rejection_reason: reason,
            updated_by: user.id,
          })
          .eq("id", row.id);

        if (error) throw error;
        await updateCandidate(row?.candidate?.id, { offer_letter: "rejected" });
        toast.success("Offer rejected");

        const { data, error: fetchError } = await supabase
          .from("employees")
          .select(
            `
              *,
              candidates (*)
            `
          )
          .eq("id", row?.created_by)
          .single();
        await sendContractRefusedEmail({
          candidateName: `${row?.candidate?.full_name ?? ""}`
            .replace(/\s+/g, " ")
            .trim(),
          creatorName: `${data?.candidates?.full_name ?? ""}`
            .replace(/\s+/g, " ")
            .trim(),
          approvalStatus: row?.status,
          rejectionReason: reason,
          rejectionName: `${user?.full_name ?? ""}`.replace(/\s+/g, " ").trim(),
          rejectionEmail: user?.work_email,
          email: data?.work_email,
        });
      }

      refetch();
    } catch (err) {
      toast.error("Action failed");
      console.error(err);
    } finally {
      setLoadingAction(false);
      closeModal();
    }
  };

  const isOpen = modalAction !== null;
  const isApprove = modalAction?.type === "approve";
  const title = isApprove ? "Approve Offer Request" : "Reject Offer Request";
  const description = isApprove
    ? "Are you sure you want to approve this offer request?"
    : "Are you sure you want to reject this offer request?";
  const buttonTitle = isApprove ? "Approve" : "Reject";
  const type = isApprove ? "confirm" : "danger";

  const handleRegenerate = async (row) => {
    navigate(
      `/admin/human-resource/talent-aquisition/offer-request/${row.id}/regenerate`
    );
  };

  const openAttachmentsModal = (attachments = []) => {
    setAttachmentOptions(
      attachments.map((url) => ({
        label: decodeURIComponent(url.split("/").pop()),
        value: url,
      }))
    );
    setAttachmentModalOpen(true);
  };

  const handleEscalateRequest = async (id) => {
    await updateOfferRequest(id, {
      escalated: true,
      status: "pending",
      is_manager_approve: true,
      updated_by: user.id,
    });
    refetch();
  };

  const columns = [
    {
      key: "Candidate",
      label: "Candidate",
      type: "custom",
      render: (row) =>
        `${row?.candidate?.first_name || ""} ${
          row?.candidate?.second_name || ""
        } ${row?.candidate?.third_name || ""} ${
          row?.candidate?.forth_name || ""
        } ${row?.candidate?.family_name || ""}`,
    },
    { key: "salary", label: "Salary" },
    { key: "task_status", label: "Status", type: "chip" },
    {
      key: "rejected_reason",
      label: "Rejected Reason",
      type: "description",
      render: (row) => row.rejection_reason || "",
    },
    // {
    //   key: 'pdf_url',
    //   label: 'Offer Letter',
    //   type: 'custom',
    //   render: row =>
    //     row.pdf_url ? (
    //       <Button
    //         size="small"
    //         variant="outlined"
    //         onClick={() => window.open(row.pdf_url, '_blank')}
    //       >
    //         View Offer Letter
    //       </Button>
    //     ) : (
    //       ''
    //     )
    // },
    {
      key: "attachments",
      label: "Attachments",
      type: "custom",
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => openAttachmentsModal(row.attachments || [])}
          disabled={
            !row.attachments ||
            row.attachments.length === 0 ||
            ["rejected", "declined", "approved", "pending"].includes(row.status)
          }
        >
          View
        </Button>
      ),
    },
    {
      key: "pdf_url",
      label: "View Offer Letter",
      type: "custom",
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => openAttachmentsModal([row.pdf_url] || [])}
          disabled={
            !row.pdf_url || ["pending", "declined"].includes(row.status)
          }
        >
          View Offer Letter
        </Button>
      ),
    },
    {
      key: "escalate",
      label: "Escalate",
      type: "custom",
      render: (row) =>
        row?.escalated ? (
          "Yes"
        ) : (
          <Button
            size="small"
            variant="contained"
            disabled={
              ["rejected", "declined", "approved", "accepted"].includes(
                row.status
              ) || user?.role !== "hr"
            }
            onClick={() => handleEscalateRequest(row?.id)}
          >
            Escalate
          </Button>
        ),
    },
    {
      key: "approval_history",
      label: "Approval History",
      type: "custom",
      render: (row) => (
        <OfferApprovalStepper
          is_hr_manager_approve={row.is_hr_manager_approve}
          status={row.status}
          is_manager_approve={row.is_manager_approve}
        />
      ),
    },
    {
      key: "actions",
      type: "custom",
      label: "Actions",
      render: (row) => (
        <OfferRequestActions
          row={row}
          user={user}
          openApprove={openApprove}
          openReject={openReject}
          handleRegenerate={handleRegenerate}
        />
      ),
    },
  ];


  return (
    <>
      <PageWrapperWithHeading
        title="Offer Request Approvals"
        items={breadcrumbItems}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by candidate name..."
            />
            <div className="flex gap-4">
              <div className="w-[300px]">
                <SelectField
                  options={OFFER_STATUS_FILTER_OPTIONS}
                  onChange={setStatus}
                  value={status}
                  placeholder="Status"
                />
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Offer Requests out of ${data?.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      {isApprove ? (
        <AlertModal
          open={isOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          type={type}
          title={title}
          description={description}
          buttonTitle={buttonTitle}
          loading={loadingAction}
        />
      ) : (
        <ActionModal
          open={isOpen}
          onClose={closeModal}
          onReject={handleConfirm}
          type={type}
          title={title}
          description={description}
          buttonTitle={buttonTitle}
          loading={loadingAction}
        />
      )}
      <DownloadAttachmentsModal
        open={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        attachmentOptions={attachmentOptions}
      />
    </>
  );
};

export default OfferRequestApprovalsPage;
