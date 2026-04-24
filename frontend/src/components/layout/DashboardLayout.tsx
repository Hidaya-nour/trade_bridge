import React, { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { AccountSuspendedNotice } from "@/components/auth/AccountSuspendedNotice";
import { SupplierPaymentSetupBanner } from "@/components/supplier/SupplierPaymentSetupBanner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, fetchUser, accountBlocked } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    void fetchUser();

    const handleFocus = () => {
      void fetchUser();
    };

    window.addEventListener("focus", handleFocus);
    const interval = window.setInterval(() => {
      void fetchUser();
    }, 60000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(interval);
    };
  }, [user?.id, fetchUser]);

  if (accountBlocked?.code === "ACCOUNT_SUSPENDED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AccountSuspendedNotice />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Collapsible */}
      <aside className={cn(
        "fixed inset-y-0 left-0 hidden lg:flex flex-col border-r bg-card transition-all duration-300 z-30",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        <DashboardSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 flex flex-col border-r bg-card z-50 lg:hidden">
            <DashboardSidebar collapsed={false} />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        <DashboardHeader onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            <SupplierPaymentSetupBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
