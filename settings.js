/* ============================================================
   Streaming source providers
   ------------------------------------------------------------
   Each provider builds an embed URL given:
     - media type ('movie' | 'tv')
     - tmdb id
     - imdb id (optional, some providers prefer it)
     - season / episode (tv only)
     - options { color (hex w/o #), autoplay, muted, progress }
   ============================================================ */

const PROVIDERS = [
  {
    id: 'cinesrc',
    name: 'CineSrc',
    badge: 'HD',
    origin: 'https://cinesrc.st',
    events: 'cinesrc', // custom postMessage protocol prefix
    build({ type, tmdb, season, episode, opt }) {
      let base;
      if (type === 'movie') base = `https://cinesrc.st/embed/movie/${tmdb}`;
      else base = `https://cinesrc.st/embed/tv/${tmdb}`;
      const parts = [];
      if (type === 'tv') { parts.push(`s=${season}`); parts.push(`e=${episode}`); }
      if (opt.color) parts.push(`color=%23${opt.color}`);
      if (opt.autoplay === false) parts.push('autoplay=false');
      if (opt.muted) parts.push('muted=true');
      if (opt.progress) { parts.push(`t=${Math.floor(opt.progress)}`); parts.push('continueprompt=false'); }
      if (opt.autonext === false) parts.push('autonext=false');
      return parts.length ? `${base}?${parts.join('&')}` : base;
    }
  },
  {
    id: 'vidlink',
    name: 'VidLink',
    badge: 'Multi',
    origin: 'https://vidlink.pro',
    events: 'vidlink',
    build({ type, tmdb, season, episode, opt }) {
      let base;
      if (type === 'movie') base = `https://vidlink.pro/movie/${tmdb}`;
      else base = `https://vidlink.pro/tv/${tmdb}/${season}/${episode}`;
      const p = new URLSearchParams();
      if (opt.color) p.set('primaryColor', opt.color);
      p.set('autoplay', opt.autoplay === false ? 'false' : 'true');
      if (type === 'tv') p.set('nextbutton', 'true');
      if (opt.progress) p.set('startAt', Math.floor(opt.progress));
      const qs = p.toString();
      return qs ? `${base}?${qs}` : base;
    }
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    badge: 'Subs',
    origin: 'https://vidsrc-embed.ru',
    events: null,
    build({ type, tmdb, imdb, season, episode, opt }) {
      const idPart = tmdb;
      let base;
      if (type === 'movie') base = `https://vidsrc-embed.ru/embed/movie/${idPart}`;
      else base = `https://vidsrc-embed.ru/embed/tv?tmdb=${idPart}&season=${season}&episode=${episode}`;
      const p = new URLSearchParams();
      p.set('autoplay', opt.autoplay === false ? '0' : '1');
      if (type === 'tv') p.set('autonext', '1');
      const qs = p.toString();
      if (type === 'tv') return `${base}&${qs}`;
      return `${base}?${qs}`;
    }
  },
  {
    id: 'vidking',
    name: 'VidKing',
    badge: 'Fast',
    origin: 'https://www.vidking.net',
    events: 'vidking',
    build({ type, tmdb, season, episode, opt }) {
      let base;
      if (type === 'movie') base = `https://www.vidking.net/embed/movie/${tmdb}`;
      else base = `https://www.vidking.net/embed/tv/${tmdb}/${season}/${episode}`;
      const p = new URLSearchParams();
      if (opt.color) p.set('color', opt.color);
      p.set('autoPlay', opt.autoplay === false ? 'false' : 'true');
      if (type === 'tv') { p.set('nextEpisode', 'true'); p.set('episodeSelector', 'true'); }
      if (opt.progress) p.set('progress', Math.floor(opt.progress));
      const qs = p.toString();
      return qs ? `${base}?${qs}` : base;
    }
  }
];

function getProvider(id) {
  return PROVIDERS.find(p => p.id === id) || PROVIDERS[0];
}
