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
import FactoryProductsPage from "./pages/distributor/FactoryProducts";
import IncomingOrdersPage from "./pages/distributor/IncomingOrders";
import FactoryOrdersPage from "./pages/distributor/FactoryOrders";
import BroadcastPromotionsPage from "./pages/distributor/BroadcastPromotions";
import DeliveryManagementPage from "./pages/distributor/DeliveryManagement";

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
              <FactoryProductsPage />
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
          path="/distributor/factory-orders"
          element={
            <DashboardLayout>
              <FactoryOrdersPage />
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
      </Routes>
    </Router>
  );
}

export default App;
