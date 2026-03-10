import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RetailerDashboard from "./pages/retailer/Dashboard";
import ProductsPage from "./pages/retailer/Products";
import OrdersPage from "./pages/retailer/Order";
import CartPage from "./pages/retailer/Cart";
import HelpSupportPage from "./pages/shared/HelpSupport";
import SettingsPage from "./pages/shared/Settings";
import NotificationsPage from "./pages/shared/Notifications";
import MessagesPage from "./pages/shared/Messages";
import CompareSuppliersPage from "./pages/retailer/CompareSuppliers";
import SupplierDirectoryPage from "./pages/retailer/SupplierDirectory";
import DistributorDashboard from "./pages/distributor/Dashboard";
import ManageProductsPage from "./pages/distributor/ManageProducts";
import IncomingOrdersPage from "./pages/distributor/IncomingOrders";
import DeliveryManagementPage from "./pages/distributor/DeliveryManagement";
import SalesAnalyticsPage from "./pages/distributor/SalesAnalytics";
import SupplierPartnershipsPage from "./pages/distributor/SupplierPartnerships";
import FactoryDashboard from "./pages/factory/Dashboard";
import BroadcastPromotionsPage from "./pages/distributor/BroadcastPromotions";
import BroadcastAnnouncementsPage from "./pages/factory/BroadcastAnnouncements";
import PurchaseOrdersPage from "./pages/distributor/PurchaseOrders";
import MarketPlace from "./pages/distributor/MarketPlace";
import ProductionAnalyticsPage from "./pages/factory/ProductionAnalytics";
import FactoryDistributorPartnersPage from "./pages/factory/DistributorPartners";
import AdminDashboard from "./pages/admin/dashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import VerificationsPage from "./pages/admin/VerificationsPage";
import { DisputesManagementPage } from "./pages/admin/DisputesManagementPage";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { DriverDashboard } from "./pages/driver/DashboardPage";
import PaymentsPage from "./components/shared/Payments";
import DistributorOrderDetailsPage from "./pages/distributor/DistributorOrderDetails";
import OrderDetailsPage from "./pages/retailer/OrderDetails";
import RetailerProductDetailPage from "./pages/retailer/ProductDetail";
import SupplierProfilePage from "./pages/retailer/SupplierProfile";
import { RegisterPage } from "./pages/auth/Register";
import { LoginPage } from "./pages/auth/Login";
import { useAuthStore } from "./stores/auth.store";
import { Toaster } from "react-hot-toast";
import DistributorProductDetailPage from "./pages/distributor/ProductDetails";
import DistributorMyProductDetailPage from "./pages/distributor/MyProductDetails";
import FactoryMyProductDetailPage from "./pages/factory/ProductDetails";

function App() {
  // const { accessToken, fetchUser } = useAuthStore();

  // useEffect(() => {
  //   if (accessToken) {
  //     fetchUser();
  //   }
  // }, [accessToken]);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Dashboard Routes */}
          <Route
            path="/retailer/dashboard"
            element={
              <DashboardLayout>
                <RetailerDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/products"
            element={
              <DashboardLayout>
                <ProductsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/products/:id"
            element={
              <DashboardLayout>
                <RetailerProductDetailPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/cart"
            element={
              <DashboardLayout>
                <CartPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/orders"
            element={
              <DashboardLayout>
                <OrdersPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/messages"
            element={
              <DashboardLayout>
                <MessagesPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <DashboardLayout>
                <NotificationsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/support"
            element={
              <DashboardLayout>
                <HelpSupportPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/suppliers"
            element={
              <DashboardLayout>
                <SupplierDirectoryPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/compare"
            element={
              <DashboardLayout>
                <CompareSuppliersPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/dashboard"
            element={
              <DashboardLayout>
                <DistributorDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/products"
            element={
              <DashboardLayout>
                <ManageProductsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/products/add"
            element={
              <DashboardLayout>
                <ManageProductsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/browse-products"
            element={
              <DashboardLayout>
                <MarketPlace />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/cart"
            element={
              <DashboardLayout>
                <CartPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/orders"
            element={
              <DashboardLayout>
                <IncomingOrdersPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/purchase-orders"
            element={
              <DashboardLayout>
                <PurchaseOrdersPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/purchase-orders/:id"
            element={
              <DashboardLayout>
                <DistributorOrderDetailsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/delivery"
            element={
              <DashboardLayout>
                <DeliveryManagementPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/promotions"
            element={
              <DashboardLayout>
                <BroadcastPromotionsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/partners"
            element={
              <DashboardLayout>
                <SupplierPartnershipsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/analytics"
            element={
              <DashboardLayout>
                <SalesAnalyticsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/dashboard"
            element={
              <DashboardLayout>
                <FactoryDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/announcements"
            element={
              <DashboardLayout>
                <BroadcastAnnouncementsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/products"
            element={
              <DashboardLayout>
                <ManageProductsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/orders"
            element={
              <DashboardLayout>
                <IncomingOrdersPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/analytics"
            element={
              <DashboardLayout>
                <ProductionAnalyticsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/partners"
            element={
              <DashboardLayout>
                <FactoryDistributorPartnersPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <DashboardLayout>
                <UserManagementPage />
              </DashboardLayout>
            }
          />
          {/* <Route path="/admin/users/:userId" element={<UserDetailPage />} /> */}
          // In your router configuration
          <Route
            path="/admin/verifications"
            element={
              <DashboardLayout>
                <VerificationsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/dispute"
            element={
              <DashboardLayout>
                <DisputesManagementPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/report"
            element={
              <DashboardLayout>
                <ReportsPage />
              </DashboardLayout>
            }
          />
          <Route path="/admin/approvals" element={<VerificationsPage />} />{" "}
          <Route
            path="/driver/dashboard"
            element={
              <DashboardLayout>
                <DriverDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/orders/:id"
            element={
              <DashboardLayout>
                <OrderDetailsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/supplier/:id"
            element={
              <DashboardLayout>
                <SupplierProfilePage />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/payments"
            element={
              <DashboardLayout>
                <PaymentsPage role="retailer" />
              </DashboardLayout>
            }
          />
          // Distributor routes
          <Route
            path="/distributor/orders/:id"
            element={
              <DashboardLayout>
                <DistributorOrderDetailsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/payments"
            element={
              <DashboardLayout>
                <PaymentsPage role="distributor" />
              </DashboardLayout>
            }
          />
          {/* Distributor routes - buying from factories */}
          <Route
            path="/distributor/products/:id"
            element={
              <DashboardLayout>
                <DistributorProductDetailPage />
              </DashboardLayout>
            }
          />
          {/* Distributor routes - managing their own products */}
          <Route
            path="/distributor/my-products/:id"
            element={
              <DashboardLayout>
                <DistributorMyProductDetailPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/my-products/:id"
            element={
              <DashboardLayout>
                <FactoryMyProductDetailPage />
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </>
  );
}

export default App;
