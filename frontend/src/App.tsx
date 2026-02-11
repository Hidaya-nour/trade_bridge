import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RetailerDashboard from "./pages/retailer/Dashboard";
import ProductsPage from "./pages/retailer/Products";
import OrdersPage from "./pages/retailer/Order";
import CartPage from "./pages/retailer/Cart";


function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard Routes */}
        <Route path="/retailer/dashboard" element={
          <DashboardLayout>
            <RetailerDashboard />
          </DashboardLayout>
        } />
        <Route path="/retailer/products" 
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
        {/* Add more dashboard routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;