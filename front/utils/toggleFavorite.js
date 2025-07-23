export function toggleFavorite(favorites, eventId) {
  return favorites.includes(eventId)
    ? favorites.filter(id => id !== eventId)
    : [...favorites, eventId];
}