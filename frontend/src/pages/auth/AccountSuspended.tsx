import React from "react";
import { AccountSuspendedNotice } from "@/components/auth/AccountSuspendedNotice";

export const AccountSuspendedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AccountSuspendedNotice />
    </div>
  );
};

