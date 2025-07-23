export default function EventDeleteCompleteView() {
    return (
        <div className="event-delete-complete-container">
            <h1 className="event-delete-complete-title">イベント削除完了</h1>
            <p className="event-delete-complete-message">イベントの削除が完了しました。</p>
            <div className="event-delete-complete-links">
                <a href="/event/created" className="event-delete-link">
                    他のイベントを編集する
                </a>
                <a href="/mypage/drafts" className="event-delete-link">
                    下書きイベント一覧へ
                </a>
            </div>
            <style jsx>{`
                .event-delete-complete-container {
                    max-width: 600px;
                    margin: 2rem auto;
                    font-family: sans-serif;
                    text-align: center;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 4px 24px #0001;
                    padding: 2.5rem 1.5rem 2rem 1.5rem;
                }
                .event-delete-complete-title {
                    font-size: 2rem;
                    color: #1976d2;
                    margin-bottom: 1rem;
                }
                .event-delete-complete-message {
                    font-size: 1.1rem;
                    color: #333;
                    margin-bottom: 2.5rem;
                }
                .event-delete-complete-links {
                    margin-top: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.2em;
                }
                .event-delete-link {
                    color: #1976d2;
                    font-weight: bold;
                    text-decoration: none;
                    font-size: 1.08rem;
                    padding: 0.5em 1.2em;
                    border-radius: 6px;
                    transition: background 0.2s, color 0.2s;
                }
                .event-delete-link:hover {
                    background: #e3f2fd;
                    color: #0d47a1;
                }
            `}</style>
        </div>
    );
}