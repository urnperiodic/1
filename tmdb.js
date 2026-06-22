/* ============================================================
   Global settings (persisted in localStorage) + drawer UI
   ============================================================ */

const Settings = (() => {
  const KEY = 'streamsettings';
  const DEFAULTS = {
    color: 'e50914',     // hex w/o #
    autoplay: true,
    muted: false,
    defaultProvider: 'cinesrc'
  };

  function get() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
    catch { return { ...DEFAULTS }; }
  }
  function save(s) {
    localStorage.setItem(KEY, JSON.stringify({ ...get(), ...s }));
    applyTheme();
  }
  function applyTheme() {
    const s = get();
    document.documentElement.style.setProperty('--accent', '#' + s.color);
    // derive a soft tint
    const r = parseInt(s.color.slice(0, 2), 16);
    const g = parseInt(s.color.slice(2, 4), 16);
    const b = parseInt(s.color.slice(4, 6), 16);
    document.documentElement.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.15)`);
  }

  return { get, save, applyTheme, DEFAULTS };
})();

const SWATCHES = ['e50914', 'ff6b00', 'f5a623', '46d369', '00b4d8', '4361ee', '9146ff', 'e91e63', 'ffffff'];

function buildSettingsDrawer() {
  if (document.getElementById('settings-drawer')) return;
  const s = Settings.get();
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <aside class="drawer" id="settings-drawer" aria-label="Settings">
      <h3>Settings</h3>
      <p class="muted">Personalize the player and theme.</p>

      <div class="field">
        <label>Accent color</label>
        <div class="color-swatches" id="swatch-list">
          ${SWATCHES.map(c => `<button class="swatch ${c === s.color ? 'active' : ''}" data-color="${c}" style="background:#${c}" aria-label="color ${c}"></button>`).join('')}
        </div>
        <div style="margin-top:12px;display:flex;align-items:center;gap:10px">
          <input type="color" id="custom-color" value="#${s.color}" style="width:42px;height:36px;border:none;background:none;cursor:pointer">
          <span class="muted">Custom</span>
        </div>
      </div>

      <div class="field">
        <label>Default server</label>
        <select id="default-provider" class="season-select" style="width:100%">
          ${PROVIDERS.map(p => `<option value="${p.id}" ${p.id === s.defaultProvider ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>
      </div>

      <div class="field">
        <label>Playback</label>
        <div class="toggle-row">
          <span>Autoplay</span>
          <label class="switch"><input type="checkbox" id="opt-autoplay" ${s.autoplay ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <span>Start muted</span>
          <label class="switch"><input type="checkbox" id="opt-muted" ${s.muted ? 'checked' : ''}><span class="slider"></span></label>
        </div>
      </div>

      <form class="field" autocomplete="off" onsubmit="return false">
        <label>TMDB API key (optional)</label>
        <input type="password" id="tmdb-key" autocomplete="off" placeholder="Use your own key" value="${(localStorage.getItem('tmdb_key') || '')}">
        <p class="muted" style="margin-top:6px">Get a free key at themoviedb.org. Leave blank to use the default.</p>
      </form>

      <button class="btn btn-primary" id="clear-history" style="width:100%;justify-content:center;margin-top:6px;background:#2a2a36">
        <i class="fa-solid fa-trash"></i> Clear watch history
      </button>
    </aside>`;
  document.body.appendChild(wrap);

  const backdrop = document.getElementById('drawer-backdrop');
  const drawer = document.getElementById('settings-drawer');
  const close = () => { backdrop.classList.remove('open'); drawer.classList.remove('open'); };

  backdrop.addEventListener('click', close);

  // swatches
  document.querySelectorAll('#swatch-list .swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#swatch-list .swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Settings.save({ color: btn.dataset.color });
      document.getElementById('custom-color').value = '#' + btn.dataset.color;
    });
  });
  document.getElementById('custom-color').addEventListener('input', e => {
    const c = e.target.value.replace('#', '');
    document.querySelectorAll('#swatch-list .swatch').forEach(b => b.classList.remove('active'));
    Settings.save({ color: c });
  });
  document.getElementById('default-provider').addEventListener('change', e => Settings.save({ defaultProvider: e.target.value }));
  document.getElementById('opt-autoplay').addEventListener('change', e => Settings.save({ autoplay: e.target.checked }));
  document.getElementById('opt-muted').addEventListener('change', e => Settings.save({ muted: e.target.checked }));
  document.getElementById('tmdb-key').addEventListener('change', e => { TMDB.setKey(e.target.value); toast('TMDB key saved — reload to apply'); });
  document.getElementById('clear-history').addEventListener('click', () => {
    if (confirm('Clear all watch history and continue-watching items?')) { History.clear(); toast('Watch history cleared'); }
  });

  window.openSettings = () => { backdrop.classList.add('open'); drawer.classList.add('open'); };
}

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- Watch history (localStorage) ---------- */
const History = (() => {
  const KEY = 'watchhistory';
  function all() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 60))); }
  function record(item) {
    // item: {id, type, title, poster, backdrop, season, episode, progress, duration}
    const list = all();
    const idx = list.findIndex(x => x.id == item.id && x.type === item.type);
    const entry = { ...item, updated: Date.now() };
    if (idx >= 0) list[idx] = { ...list[idx], ...entry };
    else list.unshift(entry);
    list.sort((a, b) => b.updated - a.updated);
    save(list);
  }
  function get(id, type) { return all().find(x => x.id == id && x.type === type); }
  function clear() { localStorage.removeItem(KEY); location.reload(); }
  return { all, record, get, clear };
})();

Settings.applyTheme();
