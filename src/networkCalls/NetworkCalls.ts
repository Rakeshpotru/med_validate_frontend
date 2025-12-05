// import axios from "axios";

// // Define type that Axios accepts
// type AxiosHeaderType = Record<string, string>;
// const token = localStorage.getItem("TOKEN");
// // JSON headers
// export const getApiHeaders = async (): Promise<AxiosHeaderType> => {
//   return {
//     "Content-Type": "application/json",
//   };
// };
// export const getApiHeaders_token = async (): Promise<AxiosHeaderType> => {
//   return {
//     "Content-Type": "application/json",
//   };
// };

// // x-www-form-urlencoded headers
// export const getApiHeadersMessages = async (): Promise<AxiosHeaderType> => {
//   return {
//     Accept: "application/json",
//     "Content-Type": "application/x-www-form-urlencoded",
//     "Cache-Control": "no-cache",
//     Pragma: "no-cache",
//     "User-Agent": "Thunder Client (https://www.thunderclient.com)",
//   };
// };

// // Multipart/form-data headers
// export const getApiHeadersWithMultiPart = (): AxiosHeaderType => {
//   return {
//     "Content-Type": "multipart/form-data",
//   };
// };

// // POST request
// export const postRequest = async (
//   url: string,
//   body: unknown,
//   headers: AxiosHeaderType
// ): Promise<string> => {
//   try {
//     const response = await axios.post(url, body, { headers });
//     return response.data;
//   } catch (error: any) {
//     console.warn("Post method error", error);
//     if (error.response && error.response.status === 409) {
//       return error.response.data;
//     }
//     throw error;
//   }
// };

// // GET request
// export const getRequest = async (
//   url: string,
//   headers: AxiosHeaderType
// ): Promise<string> => {
//   try {
//     const response = await axios.get(url, { headers });
//     console.log(url)
//     return JSON.stringify(response.data);
//   } catch (error: any) {
//     console.error("Get method error", error);
//     return JSON.stringify({ error: error.message });
//   }
// };

// // DELETE request (no body)
// export const deleteRequest = async (
//   url: string,
//   headers: AxiosHeaderType
// ): Promise<string> => {
//   try {
//     const response = await axios.delete(url, { headers });
//     return JSON.stringify(response.data);
//   } catch (error: any) {
//     console.error("Delete method error", error);
//     return JSON.stringify({ error: error.message });
//   }
// };

// // DELETE request with body
// export const deleteRequestWithBody = async (
//   url: string,
//   data: unknown,
//   headers: AxiosHeaderType
// ): Promise<string> => {
//   try {
//     const response = await axios.delete(url, {
//       data,
//       headers,
//     });
//     return JSON.stringify(response.data);
//   } catch (error: any) {
//     console.error("Delete with body error", error);
//     return JSON.stringify({ error: error.message });
//   }
// };



// import type { AxiosResponse } from "axios";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { showWarn } from "../services/toasterService";

// // -----------------------------------------------------------------------------
// // ✅ Axios instance setup
// // -----------------------------------------------------------------------------
// const api = axios.create({
//   baseURL: "/", // can override dynamically per request
//   headers: {
//     Accept: "application/json",
//     "ngrok-skip-browser-warning": "true",
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("TOKEN");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // -----------------------------------------------------------------------------
// // ✅ Response Interceptor – handle 401/403 globally
// // -----------------------------------------------------------------------------
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error?.response?.status;
//     const message = error?.response?.data?.message;
//     console.log("data recieved from api",message)
//     if ( status === 401 && message !== "Invalid credentials"  ) {
//     showWarn(message);
//     window.location.href = "/";
//     localStorage.removeItem("role_permissions");
//     localStorage.setItem("MANUAL_SSO", "true");
//     localStorage.removeItem("TOKEN");
//     localStorage.removeItem("temp_password_value");
//     localStorage.removeItem("USER_ID");
//     localStorage.removeItem("ROLE_ID");
//     localStorage.removeItem("ID_TOKEN");   
     
//     }
//      if (status === 403 && message === "Invalid credentials" ) {
      
//     showWarn(message);
//     // window.location.href = "/";
//     localStorage.removeItem("role_permissions");
//     localStorage.setItem("MANUAL_SSO", "true");
//     localStorage.removeItem("TOKEN");
//     localStorage.removeItem("temp_password_value");
//     localStorage.removeItem("USER_ID");
//     localStorage.removeItem("ROLE_ID");
//     localStorage.removeItem("ID_TOKEN");
//     }

//     return Promise.reject(error);
//   }
// );

// // -----------------------------------------------------------------------------
// // ✅ Helper to get basic headers
// // -----------------------------------------------------------------------------
// export const GetApiHeaders = async () => ({
//   Accept: "application/json",
//   "ngrok-skip-browser-warning": "true",
// });

// // -----------------------------------------------------------------------------
// // ✅ Helper to get token headers (using localStorage)
// // -----------------------------------------------------------------------------
// export const GetApiHeaders_token = async () => {
//   const token = localStorage.getItem("TOKEN");
//   return {
//     Accept: "application/json",
//     "ngrok-skip-browser-warning": "true",
//     ...(token ? { Authorization:` Bearer ${token}` } : {}),
//   };
// };

// // -----------------------------------------------------------------------------
// // ✅ Request Interceptor – attach token automatically
// // -----------------------------------------------------------------------------


// // -----------------------------------------------------------------------------
// // ✅ GET request returning status + data
// // -----------------------------------------------------------------------------
// export const getRequestStatus = async <T>(
//   url: string,
//   headers?: Record<string, string>
// ): Promise<{ status: number; data: T | null }> => {
//   try {
//     const response: AxiosResponse<T> = await api.get<T>(url, {
//       headers: { ...(headers || {}) },
//     });
//     return { status: response.status, data: response.data };
//   } catch (error: any) {
//     const status = error?.response?.status || 500;
//     return { status, data: error?.response?.data || null };
//   }
// };


// // -----------------------------------------------------------------------------
// // ✅ GET request returning data only
// // -----------------------------------------------------------------------------
// export const getRequest = async <T>(
//   url: string,
// ): Promise<T> => {
//   try {
//     const response = await api.get<T>(url, { headers:{} });
//     return response.data;
//   } catch (error: any) {
//     console.error("GET request error:", error.response || error.message);
//     throw error;
//   }
// };

// // -----------------------------------------------------------------------------
// // ✅ POST request returning data only
// // -----------------------------------------------------------------------------


// // -----------------------------------------------------------------------------
// // ✅ POST request returning status + data
// // -----------------------------------------------------------------------------
// export const postRequestStatus = async <T>(
//   url: string,
//   data: any,
//   headers?: Record<string, string>
// ): Promise<{ status: number; data: T | null }> => {
//   try {
//     const response: AxiosResponse<T> = await api.post<T>(url, data, {
//       headers: {
//         "Content-Type": "application/json",
//         ...(headers || {}),
//       },
//     });
//     console.error("POST request error:", response);

//     return { status: response.status, data: response.data };
//   } catch (error: any) {
//     console.error("POST request error:", error.response || error.message);
//     return {
//       status: error?.response?.status || 500,
//       data: error?.response?.data || null,
//     };
//   }
// };

// export default api;


import axios, { AxiosResponse } from "axios";
import { showWarn } from "../services/toasterService";

// -----------------------------------------------------------------------------
// ✅ Create base Axios instance (no token auto attach)
// -----------------------------------------------------------------------------
const api = axios.create({
  baseURL: "/", // can be overridden dynamically
  headers: {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// -----------------------------------------------------------------------------
// ✅ Response Interceptor – handle global 401/403 cases
// -----------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    const noToken = error?.response?.data?.detail;
    const detail = error?.response?.data?.detail;
   

    if (status === 401 && message !== "Invalid credentials") {
      showWarn(detail ||  "Unauthorized access");
      setTimeout(() => {
        window.location.href = "/";
  }, 1500); // 2.5 seconds is enough      localStorage.removeItem("role_permissions");
      localStorage.setItem("MANUAL_SSO", "true");
      localStorage.removeItem("TOKEN");
      localStorage.removeItem("temp_password_value");
      localStorage.removeItem("USER_ID");
      localStorage.removeItem("ROLE_ID");
      localStorage.removeItem("ID_TOKEN");
    }

    if (status === 403 && noToken === "Not authenticated") {
      showWarn(noToken);
      window.location.href = "/";
      localStorage.removeItem("role_permissions");
      localStorage.setItem("MANUAL_SSO", "true");
      localStorage.removeItem("TOKEN");
      localStorage.removeItem("temp_password_value");
      localStorage.removeItem("USER_ID");
      localStorage.removeItem("ROLE_ID");
      localStorage.removeItem("ID_TOKEN");

    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// ✅ Helpers to manually get headers
// -----------------------------------------------------------------------------
const GetApiHeaders = async () => ({
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
});

const GetApiHeaders_token = async () => {
  const token = localStorage.getItem("TOKEN");
  return {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// -----------------------------------------------------------------------------
// ✅ GET request returning {status, data}
// -----------------------------------------------------------------------------
export const getRequestStatus = async <T>(
  url: string,
  headers?: Record<string, string>
): Promise<{ status: number; data: T | null }> => {
  const tokenHeaders = await GetApiHeaders_token();
  try {
    const response: AxiosResponse<T> = await api.get<T>(url, {
      headers: { ...tokenHeaders, ...(headers || {}) },
    });
    return { status: response.status, data: response.data };
  } catch (error: any) {
    const status = error?.response?.status || 500;
    return { status, data: error?.response?.data || null };
  }
};

// -----------------------------------------------------------------------------
// ✅ Unified POST with auto token
// -----------------------------------------------------------------------------
export const postRequestStatus = async <T>(
  url: string,
  data: any,
  headers?: Record<string, string>
): Promise<{ status: number; data: T | null }> => {
  const tokenHeaders = await GetApiHeaders_token();
  try {
    const response: AxiosResponse<T> = await api.post<T>(url, data, {
      headers: {
        "Content-Type": "application/json",
        ...tokenHeaders,
        ...(headers || {}),
      },
    });
    return { status: response.status, data: response.data };
  } catch (error: any) {
    console.error("POST request error:", error.response || error.message);
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || null,
    };
  }
};

// -----------------------------------------------------------------------------
// ✅ PUT with auto token
// -----------------------------------------------------------------------------
export const putRequestStatus = async <T>(
  url: string,
  data: any,
  headers?: Record<string, string>
): Promise<{ status: number; data: T | null }> => {
  const tokenHeaders = await GetApiHeaders_token();
  try {
    const response: AxiosResponse<T> = await api.put<T>(url, data, {
      headers: {
        "Content-Type": "application/json",
        ...tokenHeaders,
        ...(headers || {}),
      },
    });
    return { status: response.status, data: response.data };
  } catch (error: any) {
    console.error("PUT request error:", error.response || error.message);
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || null,
    };
  }
};

// -----------------------------------------------------------------------------
// ✅ DELETE with auto token
// -----------------------------------------------------------------------------
export const deleteRequestStatus = async <T>(
  url: string,
  data?: any,
  headers?: Record<string, string>
): Promise<{ status: number; data: T | null }> => {
  const tokenHeaders = await GetApiHeaders_token();
  try {
    const response: AxiosResponse<T> = await api.delete<T>(url, {
      headers: {
        "Content-Type": "application/json",
        ...tokenHeaders,
        ...(headers || {}),
      },
      data: data || {},
    });
    return { status: response.status, data: response.data };
  } catch (error: any) {
    console.error("DELETE request error:", error.response || error.message);
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || null,
    };
  }
};

export default api;
