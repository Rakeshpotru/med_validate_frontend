import React, { useState } from 'react';
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Api_url } from '../../../networkCalls/Apiurls';
import { showSuccess, showError } from '../../../services/toasterService';
import {  getRequestStatus, postRequestStatus } from '../../../networkCalls/NetworkCalls';


// Request payload for change password API
interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

// Response from backend (matches your FastAPI ChangePasswordResponse)
 interface ChangePasswordResponse {
  status_code: number;
  detail: string;
}

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState(localStorage.getItem('temp_password_value') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditingNewPassword, setIsEditingNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLongEnough = newPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const isValid = isLongEnough && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
   try {
      // const headers = await GetApiHeaders_token();

    const payload: ChangePasswordPayload = {
  old_password: oldPassword,
  new_password: newPassword,
  confirm_password: confirmPassword,
};


const { status, data } = await postRequestStatus<ChangePasswordResponse>(
  Api_url.changePassword,
  payload
  
);

      if (data?.status_code === 200) {
        showSuccess("Password updated successfully!");
        localStorage.removeItem("temp_password_value");
        // localStorage.removeItem("TOKEN");
        navigate("/login", { replace: true });
      } else {
        showError(data?.detail || "Failed to update password.");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      showError("An error occurred while updating password.");
    } finally {
      setLoading(false);
    }
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
           src="/images/change-password-videos.mp4"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className='relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-[110px_20px_75px_20px] shadow-2xl'>
        <div>
          <div  className="text-center">
            <img className="mx-auto h-12 w-auto mb-4" src="/images/Logo.png" />
            <div>
              <h1 className="text-2xl font-bold text-[#333] mb-2">Change Password</h1>
            </div>
            {/* Header */}
            {/* <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-12 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Change Password</h1>
              <p className="text-indigo-100">Update your password to continue</p>
            </div> */}
          </div>

          {/* Form */}
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Old Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none border-[#a9a9a9] focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter old password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showOld ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onFocus={() => setIsEditingNewPassword(true)}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none border-[#a9a9a9] focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {isEditingNewPassword && (
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Password must include:</p>
                    <ul className="ml-4 list-disc">
                      <li className={isLongEnough ? 'text-green-600' : 'text-red-600'}>12 characters</li>
                      <li className={hasUpper ? 'text-green-600' : 'text-red-600'}>1 uppercase letter</li>
                      <li className={hasLower ? 'text-green-600' : 'text-red-600'}>1 lowercase letter</li>
                      <li className={hasNumber ? 'text-green-600' : 'text-red-600'}>1 number</li>
                      <li className={hasSpecial ? 'text-green-600' : 'text-red-600'}>1 special character</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none border-[#a9a9a9] focus:border-indigo-500 transition-all duration-200"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full bg-gradient-to-r from-indigo-600 mt-[20px] to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
