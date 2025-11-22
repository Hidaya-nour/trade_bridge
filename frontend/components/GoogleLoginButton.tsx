import React, { useEffect } from "react";
import axios from "axios";

declare global {
  interface Window {
    google: any;
  }
}

const GoogleLoginButton: React.FC = () => {
  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      console.log("Google ID token:", response.credential);
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        token: response.credential,
      });
      console.log("Backend response:", res.data);
      alert(`Logged in as: ${res.data.name}`);
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error);
    }
  };
useEffect(() => {
  if (!window.google) return;

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("VITE_GOOGLE_CLIENT_ID not set!");
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredentialResponse,
  });

  window.google.accounts.id.renderButton(
    document.getElementById("googleSignInDiv"),
    { theme: "outline", size: "large" }
  );

  window.google.accounts.id.prompt();
}, []);


  return <div id="googleSignInDiv" style={{ marginTop: "20px" }}>button</div>;
};

export default GoogleLoginButton;
