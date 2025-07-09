## テーブルUSERS
| id | email | second_email | tel | password | l_name | f_name | l_name_furi | f_name_furi | birthday |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 従業員番号 | メールアドレス | サブメールアドレス | 電話番号 | パスワード | 姓 | 名 | 姓のフリガナ | 名のフリガナ | 生年月日 |
| VARCHAR(4)/NOT NULL/PK | VARCHAR(100)/NOT NULL/ | VARCHAR(100) | INTEGER | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | DATE |

## テーブルEVENT
| event_id | event_title | event_category | event_datetime | deadline | location | max | current | creator | description | content | image |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| イベントID | イベントタイトル | イベントカテゴリ | イベント日時 | 申し込み締め切り日 | 場所 | 最大人数 | 現在人数 | 作成者id | 概要 | 内容 | 画像URL |
| INT AUTO_INCREMENT NOT NULL PK | VARCHAR(255) NOT NULL | VARCHAR(100) | DATETIME | DATETIME | VARCHAR(255) | INT | INT DEFAULT 0 | VARCHAR(4)/NOT NULL | VARCHAR(500) | VARCHAR(500) | VARCHAR(500) |
