/* ============================================================
   Browse / Search page
   ============================================================ */

const bp = new URLSearchParams(location.search);
const MODE = {
  q: bp.get('q') || '',
  type: bp.get('type') || '',        // movie | tv
  trending: bp.get('trending') === '1',
  genre: bp.get('genre') || '',
  page: 1,
  loading: false,
  done: false,
  fetcher: null
};

function makeFetcher() {
  if (MODE.q) {
    MODE.title = `Results for “${MODE.q}”`;
    return (page) => TMDB.searchMulti(MODE.q, page);
  }
  if (MODE.trending) {
    MODE.title = 'Trending';
    return (page) => TMDB.trending('all', 'week');
  }
  if (MODE.genre && MODE.type) {
    MODE.title = (TMDB.GENRES[MODE.type] && TMDB.GENRES[MODE.type][MODE.genre]) || 'Browse';
    return (page) => TMDB.byGenre(MODE.type, MODE.genre, page);
  }
  if (MODE.type === 'tv') { MODE.title = 'TV Shows'; return (page) => TMDB.popularTV(page); }
  MODE.title = 'Movies';
  return (page) => TMDB.popularMovies(page);
}

function renderFilters() {
  const bar = document.getElementById('filter-bar');
  if (MODE.q || MODE.trending) { bar.style.display = 'none'; return; }
  const type = MODE.type === 'tv' ? 'tv' : 'movie';
  const genres = TMDB.GENRES[type];
  bar.innerHTML = `
    <a class="chip ${!MODE.genre ? 'active' : ''}" href="browse.html?type=${type}">All</a>
    ${Object.entries(genres).map(([id, name]) =>
      `<a class="chip ${MODE.genre == id ? 'active' : ''}" href="browse.html?type=${type}&genre=${id}">${name}</a>`).join('')}`;
}

async function loadMore() {
  if (MODE.loading || MODE.done) return;
  MODE.loading = true;
  const grid = document.getElementById('grid');
  try {
    const data = await MODE.fetcher(MODE.page);
    let items = (data.results || []).filter(x => x.poster_path);
    if (MODE.type && !MODE.q && !MODE.trending && !MODE.genre) {
      // already type-specific
    } else if (MODE.q) {
      items = items.filter(x => x.media_type === 'movie' || x.media_type === 'tv');
    }
    if (!items.length && MODE.page === 1) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-film"></i><p>No results found.</p></div>`;
      MODE.done = true; return;
    }
    grid.insertAdjacentHTML('beforeend', items.map(cardHTML).join(''));
    wireCards(grid);
    MODE.page++;
    if (MODE.trending || MODE.page > (data.total_pages || 1)) MODE.done = true;
  } catch (e) {
    if (MODE.page === 1) grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-triangle-exclamation"></i><p>Failed to load. Check your TMDB key in settings.</p></div>`;
    MODE.done = true;
  } finally {
    MODE.loading = false;
    document.getElementById('loader').style.display = MODE.done ? 'none' : 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildSettingsDrawer();
  document.getElementById('settings-btn').addEventListener('click', () => window.openSettings());

  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll); onScroll();

  // search box
  const input = document.getElementById('search-input');
  if (MODE.q) input.value = MODE.q;
  const goSearch = () => { if (input.value.trim()) location.href = `browse.html?q=${encodeURIComponent(input.value.trim())}`; };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') goSearch(); });

  MODE.fetcher = makeFetcher();
  document.getElementById('page-title').textContent = MODE.title;
  document.getElementById('page-sub').textContent = MODE.q ? 'Movies & TV shows' : (MODE.type === 'tv' ? 'Series' : 'Films');
  renderFilters();
  loadMore();

  // infinite scroll
  const io = new IntersectionObserver(entries => { if (entries[0].isIntersecting) loadMore(); }, { rootMargin: '600px' });
  io.observe(document.getElementById('loader'));
});
