import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function MyPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && router && router.asPath === '/mypage' && router.query.from !== 'login') {
      // GETリクエストで直接アクセスされた場合はindex.jsへリダイレクト
      router.replace('/');
    }
  }, [router]);

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