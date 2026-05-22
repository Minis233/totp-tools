/* common.js — shared sidebar, notification, modal, helpers, and SPA router */
(function(){
  'use strict';

  const NAV = [
    { href: 'index.html',  label: '2FA验证',  ico: '🔑' },
    { href: 'note.html',   label: '文本处理',  ico: '✎'  },
    { href: 'work.html',   label: '图片处理',  ico: '🖼' },
    { href: 'money.html',  label: '汇率换算',  ico: '↔'  },
    { href: 'more.html',   label: '更多工具',  ico: '⋯'  },
  ];
  const PAGE_SET = new Set(NAV.map(n => n.href));

  function currentPage(){
    const p = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    return p === '' ? 'index.html' : p;
  }

  function renderSidebar(){
    const container = document.querySelector('[data-sidebar]');
    if(!container) return;
    const active = currentPage();
    const theme = getTheme();
    container.innerHTML = `
      <div class="brand"><span class="brand-dot"></span><span>在线工具</span></div>
      <nav>
        ${NAV.map(n => {
          const isActive = n.href === active;
          return `<a class="${isActive?'active':''}" href="${n.href}" data-spa><span class="ico" aria-hidden="true">${n.ico}</span>${n.label}</a>`;
        }).join('')}
      </nav>
      <div class="side-tools">
        <button class="icon-btn" id="theme-toggle" title="切换主题（自动 / 浅色 / 深色）" aria-label="切换主题">${themeIcon(theme)}</button>
        <a class="icon-btn" href="https://github.com/Minis233/totp-tools" target="_blank" rel="noopener" title="GitHub 源码" aria-label="GitHub">${ICONS.github}</a>
      </div>
    `;
    container.querySelector('#theme-toggle').addEventListener('click', cycleTheme);
  }

  // ---------- Theme ----------
  const THEMES = ['auto', 'light', 'dark'];
  const ICONS = {
    auto:   '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 0 1 0 18"/></svg>',
    light:  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    dark:   '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>',
    github: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z"/></svg>',
  };
  function getTheme(){ try { return localStorage.getItem('app.theme') || 'auto'; } catch(e){ return 'auto'; } }
  function setTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('app.theme', t); } catch(e){}
  }
  function themeIcon(t){ return ICONS[t] || ICONS.auto; }
  function cycleTheme(){
    const cur = getTheme();
    const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
    setTheme(next);
    const btn = document.getElementById('theme-toggle');
    if(btn){ btn.innerHTML = themeIcon(next); btn.title = `当前：${next === 'auto' ? '自动' : next === 'light' ? '浅色' : '深色'}（点击切换）`; }
    window.toast && window.toast(next === 'auto' ? '主题：跟随系统' : next === 'light' ? '主题：浅色' : '主题：深色');
  }
  // Apply theme as early as possible to avoid flash
  setTheme(getTheme());

  // ---------- Notification ----------
  function ensureContainer(){
    let c = document.getElementById('notification-container');
    if(!c){ c = document.createElement('div'); c.id = 'notification-container'; document.body.appendChild(c); }
    return c;
  }
  let lastAt = 0;
  window.toast = function(message){
    const now = Date.now();
    if(now - lastAt < 250) return;
    lastAt = now;
    const c = ensureContainer();
    const n = document.createElement('div');
    n.className = 'notification';
    n.textContent = message;
    c.appendChild(n);
    void n.offsetWidth;
    n.classList.add('show');
    setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 400); }, 2400);
  };

  window.copyText = async function(str){
    try{
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(str);
      } else {
        const ta = document.createElement('textarea');
        ta.value = str; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if(!ok) throw new Error('execCommand failed');
      }
      return true;
    } catch(e){ window.toast('无法自动复制，请手动操作！'); return false; }
  };

  // ---------- Page-scoped timer / listener tracking ----------
  // Patches setInterval so each page's intervals are auto-cleared on SPA navigation.
  // Same for window/document listeners registered via __pageOn.
  const tracked = {
    intervals: new Set(),
    timeouts: new Set(),
    listeners: [], // { target, type, fn, opts }
  };
  const _si = window.setInterval, _ci = window.clearInterval;
  const _st = window.setTimeout,  _ct = window.clearTimeout;
  window.setInterval = function(){
    const id = _si.apply(this, arguments);
    tracked.intervals.add(id);
    return id;
  };
  window.clearInterval = function(id){ tracked.intervals.delete(id); return _ci.call(this, id); };
  // Pages may register persistent (document/window) listeners via __pageOn so they
  // get cleaned up on navigation.
  window.__pageOn = function(target, type, fn, opts){
    target.addEventListener(type, fn, opts);
    tracked.listeners.push({ target, type, fn, opts });
  };
  function cleanupPageState(){
    for(const id of tracked.intervals) _ci.call(window, id);
    tracked.intervals.clear();
    for(const { target, type, fn, opts } of tracked.listeners){
      try { target.removeEventListener(type, fn, opts); } catch(_){}
    }
    tracked.listeners.length = 0;
  }

  // ---------- SPA router ----------
  const pageCache = new Map();
  let inflight = null;
  let loadedHref = null; // page currently rendered into <main>

  async function fetchPage(href){
    if(pageCache.has(href)) return pageCache.get(href);
    const resp = await fetch(href, { credentials: 'same-origin' });
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    const html = await resp.text();
    pageCache.set(href, html);
    return html;
  }

  // Re-execute scripts inside the freshly-injected DOM subtree.
  // <script src> for libraries we already loaded in the shell are skipped.
  // Inline <script> blocks are re-created so they actually run.
  function runScripts(root){
    const scripts = Array.from(root.querySelectorAll('script'));
    for(const old of scripts){
      const src = old.getAttribute('src');
      if(src){
        if(/(otpauth|qrcode|jsQR|common\.js)/i.test(src)) { old.remove(); continue; }
        const s = document.createElement('script');
        for(const a of old.attributes) s.setAttribute(a.name, a.value);
        old.parentNode.replaceChild(s, old);
      } else {
        const s = document.createElement('script');
        s.textContent = old.textContent;
        old.parentNode.replaceChild(s, old);
      }
    }
  }

  function extractFromHtml(html){
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main');
    const title = (doc.querySelector('title') || {}).textContent || document.title;
    return { main, title };
  }

  async function navigateTo(href, push){
    if(!PAGE_SET.has(href)) return false;
    if(href === loadedHref && !inflight) return true;

    const myToken = inflight = Symbol('nav');

    let html;
    try { html = await fetchPage(href); }
    catch(e){ window.toast('加载失败：' + e.message); return false; }
    if(inflight !== myToken) return false;

    const { main, title } = extractFromHtml(html);
    if(!main){ window.toast('页面解析失败'); return false; }

    cleanupPageState();

    const oldMain = document.querySelector('main');
    const newMain = main.cloneNode(true);
    oldMain.replaceWith(newMain);
    document.title = title;

    if(push) history.pushState({ spa: true, href }, title, href);

    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    const link = document.querySelector('.sidebar nav a[href="' + href + '"]');
    if(link) link.classList.add('active');

    runScripts(newMain);

    window.scrollTo({ top: 0 });
    loadedHref = href;
    inflight = null;
    return true;
  }

  function bindRouter(){
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-spa]');
      if(!a) return;
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const href = a.getAttribute('href');
      if(!href || !PAGE_SET.has(href)) return;
      e.preventDefault();
      navigateTo(href, true);
    });
    window.addEventListener('popstate', () => {
      const href = currentPage();
      if(PAGE_SET.has(href)) navigateTo(href, false);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadedHref = currentPage();
    renderSidebar();
    bindRouter();
  });
})();
