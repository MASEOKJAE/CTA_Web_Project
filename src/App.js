// App.js
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ThemeProvider from './theme';
import ScrollToTop from './components/scroll-to-top';
import Router from './routes';
import useAuth from './auth/useAuth'; // useAuth 훅 import

export default function App() {
  const { user, logout } = useAuth(); // useAuth 훅 사용

  return (
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider>
          <ScrollToTop />
          <Router user={user} logout={logout} /> {/* Router에 user와 logout 전달 */}
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}