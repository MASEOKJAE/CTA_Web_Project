// DashboardLayout.js
import { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Button, Stack } from '@mui/material';
import useAuth from '../../auth/useAuth';

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
  const navigate = useNavigate();
  const { logout } = useAuth(); // useAuth 훅에서 user와 logout을 가져옴

  const handleLogout = async () => {
    try {
      logout(); // useAuth 훅에서 제공하는 logout 함수 호출
      navigate('/login'); // 로그아웃 후 로그인 페이지로 이동
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
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