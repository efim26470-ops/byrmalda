(function(){
  'use strict';

  const API_CRATES = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json';
  const LS_KEY = 'cs2_case_lab_v4_state';
  const CATALOG_CACHE = 'cs2_case_lab_v4_catalog_cache';
  const CATALOG_TTL = 1000 * 60 * 60 * 12;

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const money = n => `${Math.round(Number(n)||0).toLocaleString('ru-RU')} LC`;
  const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
  const rand = (a,b) => a + Math.random() * (b-a);
  const sample = arr => arr[Math.floor(Math.random() * arr.length)];

  const rarityColors = {
    'Consumer Grade':'#b0c3d9','Base Grade':'#b0c3d9','Industrial Grade':'#5e98d9','Mil-Spec Grade':'#4b69ff',
    'Restricted':'#8847ff','Classified':'#d32ce6','Covert':'#eb4b4b','Exceedingly Rare':'#ffd700','Extraordinary':'#eb4b4b',
    'Contraband':'#e4ae33','High Grade':'#4b69ff','Remarkable':'#8847ff','Exotic':'#d32ce6'
  };
  const rarityBase = {
    'Consumer Grade':45,'Base Grade':35,'Industrial Grade':85,'Mil-Spec Grade':175,'Restricted':430,
    'Classified':1050,'Covert':2800,'Exceedingly Rare':9000,'Extraordinary':7600,'Contraband':15000,
    'High Grade':180,'Remarkable':420,'Exotic':900
  };
  const rarityWeight = {
    'Consumer Grade':92,'Industrial Grade':88,'Mil-Spec Grade':79.92,'Restricted':15.98,'Classified':3.2,
    'Covert':0.64,'Exceedingly Rare':0.26,'Extraordinary':0.26,'Contraband':0.04
  };
  const wearMap = [
    {name:'Factory New', mult:1.38, min:0.00, max:0.07},
    {name:'Minimal Wear', mult:1.13, min:0.07, max:0.15},
    {name:'Field-Tested', mult:.93, min:0.15, max:0.38},
    {name:'Well-Worn', mult:.74, min:0.38, max:0.45},
    {name:'Battle-Scarred', mult:.62, min:0.45, max:0.99}
  ];
  const names = ['MIRAGEKING','EfimDrop','CaseFan','Headshotter','NAVIboy','donk_lover','FlashMe','AWP_ORACLE','bananaPeek','PixelPro','KnifeHunter','Zheka','SmokeBoss','ClutchMe','RUSH_B'];

  const fallbackCaseImg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 380"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#ef4444"/></linearGradient></defs><rect x="94" y="118" width="324" height="210" rx="34" fill="#141b2e" stroke="#334155" stroke-width="12"/><path d="M158 118v-30c0-28 20-48 48-48h100c28 0 48 20 48 48v30" fill="none" stroke="#475569" stroke-width="18"/><rect x="132" y="155" width="248" height="130" rx="24" fill="url(#g)" opacity=".95"/><text x="256" y="235" font-family="Arial" font-weight="900" font-size="64" fill="#111827" text-anchor="middle">CS2</text></svg>`);
  const fallbackWeaponImg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 260"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#60a5fa"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><path d="M74 142h288l33-34h78c22 0 42 16 48 37l14 52h-74l-14-37h-82l-42 50h-78l43-50H168l-23 32H85l20-37H72c-30 0-30-13 2-13z" fill="url(#g)"/><path d="M126 116h156l25-35h82l-34 35h68c17 0 30 13 30 30H92c0-17 15-30 34-30z" fill="#cbd5e1" opacity=".22"/><circle cx="482" cy="193" r="20" fill="#0f172a"/><text x="302" y="72" font-family="Arial" font-weight="900" font-size="38" fill="#fff" text-anchor="middle">CS2 SKIN</text></svg>`);

  const fallbackCatalog = {
    source: 'fallback',
    items: [
      ['ak47_redline','AK-47 | Redline','Classified', 1450],['ak47_vulcan','AK-47 | Vulcan','Covert', 3800],['ak47_asiimov','AK-47 | Asiimov','Covert', 3300],
      ['m4a1s_printstream','M4A1-S | Printstream','Covert', 4200],['m4a4_neo_noir','M4A4 | Neo-Noir','Covert', 2700],['awp_asiimov','AWP | Asiimov','Covert', 5200],
      ['awp_hyperbeast','AWP | Hyper Beast','Covert', 3900],['deagle_printstream','Desert Eagle | Printstream','Covert', 2300],['usp_kill_confirmed','USP-S | Kill Confirmed','Covert', 3400],
      ['glock_water_elemental','Glock-18 | Water Elemental','Classified', 980],['ak47_ice_coaled','AK-47 | Ice Coaled','Classified', 1150],['m4a1s_decimator','M4A1-S | Decimator','Classified', 1250],
      ['famas_mecha','FAMAS | Mecha Industries','Classified', 900],['mp9_food_chain','MP9 | Food Chain','Classified', 850],['p250_asiimov','P250 | Asiimov','Classified', 720],
      ['usp_cortex','USP-S | Cortex','Classified', 760],['ak47_slate','AK-47 | Slate','Restricted', 410],['m4a4_desolate_space','M4A4 | Desolate Space','Classified', 980],
      ['awp_duality','AWP | Duality','Classified', 880],['mac10_neon_rider','MAC-10 | Neon Rider','Covert', 1750],['five_seven_angry_mob','Five-SeveN | Angry Mob','Covert', 1600],
      ['tec9_isaac','Tec-9 | Isaac','Mil-Spec Grade', 210],['dual_hideout','Dual Berettas | Hideout','Mil-Spec Grade', 180],['mp7_just_smile','MP7 | Just Smile','Restricted', 390],
      ['ssg08_fever_dream','SSG 08 | Fever Dream','Restricted', 360],['ump_primal_saber','UMP-45 | Primal Saber','Classified', 870],['p90_death_grip','P90 | Death Grip','Restricted', 420],
      ['knife_kukri','★ Kukri Knife','Exceedingly Rare', 8500],['knife_butterfly','★ Butterfly Knife','Exceedingly Rare', 12500],['gloves_sport','★ Sport Gloves','Extraordinary', 9800]
    ].map(([id,name,rarity,value]) => ({id,name,rarity,rarityColor:rarityColors[rarity]||'#60a5fa',value,image:fallbackWeaponImg,weight:rarityWeight[rarity]||10})),
    cases: []
  };
  fallbackCatalog.cases = [
    {id:'kilowatt',name:'Kilowatt Case',price:650,image:fallbackCaseImg,items:fallbackCatalog.items.slice(0,14).concat(fallbackCatalog.items.slice(-3)),source:'fallback'},
    {id:'dreams',name:'Dreams & Nightmares Case',price:540,image:fallbackCaseImg,items:fallbackCatalog.items.slice(6,24).concat(fallbackCatalog.items.slice(-3)),source:'fallback'},
    {id:'premium',name:'Covert Premium Case',price:1450,image:fallbackCaseImg,items:fallbackCatalog.items.filter(x=>['Classified','Covert','Exceedingly Rare','Extraordinary'].includes(x.rarity)),source:'fallback'}
  ];

  let catalog = null;
  let state = loadState();
  let liveTemp = [];
  let selectedCaseId = null;
  let spinning = false;
  let currentDrop = null;
  let wheelDeg = 0;

  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    try{
      addToastWrap();
      setActiveNav();
      renderGlobals();
      seedLive();
      renderLive();
      setInterval(fakeLiveTick, 4200);
      bindGlobalActions();
      catalog = await getCatalog();
      renderGlobals();
      await route();
    }catch(err){
      console.error(err);
      toast('Ошибка JS: '+err.message, 'bad');
      const main = $('main');
      if(main) main.insertAdjacentHTML('afterbegin', `<div class="container"><div class="notice danger-zone"><b>JS упал.</b> Открой консоль браузера и пришли ошибку. Я добавил защиту, поэтому остальные блоки должны продолжить работать.</div></div>`);
    }
  }

  function loadState(){
    let raw = null;
    try{ raw = JSON.parse(localStorage.getItem(LS_KEY)||'null'); }catch(e){}
    const base = {balance:15000,inventory:[],opened:0,earned:0,spent:0,sold:0,upgrades:0,contracts:0,battles:0,wins:0,live:[],tx:[],pendingUpgrade:null,contractSelected:[],lastAd:0,lastWheel:0,createdAt:Date.now()};
    return Object.assign(base, raw||{});
  }
  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); renderGlobals(); }
  function tx(text, amount=0){
    state.tx.unshift({id:uid(), text, amount, time:Date.now()});
    state.tx = state.tx.slice(0,50);
  }
  function earn(amount, reason='Начисление'){
    amount = Math.max(0, Math.round(amount));
    state.balance += amount; state.earned += amount; tx(reason, amount); save(); toast(`+${money(amount)} · ${reason}`, 'good');
  }
  function spend(amount, reason='Списание'){
    amount = Math.max(0, Math.round(amount));
    if(state.balance < amount){ toast(`Недостаточно LabCoins: нужно ${money(amount)}`, 'bad'); return false; }
    state.balance -= amount; state.spent += amount; tx(reason, -amount); save(); return true;
  }
  function addInventoryItem(item, source='case'){
    const wear = sample(wearMap);
    const stattrak = Math.random() < 0.08 && !item.name.startsWith('★');
    const float = rand(wear.min, wear.max).toFixed(5);
    const value = Math.max(1, Math.round((item.value||100) * wear.mult * (stattrak?1.55:1) * rand(.86,1.18)));
    const inv = {...item, uid:uid(), baseId:item.id, wear:wear.name, float, stattrak, displayName:(stattrak?'StatTrak™ ':'') + item.name, value, addedAt:Date.now(), source};
    state.inventory.unshift(inv); state.inventory = state.inventory.slice(0,500); save(); return inv;
  }
  function removeInventory(uids){
    const set = new Set(Array.isArray(uids)?uids:[uids]);
    state.inventory = state.inventory.filter(it => !set.has(it.uid)); save();
  }
  function sellItem(uid){
    const it = state.inventory.find(x=>x.uid===uid); if(!it) return;
    removeInventory(uid); state.sold += it.value; earn(it.value, `Продажа ${it.displayName||it.name}`); renderRouteOnly();
  }

  async function getCatalog(){
    try{
      const cached = JSON.parse(sessionStorage.getItem(CATALOG_CACHE)||'null');
      if(cached && Date.now()-cached.time < CATALOG_TTL && cached.data?.cases?.length){ return cached.data; }
    }catch(e){}
    try{
      const res = await fetch(API_CRATES, {cache:'force-cache'});
      if(!res.ok) throw new Error('catalog http '+res.status);
      const crates = await res.json();
      const data = buildCatalogFromCrates(crates);
      if(data.cases.length < 3) throw new Error('catalog empty');
      try{ sessionStorage.setItem(CATALOG_CACHE, JSON.stringify({time:Date.now(), data})); }catch(e){}
      return data;
    }catch(err){
      console.warn('Using fallback catalog', err);
      toast('Онлайн-каталог CS2 не загрузился, включил резервный пул. На GitHub Pages с интернетом подтянутся настоящие изображения.', 'bad');
      return fallbackCatalog;
    }
  }

  function buildCatalogFromCrates(crates){
    const preferred = ['Kilowatt Case','Revolution Case','Recoil Case','Dreams & Nightmares Case','Fracture Case','Prisma 2 Case','Clutch Case','Spectrum 2 Case','Operation Riptide Case','Snakebite Case','Horizon Case','Gamma 2 Case','Danger Zone Case','CS20 Case'];
    const onlyCases = crates.filter(c => c && c.type === 'Case' && Array.isArray(c.contains) && c.contains.length >= 6);
    const picked = [];
    preferred.forEach(name => { const found = onlyCases.find(c => c.name === name); if(found && !picked.includes(found)) picked.push(found); });
    onlyCases.slice(0,20).forEach(c => { if(picked.length < 14 && !picked.includes(c)) picked.push(c); });
    const allItems = new Map();
    const cases = picked.slice(0,14).map((c,idx) => {
      const items = [];
      [...(c.contains||[]), ...(c.contains_rare||[])].forEach(raw => {
        const item = normalizeApiItem(raw);
        if(!item) return;
        items.push(item);
        allItems.set(item.id, item);
      });
      const price = calcCasePrice(items, idx);
      return {id:c.id || slug(c.name), name:c.name, price, image:c.image || fallbackCaseImg, items, source:'ByMykel CSGO-API', firstSaleDate:c.first_sale_date||'', rareText:c.loot_list?.footer||'Редкий спецпредмет внутри'};
    });
    return {source:'ByMykel CSGO-API', cases, items:Array.from(allItems.values())};
  }

  function normalizeApiItem(raw){
    if(!raw?.name) return null;
    const rarity = raw.rarity?.name || 'Mil-Spec Grade';
    const color = raw.rarity?.color || rarityColors[rarity] || '#60a5fa';
    const base = rarityBase[rarity] || 160;
    const nameBoost = raw.name.startsWith('★') ? 1.45 : 1;
    return {id:raw.id || slug(raw.name), name:raw.name, rarity, rarityColor:color, image:raw.image || fallbackWeaponImg, value:Math.round(base * nameBoost * rand(.85,1.35)), weight:rarityWeight[rarity] || 8, paintIndex:raw.paint_index||'', phase:raw.phase||''};
  }
  function calcCasePrice(items, idx){
    const avg = items.reduce((s,it)=>s+(it.value||0),0)/Math.max(1,items.length);
    return clamp(Math.round(avg * .82 + 380 + idx*35), 420, 2200);
  }
  function slug(s){ return String(s||'x').toLowerCase().replace(/[^a-zа-я0-9]+/gi,'-').replace(/^-|-$/g,''); }

  function setActiveNav(){
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.navlinks a').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === path || (path==='' && href==='index.html'));
    });
  }
  function renderGlobals(){
    $$('.js-balance').forEach(el => el.textContent = money(state.balance));
    $$('.js-inv-count').forEach(el => el.textContent = state.inventory.length.toLocaleString('ru-RU'));
  }
  function addToastWrap(){ if(!$('.toast-wrap')) document.body.insertAdjacentHTML('beforeend','<div class="toast-wrap"></div>'); }
  function toast(text,type=''){
    const wrap = $('.toast-wrap'); if(!wrap) return;
    const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = text; wrap.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(10px)'; setTimeout(()=>el.remove(),220); }, 4200);
  }
  function bindGlobalActions(){
    document.addEventListener('click', e => {
      const close = e.target.closest('[data-close-modal]');
      if(close) closeModal(close.closest('.modal'));
      const sell = e.target.closest('[data-sell]');
      if(sell) sellItem(sell.dataset.sell);
      const upgrade = e.target.closest('[data-upgrade-item]');
      if(upgrade){ state.pendingUpgrade = upgrade.dataset.upgradeItem; save(); location.href='upgrade.html'; }
      const contract = e.target.closest('[data-contract-item]');
      if(contract){ toggleContractSelection(contract.dataset.contractItem); toast('Предмет добавлен/убран из контракта', 'good'); renderRouteOnly(); }
      const reset = e.target.closest('[data-reset-save]');
      if(reset && confirm('Сбросить баланс, инвентарь и статистику?')){ localStorage.removeItem(LS_KEY); sessionStorage.removeItem(CATALOG_CACHE); state = loadState(); save(); location.reload(); }
    });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') $$('.modal.show').forEach(closeModal); });
  }
  function openModal(id){ const m = typeof id === 'string' ? $(id) : id; if(m) m.classList.add('show'); }
  function closeModal(m){ if(m) m.classList.remove('show'); }

  async function route(){
    const page = document.body.dataset.page || $('main')?.dataset.page || 'home';
    if(page === 'home') renderHome();
    if(page === 'cases') renderCases();
    if(page === 'inventory') renderInventory();
    if(page === 'upgrade') renderUpgrade();
    if(page === 'contracts') renderContracts();
    if(page === 'wheel') renderWheel();
    if(page === 'ads') renderAds();
    if(page === 'battle') renderBattle();
    if(page === 'profile') renderProfile();
  }
  function renderRouteOnly(){ route(); renderGlobals(); }

  function seedLive(){
    if(liveTemp.length) return;
    const items = (catalog?.items?.length?catalog.items:fallbackCatalog.items);
    for(let i=0;i<12;i++) liveTemp.push({user:sample(names), item:sample(items), value:Math.round(rand(80,5000)), time:Date.now()-i*7000});
  }
  function addLive(user,item,value){
    liveTemp.unshift({user,item,value:value||item.value||0,time:Date.now()}); liveTemp = liveTemp.slice(0,20); renderLive();
  }
  function fakeLiveTick(){
    const items = (catalog?.items?.length?catalog.items:fallbackCatalog.items);
    const item = sample(items); addLive(sample(names), item, Math.round((item.value||100)*rand(.7,1.4)));
  }
  function renderLive(){
    const feed = $('#liveFeed'); if(!feed) return;
    feed.innerHTML = liveTemp.slice(0,12).map(x => liveCard(x)).join('');
  }
  function liveCard(x){
    const it = x.item || fallbackCatalog.items[0];
    return `<div class="live-card rar-border" style="--rar:${it.rarityColor||'#60a5fa'}"><img src="${esc(it.image||fallbackWeaponImg)}" onerror="this.src='${fallbackWeaponImg}'" alt=""><div><strong>${esc(x.user)} выбил</strong><small>${esc(it.name)} · ${money(x.value)}</small></div></div>`;
  }

  function itemHtml(it, opts={}){
    const name = it.displayName || it.name;
    return `<article class="item-card ${opts.selected?'selected':''}" style="--rar:${it.rarityColor||'#60a5fa'}" data-uid="${esc(it.uid||'')}">
      <div class="item-art"><img src="${esc(it.image||fallbackWeaponImg)}" onerror="this.src='${fallbackWeaponImg}'" alt="${esc(name)}"></div>
      <h4>${esc(name)}</h4>
      <small>${esc(it.rarity||'Skin')}${it.wear?` · ${esc(it.wear)}`:''}${it.float?` · ${esc(it.float)}`:''}</small>
      <div class="value-row"><span class="price">${money(it.value)}</span>${opts.badge?`<span class="tag">${esc(opts.badge)}</span>`:''}</div>
      ${opts.buttons ? `<div class="item-buttons">${opts.buttons}</div>` : ''}
    </article>`;
  }
  function statCards(){
    return `<div class="grid cards-4">
      <div class="stat-card"><small>Баланс</small><strong class="js-balance">${money(state.balance)}</strong></div>
      <div class="stat-card"><small>Предметов</small><strong>${state.inventory.length}</strong></div>
      <div class="stat-card"><small>Открыто кейсов</small><strong>${state.opened}</strong></div>
      <div class="stat-card"><small>Заработано</small><strong>${money(state.earned)}</strong></div>
    </div>`;
  }

  function renderHome(){
    const root = $('#homeRoot'); if(!root) return;
    const topItems = [...catalog.items].sort((a,b)=>b.value-a.value).slice(0,8);
    root.innerHTML = `
      ${statCards()}
      <section class="section"><div class="section-head"><div><h2>Популярные кейсы</h2><p>Каталог подтягивает реальные названия, кейсы и изображения CS2 из открытого JSON-источника, если есть интернет.</p></div><a class="btn primary" href="cases.html">Открыть кейсы</a></div>
        <div class="grid case-grid">${catalog.cases.slice(0,6).map(caseCard).join('')}</div></section>
      <section class="section"><div class="section-head"><div><h2>Топ дропов</h2><p>Редкие предметы из текущего пула.</p></div><a class="btn" href="inventory.html">Инвентарь</a></div>
        <div class="grid item-grid">${topItems.map(it => itemHtml(it,{badge:'пул'})).join('')}</div></section>`;
    bindCaseButtons(root);
  }

  function caseCard(c){
    const colors = c.items.map(i=>i.rarityColor).filter(Boolean).slice(-1)[0] || '#ffd166';
    return `<article class="case-card" style="--case-glow:${colors}44">
      <img class="case-img" src="${esc(c.image||fallbackCaseImg)}" onerror="this.src='${fallbackCaseImg}'" alt="${esc(c.name)}">
      <h3>${esc(c.name)}</h3>
      <div class="case-meta"><span class="tag">${c.items.length} предметов</span><span class="price">${money(c.price)}</span></div>
      <div class="mini-list">${[...new Set(c.items.map(i=>i.rarity))].slice(0,4).map(r=>`<span class="pill">${esc(r)}</span>`).join('')}</div>
      <div class="case-source">${esc(c.source||catalog.source||'catalog')}</div>
      <div class="case-actions"><button class="btn primary" data-open-case="${esc(c.id)}">Крутить</button><button class="btn" data-view-case="${esc(c.id)}">Пул</button></div>
    </article>`;
  }
  function renderCases(){
    const root = $('#casesRoot'); if(!root) return;
    root.innerHTML = `<div class="notice"><b>Важно:</b> если у тебя открывается “Directory listing for /” со списком System32, ты запустил сервер не из папки проекта. Распакуй ZIP и запусти <span class="code">start-local.bat</span> внутри папки проекта.</div><div class="grid case-grid" style="margin-top:16px">${catalog.cases.map(caseCard).join('')}</div>`;
    bindCaseButtons(root);
  }
  function bindCaseButtons(root=document){
    $$('[data-open-case]', root).forEach(btn => btn.addEventListener('click', () => showCaseModal(btn.dataset.openCase, true)));
    $$('[data-view-case]', root).forEach(btn => btn.addEventListener('click', () => showCaseModal(btn.dataset.viewCase, false)));
  }
  function showCaseModal(caseId, autoOpen=false){
    const c = catalog.cases.find(x=>x.id===caseId); if(!c) return toast('Кейс не найден', 'bad');
    selectedCaseId = c.id;
    const modal = $('#caseModal');
    const body = $('#caseModalBody');
    $('#caseModalTitle').textContent = c.name;
    body.innerHTML = `<div class="two-col"><div class="panel"><img class="case-img" src="${esc(c.image||fallbackCaseImg)}" onerror="this.src='${fallbackCaseImg}'" alt="${esc(c.name)}" style="height:220px;width:100%;object-fit:contain;filter:drop-shadow(0 26px 30px rgba(0,0,0,.45))"><p class="notice">Цена открытия: <b>${money(c.price)}</b><br>${esc(c.rareText||'Внутри может быть редкий предмет.')}</p><button id="startSpinBtn" class="btn primary" style="width:100%">Открыть за ${money(c.price)}</button><p class="spin-note">Баланс списывается сразу, предмет начисляется после остановки рулетки.</p></div><div><div class="roulette-box"><div class="roulette-pointer"></div><div id="rouletteStrip" class="roulette-strip">${Array.from({length:18},()=>rollCard(weightedItem(c))).join('')}</div></div><h4>Содержимое кейса</h4><div class="case-contents">${c.items.map(it => itemHtml(it,{badge:'шанс'})).join('')}</div></div></div>`;
    $('#startSpinBtn').addEventListener('click', () => openCase(c.id));
    openModal(modal);
    if(autoOpen) setTimeout(()=>openCase(c.id), 250);
  }
  function rollCard(it){
    return `<div class="roll-card" style="--rar:${it.rarityColor||'#60a5fa'}"><img src="${esc(it.image||fallbackWeaponImg)}" onerror="this.src='${fallbackWeaponImg}'" alt=""><b>${esc(it.name)}</b></div>`;
  }
  function weightedItem(c){
    const pool = c.items.length?c.items:fallbackCatalog.items;
    const total = pool.reduce((s,it)=>s+(it.weight||rarityWeight[it.rarity]||5),0);
    let r = Math.random() * total;
    for(const it of pool){ r -= (it.weight||rarityWeight[it.rarity]||5); if(r <= 0) return it; }
    return pool[pool.length-1];
  }
  function openCase(caseId){
    if(spinning) return;
    const c = catalog.cases.find(x=>x.id===caseId); if(!c) return;
    if(!spend(c.price, `Открытие ${c.name}`)) return;
    spinning = true; state.opened += 1; save();
    const btn = $('#startSpinBtn'); if(btn){ btn.disabled = true; btn.textContent = 'Крутится...'; }
    const win = weightedItem(c);
    const strip = $('#rouletteStrip');
    const box = strip?.closest('.roulette-box');
    if(!strip || !box){ spinning = false; return; }
    const winIndex = 36;
    const roll = Array.from({length:52}, (_,i) => i===winIndex ? win : weightedItem(c));
    strip.style.transition = 'none'; strip.style.transform = 'translateX(0px)'; strip.innerHTML = roll.map(rollCard).join('');
    // force layout before transition
    strip.getBoundingClientRect();
    requestAnimationFrame(() => {
      const card = strip.children[winIndex];
      const target = card.offsetLeft - (box.clientWidth/2) + (card.clientWidth/2) + rand(-22,22);
      strip.style.transition = 'transform 5.2s cubic-bezier(.08,.7,.06,1)';
      strip.style.transform = `translateX(-${target}px)`;
    });
    setTimeout(() => {
      const inv = addInventoryItem(win, c.name);
      currentDrop = {item:inv, caseId:c.id};
      addLive('Ты', inv, inv.value);
      showDrop(inv, c);
      spinning = false;
      if(btn){ btn.disabled = false; btn.textContent = `Открыть ещё за ${money(c.price)}`; }
    }, 5400);
  }
  function showDrop(it,c){
    const modal = $('#dropModal'); const body = $('#dropModalBody');
    body.innerHTML = `<div class="drop-modal"><p class="kicker">Выпал предмет</p><img class="drop-img" src="${esc(it.image||fallbackWeaponImg)}" onerror="this.src='${fallbackWeaponImg}'" alt=""><h2 class="drop-name" style="color:${it.rarityColor||'#fff'}">${esc(it.displayName||it.name)}</h2><p>${esc(it.rarity)} · ${esc(it.wear)} · float ${esc(it.float)}</p><h3 class="price">${money(it.value)}</h3><div class="drop-actions"><button class="btn green" data-sell="${it.uid}">Продать за ${money(it.value)}</button><button class="btn" data-close-modal>Оставить</button><button class="btn blue" data-upgrade-item="${it.uid}">В апгрейд</button><button class="btn" data-contract-item="${it.uid}">В контракт</button><button class="btn primary" id="openAgainBtn">Открыть ещё</button></div></div>`;
    $('#openAgainBtn')?.addEventListener('click', () => { closeModal(modal); if(c) openCase(c.id); });
    openModal(modal);
  }

  function renderInventory(){
    const root = $('#inventoryRoot'); if(!root) return;
    const query = $('#invSearch')?.value?.toLowerCase() || '';
    const rarity = $('#invRarity')?.value || 'all';
    const sort = $('#invSort')?.value || 'new';
    let arr = [...state.inventory];
    if(query) arr = arr.filter(it => (it.displayName||it.name).toLowerCase().includes(query));
    if(rarity !== 'all') arr = arr.filter(it => it.rarity === rarity);
    if(sort === 'valueDesc') arr.sort((a,b)=>b.value-a.value);
    if(sort === 'valueAsc') arr.sort((a,b)=>a.value-b.value);
    if(sort === 'rarity') arr.sort((a,b)=>(rarityBase[b.rarity]||0)-(rarityBase[a.rarity]||0));
    if(sort === 'new') arr.sort((a,b)=>b.addedAt-a.addedAt);
    const rarities = [...new Set(state.inventory.map(i=>i.rarity))];
    const controls = $('#inventoryControls');
    if(controls && !controls.dataset.bound){
      controls.innerHTML = `<input id="invSearch" placeholder="Поиск по названию скина"><select id="invRarity"><option value="all">Все редкости</option>${rarities.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('')}</select><select id="invSort"><option value="new">Сначала новые</option><option value="valueDesc">Сначала дорогие</option><option value="valueAsc">Сначала дешёвые</option><option value="rarity">По редкости</option></select><button class="small-btn" id="sellCheapBtn">Продать дешевле 200 LC</button>`;
      controls.dataset.bound='1';
      controls.addEventListener('input', renderInventory); controls.addEventListener('change', renderInventory);
      $('#sellCheapBtn')?.addEventListener('click', () => sellCheap());
      return renderInventory();
    }
    root.innerHTML = arr.length ? `<div class="grid item-grid">${arr.map(it => itemHtml(it,{buttons:`<button data-sell="${it.uid}">Продать</button><button data-upgrade-item="${it.uid}">Апгрейд</button><button data-contract-item="${it.uid}">Контракт</button>`})).join('')}</div>` : `<div class="empty"><h3>Инвентарь пуст</h3><p>Открой кейс, выиграй баттл или прокрути колесо.</p><a class="btn primary" href="cases.html">К кейсам</a></div>`;
  }
  function sellCheap(){
    const cheap = state.inventory.filter(it => it.value < 200);
    if(!cheap.length) return toast('Нет предметов дешевле 200 LC', 'bad');
    const total = cheap.reduce((s,it)=>s+it.value,0);
    removeInventory(cheap.map(it=>it.uid)); state.sold += total; earn(total, `Массовая продажа ${cheap.length} предметов`); renderInventory();
  }

  function renderUpgrade(){
    const root = $('#upgradeRoot'); if(!root) return;
    const selectedUid = state.pendingUpgrade;
    const selected = state.inventory.find(i=>i.uid===selectedUid) || state.inventory[0] || null;
    if(selected && state.pendingUpgrade !== selected.uid){ state.pendingUpgrade = selected.uid; save(); }
    const targets = [...catalog.items].filter(it => !selected || it.value > selected.value * 1.05).sort((a,b)=>a.value-b.value).slice(0,40);
    root.innerHTML = `<div class="upgrade-layout"><div class="panel"><h3>Твой предмет</h3><div class="selected-box">${selected?itemHtml(selected):'<div><h3>Нет предмета</h3><p>Сначала выбей предмет.</p></div>'}</div><div id="upgradeInfo"></div><button class="btn primary" id="upgradeBtn" ${selected?'':'disabled'}>Апгрейд</button><p class="spin-note">При проигрыше исходный предмет исчезает. Это только локальный симулятор.</p></div><div><div class="filters"><input id="targetSearch" placeholder="Поиск цели"><select id="sourceSelect">${state.inventory.map(it=>`<option value="${it.uid}" ${it.uid===selected?.uid?'selected':''}>${esc(it.displayName||it.name)} · ${money(it.value)}</option>`).join('')}</select></div><div class="target-row" id="targetRow">${targets.map((it,i)=>itemHtml(it,{selected:i===0,badge:'цель'})).join('')}</div></div></div>`;
    let target = targets[0];
    const updateInfo = () => {
      const chance = selected && target ? calcChance(selected.value, target.value) : 0;
      $('#upgradeInfo').innerHTML = target && selected ? `<p>Цель: <b>${esc(target.name)}</b> · ${money(target.value)}</p><div class="chance-meter"><span style="width:${chance}%"></span></div><p class="price">Шанс: ${chance.toFixed(2)}%</p>` : '';
    };
    updateInfo();
    $('#sourceSelect')?.addEventListener('change', e => { state.pendingUpgrade = e.target.value; save(); renderUpgrade(); });
    $('#targetSearch')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      const next = targets.filter(it=>it.name.toLowerCase().includes(q));
      $('#targetRow').innerHTML = next.map((it,i)=>itemHtml(it,{selected:i===0,badge:'цель'})).join('');
      target = next[0]; bindTargets(); updateInfo();
    });
    function bindTargets(){
      $$('#targetRow .item-card').forEach((card,i) => card.addEventListener('click', () => {
        $$('#targetRow .item-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected');
        const q = $('#targetSearch')?.value?.toLowerCase() || '';
        const list = targets.filter(it=>it.name.toLowerCase().includes(q)); target = list[i]; updateInfo();
      }));
    }
    bindTargets();
    $('#upgradeBtn')?.addEventListener('click', () => doUpgrade(selected, target));
  }
  function calcChance(sourceValue, targetValue){ return clamp((sourceValue / targetValue) * 86, 1, 76); }
  function doUpgrade(source,target){
    if(!source || !target) return;
    const chance = calcChance(source.value, target.value);
    removeInventory(source.uid); state.upgrades += 1;
    if(Math.random()*100 <= chance){ const win = addInventoryItem(target,'upgrade'); state.pendingUpgrade = win.uid; save(); addLive('Ты',win,win.value); toast(`Апгрейд успешен: ${win.displayName}`, 'good'); }
    else{ state.pendingUpgrade = null; save(); toast('Апгрейд не прошёл, предмет сгорел', 'bad'); }
    renderUpgrade();
  }

  function toggleContractSelection(uid){
    const set = new Set(state.contractSelected||[]);
    if(set.has(uid)) set.delete(uid); else if(set.size < 10) set.add(uid); else return toast('Максимум 10 предметов', 'bad');
    state.contractSelected = Array.from(set); save();
  }
  function renderContracts(){
    const root = $('#contractsRoot'); if(!root) return;
    const selectedSet = new Set(state.contractSelected||[]);
    const selected = state.inventory.filter(it=>selectedSet.has(it.uid));
    const total = selected.reduce((s,it)=>s+it.value,0);
    const potential = Math.round(total * rand(1.08,1.95));
    root.innerHTML = `<div class="contract-layout"><div class="panel"><h3>Контракт</h3><div class="selected-box"><div><strong style="font-size:42px">${selected.length}/10</strong><p>Нужно минимум 3 предмета.</p><p>Сумма: <span class="price">${money(total)}</span></p><p>Ожидаемый результат: <span class="price">${money(potential)}</span></p></div></div><button class="btn primary" id="contractBtn" ${selected.length>=3?'':'disabled'}>Создать контракт</button><button class="btn" id="clearContractBtn" style="margin-top:10px;width:100%">Очистить выбор</button></div><div><div class="grid item-grid">${state.inventory.map(it => itemHtml(it,{selected:selectedSet.has(it.uid),buttons:`<button data-contract-item="${it.uid}">${selectedSet.has(it.uid)?'Убрать':'Добавить'}</button>`})).join('') || '<div class="empty">Нет предметов для контракта.</div>'}</div></div></div>`;
    $('#clearContractBtn')?.addEventListener('click', () => { state.contractSelected=[]; save(); renderContracts(); });
    $('#contractBtn')?.addEventListener('click', () => doContract(selected));
  }
  function doContract(selected){
    if(selected.length < 3) return;
    const total = selected.reduce((s,it)=>s+it.value,0);
    const candidates = [...catalog.items].filter(it => it.value >= total*.55 && it.value <= total*2.4);
    const base = candidates.length ? sample(candidates) : sample(catalog.items);
    removeInventory(selected.map(it=>it.uid));
    const reward = addInventoryItem({...base, value:Math.round(total*rand(.9,1.85))}, 'contract');
    state.contractSelected=[]; state.contracts += 1; save(); addLive('Ты',reward,reward.value);
    toast(`Контракт дал ${reward.displayName}`, 'good'); showDrop(reward, null); renderContracts();
  }

  function renderWheel(){
    const root = $('#wheelRoot'); if(!root) return;
    root.innerHTML = `<div class="wheel-wrap"><div class="wheel-pointer"></div><div class="wheel" id="wheel"></div><button class="btn primary" id="spinWheelBtn">Крутить бонусное колесо</button><p class="notice">Колесо выдаёт LabCoins или случайный предмет. Баланс начисляется сразу после остановки.</p><div id="wheelResult"></div></div>`;
    $('#spinWheelBtn')?.addEventListener('click', spinWheel);
  }
  function spinWheel(){
    const btn = $('#spinWheelBtn'); if(btn.disabled) return;
    btn.disabled = true;
    const rewards = [
      {label:'+250 LC', type:'coins', amount:250},{label:'+500 LC', type:'coins', amount:500},{label:'+1000 LC', type:'coins', amount:1000},{label:'+2500 LC', type:'coins', amount:2500},
      {label:'Случайный скин', type:'item'},{label:'Промо-бонус', type:'coins', amount:750},{label:'Почти нож', type:'coins', amount:120},{label:'Редкий скин', type:'rare'}
    ];
    const idx = Math.floor(Math.random()*rewards.length);
    wheelDeg += 360*5 + (360 - idx*45) + rand(5,35);
    $('#wheel').style.transform = `rotate(${wheelDeg}deg)`;
    setTimeout(() => {
      const r = rewards[idx];
      if(r.type==='coins'){ earn(r.amount, 'Бонусное колесо'); $('#wheelResult').innerHTML = `<h3 class="price">${esc(r.label)}</h3>`; }
      else{
        let pool = catalog.items;
        if(r.type==='rare') pool = catalog.items.filter(i => ['Classified','Covert','Exceedingly Rare','Extraordinary'].includes(i.rarity));
        const it = addInventoryItem(sample(pool.length?pool:catalog.items),'wheel'); addLive('Ты',it,it.value); $('#wheelResult').innerHTML = itemHtml(it,{badge:'колесо'});
      }
      btn.disabled = false;
    }, 4400);
  }

  function renderAds(){
    const root = $('#adsRoot'); if(!root) return;
    root.innerHTML = `<div class="ad-card"><div class="ad-hero"><div><p class="kicker">Реклама своих проектов</p><h2>Смотри 10 секунд — получай 750 LabCoins</h2><p>Это локальная имитация рекламы под портфолио, GitHub, видео, подкасты и учебные проекты.</p><button class="btn primary" id="startAdBtn">Смотреть рекламу</button><div style="margin-top:18px"><div class="progress"><span id="adProgress"></span></div><p id="adTimer" class="price">10 сек.</p></div></div></div><div class="ad-projects">${projectCards()}</div></div>`;
    $('#startAdBtn')?.addEventListener('click', startAd);
  }
  function projectCards(){
    const projects = [
      ['Портфолио','Ссылка на твой сайт/визитку. Замени URL в app.js.','#'],['YouTube-проект','Ролики, презентации, конференции и обзоры.','#'],['Подкаст','Финансы, учебные проекты и интервью.','#'],['GitHub','Репозитории, HTML-проекты и демо.','#']
    ];
    return projects.map(p=>`<a class="project-card" href="${p[2]}" target="_blank"><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p></a>`).join('');
  }
  function startAd(){
    const btn = $('#startAdBtn'); const prog = $('#adProgress'); const timer = $('#adTimer');
    btn.disabled = true; let sec = 10; prog.style.width='0%'; timer.textContent='10 сек.';
    const int = setInterval(() => {
      sec--; prog.style.width = `${(10-sec)*10}%`; timer.textContent = sec>0 ? `${sec} сек.` : 'Готово';
      if(sec <= 0){ clearInterval(int); earn(750, 'Просмотр рекламы'); btn.disabled=false; }
    },1000);
  }

  function renderBattle(){
    const root = $('#battleRoot'); if(!root) return;
    root.innerHTML = `<div class="battle-layout"><div class="panel"><h3>Case Battle</h3><p>Выбери кейс. Стоимость списывается только за твоё место. Победитель забирает все выпавшие предметы.</p><select id="battleCaseSelect" style="width:100%;margin-bottom:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:14px;padding:12px">${catalog.cases.map(c=>`<option value="${c.id}">${esc(c.name)} · ${money(c.price)}</option>`).join('')}</select><button class="btn primary" id="startBattleBtn">Начать баттл</button></div><div id="battleArena" class="grid cards-3"></div></div>`;
    $('#startBattleBtn')?.addEventListener('click', startBattle);
  }
  function startBattle(){
    const caseId = $('#battleCaseSelect')?.value; const c = catalog.cases.find(x=>x.id===caseId); if(!c) return;
    if(!spend(c.price, `Case Battle: ${c.name}`)) return;
    state.battles += 1; save();
    const players = ['Ты','BOT Max','BOT Neo'].map(name => ({name, item:weightedItem(c)}));
    const arena = $('#battleArena'); arena.innerHTML = players.map(p=>`<div class="panel"><h3>${esc(p.name)}</h3><div class="roulette-box"><div class="roulette-pointer"></div><div class="roulette-strip">${Array.from({length:34},()=>rollCard(weightedItem(c))).join('')}${rollCard(p.item)}</div></div><p class="spin-note">Крутится...</p></div>`).join('');
    $$('.battle-layout .roulette-strip').forEach((strip,idx)=>{
      strip.style.transition='none'; strip.style.transform='translateX(0)'; strip.getBoundingClientRect();
      requestAnimationFrame(()=>{ strip.style.transition='transform 4s cubic-bezier(.08,.7,.06,1)'; strip.style.transform=`translateX(-${strip.scrollWidth-360-rand(0,70)}px)`; });
    });
    setTimeout(()=>{
      const invs = players.map(p => ({...p, inv:addInventoryItem(p.item,'battle-temp')}));
      // remove all temporary battle items, then award if user wins
      removeInventory(invs.map(x=>x.inv.uid));
      const max = Math.max(...invs.map(x=>x.inv.value));
      const winner = invs.find(x=>x.inv.value===max);
      arena.innerHTML = invs.map(x=>`<div class="panel ${winner.name===x.name?'rar-border':''}" style="--rar:${x.inv.rarityColor}"><h3>${esc(x.name)} ${winner.name===x.name?'🏆':''}</h3>${itemHtml(x.inv,{badge:money(x.inv.value)})}</div>`).join('');
      if(winner.name === 'Ты'){
        state.wins += 1;
        invs.forEach(x => { const item = addInventoryItem({...x.item, value:x.inv.value}, 'battle-win'); addLive('Ты',item,item.value); });
        toast('Ты выиграл баттл и забрал все предметы!', 'good');
      }else toast(`Победил ${winner.name}. Предметы не начислены.`, 'bad');
      save();
    },4300);
  }

  function renderProfile(){
    const root = $('#profileRoot'); if(!root) return;
    root.innerHTML = `${statCards()}<div class="grid cards-3" style="margin-top:16px"><div class="panel"><h3>Статистика</h3><p>Апгрейды: <b>${state.upgrades}</b></p><p>Контракты: <b>${state.contracts}</b></p><p>Баттлы: <b>${state.battles}</b></p><p>Победы: <b>${state.wins}</b></p><p>Продано: <b>${money(state.sold)}</b></p></div><div class="panel"><h3>Сохранение</h3><p>Всё хранится в localStorage браузера.</p><button class="btn" id="exportSaveBtn">Экспорт save</button><button class="btn" id="importSaveBtn" style="margin-left:8px">Импорт</button><textarea id="saveBox" rows="7" style="width:100%;margin-top:12px;background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px"></textarea></div><div class="panel danger-zone"><h3>Сброс</h3><p>Вернёт стартовый баланс и очистит инвентарь.</p><button class="btn red" data-reset-save>Сбросить прогресс</button></div></div><section class="section"><div class="section-head"><h2>История баланса</h2></div><div class="tx-list">${state.tx.slice(0,18).map(t=>`<div class="tx"><div><b>${esc(t.text)}</b><br><small>${new Date(t.time).toLocaleString('ru-RU')}</small></div><strong class="${t.amount>=0?'win':'lose'}">${t.amount>=0?'+':''}${money(t.amount)}</strong></div>`).join('') || '<div class="empty">История пуста</div>'}</div></section>`;
    $('#exportSaveBtn')?.addEventListener('click',()=>{$('#saveBox').value = btoa(unescape(encodeURIComponent(JSON.stringify(state))));});
    $('#importSaveBtn')?.addEventListener('click',()=>{try{ const obj=JSON.parse(decodeURIComponent(escape(atob($('#saveBox').value.trim())))); state=Object.assign(loadState(),obj); save(); toast('Save импортирован','good'); renderProfile(); }catch(e){toast('Не удалось импортировать save','bad');}});
  }

})();
