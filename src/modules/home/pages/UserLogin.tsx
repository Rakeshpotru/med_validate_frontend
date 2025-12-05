import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Api_url } from "../../../networkCalls/Apiurls";
import { showError, showSuccess, showWarn } from "../../../services/toasterService";
import {  postRequestStatus } from "../../../networkCalls/NetworkCalls";

interface Res {
  access_token: string
  email: string

  message: string

  name: string
  password_expired: boolean
  remaining_attempts: number | null
  status_code: number

  temp_password: boolean

  token_type: string

  user_id: number

  user_role: string

  role_id?: number
}
const UserLogin: React.FC<{ onLogin?: (user: any, permissions?: any[]) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();

  const loginType: "normal" | "okta" =
    (import.meta.env.VITE_LOGIN_TYPE as "normal" | "okta") || "normal";

  // ----------------- State -----------------
  const [email, setEmail] = useState(localStorage.getItem("REMEMBER_EMAIL") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("REMEMBER_EMAIL"));
  const [submitting, setSubmitting] = useState(false);
  const [ssoLoading, setSSOLoading] = useState(false);
  const [manualSSO, setManualSSO] = useState(localStorage.getItem("MANUAL_SSO") === "true");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [passwordExpired, setPasswordExpired] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);

  // ----------------- Validation -----------------
  const validateForm = () => {
    if (!email.trim()) {
      showWarn("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showWarn("Please enter a valid email address");
      return false;
    }
    if (loginType === "normal" && !password.trim()) {
      showWarn("Password is required");
      return false;
    }
    return true;
  };

  // ----------------- Fetch Role Permissions -----------------
  const fetchRolePermissions = async (userId: number) => {
    try {

      // const tokenHeader = await GetApiHeaders_token();
      const result = await postRequestStatus<any>(Api_url.getRolePermissions, { user_id: userId });
      const apidata = result.data;
      if (apidata?.status_code === 200) {
        const permissions = apidata.data?.screens || [];
        localStorage.setItem("role_permissions", JSON.stringify(permissions));
        return permissions;
      }
      return [];
    } catch (err) {
      console.warn("Failed to fetch role permissions:", err);
      return [];
    }
  };

  // ----------------- Normal Login -----------------
  const handleNormalLogin = async () => {
    setSubmitting(true);
    setRemainingAttempts(null);
    setPasswordExpired(false);
    setAccountLocked(false);

    try {
      const payload = {
        user_email: email.trim().toLowerCase(),
        user_password: password.trim(),
      };
      // let header = await GetApiHeaders()

      const res = await postRequestStatus<Res>(Api_url.Login, payload);
      console.log("data for loging:", res);
      if (res.status === 200 && res.data) {
        // const { data } = await axios.post(Api_url.Login, payload);
        if (res?.data?.temp_password) {
          showWarn("Temporary password detected. Please reset your password.");
          localStorage.setItem("temp_password_value", password);
          localStorage.setItem("TOKEN", res?.data.access_token);
          navigate("/change-pwd", { replace: true });
          return;
        }

        if (res?.data.password_expired) {
          setPasswordExpired(true);
          showWarn("Your password has expired. Please update it.");
          navigate("/change-pwd", { replace: true });
          return;
        }


        localStorage.setItem("TOKEN", res?.data.access_token);
        localStorage.setItem("USER_ID", res?.data.user_id.toString());

        const decodeJWT = (token: string) => {
          try {
            const payload = token.split('.')[1]; // get payload part
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/')); // Base64URL → Base64
            return JSON.parse(decoded);
          } catch (err) {
            console.warn("Failed to decode JWT:", err);
            return null;
          }
        };

        const decodedToken = decodeJWT(res?.data.access_token);
        if (decodedToken?.role_id) {
          localStorage.setItem("ROLE_ID", decodedToken.role_id.toString());
        }
        if (rememberMe) localStorage.setItem("REMEMBER_EMAIL", email);
        else localStorage.removeItem("REMEMBER_EMAIL");
        // localStorage.setItem("password_value", password);


        const user = {
          id: res?.data.user_id,
          name: res?.data.name,
          email,
          role_id: res?.data?.role_id,
          role: res?.data?.user_role,
        };

        const permissions = await fetchRolePermissions(res?.data.user_id);
        onLogin?.({ ...user, permissions }, permissions);

        showSuccess("Login successfull.");
        navigate("project/all", { replace: true });
      }
      if (res.status === 401 && res.data) {
        showWarn("Please enter valid password.")
        setRemainingAttempts(res?.data?.remaining_attempts);
      }
      if (res.status === 403 && res.data) {
        if(res?.data?.message ==="Invalid credentials"){
        showWarn("Please enter valid Email Address.")

        }
        setRemainingAttempts(res?.data?.remaining_attempts);
        if (res?.data.message?.toLowerCase().includes("locked")) setAccountLocked(true);
      }
      if (res.status === 500) {
        showError("Something went wrong, please try again later.")
      }
    } catch (err: any) {
      const response = err?.response?.data;
      console.log("reamining attempts:",response);
      if (response?.remaining_attempts !== undefined)
        setRemainingAttempts(response.remaining_attempts);
      if (response?.message?.toLowerCase().includes("locked")) setAccountLocked(true);
      showError(response?.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------- SSO Login -----------------
  const handleSSOLogin = async () => {
    localStorage.removeItem("MANUAL_SSO"); // reset manual flag
    setSSOLoading(true);
    try {
      window.location.href = Api_url.LoginSSO;
    } finally {
      setSSOLoading(false);
    }
  };

  // ----------------- Auto-trigger for Okta only if not manual -----------------
  useEffect(() => {
    if (loginType === "okta" && !manualSSO) {
      handleSSOLogin();
    }
  }, [loginType, manualSSO]);

  // ----------------- Form Submit -----------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    handleNormalLogin();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/images/PixVerse_V5_Image_Text_360P_Application_manages.mp4"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-[110px_20px_75px_20px] shadow-2xl">
        <div className="text-center">
          <img className="mx-auto h-12 w-auto" src="/images/Logo.png" />
          {loginType === "normal" ? (
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage your verification lifecycle
            </p>
          ) : (
            <p className="mt-4 text-[16px] text-[#333] font-semibold">
              {manualSSO ? "Sign in with Okta" : "Redirecting to secure SSO login..."}
            </p>
          )}
        </div>

        {loginType === "normal" && (
          <>
            {remainingAttempts !== null && (
              <div className="text-yellow-600 mb-2">Remaining attempts: {remainingAttempts}</div>
            )}
            {passwordExpired && (
              <div className="text-orange-600 mb-2">Your password has expired. Please update it.</div>
            )}
            {accountLocked && (
              <div className="text-red-600 mb-2">Your account is locked. Please try again later.</div>
            )}


            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-pwd", { replace: true })}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group relative flex w-full justify-center rounded-lg bg-blue-600 py-3 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </>
        )}

        {/* {loginType === "okta" && manualSSO && ( */}
        <div className="mt-8">
          <button
            onClick={handleSSOLogin}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign in with Okta
          </button>
        </div>
        {/* )} */}
      </div>
    </div>
  );
};

export default UserLogin;






















