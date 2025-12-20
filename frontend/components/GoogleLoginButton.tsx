/// <reference types="vite/client" />
import React from "react";
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const GoogleLoginButton = () => {
  const handleSuccess = async (credentialResponse: CredentialResponse | null) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) {
        throw new Error("No credential returned from Google.");
      }
      const decoded = jwtDecode(token);
      console.log("Google user:", decoded);

      // Send token to your backend for verification
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        token,
      });

      // You can store the JWT from backend in localStorage
      localStorage.setItem("token", res.data.token);
      alert("Google Login Successful ✅");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex justify-center">
        <GoogleLogin onSuccess={handleSuccess} onError={() => console.log("Login Failed")} />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
