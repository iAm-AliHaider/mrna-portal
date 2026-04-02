// bcApi.js
import { apiClient } from "../apiClient";

// 🔑 Basic Auth config for BC API
const AUTH = {
  username: "admin",
  password: "P@ssw0rd",
};

// ✅ Companies
export const getCompany = () =>
  apiClient("company", {}, AUTH, "default");

// ✅ Employees
export const getEmployees = () =>
  apiClient("employee", {}, AUTH, "default");

// ✅ Candidates
export const getCandidates = () =>
  apiClient("candidate", {}, AUTH, "default");

// ✅ Departments
export const getDepartments = () =>
  apiClient("department", {}, AUTH, "default");

// ✅ Generic fetcher (for any endpoint in case we add more later)
export const getBCData = (endpoint) =>
  apiClient(endpoint, {}, AUTH, "default");
