/* ============================================================
   TMDB API helper
   ------------------------------------------------------------
   Uses The Movie Database public API for metadata, posters,
   search, trending lists, season/episode data, etc.

   NOTE: TMDB requires an API key. The key below is a widely
   used public demo key. Users can replace it from the Settings
   panel (stored in localStorage) with their own free key from
   https://www.themoviedb.org/settings/api
   ============================================================ */

const TMDB = (() => {
  const DEFAULT_KEY = '8265bd1679663a7ea12ac168da84d2e8'; // public demo key
  const BASE = 'https://api.themoviedb.org/3';
  const IMG = 'https://image.tmdb.org/t/p';

  function key() {
    return localStorage.getItem('tmdb_key') || DEFAULT_KEY;
  }

  function setKey(k) {
    if (k && k.trim()) localStorage.setItem('tmdb_key', k.trim());
    else localStorage.removeItem('tmdb_key');
  }

  async function api(path, params = {}) {
    const url = new URL(BASE + path);
    url.searchParams.set('api_key', key());
    url.searchParams.set('language', 'en-US');
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    const res = await fetch(url);
    if (!res.ok) throw new Error('TMDB request failed: ' + res.status);
    return res.json();
  }

  // Image URL builders
  const poster = (p, size = 'w500') => p ? `${IMG}/${size}${p}` : null;
  const backdrop = (p, size = 'w1280') => p ? `${IMG}/${size}${p}` : null;
  const profile = (p, size = 'w185') => p ? `${IMG}/${size}${p}` : null;

  // Lists
  const trending = (media = 'all', window = 'week') =>
    api(`/trending/${media}/${window}`);
  const popularMovies = (page = 1) => api('/movie/popular', { page });
  const topRatedMovies = (page = 1) => api('/movie/top_rated', { page });
  const nowPlaying = (page = 1) => api('/movie/now_playing', { page });
  const upcoming = (page = 1) => api('/movie/upcoming', { page });
  const popularTV = (page = 1) => api('/tv/popular', { page });
  const topRatedTV = (page = 1) => api('/tv/top_rated', { page });
  const airingTV = (page = 1) => api('/tv/on_the_air', { page });

  const byGenre = (media, genreId, page = 1) =>
    api(`/discover/${media}`, { with_genres: genreId, sort_by: 'popularity.desc', page });

  // Search
  const searchMulti = (q, page = 1) => api('/search/multi', { query: q, page });

  // Details
  const movieDetails = (id) =>
    api(`/movie/${id}`, { append_to_response: 'credits,videos,recommendations,images' });
  const tvDetails = (id) =>
    api(`/tv/${id}`, { append_to_response: 'credits,videos,recommendations,images' });
  const seasonDetails = (id, season) => api(`/tv/${id}/season/${season}`);
  const externalIds = (media, id) => api(`/${media}/${id}/external_ids`);

  const GENRES = {
    movie: {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
      53: 'Thriller', 10752: 'War', 37: 'Western'
    },
    tv: {
      10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 10765: 'Sci-Fi & Fantasy',
      9648: 'Mystery', 10764: 'Reality', 10768: 'War & Politics'
    }
  };

  return {
    key, setKey, DEFAULT_KEY, poster, backdrop, profile,
    trending, popularMovies, topRatedMovies, nowPlaying, upcoming,
    popularTV, topRatedTV, airingTV, byGenre, searchMulti,
    movieDetails, tvDetails, seasonDetails, externalIds, GENRES
  };
})();
