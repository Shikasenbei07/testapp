## テーブルUSERS
| id | email | second_email | tel | password | l_name | f_name | l_name_furi | f_name_furi | birthday |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 従業員番号 | メールアドレス | サブメールアドレス | 電話番号 | パスワード | 姓 | 名 | 姓のフリガナ | 名のフリガナ | 生年月日 |
| VARCHAR(4)/NOT NULL/PK | VARCHAR(100)/NOT NULL/ | VARCHAR(100) | INTEGER | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | VARCHAR(20)/NOT NULL/ | DATE |

## テーブルEVENTS
| event_id | event_title | event_category | event_datetime | deadline | location | max_participants | current_participants | creator | description | content | image | is_draft |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | --- |
| イベントID | イベントタイトル | イベントカテゴリ | イベント日時 | 申し込み締め切り日 | 場所 | 最大人数 | 現在人数 | 作成者id | 概要文字列 | 内容文字列 | 画像URL | 下書きフラグ(0=作成完了、1=下書き中) |
| INTEGER/AUTO_INCREMENT/NOT NULL/PK | VARCHAR(255) | INTEGER/REFERENCES CATEGORY(category_id) | DATETIME | DATETIME | VARCHAR(255) | INTEGER | INTEGER/DEFAULT 0 | VARCHAR(4)/NOT NULL/REFERENCES USERS(id) | VARCHAR(200) | VARCHAR(200) | VARCHAR(200) | TINYINT/NOT NULL/DEFAULT 1 |

## テーブルCATEGORYS
| category_id | category_name |
| ---- | ---- |
| カテゴリーID | カテゴリー名 |
| INTEGER/AUTO_INCREMENT/NOT NULL/PK | VARCHAR(100)/NOT NULL |

## テーブルKEYWORDS
| keyword_id | keyword_name |
| ---- | ---- |
| キーワードID | キーワード名 |
| INTEGER/AUTO_INCREMENT/NOT NULL/PK | VARCHAR(100)/NOT NULL |

## テーブルEVENTS_KEYWORDS
| event_id | keyword_id |
| ---- | ---- |
| イベントID | キーワードID |
| INTEGER/NOT NULL/REFERENCES EVENT(event_id)/PK | INTEGER/NOT NULL/REFERENCES KEYWORD(keyword_id)/PK |

## テーブルEVENTS_PARTICIPANTS
| event_id | id |
| ---- | ---- |
| イベントID | 参加者ID |
| INTEGER/NOT NULL/REFERENCES EVENT(event_id)/PK | VARCHAR(4)/NOT NULL/REFERENCES USERS(id)/PK |
