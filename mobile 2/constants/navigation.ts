import { NavigationItem, RoleNavigation } from '../types';

export const roleNavigation: RoleNavigation = {
  retailer: {
    main: [
      { name: 'Dashboard', href: 'dashboard', icon: 'view-dashboard', exact: true },
      { name: 'Browse Products', href: 'products', icon: 'store', badge: '24' },
      { name: 'Browse Suppliers', href: 'suppliers', icon: 'trending-up' },
      { name: 'My Orders', href: 'orders', icon: 'package', badge: '5' },
      { name: 'Shopping Cart', href: 'cart', icon: 'cart', badge: '3' },
      { name: 'Analytics', href: 'analytics', icon: 'chart-bar' },
    ],
  },
  distributor: {
    main: [
      { name: 'Dashboard', href: 'dashboard', icon: 'view-dashboard', exact: true },
      { name: 'Manage Products', href: 'products', icon: 'package', badge: '12' },
      { name: 'Inventory', href: 'inventory', icon: 'warehouse', badge: 'Low Stock' },
      { name: 'Retailer Orders', href: 'orders', icon: 'cart', badge: '8' },
      { name: 'Delivery Management', href: 'delivery', icon: 'truck' },
      { name: 'Source Products', href: 'source', icon: 'factory', badge: 'New' },
      { name: 'Sales Analytics', href: 'analytics', icon: 'chart-bar' },
    ],
  },
  factory: {
    main: [
      { name: 'Dashboard', href: 'dashboard', icon: 'view-dashboard' },
      { name: 'Order Management', href: 'orders', icon: 'package', badge: '7' },
      { name: 'Distributor Partners', href: 'partners', icon: 'warehouse' },
      { name: 'Demand Forecast', href: 'forecast', icon: 'trending-up' },
      { name: 'Sales Reports', href: 'sales', icon: 'chart-bar' },
      { name: 'Inventory', href: 'inventory', icon: 'file-document' },
      { name: 'Announcements', href: 'announcements', icon: 'bell' },
    ],
  },
  driver: {
    main: [
      { name: 'Dashboard', href: 'dashboard', icon: 'view-dashboard' },
      { name: 'Active Deliveries', href: 'active', icon: 'truck', badge: '3' },
      { name: 'Delivery History', href: 'history', icon: 'package' },
      { name: 'Live Tracking', href: 'tracking', icon: 'map-marker' },
      { name: 'Route Management', href: 'routes', icon: 'map' },
      { name: 'Report Issues', href: 'issues', icon: 'alert', badge: '1' },
    ],
  },
  admin: {
    main: [
      { name: 'Dashboard', href: 'dashboard', icon: 'view-dashboard' },
      { name: 'User Management', href: 'users', icon: 'account-group', badge: '5' },
      { name: 'Supplier Approvals', href: 'approvals', icon: 'shield', badge: '3' },
      { name: 'Product Listings', href: 'products', icon: 'package' },
      { name: 'Order Oversight', href: 'orders', icon: 'cart' },
      { name: 'Dispute Management', href: 'disputes', icon: 'help', badge: '2' },
      { name: 'Platform Analytics', href: 'analytics', icon: 'chart-bar' },
      { name: 'System Settings', href: 'settings', icon: 'cog' },
      { name: 'Payment Monitoring', href: 'payments', icon: 'credit-card' },
    ],
  },
};

export const supportNavigation: NavigationItem[] = [
  { name: 'Messages', href: 'messages', icon: 'message', badge: '0' },
  { name: 'Notifications', href: 'notifications', icon: 'bell' },
  { name: 'Settings', href: 'settings', icon: 'cog' },
  { name: 'Help & Support', href: 'support', icon: 'help-circle' },
];