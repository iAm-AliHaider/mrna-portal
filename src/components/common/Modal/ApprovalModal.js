import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../components/common/FormikInputField";
import Modal from "../Modal";
import SubmitButton from "../../../components/common/SubmitButton";
import FormikFileUpload from "../../../components/common/FormikFileUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ApprovalModal = ({
  open,
  onClose,
  id = null,
  handleSubmit,
  loading,
  title,
  description,
  type,
}) => {
  const initialValues = {
    ticket_amount: "",
    attachment: "", // string path or URL
  };

  // At least ONE of ticket_amount or attachment (string) is required.
  const validationSchema = Yup.object({
    ticket_amount: Yup.string()
      .transform(v => (v ?? "").toString().trim())
      .test("valid-amount", "Enter a valid amount", v => {
        if (!v) return true; // only validate format if provided
        return /^[0-9]+(\.[0-9]{1,2})?$/.test(v);
      })
      .nullable(),
    attachment: Yup.string()
      .transform(v => (v ?? "").toString().trim())
      .nullable(),
  }).test(
    "amount-or-attachment",
    "Enter ticket amount or attach a file",
    function (obj) {
      const amount = (obj?.ticket_amount ?? "").toString().trim();
      const att = (obj?.attachment ?? "").toString().trim();

      const hasAmount = amount.length > 0;
      const hasAttachment = att.length > 0;

      if (hasAmount || hasAttachment) return true;

      // Show error under amount field (can switch to 'attachment' if you prefer)
      return this.createError({
        path: "ticket_amount",
        message: "Enter ticket amount or attach a file",
      });
    }
  );

  const getModalStyles = (type) => {
    switch (type) {
      case "success":
        return {
          titleColor: "text-green-500",
          icon: <CheckCircleIcon className="text-green-500" sx={{ fontSize: 40 }} />,
          variant: "success",
          buttonTextColor: "text-white",
        };
      case "warning":
        return {
          titleColor: "text-orange-500",
          icon: <WarningAmberIcon className="text-orange-500" sx={{ fontSize: 80 }} />,
          variant: "warning",
          buttonTextColor: "text-white",
        };
      case "danger":
        return {
          titleColor: "text-red-500",
          icon: <ErrorOutlineIcon className="text-red-500" sx={{ fontSize: 80 }} />,
          variant: "danger",
          buttonTextColor: "text-white",
        };
      case "confirm":
        return {
          titleColor: "text-primary",
          icon: <CheckCircleIcon className="text-green-600" sx={{ fontSize: 80 }} />,
          variant: "primary",
          buttonTextColor: "text-white",
        };
      default:
        return {
          titleColor: "text-primary",
          icon: null,
          variant: "primary",
          buttonTextColor: "text-white",
        };
    }
  };

  const styles = getModalStyles(type);

  return (
    <Modal open={open} onClose={onClose} headless>
      <div className="w-full text-center flex flex-col items-center justify-center gap-2">
        {styles.icon && <div className="mb-4">{styles.icon}</div>}
        <h1 className={`text-xl font-semibold ${styles.titleColor}`} id="alert-modal-title">
          {title}
        </h1>
        <p className="text-lg mt-2" id="alert-modal-description">
          {description}
        </p>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="flex-1 overflow-y-auto space-y-6 w-full max-w-xl mt-4">
              <FormikInputField
                name="ticket_amount"
                label="Ticket Amount"
                placeholder="Enter amount"
              />

              {/* If your FormikFileUpload returns a string (URL/path), this will work.
                  If it returns File/Blob, swap to a text input or adapt the component. */}
              <FormikFileUpload
                name="attachment"
                label="Attachment"
              />

              <div className="mt-4 flex items-center gap-12 justify-center">
                <SubmitButton type="button" onClick={onClose} variant="secondary" title="Cancel" />
                <SubmitButton
                  type="submit"
                  title="Approve"
                  variant={styles.variant}
                  isLoading={loading}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default ApprovalModal;





// import React, { useState } from 'react'
// import Modal from '../Modal'
// import InputField from '../FormikInputField/Input'
// import SubmitButton from '../SubmitButton'

// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import WarningAmberIcon from "@mui/icons-material/WarningAmber";
// import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
// import FormikFileUpload from "../../../components/common/FormikFileUpload";


// const ApprovalModal = ({
//   open,
//   onClose,
//   title,
//   description,
//   type,
//   onConfirm,
//   loading,
//   buttonTitle
// }) => {
//   const [amount, setAmount] = useState('')

//   const handleChange = e => {
//     setAmount(e.target.value)
//   }

//   const handleConfirmation = () => {
//     onConfirm(amount, )
//   }

// const getModalStyles = (type) => {
//     switch (type) {
//       case "success":
//         return {
//           titleColor: "text-green-500",
//           icon: <CheckCircleIcon className="text-green-500" sx={{ fontSize: 40 }} />,
//           variant: "success",
//           buttonTextColor: "text-white",
//         };
//       case "warning":
//         return {
//           titleColor: "text-orange-500",
//           icon: <WarningAmberIcon className="text-orange-500" sx={{ fontSize: 80 }} />,
//           variant: "warning",
//           buttonTextColor: "text-white",
//         };
//       case "danger":
//         return {
//           titleColor: "text-red-500",
//           icon: <ErrorOutlineIcon className="text-red-500" sx={{ fontSize: 80 }} />,
//           variant: "danger",
//           buttonTextColor: "text-white",
//         };
//       case "confirm":
//         return {
//           titleColor: "text-primary",
//           icon: <CheckCircleIcon className="text-green-600" sx={{ fontSize: 80 }} />,
//           variant: "primary",
//           buttonTextColor: "text-white",
//         };
//       default:
//         return {
//           titleColor: "text-primary",
//           icon: null,
//           variant: "primary",
//           buttonTextColor: "text-white",
//         };
//     }
//   };

//   const styles = getModalStyles(type);


//   return (
//     <Modal open={open} onClose={onClose} title={title}>
//       <p className='text-gray-700 text-lg'>{description}</p>
//       <InputField
//         label='Ticket Amount'
//         value={amount}
//         onChange={handleChange}
//         required
//       />
           

//                          <FormikFileUpload name="attachment" label="Attachment" />

//            <div className="mt-4 flex items-center gap-12">
//           <SubmitButton type='button' onClick={onClose} variant="secondary" title="Cancel" />
//           <SubmitButton
//             type='button'
//             onClick={onConfirm}
//             title={buttonTitle}
//             variant={styles.variant}
//             isLoading={loading}
//           />
//         </div>
//     </Modal>
//   )
// }

// export default ApprovalModal;




// // import React, { useState, useEffect } from "react";
// // import {
// //   Dialog,
// //   Button,
// //   Stack,
// //   Box,
// //   Typography,
// //   Link,
// //   Tooltip,
// //   IconButton,
// // } from "@mui/material";
// // import ThumbUpIcon from "@mui/icons-material/ThumbUp";
// // import InfoIcon from "@mui/icons-material/Info";
// // import DownloadIcon from "@mui/icons-material/Download";
// // const ApprovalModal = ({
// //   currentData,
// //   setCurrentData,
// //   announcmentLikeAction,
// //   handleAnnouncementLike,
// //   enableClose = false,
// // }) => {
// //   const [openModal, setOpenModal] = useState(true);
// //   const [read, setRead] = useState(false);
// //   const [isDocument, setIsDocument] = useState(false);
// //   const handleClose = async () => {
// //     if (currentData) {
// //       handleAnnouncementLike(currentData?.id);
// //       setOpenModal(false);
// //       setCurrentData(null);
// //     }
// //   };
// //   useEffect(() => {
// //     if (currentData && currentData?.attachment_path) {
// //       setIsDocument(true);
// //     } 
// //     // else if (enableClose) {
// //     //   setIsDocument(true);
// //     // }
// //   }, [currentData]);
// //   const handleModalClose = async () => {
// //     setOpenModal(false);
// //     setCurrentData(null);
// //   };

// //   return (
// //     <Dialog open={openModal} maxWidth="md" fullWidth>
// //       <Box sx={{ padding: 3, backgroundColor: "white", borderRadius: 2 }}>
// //         <Typography variant="h5" gutterBottom>
// //           Title: {currentData?.title || "No title available"}
// //         </Typography>

// //         <Typography
// //           variant="body1"
// //           color="textSecondary"
// //           paragraph
// //           className="flex"
// //         >
// //           <strong>Description: </strong>

// //           {/* {currentData?.description || 'No description available'} */}
// //           <div
// //             className="ml-3"
// //             dangerouslySetInnerHTML={{
// //               __html: currentData?.description
// //                 ? currentData?.description
// //                 : "No description available",
// //             }}
// //           />
// //         </Typography>

// //         <Box sx={{ marginBottom: 2 }}>
// //           <Typography variant="body2" color="textSecondary">
// //             <strong>Attachment: </strong>
// //             {currentData?.attachment_path ? (
// //               <Button
// //                 variant="outlined"
// //                 color="primary"
// //                 startIcon={<DownloadIcon />}
// //                 onClick={() => {
// //                   window.open(currentData.attachment_path, "_blank");
// //                   setIsDocument(false);
// //                 }}
// //               >
// //                 Download Attachment
// //               </Button>
// //             ) : (
// //               "No attachment available"
// //             )}
// //           </Typography>
// //         </Box>

// //         <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
// //           {isDocument && (
// //             <Tooltip title="Please download the attachment first">
// //               <IconButton color="primary">
// //                 <InfoIcon />
// //               </IconButton>
// //             </Tooltip>
// //           )}
// //           {announcmentLikeAction && (
// //             <Button
// //               variant={read ? "contained" : "outlined"}
// //               color="success"
// //               disabled={isDocument}
// //               size="large"
// //               startIcon={<ThumbUpIcon />}
// //               onClick={handleClose}
// //             >
// //               Agree
// //             </Button>
// //           )}

// //           <Button
// //             variant="outlined"
// //             color="primary"
// //             size="large"
// //             disabled={isDocument && !enableClose}
// //             onClick={handleModalClose}
// //           >
// //             Close
// //           </Button>
// //         </Stack>
// //       </Box>
// //     </Dialog>
// //   );
// // };

// // export default ApprovalModal;
