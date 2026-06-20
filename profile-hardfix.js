(function(){
  'use strict';
  const LS_KEY = 'cs2_case_lab_save';
  const LEGACY_KEYS = ['cs2_case_lab_state','cs2_case_lab_state_backup','cs2_case_lab_v8_state','cs2_case_lab_v7_state','cs2_case_lab_v6_state','cs2_case_lab_v5_state','cs2_case_lab_v4_state','cs2_case_lab_v3_state','cs2_case_lab_v2_state'];
  const VERSION = '31.20.0-profile-hardfix';
  let rendering = false;
  let lastRendered = 0;

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const num = (v, d=0) => Number.isFinite(Number(v)) ? Number(v) : d;
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt = n => `${Math.round(num(n,0)).toLocaleString('ru-RU')} ₽`;
  const date = t => t ? new Date(t).toLocaleString('ru-RU') : '—';

  function parse(raw){
    if(!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
  }
  function candidateKeys(){
    const keys = new Set([LS_KEY, ...LEGACY_KEYS]);
    try{
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(k && /cs2_case_lab/i.test(k)) keys.add(k);
      }
    }catch(e){}
    return Array.from(keys);
  }
  function score(s){
    if(!s || typeof s !== 'object') return -1;
    let v = 0;
    v += Array.isArray(s.inventory) ? s.inventory.length * 12 : 0;
    v += Math.min(10000000, Math.max(0, num(s.balance,0))) / 1000;
    v += Math.max(0, num(s.opened,0)) * 2;
    v += Math.max(0, num(s.xp,0)) / 25;
    v += Math.max(0, num(s.seasonTokens || s.tokens || s.st,0)) * 5;
    return v;
  }
  function loadState(){
    const found = [];
    try{
      candidateKeys().forEach(k => {
        const raw = localStorage.getItem(k);
        const s = parse(raw);
        if(s && typeof s === 'object') found.push({key:k,state:s,score:score(s)});
      });
    }catch(e){}
    found.sort((a,b)=>b.score-a.score);
    const base = found[0] ? found[0].state : {};
    normalize(base);
    base.__saveKey = found[0] ? found[0].key : LS_KEY;
    return base;
  }
  function normalize(s){
    s.balance = Math.max(0, Math.round(num(s.balance,15000)));
    s.inventory = Array.isArray(s.inventory) ? s.inventory.filter(Boolean).slice(0,1000) : [];
    s.tx = Array.isArray(s.tx) ? s.tx.filter(Boolean).slice(0,100) : [];
    s.opened = Math.max(0, Math.round(num(s.opened,0)));
    s.earned = Math.max(0, Math.round(num(s.earned,0)));
    s.spent = Math.max(0, Math.round(num(s.spent,0)));
    s.sold = Math.max(0, Math.round(num(s.sold,0)));
    s.upgrades = Math.max(0, Math.round(num(s.upgrades,0)));
    s.contracts = Math.max(0, Math.round(num(s.contracts,0)));
    s.battles = Math.max(0, Math.round(num(s.battles,0)));
    s.wins = Math.max(0, Math.round(num(s.wins,0)));
    s.mines = Math.max(0, Math.round(num(s.mines,0)));
    s.minesWins = Math.max(0, Math.round(num(s.minesWins,0)));
    s.xp = Math.max(0, Math.round(num(s.xp,0)));
    s.level = Math.max(1, Math.round(num(s.level,0) || inferLevel(s.xp).level));
    s.prestige = Math.max(0, Math.round(num(s.prestige,0)));
    s.seasonTokens = Math.max(0, Math.round(num(s.seasonTokens || s.tokens || s.st,0)));
    s.profile = (s.profile && typeof s.profile === 'object') ? s.profile : {};
    return s;
  }
  function xpNeed(level){ return Math.round(900 * Math.pow(Math.max(1, level), 1.18)); }
  function inferLevel(xp){
    let left = Math.max(0, num(xp,0));
    let level = 1;
    while(level < 1000){
      const need = xpNeed(level);
      if(left < need) break;
      left -= need; level++;
    }
    return {level, current:left, need:xpNeed(level), pct:Math.max(0,Math.min(100,left/xpNeed(level)*100))};
  }
  function power(s){ return s.balance + s.inventory.reduce((a,x)=>a+num(x.value,0),0); }
  function rank(s){
    const p = power(s);
    const ranks = [
      ['Silver I','🥈',0],['Silver Elite','🥈',50000],['Gold Nova','🥇',150000],['Master Guardian','🛡️',400000],['Legendary Eagle','🦅',900000],['Supreme','💎',1800000],['Global Elite','🌐',3500000]
    ];
    let cur = ranks[0], next = ranks[1];
    for(let i=0;i<ranks.length;i++){ if(p>=ranks[i][2]){ cur=ranks[i]; next=ranks[i+1]||null; } }
    return {name:cur[0],icon:cur[1],next:next?`${fmt(next[2]-p)} до ${next[0]}`:'Максимальный ранг'};
  }
  function itemName(it){ return it.displayName || it.name || it.market_hash_name || 'CS2 item'; }
  function itemValue(it){ return Math.max(0, Math.round(num(it.value || it.price || it.marketPrice,0))); }
  function profileRoot(){ return $('#profileRoot') || $('#app') || $('.page') || $('main') || document.body; }
  function bar(pct){ return `<div class="hf-bar"><span style="width:${Math.max(0,Math.min(100,pct))}%"></span></div>`; }
  function stat(label,value){ return `<div class="hf-stat"><small>${esc(label)}</small><b>${value}</b></div>`; }
  function renderProfile(force=false){
    if(rendering) return;
    const root = profileRoot();
    if(!root) return;
    const now = Date.now();
    if(!force && now-lastRendered<600) return;
    rendering = true;
    try{
      const s = loadState();
      const lvl = inferLevel(s.xp);
      const r = rank(s);
      const inv = s.inventory.slice().sort((a,b)=>itemValue(b)-itemValue(a));
      const best = inv[0];
      const recent = inv.slice(0,12).map(it=>`<article class="hf-item"><b>${esc(itemName(it))}</b><span>${esc(it.rarity||it.category||'item')}</span><strong>${fmt(itemValue(it))}</strong></article>`).join('') || '<p class="hf-muted">Пока нет предметов.</p>';
      const tx = s.tx.slice(0,12).map(t=>`<div class="hf-tx"><span>${esc(t.text||'Операция')}</span><b>${num(t.amount,0)>=0?'+':''}${fmt(t.amount||0)}</b><small>${date(t.time)}</small></div>`).join('') || '<p class="hf-muted">История пустая.</p>';
      root.innerHTML = `
        <section class="hf-profile">
          <div class="hf-head">
            <div class="hf-avatar">${esc((s.profile.avatar || '✦')).slice(0,4)}</div>
            <div><span class="kicker">Профиль восстановлен без аварийного режима</span><h2>${esc(s.profile.nickname || 'CS2 Case Lab Player')}</h2><p>${r.icon} ${esc(r.name)} · ${esc(s.profile.title || 'Case Master')} · Prestige ${s.prestige||0}</p></div>
            <div class="hf-version">${VERSION}</div>
          </div>
          <div class="hf-grid hf-stats">
            ${stat('Баланс',fmt(s.balance))}
            ${stat('Инвентарь',String(s.inventory.length))}
            ${stat('Оценка профиля',fmt(power(s)))}
            ${stat('ST',String(s.seasonTokens))}
          </div>
          <div class="hf-grid hf-two">
            <article class="hf-card"><h3>Уровень аккаунта</h3><div class="hf-big">${lvl.level}</div>${bar(lvl.pct)}<p>${Math.round(lvl.current).toLocaleString('ru-RU')} / ${lvl.need.toLocaleString('ru-RU')} XP</p><small>${esc(r.next)}</small></article>
            <article class="hf-card"><h3>Лучший предмет</h3><div class="hf-big small">${best?esc(itemName(best)):'—'}</div><p>${best?fmt(itemValue(best)):'Открой кейсы, чтобы получить предметы.'}</p></article>
          </div>
          <div class="hf-grid hf-stats">
            ${stat('Открыто кейсов',String(s.opened))}
            ${stat('Апгрейды',String(s.upgrades))}
            ${stat('Контракты',String(s.contracts))}
            ${stat('Battle',`${s.wins}/${s.battles}`)}
            ${stat('Сапёр',`${s.minesWins}/${s.mines}`)}
            ${stat('Продано',fmt(s.sold))}
          </div>
          <div class="hf-grid hf-two">
            <article class="hf-card"><div class="hf-head mini"><h3>Последние предметы</h3><a class="hf-btn" href="inventory.html">Инвентарь</a></div><div class="hf-items">${recent}</div></article>
            <article class="hf-card"><div class="hf-head mini"><h3>История</h3><button class="hf-btn" id="hfExport">Экспорт</button></div><div class="hf-txs">${tx}</div></article>
          </div>
          <div class="hf-card"><h3>Обслуживание сохранения</h3><p class="hf-muted">Если старые экспериментальные блоки ломают профиль, этот рендер читает save напрямую и не зависит от старого renderProfile.</p><div class="hf-actions"><button class="hf-btn" id="hfReload">Перерисовать</button><button class="hf-btn" id="hfBackup">Скачать backup save</button><button class="hf-btn danger" id="hfCleanProfile">Очистить только битые настройки профиля</button></div></div>
        </section>`;
      bindButtons(s);
      updateHeader(s);
      lastRendered = now;
    }catch(e){
      root.innerHTML = `<section class="hf-profile"><div class="hf-card"><h2>Профиль не удалось отрисовать</h2><p>${esc(e && e.message || e)}</p><button class="hf-btn" onclick="location.reload()">Обновить</button></div></section>`;
    }finally{ rendering = false; }
  }
  function updateHeader(s){
    $$('.js-balance').forEach(x=>x.textContent=fmt(s.balance));
    $$('.js-inv-count').forEach(x=>x.textContent=String(s.inventory.length));
  }
  function download(name, text){
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));
    a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }
  function bindButtons(s){
    const raw = () => JSON.stringify(loadState(), null, 2);
    const exp = $('#hfExport'); if(exp) exp.onclick=()=>download('cs2-case-lab-save-profile.json', raw());
    const backup = $('#hfBackup'); if(backup) backup.onclick=()=>download('cs2-case-lab-backup.json', raw());
    const reload = $('#hfReload'); if(reload) reload.onclick=()=>renderProfile(true);
    const clean = $('#hfCleanProfile'); if(clean) clean.onclick=()=>{
      if(!confirm('Очистить только profile/customization поля? Баланс и инвентарь останутся.')) return;
      const st=loadState(); st.profile={};
      try{ localStorage.setItem(st.__saveKey||LS_KEY, JSON.stringify(st)); }catch(e){}
      renderProfile(true);
    };
  }
  function injectCss(){
    if($('#hfProfileCss')) return;
    const css = `.hf-profile{display:grid;gap:18px}.hf-profile *{box-sizing:border-box}.hf-head{display:flex;align-items:center;gap:16px}.hf-head.mini{justify-content:space-between}.hf-avatar{width:72px;height:72px;border-radius:24px;display:grid;place-items:center;font-size:34px;font-weight:950;background:linear-gradient(135deg,var(--brand,#ff7a18),var(--brand2,#ff3d4f));box-shadow:0 18px 42px rgba(0,0,0,.32)}.hf-version{margin-left:auto;color:var(--muted,#a8b3c7);font-size:12px;border:1px solid var(--line,rgba(255,255,255,.12));border-radius:999px;padding:8px 12px}.hf-grid{display:grid;gap:14px}.hf-stats{grid-template-columns:repeat(4,minmax(0,1fr))}.hf-two{grid-template-columns:repeat(2,minmax(0,1fr))}.hf-card,.hf-stat{border:1px solid var(--line,rgba(255,255,255,.12));border-radius:26px;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.035));box-shadow:0 22px 70px rgba(0,0,0,.24);padding:20px;color:var(--text,#fff)}.hf-stat small,.hf-muted,.hf-card p,.hf-card small{color:var(--muted,#a8b3c7)}.hf-stat b{display:block;margin-top:8px;color:var(--gold,#ffd166);font-size:26px}.hf-big{font-size:52px;color:var(--gold,#ffd166);font-weight:950;line-height:1}.hf-big.small{font-size:20px;line-height:1.25;color:var(--text,#fff)}.hf-bar{height:12px;border-radius:999px;background:rgba(255,255,255,.09);overflow:hidden;margin:12px 0}.hf-bar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--brand,#ff7a18),var(--brand2,#ff3d4f),var(--gold,#ffd166))}.hf-items,.hf-txs{display:grid;gap:10px}.hf-item,.hf-tx{display:grid;gap:4px;border:1px solid var(--line,rgba(255,255,255,.1));border-radius:16px;background:rgba(255,255,255,.045);padding:12px}.hf-item span,.hf-tx small{color:var(--muted,#a8b3c7);font-size:12px}.hf-item strong,.hf-tx b{color:var(--gold,#ffd166)}.hf-actions{display:flex;gap:10px;flex-wrap:wrap}.hf-btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line,rgba(255,255,255,.12));background:rgba(255,255,255,.08);color:var(--text,#fff);border-radius:14px;padding:10px 14px;font-weight:900;text-decoration:none;cursor:pointer}.hf-btn:hover{border-color:var(--gold,#ffd166)}.hf-btn.danger{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.35)}@media(max-width:900px){.hf-stats,.hf-two{grid-template-columns:1fr}.hf-head{align-items:flex-start}.hf-version{margin-left:0}.hf-stat b{font-size:22px}}`;
    const style=document.createElement('style'); style.id='hfProfileCss'; style.textContent=css; document.head.appendChild(style);
  }
  function shouldFix(){
    const file = location.pathname.split('/').pop() || 'profile.html';
    if(file !== 'profile.html') return false;
    const root=profileRoot(); if(!root) return true;
    const txt=(root.textContent||'').toLowerCase();
    return txt.includes('загружаю') || txt.includes('раздел восстановлен') || txt.includes('аварийн');
  }
  function boot(){
    injectCss();
    setTimeout(()=>renderProfile(true), 180);
    setTimeout(()=>{ if(shouldFix()) renderProfile(true); }, 900);
    setTimeout(()=>{ if(shouldFix()) renderProfile(true); }, 1800);
    const root = profileRoot();
    if(root && window.MutationObserver){
      const mo = new MutationObserver(()=>{ if(shouldFix()) setTimeout(()=>renderProfile(true), 60); });
      mo.observe(root,{childList:true,subtree:true,characterData:true});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
