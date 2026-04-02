// emailApi.js
import { apiClient } from "../../../apiClient";

export function sendEmailApi(payload) {
  return apiClient("/send-email", {
    method: "POST",
    body: payload,
  }, null, "email"); // 👈 use email base
}
