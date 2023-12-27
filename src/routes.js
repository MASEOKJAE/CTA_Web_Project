import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
// pages
import BlogPage from './pages/BlogPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import ProductsPage from './pages/ProductsPage';
import CTAHome from './pages/CTAHome';
import FixHistory from './pages/RepairHistory';
import StateHistory from './pages/StateHistory';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        // { element: <Navigate to="/dashboard/home" />, index: true },
        { path: 'home', element: <CTAHome />, index: true },
        { path: 'fixhistory', element: <FixHistory /> },
        { path: 'statehistory', element: <StateHistory /> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
      ],
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '*',
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/home" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
  ]);

  return routes;
}
