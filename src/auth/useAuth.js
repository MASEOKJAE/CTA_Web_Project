import { useState, useRef } from 'react';
import axios from 'axios';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const refreshIntervalId = useRef(null);
  const JWT_EXPIRY_TIME = 3600000; // 토큰의 만료 시간을 설정. 이 예시에서는 1시간(3600000밀리초)로 설정


  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/login', credentials);
      if (response.data.success) {
        onLoginSuccess(response);
        return { success: true, message: '로그인 성공' };
      } else {
        console.error('잘못된 자격 증명');
        setUser(null);
        return { success: false, message: '아이디 혹은 비밀번호가 일치하지 않습니다.' };
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      setUser(null);
      return { success: false, message: '로그인 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
    if (refreshIntervalId.current) {
      clearInterval(refreshIntervalId.current); // 로그아웃 시에는 토큰 갱신 인터벌 해제
    }
  };

  const onLoginSuccess = (response) => {
    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // 토큰 갱신 인터벌 설정
    if (refreshIntervalId.current) {
      clearInterval(refreshIntervalId.current); // 기존 인터벌이 있다면 해제
    }
    refreshIntervalId.current = setInterval(onSilentRefresh, JWT_EXPIRY_TIME - 60000); // 토큰 만료 시간이 1시간이라면, 59분 후에 갱신 시도
  };

  const onSilentRefresh = async () => {
    try {
      const response = await axios.post('/silent-refresh', {
        token: localStorage.getItem('accessToken'),
      });
      onLoginSuccess(response); // 토큰 갱신에 성공하면 동일하게 처리
    } catch (error) {
      console.error('토큰 갱신 중 오류 발생:', error);
      logout();
      alert('세션이 만료되어 로그아웃 되었습니다. 다시 로그인해주세요.');
    }
  };

  return { user, login, logout };
}