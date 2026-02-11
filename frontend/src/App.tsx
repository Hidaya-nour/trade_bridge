import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RetailerDashboard from "./pages/retailer/Dashboard";
import ProductsPage from "./pages/retailer/Products";


function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
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
        <Route path="/orders" element={
          <DashboardLayout>
            <div>Orders Page</div>
          </DashboardLayout>
        } />
        {/* Add more dashboard routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;