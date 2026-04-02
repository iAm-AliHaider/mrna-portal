// src/components/common/ApprovalStepper.jsx
import React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  StepConnector,
  styled,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";

const STATUS_ICONS = {
  approved: <CheckCircleIcon color="primary" />,
  pending: <HourglassEmptyIcon color="primary" />,
  rejected: <CancelIcon color="error" />,
};

// 🔹 Mapping roles to exact display labels
const ROLE_LABELS = {
  manager: "Manager",
  hod: "HOD",
  hr: "HR",
  hr_manager: "HR Manager",
};

// 🔹 Default fallback workflow if none exists
const DEFAULT_FLOW = [
  { role: "manager", status: "pending" },
  { role: "hod", status: "pending" },
  { role: "hr", status: "pending" },
  { role: "hr_manager", status: "pending" },
];

// 🔹 Custom connector with dynamic colors
const ColorConnector = styled(StepConnector)(({ theme, ownerState }) => ({
  [`& .${StepConnector.line}`]: {
    borderTopWidth: 2,
    borderRadius: 1,
    borderColor:
      ownerState === "approved"
        ? theme.palette.success.main
        : ownerState === "rejected"
        ? theme.palette.error.main
        : theme.palette.grey[400],
  },
}));

const ApprovalStepper = ({ status_workflow }) => {
  const steps =
    Array.isArray(status_workflow) && status_workflow.length
      ? status_workflow
      : DEFAULT_FLOW;

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper alternativeLabel connector={<ColorConnector />}>
        {steps.map((step, idx) => {
          const key = ["approved", "pending", "rejected"].includes(step.status)
            ? step.status
            : "pending";

          const roleLabel = ROLE_LABELS[step.role] || step.role;
          const isFinalStatus = key === "approved" || key === "rejected";

          return (
            <Step key={idx} completed={key === "approved"}>
              <StepLabel
                StepIconComponent={() => STATUS_ICONS[key]}
                sx={{
                  "& .MuiStepLabel-label": {
                    typography: "body2",
                    textAlign: "center",
                    fontWeight: isFinalStatus ? "bold" : "normal",
                    color: isFinalStatus ? "black" : "gray",
                  },
                }}
              >
                <div>
                  <div>{roleLabel}</div>
                  {step?.name && (
                    <div style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                      {step.name}
                    </div>
                  )}
                </div>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default ApprovalStepper;




















// // src/components/common/ApprovalStepper.jsx
// import React from 'react';
// import {
//   Stepper,
//   Step,
//   StepLabel,
//   Box
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
// import CancelIcon from '@mui/icons-material/Cancel';

// const STATUS_ICONS = {
//   approved: <CheckCircleIcon color="primary" />,
//   pending:  <HourglassEmptyIcon color="primary" />,
//   rejected: <CancelIcon color="error" />
// };

// const ApprovalStepper = ({
//   is_manager_approve = 'pending',
//   is_hod_approve = 'pending',
//   is_hr_approve = 'pending',
//   is_hr_manager_approve = 'pending'
// }) => {
//   const steps = [
//     { label: 'Manager', status: is_manager_approve },
//         { label: 'HOD', status: is_hod_approve },
//     { label: 'HR',      status: is_hr_approve },
//     { label: 'HR Manager', status: is_hr_manager_approve }
//   ];

//   return (
//     <Box sx={{ width: '100%' }}>
//       <Stepper alternativeLabel>
//         {steps.map((step, idx) => {
//           // normalize to one of our keys:
//           const key = ['approved','pending','rejected'].includes(step.status)
//             ? step.status
//             : 'pending';

//           return (
//             <Step key={step.label} completed={key === 'approved'}>
//               <StepLabel
//                 StepIconComponent={() => STATUS_ICONS[key]}
//                 sx={{
//                   '& .MuiStepLabel-label': {
//                     typography: 'body2',
//                   }
//                 }}
//               >
//                 {step.label}
//               </StepLabel>
//             </Step>
//           );
//         })}
//       </Stepper>
//     </Box>
//   );
// }

// export default ApprovalStepper