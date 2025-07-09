# SQLサーバの作成
1. [Azureポータル](https://portal.azure.com/)から「SQLサーバー」のページに移動
<a id="server_setting"></a>
2. 次の内容で新規作成する<br>
   **基本**
   - サブスクリプション：X-Garage-2
   - リソースグループ：X-Garage-Team-2025NE01
   - サーバ名：team1-testserverまたはteam1-productserver
   - 場所：(Asia Pacific) Japan East
   - 認証方法：SQL認証
   - サーバ管理者ログイン・パスワード：適当に決めてチーム内共有

   **ネットワーク**
   - ファイアウォール規則：はい

   **セキュリティ**
   - 変更なし

   **追加設定**
   - 変更なし

   **タグ**
   - 名前：プロジェクト名称
   - 値：新入社員研修

# データベースの作成
1. [Azureポータル](https://portal.azure.com/)から「SQLデータベース」のページに移動
2. 次の内容で新規作成する<br>
   **基本**
   - サブスクリプション：X-Garage-2
   - リソースグループ：X-Garage-Team-2025NE01
   - データベース名：team1-testdbまたはteam1-productdb
   - サーバ：team1-testserverまたはteam1-productserver
   - SQLエラスティックプールを使用：いいえ
   - ワークロード環境：開発
   - コンピューティングとストレージ：「データベースの構成」から「サービスレベル：Basic」、「データの最大サイズ：2GB」
   - バックアップストレージの冗長性：ローカル冗長バックアップストレージ

   **ネットワーク**
   - 現在のクライアントIPアドレスを追加：はい

   **セキュリティ**
   - Microsoft Defender for SQLを有効：後で

   **追加設定**
   - 既存のデータを使用：なし
   - 照合順序：Japanese_CI_AS（「照合順序を検出」から検索すると確実）

   **タグ**
   - 名前：プロジェクト名称
   - 値：新入社員研修

<a id="get_db_string"></a>
# データベース情報の確認
1. 作成したデータベースのリソースページに移動
2. 設定 -> 接続文字列 -> ODBCで表示される文字列をコピーしてメモ帳などに貼り付け
3. `your_password_here`の部分は[サーバ作成時](#server_setting)に決定した管理者パスワードに変える
