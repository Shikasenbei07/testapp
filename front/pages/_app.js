import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SideMenu from '../components/SideMenu';
import MyIcon from '../components/MyIcon';
import '../styles/global.css';
import { getValidId } from '../utils/getValidId';

function MyApp({ Component, pageProps }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // サイドメニューを表示しないパス一覧
  const hideSideMenuPaths = ['/login'];

  const showSideMenu = !hideSideMenuPaths.includes(router.pathname);

  useEffect(() => {
    // ログインページやパブリックページは除外したい場合はここで判定
    const publicPaths = ['/login'];
    if (publicPaths.includes(router.pathname)) return;

    const id = getValidId();
    if (!id) {
      router.replace('/login');
    }
  }, [router.pathname]);

  return (
    <>
      {showSideMenu && <SideMenu open={open} setOpen={setOpen} />}
      {showSideMenu && <MyIcon />}
      <div style={{ marginLeft: showSideMenu && open ? 180 : 0, transition: 'margin-left 0.2s' }}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;