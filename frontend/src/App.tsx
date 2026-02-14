import React from "react";
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
import FactoryProductsPage from "./pages/distributor/MarketPlace";
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
import AdminDashboard from "./pages/admin/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
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
          path="/distributor/factory-products"
          element={
            <DashboardLayout>
              <MarketPlace />
            </DashboardLayout>
          }
        />

        <Route
          path="/distributor/factory-cart"
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
      </Routes>
    </Router>
  );
}

export default App;
