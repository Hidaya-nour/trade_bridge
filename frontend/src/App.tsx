import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Temporary dashboard page
const DashboardPage = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">156</p>
        </div>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          <DashboardLayout>
            <DashboardPage />
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