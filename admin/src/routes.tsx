import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DishManage from './pages/DishManage';
import StoreManage from './pages/StoreManage';
import NewsManage from './pages/NewsManage';
import JobManage from './pages/JobManage';
import InquiryList from './pages/InquiryList';
import ApplicationList from './pages/ApplicationList';
import MessageList from './pages/MessageList';
import DishReservationManage from './pages/DishReservationManage';
import SiteConfig from './pages/SiteConfig';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'dishes', element: <DishManage /> },
          { path: 'stores', element: <StoreManage /> },
          { path: 'news', element: <NewsManage /> },
          { path: 'jobs', element: <JobManage /> },
          { path: 'inquiries', element: <InquiryList /> },
          { path: 'applications', element: <ApplicationList /> },
          { path: 'messages', element: <MessageList /> },
          { path: 'reservations', element: <DishReservationManage /> },
          { path: 'configs', element: <SiteConfig /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
