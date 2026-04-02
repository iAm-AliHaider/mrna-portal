import toast from "react-hot-toast";
import { SIDEBAR_MENU_DATA, ROLES, ROUTE_PERMISSIONS } from "./constants";
import CryptoJS from "crypto-js";
import { supaBaseUpdateById } from "./common";
import { supabase } from "../supabaseClient";
import { approvalEmailSender, requestsEmailSender } from "./transactionsEmailSender";

const FIXED_SALT = "h+7yZ8pQm3xVn1B2cGdL4eF==";

export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const earthRadiusMeters = 6371000;
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLatRad = toRadians(lat2 - lat1);
  const deltaLonRad = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadiusMeters * c;

  return distance;
}

// export function generateTaskChecklistPayloads(formikValues) {
//   const results = []

//   for (const section of OFF_BOARDING_TASKS) {
//     for (const task of section.tasks) {
//       const { label, key } = task

//       if (
//         !formikValues.hasOwnProperty(key) ||
//         formikValues[key] === null ||
//         formikValues[key] === undefined
//       ) {
//         continue
//       }

//       const approverId = formikValues[key]

//       results.push({
//         task_description: label,
//         completion_date: null,
//         comments: 'Need this urgently',
//         reminders: 'Need this urgently',
//         mandatory_flag: false,
//         escalation_level: 1,
//         approver_id: approverId,
//         approval_status: 'pending'
//       })
//     }
//   }
//   return results
// }

export function generateAssignedTasksPayloads(formValues) {
  const { employee, ...restValues } = formValues;
  const empId = Number(employee);
  if (isNaN(empId)) {
    throw new Error('Invalid or missing "employee" value in formValues.');
  }

  const payloads = [];

  Object.entries(restValues).forEach(([rawKey, rawValue]) => {
    const taskId = Number(rawKey);
    if (isNaN(taskId) || !Number.isInteger(taskId) || taskId <= 0) {
      return;
    }

    const assignedToId = Number(rawValue);
    if (
      isNaN(assignedToId) ||
      !Number.isInteger(assignedToId) ||
      assignedToId <= 0
    ) {
      return;
    }

    payloads.push({
      task_id: taskId,
      assigned_to_id: assignedToId,
      candidate_id: empId,
      status: "assigned",
    });
  });

  return payloads;
}

export function generateOffBoardAssignedTasksPayloads(formValues) {
  const { employee, ...restValues } = formValues;
  const empId = Number(employee);
  if (isNaN(empId)) {
    throw new Error('Invalid or missing "employee" value in formValues.');
  }

  const payloads = [];

  Object.entries(restValues).forEach(([rawKey, rawValue]) => {
    const taskId = Number(rawKey);
    if (isNaN(taskId) || !Number.isInteger(taskId) || taskId <= 0) {
      return;
    }

    const assignedToId = Number(rawValue);
    if (
      isNaN(assignedToId) ||
      !Number.isInteger(assignedToId) ||
      assignedToId <= 0
    ) {
      return;
    }

    payloads.push({
      task_id: taskId,
      assigned_to_id: assignedToId,
      employee_id: empId,
      status: "assigned",
    });
  });

  return payloads;
}

export async function generateEmployeeCode() {
  const { data, error } = await supabase
    .from("code_counters")
    .select("employee_code")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error(
      "Failed to fetch current employee code: " + (error?.message || "no data")
    );
  }

  const raw = data.employee_code;
  const formatted = String(raw).padStart(6, "0");

  return { raw, formatted };
}

export async function incrementEmployeeCode(previousCode) {
  const newCode = previousCode + 1;
  const response = await supabase
    .from("code_counters")
    .update({ employee_code: newCode })
    .eq("id", 1)
    .select("employee_code")
    .single();

  if (response.error) {
    throw response.error;
  }

  return response;
}

export function generateCandidateCode() {
  const sixDigit = Math.floor(100000 + Math.random() * 900000);
  return `CAN${sixDigit}`;
}

export function generateSuccessionAssignedTasksPayloads(
  formValues,
  tasks,
  employeeId
) {
  // formValues: { [taskId]: assignedEmployeeId, ... }
  // tasks: [{ id, name, ... }, ...]
  // employeeId: the id of the employee being succeeded
  const payloads = [];
  (tasks || []).forEach((task) => {
    const assignedToId = formValues[task.id];
    if (task.id && assignedToId) {
      payloads.push({
        task_id: Number(task.id),
        assigned_to_id: Number(assignedToId),
        employee_id: Number(employeeId),
        status: "assigned",
      });
    }
  });
  return payloads;
}

export function filterMenuByRole(role) {
  return SIDEBAR_MENU_DATA.map((item) => {
    const { allowedTo = [], children } = item;

    let filteredChildren = [];
    if (Array.isArray(children)) {
      filteredChildren = filterMenuByRole(children, role);
    }

    const parentAllowed =
      allowedTo.includes(ROLES.ALL) || allowedTo.includes(role);

    if (parentAllowed || filteredChildren.length > 0) {
      return {
        ...item,
        children: Array.isArray(children) ? filteredChildren : undefined,
      };
    }

    return null;
  }).filter((item) => item !== null);
}

function getEffectiveRole(roles) {
  if (!roles || roles?.length === 0) {
    return ROLES.CANDIDATE;
  }

  if (roles.length === 1 && roles[0] === ROLES.EMPLOYEE) {
    return ROLES.EMPLOYEE;
  }

  if (roles.includes(ROLES.EMPLOYEE) && roles.length === 2) {
    return roles.find((role) => role !== ROLES.EMPLOYEE);
  }

  return roles[0];
}

function isMenuAllowed(allowedTo, userRole) {
  if (!allowedTo || allowedTo.length === 0) {
    return false;
  }

  if (allowedTo.includes(ROLES.ALL)) {
    return [ROLES.MANAGER, ROLES.HR_MANAGER, ROLES.HR, ROLES.EMPLOYEE].includes(
      userRole
    );
  }

  return allowedTo.includes(userRole);
}

function filterMenuItems(menuItems, userRole, depth = 0) {
  if (depth > 10 || !menuItems || !Array.isArray(menuItems)) {
    return [];
  }

  const result = [];

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];

    if (!item || typeof item !== "object") {
      continue;
    }

    const isCurrentItemAllowed = isMenuAllowed(item.allowedTo, userRole);

    let filteredChildren = [];
    if (
      item.children &&
      Array.isArray(item.children) &&
      item.children.length > 0
    ) {
      filteredChildren = filterMenuItems(item.children, userRole, depth + 1);
    }

    if (isCurrentItemAllowed || filteredChildren.length > 0) {
      const filteredItem = {
        label: item.label,
        icon: item.icon,
        path: item.path,
        allowedTo: item.allowedTo,
      };

      if (filteredChildren.length > 0) {
        filteredItem.children = filteredChildren;
      }

      result.push(filteredItem);
    }
  }
  return result;
}

export function generateMenuForRole(userRoles) {
  try {
    const menuData = SIDEBAR_MENU_DATA;
    const effectiveRole = getEffectiveRole(userRoles);
    return filterMenuItems(menuData, effectiveRole, 0);
  } catch (error) {
    console.error("Error generating menu for role:", error);
    return [];
  }
}

export function getUserRole(user) {
  if (!user || !user.role_columns || !user.role_columns.roles) {
    return ROLES.CANDIDATE;
  }

  const roles = user.role_columns.roles;

  if (roles.includes(ROLES.ADMIN)) {
    return ROLES.ADMIN;
  }

  if (roles.includes(ROLES.HR_MANAGER)) {
    return ROLES.HR_MANAGER;
  }

  if (roles.includes(ROLES.MANAGER)) {
    return ROLES.MANAGER;
  }

    if (roles.includes(ROLES.HOD)) {
    return ROLES.HOD;
  }


  if (roles.includes(ROLES.HR)) {
    return ROLES.HR;
  }

  return ROLES.EMPLOYEE;
}

export function canAccessRoute(path, userRole) {
  if (!ROUTE_PERMISSIONS[path]) {
    return true;
  }

  const allowedRoles = ROUTE_PERMISSIONS[path];

  if (allowedRoles.includes("all")) {
    return true;
  }

  return allowedRoles.includes(userRole);
}

export function hashPassword(plainText) {
  const saltBytes = CryptoJS.enc.Base64.parse(FIXED_SALT);

  const key512Bits = CryptoJS.PBKDF2(plainText, saltBytes, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });

  const hashBase64 = CryptoJS.enc.Base64.stringify(key512Bits);
  return hashBase64;
}

export function verifyPassword(plainText, storedHashBase64) {
  const computedHash = hashPassword(plainText);
  return computedHash === storedHashBase64;
}

export function isActive(announcement) {
  const now = new Date();
  const activeDate = new Date(announcement.active_date);
  const expiryDate = new Date(announcement.expiry_date);
  return now >= activeDate && now <= expiryDate;
}

export const formatEmploymetTypeTask = (values, employment_type_id) => {
  const {
    pre_hiring,
    post_hiring,
    termination_task_List,
    second_termination_task_List,
  } = values;

  const buildType = (phase, process) => `${phase}_${process}`;

  const buckets = [
    { list: pre_hiring, phase: "pre", process: "on_boarding" },
    { list: post_hiring, phase: "post", process: "on_boarding" },
    { list: termination_task_List, phase: "pre", process: "off_boarding" },
    {
      list: second_termination_task_List,
      phase: "post",
      process: "off_boarding",
    },
  ];

  const tasksToInsert = buckets.flatMap(({ list, phase, process }) =>
    (list || []).map((task) => {
      return {
        name: task,
        description: task,
        status: "pending",
        employment_type_id: employment_type_id,
        task_type: buildType(phase, process),
      };
    })
  );

  return tasksToInsert;
};

export const getSchduledInterviewFieldName = (
  currentData,
  currentEmployeeId
) => {
  let noteFieldName = "note_one";
  let dateFieldName = "first_interview_date";
  let timeFieldName = "first_interview_time";
  let interviewType = "first_interview_type";
  let interviewUrl = "first_interview_url";
  let interviewLocation = "first_interview_location";

  if (currentData?.interviewer_id === currentEmployeeId) {
    noteFieldName = "note_one";
    dateFieldName = "first_interview_date";
    timeFieldName = "first_interview_time";
    interviewType = "first_interview_type";
    interviewUrl = "first_interview_url";
    interviewLocation = "first_interview_location";
  }

  if (currentData?.second_interviewer_id === currentEmployeeId) {
    noteFieldName = "note_two";
    dateFieldName = "second_interview_date";
    timeFieldName = "second_interview_time";
    interviewType = "second_interview_type";
    interviewUrl = "second_interview_url";
    interviewLocation = "second_interview_location";
  }

  if (currentData?.third_interviewer_id === currentEmployeeId) {
    noteFieldName = "note_three";
    dateFieldName = "third_interview_date";
    timeFieldName = "third_interview_time";
    interviewType = "third_interview_type";
    interviewUrl = "third_interview_url";
    interviewLocation = "third_interview_location";
  }

  // for panel

  if (currentData?.first_interview_panel_member_one_id === currentEmployeeId) {
    noteFieldName = "first_interview_panel_member_one_note";
  }

  if (currentData?.first_interview_panel_member_two_id === currentEmployeeId) {
    noteFieldName = "first_interview_panel_member_two_note";
  }

  if (currentData?.second_interview_panel_member_one_id === currentEmployeeId) {
    noteFieldName = "second_interview_panel_member_one_note";
  }

  if (currentData?.second_interview_panel_member_two_id === currentEmployeeId) {
    noteFieldName = "second_interview_panel_member_two_note";
  }

  if (currentData?.third_interview_panel_member_one_id === currentEmployeeId) {
    noteFieldName = "third_interview_panel_member_one_note";
  }

  if (currentData?.third_interview_panel_member_two_id === currentEmployeeId) {
    noteFieldName = "third_interview_panel_member_two_note";
  }

  return {
    noteFieldName,
    dateFieldName,
    timeFieldName,
    interviewType,
    interviewUrl,
    interviewLocation,
  };
};

export const formatCandidateName = (user) => {
  return `
    ${user?.first_name ?? ""}
    ${user?.second_name ?? ""}
    ${user?.third_name ?? ""}
    ${user?.forth_name ?? ""}
  `
    .replace(/\s+/g, " ")
    .trim();
};

export const handleTokenVerification = async (
  location,
  setIsLoadingState,
  navigate
) => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  if (!token) return;

  setIsLoadingState(true);
  try {
    const bytes = CryptoJS.AES.decrypt(
      decodeURIComponent(token),
      process.env.REACT_APP_ENCRYPTION_KEY
    );
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    const { candidate_id } = JSON.parse(plain);

    await supaBaseUpdateById("candidates", candidate_id, {
      email_verification: true,
    });

    toast.success("Candidate Email Verification successful");
  } catch (err) {
    console.error(err);
    toast.error("Candidate Email Verification Failed");
  } finally {
    setIsLoadingState(false);
  }
};

export const checkResendCooldown = (setCooldown) => {
  const lastTs = localStorage.getItem("last_resend_ts");
  if (lastTs) {
    const diff = Math.floor((Date.now() - parseInt(lastTs, 10)) / 1000);
    const remaining = 30 - diff;
    if (remaining > 0) {
      setCooldown(remaining);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }
};

export const startCooldown = (setCooldown) => {
  setCooldown(30);
  localStorage.setItem("last_resend_ts", Date.now().toString());
  const interval = setInterval(() => {
    setCooldown((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

const fetchCompanyHRs = async () => {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .contains("role_columns", { roles: ["hr"] })
    .eq("is_deleted", false);

  if (error) throw error;
  let HrMails = data.map((item) => item.work_email);
  return HrMails;
};

const fetchManagerByOrgUnit = async (organizationalUnitId) => {
  if (!organizationalUnitId) return null;

  let data,
    qErr = null;

  const res = await supabase
    .from("employees")
    .select("id, role_columns, work_email, organizational_unit_id, is_deleted")
    .eq("organizational_unit_id", organizationalUnitId)
    .eq("is_deleted", false);

  if (!res.error) {
    const found = (res.data || []).find(
      (row) =>
        row?.role_columns &&
        Array.isArray(row.role_columns.roles) &&
        row.role_columns.roles.includes("manager")
    );
    data = found ? [found] : [];
    return data[0];
  } else {
    qErr = res.error;
    return qErr;
  }
};

export const transactionEmailSender = async (user, requestData, requestType, subject) => {
  const emails = requestData?.status_workflow.map(item => item.email).join(",");
  await requestsEmailSender({
    emails: emails,
    emailSubject: subject,
    requestType: requestType,
    employeeName: `${user?.full_name}`,
    employeeId: user?.employee_code,
    requestData: requestData
  });
};

export const transactionApprovalEmailSender = async (email, approvalData, approvalType, approverName, approverRole) => {
  await approvalEmailSender({
    email: email,
    approvalPayload: approvalData,
    approvalType: approvalType,
    approverName: approverName,
    approverRole: approverRole
  });
}
