import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RetailerDashboard from "./pages/retailer/Dashboard";


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
        <Route path="/products" element={
          <DashboardLayout>
            <div>Products Page</div>
          </DashboardLayout>
        } />
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