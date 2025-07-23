import { useState } from 'react';
import SideMenu from '../components/SideMenu';
import MyIcon from '../components/MyIcon';
import TisHeader from '../components/TisHeader';
import '../styles/global.css';

function MyApp({ Component, pageProps, router }) {
  const [open, setOpen] = useState(false);

  // サイドメニューを表示しないパス一覧
  const hideSideMenuPaths = ['/login'];

  const showSideMenu = !hideSideMenuPaths.includes(router.pathname);

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <TisHeader />
      {showSideMenu && <SideMenu open={open} setOpen={setOpen} />}
      {showSideMenu && <MyIcon />}
      <div style={{ marginLeft: showSideMenu && open ? 180 : 0, transition: 'margin-left 0.2s' }}>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;