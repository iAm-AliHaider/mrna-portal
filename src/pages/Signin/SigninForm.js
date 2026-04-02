import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";

import AuthFormBackgroundContainer from "../../components/common/AuthFormBackgroundContainer";
import FormikInputField from "../../components/common/FormikInputField";
import SubmitButton from "../../components/common/SubmitButton";
import LoadingWrapper from "../../components/common/LoadingWrapper";
import { useLogin } from "../../utils/hooks/api/useAuthentication";
import { sendCandidateVerificationEmail } from "../../utils/emailSenderHelper";
import {
  checkResendCooldown,
  formatCandidateName,
  handleTokenVerification,
  startCooldown,
  hashPassword
} from "../../utils/helper";
import { Button } from "@mui/material";
import Storage from "../../utils/storage";

// 🔹 Change Password Modal
import ChangePasswordModal from "./ChangePasswordModal";
import { useGenericFlowEmployees } from "../../utils/hooks/api/genericApprovalFlow";

const initialValues = {
  username: "",
  password: "",
};

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [loadingState, setIsLoadingState] = useState(false);
  const { login, loading, handleChangePassword } = useLogin();
  const [isEmailSending, setIsEmailSending] = useState(false);

  // 🔹 For Change Password Modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [userForReset, setUserForReset] = useState(null);

  useEffect(() => checkResendCooldown(setCooldown), []);
  useEffect(() => {
    handleTokenVerification(location, setIsLoadingState, navigate);
  }, [location, navigate]);




  // 🔹 On Submit Login
  const handleLogin = async (values, formikHelpers) => {


    const loginPayload = {
      ...values,
      username: values.username.toLowerCase(),
    };

    const result = await login(loginPayload, formikHelpers);

    if (result?.error?.message === "Email not verified") {
      setUnverifiedEmail(values.username);
      setUnverifiedUser(result?.data);
      toast.error("Your email is not verified.");
      return;
    }


    // 🔹 Check for password reset requirement
    if (
      result?.data?.is_password_reset === false &&
      result?.data?.work_email
    ) {
      setUserForReset(result.data);
      setShowChangePassword(true);
      return; // 🚨 don’t store user or navigate
    }

    // 🔹 Normal login flow → store user and navigate
    if (result?.data) {
      Storage.set("user", result.data);
      const emp = result.data;
      const url = emp.role_columns?.roles?.includes("admin")
        ? "/admin/company-info/general"
        : "/home";
      navigate(url);
    }
  };

  // 🔹 Resend Verification Email
  const handleResendVerification = async () => {
    if (!unverifiedUser?.id && unverifiedUser?.email_verification) return;
    setIsEmailSending(true);
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify({ candidate_id: unverifiedUser.id }),
      process.env.REACT_APP_ENCRYPTION_KEY
    ).toString();

    const link = `${process.env.REACT_APP_SYSTEM_URL}?token=${encodeURIComponent(
      encrypted
    )}`;

    try {
      await sendCandidateVerificationEmail("template_titg22u", {
        name: formatCandidateName(unverifiedUser),
        company_name: "MRNA",
        support_email: "support@mrna.sa",
        email: unverifiedUser.email,
        canidate_sigup: link,
        company_website: "https://www.mrna.sa",
        company_icon: "https://www.mrna.sa",
      });

      toast.success("Verification email sent.");
      setIsEmailSending(false);
      startCooldown(setCooldown);
    } catch (err) {
      toast.error("Failed to send verification email.");
      setIsEmailSending(false);
    }
  };

  return (
    <LoadingWrapper isLoading={loadingState}>
      <AuthFormBackgroundContainer>
        <h2 className="text-4xl font-bold text-center text-primary mb-2">
          Sign In
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          You will need to enter your credentials in order to sign in
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {() => (
            <Form className="flex flex-col gap-4">
              <FormikInputField
                name="username"
                placeholder="Username"
                Icon={PermIdentityOutlinedIcon}
                required
              />
              <FormikInputField
                label="Password"
                type="password"
                name="password"
                placeholder="Password"
                required
              />

              <div className="text-right text-sm text-blue-600 mt-[-8px] mb-3 cursor-pointer">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <SubmitButton
                size="lg"
                title="Sign In"
                type="submit"
                isLoading={loading}
              />

              {unverifiedEmail && (
                <div className="text-center mt-4">
                  <p className="text-red-500 text-sm mb-2">
                    Your email is not verified.
                  </p>
                  <SubmitButton
                    type="button"
                    onClick={handleResendVerification}
                    disabled={cooldown > 0 || isEmailSending}
                    size="sm"
                    className="w-auto mx-auto text-blue-600 p-0"
                    title={
                      cooldown > 0
                        ? `Resend in ${cooldown}s`
                        : "Resend Verification Email"
                    }
                  />
                </div>
              )}
            </Form>
          )}
        </Formik>

        {/* External MSD login */}
        <a
          href="https://erp.mrna.sa:8080/BC230/"
          target="_blank"
          rel="noreferrer"
        >
          <Button
            variant="contained"
            size="lg"
            sx={{
              my: "10px",
              flex: 1,
              display: "block",
              width: "100%",
              py: "10px",
            }}
          >
            MSD 365 Login
          </Button>
        </a>
      </AuthFormBackgroundContainer>

      {/* 🔹 Change Password Modal */}
      {showChangePassword && userForReset && (
        <ChangePasswordModal
          open={showChangePassword}
          onCancel={() => {
            setUserForReset(null);
            setShowChangePassword(false);
          }}
          user={userForReset}
          onSubmit={async (newPassword) => {
            const updatedPassword = hashPassword(newPassword);
            await handleChangePassword(userForReset.candidate_id, updatedPassword);
            setUserForReset(null);
            setShowChangePassword(false);
            // toast.success("Password changed. Please login again.");
          }}
        />
      )}
    </LoadingWrapper>
  );
};

export default SignIn;










// import React, { useState } from "react";
// import { Formik, Form } from "formik";
// import * as Yup from "yup";
// import toast from "react-hot-toast";
// import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";

// import AuthFormBackgroundContainer from "../../components/common/AuthFormBackgroundContainer";
// import FormikInputField from "../../components/common/FormikInputField";
// import SubmitButton from "../../components/common/SubmitButton";
// import LoadingWrapper from "../../components/common/LoadingWrapper";
// import { getEmployees, getCompany } from "../../utils/erpApiHelper";


// // =================== FORM CONFIG ===================
// const initialValues = {
//   username: "",
//   password: "",
// };

// const validationSchema = Yup.object({
//   username: Yup.string().required("Username is required"),
//   password: Yup.string().required("Password is required"),
// });


// const SignIn = () => {
//   const [loadingState, setIsLoadingState] = useState(false);


//   const handleLogin = async () => {
//   try {
//     const data = await getCompany(); 

//     console.log("Employees from BC:", data);

//     if (data?.value) {
//       toast.success(`Fetched ${data.value.length} employees from BC API`);
//     } else {
//       toast.error("No employees found in BC API");
//     }
//   } catch (err) {
//     console.error("Error fetching employees:", err);
//     toast.error(err.message || "Failed to fetch employees");
//   }
// };

//   return (
//     <LoadingWrapper isLoading={loadingState}>
//       <AuthFormBackgroundContainer>
//         <h2 className="text-4xl font-bold text-center text-primary mb-2">
//           Sign In
//         </h2>
//         <p className="text-center text-gray-600 mb-6 text-sm">
//           You will need to enter your credentials in order to sign in
//         </p>

//         <Formik
//           initialValues={initialValues}
//           validationSchema={validationSchema}
//           onSubmit={handleLogin} // 👈 Direct API call
//         >
//           {() => (
//             <Form className="flex flex-col gap-4">
//               <FormikInputField
//                 name="username"
//                 placeholder="Username"
//                 Icon={PermIdentityOutlinedIcon}
//                 required
//               />
//               <FormikInputField
//                 label="Password"
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 required
//               />

//               <SubmitButton
//                 size="lg"
//                 title="Sign In"
//                 type="submit"
//                 isLoading={loadingState}
//               />
//             </Form>
//           )}
//         </Formik>
//       </AuthFormBackgroundContainer>
//     </LoadingWrapper>
//   );
// };

// export default SignIn;




