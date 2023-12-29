import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Divider, Stack, Button, TextField } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Iconify from '../components/iconify';
import { setUser } from '../redux/actions/userActions';
import store from '../redux/store';
import useAuth from '../auth/useAuth';

// ----------------------------------------------------------------------

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
});

// ----------------------------------------------------------------------

export default function LoginPage() {
  const mdUp = useResponsive('up', 'md');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // useAuth 훅을 통해 user, login, logout을 가져옴
  const { user, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      const credentials = {
        id,
        password,
      };
      const response = await axios.post('/api/login', credentials);
      // Check the response for success or failure
      if (response.data.success) {
        // Login successful
        console.log('Login successful. User:', response.data.user);
        login(response.data.user);
        setMessage('Login successful');
        console.log('넘어갑니다');
        navigate('/dashboard/home');
      } else {
        // Login failed
        console.error('Invalid credentials');
        setMessage('Invalid credentials');
      }
    } catch (error) {
      // Handle login error
      console.error('Error during login:', error);
      setMessage('Error during login');
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
            <Typography variant="h2" sx={{ px: 5, mt: 10, mb: 5 }}>
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
                label="Id"
                fullWidth
                variant="outlined"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
              <TextField
                label="Password"
                fullWidth
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button variant="contained" fullWidth size="large" color="primary" onClick={handleLogin}>
                Sign In
              </Button>
            </Stack>
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
