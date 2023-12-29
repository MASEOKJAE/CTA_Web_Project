// DashboardLayout.js
import { useEffect } from 'react';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Button, Stack } from '@mui/material';
// import ctaLogo from '../../../public/assets/ctalogo.png';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/actions/userActions';
import { useNavigate } from 'react-router-dom';

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

export default function DashboardLayout() {
  const isLoggedIn = useSelector((state) => state.user !== null);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not logged in
    if (!isLoggedIn && location.pathname !== '/login') {
      // You can dispatch an action here to handle the redirection or any other logic
      // dispatch(yourAction());
      // For now, let's redirect using Navigate
      navigate('/login');
    }
    // Add your other conditions or logic as needed
  }, [isLoggedIn, location.pathname]);

  const handleLogout = () => {
    // Dispatch the action to logout
    dispatch(logoutUser());
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <StyledRoot>
      <Main>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Link to="/dashboard/home">
            <Logo src="/assets/ctalogo.png" alt="CTA Logo" />
          </Link>
          <Button onClick={handleLogout}>로그아웃</Button>
        </Stack>
        <Outlet />
      </Main>
    </StyledRoot>
  );
}