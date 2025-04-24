import '../styles/globals.css';
import UtmProvider from '../components/UtmManager';

function MyApp({ Component, pageProps }) {
  return (
    <UtmProvider>
      <Component {...pageProps} />
    </UtmProvider>
  );
}

export default MyApp; 