// src/pages/LoginSuccess.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Api_url } from "../../../networkCalls/Apiurls";
import { showError } from "../../../services/toasterService";

const LoginSuccess: React.FC<{ onLogin?: (user: any, permissions?: any[]) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();

  const fetchRolePermissions = async (userId: number) => {
    try {
      const res = await axios.post(Api_url.getRolePermissions, { user_id: userId });
      if (res.data.status_code === 200) {
        const permissions = res.data.data?.screens || [];
        localStorage.setItem("role_permissions", JSON.stringify(permissions));
        return permissions;
      }
      return [];
    } catch (err) {
      console.warn("Failed to fetch role permissions:", err);
      return [];
    }
  };

useEffect(() => {
  const processSSOLogin = async () => {
    try {
      let token = localStorage.getItem("TOKEN");
      let idToken = localStorage.getItem("ID_TOKEN");
          console.log("Tokens from localStorage:", { token, idToken });


      if (!token || !idToken) {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get("token");
         idToken = urlParams.get("id_token");
               console.log("Tokens from URL params:", { token, idToken });

         if (!token || !idToken) {
            showError("SSO login failed: missing tokens");
            navigate("/", { replace: true });
            return;
          }

        localStorage.setItem("TOKEN", token);
        localStorage.setItem("ID_TOKEN", idToken);
        }


      const payload = JSON.parse(atob(token.split(".")[1]));
      const user = {
        id: payload.userId,
        email: payload.sub,
        role_id: payload.role_id,
        name: payload.name,
        role: payload.user_role,
      };
      localStorage.setItem("USER_ID", String(user.id));
      localStorage.setItem("ROLE_ID", String(user.role_id));

      const permissions = await fetchRolePermissions(user.id);

      onLogin?.(user, permissions);
      navigate("/project/all", { replace: true });
    } catch (err) {
      console.error("SSO processing failed:", err);
      showError("Failed to process SSO login");
      navigate("/", { replace: true });
    }
  };

  processSSOLogin();
}, [navigate]);

  return (
    <div className="text-center mt-20 text-gray-700">
      Logging in via SSO...
    </div>
  );
};

export default LoginSuccess;
