(function(){
  'use strict';

  const VERSION = '5.1.0';
  const LS_KEY = 'cs2_case_lab_v5_state';
  const API_CRATES = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const rnd = (a,b) => a + Math.random() * (b-a);
  const sample = arr => arr[Math.floor(Math.random() * arr.length)];
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt = n => `${Math.round(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString('ru-RU')} LC`;
  const id = () => (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

  const rarityColors = {
    'Consumer Grade':'#b0c3d9','Base Grade':'#b0c3d9','Industrial Grade':'#5e98d9','Mil-Spec Grade':'#4b69ff',
    'Restricted':'#8847ff','Classified':'#d32ce6','Covert':'#eb4b4b','Exceedingly Rare':'#ffd700','Extraordinary':'#e4ae33','Contraband':'#e4ae33',
    'High Grade':'#4b69ff','Remarkable':'#8847ff','Exotic':'#d32ce6'
  };
  const rarityValue = {
    'Consumer Grade':45,'Base Grade':45,'Industrial Grade':85,'Mil-Spec Grade':180,'Restricted':430,'Classified':1000,'Covert':2600,
    'Exceedingly Rare':9000,'Extraordinary':8200,'Contraband':15000,'High Grade':190,'Remarkable':460,'Exotic':930
  };
  const rarityWeight = {
    'Consumer Grade':90,'Base Grade':90,'Industrial Grade':75,'Mil-Spec Grade':62,'Restricted':18,'Classified':6,'Covert':2.2,
    'Exceedingly Rare':0.5,'Extraordinary':0.5,'Contraband':0.08,'High Grade':26,'Remarkable':8,'Exotic':3
  };
  const wears = [
    ['Factory New',1.38,0.00,0.07],['Minimal Wear',1.16,0.07,0.15],['Field-Tested',0.96,0.15,0.38],['Well-Worn',0.78,0.38,0.45],['Battle-Scarred',0.64,0.45,0.99]
  ];
  const bots = ['CaseFan','MIRAGEKING','dropzilla','AWP_ORACLE','rush_b','NAVIboy','knifeHunter','FlashMe','EfimDrop','bananaPeek','PixelPro','s1mpleFan','donkPeek'];

  const svgCase = (name='CS2') => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#ef4444"/></linearGradient><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff" stop-opacity=".25"/><stop offset="1" stop-color="#000000" stop-opacity=".25"/></linearGradient></defs><rect x="110" y="130" width="420" height="240" rx="34" fill="#111827" stroke="#334155" stroke-width="14"/><path d="M190 130V95c0-34 25-58 60-58h140c35 0 60 24 60 58v35" fill="none" stroke="#475569" stroke-width="20"/><rect x="145" y="168" width="350" height="158" rx="24" fill="url(#g)"/><rect x="145" y="168" width="350" height="158" rx="24" fill="url(#m)"/><path d="M170 203h300M170 248h300M170 293h300" stroke="#111827" stroke-width="10" opacity=".28"/><text x="320" y="272" font-family="Arial" font-weight="900" font-size="68" fill="#0b1020" text-anchor="middle">${esc(name).slice(0,9)}</text></svg>`);
  const svgSkin = (name='CS2 Skin', c1='#60a5fa', c2='#f97316') => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${c1}"/><stop offset=".55" stop-color="#8b5cf6"/><stop offset="1" stop-color="${c2}"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".55"/></filter></defs><rect width="760" height="360" rx="38" fill="#111827"/><circle cx="110" cy="80" r="120" fill="${c1}" opacity=".15"/><circle cx="640" cy="270" r="150" fill="${c2}" opacity=".13"/><g filter="url(#s)" transform="translate(46 50)"><path d="M62 148h362l38-42h112c31 0 58 20 69 50l31 86h-93l-18-46h-98l-55 62h-94l58-65H180l-36 44H62l32-51H55c-42 0-42-38 7-38z" fill="url(#g)"/><path d="M132 112h198l40-50h96l-42 50h124c24 0 44 14 54 36H92c4-20 18-36 40-36z" fill="#e5e7eb" opacity=".25"/><path d="M205 185h105M425 150h125M520 198h72" stroke="#0f172a" stroke-width="14" stroke-linecap="round" opacity=".42"/><circle cx="605" cy="238" r="22" fill="#0b1020"/></g><text x="380" y="56" fill="#fff" font-family="Arial" font-size="34" font-weight="900" text-anchor="middle">${esc(name).slice(0,30)}</text></svg>`);

  const fallbackItems = [
    ['ak_redline','AK-47 | Redline','Classified',1200,'#111827','#ef4444'],['ak_vulcan','AK-47 | Vulcan','Covert',3600,'#38bdf8','#2563eb'],['ak_headshot','AK-47 | Head Shot','Covert',4100,'#22c55e','#ef4444'],
    ['ak_ice','AK-47 | Ice Coaled','Classified',1100,'#67e8f9','#14b8a6'],['m4a1_print','M4A1-S | Printstream','Covert',4300,'#f8fafc','#a855f7'],['m4a1_decimator','M4A1-S | Decimator','Classified',1250,'#ec4899','#2563eb'],
    ['m4a4_neo','M4A4 | Neo-Noir','Covert',3100,'#f472b6','#60a5fa'],['awp_asiimov','AWP | Asiimov','Covert',5400,'#f97316','#f8fafc'],['awp_hyper','AWP | Hyper Beast','Covert',3900,'#22c55e','#ec4899'],
    ['awp_duality','AWP | Duality','Classified',900,'#fbbf24','#7c3aed'],['deagle_print','Desert Eagle | Printstream','Covert',2400,'#f8fafc','#06b6d4'],['deagle_ocean','Desert Eagle | Ocean Drive','Covert',2200,'#06b6d4','#f97316'],
    ['usp_kill','USP-S | Kill Confirmed','Covert',3300,'#ef4444','#f8fafc'],['usp_cortex','USP-S | Cortex','Classified',820,'#fb7185','#a855f7'],['glock_water','Glock-18 | Water Elemental','Classified',980,'#38bdf8','#ef4444'],
    ['p250_asiimov','P250 | Asiimov','Classified',760,'#f97316','#f8fafc'],['tec9_isaac','Tec-9 | Isaac','Mil-Spec Grade',210,'#ef4444','#f97316'],['mp9_food','MP9 | Food Chain','Classified',900,'#84cc16','#ec4899'],
    ['mac10_neon','MAC-10 | Neon Rider','Covert',1800,'#ec4899','#22d3ee'],['p90_death','P90 | Death Grip','Restricted',420,'#94a3b8','#ef4444'],['ssg_fever','SSG 08 | Fever Dream','Restricted',380,'#a855f7','#f472b6'],
    ['ump_primal','UMP-45 | Primal Saber','Classified',870,'#f59e0b','#eab308'],['famas_mecha','FAMAS | Mecha Industries','Classified',900,'#e5e7eb','#f97316'],['galil_chatter','Galil AR | Chatterbox','Covert',1700,'#facc15','#111827'],
    ['knife_butterfly','★ Butterfly Knife | Doppler','Exceedingly Rare',12800,'#22d3ee','#a855f7'],['knife_karambit','★ Karambit | Gamma Doppler','Exceedingly Rare',14200,'#22c55e','#38bdf8'],['knife_kukri','★ Kukri Knife | Case Hardened','Exceedingly Rare',9800,'#f59e0b','#60a5fa'],
    ['gloves_sport','★ Sport Gloves | Vice','Extraordinary',11000,'#f472b6','#8b5cf6'],['gloves_driver','★ Driver Gloves | King Snake','Extraordinary',8700,'#f8fafc','#94a3b8'],['gloves_broken','★ Broken Fang Gloves | Jade','Extraordinary',7600,'#22c55e','#064e3b']
  ].map(x => ({id:x[0],name:x[1],rarity:x[2],value:x[3],rarityColor:rarityColors[x[2]]||'#60a5fa',weight:rarityWeight[x[2]]||8,image:svgSkin(x[1],x[4],x[5])}));
  const fallbackCases = [
    {id:'kilowatt',name:'Kilowatt Case',price:650,image:svgCase('KILO'),items:fallbackItems.slice(0,18).concat(fallbackItems.slice(-4)),source:'offline-fallback'},
    {id:'revolution',name:'Revolution Case',price:720,image:svgCase('REV'),items:fallbackItems.slice(4,23).concat(fallbackItems.slice(-4)),source:'offline-fallback'},
    {id:'dreams',name:'Dreams & Nightmares Case',price:600,image:svgCase('DREAM'),items:fallbackItems.slice(8,24).concat(fallbackItems.slice(-5)),source:'offline-fallback'},
    {id:'premium',name:'Covert Premium Case',price:1500,image:svgCase('VIP'),items:fallbackItems.filter(i => ['Classified','Covert','Exceedingly Rare','Extraordinary'].includes(i.rarity)),source:'offline-fallback'},
    {id:'knife',name:'Knife & Gloves Case',price:3200,image:svgCase('GOLD'),items:fallbackItems.filter(i => ['Covert','Exceedingly Rare','Extraordinary'].includes(i.rarity)),source:'offline-fallback'}
  ];
  let catalog = {items:fallbackItems, cases:fallbackCases, source:'fallback'};
  let state = loadState();
  let busy = {case:false,wheel:false,battle:false,ad:false};
  let live = [];
  let wheelDeg = 0;
  let currentCase = null;

  function defaultState(){ return {version:VERSION,balance:15000,inventory:[],opened:0,earned:0,spent:0,sold:0,upgrades:0,contracts:0,battles:0,wins:0,tx:[],pendingUpgrade:null,contractSelected:[],createdAt:Date.now()}; }
  function toNum(v,d=0){ const n = Number(String(v).replace(/\s/g,'').replace(',','.')); return Number.isFinite(n) ? n : d; }
  function normalizeState(raw){
    const base = defaultState();
    const s = Object.assign(base, raw && typeof raw === 'object' ? raw : {});
    s.balance = toNum(s.balance, 15000);
    if(s.balance < 0 || !Number.isFinite(s.balance)) s.balance = 15000;
    ['opened','earned','spent','sold','upgrades','contracts','battles','wins'].forEach(k => s[k] = Math.max(0, Math.round(toNum(s[k],0))));
    s.inventory = Array.isArray(s.inventory) ? s.inventory.filter(Boolean).map(normalizeInvItem).filter(Boolean) : [];
    s.tx = Array.isArray(s.tx) ? s.tx.slice(0,60) : [];
    s.contractSelected = Array.isArray(s.contractSelected) ? s.contractSelected : [];
    return s;
  }
  function normalizeInvItem(it){
    if(!it || !(it.name || it.displayName)) return null;
    const r = it.rarity || 'Mil-Spec Grade';
    return Object.assign({}, it, {uid:it.uid||id(), name:it.name||it.displayName, displayName:it.displayName||it.name, rarity:r, rarityColor:it.rarityColor||rarityColors[r]||'#60a5fa', value:Math.max(1,Math.round(toNum(it.value,100))), image:it.image||svgSkin(it.name||'Skin')});
  }
  function loadState(){
    try{ return normalizeState(JSON.parse(localStorage.getItem(LS_KEY)||'null')); }
    catch(e){ return defaultState(); }
  }
  function save(){
    state = normalizeState(state);
    try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){ console.warn('localStorage недоступен', e); }
    renderGlobals();
  }
  function addTx(text, amount){ state.tx.unshift({id:id(), text, amount:Math.round(amount), time:Date.now()}); state.tx = state.tx.slice(0,60); }
  function earn(amount, reason='Начисление'){
    amount = Math.max(0, Math.round(toNum(amount,0)));
    state.balance = Math.round(toNum(state.balance,15000) + amount);
    state.earned += amount;
    addTx(reason, amount);
    save();
    toast(`+${fmt(amount)} · ${reason}`,'good');
  }
  function spend(amount, reason='Списание'){
    amount = Math.max(0, Math.round(toNum(amount,0)));
    state.balance = Math.round(toNum(state.balance,15000));
    if(state.balance < amount){ toast(`Недостаточно LabCoins: нужно ${fmt(amount)}, у тебя ${fmt(state.balance)}`,'bad'); save(); return false; }
    state.balance -= amount;
    state.spent += amount;
    addTx(reason, -amount);
    save();
    toast(`-${fmt(amount)} · ${reason}`,'warn');
    return true;
  }
  function addItem(base, source='drop'){
    const w = sample(wears);
    const stattrak = Math.random() < 0.07 && !String(base.name).startsWith('★');
    const value = Math.max(1, Math.round(toNum(base.value,100) * w[1] * (stattrak?1.5:1) * rnd(.88,1.16)));
    const item = Object.assign({}, base, {uid:id(), baseId:base.id, displayName:(stattrak?'StatTrak™ ':'') + base.name, wear:w[0], float:rnd(w[2],w[3]).toFixed(5), value, source, addedAt:Date.now()});
    state.inventory.unshift(item);
    state.inventory = state.inventory.slice(0,600);
    save();
    return item;
  }
  function removeItems(uids){
    const set = new Set(Array.isArray(uids)?uids:[uids]);
    state.inventory = state.inventory.filter(x => !set.has(x.uid));
    state.contractSelected = (state.contractSelected||[]).filter(x => !set.has(x));
    if(set.has(state.pendingUpgrade)) state.pendingUpgrade = null;
    save();
  }
  function sellItem(uid){
    const it = state.inventory.find(x => x.uid === uid);
    if(!it) return toast('Предмет уже не найден в инвентаре','bad');
    removeItems(uid);
    state.sold += it.value;
    earn(it.value, `Продажа ${it.displayName||it.name}`);
    route();
  }

  async function boot(){
    addToasts();
    renderGlobals();
    bindEvents();
    seedLive();
    renderLive();
    setInterval(fakeLive, 4800);
    routeLoading();
    catalog = await loadCatalog();
    seedLive(true);
    renderLive();
    route();
  }
  function routeLoading(){ const r = $('[data-route-root]'); if(r) r.innerHTML = '<div class="empty">Загружаю данные...</div>'; }
  async function loadCatalog(){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try{
      const res = await fetch(API_CRATES, {cache:'no-store', signal:controller.signal});
      clearTimeout(timeout);
      if(!res.ok) throw new Error('HTTP '+res.status);
      const crates = await res.json();
      const built = buildCatalog(crates);
      if(built.cases.length < 4) throw new Error('empty catalog');
      return built;
    }catch(e){
      clearTimeout(timeout);
      console.warn('CS2 API fallback:', e);
      toast('Онлайн-каталог не загрузился — включил встроенный резервный пул. Механики всё равно работают.','warn');
      return {items:fallbackItems, cases:fallbackCases, source:'offline-fallback'};
    }
  }
  function buildCatalog(crates){
    const preferred = ['Kilowatt Case','Revolution Case','Recoil Case','Dreams & Nightmares Case','Fracture Case','Clutch Case','Prisma 2 Case','Spectrum 2 Case','Operation Riptide Case','Snakebite Case','Horizon Case','Gamma 2 Case','Danger Zone Case','CS20 Case'];
    const casesRaw = crates.filter(c => c && c.type === 'Case' && Array.isArray(c.contains) && c.contains.length > 6);
    const picked = [];
    preferred.forEach(n => { const f = casesRaw.find(c => c.name === n); if(f) picked.push(f); });
    casesRaw.forEach(c => { if(picked.length < 16 && !picked.includes(c)) picked.push(c); });
    const all = new Map();
    const cases = picked.slice(0,16).map((c,idx) => {
      const items = [];
      [...(c.contains||[]), ...(c.contains_rare||[])].forEach(raw => {
        const it = apiItem(raw);
        if(it){ items.push(it); all.set(it.id,it); }
      });
      return {id:c.id || slug(c.name), name:c.name, price:calcPrice(items, idx), image:c.image || svgCase(c.name), items, source:'CSGO-API', rareText:c.loot_list && c.loot_list.footer ? c.loot_list.footer : 'Редкий спецпредмет внутри'};
    }).filter(c => c.items.length);
    return {items:Array.from(all.values()), cases, source:'CSGO-API'};
  }
  function apiItem(raw){
    if(!raw || !raw.name) return null;
    const r = raw.rarity && raw.rarity.name ? raw.rarity.name : 'Mil-Spec Grade';
    const base = rarityValue[r] || 180;
    const isRare = raw.name.startsWith('★') || ['Exceedingly Rare','Extraordinary'].includes(r);
    return {id:raw.id || slug(raw.name), name:raw.name, rarity:r, rarityColor:(raw.rarity && raw.rarity.color) || rarityColors[r] || '#60a5fa', image:raw.image || svgSkin(raw.name), value:Math.round(base * (isRare?1.18:1) * rnd(.85,1.28)), weight:rarityWeight[r] || 7};
  }
  function calcPrice(items, idx){
    const avg = items.reduce((s,x)=>s+(x.value||0),0) / Math.max(1,items.length);
    return clamp(Math.round(avg*.55 + 360 + idx*25), 350, 2200);
  }
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9а-яё]+/gi,'-').replace(/^-|-$/g,''); }

  function bindEvents(){
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-action],[data-open-case],[data-view-case],[data-sell],[data-upgrade-item],[data-contract-item],[data-close-modal]');
      if(!btn) return;
      if(btn.matches('[data-close-modal]')) return closeModal(btn.closest('.modal'));
      if(btn.dataset.openCase) return openCaseModal(btn.dataset.openCase, true);
      if(btn.dataset.viewCase) return openCaseModal(btn.dataset.viewCase, false);
      if(btn.dataset.sell) return sellItem(btn.dataset.sell);
      if(btn.dataset.upgradeItem){ state.pendingUpgrade = btn.dataset.upgradeItem; save(); location.href = 'upgrade.html'; return; }
      if(btn.dataset.contractItem){ toggleContract(btn.dataset.contractItem); route(); toast('Выбор контракта обновлён','good'); return; }
      const a = btn.dataset.action;
      if(a === 'spin-current-case') return spinCase(currentCase);
      if(a === 'open-again') return spinCase(currentCase);
      if(a === 'spin-wheel') return spinWheel();
      if(a === 'start-ad') return startAd();
      if(a === 'start-battle') return startBattle();
      if(a === 'make-contract') return makeContract();
      if(a === 'clear-contract'){ state.contractSelected=[]; save(); route(); return; }
      if(a === 'do-upgrade') return doUpgrade();
      if(a === 'sell-cheap') return sellCheap();
      if(a === 'reset-save') return resetSave();
      if(a === 'export-save') return exportSave();
      if(a === 'import-save') return importSave();
      if(a === 'add-debug-coins') return earn(10000, 'Тестовое начисление');
    });
    document.addEventListener('input', e => {
      if(['invSearch','invRarity','invSort'].includes(e.target.id)) renderInventory();
      if(e.target.id === 'targetSearch') renderUpgradeTargets();
    });
    document.addEventListener('change', e => {
      if(['invRarity','invSort'].includes(e.target.id)) renderInventory();
      if(e.target.id === 'upgradeSource'){ state.pendingUpgrade = e.target.value; save(); renderUpgrade(); }
      if(e.target.id === 'battleCase') renderBattleInfo();
    });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') $$('.modal.show').forEach(closeModal); });
  }

  function route(){
    renderGlobals();
    setActiveNav();
    const page = document.body.dataset.page || 'home';
    if(page === 'home') return renderHome();
    if(page === 'cases') return renderCases();
    if(page === 'inventory') return renderInventory();
    if(page === 'upgrade') return renderUpgrade();
    if(page === 'contracts') return renderContracts();
    if(page === 'wheel') return renderWheel();
    if(page === 'battle') return renderBattle();
    if(page === 'ads') return renderAds();
    if(page === 'profile') return renderProfile();
  }
  function setActiveNav(){
    const file = location.pathname.split('/').pop() || 'index.html';
    $$('.navlinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === file));
  }
  function renderGlobals(){
    state = normalizeState(state);
    $$('.js-balance').forEach(x => x.textContent = fmt(state.balance));
    $$('.js-inv-count').forEach(x => x.textContent = String(state.inventory.length));
    $$('.js-version').forEach(x => x.textContent = VERSION);
  }
  function addToasts(){ if(!$('.toast-wrap')) document.body.insertAdjacentHTML('beforeend','<div class="toast-wrap"></div>'); }
  function toast(text,type=''){
    const wrap = $('.toast-wrap'); if(!wrap) return;
    const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = text; wrap.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(()=>el.remove(),260); }, 4200);
  }
  function openModal(sel){ const m = typeof sel === 'string' ? $(sel) : sel; if(m) m.classList.add('show'); }
  function closeModal(m){ if(m) m.classList.remove('show'); }

  function seedLive(force=false){
    if(live.length && !force) return;
    live = [];
    const items = catalog.items && catalog.items.length ? catalog.items : fallbackItems;
    for(let i=0;i<12;i++){ const it = sample(items); live.push({user:sample(bots), item:it, value:Math.round((it.value||100)*rnd(.75,1.45))}); }
  }
  function fakeLive(){ const it = sample(catalog.items.length?catalog.items:fallbackItems); live.unshift({user:sample(bots),item:it,value:Math.round((it.value||100)*rnd(.8,1.5))}); live=live.slice(0,18); renderLive(); }
  function addLive(user,item){ live.unshift({user,item,value:item.value||0}); live=live.slice(0,18); renderLive(); }
  function renderLive(){
    const root = $('#liveFeed'); if(!root) return;
    root.innerHTML = live.map(x => `<div class="live-card" style="--rar:${x.item.rarityColor||'#60a5fa'}"><img src="${esc(x.item.image)}" onerror="this.src='${svgSkin('CS2 Skin')}'"><div><b>${esc(x.user)} выбил</b><small>${esc(x.item.name)} · ${fmt(x.value)}</small></div></div>`).join('');
  }

  function statCards(){ return `<div class="grid cards-4"><div class="stat"><small>Баланс</small><b class="js-balance">${fmt(state.balance)}</b></div><div class="stat"><small>Предметов</small><b>${state.inventory.length}</b></div><div class="stat"><small>Открыто кейсов</small><b>${state.opened}</b></div><div class="stat"><small>Заработано</small><b>${fmt(state.earned)}</b></div></div>`; }
  function itemCard(it, opts={}){
    const buttons = opts.buttons ? `<div class="item-actions">${opts.buttons}</div>` : '';
    return `<article class="item-card ${opts.selected?'selected':''}" data-uid="${esc(it.uid||'')}" data-item-id="${esc(it.id||'')}" style="--rar:${it.rarityColor||'#60a5fa'}"><div class="item-art"><img src="${esc(it.image||svgSkin(it.name))}" onerror="this.src='${svgSkin(it.name||'CS2 Skin')}'" alt="${esc(it.name)}"></div><h4>${esc(it.displayName||it.name)}</h4><small>${esc(it.rarity||'Skin')}${it.wear?` · ${esc(it.wear)}`:''}${it.float?` · ${esc(it.float)}`:''}</small><div class="value-row"><b>${fmt(it.value)}</b>${opts.badge?`<span class="pill">${esc(opts.badge)}</span>`:''}</div>${buttons}</article>`;
  }
  function caseCard(c){ return `<article class="case-card"><img class="case-img" src="${esc(c.image||svgCase(c.name))}" onerror="this.src='${svgCase(c.name)}'" alt="${esc(c.name)}"><h3>${esc(c.name)}</h3><div class="case-meta"><span>${c.items.length} предметов</span><b>${fmt(c.price)}</b></div><div class="mini-list">${[...new Set(c.items.map(i=>i.rarity))].slice(0,5).map(r=>`<span class="pill">${esc(r)}</span>`).join('')}</div><small class="source">${esc(c.source||catalog.source)}</small><div class="case-actions"><button class="btn primary" data-open-case="${esc(c.id)}">Крутить</button><button class="btn" data-view-case="${esc(c.id)}">Пул</button></div></article>`; }

  function renderHome(){
    const root = $('#homeRoot'); if(!root) return;
    const top = [...catalog.items].sort((a,b)=>b.value-a.value).slice(0,8);
    root.innerHTML = `${statCards()}<section class="block"><div class="head"><div><h2>Популярные кейсы</h2><p>Кнопка «Крутить» сразу открывает модальное окно, списывает баланс и запускает рулетку.</p></div><a class="btn primary" href="cases.html">Все кейсы</a></div><div class="grid case-grid">${catalog.cases.slice(0,6).map(caseCard).join('')}</div></section><section class="block"><div class="head"><div><h2>Редкие дропы</h2><p>Скины из текущего пула CS2.</p></div><a class="btn" href="ads.html">Получить LC</a></div><div class="grid item-grid">${top.map(x=>itemCard(x,{badge:'топ'})).join('')}</div></section>`;
  }
  function renderCases(){
    const root = $('#casesRoot'); if(!root) return;
    root.innerHTML = `<div class="notice"><b>V${VERSION}:</b> баланс хранится в новом save-ключе, поэтому старые сломанные сохранения не мешают. Для локального теста запускай <b>start-local.bat</b> из папки проекта.</div><div class="case-grid grid">${catalog.cases.map(caseCard).join('')}</div>`;
  }
  function openCaseModal(caseId, autoSpin){
    const c = catalog.cases.find(x => x.id === caseId);
    if(!c) return toast('Кейс не найден','bad');
    currentCase = c.id;
    $('#caseModalTitle').textContent = c.name;
    $('#caseModalBody').innerHTML = `<div class="case-open-layout"><aside class="open-aside"><img class="case-img big" src="${esc(c.image||svgCase(c.name))}" onerror="this.src='${svgCase(c.name)}'"><div class="notice">Цена открытия: <b>${fmt(c.price)}</b><br>${esc(c.rareText||'Внутри могут быть редкие предметы.')}</div><button class="btn primary huge" data-action="spin-current-case">Открыть за ${fmt(c.price)}</button><button class="btn" data-action="add-debug-coins">+10 000 LC для теста</button><p class="small">Списание происходит сразу. Начисление предмета — после остановки рулетки.</p></aside><section><div class="roulette-box"><div class="roulette-pointer"></div><div class="roulette-strip" id="rouletteStrip">${Array.from({length:20},()=>rollCard(weighted(c))).join('')}</div></div><h3>Содержимое кейса</h3><div class="case-contents">${c.items.map(x=>itemCard(x,{badge:'шанс'})).join('')}</div></section></div>`;
    openModal('#caseModal');
    if(autoSpin) setTimeout(() => spinCase(c.id), 120);
  }
  function rollCard(it){ return `<div class="roll-card" style="--rar:${it.rarityColor||'#60a5fa'}"><img src="${esc(it.image||svgSkin(it.name))}" onerror="this.src='${svgSkin(it.name||'Skin')}'"><b>${esc(it.name)}</b></div>`; }
  function weighted(c){
    const pool = c && c.items && c.items.length ? c.items : fallbackItems;
    const total = pool.reduce((s,x)=>s+(toNum(x.weight,6)),0);
    let r = Math.random() * total;
    for(const it of pool){ r -= toNum(it.weight,6); if(r <= 0) return it; }
    return pool[pool.length-1];
  }
  function spinCase(caseId){
    if(busy.case) return toast('Рулетка уже крутится','warn');
    const c = catalog.cases.find(x => x.id === caseId);
    if(!c) return toast('Кейс не найден','bad');
    if(!spend(c.price, `Открытие ${c.name}`)) return;
    state.opened += 1; save();
    busy.case = true;
    const btn = $('[data-action="spin-current-case"]'); if(btn){ btn.disabled=true; btn.textContent='Крутится...'; }
    const strip = $('#rouletteStrip'); const box = strip && strip.closest('.roulette-box');
    const win = weighted(c); const winIndex = 41;
    if(!strip || !box){ finishDrop(win,c,btn); return; }
    const cards = Array.from({length:62},(_,i)=> i===winIndex ? win : weighted(c));
    strip.style.transition='none'; strip.style.transform='translateX(0px)'; strip.innerHTML = cards.map(rollCard).join('');
    strip.getBoundingClientRect();
    requestAnimationFrame(() => {
      const card = strip.children[winIndex];
      const target = Math.max(0, card.offsetLeft - box.clientWidth/2 + card.clientWidth/2 + rnd(-18,18));
      strip.style.transition='transform 4.6s cubic-bezier(.08,.75,.08,1)';
      strip.style.transform=`translateX(-${target}px)`;
    });
    setTimeout(() => finishDrop(win,c,btn), 4850);
  }
  function finishDrop(win,c,btn){
    const inv = addItem(win, c.name);
    addLive('Ты', inv);
    busy.case = false;
    if(btn){ btn.disabled=false; btn.textContent=`Открыть ещё за ${fmt(c.price)}`; }
    showDrop(inv, c);
  }
  function showDrop(it,c){
    $('#dropModalBody').innerHTML = `<div class="drop-box"><p class="kicker">Выпал предмет</p><img class="drop-img" src="${esc(it.image)}" onerror="this.src='${svgSkin(it.name)}'"><h2 style="color:${it.rarityColor||'#fff'}">${esc(it.displayName||it.name)}</h2><p>${esc(it.rarity)} · ${esc(it.wear||'')} · float ${esc(it.float||'')}</p><h3>${fmt(it.value)}</h3><div class="drop-actions"><button class="btn green" data-sell="${esc(it.uid)}">Продать за ${fmt(it.value)}</button><button class="btn" data-close-modal>Оставить</button><button class="btn blue" data-upgrade-item="${esc(it.uid)}">В апгрейд</button><button class="btn" data-contract-item="${esc(it.uid)}">В контракт</button>${c?`<button class="btn primary" data-action="open-again">Открыть ещё</button>`:''}</div></div>`;
    openModal('#dropModal');
  }

  function renderInventory(){
    const root = $('#inventoryRoot'); if(!root) return;
    const q = ($('#invSearch') && $('#invSearch').value || '').toLowerCase().trim();
    const r = $('#invRarity') ? $('#invRarity').value : 'all';
    const s = $('#invSort') ? $('#invSort').value : 'new';
    const rarities = [...new Set(state.inventory.map(x=>x.rarity))].sort();
    const controls = $('#inventoryControls');
    if(controls && !controls.dataset.ready){
      controls.innerHTML = `<input id="invSearch" placeholder="Поиск по названию"><select id="invRarity"><option value="all">Все редкости</option>${rarities.map(x=>`<option>${esc(x)}</option>`).join('')}</select><select id="invSort"><option value="new">Сначала новые</option><option value="valueDesc">Сначала дорогие</option><option value="valueAsc">Сначала дешёвые</option><option value="rarity">По редкости</option></select><button class="small-btn" data-action="sell-cheap">Продать дешевле 200 LC</button>`;
      controls.dataset.ready = '1';
      return renderInventory();
    }
    let arr = [...state.inventory];
    if(q) arr = arr.filter(x => (x.displayName||x.name).toLowerCase().includes(q));
    if(r !== 'all') arr = arr.filter(x => x.rarity === r);
    if(s === 'valueDesc') arr.sort((a,b)=>b.value-a.value);
    else if(s === 'valueAsc') arr.sort((a,b)=>a.value-b.value);
    else if(s === 'rarity') arr.sort((a,b)=>(rarityValue[b.rarity]||0)-(rarityValue[a.rarity]||0));
    else arr.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
    root.innerHTML = arr.length ? `<div class="grid item-grid">${arr.map(x=>itemCard(x,{buttons:`<button data-sell="${esc(x.uid)}">Продать</button><button data-upgrade-item="${esc(x.uid)}">Апгрейд</button><button data-contract-item="${esc(x.uid)}">Контракт</button>`})).join('')}</div>` : `<div class="empty"><h3>Инвентарь пуст</h3><p>Открой кейс, выиграй battle или прокрути колесо.</p><a class="btn primary" href="cases.html">К кейсам</a></div>`;
  }
  function sellCheap(){
    const cheap = state.inventory.filter(x => x.value < 200);
    if(!cheap.length) return toast('Нет предметов дешевле 200 LC','warn');
    const total = cheap.reduce((s,x)=>s+x.value,0);
    removeItems(cheap.map(x=>x.uid));
    state.sold += total;
    earn(total, `Массовая продажа ${cheap.length} предметов`);
    renderInventory();
  }

  let currentTarget = null;
  function renderUpgrade(){
    const root = $('#upgradeRoot'); if(!root) return;
    const selected = state.inventory.find(x=>x.uid===state.pendingUpgrade) || state.inventory[0] || null;
    if(selected) state.pendingUpgrade = selected.uid;
    const options = state.inventory.map(x=>`<option value="${esc(x.uid)}" ${selected&&selected.uid===x.uid?'selected':''}>${esc(x.displayName||x.name)} · ${fmt(x.value)}</option>`).join('');
    root.innerHTML = `<div class="upgrade-layout"><aside class="panel"><h3>Твой предмет</h3>${selected?itemCard(selected):'<div class="empty">Нет предмета</div>'}<select id="upgradeSource">${options}</select><div id="upgradeChance"></div><button class="btn primary huge" data-action="do-upgrade" ${selected?'':'disabled'}>Апгрейд</button><p class="small">При проигрыше предмет исчезает. Это локальный фан-симулятор.</p></aside><section><div class="filters"><input id="targetSearch" placeholder="Поиск цели"></div><div id="upgradeTargets" class="target-row"></div></section></div>`;
    renderUpgradeTargets();
  }
  function renderUpgradeTargets(){
    const selected = state.inventory.find(x=>x.uid===state.pendingUpgrade) || state.inventory[0] || null;
    const q = ($('#targetSearch') && $('#targetSearch').value || '').toLowerCase();
    let targets = catalog.items.filter(x => !selected || x.value > selected.value * 1.03);
    if(q) targets = targets.filter(x => x.name.toLowerCase().includes(q));
    targets = targets.sort((a,b)=>a.value-b.value).slice(0,60);
    currentTarget = targets[0] || null;
    const box = $('#upgradeTargets'); if(!box) return;
    box.innerHTML = targets.map((x,i)=>itemCard(x,{selected:i===0,badge:'цель'})).join('') || '<div class="empty">Целей дороже текущего предмета не найдено.</div>';
    $$('#upgradeTargets .item-card').forEach((card,i)=>card.addEventListener('click',()=>{
      $$('#upgradeTargets .item-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected'); currentTarget = targets[i]; updateUpgradeChance();
    }));
    updateUpgradeChance();
  }
  function chance(src,tgt){ return src && tgt ? clamp((src.value / tgt.value) * 86, 1, 76) : 0; }
  function updateUpgradeChance(){
    const src = state.inventory.find(x=>x.uid===state.pendingUpgrade) || state.inventory[0] || null;
    const ch = chance(src,currentTarget);
    const el = $('#upgradeChance'); if(el) el.innerHTML = src && currentTarget ? `<p>Цель: <b>${esc(currentTarget.name)}</b> · ${fmt(currentTarget.value)}</p><div class="chance"><span style="width:${ch}%"></span></div><b>${ch.toFixed(2)}%</b>` : '';
  }
  function doUpgrade(){
    const src = state.inventory.find(x=>x.uid===state.pendingUpgrade) || state.inventory[0];
    const tgt = currentTarget;
    if(!src || !tgt) return toast('Выбери предмет и цель','bad');
    const ch = chance(src,tgt); removeItems(src.uid); state.upgrades += 1;
    if(Math.random()*100 <= ch){ const win = addItem(tgt,'upgrade'); state.pendingUpgrade=win.uid; addLive('Ты',win); toast(`Апгрейд успешен: ${win.displayName}`,'good'); }
    else{ state.pendingUpgrade=null; toast('Апгрейд не прошёл, предмет сгорел','bad'); }
    save(); renderUpgrade();
  }

  function toggleContract(uid){
    const set = new Set(state.contractSelected||[]);
    if(set.has(uid)) set.delete(uid); else if(set.size < 10) set.add(uid); else return toast('В контракт можно максимум 10 предметов','bad');
    state.contractSelected = Array.from(set); save();
  }
  function renderContracts(){
    const root = $('#contractsRoot'); if(!root) return;
    const set = new Set(state.contractSelected||[]);
    const selected = state.inventory.filter(x=>set.has(x.uid));
    const total = selected.reduce((s,x)=>s+x.value,0);
    root.innerHTML = `<div class="contract-layout"><aside class="panel"><h3>Контракт</h3><div class="big-count">${selected.length}/10</div><p>Минимум 3 предмета.</p><p>Сумма: <b>${fmt(total)}</b></p><p>Примерный результат: <b>${fmt(total*rnd(1.05,1.85))}</b></p><button class="btn primary huge" data-action="make-contract" ${selected.length>=3?'':'disabled'}>Создать контракт</button><button class="btn" data-action="clear-contract">Очистить</button></aside><section><div class="grid item-grid">${state.inventory.map(x=>itemCard(x,{selected:set.has(x.uid),buttons:`<button data-contract-item="${esc(x.uid)}">${set.has(x.uid)?'Убрать':'Добавить'}</button>`})).join('') || '<div class="empty">Нет предметов.</div>'}</div></section></div>`;
  }
  function makeContract(){
    const set = new Set(state.contractSelected||[]);
    const selected = state.inventory.filter(x=>set.has(x.uid));
    if(selected.length < 3) return toast('Нужно минимум 3 предмета','bad');
    const total = selected.reduce((s,x)=>s+x.value,0);
    let candidates = catalog.items.filter(x => x.value >= total*.5 && x.value <= total*2.3);
    if(!candidates.length) candidates = catalog.items;
    const base = Object.assign({}, sample(candidates), {value:Math.round(total*rnd(.92,1.9))});
    removeItems(selected.map(x=>x.uid));
    state.contractSelected=[]; state.contracts += 1;
    const reward = addItem(base,'contract'); addLive('Ты',reward); save(); renderContracts(); showDrop(reward,null);
    toast(`Контракт создан: ${reward.displayName}`,'good');
  }

  function renderWheel(){
    const root = $('#wheelRoot'); if(!root) return;
    root.innerHTML = `<div class="wheel-page"><div class="wheel-pointer"></div><div class="wheel" id="wheel"><span>LAB</span></div><button class="btn primary huge" data-action="spin-wheel">Крутить бонусное колесо</button><div class="notice">Колесо без кулдауна для теста. После остановки сразу начисляет LC или предмет.</div><div id="wheelResult" class="wheel-result"></div></div>`;
  }
  function spinWheel(){
    if(busy.wheel) return toast('Колесо уже крутится','warn');
    busy.wheel = true;
    const btn = $('[data-action="spin-wheel"]'); if(btn){ btn.disabled=true; btn.textContent='Крутится...'; }
    const rewards = [
      ['+250 LC','coins',250],['+500 LC','coins',500],['+750 LC','coins',750],['+1 000 LC','coins',1000],['+2 500 LC','coins',2500],['Промо +1 500 LC','coins',1500],['Случайный скин','item',0],['Редкий скин','rare',0]
    ];
    const idx = Math.floor(Math.random()*rewards.length);
    wheelDeg += 360*5 + (360 - idx*45) + rnd(8,35);
    const wh = $('#wheel'); if(wh) wh.style.transform = `rotate(${wheelDeg}deg)`;
    setTimeout(()=>{
      const [label,type,amount] = rewards[idx];
      if(type === 'coins'){ earn(amount,'Бонусное колесо'); $('#wheelResult').innerHTML = `<div class="result-card"><h2>${esc(label)}</h2><p>Баланс обновлён: ${fmt(state.balance)}</p></div>`; }
      else{
        let pool = catalog.items;
        if(type === 'rare') pool = catalog.items.filter(x => ['Classified','Covert','Exceedingly Rare','Extraordinary'].includes(x.rarity));
        const it = addItem(sample(pool.length?pool:catalog.items),'wheel'); addLive('Ты',it); $('#wheelResult').innerHTML = itemCard(it,{badge:'колесо'});
      }
      busy.wheel=false; if(btn){ btn.disabled=false; btn.textContent='Крутить бонусное колесо'; }
    }, 3300);
  }

  function renderAds(){
    const root = $('#adsRoot'); if(!root) return;
    root.innerHTML = `<div class="ad-card"><div><span class="kicker">Реклама своих проектов</span><h2>10 секунд просмотра = 750 LC</h2><p>Это имитация рекламной страницы под твои GitHub Pages, видео, подкасты и учебные проекты.</p><button class="btn primary huge" data-action="start-ad">Смотреть рекламу</button><div class="progress"><span id="adProgress"></span></div><p id="adTimer">Готово к просмотру</p></div><div class="project-grid">${projectCards()}</div></div>`;
  }
  function projectCards(){
    const p = [['Портфолио','Сайт-визитка и проекты','#'],['YouTube / видео','Ролики, конференции, обзоры','#'],['Подкаст','Финансы и учебные задания','#'],['GitHub','HTML-проекты и демо','#']];
    return p.map(x=>`<a class="project-card" href="${x[2]}"><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></a>`).join('');
  }
  function startAd(){
    if(busy.ad) return; busy.ad = true;
    const btn = $('[data-action="start-ad"]'); const bar = $('#adProgress'); const timer = $('#adTimer');
    if(btn){ btn.disabled=true; btn.textContent='Смотри рекламу...'; }
    let sec = 10; if(bar) bar.style.width='0%'; if(timer) timer.textContent='10 сек.';
    const int = setInterval(()=>{
      sec--; if(bar) bar.style.width = `${(10-sec)*10}%`; if(timer) timer.textContent = sec>0 ? `${sec} сек.` : 'Готово';
      if(sec <= 0){ clearInterval(int); earn(750,'Просмотр рекламы'); busy.ad=false; if(btn){ btn.disabled=false; btn.textContent='Смотреть рекламу'; } }
    },1000);
  }

  function renderBattle(){
    const root = $('#battleRoot'); if(!root) return;
    root.innerHTML = `<div class="battle-layout"><aside class="panel"><h3>Case Battle</h3><p>Списывается цена одного твоего места. Если твой дроп дороже ботов — забираешь все 3 предмета.</p><select id="battleCase">${catalog.cases.map(c=>`<option value="${esc(c.id)}">${esc(c.name)} · ${fmt(c.price)}</option>`).join('')}</select><div id="battleInfo"></div><button class="btn primary huge" data-action="start-battle">Начать баттл</button></aside><section id="battleArena" class="grid cards-3"><div class="empty">Выбери кейс и начни баттл.</div></section></div>`;
    renderBattleInfo();
  }
  function renderBattleInfo(){ const c = catalog.cases.find(x=>x.id === ($('#battleCase') && $('#battleCase').value)); const el = $('#battleInfo'); if(el && c) el.innerHTML = `<p>Стоимость: <b>${fmt(c.price)}</b></p>`; }
  function startBattle(){
    if(busy.battle) return toast('Баттл уже идёт','warn');
    const c = catalog.cases.find(x=>x.id === ($('#battleCase') && $('#battleCase').value)); if(!c) return;
    if(!spend(c.price, `Case Battle: ${c.name}`)) return;
    busy.battle = true; state.battles += 1; save();
    const players = ['Ты','BOT Max','BOT Neo'].map(name => ({name, item:weighted(c)}));
    const arena = $('#battleArena');
    arena.innerHTML = players.map(p => `<div class="panel"><h3>${esc(p.name)}</h3><div class="roulette-box small"><div class="roulette-pointer"></div><div class="roulette-strip">${Array.from({length:30},()=>rollCard(weighted(c))).join('')}${rollCard(p.item)}</div></div><p>Крутится...</p></div>`).join('');
    $$('#battleArena .roulette-strip').forEach(strip=>{ strip.getBoundingClientRect(); requestAnimationFrame(()=>{ strip.style.transition='transform 3.4s cubic-bezier(.08,.75,.08,1)'; strip.style.transform=`translateX(-${Math.max(380,strip.scrollWidth-440)}px)`; }); });
    setTimeout(()=>{
      const results = players.map(p => ({name:p.name, inv:addItem(p.item,'battle-temp')}));
      removeItems(results.map(x=>x.inv.uid));
      const max = Math.max(...results.map(x=>x.inv.value));
      const winner = results.find(x=>x.inv.value===max);
      arena.innerHTML = results.map(x => `<div class="panel ${winner.name===x.name?'winner':''}"><h3>${esc(x.name)} ${winner.name===x.name?'🏆':''}</h3>${itemCard(x.inv,{badge:fmt(x.inv.value)})}</div>`).join('');
      if(winner.name === 'Ты'){
        state.wins += 1;
        results.forEach(x => { const it = addItem(Object.assign({}, x.inv), 'battle-win'); addLive('Ты',it); });
        toast('Ты выиграл баттл и забрал все предметы!','good');
      }else toast(`Победил ${winner.name}. Ты проиграл баттл.`,'bad');
      busy.battle=false; save();
    }, 3700);
  }

  function renderProfile(){
    const root = $('#profileRoot'); if(!root) return;
    root.innerHTML = `${statCards()}<div class="grid cards-3 block"><div class="panel"><h3>Статистика</h3><p>Апгрейды: <b>${state.upgrades}</b></p><p>Контракты: <b>${state.contracts}</b></p><p>Баттлы: <b>${state.battles}</b></p><p>Победы: <b>${state.wins}</b></p><p>Продано: <b>${fmt(state.sold)}</b></p></div><div class="panel"><h3>Сохранение</h3><p>Версия save: <b>${esc(state.version||VERSION)}</b></p><button class="btn" data-action="export-save">Экспорт</button><button class="btn" data-action="import-save">Импорт</button><textarea id="saveBox" placeholder="Тут появится или сюда вставляется save"></textarea></div><div class="panel danger"><h3>Сброс</h3><p>Полностью чистит v5-сохранение и возвращает 15 000 LC.</p><button class="btn red" data-action="reset-save">Сбросить прогресс</button><button class="btn" data-action="add-debug-coins">+10 000 LC</button></div></div><section class="block"><div class="head"><h2>История баланса</h2></div><div class="tx-list">${state.tx.slice(0,25).map(t=>`<div class="tx"><div><b>${esc(t.text)}</b><small>${new Date(t.time).toLocaleString('ru-RU')}</small></div><strong class="${t.amount>=0?'plus':'minus'}">${t.amount>=0?'+':''}${fmt(t.amount)}</strong></div>`).join('') || '<div class="empty">История пуста.</div>'}</div></section>`;
  }
  function resetSave(){
    if(!confirm('Сбросить прогресс и вернуть стартовый баланс 15 000 LC?')) return;
    try{ localStorage.removeItem(LS_KEY); }catch(e){}
    state = defaultState(); save(); toast('Прогресс сброшен','good'); route();
  }
  function exportSave(){ const box=$('#saveBox'); if(box) box.value = btoa(unescape(encodeURIComponent(JSON.stringify(state)))); toast('Save выгружен в поле','good'); }
  function importSave(){
    const box=$('#saveBox'); if(!box || !box.value.trim()) return toast('Вставь save в поле','bad');
    try{ state = normalizeState(JSON.parse(decodeURIComponent(escape(atob(box.value.trim()))))); save(); toast('Save импортирован','good'); route(); }
    catch(e){ toast('Не удалось импортировать save','bad'); }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
