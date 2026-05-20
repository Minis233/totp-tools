/* common.js — shared sidebar, notification, modal, and helpers */
(function(){
  'use strict';

  const NAV = [
    { href: 'index.html',  label: '2FA验证',  ico: '🔑' },
    { href: 'note.html',   label: '文本处理',  ico: '✎'  },
    { href: 'work.html',   label: '图片处理',  ico: '🖼' },
    { href: 'money.html',  label: '汇率换算',  ico: '↔'  },
    { href: 'more.html',   label: '更多工具',  ico: '⋯'  },
  ];

  function renderSidebar(){
    const container = document.querySelector('[data-sidebar]');
    if(!container) return;
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const active = here === '' ? 'index.html' : here;
    container.innerHTML = `
      <div class="brand"><span class="brand-dot"></span><span>在线工具</span></div>
      <nav>
        ${NAV.map(n => {
          const isActive = n.href === active;
          return `<a class="${isActive?'active':''}" href="${n.href}"><span class="ico" aria-hidden="true">${n.ico}</span>${n.label}</a>`;
        }).join('')}
      </nav>
    `;
  }

  // Notification system
  function ensureContainer(){
    let c = document.getElementById('notification-container');
    if(!c){
      c = document.createElement('div');
      c.id = 'notification-container';
      document.body.appendChild(c);
    }
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
    setTimeout(() => {
      n.classList.remove('show');
      setTimeout(() => n.remove(), 400);
    }, 2400);
  };

  // Clipboard helper
  window.copyText = async function(str){
    try{
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(str);
      } else {
        const ta = document.createElement('textarea');
        ta.value = str;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if(!ok) throw new Error('execCommand failed');
      }
      return true;
    } catch(e){
      window.toast('无法自动复制，请手动操作！');
      return false;
    }
  };

  document.addEventListener('DOMContentLoaded', renderSidebar);
})();
