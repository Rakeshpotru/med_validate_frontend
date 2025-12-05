// import { Bell, User } from 'lucide-react'
// import { cn } from './ui/utils'

// interface HeaderRightProps {
//   hasUnreadNotifications?: boolean
//   className?: string
// }

// export function HeaderRight({ hasUnreadNotifications = true, className }: HeaderRightProps) {
//   const baseButtonClass =
//     'relative flex h-8 w-8 items-center justify-center text-white transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer'

//   return (
//     <nav className={cn('flex items-center gap-4 text-white', className)}>
//       <button type="button" aria-label="AI Menu" className={baseButtonClass}>
//         <div className="grid h-6 w-6 grid-cols-3 grid-rows-3 gap-0.5">
//           {Array.from({ length: 9 }).map((_, idx) => {
//             if (idx === 4) {
//               return (
//                 <span
//                   key={idx}
//                   className="flex items-center justify-center text-[10px] font-semibold tracking-[0.12em]"
//                 >
//                   AI
//                 </span>
//               )
//             }

//             return <span key={idx} className="h-1.5 w-1.5 rounded-full bg-white" />
//           })}
//         </div>
//       </button>

//       <button type="button" aria-label="Notifications" className={baseButtonClass}>
//         <Bell className="h-5 w-5" />
//         {hasUnreadNotifications && (
//           <span className="absolute right-0 top-0 inline-flex h-2 w-2 rounded-full bg-red-500" />
//         )}
//       </button>

//       <button
//         type="button"
//         aria-label="Profile"
//         className={cn(baseButtonClass, 'rounded-full border-2 border-white')}
//       >
//         <User className="h-5 w-5" />
//       </button>
//     </nav>
//   )
// }

// export default HeaderRight



import React, { useEffect, useState, useRef } from "react";
import { Bell, X, LogOut, ChevronDown, Camera } from "lucide-react";
import { cn1 } from "../pages/ui/utils";
import { useNavigate } from "react-router-dom";
import { Api_url } from "../networkCalls/Apiurls";
import { showError, showSuccess } from "../services/toasterService";
import { deleteRequestStatus, getRequestStatus, postRequestStatus } from "../networkCalls/NetworkCalls";

interface HeaderRightProps {
  hasUnreadNotifications?: boolean;
  className?: string;
  onLogout?: () => void;
}

export function HeaderRight({
  hasUnreadNotifications = true,
  className,
  onLogout,
}: HeaderRightProps) {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("Member");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [profileImage, setProfileImage] = useState(""); // real saved image
  const [tempImage, setTempImage] = useState(""); // temporary preview
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🧠 Fetch user details
  useEffect(() => {
    const userId = localStorage.getItem("USER_ID");
    if (userId) fetchUserDetails(userId);
  }, []);

const fetchUserDetails = async (userId: string) => {
  try {
    // Get token-based headers
    // const headers = await GetApiHeaders_token();

    // Call standardized GET helper
    const res = await getRequestStatus<{ status_code: number; data: any }>(
      `${Api_url.GetUserById}/${userId}`
      
    );

    // Validate API response
    if (res?.data?.status_code === 200 && res?.data?.data) {
      const user = res.data.data;

      setUserName(user.user_name || "User");
      setUserEmail(user.email || "user@example.com");
      setUserRole(user.role_name || "Member");

      const imagePath = user.image_url
        ? `${Api_url.user_images}/${user.image_url}`
        : "";
      setProfileImage(imagePath);
    } else {
      console.warn("Unexpected response structure:", res);
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleLogout = () => {
    let idToken = localStorage.getItem("ID_TOKEN");

    if (idToken) {
      idToken = idToken.replace(/\s/g, "");
      const backendLogoutUrl = `${Api_url.OktaLogout}?id_token=${encodeURIComponent(idToken)}`;
      window.location.href = backendLogoutUrl;
    } else {
      navigate("/", { replace: true });
    }

    localStorage.removeItem("role_permissions");
    localStorage.setItem("MANUAL_SSO", "true");
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("temp_password_value");
    localStorage.removeItem("USER_ID");
    localStorage.removeItem("ROLE_ID");
    localStorage.removeItem("ID_TOKEN");

    onLogout?.();
  };

  // 📷 File selection
  const handleChangeProfile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ✅ Allow only image MIME types
    if (!file.type.startsWith("image/")) {
      showError("Only image files (JPG, PNG) are allowed.");
      setSelectedFile(null);
      setTempImage("");
      event.target.value = "";
      return;
    }

    // ✅ Limit file size
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      showError(`File size should not exceed ${maxSizeMB} MB.`);
      setSelectedFile(null);
      setTempImage("");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    // 👀 Show preview (not yet saved)
    const reader = new FileReader();
    reader.onload = () => setTempImage(reader.result as string);
    reader.readAsDataURL(file);
  };

 // 🗑️ Delete image from DB
const handleDeleteProfileImage = async () => {
  const userId = localStorage.getItem("USER_ID");
  if (!userId) {
    showError("User not found in local storage.");
    return;
  }

  try {
    const result = await deleteRequestStatus<{ status_code: number; message: string }>(
      `${Api_url.DeleteUserImage}/${userId}/delete-image`
    );

    if (result?.data?.status_code === 200) {
      setProfileImage("");
      setTempImage("");
      setSelectedFile(null);
      showSuccess(result.data.message || "Profile image deleted successfully!");
      fetchUserDetails(userId);
    } else {
      showError(result?.data?.message || "Failed to delete profile image.");
    }
  } catch (error) {
    console.error("❌ Error deleting profile image:", error);
    showError("Error deleting profile image. Please try again.");
  } finally {
    setShowEditModal(false);
  }
};

// 💾 Save image
const handleSaveProfileImage = async () => {
  if (!selectedFile) {
    showError("Please select an image first.");
    return;
  }

  const userId = localStorage.getItem("USER_ID");
  if (!userId) {
    showError("User not found in local storage.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    // ✅ Don't manually set Content-Type
    const result = await postRequestStatus<{ data: { image_url: string } }>(
      `${Api_url.UploadUserImage}/${userId}/upload-image`,
      formData,
      { "Content-Type": "multipart/form-data"} // leave headers empty, Axios will handle multipart
    );

    if (result.status === 200 && result?.data?.data?.image_url) {
      const imagePath = `${Api_url.user_images}/${result.data.data.image_url}`;
      setProfileImage(imagePath);
      showSuccess("Profile image updated successfully!");
      fetchUserDetails(userId);
    } else if (result.status === 401) {
      showError("Unauthorized: You are not allowed to upload this image.");
    } else {
      showError(result?.data?.message || "Failed to upload profile image.");
    }

    setShowEditModal(false);
    setSelectedFile(null);
    setTempImage("");

  } catch (error) {
    console.error("Error uploading profile image:", error);
    showError("Error uploading profile image. Please try again.");
  }
};



  // ❌ Close modal without saving
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedFile(null);
    setTempImage(""); // revert preview
  };

  // 🧩 Get initials fallback
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <nav className={cn1("flex items-center gap-3", className)}>
        {/* Notifications & AI */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer backdrop-blur-sm transition-all hover:bg-white/20">
          <div className="grid h-5 w-5 grid-cols-3 grid-rows-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, idx) =>
              idx === 4 ? (
                <span key={idx} className="flex items-center justify-center text-[9px] font-bold tracking-wider text-white">
                  AI
                </span>
              ) : (
                <span key={idx} className="h-1 w-1 rounded-full bg-white" />
              )
            )}
          </div>
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer backdrop-blur-sm transition-all hover:bg-white/20">
          <Bell className="h-5 w-5 text-white" />
          {hasUnreadNotifications && (
            <span className="absolute right-1 top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-white/20"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 rounded-lg bg-[#122783a1] backdrop-blur-sm px-3 py-1.5 border border-[#ffffff5c] group"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="relative h-7 w-7 rounded-full flex items-center justify-center text-white text-[12px] font-semibold">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="h-7 w-7 flex items-center justify-center rounded-full ring ring-white/20 bg-gradient-to-br from-blue-400 to-blue-600">
                  {getInitials(userName)}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn1(
                "h-5 w-5 text-white/70 group-hover:text-[#7a7a7a] transition-transform",
                showProfileDropdown && "rotate-180"
              )}
            />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 px-4 py-5 border-b border-gray-100 flex items-center gap-3">
                <div
                  className="relative h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold ring-4 ring-white shadow-lg cursor-pointer"
                  onClick={() => setShowEditModal(true)}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    getInitials(userName)
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{userName}</div>
                  <div className="text-sm text-gray-600 truncate">{userEmail}</div>
                  <div className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {userRole}
                  </div>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ✏️ Edit Profile Modal   */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile Picture</h2>
              <button
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                onClick={handleCloseEditModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold ring-4 ring-blue-100 shadow-xl mb-6">
                {(tempImage || profileImage) ? (
                  <img
                    src={tempImage || profileImage}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(userName)
                )}
              </div>

              <div className="flex gap-3 w-full mb-3">
                <button
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  onClick={handleChangeProfile}
                >
                  <Camera className="h-4 w-4 inline mr-2" /> Choose
                </button>
                <button
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  onClick={handleSaveProfileImage}
                >
                  Save
                </button>
              </div>

              {profileImage && (
                <button
                  className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
                  onClick={handleDeleteProfileImage}
                >
                  Remove
                </button>
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HeaderRight;
