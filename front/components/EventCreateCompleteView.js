export default function EventCreateCompleteView() {
    return (
        <div style={containerStyle}>
            <h1>イベント作成完了</h1>
            <div style={linksStyle}>
                <a href="/event/create" style={linkStyle}>
                    別のイベントを作成する
                </a>
                <a href="/event" style={linkStyle}>
                    イベント一覧に戻る
                </a>
            </div>
        </div>
    );
}

const containerStyle = {
    maxWidth: 600,
    margin: "2rem auto",
    fontFamily: "sans-serif",
    textAlign: "center"
};

const linksStyle = {
    margin: "2rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
};

const linkStyle = {
    color: "#1976d2",
    fontWeight: "bold",
    textDecoration: "underline"
};