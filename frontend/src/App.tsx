import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import ContactSupportPage from "./pages/ContactSupport";
import WorkspacesPage from "./pages/Workspaces";
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
import DistributorStockPage from "./pages/distributor/Stock";
import ManageProductsPage from "./pages/distributor/ManageProducts";
import IncomingOrdersPage from "./pages/distributor/IncomingOrders";
import FactoryIncomingOrdersPage from "./pages/factory/IncomingOrders";
import DeliveryManagementPage from "./pages/distributor/DeliveryManagement";
import SalesAnalyticsPage from "./pages/distributor/SalesAnalytics";
import FactoryDashboard from "./pages/factory/Dashboard";
import BroadcastPromotionsPage from "./pages/distributor/BroadcastPromotions";
import BroadcastAnnouncementsPage from "./pages/factory/BroadcastAnnouncements";
import PurchaseOrdersPage from "./pages/distributor/PurchaseOrders";
import MarketPlace from "./pages/distributor/MarketPlace";
import ProductionAnalyticsPage from "./pages/factory/ProductionAnalytics";
import FactoryForecastPage from "./pages/factory/Forecast";
import AdminDashboard from "./pages/admin/dashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import { VerificationsPage } from "./pages/admin/VerificationsPage";
import { DisputesManagementPage } from "./pages/admin/DisputesManagementPage";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { DriverDashboard } from "./pages/driver/DashboardPage";
import PaymentsPage from "./features/payment/Payments";
import DistributorOrderDetailsPage from "./pages/distributor/DistributorOrderDetails";
import FactoryOrderDetailsPage from "./pages/factory/FactoryOrderDetails";
import OrderDetailsPage from "./pages/retailer/OrderDetails";
import RetailerProductDetailPage from "./pages/retailer/ProductDetail";
import SupplierProfilePage from "./pages/retailer/SupplierProfile";
import { Toaster } from "react-hot-toast";
import DistributorProductDetailPage from "./pages/distributor/ProductDetails";
import DistributorMyProductDetailPage from "./pages/distributor/MyProductDetails";
import FactoryMyProductDetailPage from "./pages/factory/ProductDetails";
import AgentsPage from "./pages/factory/Agents";
import LandingLayout from "./components/landing/layout/LandingLayout";
import About from "./pages/landing/About";
import HowItWorks from "./pages/landing/HowItWorks";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import OrderTrackingPage from "./pages/shared/OrderTracking";
import DriverLiveTrackingPage from "./pages/driver/LiveTrackingPage";
import DriverNotificationsPage from "./pages/driver/DriverNotificationsPage";
import DriverProfilePage from "./pages/driver/DriverProfilePage";
import DriverIssuesPage from "./pages/driver/DriverIssuesPage";
import DriverHistoryPage from "./pages/driver/DriverHistoryPage";
import ActiveDeliveriesPage from "./pages/driver/ActiveDeliveriesPage";
import OrderReceiptPage from "./pages/shared/OrderReceipt";
import VerifyReceiptPage from "./pages/shared/VerifyReceipt";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route element={<LandingLayout />}>
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Route>

          {/* Landing */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactSupportPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/verify/receipt/:receiptNumber"
            element={<VerifyReceiptPage />}
          />
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
            path="/retailer/orders"
            element={
              <DashboardLayout>
                <OrdersPage />
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
            path="/retailer/orders/:id/receipt"
            element={
              <DashboardLayout>
                <OrderReceiptPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/retailer/tracking/:id"
            element={
              <DashboardLayout>
                <OrderTrackingPage />
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
            path="/distributor/stock"
            element={
              <DashboardLayout>
                <DistributorStockPage />
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
            path="/distributor/orders/:id"
            element={
              <DashboardLayout>
                <DistributorOrderDetailsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/orders/:id/receipt"
            element={
              <DashboardLayout>
                <OrderReceiptPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/tracking/:id"
            element={
              <DashboardLayout>
                <OrderTrackingPage />
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
            path="/distributor/purchase-orders/:id/receipt"
            element={
              <DashboardLayout>
                <OrderReceiptPage />
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
            path="/distributor/analytics"
            element={
              <DashboardLayout>
                <SalesAnalyticsPage />
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
          <Route
            path="/distributor/products/:id"
            element={
              <DashboardLayout>
                <DistributorProductDetailPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/distributor/my-products/:id"
            element={
              <DashboardLayout>
                <DistributorMyProductDetailPage />
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
            path="/factory/forecast"
            element={
              <DashboardLayout>
                <FactoryForecastPage />
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
                <FactoryIncomingOrdersPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/orders/:id"
            element={
              <DashboardLayout>
                <FactoryOrderDetailsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/orders/:id/receipt"
            element={
              <DashboardLayout>
                <OrderReceiptPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/tracking/:id"
            element={
              <DashboardLayout>
                <OrderTrackingPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/delivery"
            element={
              <DashboardLayout>
                <DeliveryManagementPage />
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
            path="/factory/my-products/:id"
            element={
              <DashboardLayout>
                <FactoryMyProductDetailPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/factory/agents"
            element={
              <DashboardLayout>
                <AgentsPage />
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
          <Route
            path="/admin/verifications"
            element={
              <DashboardLayout>
                <VerificationsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/approvals"
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

          <Route
            path="/driver/dashboard"
            element={
              <DashboardLayout>
                <DriverDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/driver/tracking"
            element={
              <DashboardLayout>
                <DriverLiveTrackingPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/driver/notifications"
            element={
              <DashboardLayout>
                <DriverNotificationsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/driver/active"
            element={
              <DashboardLayout>
                <ActiveDeliveriesPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/driver/history"
            element={
              <DashboardLayout>
                <DriverHistoryPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/driver/issues"
            element={
              <DashboardLayout>
                <DriverIssuesPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/driver/profile"
            element={
              <DashboardLayout>
                <DriverProfilePage />
              </DashboardLayout>
            }
          />
          <Route
            path="/support"
            element={
              <DashboardLayout>
                <ContactSupportPage />
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
