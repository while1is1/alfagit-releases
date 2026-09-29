// Public repository that holds the releases (the source code lives in a private one). The download
// buttons link to its latest release page in the HTML, which works without JavaScript or when the API
// does not answer; here each one is pointed straight at its file in that release.
const RELEASES_REPO = 'while1is1/alfagit-releases';
const ASSETS = {
  dmg: /-mac-arm64\.dmg$/,
  exe: /-win-x64-setup\.exe$/,
  deb: /_amd64\.deb$/,
  appimage: /\.AppImage$/,
};
fetch(`https://api.github.com/repos/${RELEASES_REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
  .then((response) => (response.ok ? response.json() : null))
  .then((release) => {
    for (const [link, pattern] of Object.entries(ASSETS)) {
      const asset = release?.assets?.find((candidate) => pattern.test(candidate.name));
      if (!asset) continue;
      document.querySelectorAll(`[data-link="${link}"]`).forEach((a) => {
        a.href = asset.browser_download_url;
        a.title = `${asset.name} · ${release.tag_name}`;
      });
    }
  })
  .catch(() => {});
document.getElementById('year').textContent = new Date().getFullYear();

// Download section: one tab per system, opened on the visitor's. Without JavaScript every panel shows, stacked.
const OS_KEY = 'alfagit.os';
function detectOs() {
  const platform = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase();
  const agent = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod/.test(agent)) return null;
  if (platform.includes('mac') || agent.includes('mac os')) return 'mac';
  if (platform.includes('win') || agent.includes('windows')) return 'windows';
  if (platform.includes('linux') || agent.includes('linux') || agent.includes('x11')) return 'linux';
  return null;
}
const tabList = document.querySelector('.os-tabs');
const tabs = [...document.querySelectorAll('.os-tab')];
const panels = [...document.querySelectorAll('.os-panel')];
function selectOs(os, focus = false) {
  for (const tab of tabs) {
    const selected = tab.dataset.os === os;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  }
  for (const panel of panels) panel.hidden = panel.dataset.os !== os;
}
if (tabList && tabs.length > 0) {
  const detected = detectOs();
  let initial = detected;
  try { initial = localStorage.getItem(OS_KEY) || detected; } catch {}
  tabList.hidden = false;
  selectOs(tabs.some((tab) => tab.dataset.os === initial) ? initial : 'mac');
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      selectOs(tab.dataset.os);
      try { localStorage.setItem(OS_KEY, tab.dataset.os); } catch {}
    });
    tab.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      selectOs(tabs[(index + step + tabs.length) % tabs.length].dataset.os, true);
    });
  });
  // The hero button names the visitor's system; it still goes to the section, where the install steps are.
  if (detected) {
    document.querySelectorAll('[data-download-label]').forEach((label) => {
      label.textContent = label.dataset[`label${detected[0].toUpperCase()}${detected.slice(1)}`] || label.textContent;
    });
  }
}

const header = document.querySelector('.nav');
const onScroll = () => header.classList.toggle('nav--scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.feature, .card, .plan, .hood__inner > *').forEach((el) => {
    el.classList.add('reveal');
    io.observe(el);
  });
}
