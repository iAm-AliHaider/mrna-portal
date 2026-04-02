// src/pages/Employees/selfService/myApprovals/ActionPermissionWrapper.js
import React, { useState, useMemo } from "react";
import { useUser } from "../../../../context/UserContext";
import {
  useUpdateRequestStatus,
  useUpdateTicketApproval,
} from "../../../../utils/hooks/api/approvals";
import { FINANCE_ORG_UNIT_ID, ROLES } from "../../../../utils/constants";
import CustomMenu from "../../../../components/common/CustomMenu";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import AlertModal from "../../../../components/common/Modal/AlertModal";
import ApprovalModal from "../../../../components/common/Modal/ApprovalModal";
import ActionModal from "../../../../components/common/ActionModal";
import toast from "react-hot-toast";
import {
  approvalEmailSender,
  rejectionEmailSender,
  transactionApprovalEmailSenderToFinance,
} from "../../../../utils/transactionsEmailSender";
import { useGetDepartmentManager } from "../../../../utils/hooks/api/emplyees";

const ORDER = ["manager", "hod", "hr", "hr_manager"];

// Find a role's status from workflow; default to "pending"
const getStatus = (workflow, role) =>
  (workflow?.find((s) => s.role === role)?.status || "pending").toLowerCase();

// A role can act only if its own status is pending AND all previous roles aren't pending
const canRoleAct = (workflow, role) => {
  const roleIdx = ORDER.indexOf(role);
  if (roleIdx === -1) return false;
  if (getStatus(workflow, role) !== "pending") return false;

  for (let i = 0; i < roleIdx; i++) {
    if (getStatus(workflow, ORDER[i]) === "pending") return false;
  }
  return true;
};

const ActionPermissionWrapper = ({ row, refetch, reportType }) => {
  const [openModal, setOpenModal] = useState(false);
  const [openApproval, setOpenApproval] = useState(false);
  const { user } = useUser();
  const { updateRequestStatus, loading: updateLoading } =
    useUpdateRequestStatus(reportType);
  const { updateTicketApproval, loading: updateLoadingApproved } =
    useUpdateTicketApproval();
  const { manager, fetchManager } = useGetDepartmentManager();

  const workflow = row?.status_workflow || [];



  // ❌ NEW RULE: disable all actions if any role has rejected
  const isRejectedAnywhere = workflow.some(
    (step) => step.status?.toLowerCase() === "rejected"
  );

  // Compute if current user can modify based on workflow & hierarchy
  const canUserModifyRequest = useMemo(() => {
    if (isRejectedAnywhere) return false; // <- stop everything if rejected
    const r = user?.role;
    if (!r) return false;
    switch (r) {
      case ROLES.MANAGER:
        return canRoleAct(workflow, "manager");
      case ROLES.HOD:
        return canRoleAct(workflow, "hod");
      case ROLES.HR:
        return canRoleAct(workflow, "hr");
      case ROLES.HR_MANAGER:
        return canRoleAct(workflow, "hr_manager");
      default:
        return false;
    }
  }, [user?.role, workflow, isRejectedAnywhere]);

  // Button disable states
  const getButtonStates = useMemo(() => {
    if (!canUserModifyRequest) {
      return { disableApprove: true, disableReject: true };
    }
    return { disableApprove: false, disableReject: false };
  }, [canUserModifyRequest]);

  // Approve ticket request (with extra fields)
  const onApproveTicketRequest = async (values) => {
    if (!canUserModifyRequest) return;

    const trim = (v) => (typeof v === "string" ? v.trim() : v);
    const amountStr = trim(values.ticket_amount ?? "");
    const attachmentStr = trim(values.attachment ?? "");

    const payload = {};
    if (amountStr) {
      payload.ticket_amount = /^[0-9]+(\.[0-9]{1,2})?$/.test(amountStr)
        ? Number(amountStr)
        : amountStr;
    }
    if (attachmentStr) {
      payload.ticket_attachment = attachmentStr;
    }

    const nextStatus =
      row?.status?.toLowerCase() === "cancelation_pending"
        ? "cancelation_approved"
        : null;

    try {
      await updateTicketApproval(
        row?.id,
        "approved",
        refetch,
        Object.keys(payload).length ? payload : null,
        nextStatus
      );
      closeApprovalModal();
    } catch (e) {
      console.error(e);
      toast.error("Failed to approve request");
    }
  };

  // Approve handler (generic)
  const onApprove = async () => {
    if (!canUserModifyRequest) return;


    await updateRequestStatus(
      row?.id,
      "approved",
      refetch,
      null,
      row?.status?.toLowerCase() === "cancelation_pending"
        ? "cancelation_approved"
        : null
    );

    await approvalEmailSender({
      email: row?.employee?.work_email,
      row: row,
      approvalType: reportType,
      approverName: user?.full_name,
      approverRole: user?.role
  });


    if (reportType === "allowance_requests") {
      await fetchManager(FINANCE_ORG_UNIT_ID);
      if (manager) {
        await transactionApprovalEmailSenderToFinance(
          manager?.work_email,
          row,
          reportType,
          user?.full_name,
          user?.role
        );
      }
    }

    closeApprovalModal();
  };

  // Reject handler
  const onReject = async (reason) => {
    if (!canUserModifyRequest) return;

    await updateRequestStatus(
      row?.id,
      "rejected",
      refetch,
      reason,
      row?.status?.toLowerCase() === "cancelation_pending"
        ? "cancelation_rejected"
        : null
    );

    await rejectionEmailSender({
      email: row?.employee?.work_email,
      rejectPayload: row,
      rejectionType: reportType,
      rejectorName: user?.full_name,
      reason,
      rejectorRole: user?.role,
    });

    closeModal();
  };

  // Modal controls
  const closeModal = () => setOpenModal(false);
  const showModal = () => setOpenModal(true);
  const openApprovalModal = () => setOpenApproval(true);
  const closeApprovalModal = () => setOpenApproval(false);

  const items = [
    {
      label: "Approve",
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      action: openApprovalModal,
      className: "!text-success",
      disabled: getButtonStates.disableApprove,
    },
    {
      label: "Reject",
      icon: <HighlightOffIcon fontSize="small" />,
      action: showModal,
      danger: true,
      disabled: getButtonStates.disableReject,
    },
  ];

  return (
    <>
      <CustomMenu items={items} />

      <ActionModal
        onClose={closeModal}
        open={openModal}
        onReject={onReject}
        loading={updateLoading}
        disableApprove={getButtonStates.disableApprove}
        disableReject={getButtonStates.disableReject}
      />

      {reportType === "ticket_requests" ? (
        <ApprovalModal
          handleSubmit={onApproveTicketRequest}
          open={openApproval}
          onClose={closeApprovalModal}
          type="confirm"
          title="Approve Request"
          description="Are you sure you want to approve this request?"
          loading={updateLoadingApproved}
          buttonTitle="Approve"
        />
      ) : (
        <AlertModal
          onConfirm={onApprove}
          open={openApproval}
          onClose={closeApprovalModal}
          type="confirm"
          title="Approve Request"
          description="Are you sure you want to approve this request?"
          loading={updateLoading}
          buttonTitle="Approve"
        />
      )}
    </>
  );
};

export default ActionPermissionWrapper;











// import React, { useState, useMemo } from 'react'
// import { useUser } from '../../../../context/UserContext'
// import { useUpdateRequestStatus, useUpdateTicketApproval } from '../../../../utils/hooks/api/approvals'
// import { FINANCE_ORG_UNIT_ID, ROLES } from '../../../../utils/constants'
// import CustomMenu from '../../../../components/common/CustomMenu'
// // import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
// import HighlightOffIcon from '@mui/icons-material/HighlightOff'
// import AlertModal from '../../../../components/common/Modal/AlertModal'
// import ApprovalModal from '../../../../components/common/Modal/ApprovalModal'
// import ActionModal from '../../../../components/common/ActionModal'
// import toast from 'react-hot-toast'
// import { transactionApprovalEmailSender } from '../../../../utils/helper'
// import { useCompanyManagers, useGetDepartmentManager } from '../../../../utils/hooks/api/emplyees'
// import { rejectionEmailSender, transactionApprovalEmailSenderToFinance } from '../../../../utils/transactionsEmailSender'


// const ActionPermissionWrapper = ({ row, refetch, reportType }) => {
//   const [openModal, setOpenModal] = useState(false)
//   const [openApproval, setOpenApproval] = useState(false)
//   const { user } = useUser()
//   const { updateRequestStatus, loading: updateLoading } =
//     useUpdateRequestStatus(reportType)
//   const { manager, fetchManager } = useGetDepartmentManager();

//       const { updateTicketApproval, loading: updateLoadingApproved } =
//     useUpdateTicketApproval()

//   const canUserModifyRequest = useMemo(() => {
//     const userRole = user?.role



//     if (!userRole) return false

//             console.log("8888888888888888", row)


//     switch (userRole) {
//       case ROLES.MANAGER:
//         return (
//           row?.is_hr_approve === 'pending' &&
//           row?.is_hr_manager_approve === 'pending'
//         )

//       case ROLES.HR:
//         return row?.is_hr_manager_approve === 'pending'

//       case ROLES.HR_MANAGER:
//         return true

//       default:
//         return false
//     }
//   }, [user?.role, row?.is_hr_approve, row?.is_hr_manager_approve])

//   const getButtonStates = useMemo(() => {
//     const userRole = user?.role


//     if (!canUserModifyRequest) {
//       return { disableApprove: true, disableReject: true }
//     }

//     switch (userRole) {
//       case ROLES.MANAGER:
//         return {
//           disableApprove: row?.is_manager_approve !== 'pending',
//           disableReject: row?.is_manager_approve !== 'pending'
//         }

//       case ROLES.HR:
//         return {
//           disableApprove: row?.is_hr_approve !== 'pending',
//           disableReject: row?.is_hr_approve !== 'pending'
//         }

//       case ROLES.HR_MANAGER:
//         return {
//           disableApprove: row?.is_hr_manager_approve !== 'pending',
//           disableReject: row?.is_hr_manager_approve !== 'pending'
//         }

//       default:
//         return { disableApprove: true, disableReject: true }
//     }
//   }, [user?.role, row, canUserModifyRequest])



//   const onApprove = async () => {
    
//     if (!canUserModifyRequest) return
//     await updateRequestStatus(row?.id, "approved", refetch,null,row?.status?.toLowerCase() === "cancelation_pending" ? "cancelation_approved":null)
//     await transactionApprovalEmailSender(row?.employee?.work_email, row, reportType, user?.full_name, user?.role);
//     closeApprovalModal()
//     if(reportType === 'allowance_requests'){
//       await fetchManager(FINANCE_ORG_UNIT_ID);
//       if(manager) {
//         await transactionApprovalEmailSenderToFinance(manager?.work_email, row, reportType, user?.full_name, user?.role);
//       }
//     }
    

//   }




// const onApproveTicketRequest = async (values) => {
//   if (!canUserModifyRequest) return;

//   const trim = v => (typeof v === 'string' ? v.trim() : v);
//   const amountStr = trim(values.ticket_amount ?? '');
//   const attachmentStr = trim(values.attachment ?? '');

//   // Build payload with only entered fields
//   const payload = {};
//   if (amountStr) {
//     payload.ticket_amount = /^[0-9]+(\.[0-9]{1,2})?$/.test(amountStr)
//       ? Number(amountStr)
//       : amountStr; // fallback to raw string if not strictly numeric
//   }
//   if (attachmentStr) {
//     payload.ticket_attachment = attachmentStr; // string URL/path
//   }

//   const nextStatus =
//     row?.status?.toLowerCase() === 'cancelation_pending'
//       ? 'cancelation_approved'
//       : null;

//   try {
//     await updateTicketApproval(
//       row?.id,
//       'approved',
//       refetch,
//       Object.keys(payload).length ? payload : null,
//       nextStatus
//     );
//     closeApprovalModal();
//   } catch (e) {
//     console.error(e);
//     toast?.error?.('Failed to approve request');
//   }
// };




//   const onReject = async (reason) => {
//     if (!canUserModifyRequest) return
//     await updateRequestStatus(row?.id, "rejected", refetch, reason,row?.status?.toLowerCase() === "cancelation_pending" ? "cancelation_rejected":null)
//     await rejectionEmailSender({
//       email: row?.employee?.work_email, 
//       rejectPayload: row, 
//       rejectionType: reportType, 
//       rejectorName: user?.full_name, 
//       reason: reason,
//       rejectorRole: user?.role});
//     closeModal()
//   }


//   const closeModal = () => setOpenModal(false)
//   const showModal = () => setOpenModal(true)

//   const openApprovalModal = () => setOpenApproval(true)
//   const closeApprovalModal = () => setOpenApproval(false)

//   const items = [
//     // {
//     //   label: 'View',
//     //   icon: <VisibilityOutlinedIcon fontSize='small' />,
//     //   action: () => {}
//     // },
//     {
//       label: 'Approve',
//       icon: <CheckCircleOutlineIcon fontSize='small' />,
//       action: openApprovalModal,
//       className: '!text-success',
//       disabled: getButtonStates.disableApprove || !canUserModifyRequest
//     },
//     {
//       label: 'Reject',
//       icon: <HighlightOffIcon fontSize='small' />,
//       action: showModal,
//       danger: true,
//       disabled: getButtonStates.disableReject || !canUserModifyRequest
//     }
//   ]

//   return (
//     <React.Fragment>
//       <CustomMenu items={items} />

//       <ActionModal
//         onClose={closeModal}
//         open={openModal}
//         onReject={onReject}
//         loading={updateLoading}
//         disableApprove={getButtonStates.disableApprove}
//         disableReject={getButtonStates.disableReject}
//       />

// {reportType === 'ticket_requests' ? (<ApprovalModal
//         handleSubmit={onApproveTicketRequest}
//         open={openApproval}
//         onClose={closeApprovalModal}
//         type='confirm'
//         title={'Approve Request'}
//         description={'Are you sure you want to approve this request?'}
//         loading={updateLoadingApproved}
//         buttonTitle='Approve'
//       />) : (
//         <AlertModal
//         onConfirm={onApprove}
//         open={openApproval}
//         onClose={closeApprovalModal}
//         type='confirm'
//         title={'Approve Request'}
//         description={'Are you sure you want to approve this request?'}
//         loading={updateLoading}
//         buttonTitle='Approve'
//       />
//       )} 
      

      

//     </React.Fragment>
//   )
// }

// export default ActionPermissionWrapper