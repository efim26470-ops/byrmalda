/* CS2 Case Lab v2 — static GitHub Pages simulator.
   No real payments, no Steam, no withdraws. Everything is localStorage. */
(() => {
  'use strict';

  const STORAGE_KEY = 'cs2CaseLabV2';
  const LEGACY_KEY = 'cs2CaseLab';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmt = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
  const now = () => Date.now();
  const uid = () => 'it_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const safe = s => String(s ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));

  const rarities = {
    consumer:   {label:'Common',      short:'CMN', color:'#9aa8c7', glow:'rgba(154,168,199,.25)', weight:44, order:1},
    industrial: {label:'Industrial',  short:'IND', color:'#54a8ff', glow:'rgba(84,168,255,.28)', weight:26, order:2},
    milspec:    {label:'Mil-Spec',    short:'MIL', color:'#3358ff', glow:'rgba(51,88,255,.35)', weight:15, order:3},
    restricted: {label:'Restricted',  short:'RES', color:'#9b6cff', glow:'rgba(155,108,255,.38)', weight:7.5, order:4},
    classified: {label:'Classified',  short:'CLS', color:'#ff55c8', glow:'rgba(255,85,200,.38)', weight:3.2, order:5},
    covert:     {label:'Covert',      short:'COV', color:'#ff5470', glow:'rgba(255,84,112,.42)', weight:1.15, order:6},
    special:    {label:'Special',     short:'SPC', color:'#ffd36c', glow:'rgba(255,211,108,.44)', weight:.36, order:7},
    contraband: {label:'Contraband',  short:'XTR', color:'#ff9d2e', glow:'rgba(255,157,46,.5)', weight:.12, order:8}
  };

  const items = [
    {id:'p2000_blueprint', name:'P2000 | Blue Grid', kind:'pistol', rarity:'consumer', value:34, palette:['#7eb7ff','#1b3157','#bde7ff']},
    {id:'glock_candy', name:'Glock-18 | Candy Node', kind:'pistol', rarity:'consumer', value:42, palette:['#ff7bc8','#3a1635','#ffe4fb']},
    {id:'usp_night', name:'USP-S | Night Proxy', kind:'pistol', rarity:'consumer', value:58, palette:['#8792aa','#101521','#6cf3ff']},
    {id:'mac10_pixel', name:'MAC-10 | Pixel Rain', kind:'smg', rarity:'industrial', value:95, palette:['#6cf3ff','#1b2548','#ff55c8']},
    {id:'mp9_signal', name:'MP9 | Signal Mint', kind:'smg', rarity:'industrial', value:125, palette:['#65ffb7','#17392c','#e9fff6']},
    {id:'galil_sand', name:'Galil AR | Sandbyte', kind:'rifle', rarity:'industrial', value:155, palette:['#e8c270','#372812','#fff0b3']},
    {id:'famas_amber', name:'FAMAS | Amber Chain', kind:'rifle', rarity:'milspec', value:240, palette:['#ffd36c','#46300b','#ff5470']},
    {id:'deagle_byte', name:'Desert Eagle | Byteburn', kind:'pistol', rarity:'milspec', value:310, palette:['#ff5470','#35151d','#ffd36c']},
    {id:'ump_arctic', name:'UMP-45 | Arctic Script', kind:'smg', rarity:'milspec', value:370, palette:['#bde7ff','#172a44','#6cf3ff']},
    {id:'ak_circuit', name:'AK-47 | Circuit Board', kind:'rifle', rarity:'restricted', value:620, palette:['#65ffb7','#101d1a','#6cf3ff']},
    {id:'m4_neon', name:'M4A1-S | Neon Pulse', kind:'rifle', rarity:'restricted', value:760, palette:['#ff55c8','#24133a','#6cf3ff']},
    {id:'awp_orbit', name:'AWP | Orbit Drift', kind:'sniper', rarity:'restricted', value:890, palette:['#9b6cff','#171027','#ffd36c']},
    {id:'ak_redline', name:'AK-47 | Red Reactor', kind:'rifle', rarity:'classified', value:1320, palette:['#ff355f','#23070f','#ff9d2e']},
    {id:'m4_goldcore', name:'M4A4 | Gold Core', kind:'rifle', rarity:'classified', value:1580, palette:['#ffd36c','#29220e','#ffffff']},
    {id:'awp_dragonproxy', name:'AWP | Dragon Proxy', kind:'sniper', rarity:'classified', value:1840, palette:['#ff5470','#1a0f1c','#ffd36c']},
    {id:'ak_void', name:'AK-47 | Void Pattern', kind:'rifle', rarity:'covert', value:2860, palette:['#9b6cff','#050511','#65ffb7']},
    {id:'m4_howl_fake', name:'M4A4 | Phantom Howl', kind:'rifle', rarity:'covert', value:3420, palette:['#ff5470','#140811','#ffd36c']},
    {id:'awp_solar', name:'AWP | Solar Rail', kind:'sniper', rarity:'covert', value:3980, palette:['#ffd36c','#251500','#ff5470']},
    {id:'knife_shadow', name:'Flip Knife | Shadow Glass', kind:'knife', rarity:'special', value:6900, palette:['#b7c5ff','#101525','#6cf3ff']},
    {id:'knife_karambit', name:'Karambit | Lab Fade', kind:'knife', rarity:'special', value:10400, palette:['#6cf3ff','#31165c','#ff55c8']},
    {id:'knife_butterfly', name:'Butterfly Knife | Solar Edge', kind:'knife', rarity:'special', value:12600, palette:['#ffd36c','#3b2007','#ff5470']},
    {id:'gloves_neon', name:'Sport Gloves | Neon Circuit', kind:'gloves', rarity:'special', value:9400, palette:['#65ffb7','#10251d','#9b6cff']},
    {id:'gloves_gold', name:'Driver Gloves | Gold Grid', kind:'gloves', rarity:'special', value:11200, palette:['#ffd36c','#31270c','#ffffff']},
    {id:'m4_titan', name:'M4A1-S | Titan Memory', kind:'rifle', rarity:'contraband', value:18000, palette:['#ff9d2e','#140a05','#6cf3ff']},
    {id:'awp_blackstar', name:'AWP | Black Star', kind:'sniper', rarity:'contraband', value:24500, palette:['#ffffff','#050508','#ffd36c']},
    {id:'tec9_berry', name:'Tec-9 | Berry Shock', kind:'pistol', rarity:'industrial', value:130, palette:['#ff55c8','#35102d','#bde7ff']},
    {id:'p90_lime', name:'P90 | Lime Engine', kind:'smg', rarity:'milspec', value:285, palette:['#b7ff4d','#1b2b0c','#6cf3ff']},
    {id:'sg553_vapor', name:'SG 553 | Vapor Lab', kind:'rifle', rarity:'restricted', value:540, palette:['#6cf3ff','#112438','#9b6cff']},
    {id:'ssg_ghost', name:'SSG 08 | Ghost Pulse', kind:'sniper', rarity:'restricted', value:680, palette:['#8792aa','#131722','#65ffb7']},
    {id:'aug_prism', name:'AUG | Prism Core', kind:'rifle', rarity:'classified', value:1180, palette:['#9b6cff','#1d1433','#6cf3ff']},
    {id:'nova_sticker', name:'Nova | Sticker Bomb', kind:'shotgun', rarity:'consumer', value:49, palette:['#ffd36c','#352108','#ff55c8']},
    {id:'xm1014_cobalt', name:'XM1014 | Cobalt Rush', kind:'shotgun', rarity:'industrial', value:144, palette:['#54a8ff','#0f1b2f','#ffffff']},
    {id:'mag7_inferno', name:'MAG-7 | Inferno Tape', kind:'shotgun', rarity:'milspec', value:260, palette:['#ff5470','#2f0b11','#ffd36c']},
    {id:'sawed_venom', name:'Sawed-Off | Venom Byte', kind:'shotgun', rarity:'restricted', value:505, palette:['#65ffb7','#0e261a','#ff55c8']},
    {id:'zeus_arcade', name:'Zeus x27 | Arcade Shock', kind:'pistol', rarity:'classified', value:990, palette:['#6cf3ff','#141b35','#ffd36c']},
    {id:'five7_ruby', name:'Five-SeveN | Ruby Net', kind:'pistol', rarity:'restricted', value:720, palette:['#ff5470','#2d0610','#ffffff']},
    {id:'dualies_matrix', name:'Dual Berettas | Matrix', kind:'pistol', rarity:'milspec', value:275, palette:['#65ffb7','#101713','#6cf3ff']},
    {id:'mp7_graffiti', name:'MP7 | Graffiti Flow', kind:'smg', rarity:'restricted', value:450, palette:['#ff55c8','#1e1330','#ffd36c']},
    {id:'ak_ice', name:'AK-47 | Ice Packet', kind:'rifle', rarity:'covert', value:3760, palette:['#bde7ff','#0a1324','#6cf3ff']},
    {id:'knife_talon', name:'Talon Knife | Data Fade', kind:'knife', rarity:'special', value:13200, palette:['#9b6cff','#0d0a19','#65ffb7']}
  ];

  const cases = [
    {id:'budget', name:'Budget Farm', price:75, tag:'фарм монет', cover:'BF', gradient:'linear-gradient(135deg,#65ffb7,#114536)', desc:'Дешёвый кейс для первых открытий и заполнения инвентаря.', pool:['p2000_blueprint','glock_candy','usp_night','mac10_pixel','mp9_signal','nova_sticker','xm1014_cobalt','famas_amber']},
    {id:'starter', name:'Starter Lab', price:145, tag:'стартовый микс', cover:'SL', gradient:'linear-gradient(135deg,#6cf3ff,#3358ff)', desc:'Сбалансированный пул с пистолетами, SMG и первыми винтовками.', pool:['p2000_blueprint','usp_night','mac10_pixel','mp9_signal','galil_sand','famas_amber','deagle_byte','p90_lime','mag7_inferno']},
    {id:'eco', name:'Eco Rush', price:260, tag:'дешёвые винтовки', cover:'ER', gradient:'linear-gradient(135deg,#b7ff4d,#1c3f11)', desc:'Быстрый кейс с хорошим шансом на mil-spec и restricted.', pool:['mac10_pixel','mp9_signal','galil_sand','famas_amber','deagle_byte','ump_arctic','p90_lime','sg553_vapor','dualies_matrix']},
    {id:'neon', name:'Neon Strike', price:520, tag:'неоновые скины', cover:'NS', gradient:'linear-gradient(135deg,#ff55c8,#6cf3ff)', desc:'Яркий кейс с красивыми розово-голубыми рендерами.', pool:['deagle_byte','ump_arctic','ak_circuit','m4_neon','awp_orbit','five7_ruby','mp7_graffiti','sg553_vapor','aug_prism']},
    {id:'rifle', name:'Rifle Dreams', price:890, tag:'AK / M4 / AUG', cover:'RD', gradient:'linear-gradient(135deg,#ffd36c,#ff5470)', desc:'Основной кейс для винтовок и дорогих classified-дропов.', pool:['famas_amber','ak_circuit','m4_neon','sg553_vapor','aug_prism','ak_redline','m4_goldcore','ak_void','m4_howl_fake','ak_ice']},
    {id:'sniper', name:'Sniper Fever', price:1120, tag:'AWP / SSG', cover:'SF', gradient:'linear-gradient(135deg,#9b6cff,#11172a)', desc:'Снайперский пул с AWP, SSG и шансом на топовую винтовку.', pool:['ssg_ghost','awp_orbit','awp_dragonproxy','awp_solar','aug_prism','ak_redline','m4_goldcore','awp_blackstar']},
    {id:'covert', name:'Covert Heat', price:1680, tag:'дорогой пул', cover:'CH', gradient:'linear-gradient(135deg,#ff5470,#250d17)', desc:'Высокий риск: меньше дешёвых предметов, больше covert.', pool:['ak_circuit','m4_neon','awp_orbit','ak_redline','m4_goldcore','awp_dragonproxy','ak_void','m4_howl_fake','awp_solar','ak_ice','m4_titan']},
    {id:'knife', name:'Knife Mirage', price:2450, tag:'ножи', cover:'KM', gradient:'linear-gradient(135deg,#ffd36c,#9b6cff)', desc:'Пул с небольшим шансом на ножи и топовые covert-предметы.', pool:['m4_goldcore','awp_dragonproxy','ak_void','m4_howl_fake','awp_solar','knife_shadow','knife_karambit','knife_butterfly','knife_talon','m4_titan']},
    {id:'gloves', name:'Glove Circuit', price:2750, tag:'перчатки', cover:'GC', gradient:'linear-gradient(135deg,#65ffb7,#ffd36c)', desc:'Особый кейс с перчатками, ножами и дорогими винтовками.', pool:['ak_void','m4_howl_fake','awp_solar','knife_shadow','gloves_neon','gloves_gold','knife_talon','awp_blackstar']},
    {id:'elite', name:'Elite Contract', price:4200, tag:'high roller', cover:'EC', gradient:'linear-gradient(135deg,#ffffff,#ffd36c 35%,#9b6cff)', desc:'Самый дорогой кейс симулятора: шанс на contraband и special.', pool:['ak_redline','m4_goldcore','awp_dragonproxy','ak_void','m4_howl_fake','awp_solar','knife_karambit','knife_butterfly','gloves_neon','gloves_gold','m4_titan','awp_blackstar']}
  ];

  const projects = [
    {title:'Портфолио Ефима', desc:'Личный сайт с учебными и творческими работами.', url:'#', badge:'WEB'},
    {title:'Пасьянс Косынка PWA', desc:'Игра, которую можно добавить на главный экран iPhone.', url:'#', badge:'GAME'},
    {title:'Сайт ЧМ 2026', desc:'Матчи, таблицы, статистика, карточки игроков и live-раздел.', url:'#', badge:'SPORT'},
    {title:'Учебные презентации', desc:'Доклады, схемы, таблицы и материалы по колледжу.', url:'#', badge:'STUDY'},
    {title:'Подкаст про финансы', desc:'Видео/диск с доп. заданием по финансовому модулю.', url:'#', badge:'VIDEO'}
  ];

  const bots = ['RUSH_B', 'AKIMBO', 'NEONFOX', 'DUSTY', 'MIRAGE_KING', 'BYTEBOT', 'AWP_CAT', 'ECO_PRO'];

  function itemById(id){ return items.find(it => it.id === id); }
  function caseById(id){ return cases.find(c => c.id === id) || cases[0]; }
  function rarityOf(it){ return rarities[it?.rarity] || rarities.consumer; }

  function defaultState(){
    return {
      version: 2,
      balance: 2800,
      inventory: [],
      history: [],
      opened: 0,
      bestId: null,
      bestValue: 0,
      selectedForUpgrade: null,
      contractBasket: [],
      wheelRotation: 0,
      lastWheel: 0,
      lastDaily: 0,
      stats: {spent:0, earned:0, ads:0, upgrades:0, upgradeWins:0, battles:0, battleWins:0, contracts:0}
    };
  }

  function normalizeInstance(raw){
    if(!raw) return null;
    let it = itemById(raw.itemId) || itemById(raw.id) || items.find(x => x.name === raw.name) || items[0];
    return {
      uid: raw.uid || uid(),
      itemId: it.id,
      name: it.name,
      kind: it.kind,
      rarity: it.rarity,
      value: Number(raw.value || it.value),
      palette: it.palette,
      source: raw.source || 'legacy',
      obtained: raw.obtained || new Date().toISOString(),
      locked: !!raw.locked
    };
  }

  function normalizeState(raw){
    const base = defaultState();
    if(!raw || typeof raw !== 'object') return base;
    const st = {...base, ...raw};
    st.version = 2;
    st.balance = Number(st.balance || 0);
    st.inventory = Array.isArray(raw.inventory) ? raw.inventory.map(normalizeInstance).filter(Boolean) : [];
    st.history = Array.isArray(raw.history) ? raw.history.slice(0, 60) : [];
    st.contractBasket = Array.isArray(raw.contractBasket) ? raw.contractBasket.filter(id => st.inventory.some(x => x.uid === id)) : [];
    st.stats = {...base.stats, ...(raw.stats || {})};
    const best = st.inventory.reduce((a,b)=> b.value > (a?.value || 0) ? b : a, null);
    if(best){ st.bestId = best.itemId; st.bestValue = best.value; }
    return st;
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
      return normalizeState(raw ? JSON.parse(raw) : null);
    }catch(e){ return defaultState(); }
  }

  let state = loadState();
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); updateWallet(); }

  function createInstance(item, source='drop'){
    return normalizeInstance({uid:uid(), itemId:item.id, value:item.value, source, obtained:new Date().toISOString()});
  }

  function addHistory(instance, meta={}){
    const entry = {
      uid: instance.uid,
      itemId: instance.itemId,
      name: instance.name,
      value: instance.value,
      rarity: instance.rarity,
      source: instance.source || meta.source || 'drop',
      caseName: meta.caseName || '',
      time: Date.now()
    };
    state.history.unshift(entry);
    state.history = state.history.slice(0, 70);
  }

  function setBest(instance){
    if(instance.value > (state.bestValue || 0)){
      state.bestId = instance.itemId;
      state.bestValue = instance.value;
    }
  }

  function pickWeighted(poolIds){
    const entries = poolIds.map(itemById).filter(Boolean);
    const total = entries.reduce((sum, it) => sum + rarityOf(it).weight, 0);
    let r = Math.random() * total;
    for(const it of entries){
      r -= rarityOf(it).weight;
      if(r <= 0) return it;
    }
    return entries[0] || items[0];
  }

  function chooseByValue(min, max){
    const candidates = items.filter(it => it.value >= min && it.value <= max);
    if(candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
    return [...items].sort((a,b)=> Math.abs(a.value - ((min+max)/2)) - Math.abs(b.value - ((min+max)/2)))[0];
  }

  function weaponSVG(itemLike, size='normal'){
    const it = itemLike.itemId ? itemById(itemLike.itemId) || itemLike : itemLike;
    const [c1,c2,c3] = it.palette || ['#6cf3ff','#11172a','#ffd36c'];
    const r = rarityOf(it);
    const gid = 'g' + Math.random().toString(36).slice(2, 8);
    const line = `stroke="rgba(255,255,255,.72)" stroke-width="2" stroke-linecap="round"`;
    const base = `
      <defs><linearGradient id="${gid}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs>
      <ellipse cx="142" cy="118" rx="100" ry="18" fill="${r.glow}"/>
      <circle cx="236" cy="26" r="18" fill="${r.color}" opacity=".14"/>
      <path d="M30 26 L75 12 L124 18" fill="none" stroke="${r.color}" opacity=".35" stroke-width="4"/>`;
    let shape = '';
    switch(it.kind){
      case 'sniper':
        shape = `<rect x="41" y="68" width="168" height="20" rx="7" fill="url(#${gid})"/><rect x="205" y="72" width="52" height="8" rx="4" fill="${c1}"/><rect x="24" y="73" width="34" height="12" rx="4" fill="${c2}"/><rect x="94" y="47" width="64" height="13" rx="7" fill="${c3}"/><circle cx="111" cy="53" r="15" fill="none" ${line}/><circle cx="145" cy="53" r="15" fill="none" ${line}/><path d="M95 88 l-18 35 h28 l12-35" fill="${c2}"/><path d="M150 88 l18 26 h30 l-25-26" fill="${c1}" opacity=".85"/>`;
        break;
      case 'rifle':
        shape = `<path d="M35 70 h128 l22 14 h58 v13 h-73 l-27-14 H74 l-18 26 H31 l15-30 H35z" fill="url(#${gid})"/><path d="M31 70 l-22 18 h28 l21-16" fill="${c2}"/><rect x="238" y="85" width="35" height="7" rx="3" fill="${c1}"/><path d="M119 95 l15 40 h30 l-9-40" fill="${c2}"/><path d="M58 58 h70" ${line}/><path d="M174 78 l22 -18" ${line}/>`;
        break;
      case 'smg':
        shape = `<path d="M48 66 h112 l20 13 h50 v18 h-72 l-18-13 H81 l-14 28 H42 l12-31 H48z" fill="url(#${gid})"/><rect x="224" y="82" width="31" height="6" rx="3" fill="${c1}"/><path d="M104 93 l6 38 h28 l-4-38" fill="${c2}"/><path d="M33 66 l-22 16 h32" fill="${c2}"/><circle cx="84" cy="76" r="5" fill="${c3}"/>`;
        break;
      case 'pistol':
        shape = `<path d="M64 63 h122 l17 12 h33 v17 h-56 l-16-11 H88 l-9 12 H56z" fill="url(#${gid})"/><rect x="228" y="78" width="30" height="6" rx="3" fill="${c1}"/><path d="M107 86 l19 42 h30 l-13-42" fill="${c2}"/><path d="M74 58 h72" ${line}/><circle cx="94" cy="77" r="4" fill="${c3}"/>`;
        break;
      case 'knife':
        shape = `<path d="M55 88 C103 42 167 32 246 50 C174 75 124 105 70 111 Z" fill="url(#${gid})"/><path d="M46 91 l35 27 l-18 14 l-36-27 z" fill="${c2}"/><path d="M94 84 C137 62 178 52 226 51" fill="none" ${line}/><path d="M44 100 l-17 14" ${line}/>`;
        break;
      case 'gloves':
        shape = `<path d="M84 51 c-19 5-30 24-27 48 l4 30 h67 l5-46 c2-22-20-40-49-32z" fill="url(#${gid})"/><path d="M156 54 c-25 2-43 20-39 42 l7 36 h68 l9-31 c6-23-16-48-45-47z" fill="url(#${gid})"/><path d="M76 62 v57 M95 56 v63 M114 61 v55 M151 66 v55 M171 61 v60 M188 72 v44" ${line}/><circle cx="128" cy="84" r="8" fill="${c3}" opacity=".85"/>`;
        break;
      case 'shotgun':
        shape = `<path d="M36 72 h154 l18 15 h43 v15 h-72 l-18-12 H82 l-22 25 H31 l18-33 H36z" fill="url(#${gid})"/><rect x="205" y="74" width="62" height="7" rx="4" fill="${c1}"/><path d="M80 62 h96" ${line}/><path d="M105 91 l21 33 h30 l-15-33" fill="${c2}"/>`;
        break;
      default:
        shape = `<rect x="50" y="60" width="170" height="44" rx="18" fill="url(#${gid})"/><path d="M83 73 h105" ${line}/>`;
    }
    return `<svg class="weapon-svg ${size}" viewBox="0 0 280 150" role="img" aria-label="${safe(it.name)}">${base}${shape}<text x="22" y="32" fill="${r.color}" font-size="16" font-weight="900">${r.short}</text></svg>`;
  }

  function itemCard(instance, actions=true){
    const r = rarityOf(instance);
    return `<article class="item-card rarity-${instance.rarity}" data-uid="${safe(instance.uid)}">
      <div class="item-render">${weaponSVG(instance)}</div>
      <div class="item-info">
        <b>${safe(instance.name)}</b>
        <small><span style="color:${r.color}">${r.label}</span> • ◆ ${fmt(instance.value)}</small>
      </div>
      ${actions ? `<div class="item-actions">
        <button class="ghost tiny" data-sell="${safe(instance.uid)}">Продать</button>
        <button class="ghost tiny" data-upgrade="${safe(instance.uid)}">Апгрейд</button>
        <button class="ghost tiny" data-contract="${safe(instance.uid)}">Контракт</button>
      </div>` : ''}
    </article>`;
  }

  function caseCard(c){
    const top = c.pool.map(itemById).filter(Boolean).sort((a,b)=>b.value-a.value)[0];
    return `<article class="case-card" data-case="${safe(c.id)}" style="--caseGradient:${safe(c.gradient)}">
      <div class="case-cover" style="--caseGradient:${safe(c.gradient)}"><span>${safe(c.cover)}</span><i></i></div>
      <div class="case-title"><h3>${safe(c.name)}</h3><b>◆ ${fmt(c.price)}</b></div>
      <p>${safe(c.desc)}</p>
      <div class="case-meta"><span>${safe(c.tag)}</span><span>Top: ${safe(top?.name || '—')}</span></div>
      <a class="primary small" href="cases.html?case=${encodeURIComponent(c.id)}">Открыть</a>
    </article>`;
  }

  function updateWallet(){
    $$('.js-balance').forEach(el => el.textContent = fmt(state.balance));
    $$('.js-inv-count').forEach(el => el.textContent = fmt(state.inventory.length));
  }

  function currentPage(){
    const p = location.pathname.split('/').pop() || 'index.html';
    return p === '' ? 'index.html' : p;
  }

  function renderHeader(){
    const header = $('#siteHeader');
    if(!header) return;
    const page = currentPage();
    const nav = [
      ['index.html','Главная'], ['cases.html','Кейсы'], ['battle.html','Баттлы'], ['upgrade.html','Апгрейд'],
      ['contracts.html','Контракты'], ['wheel.html','Бонусы'], ['inventory.html','Инвентарь'], ['ads.html','Реклама']
    ];
    header.innerHTML = `
      <a class="brand" href="index.html" aria-label="На главную"><span class="brand-mark">CL</span><span><b>CS2 Case Lab</b><small>GitHub Pages simulator</small></span></a>
      <button class="mobile-toggle" id="mobileToggle" aria-label="Меню">☰</button>
      <nav class="nav" id="mainNav">${nav.map(([href,label])=>`<a class="${href===page?'active':''}" href="${href}">${label}</a>`).join('')}</nav>
      <a class="wallet" href="inventory.html" title="Локальная валюта симулятора"><span class="coin">◆</span><strong class="js-balance">${fmt(state.balance)}</strong><span>LabCoins</span><em class="js-inv-count">${state.inventory.length}</em></a>`;
    $('#mobileToggle')?.addEventListener('click', () => $('#mainNav')?.classList.toggle('open'));
  }

  let liveRows = [];
  function randomName(){ return ['xEfim','dropHunter','MIRAGE','n1tro','Bot Denis','CaseFox','AWP Enjoyer','EcoKing','Rush B','LabUser'][Math.floor(Math.random()*10)]; }
  function createLiveRow(){
    const it = pickWeighted(cases[Math.floor(Math.random()*cases.length)].pool);
    return {player: randomName(), itemId: it.id, name: it.name, value: it.value, rarity: it.rarity};
  }
  function renderLiveFeed(){
    const wrap = $('#liveFeed');
    if(!wrap) return;
    if(liveRows.length === 0){ liveRows = Array.from({length: 18}, createLiveRow); }
    wrap.innerHTML = liveRows.map(row => {
      const it = itemById(row.itemId) || row;
      const r = rarityOf(it);
      return `<div class="live-chip rarity-${it.rarity}"><span>${safe(row.player)}</span><b>${safe(it.name.split('|')[0].trim())}</b><em style="color:${r.color}">◆ ${fmt(it.value)}</em></div>`;
    }).join('');
  }
  function tickLive(){
    liveRows.unshift(createLiveRow());
    liveRows = liveRows.slice(0, 22);
    renderLiveFeed();
  }

  function toast(message){
    let box = $('#toastBox');
    if(!box){ box = document.createElement('div'); box.id = 'toastBox'; box.className = 'toast-box'; document.body.appendChild(box); }
    const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = message;
    box.appendChild(el); setTimeout(()=>el.classList.add('show'), 20); setTimeout(()=>{el.classList.remove('show'); setTimeout(()=>el.remove(), 300);}, 2900);
  }

  function openModal(html, cls=''){
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = `modal-overlay ${cls}`;
    overlay.id = 'activeModal';
    overlay.innerHTML = `<div class="modal-card">${html}</div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
    document.addEventListener('keydown', escModal);
  }
  function escModal(e){ if(e.key === 'Escape') closeModal(); }
  function closeModal(){ $('#activeModal')?.remove(); document.removeEventListener('keydown', escModal); }

  function sellItem(uidToSell, silent=false){
    const idx = state.inventory.findIndex(x => x.uid === uidToSell);
    if(idx < 0) return false;
    const [inst] = state.inventory.splice(idx, 1);
    state.contractBasket = state.contractBasket.filter(id => id !== uidToSell);
    state.balance += inst.value;
    state.stats.earned += inst.value;
    save();
    if(!silent) toast(`Продано: <b>${safe(inst.name)}</b> за ◆ ${fmt(inst.value)}`);
    return true;
  }

  function useForUpgrade(uidToUse){
    state.selectedForUpgrade = uidToUse;
    save();
    location.href = 'upgrade.html';
  }
  function addToContract(uidToUse){
    if(!state.contractBasket.includes(uidToUse)) state.contractBasket.push(uidToUse);
    state.contractBasket = state.contractBasket.filter(id => state.inventory.some(x => x.uid === id)).slice(0, 10);
    save();
    location.href = 'contracts.html';
  }

  function dropModal(instance, caseId){
    const c = caseById(caseId);
    const r = rarityOf(instance);
    openModal(`<button class="modal-close" data-close>×</button>
      <span class="eyebrow">Новый дроп</span>
      <h2>${safe(instance.name)}</h2>
      <div class="drop-big rarity-${instance.rarity}">${weaponSVG(instance, 'big')}</div>
      <div class="drop-stats"><span style="color:${r.color}">${r.label}</span><b>◆ ${fmt(instance.value)}</b><em>${safe(c.name)}</em></div>
      <div class="modal-actions">
        <button class="primary" data-modal-sell="${safe(instance.uid)}">Продать за ◆ ${fmt(instance.value)}</button>
        <button class="ghost" data-modal-upgrade="${safe(instance.uid)}">Использовать в апгрейде</button>
        <button class="ghost" data-modal-contract="${safe(instance.uid)}">В контракт</button>
        <button class="ghost" data-close>Оставить в инвентаре</button>
        <button class="primary alt" data-open-again="${safe(caseId)}">Открыть ещё</button>
      </div>`, 'drop-modal');
    $$('[data-close]').forEach(b=>b.onclick=closeModal);
    $('[data-modal-sell]')?.addEventListener('click', e => { sellItem(e.currentTarget.dataset.modalSell, true); closeModal(); toast(`Предмет продан за ◆ ${fmt(instance.value)}`); renderInventoryPage(); renderDashboard(); });
    $('[data-modal-upgrade]')?.addEventListener('click', e => useForUpgrade(e.currentTarget.dataset.modalUpgrade));
    $('[data-modal-contract]')?.addEventListener('click', e => addToContract(e.currentTarget.dataset.modalContract));
    $('[data-open-again]')?.addEventListener('click', e => { closeModal(); openCase(e.currentTarget.dataset.openAgain); });
  }

  let rolling = false;
  function renderRollCard(item){
    const r = rarityOf(item);
    return `<div class="roll-card rarity-${item.rarity}"><div class="mini-render">${weaponSVG(item)}</div><b>${safe(item.name)}</b><span style="color:${r.color}">${r.label}</span></div>`;
  }

  function prepareStrip(c){
    const strip = $('#rouletteStrip');
    if(!strip) return;
    const arr = Array.from({length: 28}, () => pickWeighted(c.pool));
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0)';
    strip.innerHTML = arr.map(renderRollCard).join('');
  }

  function renderCaseDetails(caseId){
    const c = caseById(caseId);
    const title = $('#selectedCaseTitle');
    if(title){ title.textContent = c.name; }
    const price = $('#selectedCasePrice');
    if(price){ price.textContent = `◆ ${fmt(c.price)}`; }
    const desc = $('#selectedCaseDesc');
    if(desc){ desc.textContent = c.desc; }
    const cover = $('#selectedCaseCover');
    if(cover){ cover.style.setProperty('--caseGradient', c.gradient); cover.querySelector('span').textContent = c.cover; }
    const btn = $('#openCaseBtn');
    if(btn){ btn.textContent = `Открыть за ◆ ${fmt(c.price)}`; btn.dataset.case = c.id; }
    const odds = $('#caseOdds');
    if(odds){
      const grouped = {};
      c.pool.map(itemById).filter(Boolean).forEach(it => { grouped[it.rarity] = (grouped[it.rarity] || 0) + rarityOf(it).weight; });
      const total = Object.values(grouped).reduce((a,b)=>a+b,0);
      odds.innerHTML = Object.entries(grouped).sort((a,b)=>rarities[a[0]].order-rarities[b[0]].order).map(([rar,w]) => `<div><span style="color:${rarities[rar].color}">${rarities[rar].label}</span><b>${(w/total*100).toFixed(1)}%</b></div>`).join('');
    }
    const pool = $('#casePool');
    if(pool){
      pool.innerHTML = c.pool.map(id => itemById(id)).filter(Boolean).sort((a,b)=>a.value-b.value).map(it => itemCard(createInstance(it, 'preview'), false)).join('');
    }
    prepareStrip(c);
  }

  function openCase(caseId){
    if(rolling) return;
    const c = caseById(caseId);
    if(state.balance < c.price){
      toast(`Не хватает монет: нужно ◆ ${fmt(c.price)}, на балансе ◆ ${fmt(state.balance)}. Можно получить монеты на странице «Реклама».`);
      return;
    }
    const strip = $('#rouletteStrip');
    const windowEl = $('#rouletteWindow');
    if(!strip || !windowEl){ location.href = `cases.html?case=${encodeURIComponent(c.id)}`; return; }
    rolling = true;
    state.balance -= c.price;
    state.stats.spent += c.price;
    state.opened++;
    save();
    const won = pickWeighted(c.pool);
    const instance = createInstance(won, c.name);
    const winIndex = 34;
    const arr = Array.from({length: 45}, () => pickWeighted(c.pool));
    arr[winIndex] = won;
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0)';
    strip.innerHTML = arr.map(renderRollCard).join('');
    const cardStep = 188;
    const target = -(winIndex * cardStep) + (windowEl.clientWidth / 2) - 94 + (Math.random()*26 - 13);
    requestAnimationFrame(() => {
      strip.style.transition = 'transform 4s cubic-bezier(.06,.72,.12,1)';
      strip.style.transform = `translateX(${target}px)`;
    });
    setTimeout(() => {
      state.inventory.unshift(instance);
      setBest(instance);
      addHistory(instance, {caseName:c.name});
      save();
      rolling = false;
      updateWallet();
      renderDashboard();
      dropModal(instance, c.id);
    }, 4150);
  }

  function renderCasesPage(){
    const grid = $('#caseGrid');
    if(grid) grid.innerHTML = cases.map(caseCard).join('');
    const selectGrid = $('#caseSelectGrid');
    if(selectGrid){
      selectGrid.innerHTML = cases.map(c => `<button class="case-tab" data-case-tab="${safe(c.id)}"><span style="background:${safe(c.gradient)}">${safe(c.cover)}</span><b>${safe(c.name)}</b><em>◆ ${fmt(c.price)}</em></button>`).join('');
      $$('[data-case-tab]').forEach(btn => btn.addEventListener('click', () => {
        history.replaceState(null, '', `cases.html?case=${encodeURIComponent(btn.dataset.caseTab)}`);
        renderCaseDetails(btn.dataset.caseTab);
        $$('[data-case-tab]').forEach(x=>x.classList.toggle('active', x.dataset.caseTab === btn.dataset.caseTab));
      }));
    }
    const params = new URLSearchParams(location.search);
    const caseId = params.get('case') || cases[0].id;
    renderCaseDetails(caseId);
    $$('[data-case-tab]').forEach(x=>x.classList.toggle('active', x.dataset.caseTab === caseId));
    $('#openCaseBtn')?.addEventListener('click', e => openCase(e.currentTarget.dataset.case || caseId));
  }

  function renderInventoryPage(){
    const grid = $('#inventoryGrid');
    if(!grid) return;
    const search = ($('#inventorySearch')?.value || '').toLowerCase();
    const rarity = $('#rarityFilter')?.value || 'all';
    const sort = $('#sortInventory')?.value || 'new';
    let arr = [...state.inventory];
    if(search) arr = arr.filter(x => x.name.toLowerCase().includes(search));
    if(rarity !== 'all') arr = arr.filter(x => x.rarity === rarity);
    arr.sort((a,b) => sort === 'valueDesc' ? b.value-a.value : sort === 'valueAsc' ? a.value-b.value : sort === 'rarity' ? rarityOf(b).order-rarityOf(a).order : new Date(b.obtained)-new Date(a.obtained));
    grid.classList.toggle('empty-state', arr.length === 0);
    grid.innerHTML = arr.length ? arr.map(x => itemCard(x, true)).join('') : `<div class="empty-card"><h3>Инвентарь пуст</h3><p>Открой кейсы, выиграй баттл или забери бонус за рекламу.</p><a class="primary" href="cases.html">К кейсам</a></div>`;
    $$('[data-sell]', grid).forEach(b=>b.onclick=()=>{ sellItem(b.dataset.sell); renderInventoryPage(); });
    $$('[data-upgrade]', grid).forEach(b=>b.onclick=()=>useForUpgrade(b.dataset.upgrade));
    $$('[data-contract]', grid).forEach(b=>b.onclick=()=>addToContract(b.dataset.contract));
    const value = state.inventory.reduce((s,x)=>s+x.value,0);
    $('#inventoryValue') && ($('#inventoryValue').textContent = fmt(value));
    $('#inventoryCount') && ($('#inventoryCount').textContent = fmt(state.inventory.length));
    $('#bestDrop') && ($('#bestDrop').textContent = state.bestId ? itemById(state.bestId)?.name || '—' : '—');
  }

  function bindInventoryControls(){
    ['inventorySearch','rarityFilter','sortInventory'].forEach(id => $('#'+id)?.addEventListener('input', renderInventoryPage));
    $('#sellAllBtn')?.addEventListener('click', () => {
      if(!state.inventory.length) return;
      const value = state.inventory.reduce((s,x)=>s+x.value,0);
      state.inventory = [];
      state.contractBasket = [];
      state.balance += value;
      state.stats.earned += value;
      save();
      toast(`Весь инвентарь продан за ◆ ${fmt(value)}`);
      renderInventoryPage();
    });
  }

  function renderUpgradePage(){
    const own = $('#upgradeOwn');
    const targets = $('#upgradeTargets');
    if(!own || !targets) return;
    const selected = state.selectedForUpgrade && state.inventory.some(x=>x.uid===state.selectedForUpgrade) ? state.selectedForUpgrade : (state.inventory[0]?.uid || '');
    own.innerHTML = state.inventory.length ? state.inventory.map(inst => `<option value="${safe(inst.uid)}" ${inst.uid===selected?'selected':''}>${safe(inst.name)} — ◆ ${fmt(inst.value)}</option>`).join('') : '<option value="">Нет предметов</option>';
    const minValue = state.inventory.find(x=>x.uid === own.value)?.value || 0;
    targets.innerHTML = items.filter(it => it.value >= Math.max(90, minValue * .55)).sort((a,b)=>a.value-b.value).map(it => `<option value="${safe(it.id)}">${safe(it.name)} — ◆ ${fmt(it.value)}</option>`).join('');
    updateUpgradeChance();
  }

  function calcUpgradeChance(source, target){
    if(!source || !target) return 0;
    let chance = (source.value / target.value) * 68;
    if(target.value <= source.value) chance = 78;
    return clamp(chance, 1.2, 82);
  }
  function updateUpgradeChance(){
    const source = state.inventory.find(x => x.uid === $('#upgradeOwn')?.value);
    const target = itemById($('#upgradeTargets')?.value);
    const chance = calcUpgradeChance(source, target);
    $('#upgradeChance') && ($('#upgradeChance').textContent = chance.toFixed(1) + '%');
    $('#upgradeMeter') && ($('#upgradeMeter').style.width = chance + '%');
    const preview = $('#upgradePreview');
    if(preview){
      preview.innerHTML = `<div>${source ? itemCard(source, false) : '<div class="empty-card">Нет предмета</div>'}</div><div class="upgrade-arrow">→</div><div>${target ? itemCard(createInstance(target, 'target'), false) : '<div class="empty-card">Нет цели</div>'}</div>`;
    }
  }
  function doUpgrade(){
    const source = state.inventory.find(x => x.uid === $('#upgradeOwn')?.value);
    const target = itemById($('#upgradeTargets')?.value);
    if(!source || !target) return toast('Сначала выбери предмет и цель.');
    const chance = calcUpgradeChance(source, target);
    const idx = state.inventory.findIndex(x => x.uid === source.uid);
    if(idx < 0) return;
    state.inventory.splice(idx, 1);
    state.contractBasket = state.contractBasket.filter(id => id !== source.uid);
    state.stats.upgrades++;
    const win = Math.random() * 100 <= chance;
    let html;
    if(win){
      const newItem = createInstance(target, 'Upgrade');
      state.inventory.unshift(newItem);
      setBest(newItem);
      addHistory(newItem, {caseName:'Upgrade'});
      state.stats.upgradeWins++;
      html = `<span class="eyebrow">Апгрейд успешен</span><h2>${safe(target.name)}</h2><div class="drop-big rarity-${target.rarity}">${weaponSVG(target, 'big')}</div><p>Шанс был ${chance.toFixed(1)}%. Предмет добавлен в инвентарь.</p><div class="modal-actions"><button class="primary" data-close>Отлично</button><a class="ghost" href="inventory.html">Инвентарь</a></div>`;
    } else {
      html = `<span class="eyebrow">Апгрейд не прошёл</span><h2>Предмет сгорел</h2><div class="drop-big failed">${weaponSVG(source, 'big')}</div><p>${safe(source.name)} не превратился в ${safe(target.name)}. Шанс был ${chance.toFixed(1)}%.</p><div class="modal-actions"><button class="primary" data-close>Понятно</button><a class="ghost" href="cases.html">Открыть кейс</a></div>`;
    }
    state.selectedForUpgrade = null;
    save();
    renderUpgradePage();
    openModal(`<button class="modal-close" data-close>×</button>${html}`);
    $$('[data-close]').forEach(b=>b.onclick=closeModal);
  }
  function bindUpgrade(){
    $('#upgradeOwn')?.addEventListener('change', () => { state.selectedForUpgrade = $('#upgradeOwn').value; save(); renderUpgradePage(); });
    $('#upgradeTargets')?.addEventListener('change', updateUpgradeChance);
    $('#upgradeBtn')?.addEventListener('click', doUpgrade);
  }

  const wheelRewards = [80,120,180,240,300,420,600,900,1300,2200];
  function renderWheel(){
    const wheel = $('#bonusWheel');
    if(!wheel) return;
    wheel.innerHTML = wheelRewards.map((r,i) => `<span style="--i:${i};--total:${wheelRewards.length}">◆ ${fmt(r)}</span>`).join('');
    wheel.style.transform = `rotate(${state.wheelRotation || 0}deg)`;
    updateWheelCooldown();
  }
  function updateWheelCooldown(){
    const btn = $('#spinWheelBtn');
    const hint = $('#wheelHint');
    if(!btn) return;
    const cooldown = 20 * 60 * 1000;
    const left = Math.max(0, cooldown - (now() - (state.lastWheel || 0)));
    btn.disabled = left > 0;
    if(hint) hint.textContent = left > 0 ? `Следующий спин через ${Math.ceil(left/60000)} мин.` : 'Бесплатный спин готов.';
  }
  function spinWheel(){
    const btn = $('#spinWheelBtn');
    if(btn?.disabled) return;
    const reward = wheelRewards[Math.floor(Math.random()*wheelRewards.length)];
    state.wheelRotation = (state.wheelRotation || 0) + 1440 + Math.floor(Math.random()*360);
    state.lastWheel = now();
    $('#bonusWheel').style.transform = `rotate(${state.wheelRotation}deg)`;
    btn.disabled = true;
    setTimeout(() => {
      state.balance += reward;
      state.stats.earned += reward;
      save();
      openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">Bonus wheel</span><h2>Ты получил ◆ ${fmt(reward)}</h2><p>Монеты начислены на локальный баланс.</p><div class="modal-actions"><button class="primary" data-close>Забрать</button><a class="ghost" href="cases.html">К кейсам</a></div>`);
      $$('[data-close]').forEach(b=>b.onclick=closeModal);
      updateWheelCooldown();
    }, 3200);
  }
  function claimDaily(){
    const day = new Date().toISOString().slice(0,10);
    const last = state.lastDaily ? new Date(state.lastDaily).toISOString().slice(0,10) : '';
    if(last === day) return toast('Ежедневный бонус уже забран сегодня.');
    const reward = 500;
    state.lastDaily = now();
    state.balance += reward;
    state.stats.earned += reward;
    save();
    toast(`Ежедневный бонус: ◆ ${fmt(reward)}`);
    updateDaily();
  }
  function updateDaily(){
    const btn = $('#dailyBtn');
    if(!btn) return;
    const day = new Date().toISOString().slice(0,10);
    const last = state.lastDaily ? new Date(state.lastDaily).toISOString().slice(0,10) : '';
    btn.disabled = last === day;
    btn.textContent = last === day ? 'Бонус уже получен' : 'Забрать ◆ 500';
  }
  function applyPromo(){
    const input = $('#promoInput');
    if(!input) return;
    const code = input.value.trim().toUpperCase();
    const promos = {LAB2026: 750, EFIM: 500, CASELAB: 650};
    if(!promos[code]) return toast('Такого промокода нет. Попробуй LAB2026, EFIM или CASELAB.');
    const key = 'promo_' + code;
    if(localStorage.getItem(key)) return toast('Этот промокод уже использован.');
    localStorage.setItem(key, '1');
    state.balance += promos[code];
    state.stats.earned += promos[code];
    save();
    toast(`Промокод активирован: ◆ ${fmt(promos[code])}`);
  }
  function bindWheel(){
    $('#spinWheelBtn')?.addEventListener('click', spinWheel);
    $('#dailyBtn')?.addEventListener('click', claimDaily);
    $('#promoBtn')?.addEventListener('click', applyPromo);
    updateDaily();
    renderWheel();
    setInterval(updateWheelCooldown, 30000);
  }

  function renderAds(){
    const grid = $('#adProjects');
    if(grid) grid.innerHTML = projects.map(p => `<article class="project-card"><span>${safe(p.badge)}</span><h3>${safe(p.title)}</h3><p>${safe(p.desc)}</p><a href="${safe(p.url)}" target="_blank" rel="noopener">Открыть</a></article>`).join('');
  }
  function startAd(){
    const overlay = $('#adOverlay');
    if(!overlay) return;
    const reward = Number($('#adReward')?.value || 350);
    const project = projects[Math.floor(Math.random()*projects.length)];
    $('#adTitle').textContent = project.title;
    $('#adText').textContent = project.desc;
    $('#adLink').href = project.url;
    $('#adBadge').textContent = project.badge;
    let t = 10;
    $('#adTimer').textContent = t;
    $('#adRewardBtn').disabled = true;
    $('#adRewardBtn').textContent = 'Подожди...';
    overlay.classList.remove('hidden');
    const int = setInterval(() => {
      t--;
      $('#adTimer').textContent = t;
      if(t <= 0){
        clearInterval(int);
        $('#adRewardBtn').disabled = false;
        $('#adRewardBtn').textContent = `Получить ◆ ${fmt(reward)}`;
      }
    }, 1000);
    $('#adRewardBtn').onclick = () => {
      state.balance += reward;
      state.stats.earned += reward;
      state.stats.ads++;
      save();
      overlay.classList.add('hidden');
      toast(`Начислено за рекламу: ◆ ${fmt(reward)}`);
      renderAdsStats();
    };
  }
  function renderAdsStats(){
    $('#adsWatched') && ($('#adsWatched').textContent = fmt(state.stats.ads || 0));
    $('#adsEarned') && ($('#adsEarned').textContent = fmt((state.stats.ads || 0) * 350));
  }
  function bindAds(){
    renderAds(); renderAdsStats();
    $('#watchAdBtn')?.addEventListener('click', startAd);
    $('#adCloseBtn')?.addEventListener('click', () => $('#adOverlay')?.classList.add('hidden'));
  }

  function renderContractsPage(){
    const list = $('#contractInventory');
    if(!list) return;
    state.contractBasket = state.contractBasket.filter(id => state.inventory.some(x => x.uid === id)).slice(0,10);
    save();
    list.innerHTML = state.inventory.length ? state.inventory.map(inst => `<button class="contract-item ${state.contractBasket.includes(inst.uid)?'selected':''}" data-contract-pick="${safe(inst.uid)}">${weaponSVG(inst)}<b>${safe(inst.name)}</b><span>◆ ${fmt(inst.value)}</span></button>`).join('') : '<div class="empty-card"><h3>Нет предметов для контракта</h3><p>Открой кейсы или выиграй баттл.</p></div>';
    $$('[data-contract-pick]').forEach(btn => btn.onclick = () => {
      const id = btn.dataset.contractPick;
      if(state.contractBasket.includes(id)) state.contractBasket = state.contractBasket.filter(x=>x!==id);
      else if(state.contractBasket.length < 10) state.contractBasket.push(id);
      else toast('В контракт можно добавить максимум 10 предметов.');
      save(); renderContractsPage();
    });
    const picked = state.contractBasket.map(id => state.inventory.find(x => x.uid === id)).filter(Boolean);
    const value = picked.reduce((s,x)=>s+x.value,0);
    $('#contractCount') && ($('#contractCount').textContent = `${picked.length}/10`);
    $('#contractValue') && ($('#contractValue').textContent = fmt(value));
    const min = value * .65, max = value * 1.75;
    const possible = picked.length >= 3 ? chooseByValue(min, max) : null;
    $('#contractPreview') && ($('#contractPreview').innerHTML = possible ? itemCard(createInstance(possible, 'contract-preview'), false) : '<div class="empty-card"><h3>Добавь 3–10 предметов</h3><p>После этого появится прогноз возможного результата.</p></div>');
    $('#contractBtn') && ($('#contractBtn').disabled = picked.length < 3);
  }
  function runContract(){
    const picked = state.contractBasket.map(id => state.inventory.find(x => x.uid === id)).filter(Boolean);
    if(picked.length < 3) return toast('Нужно минимум 3 предмета.');
    const value = picked.reduce((s,x)=>s+x.value,0);
    const min = value * .62, max = value * 1.82;
    const result = chooseByValue(min, max);
    state.inventory = state.inventory.filter(x => !state.contractBasket.includes(x.uid));
    const inst = createInstance(result, 'Contract');
    state.inventory.unshift(inst);
    setBest(inst);
    addHistory(inst, {caseName:'Contract'});
    state.contractBasket = [];
    state.stats.contracts++;
    save();
    renderContractsPage();
    openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">Контракт завершён</span><h2>${safe(inst.name)}</h2><div class="drop-big rarity-${inst.rarity}">${weaponSVG(inst, 'big')}</div><p>Сумма вложенных предметов: ◆ ${fmt(value)}. Результат добавлен в инвентарь.</p><div class="modal-actions"><button class="primary" data-close>Забрать</button><a class="ghost" href="inventory.html">Инвентарь</a></div>`);
    $$('[data-close]').forEach(b=>b.onclick=closeModal);
  }
  function bindContracts(){
    $('#contractBtn')?.addEventListener('click', runContract);
    $('#clearContractBtn')?.addEventListener('click', () => { state.contractBasket = []; save(); renderContractsPage(); });
  }

  function renderBattlePage(){
    const caseSelect = $('#battleCase');
    if(!caseSelect) return;
    caseSelect.innerHTML = cases.map(c => `<option value="${safe(c.id)}">${safe(c.name)} — ◆ ${fmt(c.price)}</option>`).join('');
    updateBattleCost();
  }
  function updateBattleCost(){
    const c = caseById($('#battleCase')?.value || cases[0].id);
    const rounds = Number($('#battleRounds')?.value || 1);
    const players = Number($('#battlePlayers')?.value || 2);
    $('#battleCost') && ($('#battleCost').textContent = fmt(c.price * rounds));
    $('#battleModeText') && ($('#battleModeText').textContent = `${players} игрока • ${rounds} раунд.`);
  }
  function startBattle(){
    const c = caseById($('#battleCase')?.value || cases[0].id);
    const rounds = Number($('#battleRounds')?.value || 1);
    const players = Number($('#battlePlayers')?.value || 2);
    const cost = c.price * rounds;
    if(state.balance < cost) return toast(`Не хватает монет для баттла: нужно ◆ ${fmt(cost)}.`);
    state.balance -= cost;
    state.stats.spent += cost;
    state.stats.battles++;
    const names = ['Ты', ...Array.from({length: players-1}, (_,i)=>bots[(Math.floor(Math.random()*bots.length)+i)%bots.length])];
    const rows = names.map(name => ({name, drops:[], total:0}));
    for(let r=0;r<rounds;r++){
      rows.forEach(row => { const it = pickWeighted(c.pool); row.drops.push(it); row.total += it.value; });
    }
    rows.sort((a,b)=>b.total-a.total);
    const userRow = rows.find(x => x.name === 'Ты');
    const win = rows[0].name === 'Ты';
    let prize = 0;
    if(win){
      state.stats.battleWins++;
      const insts = userRow.drops.map(it => createInstance(it, 'Battle'));
      insts.forEach(inst => { state.inventory.unshift(inst); setBest(inst); addHistory(inst, {caseName:'Battle'}); });
      prize = Math.round(rows.reduce((s,x)=>s+x.total,0) * .35);
      state.balance += prize;
      state.stats.earned += prize;
    }
    save();
    const table = rows.map((row,idx)=>`<tr class="${row.name==='Ты'?'you':''}"><td>#${idx+1}</td><td>${safe(row.name)}</td><td>${row.drops.map(it=>`<span style="color:${rarityOf(it).color}">${safe(it.name.split('|')[0].trim())}</span>`).join('<br>')}</td><td>◆ ${fmt(row.total)}</td></tr>`).join('');
    $('#battleResult').innerHTML = `<div class="battle-result ${win?'win':'lose'}"><h3>${win ? 'Победа в баттле' : 'Баттл проигран'}</h3><p>${win ? `Ты получил свои дропы и бонус победителя ◆ ${fmt(prize)}.` : 'Твои дропы сгорели, как в риск-режиме симулятора.'}</p><div class="table-wrap"><table><thead><tr><th>Место</th><th>Игрок</th><th>Дропы</th><th>Сумма</th></tr></thead><tbody>${table}</tbody></table></div></div>`;
    updateWallet();
  }
  function bindBattle(){
    ['battleCase','battleRounds','battlePlayers'].forEach(id => $('#'+id)?.addEventListener('change', updateBattleCost));
    $('#startBattleBtn')?.addEventListener('click', startBattle);
  }

  function renderDashboard(){
    $('#homeCases') && ($('#homeCases').innerHTML = cases.slice(0, 6).map(caseCard).join(''));
    $('#statOpened') && ($('#statOpened').textContent = fmt(state.opened));
    $('#statInventory') && ($('#statInventory').textContent = fmt(state.inventory.length));
    $('#statValue') && ($('#statValue').textContent = fmt(state.inventory.reduce((s,x)=>s+x.value,0)));
    $('#statBest') && ($('#statBest').textContent = state.bestId ? itemById(state.bestId)?.name || '—' : '—');
    $('#recentDrops') && ($('#recentDrops').innerHTML = state.history.slice(0, 8).map(h => {
      const inst = normalizeInstance(h);
      return `<div class="history-row"><div>${weaponSVG(inst)}</div><span><b>${safe(h.name)}</b><small>${safe(h.caseName || h.source)} • ◆ ${fmt(h.value)}</small></span></div>`;
    }).join('') || '<div class="empty-card"><p>Пока нет открытий. Начни с любого кейса.</p></div>');
  }

  function renderProfile(){
    $('#profileBalance') && ($('#profileBalance').textContent = fmt(state.balance));
    $('#profileSpent') && ($('#profileSpent').textContent = fmt(state.stats.spent));
    $('#profileEarned') && ($('#profileEarned').textContent = fmt(state.stats.earned));
    $('#profileAds') && ($('#profileAds').textContent = fmt(state.stats.ads));
    $('#profileUpgrades') && ($('#profileUpgrades').textContent = `${fmt(state.stats.upgradeWins)}/${fmt(state.stats.upgrades)}`);
    $('#profileBattles') && ($('#profileBattles').textContent = `${fmt(state.stats.battleWins)}/${fmt(state.stats.battles)}`);
    $('#profileContracts') && ($('#profileContracts').textContent = fmt(state.stats.contracts));
    $('#resetBtn')?.addEventListener('click', () => {
      if(confirm('Сбросить локальный прогресс симулятора?')){ state = defaultState(); save(); location.reload(); }
    });
  }

  function init(){
    renderHeader(); updateWallet(); renderLiveFeed(); setInterval(tickLive, 4500);
    const page = currentPage();
    if(page === 'index.html') renderDashboard();
    if(page === 'cases.html') renderCasesPage();
    if(page === 'inventory.html'){ renderInventoryPage(); bindInventoryControls(); }
    if(page === 'upgrade.html'){ renderUpgradePage(); bindUpgrade(); }
    if(page === 'wheel.html') bindWheel();
    if(page === 'ads.html') bindAds();
    if(page === 'contracts.html'){ renderContractsPage(); bindContracts(); }
    if(page === 'battle.html'){ renderBattlePage(); bindBattle(); }
    if(page === 'profile.html') renderProfile();
    document.body.addEventListener('click', e => {
      const close = e.target.closest('[data-close]'); if(close) closeModal();
    });
  }

  window.CS2Lab = {items, cases, state, openCase, sellItem, weaponSVG};
  document.addEventListener('DOMContentLoaded', init);
})();
