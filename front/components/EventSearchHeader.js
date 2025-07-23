import EventSearchForm from "./EventSearchForm";

export default function EventSearchHeader({
  searchOpen,
  setSearchOpen,
  sortKey,
  setSortKey,
  sortOrder,
  setSortOrder,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedDate,
  setSelectedDate,
  keyword,
  setKeyword,
  hideExpired,
  setHideExpired,
  error,
}) {
  return (
    <div style={stickyHeaderStyle}>
      <h1 style={eventTitleStyle}>イベント一覧</h1>
      <button
        style={searchToggleButtonStyle}
        onClick={() => setSearchOpen(o => !o)}
        type="button"
      >
        {searchOpen ? "▲ 検索フォームを折りたたむ" : "▼ 検索フォームを開く"}
      </button>
      {searchOpen && (
        <EventSearchForm
          sortKey={sortKey}
          setSortKey={setSortKey}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          keyword={keyword}
          setKeyword={setKeyword}
          hideExpired={hideExpired}
          setHideExpired={setHideExpired}
          error={error}
        />
      )}
    </div>
  );
}

const stickyHeaderStyle = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: "#fff",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
};

const eventTitleStyle = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#1976d2"
};

const searchToggleButtonStyle = {
  marginBottom: "1rem",
  background: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "0.5rem 1.2rem",
  fontWeight: "bold",
  cursor: "pointer"
};