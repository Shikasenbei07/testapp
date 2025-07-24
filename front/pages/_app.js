import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import '../styles/global.css';
import { getValidId } from '../utils/getValidId';
import { refreshIdExpire } from '../utils/refreshIdExpire';
import Head from "next/head";

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

  useEffect(() => {
    const handler = (e) => {
      // 修正: e.targetがBUTTON要素かどうかを厳密に判定し、disabledなボタンは除外
      let el = e.target;
      // ボタン内のspanやsvgクリック時も親BUTTONを探す
      while (el && el !== document.body) {
        if (el.tagName === 'BUTTON' && !el.disabled) {
          refreshIdExpire();
          break;
        }
        el = el.parentElement;
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  const isLoginPage = router.pathname === '/login';

  return (
    <div>
      <Head>
        <link rel="icon" href="/img/logo.png" />
      </Head>
      <Header />
      <div>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;