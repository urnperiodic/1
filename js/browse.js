/* ============================================================
   Homepage logic: hero, rows, search, continue watching
   ============================================================ */

function ratingBadge(v) { return v ? `<span class="card-rating"><i class="fa-solid fa-star"></i>${v.toFixed(1)}</span>` : ''; }

function cardHTML(item) {
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  if (type !== 'movie' && type !== 'tv') return '';
  const title = item.title || item.name || 'Untitled';
  const date = item.release_date || item.first_air_date || '';
  const year = date ? date.slice(0, 4) : '';
  const img = TMDB.poster(item.poster_path, 'w342');
  const poster = img
    ? `<img loading="lazy" src="${img}" alt="${title}">`
    : `<div class="skeleton" style="width:100%;height:100%;display:grid;place-items:center;color:#555"><i class="fa-solid fa-film fa-2x"></i></div>`;
  return `
    <article class="card" data-id="${item.id}" data-type="${type}" tabindex="0">
      <div class="card-poster">
        ${poster}
        <span class="card-type">${type === 'tv' ? 'TV' : 'Movie'}</span>
        ${ratingBadge(item.vote_average)}
        <div class="play-overlay"><i class="fa-solid fa-circle-play"></i></div>
      </div>
      <div class="card-title">${title}</div>
      <div class="card-sub">${year}</div>
    </article>`;
}

function continueCardHTML(item) {
  const img = TMDB.poster(item.poster, 'w342');
  const pct = item.duration ? Math.min(100, (item.progress / item.duration) * 100) : 0;
  const sub = item.type === 'tv' && item.season ? `S${item.season} E${item.episode}` : (item.year || '');
  return `
    <article class="card" data-id="${item.id}" data-type="${item.type}" data-season="${item.season || ''}" data-episode="${item.episode || ''}" tabindex="0">
      <div class="card-poster">
        ${img ? `<img loading="lazy" src="${img}" alt="${item.title}">` : ''}
        <span class="card-type">${item.type === 'tv' ? 'TV' : 'Movie'}</span>
        <div class="play-overlay"><i class="fa-solid fa-circle-play"></i></div>
        ${pct > 1 ? `<div class="card-progress"><span style="width:${pct}%"></span></div>` : ''}
      </div>
      <div class="card-title">${item.title}</div>
      <div class="card-sub">${sub}</div>
    </article>`;
}

function navigateToWatch(id, type, season, episode) {
  let url = `watch.html?type=${type}&id=${id}`;
  if (type === 'tv') url += `&s=${season || 1}&e=${episode || 1}`;
  location.href = url;
}

function wireCards(scope) {
  scope.querySelectorAll('.card').forEach(card => {
    const go = () => navigateToWatch(card.dataset.id, card.dataset.type, card.dataset.season, card.dataset.episode);
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
}

async function buildRow(title, fetcher, container) {
  const section = document.createElement('section');
  section.className = 'row';
  section.innerHTML = `
    <div class="row-head"><h2>${title}</h2></div>
    <div class="row-scroller">${Array(7).fill('<div class="card"><div class="card-poster skeleton" style="height:252px"></div></div>').join('')}</div>`;
  container.appendChild(section);
  try {
    const data = await fetcher();
    const items = (data.results || []).filter(x => x.poster_path);
    section.querySelector('.row-scroller').innerHTML = items.map(cardHTML).join('') || '<p style="color:#888">Nothing here.</p>';
    wireCards(section);
  } catch (e) {
    section.querySelector('.row-scroller').innerHTML = '<p style="color:#888;padding:20px">Failed to load.</p>';
  }
}

async function buildHero() {
  const hero = document.getElementById('hero');
  try {
    const data = await TMDB.trending('all', 'week');
    const items = (data.results || []).filter(x => x.backdrop_path && (x.title || x.name));
    const pick = items[Math.floor(Math.random() * Math.min(5, items.length))];
    const type = pick.media_type || (pick.first_air_date ? 'tv' : 'movie');
    const title = pick.title || pick.name;
    const year = (pick.release_date || pick.first_air_date || '').slice(0, 4);
    hero.querySelector('.hero-bg').style.backgroundImage = `url(${TMDB.backdrop(pick.backdrop_path, 'original')})`;
    hero.querySelector('.hero-content').innerHTML = `
      <div class="hero-badge"><i class="fa-solid fa-fire"></i> Trending Now</div>
      <h1>${title}</h1>
      <div class="hero-meta">
        <span class="rating"><i class="fa-solid fa-star"></i> ${(pick.vote_average || 0).toFixed(1)}</span>
        <span>${year}</span>
        <span style="text-transform:uppercase">${type === 'tv' ? 'TV Series' : 'Movie'}</span>
      </div>
      <p class="hero-overview">${pick.overview || ''}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" id="hero-play"><i class="fa-solid fa-play"></i> Play</button>
        <button class="btn btn-ghost" id="hero-info"><i class="fa-solid fa-circle-info"></i> Details</button>
      </div>`;
    const go = () => navigateToWatch(pick.id, type, 1, 1);
    document.getElementById('hero-play').addEventListener('click', go);
    document.getElementById('hero-info').addEventListener('click', go);
  } catch (e) {
    hero.querySelector('.hero-content').innerHTML = `<h1>Welcome to StreamVerse</h1><p class="hero-overview">Browse thousands of movies and TV shows. Set your TMDB key in settings if content fails to load.</p>`;
  }
}

function buildContinueWatching(container) {
  const items = History.all();
  if (!items.length) return;
  const section = document.createElement('section');
  section.className = 'row';
  section.innerHTML = `
    <div class="row-head"><h2><i class="fa-solid fa-clock-rotate-left" style="color:var(--accent)"></i> Continue Watching</h2></div>
    <div class="row-scroller">${items.map(continueCardHTML).join('')}</div>`;
  container.prepend(section);
  wireCards(section);
}

/* ---------- Search ---------- */
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    timer = setTimeout(() => {
      if (q.length >= 2) location.href = `browse.html?q=${encodeURIComponent(q)}`;
    }, 600);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) location.href = `browse.html?q=${encodeURIComponent(input.value.trim())}`;
  });
}

/* ---------- Header scroll ---------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll); onScroll();
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) settingsBtn.addEventListener('click', () => window.openSettings());
}

document.addEventListener('DOMContentLoaded', async () => {
  // Only run the homepage builder when the hero/rows containers exist.
  if (!document.getElementById('hero') || !document.getElementById('rows')) return;
  buildSettingsDrawer();
  initHeader();
  initSearch();
  await buildHero();

  const rows = document.getElementById('rows');
  buildContinueWatching(rows);
  await buildRow('Trending This Week', () => TMDB.trending('all', 'week'), rows);
  await buildRow('Popular Movies', () => TMDB.popularMovies(), rows);
  await buildRow('Popular TV Shows', () => TMDB.popularTV(), rows);
  await buildRow('Now Playing in Theaters', () => TMDB.nowPlaying(), rows);
  await buildRow('Top Rated Movies', () => TMDB.topRatedMovies(), rows);
  await buildRow('Top Rated TV', () => TMDB.topRatedTV(), rows);
  await buildRow('Action & Adventure', () => TMDB.byGenre('movie', 28), rows);
  await buildRow('Comedy', () => TMDB.byGenre('movie', 35), rows);
  await buildRow('Sci-Fi', () => TMDB.byGenre('movie', 878), rows);
});
