(function(){
  'use strict';

  const VERSION = '9.0.0';
  const LS_KEY = 'cs2_case_lab_save';
  const BACKUP_KEY = 'cs2_case_lab_session_backup';
  const LEGACY_KEYS = ['cs2_case_lab_state','cs2_case_lab_state_backup','cs2_case_lab_v8_state','cs2_case_lab_v7_state','cs2_case_lab_v6_state','cs2_case_lab_v5_state','cs2_case_lab_v4_state','cs2_case_lab_v3_state','cs2_case_lab_v2_state'];
  const API_BASE = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/';
  const API_CRATES = API_BASE + 'crates.json';
  const API_STICKERS = API_BASE + 'stickers.json';
  const API_AGENTS = API_BASE + 'agents.json';
  const API_PATCHES = API_BASE + 'patches.json';
  const API_KEYCHAINS = API_BASE + 'keychains.json';
  const API_COLLECTIBLES = API_BASE + 'collectibles.json';
  const API_SKINS = API_BASE + 'skins.json';
  const API_COLLECTIONS = API_BASE + 'collections.json';
  const LC_PER_USD = 100;
  const WHEEL_COOLDOWN = 2 * 60 * 60 * 1000;
  const AD_DAILY_LIMIT = 10;
  const AD_REWARD = 750;
  const DAY_KEY = () => new Date().toISOString().slice(0,10);
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
    'High Grade':'#4b69ff','Remarkable':'#8847ff','Exotic':'#d32ce6','Distinguished':'#4b69ff','Exceptional':'#8847ff','Superior':'#d32ce6','Master':'#eb4b4b','Master Agent':'#eb4b4b','Superior Agent':'#d32ce6','Exceptional Agent':'#8847ff','Distinguished Agent':'#4b69ff'
  };
  const rarityValue = {
    'Consumer Grade':45,'Base Grade':45,'Industrial Grade':85,'Mil-Spec Grade':180,'Restricted':430,'Classified':1000,'Covert':2600,
    'Exceedingly Rare':9000,'Extraordinary':8200,'Contraband':15000,'High Grade':120,'Remarkable':360,'Exotic':850,'Distinguished':320,'Exceptional':780,'Superior':1550,'Master':3600,'Master Agent':3600,'Superior Agent':1550,'Exceptional Agent':780,'Distinguished Agent':320
  };
  const rarityWeight = {
    'Consumer Grade':90,'Base Grade':90,'Industrial Grade':75,'Mil-Spec Grade':62,'Restricted':18,'Classified':6,'Covert':2.2,
    'Exceedingly Rare':0.5,'Extraordinary':0.5,'Contraband':0.08,'High Grade':28,'Remarkable':10,'Exotic':3.5,'Distinguished':24,'Exceptional':9,'Superior':4,'Master':1.3,'Master Agent':1.3,'Superior Agent':4,'Exceptional Agent':9,'Distinguished Agent':24
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
  let storageWarned = false;
  cleanupStorageBeforeLoad();
  let state = loadState();
  let busy = {case:false,wheel:false,battle:false,ad:false,upgrade:false};
  let live = [];
  let wheelDeg = 0;
  let currentCase = null;

  function defaultState(){ return {version:VERSION,balance:15000,inventory:[],opened:0,earned:0,spent:0,sold:0,upgrades:0,contracts:0,battles:0,wins:0,tx:[],pendingUpgrade:null,contractSelected:[],lastWheelAt:0,adViews:{},createdAt:Date.now(),savedAt:Date.now()}; }
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
    s.lastWheelAt = Math.max(0, Math.round(toNum(s.lastWheelAt,0)));
    s.adViews = (s.adViews && typeof s.adViews === 'object') ? s.adViews : {};
    return s;
  }
  function normalizeInvItem(it){
    if(!it || !(it.name || it.displayName)) return null;
    const r = it.rarity || 'Mil-Spec Grade';
    return Object.assign({}, it, {uid:it.uid||id(), name:it.name||it.displayName, displayName:it.displayName||it.name, rarity:r, rarityColor:it.rarityColor||rarityColors[r]||'#60a5fa', value:Math.max(1,Math.round(toNum(it.value,100))), image:it.image||svgSkin(it.name||'Skin')});
  }
  function allSaveKeys(){
    const keys = new Set([LS_KEY, ...LEGACY_KEYS]);
    try{
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(k && /cs2_case_lab/i.test(k)) keys.add(k);
      }
    }catch(e){}
    return Array.from(keys);
  }
  function compactInvItem(it){
    if(!it) return null;
    const r = it.rarity || 'Mil-Spec Grade';
    return {
      uid: it.uid || id(), id: it.id || it.baseId || slug(it.name || it.displayName || 'item'), baseId: it.baseId || it.id || slug(it.name || it.displayName || 'item'),
      name: it.name || it.displayName || 'CS2 Item', displayName: it.displayName || it.name || 'CS2 Item',
      rarity: r, rarityColor: it.rarityColor || rarityColors[r] || '#60a5fa', category: it.category || 'skin',
      value: Math.max(1, Math.round(toNum(it.value, 100))), steamUsd: it.steamUsd || undefined, marketHashName: it.marketHashName || it.market_hash_name || it.name,
      image: it.image || svgSkin(it.name || it.displayName || 'CS2 Item'), wear: it.wear || '', float: it.float || '', source: it.source || '', addedAt: Math.max(0, Math.round(toNum(it.addedAt, Date.now())))
    };
  }
  function compactState(raw){
    const s = normalizeState(raw);
    return {
      version: VERSION, balance: Math.max(0, Math.round(toNum(s.balance,15000))), inventory: s.inventory.map(compactInvItem).filter(Boolean).slice(0,500),
      opened:s.opened, earned:s.earned, spent:s.spent, sold:s.sold, upgrades:s.upgrades, contracts:s.contracts, battles:s.battles, wins:s.wins,
      tx:(s.tx||[]).slice(0,50).map(t=>({id:t.id||id(), text:String(t.text||'Операция').slice(0,120), amount:Math.round(toNum(t.amount,0)), time:Math.max(0,Math.round(toNum(t.time,Date.now())))})),
      pendingUpgrade:s.pendingUpgrade||null, contractSelected:Array.isArray(s.contractSelected)?s.contractSelected.slice(0,10):[], lastWheelAt:s.lastWheelAt||0, adViews:s.adViews||{},
      createdAt:s.createdAt||Date.now(), savedAt:Date.now()
    };
  }
  function cleanupStorageBeforeLoad(){
    try{
      const keepRaw = localStorage.getItem(LS_KEY);
      const legacyRaw = !keepRaw ? LEGACY_KEYS.map(k => { try{return localStorage.getItem(k)}catch(e){return null} }).find(Boolean) : null;
      for(let i=localStorage.length-1;i>=0;i--){
        const k = localStorage.key(i);
        if(k && /cs2_case_lab/i.test(k) && k !== LS_KEY) localStorage.removeItem(k);
      }
      if(!keepRaw && legacyRaw){
        try{ localStorage.setItem(LS_KEY, JSON.stringify(compactState(JSON.parse(legacyRaw)))); }catch(e){}
      }
    }catch(e){}
  }
  function loadState(){
    const candidates = [];
    try{ const raw = localStorage.getItem(LS_KEY); if(raw) candidates.push(normalizeState(JSON.parse(raw))); }catch(e){}
    try{ const raw = sessionStorage.getItem(BACKUP_KEY); if(raw) candidates.push(normalizeState(JSON.parse(raw))); }catch(e){}
    if(candidates.length){
      candidates.sort((a,b)=>{
        const sa = toNum(a.savedAt || a.createdAt,0), sb = toNum(b.savedAt || b.createdAt,0);
        if(sa !== sb) return sb - sa;
        const ia = Array.isArray(a.inventory) ? a.inventory.length : 0;
        const ib = Array.isArray(b.inventory) ? b.inventory.length : 0;
        if(ia !== ib) return ib - ia;
        return toNum(b.balance,0) - toNum(a.balance,0);
      });
      return candidates[0];
    }
    return defaultState();
  }
  function save(){
    state = compactState(state);
    const raw = JSON.stringify(state);
    let okLocal = false, okSession = false;
    try{ sessionStorage.setItem(BACKUP_KEY, raw); okSession = true; }catch(e){}
    try{
      cleanupStorageBeforeLoad();
      localStorage.setItem(LS_KEY, raw);
      okLocal = true;
    }catch(e){
      try{
        for(let i=localStorage.length-1;i>=0;i--){ const k = localStorage.key(i); if(k && /cs2_case_lab/i.test(k) && k !== LS_KEY) localStorage.removeItem(k); }
        localStorage.setItem(LS_KEY, raw);
        okLocal = true;
      }catch(err){
        console.warn('localStorage недоступен', err);
      }
    }
    if(!okLocal && !storageWarned){
      storageWarned = true;
      toast(okSession ? 'Прогресс временно сохранён в этой вкладке. Для постоянного save разреши localStorage/cookies.' : 'Браузер не дал сохранить прогресс. Проверь private mode / запрет cookies.', 'bad');
    }
    renderGlobals();
    return okLocal || okSession;
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
    const item = compactInvItem(Object.assign({}, base, {uid:id(), baseId:base.id, displayName:(stattrak?'StatTrak™ ':'') + base.name, wear:w[0], float:rnd(w[2],w[3]).toFixed(5), value, source, addedAt:Date.now()}));
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
    initInstallPrompt();
    purgeOldCaches();
    registerServiceWorker();
    window.addEventListener('pagehide', () => { try{ save(); }catch(e){} });
    window.addEventListener('storage', e => { if(e.key === LS_KEY || e.key === BACKUP_KEY){ state = loadState(); renderGlobals(); } });
    renderGlobals();
    save();
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

  function purgeOldCaches(){
    if('caches' in window){
      caches.keys().then(keys => Promise.all(keys.filter(k => /cs2-case-lab/i.test(k)).map(k => caches.delete(k)))).catch(()=>{});
    }
    if('serviceWorker' in navigator){
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(()=>{});
    }
  }

  async function loadJSON(url, timeoutMs=6500){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try{
      const res = await fetch(url, {cache:'no-store', signal:controller.signal});
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }finally{ clearTimeout(timeout); }
  }
  async function loadCatalog(){
    try{
      const [cratesRes, stickersRes, agentsRes, patchesRes, keychainsRes, collectiblesRes, skinsRes, collectionsRes] = await Promise.allSettled([
        loadJSON(API_CRATES), loadJSON(API_STICKERS), loadJSON(API_AGENTS), loadJSON(API_PATCHES), loadJSON(API_KEYCHAINS), loadJSON(API_COLLECTIBLES), loadJSON(API_SKINS), loadJSON(API_COLLECTIONS)
      ]);
      const crates = cratesRes.status === 'fulfilled' ? cratesRes.value : [];
      const stickers = stickersRes.status === 'fulfilled' ? stickersRes.value : [];
      const agents = agentsRes.status === 'fulfilled' ? agentsRes.value : [];
      const patches = patchesRes.status === 'fulfilled' ? patchesRes.value : [];
      const keychains = keychainsRes.status === 'fulfilled' ? keychainsRes.value : [];
      const collectibles = collectiblesRes.status === 'fulfilled' ? collectiblesRes.value : [];
      const skins = skinsRes.status === 'fulfilled' ? skinsRes.value : [];
      const collections = collectionsRes.status === 'fulfilled' ? collectionsRes.value : [];
      const built = buildCatalog({crates, stickers, agents, patches, keychains, collectibles, skins, collections});
      if(built.cases.length < 8 || built.items.length < 30) throw new Error('empty catalog');
      return built;
    }catch(e){
      console.warn('CS2 API fallback:', e);
      toast('Онлайн-каталог не загрузился — включил встроенный резервный пул. Механики всё равно работают.','warn');
      return buildOfflineCatalog();
    }
  }
  function buildOfflineCatalog(){
    const stickers = ['Sticker | Natus Vincere | Copenhagen 2024','Sticker | Team Spirit | Shanghai 2024','Sticker | FaZe Clan | Paris 2023','Sticker | G2 Esports | Austin 2025','Sticker | m0NESY | Copenhagen 2024'].map((n,i)=>({id:'offline-sticker-'+i,name:n,rarity:['High Grade','Remarkable','Exotic','Extraordinary'][i%4],rarityColor:rarityColors[['High Grade','Remarkable','Exotic','Extraordinary'][i%4]],value:120+i*180,weight:20-i*3,image:svgSkin(n,'#facc15','#60a5fa'),category:'sticker'}));
    const agents = ['Sir Bloody Miami Darryl | The Professionals','Cmdr. Mae | SWAT','Number K | The Professionals','Special Agent Ava | FBI'].map((n,i)=>({id:'offline-agent-'+i,name:n,rarity:['Master','Superior','Exceptional','Distinguished'][i%4],rarityColor:rarityColors[['Master','Superior','Exceptional','Distinguished'][i%4]],value:900+i*620,weight:9+i*2,image:svgSkin(n,'#111827','#f59e0b'),category:'agent'}));
    const charms = ['Charm | Hot Hands','Charm | Baby Karat T','Charm | Lil Squirt','Charm | Chicken Lil'].map((n,i)=>({id:'offline-charm-'+i,name:n,rarity:['High Grade','Remarkable','Exotic'][i%3],rarityColor:rarityColors[['High Grade','Remarkable','Exotic'][i%3]],value:180+i*190,weight:18-i*3,image:svgSkin(n,'#22c55e','#f97316'),category:'keychain'}));
    const patches = ['Patch | Metal Gold Nova','Patch | Bravo','Patch | Bayonet Frog','Patch | Phoenix'].map((n,i)=>({id:'offline-patch-'+i,name:n,rarity:['High Grade','Remarkable','Exotic'][i%3],rarityColor:rarityColors[['High Grade','Remarkable','Exotic'][i%3]],value:110+i*160,weight:18-i*3,image:svgSkin(n,'#94a3b8','#ef4444'),category:'patch'}));
    const items = [...fallbackItems, ...stickers, ...agents, ...charms, ...patches];
    const base = fallbackCases.map((c,i)=>withHiddenOdds(Object.assign({}, c, {items:c.items.map(applySteamLikePrice), price:Math.round(c.price*1.12), profitOdds:.42 + (i%4)*.08}),i));
    return {items, cases:[...base,
      createSpecialCase('quality-covert','Red Covert Case','Covert',items.filter(x=>x.rarity==='Covert'),2600,'Кейс с красными Covert-скинами.'),
      createSpecialCase('quality-classified','Pink Classified Case','Classified',items.filter(x=>x.rarity==='Classified'),1500,'Кейс с Classified-скинами.'),
      createSpecialCase('quality-restricted','Purple Restricted Case','Restricted',items.filter(x=>x.rarity==='Restricted'),850,'Кейс с Restricted-скинами.'),
      createSpecialCase('quality-milspec','Blue Mil-Spec Case','Mil-Spec Grade',items.filter(x=>x.rarity==='Mil-Spec Grade'),430,'Кейс с Mil-Spec-скинами.'),
      createSpecialCase('stickers-tournament','Tournament Stickers Case','High Grade',stickers,320,'Наклейки турниров.'),
      createSpecialCase('agents-case','Agents Case','Exceptional',agents,900,'Агенты CS2.'),
      createSpecialCase('charms-case','Armory Charms Case','Remarkable',charms,420,'Брелоки/charms.'),
      createSpecialCase('patches-case','Patches Case','Remarkable',patches,360,'Нашивки CS2.')
    ].filter(c=>c && c.items && c.items.length), source:'offline-fallback'};
  }
  function buildCatalog(data){
    const crates = Array.isArray(data.crates) ? data.crates : [];
    const stickersRaw = Array.isArray(data.stickers) ? data.stickers : [];
    const agentsRaw = Array.isArray(data.agents) ? data.agents : [];
    const patchesRaw = Array.isArray(data.patches) ? data.patches : [];
    const keychainsRaw = Array.isArray(data.keychains) ? data.keychains : [];
    const collectiblesRaw = Array.isArray(data.collectibles) ? data.collectibles : [];
    const skinsRaw = Array.isArray(data.skins) ? data.skins : [];
    const collectionsMetaRaw = Array.isArray(data.collections) ? data.collections : [];

    const preferredCases = ['Kilowatt Case','Revolution Case','Recoil Case','Dreams & Nightmares Case','Fracture Case','Clutch Case','Prisma 2 Case','Spectrum 2 Case','Operation Riptide Case','Snakebite Case','Horizon Case','Gamma 2 Case','Danger Zone Case','CS20 Case','Glove Case','Operation Broken Fang Case','Chroma 3 Case','Falchion Case','Shadow Case','Winter Offensive Weapon Case','Gallery Case','Fever Case','Operation Wildfire Case','Operation Vanguard Weapon Case','Huntsman Weapon Case','Operation Phoenix Weapon Case','CS:GO Weapon Case 2','CS:GO Weapon Case 3'];
    const preferredCollections = ['The Graphic Design Collection','The Sport & Field Collection','The Overpass 2024 Collection','The Gallery Collection','The Armory Collection','The Ascent Collection','The Boreal Collection','The Radiant Collection','The Anubis Collection','The 2021 Mirage Collection','The 2021 Dust 2 Collection','The 2021 Vertigo Collection','The Ancient Collection','The Norse Collection','The Canals Collection','The St. Marc Collection','The Cobblestone Collection','The Cache Collection','The Overpass Collection','The Gods and Monsters Collection','The Chop Shop Collection','The Control Collection','The Havoc Collection'];
    const casesRaw = crates.filter(c => c && c.type === 'Case' && Array.isArray(c.contains) && c.contains.length > 5);
    const collectionsRaw = crates.filter(c => c && c.type === 'Collection' && Array.isArray(c.contains) && c.contains.length > 5);
    const pickedCases = [];
    preferredCases.forEach(n => { const f = casesRaw.find(c => c.name === n); if(f && !pickedCases.includes(f)) pickedCases.push(f); });
    casesRaw.forEach(c => { if(pickedCases.length < 80 && !pickedCases.includes(c)) pickedCases.push(c); });
    const pickedCollections = [];
    preferredCollections.forEach(n => { const f = collectionsRaw.find(c => c.name === n); if(f && !pickedCollections.includes(f)) pickedCollections.push(f); });
    collectionsRaw.forEach(c => { if(pickedCollections.length < 50 && !pickedCollections.includes(c)) pickedCollections.push(c); });

    const all = new Map();
    function remember(items){ items.forEach(it => { if(it && it.id) all.set(it.id, it); }); return items; }
    function mapCrate(c, idx, kind='case'){
      const rawList = [...(c.contains||[]), ...(c.contains_rare||[])];
      const items = remember(rawList.map(raw => apiItem(raw, kind)).filter(Boolean));
      const price = calcPrice(items, idx, kind);
      return withHiddenOdds({id:(kind==='collection'?'col-':'case-') + (c.id || slug(c.name)), name:c.name, price, image:c.image || svgCase(c.name), items, source:kind==='collection'?'CS2 Collection':'CS2 Case', kind, rareText:c.loot_list && c.loot_list.footer ? c.loot_list.footer : (kind==='collection'?'Коллекция CS2 с реальными названиями предметов.':'Редкий спецпредмет внутри')}, idx);
    }
    const cases = [];
    pickedCases.forEach((c,idx) => { const mapped = mapCrate(c, idx, 'case'); if(mapped.items.length) cases.push(mapped); });
    pickedCollections.forEach((c,idx) => { const mapped = mapCrate(c, idx, 'collection'); if(mapped.items.length) cases.push(mapped); });

    const stickers = remember(stickersRaw.map(x=>apiItem(x,'sticker')).filter(Boolean));
    const agents = remember(agentsRaw.map(x=>apiItem(x,'agent')).filter(Boolean));
    const patches = remember(patchesRaw.map(x=>apiItem(x,'patch')).filter(Boolean));
    const keychains = remember(keychainsRaw.map(x=>apiItem(x,'keychain')).filter(Boolean));
    const collectibles = remember(collectiblesRaw.map(x=>apiItem(x,'collectible')).filter(Boolean));
    const skinItems = remember(skinsRaw.map(x=>apiItem(x,'skin')).filter(Boolean));

    const byCollection = new Map();
    skinsRaw.forEach(raw => {
      const mapped = apiItem(raw,'skin');
      const cols = raw.collections || raw.collection || raw.crates || [];
      const arr = Array.isArray(cols) ? cols : [cols];
      arr.forEach(col => {
        const name = typeof col === 'string' ? col : (col && (col.name || col.id));
        if(!name || !mapped) return;
        if(!byCollection.has(name)) byCollection.set(name, []);
        byCollection.get(name).push(mapped);
      });
    });
    collectionsMetaRaw.forEach((col,idx) => {
      const name = col && (col.name || col.id);
      const pool = byCollection.get(name) || (Array.isArray(col && col.contains) ? col.contains.map(x=>apiItem(x,'skin')).filter(Boolean) : []);
      if(pool && pool.length >= 4){
        const cc = withHiddenOdds({id:'collection-api-'+slug(name), name, price:calcPrice(pool,idx,'collection'), image:(col.image || svgCase(name)), items:pool, source:'CS2 Collection', kind:'collection', rareText:'Коллекция CS2 / Armory с реальными названиями предметов.'}, cases.length);
        cases.push(cc);
      }
    });

    const itemList = () => Array.from(all.values()).filter(Boolean);
    const items = itemList().length > 30 ? itemList() : fallbackItems;

    const add = c => { if(c && c.items && c.items.length >= 2) cases.push(withHiddenOdds(c, cases.length)); };
    add(createSpecialCase('quality-consumer','Grey / Consumer Case','Consumer Grade',items.filter(i=>['Consumer Grade','Base Grade'].includes(i.rarity)),120,'Низкая редкость / серый пул.'));
    add(createSpecialCase('quality-industrial','Light Blue Industrial Case','Industrial Grade',items.filter(i=>i.rarity === 'Industrial Grade'),220,'Industrial Grade пул.'));
    add(createSpecialCase('quality-green','Green High Grade / Charms Case','High Grade',items.filter(i=>['High Grade','Base Grade'].includes(i.rarity) || /charm|keychain|sticker/i.test(i.category || i.name)),310,'Зелёный пул: High Grade, брелоки и недорогие наклейки.'));
    add(createSpecialCase('quality-milspec','Blue Mil-Spec Case','Mil-Spec Grade',items.filter(i=>i.rarity === 'Mil-Spec Grade'),430,'Синий Mil-Spec пул.'));
    add(createSpecialCase('quality-restricted','Purple Restricted Case','Restricted',items.filter(i=>i.rarity === 'Restricted'),820,'Фиолетовый Restricted пул.'));
    add(createSpecialCase('quality-classified','Pink Classified Case','Classified',items.filter(i=>i.rarity === 'Classified'),1500,'Розовый Classified пул.'));
    add(createSpecialCase('quality-covert','Red Covert Case','Covert',items.filter(i=>i.rarity === 'Covert'),2700,'Красный Covert пул.'));
    add(createSpecialCase('special-knives','Knife Case','Exceedingly Rare',items.filter(i => i.name.startsWith('★') && !/gloves/i.test(i.name)),5400,'Отдельный пул ножей.'));
    add(createSpecialCase('special-gloves','Gloves Case','Extraordinary',items.filter(i => /gloves/i.test(i.name)),5200,'Отдельный пул перчаток.'));
    add(createSpecialCase('special-rare','Knives & Gloves Case','Exceedingly Rare',items.filter(i => i.name.startsWith('★') || /gloves/i.test(i.name)),6500,'Ножи и перчатки в одном дорогом кейсе.'));

    add(createSpecialCase('stickers-all','Sticker Capsule','High Grade',stickers,280,'Капсула с наклейками CS2.'));
    add(createSpecialCase('stickers-tournament','Tournament Stickers Case','Remarkable',filterByWords(stickers,['Major','Copenhagen','Shanghai','Austin','Paris','Antwerp','Stockholm','Rio','Katowice','Cologne','Berlin','Krakow','Atlanta']),360,'Турнирные наклейки.'));
    add(createSpecialCase('stickers-copenhagen','Copenhagen Stickers Capsule','Remarkable',filterByWords(stickers,['Copenhagen 2024']),390,'Наклейки Copenhagen 2024.'));
    add(createSpecialCase('stickers-shanghai','Shanghai Stickers Capsule','Remarkable',filterByWords(stickers,['Shanghai 2024']),390,'Наклейки Shanghai 2024.'));
    add(createSpecialCase('stickers-austin','Austin Stickers Capsule','Remarkable',filterByWords(stickers,['Austin 2025']),390,'Наклейки Austin 2025.'));
    add(createSpecialCase('stickers-paris','Paris Stickers Capsule','Remarkable',filterByWords(stickers,['Paris 2023']),390,'Наклейки Paris 2023.'));

    add(createSpecialCase('agents-all','Agents Case','Exceptional',agents,900,'Кейс с агентами CS2.'));
    add(createSpecialCase('agents-master','Master Agents Case','Master',agents.filter(i=>/Master/i.test(i.rarity)),2300,'Пул дорогих агентов Master.'));
    add(createSpecialCase('charms-all','Armory Charms Case','Remarkable',keychains,420,'Брелоки / charms из Armory.'));
    add(createSpecialCase('charms-small-arms','Small Arms Charms Case','Remarkable',filterByWords(keychains,['Small Arms','Charm']),470,'Брелоки Small Arms.'));
    add(createSpecialCase('patches-all','Patches Case','Remarkable',patches,330,'Кейс с нашивками.'));
    add(createSpecialCase('collectibles-all','Collectibles Case','High Grade',collectibles,260,'Коллекционные предметы.'));

    return {items, cases:dedupeCases(cases), source:'CSGO-API'};
  }
  function dedupeCases(arr){
    const seen = new Set();
    return arr.filter(c => { if(!c || !c.id || seen.has(c.id)) return false; seen.add(c.id); return true; });
  }
  function filterByWords(items, words){
    const low = words.map(w=>String(w).toLowerCase());
    return items.filter(i => low.some(w => String(i.name).toLowerCase().includes(w)));
  }
  function createSpecialCase(idv,name,rar,pool,price,text){
    pool = (pool || []).filter(Boolean).slice(0,240);
    if(pool.length < 2) return null;
    const items = pool.map(x => Object.assign({}, x, {weight: (rarityWeight[x.rarity] || 8) * (x.value > price ? .6 : 1.2)}));
    return {id:idv, name, price, image:svgCase(name.replace(/ Case| Capsule| Collection/g,'')), items, source:'Custom Pool', kind:'special', rareText:text};
  }
  function withHiddenOdds(c, idx=0){
    const profiles = [
      {profitOdds:.34,jackpot:.20,cheap:.16},{profitOdds:.42,jackpot:.26,cheap:.10},{profitOdds:.50,jackpot:.33,cheap:.06},{profitOdds:.28,jackpot:.16,cheap:.20},{profitOdds:.58,jackpot:.40,cheap:.03}
    ];
    const p = profiles[Math.abs(idx) % profiles.length];
    c._odds = p;
    return c;
  }
  function apiItem(raw, category='skin'){
    if(!raw || !raw.name) return null;
    const r = rarityName(raw, category);
    const base = applySteamLikePrice({id:raw.id || slug(raw.market_hash_name || raw.name), name:raw.name, rarity:r, rarityColor:rarityColor(raw,r), image:raw.image || svgSkin(raw.name), category, marketHashName:raw.market_hash_name || raw.name, weight:rarityWeight[r] || 7});
    return base;
  }
  function rarityName(raw, category){
    const v = raw.rarity;
    let r = typeof v === 'string' ? v : (v && (v.name || v.id)) || raw.rarity_name || '';
    r = String(r || '').replace(/_/g,' ').trim();
    if(!r){
      if(category === 'agent') r = 'Exceptional';
      else if(category === 'sticker' || category === 'patch' || category === 'keychain') r = 'High Grade';
      else r = 'Mil-Spec Grade';
    }
    if(/master/i.test(r) && category === 'agent') return 'Master';
    if(/superior/i.test(r) && category === 'agent') return 'Superior';
    if(/exceptional/i.test(r) && category === 'agent') return 'Exceptional';
    if(/distinguished/i.test(r) && category === 'agent') return 'Distinguished';
    return r;
  }
  function rarityColor(raw,r){ return (raw.rarity && raw.rarity.color) || raw.color || rarityColors[r] || '#60a5fa'; }
  function applySteamLikePrice(it){
    const name = String(it.name || '');
    const lower = name.toLowerCase();
    const known = knownSteamUSD(lower);
    const baseMap = { 'Consumer Grade':0.05,'Base Grade':0.06,'Industrial Grade':0.18,'Mil-Spec Grade':0.55,'Restricted':2.2,'Classified':8.5,'Covert':24,'Contraband':6500,'Exceedingly Rare':360,'Extraordinary':290,'High Grade':0.35,'Remarkable':1.4,'Exotic':5.5,'Distinguished':2.7,'Exceptional':6.8,'Superior':14,'Master':32,'Master Agent':32,'Superior Agent':14,'Exceptional Agent':6.8,'Distinguished Agent':2.7 };
    let usd = known || baseMap[it.rarity] || 1;
    if(it.category === 'sticker') usd *= /gold|holo|lenticular|foil/i.test(name) ? 2.6 : 1;
    if(it.category === 'patch') usd *= 0.85;
    if(it.category === 'keychain') usd *= 1.15;
    if(it.category === 'collectible') usd *= 0.75;
    if(/dragon lore|wild lotus|gungnir|howl|fire serpent|medusa|hydroponic|poseidon|desert hydra/i.test(name)) usd *= 1.8;
    const noise = .72 + stableNoise(name) * .72;
    const value = Math.max(6, Math.round(usd * LC_PER_USD * noise));
    return Object.assign({}, it, {value, steamUsd:Math.round(usd*noise*100)/100, weight: it.weight || rarityWeight[it.rarity] || 7});
  }
  function knownSteamUSD(lower){
    const m = [
      ['dragon lore',9500],['howl',5600],['wild lotus',7100],['gungnir',8300],['fire serpent',980],['medusa',4100],['desert hydra',1750],['prince',2400],['poseidon',1350],['hydroponic',1800],['dlore',9500],
      ['asiimov',58],['printstream',62],['vulcan',185],['kill confirmed',95],['neo-noir',31],['redline',23],['head shot',29],['the empress',78],['bloodsport',66],['bullet queen',38],['case hardened',110],['doppler',620],['gamma doppler',760],['fade',720],['slaughter',510],['crimson web',450],['vice',1400],['pandora',5300],['king snake',1150],['imperial plaid',820]
    ];
    const f = m.find(([k])=>lower.includes(k));
    return f ? f[1] : 0;
  }
  function stableNoise(str){
    let h=2166136261; str=String(str||'');
    for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h,16777619); }
    return ((h>>>0) % 1000) / 1000;
  }
  function calcPrice(items, idx, kind='case'){
    if(!items.length) return 300;
    const avg = weightedAverageValue(items);
    const mult = kind === 'collection' ? .58 : kind === 'special' ? .72 : .64;
    return clamp(Math.round(avg*mult + 180 + idx*11), 120, kind === 'special' ? 13000 : 4800);
  }
  function weightedAverageValue(items){
    const sumW = items.reduce((s,x)=>s+(rarityWeight[x.rarity]||x.weight||6),0) || 1;
    return items.reduce((s,x)=>s+(x.value||0)*(rarityWeight[x.rarity]||x.weight||6),0) / sumW;
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
      if(a === 'install-pwa') return installPWA();
      if(a === 'show-ios') return showIOSGuide();
    });
    document.addEventListener('input', e => {
      if(['invSearch','invRarity','invSort'].includes(e.target.id)) renderInventory();
      if(e.target.id === 'targetSearch') renderUpgradeTargets();
    });
    document.addEventListener('change', e => {
      if(['invRarity','invSort'].includes(e.target.id)) renderInventory();
      if(e.target.id === 'upgradeSource'){ state.pendingUpgrade = e.target.value; save(); renderUpgrade(); }
      if(e.target.id === 'battleCase' || e.target.id === 'battleMode') renderBattleInfo();
    });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') $$('.modal.show').forEach(m => { if(!m.dataset.locked) closeModal(m); }); });
  }

  function route(){
    state = loadState();
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
    if(page === 'install') return renderInstall();
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
  function closeModal(m){ if(!m) return; if(m.dataset.locked === '1') return toast('Окно закроется после окончания таймера','warn'); m.classList.remove('show'); }

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
  function themeColor(c){
    const key = `${c.id||''} ${c.name||''}`.toLowerCase();
    if(/green|high grade|charm|keychain/.test(key)) return '#22c55e';
    if(/red|covert/.test(key)) return '#ef4444';
    if(/pink|classified/.test(key)) return '#ec4899';
    if(/purple|restricted/.test(key)) return '#8b5cf6';
    if(/blue|mil-spec/.test(key)) return '#4b69ff';
    if(/industrial|light blue/.test(key)) return '#5e98d9';
    if(/grey|consumer/.test(key)) return '#b0c3d9';
    if(/knife|glove|rare/.test(key)) return '#ffd166';
    if(/sticker|capsule|tournament|copenhagen|shanghai|austin|paris/.test(key)) return '#facc15';
    if(/agent/.test(key)) return '#f97316';
    if(/patch/.test(key)) return '#94a3b8';
    return '#ff7a18';
  }
  function coverItems(c){
    const pool = (c && c.items ? c.items : []).filter(x=>x && x.image);
    const expensive = [...pool].sort((a,b)=>(b.value||0)-(a.value||0)).slice(0,8);
    const byRarity = [...pool].sort((a,b)=>(rarityValue[b.rarity]||0)-(rarityValue[a.rarity]||0)).slice(0,8);
    const merged = [];
    [...expensive, ...byRarity, ...pool].forEach(x => { if(merged.length < 5 && !merged.some(m=>m.id===x.id)) merged.push(x); });
    return merged.slice(0,5);
  }
  function caseVisual(c, big=false){
    const color = themeColor(c);
    const covers = coverItems(c);
    const classes = big ? 'case-visual big' : 'case-visual';
    const coverHtml = covers.length ? `<div class="case-cover-items">${covers.map((x,i)=>`<img class="cover-${i}" src="${esc(x.image)}" onerror="this.remove()" alt="${esc(x.name)}">`).join('')}</div>` : '';
    return `<div class="${classes}" style="--theme:${color}"><img class="case-img ${big?'big':''}" src="${esc(c.image||svgCase(c.name))}" onerror="this.src='${svgCase(c.name)}'" alt="${esc(c.name)}">${coverHtml}<span class="case-sheen"></span></div>`;
  }
  function caseCard(c){
    const kindLabel = c.kind === 'collection' ? 'Коллекция' : c.kind === 'special' ? 'Особый пул' : 'Кейс';
    return `<article class="case-card" style="--theme:${themeColor(c)}"><span class="case-kind">${esc(kindLabel)}</span>${caseVisual(c)}<h3>${esc(c.name)}</h3><div class="case-meta"><span>${c.items.length} предметов</span><b>${fmt(c.price)}</b></div><div class="mini-list">${[...new Set(c.items.map(i=>i.rarity))].slice(0,5).map(r=>`<span class="pill">${esc(r)}</span>`).join('')}</div><small class="source">${esc(c.source||catalog.source)}</small><div class="case-actions"><button class="btn primary" data-open-case="${esc(c.id)}">Крутить</button><button class="btn" data-view-case="${esc(c.id)}">Пул</button></div></article>`;
  }
  function renderHome(){
    const root = $('#homeRoot'); if(!root) return;
    const top = [...catalog.items].sort((a,b)=>b.value-a.value).slice(0,8);
    root.innerHTML = `${statCards()}<section class="block"><div class="head"><div><h2>Популярные кейсы</h2><p>Кнопка «Крутить» сразу открывает модальное окно, списывает баланс и запускает рулетку.</p></div><a class="btn primary" href="cases.html">Все кейсы</a></div><div class="grid case-grid">${catalog.cases.slice(0,6).map(caseCard).join('')}</div></section><section class="block"><div class="head"><div><h2>Редкие дропы</h2><p>Скины из текущего пула CS2.</p></div><a class="btn" href="ads.html">Получить LC</a></div><div class="grid item-grid">${top.map(x=>itemCard(x,{badge:'топ'})).join('')}</div></section>`;
  }
  function renderCases(){
    const root = $('#casesRoot'); if(!root) return;
    const is = (...ids) => c => ids.includes(c.id);
    const groups = [
      ['Официальные оружейные кейсы', catalog.cases.filter(c=>c.kind==='case')],
      ['Коллекции CS2 / Armory Pass', catalog.cases.filter(c=>c.kind==='collection')],
      ['Кейсы по качеству / цвету', catalog.cases.filter(c=>/^quality-/.test(c.id))],
      ['Ножи и перчатки', catalog.cases.filter(c=>/^special-/.test(c.id))],
      ['Турнирные наклейки', catalog.cases.filter(c=>/^stickers-/.test(c.id))],
      ['Агенты, брелоки, нашивки', catalog.cases.filter(c=>/^(agents|charms|patches|collectibles)-/.test(c.id))]
    ];
    root.innerHTML = `<div class="notice"><b>V${VERSION}:</b> добавлены расширенные CS2-пулы: кейсы, коллекции, quality-кейсы, стикеры турниров, агенты, charms/брелоки и patches. Шансы окупа настроены отдельно для каждого кейса и не выводятся в интерфейсе.</div>${groups.map(([title,arr]) => arr.length ? `<section class="block"><div class="head"><h2>${title}</h2><p>${arr.length} шт.</p></div><div class="case-grid grid">${arr.map(caseCard).join('')}</div></section>` : '').join('')}`;
  }
  function openCaseModal(caseId, autoSpin){
    const c = catalog.cases.find(x => x.id === caseId);
    if(!c) return toast('Кейс не найден','bad');
    currentCase = c.id;
    $('#caseModalTitle').textContent = c.name;
    const content = [...c.items].sort((a,b)=>(rarityValue[a.rarity]||0)-(rarityValue[b.rarity]||0)).map(x=>caseContentCard(x)).join('');
    $('#caseModalBody').innerHTML = `<div class="case-open-layout"><aside class="open-aside">${caseVisual(c,true)}<div class="notice">Цена открытия: <b>${fmt(c.price)}</b><br>${esc(c.rareText||'Внутри могут быть редкие предметы.')}</div><button class="btn primary huge" data-action="spin-current-case">Открыть за ${fmt(c.price)}</button><button class="btn" data-action="add-debug-coins">+10 000 LC для теста</button><p class="small">Стрелка по центру показывает предмет, который выпадет после остановки.</p></aside><section class="case-main"><div class="roulette-box"><div class="roulette-center-arrow"><span></span></div><div class="roulette-pointer"></div><div class="roulette-strip" id="rouletteStrip">${Array.from({length:20},()=>rollCard(weighted(c))).join('')}</div></div><h3>Содержимое кейса</h3><div class="case-contents">${content}</div></section></div>`;
    openModal('#caseModal');
    if(autoSpin) setTimeout(() => spinCase(c.id), 120);
  }
  function caseContentCard(it){
    return `<article class="content-card" style="--rar:${it.rarityColor||'#60a5fa'}"><div class="content-art"><img src="${esc(it.image||svgSkin(it.name))}" onerror="this.src='${svgSkin(it.name||'CS2 Skin')}'" alt="${esc(it.name)}"></div><b>${esc(it.name)}</b><small>${esc(it.rarity||'Skin')}</small><span>${fmt(it.value)}</span></article>`;
  }
  function rollCard(it){ return `<div class="roll-card" style="--rar:${it.rarityColor||'#60a5fa'}"><img src="${esc(it.image||svgSkin(it.name))}" onerror="this.src='${svgSkin(it.name||'Skin')}'"><b>${esc(it.name)}</b></div>`; }
  function weighted(c){
    const pool = c && c.items && c.items.length ? c.items : fallbackItems;
    const weights = pool.map(it => hiddenCaseWeight(it,c));
    const total = weights.reduce((s,x)=>s+x,0) || 1;
    let r = Math.random() * total;
    for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r <= 0) return pool[i]; }
    return pool[pool.length-1];
  }
  function hiddenCaseWeight(it,c){
    let w = Math.max(0.01, toNum(it.weight, rarityWeight[it.rarity] || 6));
    const price = Math.max(1, toNum(c && c.price, 1));
    const ratio = toNum(it.value,0) / price;
    const odds = (c && c._odds) || {profitOdds:.42,jackpot:.25,cheap:.1};
    if(ratio >= 1) w *= odds.profitOdds;
    if(ratio >= 2.2) w *= odds.jackpot;
    if(ratio < .45) w *= (1 + odds.cheap);
    if(c && c.kind === 'special') w *= ratio >= 1 ? 0.82 : 1.08;
    return w;
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
    state = loadState();
    renderGlobals();
    const root = $('#inventoryRoot'); if(!root) return;
    const controls = $('#inventoryControls');
    const prevQ = ($('#invSearch') && $('#invSearch').value || '').toLowerCase().trim();
    const prevR = $('#invRarity') ? $('#invRarity').value : 'all';
    const prevS = $('#invSort') ? $('#invSort').value : 'new';
    const rarities = [...new Set(state.inventory.map(x=>x.rarity).filter(Boolean))].sort((a,b)=>(rarityValue[b]||0)-(rarityValue[a]||0));
    if(controls){
      controls.innerHTML = `<input id="invSearch" placeholder="Поиск по названию" value="${esc(prevQ)}"><select id="invRarity"><option value="all">Все редкости</option>${rarities.map(x=>`<option value="${esc(x)}" ${prevR===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="invSort"><option value="new" ${prevS==='new'?'selected':''}>Сначала новые</option><option value="valueDesc" ${prevS==='valueDesc'?'selected':''}>Сначала дорогие</option><option value="valueAsc" ${prevS==='valueAsc'?'selected':''}>Сначала дешёвые</option><option value="rarity" ${prevS==='rarity'?'selected':''}>По редкости</option></select><button class="small-btn" data-action="sell-cheap">Продать дешевле 200 LC</button>`;
    }
    const q = ($('#invSearch') && $('#invSearch').value || prevQ).toLowerCase().trim();
    const r = $('#invRarity') ? $('#invRarity').value : prevR;
    const srt = $('#invSort') ? $('#invSort').value : prevS;
    let arr = [...state.inventory].map(normalizeInvItem).filter(Boolean);
    if(q) arr = arr.filter(x => (x.displayName||x.name).toLowerCase().includes(q));
    if(r !== 'all') arr = arr.filter(x => x.rarity === r);
    if(srt === 'valueDesc') arr.sort((a,b)=>b.value-a.value);
    else if(srt === 'valueAsc') arr.sort((a,b)=>a.value-b.value);
    else if(srt === 'rarity') arr.sort((a,b)=>(rarityValue[b.rarity]||0)-(rarityValue[a.rarity]||0));
    else arr.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
    root.innerHTML = arr.length ? `<div class="grid item-grid">${arr.map(x=>itemCard(x,{buttons:`<button data-sell="${esc(x.uid)}">Продать</button><button data-upgrade-item="${esc(x.uid)}">Апгрейд</button><button data-contract-item="${esc(x.uid)}">Контракт</button>`})).join('')}</div>` : `<div class="empty"><h3>Инвентарь пуст</h3><p>Открой кейс, выиграй battle или прокрути колесо. Если только что обновлял сайт на GitHub Pages — нажми Ctrl+F5, чтобы браузер не держал старый cache.</p><a class="btn primary" href="cases.html">К кейсам</a></div>`;
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
    root.innerHTML = `<div class="upgrade-layout"><aside class="panel"><h3>Твой предмет</h3>${selected?itemCard(selected):'<div class="empty">Нет предмета</div>'}<select id="upgradeSource">${options}</select><div id="upgradeChance"></div><button class="btn primary huge" data-action="do-upgrade" ${selected?'':'disabled'}>Апгрейд</button><p class="small">При проигрыше предмет исчезает. Это локальный фан-симулятор.</p></aside><section><div class="upgrade-roulette" id="upgradeRoulette"><div class="upgrade-arrow"></div><div class="upgrade-lane" id="upgradeLane"><span class="zone lose">LOSE</span><span class="zone win">WIN</span><span class="zone lose">LOSE</span></div></div><div class="filters"><input id="targetSearch" placeholder="Поиск цели"></div><div id="upgradeTargets" class="target-row"></div></section></div>`;
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
    const el = $('#upgradeChance');
    if(el) el.innerHTML = src && currentTarget ? `<p>Цель: <b>${esc(currentTarget.name)}</b> · ${fmt(currentTarget.value)}</p><div class="chance"><span style="width:${ch}%"></span></div><b>${ch.toFixed(2)}%</b>` : '';
    const win = $('#upgradeLane .win'); if(win) win.style.width = `${clamp(ch,4,76)}%`;
  }
  function doUpgrade(){
    if(busy.upgrade) return toast('Апгрейд уже крутится','warn');
    const src = state.inventory.find(x=>x.uid===state.pendingUpgrade) || state.inventory[0];
    const tgt = currentTarget;
    if(!src || !tgt) return toast('Выбери предмет и цель','bad');
    const ch = chance(src,tgt);
    busy.upgrade = true;
    const btn = $('[data-action="do-upgrade"]'); if(btn){ btn.disabled=true; btn.textContent='Крутится...'; }
    const lane = $('#upgradeLane');
    const success = Math.random()*100 <= ch;
    const winStart = 50 - ch/2;
    const winEnd = 50 + ch/2;
    const stopPercent = success ? rnd(winStart+1, winEnd-1) : (Math.random()<.5 ? rnd(2, Math.max(3,winStart-1)) : rnd(Math.min(97,winEnd+1),98));
    if(lane){
      lane.style.transition='none'; lane.style.transform='translateX(0)'; lane.getBoundingClientRect();
      requestAnimationFrame(()=>{ lane.style.transition='transform 3.6s cubic-bezier(.08,.75,.08,1)'; lane.style.transform=`translateX(calc(-${stopPercent}% + 50%))`; });
    }
    setTimeout(()=>{
      removeItems(src.uid); state.upgrades += 1;
      if(success){ const win = addItem(tgt,'upgrade'); state.pendingUpgrade=win.uid; addLive('Ты',win); toast(`Апгрейд успешен: ${win.displayName}`,'good'); showDrop(win,null); }
      else{ state.pendingUpgrade=null; toast('Апгрейд не прошёл, предмет сгорел','bad'); }
      busy.upgrade=false; save(); renderUpgrade();
    }, 3900);
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

  function cooldownLeft(){ return Math.max(0, (state.lastWheelAt || 0) + WHEEL_COOLDOWN - Date.now()); }
  function formatTime(ms){ const s=Math.ceil(ms/1000); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; return h>0?`${h}ч ${m}м ${sec}с`:`${m}м ${sec}с`; }
  function renderWheel(){
    const root = $('#wheelRoot'); if(!root) return;
    const left = cooldownLeft();
    root.innerHTML = `<div class="wheel-page"><div class="wheel-pointer"></div><div class="wheel" id="wheel"><span>LAB</span></div><button class="btn primary huge" data-action="spin-wheel" ${left?'disabled':''}>${left?'Доступно через '+formatTime(left):'Крутить бонусное колесо'}</button><div class="notice">Лимит: 1 прокрутка в 2 часа. После остановки сразу начисляет LC или предмет.</div><div id="wheelResult" class="wheel-result"></div></div>`;
    if(left) setTimeout(renderWheel, Math.min(left, 1000));
  }
  function spinWheel(){
    if(busy.wheel) return toast('Колесо уже крутится','warn');
    const left = cooldownLeft();
    if(left) return toast(`Колесо будет доступно через ${formatTime(left)}`,'warn');
    busy.wheel = true;
    state.lastWheelAt = Date.now(); save();
    const btn = $('[data-action="spin-wheel"]'); if(btn){ btn.disabled=true; btn.textContent='Крутится...'; }
    const rewards = [
      ['+250 LC','coins',250],['+500 LC','coins',500],['+750 LC','coins',750],['+1 000 LC','coins',1000],['+2 500 LC','coins',2500],['Промо +1 500 LC','coins',1500],['Случайный скин','item',0],['Редкий скин','rare',0]
    ];
    const idx = Math.floor(Math.random()*rewards.length);
    wheelDeg += 360*6 + (360 - idx*45) + rnd(8,35);
    const wh = $('#wheel'); if(wh) wh.style.transform = `rotate(${wheelDeg}deg)`;
    setTimeout(()=>{
      const [label,type,amount] = rewards[idx];
      if(type === 'coins'){ earn(amount,'Бонусное колесо'); $('#wheelResult').innerHTML = `<div class="result-card"><h2>${esc(label)}</h2><p>Баланс обновлён: ${fmt(state.balance)}</p></div>`; }
      else{
        let pool = catalog.items;
        if(type === 'rare') pool = catalog.items.filter(x => ['Classified','Covert','Exceedingly Rare','Extraordinary'].includes(x.rarity));
        const it = addItem(sample(pool.length?pool:catalog.items),'wheel'); addLive('Ты',it); $('#wheelResult').innerHTML = itemCard(it,{badge:'колесо'});
      }
      busy.wheel=false; renderWheel();
    }, 3300);
  }

  function todayAdViews(){ const k = DAY_KEY(); return Math.max(0, Math.round(toNum(state.adViews && state.adViews[k],0))); }
  function renderAds(){
    const root = $('#adsRoot'); if(!root) return;
    const used = todayAdViews();
    root.innerHTML = `<div class="ad-card"><div><span class="kicker">Реклама своих проектов</span><h2>10 секунд просмотра = ${fmt(AD_REWARD)}</h2><p>Окно рекламы нельзя закрыть до конца таймера. Лимит в статической версии: ${AD_DAILY_LIMIT} просмотров в сутки на браузер/устройство.</p><button class="btn primary huge" data-action="start-ad" ${used>=AD_DAILY_LIMIT?'disabled':''}>${used>=AD_DAILY_LIMIT?'Лимит на сегодня исчерпан':'Смотреть рекламу'}</button><p class="small">Сегодня использовано: <b>${used}/${AD_DAILY_LIMIT}</b></p></div><div class="project-grid">${projectCards()}</div></div>`;
  }
  function projectCards(){
    const p = [['Портфолио','Сайт-визитка и проекты','#'],['YouTube / видео','Ролики, конференции, обзоры','#'],['Подкаст','Финансы и учебные задания','#'],['GitHub','HTML-проекты и демо','#']];
    return p.map(x=>`<a class="project-card" href="${x[2]}"><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></a>`).join('');
  }
  function startAd(){
    if(busy.ad) return;
    const used = todayAdViews();
    if(used >= AD_DAILY_LIMIT) return toast('Лимит рекламы на сегодня исчерпан','warn');
    busy.ad = true;
    const modal = document.createElement('div');
    modal.className = 'modal show ad-lock-modal'; modal.dataset.locked = '1';
    modal.innerHTML = `<div class="modal-card ad-watch"><div class="modal-head"><h3>Реклама проекта</h3><button class="close" data-close-modal title="Закроется после таймера">×</button></div><div class="modal-body"><div class="ad-card"><div><span class="kicker">Просмотр ${AD_REWARD} LC</span><h2 id="adLockTitle">Осталось 10 секунд</h2><p>Закрытие заблокировано до конца просмотра.</p><div class="progress"><span id="adProgress"></span></div><p id="adTimer">10 сек.</p></div><div class="project-grid">${projectCards()}</div></div></div></div>`;
    document.body.appendChild(modal);
    const bar = $('#adProgress', modal); const timer = $('#adTimer', modal); const title = $('#adLockTitle', modal);
    let sec = 10; if(bar) bar.style.width='0%';
    const int = setInterval(()=>{
      sec--; if(bar) bar.style.width = `${(10-sec)*10}%`; if(timer) timer.textContent = sec>0 ? `${sec} сек.` : 'Готово'; if(title) title.textContent = sec>0 ? `Осталось ${sec} сек.` : 'Просмотр завершён';
      if(sec <= 0){
        clearInterval(int);
        const k = DAY_KEY(); state.adViews[k] = todayAdViews() + 1;
        earn(AD_REWARD,'Просмотр рекламы');
        busy.ad=false; modal.dataset.locked='0';
        modal.querySelector('.close').textContent = '×';
        setTimeout(()=>{ closeModal(modal); modal.remove(); renderAds(); }, 700);
      }
    },1000);
  }

  function renderBattle(){
    const root = $('#battleRoot'); if(!root) return;
    const first = catalog.cases[0];
    root.innerHTML = `<div class="battle-layout improved-battle"><aside class="panel battle-sidebar"><span class="kicker">Case Battle</span><h3>Баттл против ботов</h3><p>Ты оплачиваешь своё место. Каждый игрок открывает один и тот же кейс. Победитель по сумме дропа забирает весь пул.</p><label class="field-label">Кейс</label><select id="battleCase">${catalog.cases.map(c=>`<option value="${esc(c.id)}">${esc(c.name)} · ${fmt(c.price)}</option>`).join('')}</select><label class="field-label">Режим</label><select id="battleMode"><option value="1v1">1 vs 1</option><option value="1v1v1" selected>1 vs 1 vs 1</option><option value="2v2">2 vs 2 Team</option></select><div id="battleInfo"></div><button class="btn primary huge" data-action="start-battle">Начать баттл</button><p class="small">Без реальных ставок и вывода. Всё сохраняется в localStorage.</p></aside><section class="battle-stage"><div class="battle-top"><h2>Арена</h2><p id="battleStatus">Выбери кейс и режим, затем начни баттл.</p></div><div id="battleArena" class="battle-arena"><div class="empty">Пока баттла нет.</div></div></section></div>`;
    if(first) $('#battleCase').value = first.id;
    renderBattleInfo();
  }
  function battlePlayers(mode){
    if(mode === '1v1') return ['Ты','BOT Max'];
    if(mode === '2v2') return ['Ты','BOT Max','BOT Neo','BOT Rex'];
    return ['Ты','BOT Max','BOT Neo'];
  }
  function renderBattleInfo(){
    const c = catalog.cases.find(x=>x.id === ($('#battleCase') && $('#battleCase').value));
    const mode = ($('#battleMode') && $('#battleMode').value) || '1v1v1';
    const players = battlePlayers(mode);
    const el = $('#battleInfo');
    if(el && c) el.innerHTML = `<div class="battle-price"><span>Твоё место</span><b>${fmt(c.price)}</b></div><div class="battle-price"><span>Игроков</span><b>${players.length}</b></div><div class="battle-price"><span>Потенциальный пул</span><b>${fmt(c.price * players.length)}</b></div>`;
  }
  function battleRollStrip(c, finalItem){
    const cards = Array.from({length:34},()=>rollCard(weighted(c)));
    cards.push(rollCard(finalItem));
    return `<div class="roulette-box small battle-roll"><div class="roulette-center-arrow"><span></span></div><div class="roulette-pointer"></div><div class="roulette-strip">${cards.join('')}</div></div>`;
  }
  function startBattle(){
    if(busy.battle) return toast('Баттл уже идёт','warn');
    const c = catalog.cases.find(x=>x.id === ($('#battleCase') && $('#battleCase').value)); if(!c) return toast('Выбери кейс','bad');
    const mode = ($('#battleMode') && $('#battleMode').value) || '1v1v1';
    const names = battlePlayers(mode);
    if(!spend(c.price, `Case Battle: ${c.name}`)) return;
    busy.battle = true;
    state.battles += 1;
    save();
    const players = names.map((name,idx) => ({name, team: mode==='2v2' ? (idx%2===0?'A':'B') : name, item: weighted(c)}));
    const arena = $('#battleArena');
    const status = $('#battleStatus');
    if(status) status.textContent = 'Кейсы открываются...';
    arena.innerHTML = players.map(p => `<article class="battle-player"><div class="battle-player-head"><b>${esc(p.name)}</b>${mode==='2v2'?`<span class="pill">Team ${p.team}</span>`:''}</div>${battleRollStrip(c,p.item)}<p class="small">Крутится...</p></article>`).join('');
    $$('#battleArena .roulette-strip').forEach(strip => {
      strip.style.transition = 'none';
      strip.style.transform = 'translateX(0px)';
      strip.getBoundingClientRect();
      requestAnimationFrame(()=>{
        const last = strip.lastElementChild;
        const box = strip.closest('.roulette-box');
        const target = Math.max(0, last.offsetLeft - box.clientWidth/2 + last.clientWidth/2 + rnd(-14,14));
        strip.style.transition='transform 3.9s cubic-bezier(.08,.75,.08,1)';
        strip.style.transform=`translateX(-${target}px)`;
      });
    });
    setTimeout(()=>{
      const results = players.map(p => ({...p, inv: normalizeInvItem(Object.assign({}, p.item, {uid:id(), source:'battle', addedAt:Date.now(), value:Math.max(1,Math.round(toNum(p.item.value,100)*rnd(.92,1.12)))}))}));
      let winner;
      if(mode === '2v2'){
        const sums = results.reduce((m,x)=>{m[x.team]=(m[x.team]||0)+x.inv.value; return m;},{});
        const winTeam = (sums.A >= sums.B) ? 'A' : 'B';
        winner = {team:winTeam, name:`Team ${winTeam}`, value:sums[winTeam]};
      }else{
        const top = [...results].sort((a,b)=>b.inv.value-a.inv.value)[0];
        winner = {team:top.team, name:top.name, value:top.inv.value};
      }
      const userWon = mode === '2v2' ? winner.team === 'A' : winner.name === 'Ты';
      arena.innerHTML = `<div class="battle-summary ${userWon?'win':'lose'}"><h2>${userWon?'Победа!':'Поражение'}</h2><p>${esc(winner.name)} забирает пул на ${fmt(results.reduce((s,x)=>s+x.inv.value,0))}</p></div>` + results.map(x => `<article class="battle-player result ${((mode==='2v2' && x.team===winner.team) || (mode!=='2v2' && x.name===winner.name))?'winner':''}"><div class="battle-player-head"><b>${esc(x.name)}</b>${mode==='2v2'?`<span class="pill">Team ${x.team}</span>`:''}</div>${itemCard(x.inv,{badge:fmt(x.inv.value)})}</article>`).join('');
      if(userWon){
        state.wins += 1;
        results.forEach(x => { const it = addItem(Object.assign({}, x.inv, {uid:undefined}), 'battle-win'); addLive('Ты',it); });
        toast('Ты выиграл баттл — весь пул добавлен в инвентарь','good');
      }else{
        toast(`${winner.name} выиграл. Твой дроп не добавлен в инвентарь.`, 'bad');
      }
      if(status) status.textContent = userWon ? 'Пул начислен в инвентарь.' : 'Баттл завершён.';
      busy.battle = false;
      save();
      renderBattleInfo();
    }, 4300);
  }

  let deferredInstallPrompt = null;
  function initInstallPrompt(){
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; $$('.js-install-ready').forEach(x=>x.textContent='Готово к установке'); });
  }
  function registerServiceWorker(){
    // V9 intentionally unregisters old service workers: previous builds cached stale JS/HTML and broke balance/inventory.
    if('serviceWorker' in navigator){
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(()=>{});
    }
  }
  async function installPWA(){
    if(deferredInstallPrompt){
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(()=>null);
      deferredInstallPrompt = null;
      return;
    }
    toast('Если кнопка установки недоступна: Chrome/Edge → меню ⋮ → Установить приложение. На iOS используй инструкцию ниже.','warn');
  }
  function showIOSGuide(){
    let modal = $('#iosGuideModal');
    if(!modal){
      document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="iosGuideModal"><div class="modal-card"><div class="modal-head"><h3>Как добавить на экран iPhone</h3><button class="close" data-close-modal>×</button></div><div class="modal-body"><div class="panel"><ol class="steps"><li>Открой сайт в Safari.</li><li>Нажми кнопку «Поделиться».</li><li>Выбери «На экран Домой».</li><li>Подтверди название CS2 Case Lab.</li></ol><p>После этого сайт будет открываться как обычная иконка приложения.</p></div></div></div></div>`);
      modal = $('#iosGuideModal');
    }
    openModal(modal);
  }
  function renderInstall(){
    const root = $('#installRoot'); if(!root) return;
    root.innerHTML = `<div class="grid cards-3"><article class="panel"><span class="kicker">Windows / Chrome / Edge</span><h2>Установить как приложение</h2><p>На GitHub Pages сайт можно открыть с любого устройства. На Windows кнопка вызовет установку PWA, если браузер поддерживает её.</p><button class="btn primary huge" data-action="install-pwa">Установить на Windows</button><p class="small js-install-ready">Если кнопка не появилась: меню браузера → «Установить приложение».</p></article><article class="panel"><span class="kicker">iPhone / iPad</span><h2>Иконка на главный экран</h2><p>Для iOS установка идёт через Safari, без exe и без App Store.</p><button class="btn blue huge" data-action="show-ios">Показать инструкцию iOS</button></article><article class="panel"><span class="kicker">Offline ZIP</span><h2>Скачать сборку</h2><p>ZIP можно распаковать на Windows и открыть <b>index.html</b> или залить содержимое на GitHub Pages.</p><a class="btn huge" href="download/cs2-case-lab-windows.zip" download>Скачать ZIP для Windows</a></article></div><div class="notice block"><b>Важно:</b> реальный лимит «10 реклам на IP» невозможен в чистом GitHub Pages без бэкенда. В этой версии лимит реализован для браузера/устройства через localStorage; для IP-лимита нужен сервер или Cloudflare Worker.</div>`;
  }

  function storageStatusText(){
    try{
      const test = '__cs2_case_lab_test__'; localStorage.setItem(test,'1'); localStorage.removeItem(test);
      const raw = localStorage.getItem(LS_KEY) || '';
      return `<span class="plus">localStorage работает</span><br><small>Размер save: ${Math.round(raw.length/1024)} KB · ключ: ${LS_KEY}</small>`;
    }catch(e){
      return `<span class="minus">localStorage заблокирован</span><br><small>Прогресс будет держаться только в этой вкладке через sessionStorage.</small>`;
    }
  }
  function renderProfile(){
    const root = $('#profileRoot'); if(!root) return;
    root.innerHTML = `${statCards()}<div class="grid cards-3 block"><div class="panel"><h3>Статистика</h3><p>Апгрейды: <b>${state.upgrades}</b></p><p>Контракты: <b>${state.contracts}</b></p><p>Баттлы: <b>${state.battles}</b></p><p>Победы: <b>${state.wins}</b></p><p>Продано: <b>${fmt(state.sold)}</b></p></div><div class="panel"><h3>Сохранение</h3><p>Версия save: <b>${esc(state.version||VERSION)}</b></p><p>${storageStatusText()}</p><button class="btn" data-action="export-save">Экспорт</button><button class="btn" data-action="import-save">Импорт</button><textarea id="saveBox" placeholder="Тут появится или сюда вставляется save"></textarea></div><div class="panel danger"><h3>Сброс</h3><p>Полностью чистит сохранение и возвращает 15 000 LC. Также убирает старые сломанные ключи v3–v8.</p><button class="btn red" data-action="reset-save">Сбросить прогресс</button><button class="btn" data-action="add-debug-coins">+10 000 LC</button></div></div><section class="block"><div class="head"><h2>История баланса</h2></div><div class="tx-list">${state.tx.slice(0,25).map(t=>`<div class="tx"><div><b>${esc(t.text)}</b><small>${new Date(t.time).toLocaleString('ru-RU')}</small></div><strong class="${t.amount>=0?'plus':'minus'}">${t.amount>=0?'+':''}${fmt(t.amount)}</strong></div>`).join('') || '<div class="empty">История пуста.</div>'}</div></section>`;
  }
  function resetSave(){
    if(!confirm('Сбросить прогресс и вернуть стартовый баланс 15 000 LC?')) return;
    try{ allSaveKeys().forEach(k => localStorage.removeItem(k)); localStorage.removeItem(LS_KEY); }catch(e){}
    try{ sessionStorage.removeItem(BACKUP_KEY); }catch(e){}
    state = defaultState(); save(); toast('Прогресс сброшен','good'); route();
  }
  function exportSave(){ const box=$('#saveBox'); if(box) box.value = btoa(unescape(encodeURIComponent(JSON.stringify(compactState(state))))); toast('Save выгружен в поле','good'); }
  function importSave(){
    const box=$('#saveBox'); if(!box || !box.value.trim()) return toast('Вставь save в поле','bad');
    try{ state = compactState(JSON.parse(decodeURIComponent(escape(atob(box.value.trim()))))); save(); toast('Save импортирован','good'); route(); }
    catch(e){ toast('Не удалось импортировать save','bad'); }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
