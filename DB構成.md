## テーブルUSERS
| id | email | second_email | tel | password | l_name | f_name | l_name_furi | f_name_furi | birthday |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 従業員番号 | メールアドレス | サブメールアドレス | 電話番号 | パスワード | 姓 | 名 | 姓のフリガナ | 名のフリガナ | 生年月日 |
| VARCHAR(4)/NOT NULL/PK | VARCHAR(100)/NOT NULL/ | VARCHAR(100) | INTEGER | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | DATE |

## テーブルEVENT
| event_id | event_title | event_category | event_datetime | deadline | location | max | current | creator | description | content | image |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| イベントID | イベントタイトル | イベントカテゴリ | イベント日時 | 申し込み締め切り日 | 場所 | 最大人数 | 現在人数 | 作成者id | 概要 | 内容 | 画像URL |
| INTEGER/AUTO_INCREMENT/NOT NULL/PK | VARCHAR(255) | INTEGER/REFERENCES CATEGORY(category_id) | DATETIME | DATETIME | VARCHAR(255) | INTEGER | INTEGER/DEFAULT 0 | VARCHAR(4)/NOT NULL/REFERENCES USERS(id) | VARCHAR(500) | VARCHAR(500) | VARCHAR(500) |

## テーブルCATEGORY
| category_id | category_name |
| ---- | ---- |
| カテゴリーID | カテゴリー名 |
| INTEGER/AUTO_INCREMENT/NOT NULL/PK | VARCHAR(100)/NOT NULL |

## テーブルKEYWORD
| keyword_id | keyword_name |
| ---- | ---- |
| キーワードID | キーワード名 |
| INTEGER/AUTO_INCREMENT/NOT NULL/PK | VARCHAR(100)/NOT NULL |

## テーブルEVENT_KEYWORD
| event_id | keyword_id |
| ---- | ---- |
| イベントID | キーワードID |
| INTEGER/NOT NULL/REFERENCES EVENT(event_id)/PK | INTEGER/NOT NULL/REFERENCES KEYWORD(keyword_id)/PK |

## テーブルEVENT_PARTICIPANT
| event_id | id |
| ---- | ---- |
| イベントID | 参加者ID |
| INTEGER/NOT NULL/REFERENCES EVENT(event_id)/PK | VARCHAR(4)/NOT NULL/REFERENCES USERS(id)/PK |
