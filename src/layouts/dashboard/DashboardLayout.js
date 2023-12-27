// DashboardLayout.js
import { useEffect, useState } from 'react';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Button, Stack } from '@mui/material';
import { createBrowserHistory } from 'history'; // Import the history library
import ctaLogo from './cta_logo.png';
import { useAuth } from './AuthContext';

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const StyledRoot = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const Main = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const Logo = styled('img')({
  marginRight: 16,
  maxHeight: 80,
  cursor: 'pointer',
});

const history = createBrowserHistory(); // Create a history object

export default function DashboardLayout() {
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Redirect to login if not logged in
    if (!isLoggedIn && location.pathname !== '/login') {
      history.replace('/login');
    }
    else{
      history.replace('/dashboard/home');
    }
  }, [isLoggedIn, location.pathname]);

  const handleLogout = () => {
    logout();
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <StyledRoot>
      <Main>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Link to="/dashboard/home">
            <Logo src={ctaLogo} alt="CTA Logo" />
          </Link>
          <Button onClick={handleLogout}>로그아웃</Button>
        </Stack>
        <Outlet />
      </Main>
    </StyledRoot>
  );
}
