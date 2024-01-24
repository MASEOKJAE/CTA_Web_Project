import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
// pages
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import ProductsPage from './pages/ProductsPage';
import CTAHome from './pages/CTAHome';
import FixHistory from './pages/RepairHistory';
import StateHistory from './pages/StateHistory';
import LoadingPage from './pages/LoadingPage'; // 로딩 페이지 컴포넌트 import
import useAuth from './auth/useAuth';

// ----------------------------------------------------------------------

export default function Router() {
  const { user, loading } = useAuth(); // useAuth 훅에서 loading 상태 가져오기

  const routes = useRoutes([
    {
      path: '/',
      element: user ? <Navigate to="/dashboard/home" replace /> : <Navigate to="/login" replace />,
      index: true,
    },
    {
      path: '/dashboard',
      element: user ? <DashboardLayout /> : <Navigate to="/login" replace />,
      children: [
        // { element: <Navigate to="/dashboard/home" />, index: true },
        { path: 'home', element: <CTAHome />, index: true },
        { path: 'fixhistory', element: <FixHistory /> },
        { path: 'statehistory', element: <StateHistory /> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
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

  if (loading) {
    return <LoadingPage />; // 로딩 중이면 로딩 페이지를 보여줍니다.
  }

  return routes;
}