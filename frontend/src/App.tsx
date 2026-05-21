import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import MyDisputesPage from "./pages/shared/MyDisputes";
import CompareSuppliersPage from "./pages/retailer/CompareSuppliers";
import SupplierDirectoryPage from "./pages/retailer/SupplierDirectory";
import DistributorDashboard from "./pages/distributor/Dashboard";
import ManageProductsPage from "./pages/distributor/ManageProducts";
import IncomingOrdersPage from "./pages/distributor/IncomingOrders";
import FactoryIncomingOrdersPage from "./pages/factory/IncomingOrders";
import DeliveryManagementPage from "./pages/distributor/DeliveryManagement";
import FactoryDeliveryPage from "./pages/factory/DeliveryManagement";
import SalesAnalyticsPage from "./pages/distributor/SalesAnalytics";
import FactoryDashboard from "./pages/factory/Dashboard";
import BroadcastPromotionsPage from "./pages/distributor/BroadcastPromotions";
import BroadcastAnnouncementsPage from "./pages/factory/BroadcastAnnouncements";
import PurchaseOrdersPage from "./pages/distributor/PurchaseOrders";
import MarketPlace from "./pages/distributor/MarketPlace";
import FactoryForecastPage from "./pages/factory/Forecast";
import FactoryDistributorProfilePage from "./pages/factory/DistributorProfile";
import AdminDashboard from "./pages/admin/dashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import AdminUserDetailsPage from "./pages/admin/UserDetailsPage";
import ProductListingsPage from "./pages/admin/ProductListingsPage";
import { VerificationsPage } from "./pages/admin/VerificationsPage";
import { DisputesManagementPage } from "./pages/admin/DisputesManagementPage";
import { ReportsPage } from "./pages/admin/AnalyticsPage";
import UserReportsManagementPage from "./pages/admin/UserReportsManagementPage";
import AdminOrderDetailsPage from "./pages/admin/AdminOrderDetailsPage";
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
import DistributorFactoryProfilePage from "./pages/distributor/FactoryProfile";
import FactoryMyProductDetailPage from "./pages/factory/ProductDetails";
import AgentsPage from "./pages/factory/Agents";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import { AccountSuspendedPage } from "./pages/auth/AccountSuspended";
import OrderTrackingPage from "./pages/shared/OrderTracking";
import DriverLiveTrackingPage from "./pages/driver/LiveTrackingPage";
import DriverIssuesPage from "./pages/driver/DriverIssuesPage";
import ActiveDeliveriesPage from "./pages/driver/DeliveriesPage";
import OrderReceiptPage from "./pages/shared/OrderReceipt";
import VerifyReceiptPage from "./pages/shared/VerifyReceipt";
import ExportReportsPage from "./pages/shared/ExportReports";
import RequestDriverPage from "./pages/shared/RequestDriver";
import HomePage from "./pages/Home";
import NotificationsTab from "./components/setting/NotificationsTab";
import Notifications from "./pages/shared/Notifications";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";

function App() {
  return (
    <>
      <Router>
        <Routes>
         
          {/* Landing */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactSupportPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account-suspended" element={<AccountSuspendedPage />} />
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
            path="/retailer/orders/:id/request-driver"
            element={
              <DashboardLayout>
                <RequestDriverPage />
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
            path="/retailer/suppliers/:id"
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
            path="/retailer/disputes"
            element={
              <DashboardLayout>
                <MyDisputesPage role="retailer" />
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
            path="/distributor/orders/:id/request-driver"
            element={
              <DashboardLayout>
                <RequestDriverPage />
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
            path="/distributor/purchase-orders/:id/request-driver"
            element={
              <DashboardLayout>
                <RequestDriverPage />
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
            path="/distributor/factories/:id"
            element={
              <DashboardLayout>
                <DistributorFactoryProfilePage />
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
            path="/distributor/reports"
            element={
              <DashboardLayout>
                <ExportReportsPage role="distributor" />
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
            path="/distributor/disputes"
            element={
              <DashboardLayout>
                <MyDisputesPage role="distributor" />
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
            path="/factory/distributors/:id"
            element={
              <DashboardLayout>
                <FactoryDistributorProfilePage />
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
                <FactoryDeliveryPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/factory/reports"
            element={
              <DashboardLayout>
                <ExportReportsPage role="factory" />
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
            path="/factory/disputes"
            element={
              <DashboardLayout>
                <MyDisputesPage role="factory" />
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
            path="/admin/users/:id"
            element={
              <DashboardLayout>
                <AdminUserDetailsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/products"
            element={
              <DashboardLayout>
                <ProductListingsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <DashboardLayout>
                <AdminOrderDetailsPage />
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
            path="/admin/disputes"
            element={
              <DashboardLayout>
                <DisputesManagementPage />
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
            path="/admin/analytics"
            element={
              <DashboardLayout>
                <ReportsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/user-reports"
            element={
              <DashboardLayout>
                <UserReportsManagementPage />
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
            path="/driver/notifications"
            element={
              <DashboardLayout>
                <Notifications />
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
            path="/driver/messages"
            element={
              <DashboardLayout>
                <MessagesPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/driver/deliveries"
            element={
              <DashboardLayout>
                <ActiveDeliveriesPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/driver/active"
            element={<Navigate to="/driver/deliveries" replace />}
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
