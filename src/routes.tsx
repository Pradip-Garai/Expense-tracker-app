import type { ReactNode } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import FixedDeposits from './pages/FixedDeposits';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false,
  },
  {
    name: 'Signup',
    path: '/signup',
    element: <Signup />,
    visible: false,
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    element: <ForgotPassword />,
    visible: false,
  },
  {
    name: 'Dashboard',
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    visible: true,
  },
  {
    name: 'Transactions',
    path: '/transactions',
    element: (
      <ProtectedRoute>
        <Transactions />
      </ProtectedRoute>
    ),
    visible: true,
  },
  {
    name: 'Analytics',
    path: '/analytics',
    element: (
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    ),
    visible: true,
  },
  {
    name: 'Budgets',
    path: '/budgets',
    element: (
      <ProtectedRoute>
        <Budgets />
      </ProtectedRoute>
    ),
    visible: true,
  },
  {
    name: 'Goals',
    path: '/goals',
    element: (
      <ProtectedRoute>
        <Goals />
      </ProtectedRoute>
    ),
    visible: true,
  },
  {
    name: 'Fixed Deposits',
    path: '/fixed-deposits',
    element: (
      <ProtectedRoute>
        <FixedDeposits />
      </ProtectedRoute>
    ),
    visible: true,
  },
  {
    name: 'Reports',
    path: '/reports',
    element: (
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    ),
    visible: true,
  },
  {
    name: 'Profile',
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    visible: true,
  },
];

export default routes;
