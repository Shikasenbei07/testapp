import Link from 'next/link';

export default function SideMenu({ open, setOpen }) {
  const menuItems = [
    { href: '/event', label: 'イベント一覧' },
    { href: '/event/create', label: 'イベント作成' },
    { href: '/event/created', label: 'イベント編集' },
    { href: '/mypage/reservation', label: '参加予約一覧' },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1001,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
        aria-label="メニュー"
      >
        <span style={{ display: 'block', width: 20, height: 2, background: '#333', margin: '6px auto' }} />
        <span style={{ display: 'block', width: 20, height: 2, background: '#333', margin: '6px auto' }} />
        <span style={{ display: 'block', width: 20, height: 2, background: '#333', margin: '6px auto' }} />
      </button>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: open ? 0 : '-180px',
          width: 180,
          height: '100%',
          background: '#fff',
          borderRight: '1px solid #ccc',
          transition: 'left 0.2s',
          zIndex: 1000,
          paddingTop: 60,
          pointerEvents: open ? 'auto' : 'none',
        }}
        aria-hidden={!open}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li
              key={item.href}
              style={{
                margin: '1em',
                position: 'relative',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.querySelector('.underline').style.width = '70%'; // ← ここを短く
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector('.underline').style.width = '0';
              }}
            >
              <Link
                href={item.href}
                style={{
                  color: '#000',
                  textDecoration: 'none',
                  position: 'relative',
                  zIndex: 1,
                }}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
              <span
                className="underline"
                style={{
                  display: 'block',
                  position: 'absolute',
                  left: 0,
                  bottom: -2,
                  height: '2px',
                  width: 0,
                  background: '#7f5af0',
                  transition: 'width 0.3s',
                  zIndex: 0,
                }}
              />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}