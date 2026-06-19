(() => {
  'use strict';

  const DATA = window.CS2_DATA || {rarities:{},items:[],cases:[],projects:[]};
  const {rarities, items, cases, projects} = DATA;
  const STORAGE_KEY = 'cs2_case_lab_v3_state';
  const OLD_KEYS = ['cs2CaseLabV2','cs2CaseLab'];
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const fmt = n => Math.round(Number(n)||0).toLocaleString('ru-RU');
  const safe = s => String(s ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
  const uid = () => 'it_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);
  const clamp = (n,min,max) => Math.max(min, Math.min(max, n));
  const now = () => Date.now();
  const bots = ['RUSH_B','AKIMBO','NEONFOX','DUSTY','MIRAGE_KING','BYTEBOT','AWP_CAT','ECO_PRO','KARAMBITO','DE_NUKE'];
  const liveNames = ['xEfim','dropHunter','MirageFan','Bot Denis','CaseFox','AWP Enjoyer','EcoKing','Rush B','LabUser','KnifeDream'];

  const itemById = id => items.find(x => x.id === id) || null;
  const caseById = id => cases.find(x => x.id === id) || cases[0];
  const rarityOf = obj => rarities[obj?.rarity] || rarities.consumer || {label:'Common',color:'#9aa8c7',weight:1,order:1};

  function defaultState(){
    return {
      version: 3,
      balance: 3500,
      inventory: [],
      history: [],
      opened: 0,
      bestId: null,
      bestValue: 0,
      selectedUpgrade: null,
      contractBasket: [],
      wheelRotation: 0,
      lastWheel: 0,
      lastDaily: 0,
      usedPromos: [],
      stats: {spent:0, earned:0, ads:0, upgrades:0, upgradeWins:0, battles:0, battleWins:0, contracts:0}
    };
  }

  function createInstance(item, source='drop'){
    if(!item) item = items[0];
    return {uid: uid(), itemId: item.id, name: item.name, kind: item.kind, rarity: item.rarity, value: Number(item.value)||0, image: item.image, source, obtained: new Date().toISOString()};
  }

  function normalizeInstance(raw){
    if(!raw) return null;
    const item = itemById(raw.itemId) || itemById(raw.id) || items.find(x => x.name === raw.name) || items[0];
    if(!item) return null;
    return {
      uid: raw.uid || uid(),
      itemId: item.id,
      name: item.name,
      kind: item.kind,
      rarity: item.rarity,
      value: Number(raw.value || item.value) || item.value,
      image: item.image,
      source: raw.source || 'legacy',
      obtained: raw.obtained || new Date().toISOString()
    };
  }

  function normalizeState(raw){
    const base = defaultState();
    if(!raw || typeof raw !== 'object') return base;
    const st = {...base, ...raw};
    st.version = 3;
    st.balance = Number(st.balance || 0);
    st.inventory = Array.isArray(raw.inventory) ? raw.inventory.map(normalizeInstance).filter(Boolean) : [];
    st.history = Array.isArray(raw.history) ? raw.history.slice(0,80) : [];
    st.contractBasket = Array.isArray(raw.contractBasket) ? raw.contractBasket.filter(id => st.inventory.some(x => x.uid === id)).slice(0,10) : [];
    st.usedPromos = Array.isArray(raw.usedPromos) ? raw.usedPromos : [];
    st.stats = {...base.stats, ...(raw.stats || {})};
    st.opened = Number(st.opened || 0);
    const best = st.inventory.reduce((a,b)=> b.value > (a?.value || 0) ? b : a, null);
    if(best){ st.bestId = best.itemId; st.bestValue = best.value; }
    return st;
  }

  function loadState(){
    try{
      let raw = localStorage.getItem(STORAGE_KEY);
      if(!raw){
        for(const key of OLD_KEYS){ raw = localStorage.getItem(key); if(raw) break; }
      }
      return normalizeState(raw ? JSON.parse(raw) : null);
    }catch(err){ console.warn('state load failed', err); return defaultState(); }
  }

  let state = loadState();
  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateWallet();
  }
  function updateWallet(){
    $$('.js-balance').forEach(el => el.textContent = fmt(state.balance));
    $$('.js-inv-count').forEach(el => el.textContent = fmt(state.inventory.length));
  }
  function addCoins(amount, reason=''){
    amount = Math.max(0, Math.round(Number(amount)||0));
    state.balance += amount;
    state.stats.earned += amount;
    save();
    if(reason) toast(`${safe(reason)}: +◆ ${fmt(amount)}`);
  }
  function spendCoins(amount){
    amount = Math.round(Number(amount)||0);
    if(amount <= 0) return true;
    if(state.balance < amount) return false;
    state.balance -= amount;
    state.stats.spent += amount;
    save();
    return true;
  }
  function setBest(inst){
    if(inst && inst.value > (state.bestValue || 0)){ state.bestId = inst.itemId; state.bestValue = inst.value; }
  }
  function addHistory(inst, meta={}){
    if(!inst) return;
    state.history.unshift({uid:inst.uid,itemId:inst.itemId,name:inst.name,value:inst.value,rarity:inst.rarity,source:inst.source,caseName:meta.caseName || inst.source || '',time:Date.now()});
    state.history = state.history.slice(0,80);
  }
  function addInventory(inst, meta={}){
    state.inventory.unshift(inst);
    setBest(inst);
    addHistory(inst, meta);
    save();
  }

  function pickWeighted(poolIds){
    const pool = poolIds.map(itemById).filter(Boolean);
    if(!pool.length) return items[0];
    const total = pool.reduce((s,it)=>s + (rarityOf(it).weight || 1), 0);
    let roll = Math.random() * total;
    for(const item of pool){
      roll -= rarityOf(item).weight || 1;
      if(roll <= 0) return item;
    }
    return pool[0];
  }
  function chooseByValue(min, max){
    const candidates = items.filter(it => it.value >= min && it.value <= max);
    if(candidates.length) return candidates[Math.floor(Math.random()*candidates.length)];
    const mid = (min + max) / 2;
    return [...items].sort((a,b)=>Math.abs(a.value-mid)-Math.abs(b.value-mid))[0];
  }

  function renderHeader(){
    const header = $('#siteHeader');
    if(!header) return;
    const page = (document.body.dataset.page || location.pathname.split('/').pop() || 'index.html').replace(/^\//,'');
    const nav = [
      ['index.html','Главная'], ['cases.html','Кейсы'], ['battle.html','Баттлы'], ['upgrade.html','Апгрейд'],
      ['contracts.html','Контракты'], ['wheel.html','Бонусы'], ['inventory.html','Инвентарь'], ['ads.html','Реклама'], ['profile.html','Профиль']
    ];
    header.innerHTML = `
      <a class="brand" href="index.html"><span class="brand-mark">CL</span><span><b>CS2 Case Lab</b><small>local simulator</small></span></a>
      <button class="mobile-toggle" id="mobileToggle" aria-label="Меню">☰</button>
      <nav class="nav" id="mainNav">${nav.map(([href,label])=>`<a class="${href===page?'active':''}" href="${href}">${label}</a>`).join('')}</nav>
      <a class="wallet" href="inventory.html"><span class="coin">◆</span><strong class="js-balance">${fmt(state.balance)}</strong><span>LabCoins</span><em class="js-inv-count">${state.inventory.length}</em></a>`;
    $('#mobileToggle')?.addEventListener('click', () => $('#mainNav')?.classList.toggle('open'));
  }

  let liveRows = [];
  function randomName(){ return liveNames[Math.floor(Math.random()*liveNames.length)]; }
  function makeLiveRow(){
    const c = cases[Math.floor(Math.random()*cases.length)];
    const it = pickWeighted(c.pool);
    return {player: randomName(), itemId: it.id, name: it.name, value: it.value, rarity: it.rarity};
  }
  function renderLiveFeed(){
    const wrap = $('#liveFeed');
    if(!wrap) return;
    if(!liveRows.length) liveRows = Array.from({length: 18}, makeLiveRow);
    wrap.innerHTML = liveRows.map(row => {
      const it = itemById(row.itemId) || row;
      const r = rarityOf(it);
      return `<div class="live-chip rarity-${it.rarity}"><span>${safe(row.player)}</span><b>${safe(it.name.split('|')[0].trim())}</b><em style="color:${r.color}">◆ ${fmt(it.value)}</em></div>`;
    }).join('');
  }
  function tickLive(){ liveRows.unshift(makeLiveRow()); liveRows = liveRows.slice(0,22); renderLiveFeed(); }

  function toast(message){
    let box = $('#toastBox');
    if(!box){ box = document.createElement('div'); box.id = 'toastBox'; box.className = 'toast-box'; document.body.appendChild(box); }
    const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = message;
    box.appendChild(el);
    setTimeout(()=>el.classList.add('show'), 20);
    setTimeout(()=>{el.classList.remove('show'); setTimeout(()=>el.remove(), 260);}, 3000);
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

  function imgTag(obj, cls=''){
    const item = obj.itemId ? (itemById(obj.itemId) || obj) : obj;
    return `<img class="${cls}" src="${safe(item.image)}" alt="${safe(item.name)}" loading="lazy" />`;
  }
  function itemCard(inst, actions=true){
    const item = inst.itemId ? (itemById(inst.itemId) || inst) : inst;
    const r = rarityOf(item);
    const uidAttr = inst.uid ? `data-uid="${safe(inst.uid)}"` : '';
    return `<article class="item-card rarity-${item.rarity}" ${uidAttr}>
      <div class="item-render">${imgTag(item)}</div>
      <div class="item-info"><b>${safe(item.name)}</b><small><span style="color:${r.color}">${safe(r.label)}</span> • ◆ ${fmt(inst.value || item.value)}</small></div>
      ${actions && inst.uid ? `<div class="item-actions"><button class="ghost tiny" data-action="sell" data-uid="${safe(inst.uid)}">Продать</button><button class="ghost tiny" data-action="upgrade" data-uid="${safe(inst.uid)}">Апгрейд</button><button class="ghost tiny" data-action="contract" data-uid="${safe(inst.uid)}">Контракт</button></div>` : ''}
    </article>`;
  }
  function caseCard(c){
    const top = c.pool.map(itemById).filter(Boolean).sort((a,b)=>b.value-a.value)[0];
    return `<article class="case-card" style="--caseColor:${safe(c.gradient[0])}">
      <img src="${safe(c.image)}" alt="${safe(c.name)}" loading="lazy" />
      <div class="case-title"><h3>${safe(c.name)}</h3><b>◆ ${fmt(c.price)}</b></div>
      <p>${safe(c.desc)}</p>
      <div class="case-meta"><span>${safe(c.tag)}</span><span>Top: ${safe(top?.name || '—')}</span></div>
      <a class="primary small" href="cases.html?case=${encodeURIComponent(c.id)}">Открыть</a>
    </article>`;
  }

  function sellItem(uidToSell, silent=false){
    const idx = state.inventory.findIndex(x => x.uid === uidToSell);
    if(idx < 0) return false;
    const [inst] = state.inventory.splice(idx,1);
    state.contractBasket = state.contractBasket.filter(id => id !== uidToSell);
    state.balance += inst.value;
    state.stats.earned += inst.value;
    save();
    if(!silent) toast(`Продано: <b>${safe(inst.name)}</b> за ◆ ${fmt(inst.value)}`);
    renderInventoryPage(); renderDashboard(); renderProfile();
    return true;
  }
  function useForUpgrade(uidToUse){ state.selectedUpgrade = uidToUse; save(); location.href = 'upgrade.html'; }
  function addToContract(uidToUse){
    if(!state.contractBasket.includes(uidToUse)) state.contractBasket.push(uidToUse);
    state.contractBasket = state.contractBasket.filter(id => state.inventory.some(x => x.uid === id)).slice(0,10);
    save(); location.href = 'contracts.html';
  }
  function dropModal(inst, caseId){
    const c = caseById(caseId);
    const r = rarityOf(inst);
    openModal(`<button class="modal-close" data-close>×</button>
      <span class="eyebrow">new drop</span><h2>${safe(inst.name)}</h2>
      <div class="drop-big rarity-${inst.rarity}">${imgTag(inst)}</div>
      <div class="drop-stats"><span style="color:${r.color}">${safe(r.label)}</span><b>◆ ${fmt(inst.value)}</b><em>${safe(c.name)}</em></div>
      <div class="modal-actions">
        <button class="primary" data-drop-sell="${safe(inst.uid)}">Продать за ◆ ${fmt(inst.value)}</button>
        <button class="ghost" data-drop-upgrade="${safe(inst.uid)}">Апгрейд</button>
        <button class="ghost" data-drop-contract="${safe(inst.uid)}">В контракт</button>
        <button class="ghost" data-close>Оставить</button>
        <button class="primary alt" data-open-again="${safe(caseId)}">Открыть ещё</button>
      </div>`, 'drop-modal');
  }

  let rolling = false;
  function renderRollCard(item){
    const r = rarityOf(item);
    return `<div class="roll-card rarity-${item.rarity}">${imgTag(item)}<b>${safe(item.name)}</b><span style="color:${r.color}">${safe(r.label)}</span></div>`;
  }
  function prepareStrip(c){
    const strip = $('#rouletteStrip');
    if(!strip) return;
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0px)';
    const arr = Array.from({length: 32}, () => pickWeighted(c.pool));
    strip.innerHTML = arr.map(renderRollCard).join('');
  }
  function renderCaseDetails(caseId){
    const c = caseById(caseId);
    if(!c) return;
    $('#selectedCaseTitle') && ($('#selectedCaseTitle').textContent = c.name);
    $('#selectedCaseDesc') && ($('#selectedCaseDesc').textContent = c.desc);
    $('#selectedCasePrice') && ($('#selectedCasePrice').textContent = `◆ ${fmt(c.price)}`);
    const img = $('#selectedCaseImage');
    if(img){ img.src = c.image; img.alt = c.name; }
    const btn = $('#openCaseBtn');
    if(btn){ btn.dataset.case = c.id; btn.textContent = `Открыть за ◆ ${fmt(c.price)}`; }
    const odds = $('#caseOdds');
    if(odds){
      const grouped = {};
      c.pool.map(itemById).filter(Boolean).forEach(it => grouped[it.rarity] = (grouped[it.rarity] || 0) + (rarityOf(it).weight || 1));
      const total = Object.values(grouped).reduce((a,b)=>a+b,0);
      odds.innerHTML = Object.entries(grouped).sort((a,b)=>rarityOf({rarity:a[0]}).order-rarityOf({rarity:b[0]}).order).map(([rar,w]) => `<div><span style="color:${rarities[rar].color}">${safe(rarities[rar].label)}</span><b>${(w/total*100).toFixed(1)}%</b></div>`).join('');
    }
    const pool = $('#casePool');
    if(pool) pool.innerHTML = c.pool.map(itemById).filter(Boolean).sort((a,b)=>a.value-b.value).map(it => itemCard(createInstance(it,'preview'), false)).join('');
    $$('[data-case-tab]').forEach(x=>x.classList.toggle('active', x.dataset.caseTab === c.id));
    prepareStrip(c);
  }
  function openCase(caseId){
    if(rolling) return;
    const c = caseById(caseId);
    if(!c) return;
    const strip = $('#rouletteStrip');
    const win = $('#rouletteWindow');
    if(!strip || !win){ location.href = `cases.html?case=${encodeURIComponent(c.id)}`; return; }
    if(!spendCoins(c.price)){
      toast(`Не хватает монет: нужно ◆ ${fmt(c.price)}, на балансе ◆ ${fmt(state.balance)}. Получи монеты через рекламу или бонусы.`);
      return;
    }
    state.opened += 1; save(); updateDashboardNumbers();
    rolling = true;
    const btn = $('#openCaseBtn');
    if(btn){ btn.disabled = true; btn.textContent = 'Открывается...'; }
    const won = pickWeighted(c.pool);
    const inst = createInstance(won, c.name);
    const winIndex = 44;
    const arr = Array.from({length: 62}, () => pickWeighted(c.pool));
    arr[winIndex] = won;
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0px)';
    strip.innerHTML = arr.map(renderRollCard).join('');
    // force layout and calculate actual card size, so animation works on desktop and phone
    strip.getBoundingClientRect();
    const first = $('.roll-card', strip);
    const gap = parseFloat(getComputedStyle(strip).gap || '12') || 12;
    const step = (first ? first.getBoundingClientRect().width : 178) + gap;
    const target = -(winIndex * step) + (win.clientWidth / 2) - (step / 2) + (Math.random()*24 - 12);
    requestAnimationFrame(() => {
      strip.style.transition = 'transform 4.2s cubic-bezier(.06,.74,.1,1)';
      strip.style.transform = `translateX(${target}px)`;
    });
    setTimeout(() => {
      addInventory(inst, {caseName:c.name});
      rolling = false;
      if(btn){ btn.disabled = false; btn.textContent = `Открыть за ◆ ${fmt(c.price)}`; }
      renderDashboard(); renderProfile();
      dropModal(inst, c.id);
    }, 4400);
  }

  function renderCasesPage(){
    const grid = $('#caseGrid');
    if(grid) grid.innerHTML = cases.map(caseCard).join('');
    const side = $('#caseSelectGrid');
    if(side){
      side.innerHTML = cases.map(c => `<button class="case-tab" data-case-tab="${safe(c.id)}"><img src="${safe(c.image)}" alt=""><b>${safe(c.name)}</b><em>◆ ${fmt(c.price)}</em></button>`).join('');
    }
    const params = new URLSearchParams(location.search);
    renderCaseDetails(params.get('case') || cases[0]?.id);
  }

  function fillRarityFilter(){
    const sel = $('#rarityFilter');
    if(!sel || sel.dataset.ready) return;
    Object.entries(rarities).sort((a,b)=>a[1].order-b[1].order).forEach(([id,r]) => {
      const opt = document.createElement('option'); opt.value = id; opt.textContent = r.label; sel.appendChild(opt);
    });
    sel.dataset.ready = '1';
  }
  function renderInventoryPage(){
    const grid = $('#inventoryGrid');
    if(!grid) return;
    fillRarityFilter();
    const search = ($('#inventorySearch')?.value || '').toLowerCase().trim();
    const rarity = $('#rarityFilter')?.value || 'all';
    const sort = $('#sortInventory')?.value || 'new';
    let arr = [...state.inventory];
    if(search) arr = arr.filter(x => x.name.toLowerCase().includes(search));
    if(rarity !== 'all') arr = arr.filter(x => x.rarity === rarity);
    arr.sort((a,b) => sort === 'valueDesc' ? b.value-a.value : sort === 'valueAsc' ? a.value-b.value : sort === 'rarity' ? rarityOf(b).order-rarityOf(a).order : new Date(b.obtained)-new Date(a.obtained));
    grid.innerHTML = arr.length ? arr.map(x => itemCard(x,true)).join('') : `<div class="empty-card"><h3>Инвентарь пуст</h3><p>Открой кейсы, выиграй баттл или получи монеты за рекламу.</p><a class="primary" href="cases.html">К кейсам</a></div>`;
    const value = state.inventory.reduce((s,x)=>s+x.value,0);
    $('#inventoryValue') && ($('#inventoryValue').textContent = fmt(value));
    $('#inventoryCount') && ($('#inventoryCount').textContent = fmt(state.inventory.length));
    $('#inventoryBest') && ($('#inventoryBest').textContent = state.bestId ? (itemById(state.bestId)?.name || '—') : '—');
  }

  function renderDashboard(){
    $('#homeCases') && ($('#homeCases').innerHTML = cases.slice(0,6).map(caseCard).join(''));
    updateDashboardNumbers();
    const recent = $('#recentDrops');
    if(recent){
      recent.innerHTML = state.history.slice(0,8).map(h => {
        const it = itemById(h.itemId) || normalizeInstance(h);
        return `<div class="history-row">${imgTag(it)}<span><b>${safe(h.name)}</b><small>${safe(h.caseName || h.source || 'drop')} • ◆ ${fmt(h.value)}</small></span><em style="color:${rarityOf(it).color}">${safe(rarityOf(it).label)}</em></div>`;
      }).join('') || '<div class="empty-card"><p>Пока нет открытий. Начни с любого кейса.</p></div>';
    }
    const best = $('#bestDropCard');
    if(best){
      const inst = state.inventory.find(x => x.itemId === state.bestId) || (state.bestId ? createInstance(itemById(state.bestId),'best') : null);
      best.innerHTML = inst ? itemCard(inst, false) : '<div class="empty-card"><h3>Пока нет лучшего дропа</h3><p>Открой первый кейс.</p></div>';
    }
  }
  function updateDashboardNumbers(){
    $('#statOpened') && ($('#statOpened').textContent = fmt(state.opened));
    $('#statInventory') && ($('#statInventory').textContent = fmt(state.inventory.length));
    $('#statValue') && ($('#statValue').textContent = fmt(state.inventory.reduce((s,x)=>s+x.value,0)));
  }

  function renderUpgradePage(){
    const own = $('#upgradeOwn'); const target = $('#upgradeTarget');
    if(!own || !target) return;
    const validSelected = state.selectedUpgrade && state.inventory.some(x => x.uid === state.selectedUpgrade) ? state.selectedUpgrade : (state.inventory[0]?.uid || '');
    own.innerHTML = state.inventory.length ? state.inventory.map(inst => `<option value="${safe(inst.uid)}" ${inst.uid===validSelected?'selected':''}>${safe(inst.name)} — ◆ ${fmt(inst.value)}</option>`).join('') : '<option value="">Нет предметов</option>';
    const source = state.inventory.find(x => x.uid === own.value);
    target.innerHTML = items.filter(it => !source || it.value >= Math.max(80, source.value * .55)).sort((a,b)=>a.value-b.value).map(it => `<option value="${safe(it.id)}">${safe(it.name)} — ◆ ${fmt(it.value)}</option>`).join('');
    updateUpgradeChance();
  }
  function calcUpgradeChance(source, target){
    if(!source || !target) return 0;
    let chance = (source.value / target.value) * 68;
    if(target.value <= source.value) chance = 82;
    return clamp(chance, 1.1, 84);
  }
  function updateUpgradeChance(){
    const source = state.inventory.find(x => x.uid === $('#upgradeOwn')?.value);
    const target = itemById($('#upgradeTarget')?.value);
    const chance = calcUpgradeChance(source, target);
    $('#upgradeChance') && ($('#upgradeChance').textContent = chance.toFixed(1) + '%');
    $('#upgradeMeter') && ($('#upgradeMeter').style.width = chance + '%');
    const preview = $('#upgradePreview');
    if(preview){
      preview.innerHTML = `<div>${source ? itemCard(source,false) : '<div class="empty-card">Нет предмета</div>'}</div><div class="upgrade-arrow">→</div><div>${target ? itemCard(createInstance(target,'target'), false) : '<div class="empty-card">Нет цели</div>'}</div>`;
    }
  }
  function doUpgrade(){
    const own = $('#upgradeOwn'); const targetSel = $('#upgradeTarget');
    const source = state.inventory.find(x => x.uid === own?.value);
    const target = itemById(targetSel?.value);
    if(!source || !target) return toast('Сначала выбери предмет и цель.');
    const chance = calcUpgradeChance(source, target);
    const idx = state.inventory.findIndex(x => x.uid === source.uid);
    if(idx < 0) return;
    state.inventory.splice(idx,1);
    state.contractBasket = state.contractBasket.filter(id => id !== source.uid);
    state.stats.upgrades++;
    const win = Math.random()*100 <= chance;
    if(win){
      const inst = createInstance(target,'Upgrade');
      state.inventory.unshift(inst); setBest(inst); addHistory(inst,{caseName:'Upgrade'}); state.stats.upgradeWins++;
      save(); renderUpgradePage(); renderInventoryPage(); renderDashboard();
      openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">upgrade win</span><h2>${safe(target.name)}</h2><div class="drop-big rarity-${target.rarity}">${imgTag(target)}</div><p>Шанс был ${chance.toFixed(1)}%. Предмет добавлен в инвентарь.</p><div class="modal-actions"><button class="primary" data-close>Забрать</button><a class="ghost" href="inventory.html">Инвентарь</a></div>`);
    }else{
      save(); renderUpgradePage(); renderInventoryPage(); renderDashboard();
      openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">upgrade failed</span><h2>Предмет сгорел</h2><div class="drop-big failed">${imgTag(source)}</div><p>${safe(source.name)} не превратился в ${safe(target.name)}. Шанс был ${chance.toFixed(1)}%.</p><div class="modal-actions"><button class="primary" data-close>Понятно</button><a class="ghost" href="cases.html">К кейсам</a></div>`);
    }
    state.selectedUpgrade = null; save();
  }

  const wheelRewards = [80,120,180,240,350,500,700,1000,1400,2200];
  function renderWheel(){
    const wheel = $('#bonusWheel'); if(!wheel) return;
    wheel.innerHTML = wheelRewards.map((r,i)=>`<span style="--i:${i};--total:${wheelRewards.length}">◆ ${fmt(r)}</span>`).join('');
    wheel.style.transform = `rotate(${state.wheelRotation || 0}deg)`;
    updateWheelCooldown();
  }
  function updateWheelCooldown(){
    const btn = $('#spinWheelBtn'); const hint = $('#wheelHint');
    if(!btn) return;
    const cooldown = 10*60*1000;
    const left = Math.max(0, cooldown - (now() - (state.lastWheel || 0)));
    btn.disabled = left > 0;
    if(hint) hint.textContent = left > 0 ? `Следующий спин через ${Math.ceil(left/60000)} мин.` : 'Бесплатный спин готов.';
  }
  function spinWheel(){
    const btn = $('#spinWheelBtn'); if(btn?.disabled) return;
    const reward = wheelRewards[Math.floor(Math.random()*wheelRewards.length)];
    state.wheelRotation = (state.wheelRotation || 0) + 1440 + Math.floor(Math.random()*360);
    state.lastWheel = now(); save(); updateWheelCooldown();
    $('#bonusWheel') && ($('#bonusWheel').style.transform = `rotate(${state.wheelRotation}deg)`);
    setTimeout(()=>{
      addCoins(reward);
      openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">bonus wheel</span><h2>Ты получил ◆ ${fmt(reward)}</h2><p>Монеты начислены на баланс.</p><div class="modal-actions"><button class="primary" data-close>Забрать</button><a class="ghost" href="cases.html">К кейсам</a></div>`);
      updateWheelCooldown();
    }, 3200);
  }
  function updateDaily(){
    const btn = $('#dailyBtn'); if(!btn) return;
    const today = new Date().toISOString().slice(0,10);
    const last = state.lastDaily ? new Date(state.lastDaily).toISOString().slice(0,10) : '';
    btn.disabled = today === last;
    btn.textContent = today === last ? 'Бонус уже получен' : 'Забрать ◆ 500';
  }
  function claimDaily(){
    const today = new Date().toISOString().slice(0,10);
    const last = state.lastDaily ? new Date(state.lastDaily).toISOString().slice(0,10) : '';
    if(today === last) return toast('Ежедневный бонус уже забран сегодня.');
    state.lastDaily = now(); addCoins(500, 'Ежедневный бонус'); updateDaily();
  }
  function applyPromo(){
    const input = $('#promoInput'); if(!input) return;
    const code = input.value.trim().toUpperCase();
    const promo = {LAB2026:750, EFIM:500, CASELAB:650};
    if(!promo[code]) return toast('Такого промокода нет. Попробуй LAB2026, EFIM или CASELAB.');
    if(state.usedPromos.includes(code)) return toast('Этот промокод уже использован.');
    state.usedPromos.push(code); addCoins(promo[code], 'Промокод'); input.value = '';
  }

  function renderContractsPage(){
    const list = $('#contractInventory'); if(!list) return;
    state.contractBasket = state.contractBasket.filter(id => state.inventory.some(x => x.uid === id)).slice(0,10);
    save();
    list.innerHTML = state.inventory.length ? state.inventory.map(inst => `<button class="contract-item ${state.contractBasket.includes(inst.uid)?'selected':''}" data-contract-pick="${safe(inst.uid)}">${imgTag(inst)}<b>${safe(inst.name)}</b><span>◆ ${fmt(inst.value)}</span></button>`).join('') : '<div class="empty-card"><h3>Нет предметов</h3><p>Открой кейсы или выиграй баттл.</p></div>';
    const picked = state.contractBasket.map(id => state.inventory.find(x => x.uid === id)).filter(Boolean);
    const value = picked.reduce((s,x)=>s+x.value,0);
    $('#contractCount') && ($('#contractCount').textContent = `${picked.length}/10`);
    $('#contractValue') && ($('#contractValue').textContent = fmt(value));
    const possible = picked.length >= 3 ? chooseByValue(value*.68, value*1.82) : null;
    $('#contractPreview') && ($('#contractPreview').innerHTML = possible ? itemCard(createInstance(possible,'contract-preview'), false) : '<div class="empty-card"><h3>Добавь 3–10 предметов</h3><p>После этого появится прогноз результата.</p></div>');
    $('#contractBtn') && ($('#contractBtn').disabled = picked.length < 3);
  }
  function runContract(){
    const picked = state.contractBasket.map(id => state.inventory.find(x => x.uid === id)).filter(Boolean);
    if(picked.length < 3) return toast('Нужно минимум 3 предмета.');
    const value = picked.reduce((s,x)=>s+x.value,0);
    const result = chooseByValue(value*.62, value*1.9);
    state.inventory = state.inventory.filter(x => !state.contractBasket.includes(x.uid));
    const inst = createInstance(result,'Contract');
    state.inventory.unshift(inst); setBest(inst); addHistory(inst,{caseName:'Contract'});
    state.contractBasket = []; state.stats.contracts++; save(); renderContractsPage(); renderInventoryPage(); renderDashboard(); renderProfile();
    openModal(`<button class="modal-close" data-close>×</button><span class="eyebrow">contract result</span><h2>${safe(inst.name)}</h2><div class="drop-big rarity-${inst.rarity}">${imgTag(inst)}</div><p>Сумма вложенных предметов: ◆ ${fmt(value)}. Новый предмет добавлен в инвентарь.</p><div class="modal-actions"><button class="primary" data-close>Забрать</button><a class="ghost" href="inventory.html">Инвентарь</a></div>`);
  }

  function renderBattlePage(){
    const sel = $('#battleCase'); if(!sel) return;
    sel.innerHTML = cases.map(c => `<option value="${safe(c.id)}">${safe(c.name)} — ◆ ${fmt(c.price)}</option>`).join('');
    updateBattleCost();
  }
  function updateBattleCost(){
    const c = caseById($('#battleCase')?.value || cases[0]?.id);
    const rounds = Number($('#battleRounds')?.value || 1);
    const players = Number($('#battlePlayers')?.value || 2);
    $('#battleCost') && ($('#battleCost').textContent = fmt(c.price * rounds));
    $('#battleModeText') && ($('#battleModeText').textContent = `${players} игрока • ${rounds} раунд.`);
  }
  function startBattle(){
    const c = caseById($('#battleCase')?.value || cases[0]?.id);
    const rounds = Number($('#battleRounds')?.value || 1);
    const players = Number($('#battlePlayers')?.value || 2);
    const cost = c.price * rounds;
    if(!spendCoins(cost)) return toast(`Не хватает монет для баттла: нужно ◆ ${fmt(cost)}.`);
    state.stats.battles++;
    const names = ['Ты', ...Array.from({length:players-1}, (_,i)=>bots[(Math.floor(Math.random()*bots.length)+i)%bots.length])];
    const rows = names.map(name => ({name,drops:[],total:0}));
    for(let r=0;r<rounds;r++) rows.forEach(row => { const it = pickWeighted(c.pool); row.drops.push(it); row.total += it.value; });
    const allDrops = rows.flatMap(row => row.drops);
    rows.sort((a,b)=>b.total-a.total);
    const win = rows[0].name === 'Ты';
    if(win){
      state.stats.battleWins++;
      allDrops.map(it => createInstance(it,'Battle')).forEach(inst => { state.inventory.unshift(inst); setBest(inst); addHistory(inst,{caseName:'Battle'}); });
    }
    save(); renderDashboard(); renderProfile();
    const table = rows.map((row,idx)=>`<tr class="${row.name==='Ты'?'you':''}"><td>#${idx+1}</td><td>${safe(row.name)}</td><td><div class="battle-drop-list">${row.drops.map(it=>`<span>${imgTag(it)}<small>${safe(it.name.split('|')[0].trim())}</small></span>`).join('')}</div></td><td>◆ ${fmt(row.total)}</td></tr>`).join('');
    $('#battleResult').innerHTML = `<div class="battle-result ${win?'win':'lose'}"><h3>${win?'Победа в баттле':'Баттл проигран'}</h3><p>${win?'Ты забрал все выпавшие предметы баттла.':'Все дропы сгорели — риск-режим симулятора.'}</p><div class="table-wrap"><table><thead><tr><th>Место</th><th>Игрок</th><th>Дропы</th><th>Сумма</th></tr></thead><tbody>${table}</tbody></table></div></div>`;
  }

  function renderAds(){
    const grid = $('#adProjects');
    if(grid) grid.innerHTML = projects.map(p => `<article class="project-card"><span>${safe(p.badge)}</span><h3>${safe(p.title)}</h3><p>${safe(p.desc)}</p><a href="${safe(p.url)}" target="_blank" rel="noopener">Открыть</a></article>`).join('');
    renderAdsStats();
  }
  function renderAdsStats(){
    $('#adsWatched') && ($('#adsWatched').textContent = fmt(state.stats.ads));
    $('#adsEarned') && ($('#adsEarned').textContent = fmt(state.stats.ads * 350));
  }
  let adTimer = null;
  function startAd(){
    const overlay = $('#adOverlay'); if(!overlay) return;
    const project = projects[Math.floor(Math.random()*projects.length)];
    const reward = 350;
    $('#adTitle').textContent = project.title;
    $('#adText').textContent = project.desc;
    $('#adLink').href = project.url;
    $('#adBadge').textContent = project.badge;
    let t = 10;
    $('#adTimer').textContent = t;
    $('#adRewardBtn').disabled = true;
    $('#adRewardBtn').textContent = 'Подожди...';
    overlay.classList.remove('hidden');
    clearInterval(adTimer);
    adTimer = setInterval(() => {
      t -= 1;
      $('#adTimer').textContent = t;
      if(t <= 0){
        clearInterval(adTimer);
        $('#adRewardBtn').disabled = false;
        $('#adRewardBtn').textContent = `Получить ◆ ${fmt(reward)}`;
      }
    }, 1000);
    $('#adRewardBtn').onclick = () => {
      state.stats.ads++; addCoins(reward); renderAdsStats(); overlay.classList.add('hidden'); toast(`Начислено за рекламу: ◆ ${fmt(reward)}`);
    };
  }

  function renderProfile(){
    if(!$('#profileBalance')) return;
    $('#profileBalance').textContent = fmt(state.balance);
    $('#profileSpent').textContent = fmt(state.stats.spent);
    $('#profileEarned').textContent = fmt(state.stats.earned);
    $('#profileAds').textContent = fmt(state.stats.ads);
    $('#profileUpgrades').textContent = `${fmt(state.stats.upgradeWins)}/${fmt(state.stats.upgrades)}`;
    $('#profileBattles').textContent = `${fmt(state.stats.battleWins)}/${fmt(state.stats.battles)}`;
    $('#profileContracts').textContent = fmt(state.stats.contracts);
    $('#profileOpened').textContent = fmt(state.opened);
  }

  function bindEvents(){
    document.body.addEventListener('click', e => {
      const close = e.target.closest('[data-close]');
      if(close){ closeModal(); return; }
      const tab = e.target.closest('[data-case-tab]');
      if(tab){
        history.replaceState(null,'',`cases.html?case=${encodeURIComponent(tab.dataset.caseTab)}`);
        renderCaseDetails(tab.dataset.caseTab); return;
      }
      const actionBtn = e.target.closest('[data-action]');
      if(actionBtn){
        const action = actionBtn.dataset.action, id = actionBtn.dataset.uid;
        if(action === 'sell') sellItem(id);
        if(action === 'upgrade') useForUpgrade(id);
        if(action === 'contract') addToContract(id);
        return;
      }
      const pick = e.target.closest('[data-contract-pick]');
      if(pick){
        const id = pick.dataset.contractPick;
        if(state.contractBasket.includes(id)) state.contractBasket = state.contractBasket.filter(x => x !== id);
        else if(state.contractBasket.length < 10) state.contractBasket.push(id);
        else toast('В контракт можно добавить максимум 10 предметов.');
        save(); renderContractsPage(); return;
      }
      const sellDrop = e.target.closest('[data-drop-sell]');
      if(sellDrop){ const inst = state.inventory.find(x => x.uid === sellDrop.dataset.dropSell); sellItem(sellDrop.dataset.dropSell,true); closeModal(); toast(`Предмет продан${inst ? ` за ◆ ${fmt(inst.value)}` : ''}`); return; }
      const upgradeDrop = e.target.closest('[data-drop-upgrade]');
      if(upgradeDrop){ useForUpgrade(upgradeDrop.dataset.dropUpgrade); return; }
      const contractDrop = e.target.closest('[data-drop-contract]');
      if(contractDrop){ addToContract(contractDrop.dataset.dropContract); return; }
      const again = e.target.closest('[data-open-again]');
      if(again){ closeModal(); openCase(again.dataset.openAgain); return; }
    });
    $('#openCaseBtn')?.addEventListener('click', e => openCase(e.currentTarget.dataset.case || cases[0]?.id));
    ['inventorySearch','rarityFilter','sortInventory'].forEach(id => $('#'+id)?.addEventListener('input', renderInventoryPage));
    $('#sellAllBtn')?.addEventListener('click', () => {
      if(!state.inventory.length) return toast('Инвентарь пуст.');
      const value = state.inventory.reduce((s,x)=>s+x.value,0);
      state.inventory = []; state.contractBasket = []; state.balance += value; state.stats.earned += value; save();
      toast(`Весь инвентарь продан за ◆ ${fmt(value)}`); renderInventoryPage(); renderDashboard(); renderProfile();
    });
    $('#upgradeOwn')?.addEventListener('change', () => { state.selectedUpgrade = $('#upgradeOwn').value; save(); renderUpgradePage(); });
    $('#upgradeTarget')?.addEventListener('change', updateUpgradeChance);
    $('#upgradeBtn')?.addEventListener('click', doUpgrade);
    $('#contractBtn')?.addEventListener('click', runContract);
    $('#clearContractBtn')?.addEventListener('click', () => { state.contractBasket = []; save(); renderContractsPage(); });
    $('#spinWheelBtn')?.addEventListener('click', spinWheel);
    $('#dailyBtn')?.addEventListener('click', claimDaily);
    $('#promoBtn')?.addEventListener('click', applyPromo);
    ['battleCase','battleRounds','battlePlayers'].forEach(id => $('#'+id)?.addEventListener('change', updateBattleCost));
    $('#startBattleBtn')?.addEventListener('click', startBattle);
    $('#watchAdBtn')?.addEventListener('click', startAd);
    $('#adCloseBtn')?.addEventListener('click', () => { $('#adOverlay')?.classList.add('hidden'); clearInterval(adTimer); });
    $('#resetBtn')?.addEventListener('click', () => { if(confirm('Сбросить локальный прогресс?')){ state = defaultState(); save(); location.reload(); } });
  }

  function init(){
    renderHeader(); updateWallet(); renderLiveFeed(); setInterval(tickLive, 4500);
    renderDashboard(); renderCasesPage(); renderInventoryPage(); renderUpgradePage(); renderWheel(); updateDaily(); renderContractsPage(); renderBattlePage(); renderAds(); renderProfile();
    bindEvents(); setInterval(updateWheelCooldown, 30000);
  }

  window.CS2Lab = {items,cases,state,openCase,sellItem,addCoins,spendCoins};
  document.addEventListener('DOMContentLoaded', init);
})();
