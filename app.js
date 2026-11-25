(function () {
const CFG = window.CONFIG || {}, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const N = 17, photos = Array.from({ length: N }, (_, i) => `assets/photos/${String(i + 1).padStart(2, '0')}.webp`), DATA = window.PHOTOS_DATA || [];
const $ = (s) => document.querySelector(s);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u) ? u : '#');

/* Seamless strip: two identical sets, moved by exactly -50% */
$('#track').innerHTML = [...photos, ...photos].map((p, i) => `<img src="${p}" alt="Photo of Kwanele (${(i % N) + 1} of ${N})" height="220">`).join('');

/* 3D globe + orbiting photo ring */
function globe() {
  const box = $('#globe');
  try {
    const T = window.THREE, r = new T.WebGLRenderer({ alpha: true, antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, 0.1, 60); cam.position.set(0, 0.6, 10.5); cam.lookAt(0, 0, 0);
    let tex, video;
    const useVideo = !!(window.SITE_VIDEO);
    if (useVideo) {
      video = Object.assign(document.createElement('video'), { src: window.SITE_VIDEO, muted: true, loop: true, playsInline: true, autoplay: true });
      video.setAttribute('muted', ''); video.play().catch(() => {}); tex = new T.VideoTexture(video);
    } else {
      const cols = 6, rows = 3, cw = 400, c = document.createElement('canvas'); c.width = cols * cw; c.height = rows * cw;
      const x = c.getContext('2d'); x.fillStyle = '#222'; x.fillRect(0, 0, c.width, c.height);
      DATA.concat(DATA[0]).forEach((src, i) => { const im = new Image(); im.onload = () => {
        const s = Math.max(cw / im.width, cw / im.height), w = im.width * s, h = im.height * s, cx = (i % cols) * cw, cy = Math.floor(i / cols) * cw;
        x.save(); x.beginPath(); x.rect(cx, cy, cw, cw); x.clip(); x.drawImage(im, cx + (cw - w) / 2, cy + (cw - h) * 0.3, w, h); x.restore(); tex.needsUpdate = true; }; im.src = src; });
      tex = new T.CanvasTexture(c);
    }
    const ball = new T.Mesh(new T.SphereGeometry(1.7, 96, 64), new T.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
    ball.rotation.z = 0.25; sc.add(ball);
    sc.add(new T.AmbientLight(0xffffff, 1.1)); const d = new T.DirectionalLight(0xffffff, 1.6); d.position.set(4, 3, 6); sc.add(d);
    sc.add(new T.Mesh(new T.SphereGeometry(1.82, 64, 48), new T.ShaderMaterial({ transparent: true, side: T.BackSide, blending: T.AdditiveBlending, depthWrite: false,
      vertexShader: 'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec3 n;void main(){float i=pow(.72-dot(n,vec3(0,0,1.)),3.);gl_FragColor=vec4(.75,.95,.8,1.)*i;}' })));
    const ring = new T.Group(); ring.rotation.x = 0.35; sc.add(ring);
    const K = 10, loader = new T.TextureLoader();
    for (let i = 0; i < K; i++) { const a = (i / K) * Math.PI * 2;
      const m = new T.Mesh(new T.PlaneGeometry(0.62, 0.82), new T.MeshBasicMaterial({ map: loader.load(DATA[i % DATA.length]), side: T.DoubleSide }));
      m.position.set(Math.sin(a) * 2.75, 0, Math.cos(a) * 2.75); m.rotation.y = a; ring.add(m); }
    box.innerHTML = ''; box.append(r.domElement);
    const fit = () => { const s = box.clientWidth; r.setSize(s, s, false); }; fit(); addEventListener('resize', fit);
    let drag = false, lx = 0, ly = 0, tilt = 0;
    box.addEventListener('pointerdown', (e) => { drag = true; lx = e.clientX; ly = e.clientY; box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', (e) => { if (drag) { ball.rotation.y += (e.clientX - lx) * 0.008; tilt = Math.max(-0.5, Math.min(0.5, tilt + (e.clientY - ly) * 0.004)); lx = e.clientX; ly = e.clientY; } });
    box.addEventListener('pointerup', () => (drag = false));
    let last = performance.now();
    const tick = (t) => { const dt = Math.min((t - last) / 16.67, 3); last = t;
      if (!drag && !reduce) { ball.rotation.y += 0.012 * dt; ring.rotation.y -= 0.006 * dt; }
      ring.rotation.x = 0.35 + tilt; ball.rotation.x = tilt; r.render(sc, cam); if (!reduce || drag) requestAnimationFrame(tick); };
    reduce ? (ball.rotation.y = 0.6, r.render(sc, cam), addEventListener('pointerdown', () => requestAnimationFrame(tick), { once: true })) : requestAnimationFrame(tick);
  } catch (e) { console.warn('3D unavailable', e); }
}
globe();

if (!reduce) document.querySelectorAll('.card').forEach((c) => {
  c.addEventListener('pointermove', (e) => { const b = c.getBoundingClientRect(); c.style.setProperty('--ry', ((e.clientX - b.left) / b.width - 0.5) * 14 + 'deg'); c.style.setProperty('--rx', (0.5 - (e.clientY - b.top) / b.height) * 14 + 'deg'); });
  c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
});

/* Content */
const PANELS = {
  cyber: ['Cybersecurity: Ethical hacking', 'Labs, CTF challenges and learning notes. Everything here is ethical and educational, done in legal practice environments.'],
  software: ['Software engineering', 'Websites and software I have built, what I learned, and what is still in progress.'],
  pm: ['Project management', 'Planning, milestones, teamwork and lessons learned. Confidential details are never shared.'] };
const S = (panel, n, title, cat, desc, img, extra = {}) => Object.assign({ id: `sample-${panel}-${n}`, panel, title: 'SAMPLE: ' + title, category: cat, event_date: null, status: 'published', description: desc + '\n\nThis is sample text. Replace it with your real content in the admin area.', media: [{ type: 'image', url: img, alt: 'Sample post image (replace with your own)' }], links: [], tech: [] }, extra);
const SAMPLES = [
  S('cyber', 1, 'Write-up of a practice lab', 'Lab', 'Describe the lab or room you completed, the goal, the tools you used, and what you learned. Only write about legal practice environments.', 'assets/photos/06.webp'),
  S('cyber', 2, 'My first CTF challenge', 'CTF', 'Explain the challenge category, how you approached it, and what you would do differently next time.', 'assets/photos/15.webp'),
  S('cyber', 3, 'Notes: building software securely', 'Learning notes', 'Share what you are learning about secure coding, such as input validation, authentication and safe dependencies.', 'assets/photos/08.webp'),
  S('software', 1, 'A website I built', 'Website', 'Describe what the site does, who it helps, and what problem it solves. Add screenshots and a GitHub link.', 'assets/photos/16.webp', { tech: ['HTML', 'CSS', 'JavaScript'], role: 'Developer', links: [{ label: 'My GitHub', url: 'https://github.com/kaypee-byte' }] }),
  S('software', 2, 'A project in progress', 'In progress', 'Mark work that is not finished yet and say what you are building next.', 'assets/photos/12.webp', { tech: ['Add your stack'], role: 'Your role' }),
  S('software', 3, 'Lessons learned', 'Reflection', 'Write about a bug, a design decision or a skill you picked up while building.', 'assets/photos/18.webp'),
  S('pm', 1, 'Project coordination at Beacon Innovation Hub', 'Experience', 'Describe your role, the team, the milestones you tracked and what you delivered. Do not include confidential details.', 'assets/team.jpg', { role: 'Project coordinator' }),
  S('pm', 2, 'Planning and milestones', 'Planning', 'Show how you plan work: goals, tasks, timelines and how you keep the team on track.', 'assets/photos/11.webp'),
  S('pm', 3, 'Teamwork and lessons learned', 'Reflection', 'Share what working with a team taught you about communication and delivery.', 'assets/photos/07.webp')];
let sbp = null;
function client() {
  if (!CFG.SUPABASE_URL) return Promise.resolve(null);
  if (sbp) return sbp;
  return (sbp = new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
    s.onload = () => ok(window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY)); s.onerror = no; document.head.append(s); }));
}
async function load(panel, id) {
  const sb = await client();
  if (!sb) return SAMPLES.filter((p) => (id ? p.id === id : p.panel === panel));
  let q = sb.from('posts').select('*').eq('status', 'published'); q = id ? q.eq('id', id) : q.eq('panel', panel).order('event_date', { ascending: false, nullsFirst: false });
  const { data, error } = await q; if (error) throw error; return data;
}
const media = (m = []) => m.map((x) => x.type === 'video' ? `<video controls preload="metadata" src="${esc(x.url)}"></video>` : `<img loading="lazy" src="${esc(x.url)}" alt="${esc(x.alt || '')}">`).join('');
const when = (p) => (p.event_date ? '· ' + esc(p.event_date) : '');
async function route() {
  const h = location.hash, home = $('#home'), v = $('#view'), m = h.match(/^#\/(panel|post|moment)\/(.+)$/);
  if (!m) { home.hidden = false; v.hidden = true; const t = h.slice(1); if (t && !t.startsWith('/')) { const el = document.getElementById(t); if (el) el.scrollIntoView(); } return; }
  home.hidden = true; v.hidden = false; v.innerHTML = '<p>Loading…</p>'; scrollTo(0, 0);
  try {
    if (m[1] === 'panel') {
      const [title, intro] = PANELS[m[2]] || ['Not found', '']; v.className = `wrap ${m[2]}`;
      const list = await load(m[2]);
      v.innerHTML = `<p><a href="#/">Back home</a></p><h1>${esc(title)}</h1><p class="note">${esc(intro)}</p>` + (list.length ? `<div class="posts">${list.map((p) => `<a class="post" href="#/post/${esc(p.id)}"><h3>${esc(p.title)}</h3><p class="meta">${esc(p.category)} ${when(p)}</p>${p.media && p.media[0] && p.media[0].type === 'image' ? `<img loading="lazy" src="${esc(p.media[0].url)}" alt="${esc(p.media[0].alt || p.title)}">` : ''}</a>`).join('')}</div>` : '<p>No posts yet. Check back soon.</p>');
    } else if (m[1] === 'moment') {
      const [mo] = await getMoments(m[2]); if (!mo) { v.innerHTML = '<p>This moment was not found. <a href="#/">Back home</a></p>'; return; }
      v.className = 'wrap';
      v.innerHTML = `<p><a href="#timeline">Back to my story</a></p><h1>${esc(mo.title)}</h1><p class="meta">${when(mo)}</p><div class="media">${media(mo.media)}</div><div class="story">${paras(mo.story)}</div><p class="links">${(mo.links || []).map((l) => `<a href="${esc(safeUrl(l.url))}" rel="noopener">${esc(l.label || l.url)}</a>`).join('')}</p>`;
    } else {
      const [p] = await load(null, m[2]); if (!p) { v.innerHTML = '<p>This post was not found. <a href="#/">Back home</a></p>'; return; }
      v.className = `wrap ${p.panel}`;
      v.innerHTML = `<p><a href="#/panel/${esc(p.panel)}">Back to ${esc(PANELS[p.panel][0])}</a></p><h1>${esc(p.title)}</h1><p class="meta">${esc(p.category)} ${when(p)} ${p.role ? '· Role: ' + esc(p.role) : ''}</p>${(p.tech || []).length ? `<p>${p.tech.map((t) => `<span class="badge">${esc(t)}</span>`).join(' ')}</p>` : ''}<p>${esc(p.description).replace(/\n/g, '<br>')}</p><div class="media">${media(p.media)}</div><p class="links">${(p.links || []).map((l) => `<a href="${esc(safeUrl(l.url))}" rel="noopener">${esc(l.label || l.url)}</a>`).join('')}</p>`;
    }
  } catch (e) { v.innerHTML = '<p role="alert">Could not load content. Please refresh and try again.</p>'; console.error(e); }
}
/* ---------- Editable site content (dashboard) with built-in defaults ---------- */
const D0 = window.DEFAULTS || {}, small = matchMedia('(max-width: 760px)');
let SITE = {}, lastMo = [];
const tx = (k) => (SITE[k] != null && SITE[k] !== '' ? SITE[k] : D0[k] || '');
const rich = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const paras = (t = '') => t.split(/\n\s*\n/).filter((x) => x.trim()).map((x) => `<p>${rich(esc(x.trim())).replace(/\n/g, '<br>')}</p>`).join('');
const lines = (t = '') => t.split('\n').map((s) => s.trim()).filter(Boolean);
function fillProfile() {
  $('#aboutText').innerHTML = paras(tx('about'));
  [['#skillsList', 'skills'], ['#langList', 'languages'], ['#intList', 'interests']].forEach(([id, k]) => ($(id).innerHTML = lines(tx(k)).map((x) => `<li>${esc(x)}</li>`).join('')));
  [['#expList', 'experience'], ['#eduList', 'education']].forEach(([id, k]) => ($(id).innerHTML = tx(k).split(/\n\s*\n/).map(lines).filter((b) => b.length).map((b) =>
    `<h3>${esc(b[0])}</h3>${b[1] ? `<p class="meta">${esc(b[1])}</p>` : ''}${b.length > 2 ? `<ul>${b.slice(2).map((x) => `<li>${esc(x.replace(/^[-•]\s*/, ''))}</li>`).join('')}</ul>` : ''}`).join('')));
}

/* ---------- Moments ---------- */
const SM = (n, title, img) => ({ id: 'sample-m' + n, title: 'SAMPLE: ' + title, cta: 'Read the story', event_date: null, status: 'published',
  story: 'This is sample text.\n\nIn the admin dashboard, open “My story: moments”, add your own photo or video, a title and the full story of that moment. As many paragraphs as you like. Then publish it and this sample disappears.',
  media: [{ type: 'image', url: img, alt: 'Sample moment (replace with your own)' }], links: [] });
const SAMPLE_MOMENTS = [SM(1, 'Moment one', 'assets/team.jpg'), SM(2, 'Moment two', 'assets/photos/11.webp'), SM(3, 'Moment three', 'assets/photos/03.webp'), SM(4, 'Moment four', 'assets/photos/07.webp'), SM(5, 'Moment five', 'assets/photos/16.webp')];
async function getMoments(id) {
  const sb = await client();
  if (!sb) return id ? SAMPLE_MOMENTS.filter((x) => x.id === id) : SAMPLE_MOMENTS;
  let q = sb.from('moments').select('*').eq('status', 'published'); q = id ? q.eq('id', id) : q.order('sort').order('event_date');
  const { data, error } = await q; if (error) throw error; return data;
}
const thumb = (mo) => { const c = (mo.media || [])[0]; if (!c) return '<span class="nothumb">Photo</span>';
  return c.type === 'video' ? `<video src="${esc(c.url)}" muted loop playsinline preload="metadata" aria-label="${esc(c.alt || mo.title)}"></video>` : `<img src="${esc(c.url)}" alt="${esc(c.alt || mo.title)}" loading="lazy">`; };
const mcard = (mo, st = '') => `<a class="moment" ${st} href="#/moment/${esc(mo.id)}"><span class="in"><span class="thumb">${thumb(mo)}</span><span class="more"><b>${esc(mo.title)}</b>${esc(mo.cta || 'Read the story')} →</span></span></a>`;

/* ---------- Half-globe story dome ---------- */
function chunk(text) {
  const out = [];
  text.replace(/^#.*\n/, '').split(/\n\s*\n/).forEach((par) => {
    par = par.replace(/\s+/g, ' ').trim(); if (!par) return;
    const s = par.match(/[^.!?]+[.!?]+["”']?\s*|[^.!?]+$/g) || [par]; let cur = '';
    s.forEach((x) => { if (cur && (cur + x).length > 300) { out.push(cur.trim()); cur = ''; } cur += x; }); if (cur.trim()) out.push(cur.trim());
  });
  return out;
}
const STEP = 34, RAD = 330;
function buildJourney(moments, text) {
  lastMo = moments; const stage = $('#jStage'), flat = $('#jFlat'); $('#jFull').innerHTML = paras(text);
  $('#jTitle').textContent = tx('journeyTitle') || 'My story';
  if (small.matches) { stage.hidden = true; flat.hidden = false; flat.innerHTML = `<div class="flatstory">${paras(text)}</div><div class="flatrow" id="flatrow">${(() => { let it = moments.slice(); while (it.length && it.length < 6) it = it.concat(moments); return it.concat(it).map((m) => mcard(m)).join(''); })()}</div>`; marquee($('#flatrow')); return; }
  flat.hidden = true; stage.hidden = false;
  const cs = chunk(text);
  stage.innerHTML = `<div id="jScale"><div class="stage"><div class="floor"></div>
<div class="dome" id="dome" tabindex="0" role="group" aria-label="Story globe. Rotate with the arrow keys, mouse wheel, drag, or the buttons. The full text is also available to screen readers."><div class="drum" id="drum" aria-hidden="true">${cs.map((c) => `<p class="seg">${rich(esc(c))}</p>`).join('')}</div></div>
<div id="arc"></div><div class="ctrl"><button id="jBack" class="btn ghost">▲ Back</button><span id="jPos"></span><button id="jFwd" class="btn ghost">Forward ▼</button></div>
<button class="arcbtn l" id="aL" aria-label="Previous moments">‹</button><button class="arcbtn r" id="aR" aria-label="More moments">›</button></div></div>`;
  const wrap = $('#jScale'), fit = () => { const s = Math.min(1, stage.clientWidth / 1000); wrap.style.transform = `scale(${s})`; stage.style.height = 620 * s + 'px'; };
  fit(); if (!window._jfit) { window._jfit = 1; addEventListener('resize', () => $('#jScale') && fit()); } window._jfitFn = fit;
  const dome = $('#dome'), drum = $('#drum'), segs = [...drum.children], n = segs.length, pos = $('#jPos');
  segs.forEach((s, i) => (s.style.transform = `rotateX(${-i * STEP}deg) translateZ(${RAD}px)`));
  let p = 0, t = 0, raf = 0, snap;
  const clamp = (v) => Math.max(0, Math.min(n - 1, v));
  const draw = () => { drum.style.transform = `translateZ(${-RAD}px) rotateX(${p * STEP}deg)`;
    segs.forEach((s, i) => { const a = Math.abs(i - p); if (a > 2.4) { s.style.display = 'none'; return; } s.style.display = 'flex'; s.style.opacity = Math.max(0, 1 - a * 0.45); });
    pos.textContent = n ? `${Math.round(p) + 1} / ${n}` : ''; };
  const tick = () => { p += (t - p) * (reduce ? 1 : 0.14); if (Math.abs(t - p) < 0.002) p = t; draw(); raf = p !== t ? requestAnimationFrame(tick) : 0; };
  const go = (v) => { t = clamp(v); if (!raf) raf = requestAnimationFrame(tick); };
  let dy0 = null, t0 = 0;
  dome.addEventListener('pointerdown', (e) => { dy0 = e.clientY; t0 = t; dome.setPointerCapture(e.pointerId); dome.style.cursor = 'grabbing'; });
  dome.addEventListener('pointermove', (e) => { if (dy0 !== null) go(t0 - (e.clientY - dy0) / (190 * (wrap.getBoundingClientRect().width / 1000))); });
  const end = () => { if (dy0 !== null) { dy0 = null; dome.style.cursor = ''; go(Math.round(t)); } };
  dome.addEventListener('pointerup', end); dome.addEventListener('pointercancel', end);
  dome.addEventListener('wheel', (e) => { if ((e.deltaY > 0 && t < n - 1) || (e.deltaY < 0 && t > 0)) { e.preventDefault(); go(t + e.deltaY / 260); clearTimeout(snap); snap = setTimeout(() => go(Math.round(t)), 180); } }, { passive: false });
  dome.addEventListener('keydown', (e) => { const k = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key]; if (k) { e.preventDefault(); go(Math.round(t) + k); } });
  $('#jFwd').onclick = () => go(Math.round(t) + 1); $('#jBack').onclick = () => go(Math.round(t) - 1);
  /* Moment cards slide along the arc from right to left, forever. Drag, swipe, arrows or keys move them too. */
  const arc = $('#arc'), aL = $('#aL'), aR = $('#aR'), S = 37.5; let items = moments.slice();
  if (!items.length) { arc.innerHTML = '<p class="note" style="position:absolute;left:330px;top:60px">Moments will appear here soon.</p>'; aL.hidden = aR.hidden = true; draw(); return; }
  while (items.length < 6) items = items.concat(moments);
  arc.innerHTML = items.map((m) => mcard(m)).join('');
  const els = [...arc.children], L = items.length * S, AUTO = reduce ? 0 : 5; // degrees per second
  let off = 15, vel = AUTO, hold = false, jump = 0, dragging = false, moved = false;
  const place = () => els.forEach((el, i) => {
    const ang = (((i * S + off) % L) + L) % L; if (ang > 180) { el.style.display = 'none'; return; }
    const r = (ang * Math.PI) / 180; el.style.display = 'block'; el.style.left = 500 + 430 * Math.cos(r) + 'px'; el.style.top = 520 - 430 * Math.sin(r) + 'px';
    el.style.setProperty('--r', (90 - ang) * 0.55 + 'deg'); el.style.opacity = Math.max(0, Math.min(1, Math.min(ang, 180 - ang) / 12)); });
  let last = performance.now();
  const frame = (now) => { if (!arc.isConnected) return; const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (!dragging) { if (jump) { const st = Math.sign(jump) * Math.min(Math.abs(jump), 180 * dt); off += st; jump -= st; } else { off += vel * dt; vel += ((hold ? 0 : AUTO) - vel) * Math.min(1, dt * 2.5); } }
    place(); requestAnimationFrame(frame); };
  place(); requestAnimationFrame(frame);
  const st = $('#jStage .stage'), sc = () => wrap.getBoundingClientRect().width / 1000;
  st.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.dome,.ctrl,.arcbtn')) return; let x0 = e.clientX, lx = x0, lt = performance.now(); moved = false;
    const mv = (ev) => { const dx = ev.clientX - lx, now = performance.now();
      if (!dragging && Math.abs(ev.clientX - x0) > 5) { dragging = true; moved = true; jump = 0; }
      if (dragging) { const d = (-dx * 0.19) / sc(); off += d; vel = Math.max(-400, Math.min(400, d / Math.max((now - lt) / 1000, 0.008))); lx = ev.clientX; lt = now; } };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); dragging = false; };
    addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up); });
  st.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  arc.addEventListener('pointerover', (e) => { if (e.target.closest('.moment')) hold = true; }); arc.addEventListener('pointerout', (e) => { if (e.target.closest('.moment')) hold = false; });
  arc.addEventListener('focusin', () => (hold = true)); arc.addEventListener('focusout', () => (hold = false));
  arc.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') jump += S; if (e.key === 'ArrowLeft') jump -= S; });
  aR.onclick = () => (jump += S); aL.onclick = () => (jump -= S); aL.hidden = aR.hidden = false;
  draw();
}

/* Phone version: swipeable strip that also scrolls on its own, endlessly */
function marquee(row) {
  if (!row) return; const half = row.scrollWidth / 2; let pos = 1, paused = false, rel; row.scrollLeft = 1;
  const stop = () => { paused = true; clearTimeout(rel); }, go = () => { rel = setTimeout(() => (paused = false), 1500); };
  ['pointerdown', 'touchstart', 'mouseenter', 'focusin'].forEach((ev) => row.addEventListener(ev, stop)); ['pointerup', 'touchend', 'mouseleave', 'focusout'].forEach((ev) => row.addEventListener(ev, go));
  row.addEventListener('scroll', () => { if (row.scrollLeft <= 0) row.scrollLeft = half - 1; else if (row.scrollLeft >= half) row.scrollLeft -= half; });
  const loop = () => { if (!row.isConnected) return; if (paused || reduce) pos = row.scrollLeft; else { pos += 0.6; if (pos >= half) pos -= half; row.scrollLeft = pos; } requestAnimationFrame(loop); }; requestAnimationFrame(loop);
}
small.addEventListener('change', () => buildJourney(lastMo, tx('journey')));

addEventListener('hashchange', route); route();
fillProfile(); $('#jStage').innerHTML = '<p class="meta">Loading…</p>';
(async () => {
  try { const sb = await client(); if (sb) { const { data } = await sb.from('site_content').select('*'); (data || []).forEach((r) => (SITE[r.key] = r.value)); } } catch (e) { console.warn(e); }
  fillProfile(); let mo = []; try { mo = await getMoments(); } catch (e) { console.warn(e); }
  buildJourney(mo, tx('journey'));
})();
})();
