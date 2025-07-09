import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function MyPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginName = localStorage.getItem('login_name');
      if (loginName) {
        setName(loginName);
      } else {
        // ログイン情報がなければトップへリダイレクト
        router.replace('/');
      }
    }
  }, [router]);

  return (
    <div style={{
      background: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: '#fff',
        padding: '2em',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '300px'
      }}>
        <h2>マイページ</h2>
        <div style={{ fontSize: '1.2em', marginTop: '1em' }}>
          {name ? `ようこそ${name}さん` : 'ログイン情報がありません'}
        </div>
      </div>
    </div>
  );
}