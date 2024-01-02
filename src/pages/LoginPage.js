import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/system';
import { Container, Typography, Stack, Button, TextField, CircularProgress } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import useAuth from '../auth/useAuth';

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

const Logo = styled('img')({
  maxWidth: 350,
  maxHeight: 350,
  cursor: 'pointer',
  marginLeft: '30px',
});

export default function LoginPage() {
  const mdUp = useResponsive('up', 'md');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user, login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    const credentials = {
      username,
      password,
    };
    const loginResult = await login(credentials); // 로그인 성공 여부와 메시지 받기
    setLoading(false);
    if (loginResult.success) { // 로그인 성공 시 홈 화면으로 이동
      console.log('로그인에 성공했습니다!', user);
      navigate('/dashboard/home');
    } else {
      console.error(loginResult.message);
    }
  };
  

  return (
    <>
      <Helmet>
        <title> CTA | Login </title>
      </Helmet>

      <StyledRoot>
        {mdUp && (
          <StyledSection>
            <Logo src="/assets/ctalogo.png" alt="CTA Logo" />
            <Typography variant="h2" sx={{ px: 3, mt: 10, mb: 5 }}>
              CTA 설비 관리 시스템
            </Typography>
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom>
              CTA 로그인
            </Typography>

            <Stack spacing={2} sx={{ mt: 3 }}>
              <TextField
                label="사용자 이름"
                fullWidth
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="비밀번호"
                fullWidth
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                variant="contained"
                fullWidth
                size="large"
                color="primary"
                onClick={handleLogin}
                disabled={loading} // 로딩 중에는 버튼 비활성화
              >
                {loading ? <CircularProgress size={24} /> : '로그인'}
              </Button>
            </Stack>
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}