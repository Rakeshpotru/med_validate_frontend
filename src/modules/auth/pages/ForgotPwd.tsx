import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../../components/PasswordInput";
import { showError, showSuccess } from "../../../services/toasterService";
import { Api_url } from "../../../networkCalls/Apiurls";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { validateEmail } from "../../../services/validationService";

const ForgotPwd: React.FC = () => {
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const timerRef = useRef<number | null>(null);
  const [newshowPassword, setNewShowPassword] = useState<boolean>(false);
  const [confirmshowPassword, setConfirmShowPassword] = useState<boolean>(false);

  const [isEditingNewPassword, setIsEditingNewPassword] = useState(false);
  const [isLongEnough, setIsLongEnough] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const navigate = useNavigate();

  const isValid =
    isLongEnough && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{12,}$/;

  // OTP timer
  useEffect(() => {
    if (step === "otp") {
      setTimer(600);
      timerRef.current = window.setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            showError("OTP expired. Please request a new one.");
            setOtp("");
            setStep("email");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setIsEditingNewPassword(true);
    setIsLongEnough(value.length >= 12);
    setHasUpper(/[A-Z]/.test(value));
    setHasLower(/[a-z]/.test(value));
    setHasNumber(/[0-9]/.test(value));
    setHasSpecial(/[\W_]/.test(value));
    setPasswordsMatch(value === confirmPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setPasswordsMatch(newPassword === value);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === "email") {
        if (!email.trim() || !validateEmail(email)) {
          showError("Please Enter a Valid Email.");
          setLoading(false);
          return;
        }

        const res = await axios.post(Api_url.forgotPassword, { email });
        showSuccess(res.data.message || "OTP sent to your email.");
        if (res.data.user_id) setUserId(res.data.user_id);
        setStep("otp");
      } else if (step === "otp") {
        if (!otp.trim()) {
          showError("OTP is required.");
          setLoading(false);
          return;
        }

        const res = await axios.post(Api_url.verifyOtp, { otp, user_id: userId });
        showSuccess(res.data.message || "OTP verified.");
        setStep("password");
      } else if (step === "password") {
        if (!newPassword.trim() || !passwordRegex.test(newPassword)) {
          showError("Password Must contain 12 characters.");
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          showError("Passwords do not match.");
          setLoading(false);
          return;
        }

        await axios.post(Api_url.resetPassword, {
          user_id: userId,
          new_password: newPassword,
          confirm_password: confirmPassword,
        });

        showSuccess("Password reset successfully.");
        navigate("/login");
      }
    } catch (err: any) {
      showError(err?.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackBtn = () => {
    if (step === "otp") {
      setStep("email");
      return
    }
    if (step === "password") {
      setStep("email");
      return
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/images/change-password-videos.mp4"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className='relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-[60px_14px_60px_14px] shadow-2xl'>
        {step !== "email" &&
          <div className="absolute left-[50px] top-[20px]">
            <button
              type="button"
              onClick={() => handleBackBtn()}
              className="text-blue-500 hover:underline cursor-pointer"
            >
             <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        }


        <div className="text-center mt-[20px]">
          <h1 className="text-2xl font-bold text-[#333] mb-2">{step === "email" ? "Email Verification" : step === "otp" ? "Verify OTP" : "Create Password"} </h1>
        </div>

        {/* Form */}
        <div className="p-4">
          <form className="space-y-6" onSubmit={handleUpdate}>
            {/* Email */}
            {step === "email" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 border rounded-xl focus:outline-none border-[#a9a9a9] focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter your email"
                  autoComplete="username"
                />
              </div>
            )}

            {/* OTP */}
            {step === "otp" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setOtp(e.target.value);
                  }}
                  className="w-full pl-4 pr-4 py-3 border rounded-xl focus:outline-none border-[#a9a9a9] focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter OTP"
                />
                <div className="flex justify-between item-center">
                  <div className="text-gray-500 mt-1 text-sm">
                    Time remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="mt-1">
                    <a className="text-sm text-blue-500 cursor-pointer hover:underline">Resend Otp</a>
                  </div>
                </div>
              </div>
            )}

            {/* New Password */}
            {step === "password" && (
              <>
                <div className="relative">
                  <label>New Password</label>
                  <input
                    type={newshowPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setNewShowPassword(!newshowPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {newshowPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {isEditingNewPassword && (
                  <div className="password-requirements text-sm mt-2">
                    <ul>
                      <li className={isLongEnough ? "text-green-600" : "text-red-600"}>12 characters</li>
                      <li className={hasUpper ? "text-green-600" : "text-red-600"}>1 upper case letter</li>
                      <li className={hasLower ? "text-green-600" : "text-red-600"}>1 lower case letter</li>
                      <li className={hasNumber ? "text-green-600" : "text-red-600"}>1 number</li>
                      <li className={hasSpecial ? "text-green-600" : "text-red-600"}>1 special character</li>
                      <li className={passwordsMatch ? "text-green-600" : "text-red-600"}>Passwords match</li>
                    </ul>
                  </div>
                )}
                <div className="relative">
                  <label>Confirm Password</label>
                  <input
                    type={confirmshowPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmShowPassword(!confirmshowPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {confirmshowPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || (step === "email" && !email.trim()) || (step === "otp" && !otp.trim()) || (step === "password" && !isValid)}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {step === "email" ? "Send OTP" : step === "otp" ? "Verify OTP" : "Update Password"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPwd;
