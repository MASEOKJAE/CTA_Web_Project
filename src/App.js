// App.js
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ThemeProvider from './theme';
import ScrollToTop from './components/scroll-to-top';
import Router from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider>
          <ScrollToTop />
          <Router />
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}