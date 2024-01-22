import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    setUser(accessToken);
    localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // 토큰 갱신 인터벌 설정
    if (refreshIntervalId.current) {
      clearInterval(refreshIntervalId.current); // 기존 인터벌이 있다면 해제
    }
    refreshIntervalId.current = setInterval(onSilentRefresh, JWT_EXPIRY_TIME / 2); // 토큰 만료 시간의 절반 정도에서 갱신을 시도
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

  // 애플리케이션 시작 시에 사용자 정보를 서버에서 불러오는 함수
  const loadUser = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setLoading(false);
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    try {
      const response = await axios.get('/api/user');
      setUser(response.data.user);
      setLoading(false);
      console.log('성공적으로 토큰 업데이트를 완료했습니다 (새로 고침)');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.error === 'Token expired') {
        logout(); // 토큰이 만료되었다면 로그아웃
        window.location.href = '/login'; // 로그인 페이지로 리디렉션
      }
    }
  }, []); // 의존성 배열, loadUser 함수가 의존하는 값들을 여기에 추가

  // 애플리케이션이 시작될 때 사용자 정보를 불러옵니다.
  useEffect(() => {
    loadUser();
  }, [loadUser]); // loadUser를 의존성 배열에 추가합니다.

  return { user, loading, login, logout };
}