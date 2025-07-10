import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function MyPage() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // ログイン状態をlocalStorageやcookie等で管理している場合はここでチェック
    const isLoggedIn =
      typeof window !== 'undefined' &&
      localStorage.getItem('isLoggedIn') === true;
    console.log('isLoggedIn:', isLoggedIn);

    // リダイレクト処理は行わず、チェックのみ
    setIsChecking(false);
  }, []);

  if (isChecking) {
    // ログインチェック中は何も表示しない
    return null;
  }

  return (
    <div>
      <Head>
        <title>My Page</title>
      </Head>
      <main>
        <h1>マイページ</h1>
        <p>ログイン成功！こちらはマイページです。</p>
      </main>
    </div>
  );
}