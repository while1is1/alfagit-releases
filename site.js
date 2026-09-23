// Public repository that holds the releases (the source code lives in a private one). The download
// buttons link to its latest release page in the HTML, which works without JavaScript or when the API
// does not answer; here they are pointed straight at the .deb of that release.
const RELEASES_REPO = 'while1is1/alfagit-releases';
const downloads = document.querySelectorAll('[data-link="download"]');
fetch(`https://api.github.com/repos/${RELEASES_REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
  .then((response) => (response.ok ? response.json() : null))
  .then((release) => {
    const deb = release?.assets?.find((asset) => asset.name.endsWith('.deb'));
    if (!deb) return;
    downloads.forEach((a) => {
      a.href = deb.browser_download_url;
      a.title = `${deb.name} · ${release.tag_name}`;
    });
  })
  .catch(() => {});
document.getElementById('year').textContent = new Date().getFullYear();

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
