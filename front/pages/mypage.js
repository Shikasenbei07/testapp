import Head from 'next/head';

export default function MyPage() {
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