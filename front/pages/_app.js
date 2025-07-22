import { useEffect } from 'react';
import { useRouter } from 'next/router';
import MyIcon from '../components/MyIcon';
import Header from '../components/Header';
import '../styles/global.css';
import { getValidId } from '../utils/getValidId';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const publicPaths = ['/login'];
    if (publicPaths.includes(router.pathname)) return;

    const id = getValidId();
    if (!id) {
      router.replace('/login');
    }
  }, [router.pathname]);

  const isLoginPage = router.pathname === '/login';

  return (
    <>
      <Header />
      <div>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;