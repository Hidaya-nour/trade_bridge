import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import DashboardLayout from "@/components/layout/DashboardLayout";

/* =========================
   PUBLIC PAGES
========================= */

import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import ContactSupportPage from "./pages/ContactSupport";
import WorkspacesPage from "./pages/Workspaces";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";

import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import { AccountSuspendedPage } from "./pages/auth/AccountSuspended";

/* =========================
   RETAILER
========================= */

import RetailerDashboard from "./pages/retailer/Dashboard";
import ProductsPage from "./pages/retailer/Products";
import OrdersPage from "./pages/retailer/Order";
import CartPage from "./pages/retailer/Cart";
import CompareSuppliersPage from "./pages/retailer/CompareSuppliers";
import SupplierDirectoryPage from "./pages/retailer/SupplierDirectory";
import OrderDetailsPage from "./pages/retailer/OrderDetails";
import RetailerProductDetailPage from "./pages/retailer/ProductDetail";
import SupplierProfilePage from "./pages/retailer/SupplierProfile";

/* =========================
   DISTRIBUTOR
========================= */

import DistributorDashboard from "./pages/distributor/Dashboard";
import ManageProductsPage from "./pages/distributor/ManageProducts";
import IncomingOrdersPage from "./pages/distributor/IncomingOrders";
import DeliveryManagementPage from "./pages/distributor/DeliveryManagement";
import SalesAnalyticsPage from "./pages/distributor/SalesAnalytics";
import BroadcastPromotionsPage from "./pages/distributor/BroadcastPromotions";
import PurchaseOrdersPage from "./pages/distributor/PurchaseOrders";
import MarketPlace from "./pages/distributor/MarketPlace";
import DistributorOrderDetailsPage from "./pages/distributor/DistributorOrderDetails";
import DistributorProductDetailPage from "./pages/distributor/ProductDetails";
import DistributorMyProductDetailPage from "./pages/distributor/MyProductDetails";
import DistributorFactoryProfilePage from "./pages/distributor/FactoryProfile";

/* =========================
   FACTORY
========================= */

import FactoryDashboard from "./pages/factory/Dashboard";
import FactoryForecastPage from "./pages/factory/Forecast";
import BroadcastAnnouncementsPage from "./pages/factory/BroadcastAnnouncements";
import FactoryIncomingOrdersPage from "./pages/factory/IncomingOrders";
import FactoryOrderDetailsPage from "./pages/factory/FactoryOrderDetails";
import FactoryDistributorProfilePage from "./pages/factory/DistributorProfile";
import FactoryDeliveryPage from "./pages/factory/DeliveryManagement";
import FactoryMyProductDetailPage from "./pages/factory/ProductDetails";
import AgentsPage from "./pages/factory/Agents";

/* =========================
   ADMIN
========================= */

import AdminDashboard from "./pages/admin/dashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import AdminUserDetailsPage from "./pages/admin/UserDetailsPage";
import ProductListingsPage from "./pages/admin/ProductListingsPage";
import { VerificationsPage } from "./pages/admin/VerificationsPage";
import { DisputesManagementPage } from "./pages/admin/DisputesManagementPage";
import { ReportsPage } from "./pages/admin/AnalyticsPage";
import UserReportsManagementPage from "./pages/admin/UserReportsManagementPage";
import AdminOrderDetailsPage from "./pages/admin/AdminOrderDetailsPage";
import AdminWithdrawalsPage from "./pages/admin/AdminWithdrawalsPage";

/* =========================
   DRIVER
========================= */

import { DriverDashboard } from "./pages/driver/DashboardPage";
import DriverLiveTrackingPage from "./pages/driver/LiveTrackingPage";
import DriverIssuesPage from "./pages/driver/DriverIssuesPage";
import ActiveDeliveriesPage from "./pages/driver/DeliveriesPage";

/* =========================
   SHARED
========================= */

import HelpSupportPage from "./pages/shared/HelpSupport";
import SettingsPage from "./pages/shared/Settings";
import NotificationsPage from "./pages/shared/Notifications";
import MessagesPage from "./pages/shared/Messages";
import MyDisputesPage from "./pages/shared/MyDisputes";
import PaymentsPage from "./features/payment/Payments";
import SellerWalletPage from "./pages/shared/SellerWalletPage";
import OrderTrackingPage from "./pages/shared/OrderTracking";
import OrderReceiptPage from "./pages/shared/OrderReceipt";
import VerifyReceiptPage from "./pages/shared/VerifyReceipt";
import ExportReportsPage from "./pages/shared/ExportReports";
import RequestDriverPage from "./pages/shared/RequestDriver";
import { useAuthStore } from "./stores/auth.store";

/* =========================
   PROTECTED ROUTE
========================= */

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

function ProtectedRoute({ allowedRoles = [] }: ProtectedRouteProps) {
  const { user, accessToken } = useAuthStore();

  // Not logged in
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  // Suspended
  if (user.status === "suspended") {
    return <Navigate to="/account-suspended" replace />;
  }

  // Wrong role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

/* =========================
   APP
========================= */

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* =========================
              PUBLIC ROUTES
          ========================= */}

          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactSupportPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account-suspended" element={<AccountSuspendedPage />} />

          <Route
            path="/verify/receipt/:receiptNumber"
            element={<VerifyReceiptPage />}
          />

          {/* =========================
              SHARED AUTH ROUTES
          ========================= */}

          <Route element={<ProtectedRoute />}>
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<HelpSupportPage />} />
          </Route>

          {/* =========================
              RETAILER ROUTES
          ========================= */}

          <Route element={<ProtectedRoute allowedRoles={["retailer"]} />}>
            <Route path="/retailer/dashboard" element={<RetailerDashboard />} />

            <Route path="/retailer/products" element={<ProductsPage />} />

            <Route
              path="/retailer/products/:id"
              element={<RetailerProductDetailPage />}
            />

            <Route path="/retailer/orders" element={<OrdersPage />} />

            <Route path="/retailer/orders/:id" element={<OrderDetailsPage />} />

            <Route
              path="/retailer/orders/:id/request-driver"
              element={<RequestDriverPage />}
            />

            <Route
              path="/retailer/orders/:id/receipt"
              element={<OrderReceiptPage />}
            />

            <Route
              path="/retailer/tracking/:id"
              element={<OrderTrackingPage />}
            />

            <Route path="/retailer/cart" element={<CartPage />} />

            <Route
              path="/retailer/suppliers"
              element={<SupplierDirectoryPage />}
            />

            <Route
              path="/retailer/suppliers/:id"
              element={<SupplierProfilePage />}
            />

            <Route
              path="/retailer/supplier/:id"
              element={<SupplierProfilePage />}
            />

            <Route
              path="/retailer/compare"
              element={<CompareSuppliersPage />}
            />

            <Route
              path="/retailer/payments"
              element={<PaymentsPage role="retailer" />}
            />

            <Route
              path="/retailer/disputes"
              element={<MyDisputesPage role="retailer" />}
            />
          </Route>

          {/* =========================
              DISTRIBUTOR ROUTES
          ========================= */}

          <Route element={<ProtectedRoute allowedRoles={["distributor"]} />}>
            <Route
              path="/distributor/dashboard"
              element={<DistributorDashboard />}
            />

            <Route
              path="/distributor/products"
              element={<ManageProductsPage />}
            />

            <Route
              path="/distributor/products/add"
              element={<ManageProductsPage />}
            />

            <Route
              path="/distributor/products/:id"
              element={<DistributorProductDetailPage />}
            />

            <Route
              path="/distributor/my-products/:id"
              element={<DistributorMyProductDetailPage />}
            />

            <Route
              path="/distributor/browse-products"
              element={<MarketPlace />}
            />

            <Route path="/distributor/cart" element={<CartPage />} />

            <Route
              path="/distributor/orders"
              element={<IncomingOrdersPage />}
            />

            <Route
              path="/distributor/orders/:id"
              element={<DistributorOrderDetailsPage />}
            />

            <Route
              path="/distributor/orders/:id/request-driver"
              element={<RequestDriverPage />}
            />

            <Route
              path="/distributor/orders/:id/receipt"
              element={<OrderReceiptPage />}
            />

            <Route
              path="/distributor/tracking/:id"
              element={<OrderTrackingPage />}
            />

            <Route
              path="/distributor/purchase-orders"
              element={<PurchaseOrdersPage />}
            />

            <Route
              path="/distributor/purchase-orders/:id"
              element={<DistributorOrderDetailsPage />}
            />

            <Route
              path="/distributor/delivery"
              element={<DeliveryManagementPage />}
            />

            <Route
              path="/distributor/promotions"
              element={<BroadcastPromotionsPage />}
            />

            <Route
              path="/distributor/factories/:id"
              element={<DistributorFactoryProfilePage />}
            />

            <Route
              path="/distributor/analytics"
              element={<SalesAnalyticsPage />}
            />

            <Route
              path="/distributor/reports"
              element={<ExportReportsPage role="distributor" />}
            />

            <Route
              path="/distributor/payments"
              element={<PaymentsPage role="distributor" />}
            />

            <Route path="/distributor/wallet" element={<SellerWalletPage />} />

            <Route
              path="/distributor/disputes"
              element={<MyDisputesPage role="distributor" />}
            />
          </Route>

          {/* =========================
              FACTORY ROUTES
          ========================= */}

          <Route element={<ProtectedRoute allowedRoles={["factory"]} />}>
            <Route path="/factory/dashboard" element={<FactoryDashboard />} />

            <Route path="/factory/forecast" element={<FactoryForecastPage />} />

            <Route
              path="/factory/announcements"
              element={<BroadcastAnnouncementsPage />}
            />

            <Route path="/factory/products" element={<ManageProductsPage />} />

            <Route
              path="/factory/orders"
              element={<FactoryIncomingOrdersPage />}
            />

            <Route
              path="/factory/orders/:id"
              element={<FactoryOrderDetailsPage />}
            />

            <Route
              path="/factory/distributors/:id"
              element={<FactoryDistributorProfilePage />}
            />

            <Route
              path="/factory/orders/:id/receipt"
              element={<OrderReceiptPage />}
            />

            <Route
              path="/factory/tracking/:id"
              element={<OrderTrackingPage />}
            />

            <Route path="/factory/delivery" element={<FactoryDeliveryPage />} />

            <Route
              path="/factory/reports"
              element={<ExportReportsPage role="factory" />}
            />

            <Route
              path="/factory/my-products/:id"
              element={<FactoryMyProductDetailPage />}
            />

            <Route path="/factory/agents" element={<AgentsPage />} />

            <Route
              path="/factory/disputes"
              element={<MyDisputesPage role="factory" />}
            />

            <Route path="/factory/wallet" element={<SellerWalletPage />} />
          </Route>

          {/* =========================
              ADMIN ROUTES
          ========================= */}

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/users" element={<UserManagementPage />} />

            <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />

            <Route path="/admin/products" element={<ProductListingsPage />} />

            <Route
              path="/admin/orders/:id"
              element={<AdminOrderDetailsPage />}
            />

            <Route
              path="/admin/verifications"
              element={<VerificationsPage />}
            />

            <Route path="/admin/approvals" element={<VerificationsPage />} />

            <Route
              path="/admin/disputes"
              element={<DisputesManagementPage />}
            />

            <Route path="/admin/analytics" element={<ReportsPage />} />

            <Route
              path="/admin/user-reports"
              element={<UserReportsManagementPage />}
            />

            <Route
              path="/admin/withdrawals"
              element={<AdminWithdrawalsPage />}
            />
          </Route>

          {/* =========================
              DRIVER ROUTES
          ========================= */}

          <Route element={<ProtectedRoute allowedRoles={["driver"]} />}>
            <Route path="/driver/dashboard" element={<DriverDashboard />} />

            <Route
              path="/driver/tracking"
              element={<DriverLiveTrackingPage />}
            />

            <Route path="/driver/messages" element={<MessagesPage />} />

            <Route
              path="/driver/notifications"
              element={<NotificationsPage />}
            />

            <Route
              path="/driver/deliveries"
              element={<ActiveDeliveriesPage />}
            />

            <Route path="/driver/issues" element={<DriverIssuesPage />} />

            <Route
              path="/driver/active"
              element={<Navigate to="/driver/deliveries" replace />}
            />
          </Route>

          {/* =========================
              FALLBACK
          ========================= */}

          <Route path="*" element={<Navigate to="/" replace />} />
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
