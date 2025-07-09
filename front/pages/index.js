import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:7071/api/login_trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // 名前だけ抽出してlocalStorageに保存
        const name = data.message.replace(/^ようこそ(.+)さん$/, '$1');
        if (typeof window !== 'undefined') {
          localStorage.setItem('login_name', name);
        }
        router.push('/mypage');
      } else {
        setMessage(data.error || 'ログインに失敗しました');
      }
    } catch (err) {
      setMessage('通信エラーが発生しました');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>ログイン</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>ログイン</h1>
        <form onSubmit={handleLogin} style={{ width: '300px', margin: '2em auto' }}>
          <input
            type="text"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5em', marginBottom: '1em' }}
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5em', marginBottom: '1em' }}
          />
          <button type="submit" style={{ width: '100%', padding: '0.7em', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px' }}>
            ログイン
          </button>
        </form>
        {message && (
          <div style={{ color: message.includes('ようこそ') ? 'green' : 'red', textAlign: 'center' }}>{message}</div>
        )}
      </main>
    </div>
  );
}
