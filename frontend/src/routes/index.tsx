import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/dashboard/Dashboard';
import Vehicles from '@/pages/vehicles/Vehicles';
import Drivers from '@/pages/drivers/Drivers';
import Trips from '@/pages/trips/Trips';
import Users from '@/pages/users/Users';
import PlaceholderPage from '@/components/PlaceholderPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import Maintenance from '@/pages/maintenance/Maintenance';
import FuelExpenses from '@/pages/fuel/FuelExpenses';
import Analytics from '@/pages/analytics/Analytics';
import Settings from '@/pages/settings/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'vehicles',
        element: <Vehicles />,
      },
      {
        path: 'drivers',
        element: <Drivers />,
      },
      {
        path: 'trips',
        element: <Trips />,
      },
      { path: 'users', element: <Users /> },
      { path: 'my-trips', element: <Trips /> },
      { path: 'maintenance', element: <Maintenance /> },
      { path: 'maintenance-requests', element: <Maintenance /> },
      { path: 'fuel', element: <FuelExpenses /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'safety-reports', element: <PlaceholderPage title="Safety Reports" description="Review incident logs and driver safety." /> },
      { path: 'profile', element: <PlaceholderPage title="My Profile" description="Update your personal details." /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
]);
