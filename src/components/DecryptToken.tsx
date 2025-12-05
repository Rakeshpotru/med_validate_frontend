// ✅ DecryptToken.tsx
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;        // email
  userId: number;
  role_id: number;
  name: string;
  user_role: string;
  exp: number;
  iat: number;
}

const DecodedTokenValues = () => {
  try {
    const token = localStorage.getItem("TOKEN");
    if (!token) {
      console.warn("No token found in localStorage");
      return {
        user_id: null,
        user_name: null,
        user_role_id: null,
        user_role_name: null,
        user_email: null,
      };
    }

    const decoded = jwtDecode<DecodedToken>(token);

    return {
      user_id: decoded.userId,
      user_name: decoded.name,
      user_role_id: decoded.role_id,
      user_role_name: decoded.user_role,
      user_email: decoded.sub,
    };
  } catch (error) {
    console.error("Token decode failed:", error);
    return {
      user_id: null,
      user_name: null,
      user_role_id: null,
      user_role_name: null,
      user_email: null,
    };
  }
};

export default DecodedTokenValues;
