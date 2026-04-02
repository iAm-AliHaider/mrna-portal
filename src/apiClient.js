// // emailApi.js

// // Decide API base URL depending on environment
// const BASE_URL =
//   process.env.NODE_ENV === "development"
//     ? "http://3.220.234.77:4000" // local backend
//     : "http://192.168.172.13:4000";    // production backend

    

// const EMAIL_API_URL = `${BASE_URL}/send-email`;

// /**
//  * Sends an email using the MRNA API
//  * @param {Object} payload - { subject, html_body, email }
//  * @returns {Promise<Object>} API response
//  */
// export async function sendEmailApi(payload) {
//   try {
//     const response = await fetch(EMAIL_API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     console.log("===========", response)

//     if (!response.ok) {
//       throw new Error(`API error: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Email API call failed:", error);
//     throw error;
//   }
// }



// apiClient.js

// Base URLs
const BASES = {
  default:
    process.env.NODE_ENV === "development"
      ? "http://3.220.234.77:4000/BC/Odatav4/"
      : "http://192.168.172.13:4000/BC/Odatav4/",

  email:
    process.env.NODE_ENV === "development"
      ? "http://3.220.234.77:4000"
      : "http://192.168.172.13:4000",
};

/**
 * Generic API client
 * @param {string} endpoint - API endpoint (relative path)
 * @param {Object} options - fetch options { method, headers, body }
 * @param {Object} auth - optional { username, password } for Basic Auth
 * @param {"default"|"email"} service - which base URL to use
 * @returns {Promise<Object>} response JSON
 */
export async function apiClient(
  endpoint,
  options = {},
  auth = null,
  service = "default"
) {
  try {
    const baseUrl = BASES[service] || BASES.default;

    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Add Basic Auth if provided
    if (auth?.username && auth?.password) {
      headers["Authorization"] =
        "Basic " + btoa(`${auth.username}:${auth.password}`);
    }

    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle 204 (No Content)
    if (response.status === 204) return {};

    return await response.json();
  } catch (err) {
    console.error("API client error:", err);
    throw err;
  }
}
