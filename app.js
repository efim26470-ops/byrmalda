(function(){
  'use strict';

  const VERSION = '31.16.2';
  const LS_KEY = 'cs2_case_lab_save';
  const BACKUP_KEY = 'cs2_case_lab_session_backup';
  const WINDOW_SAVE_PREFIX = 'CS2_CASE_LAB_WINDOW_SAVE:';
  const IDB_DB = 'cs2_case_lab_db';
  const IDB_STORE = 'saves';
  const IDB_SAVE_ID = 'main';
  const LEGACY_KEYS = ['cs2_case_lab_state','cs2_case_lab_state_backup','cs2_case_lab_v8_state','cs2_case_lab_v7_state','cs2_case_lab_v6_state','cs2_case_lab_v5_state','cs2_case_lab_v4_state','cs2_case_lab_v3_state','cs2_case_lab_v2_state'];
  const API_BASES = [
    'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/',
    'https://bymykel.github.io/CSGO-API/api/en/',
    'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/'
  ];
  const API_ENDPOINTS = {crates:'crates.json', stickers:'stickers.json', agents:'agents.json', patches:'patches.json', keychains:'keychains.json', collectibles:'collectibles.json', skins:'skins.json', collections:'collections.json'};
  const RUB_PER_USD = 90;
  const RUB_PER_EUR = 100;
  const LC_USD_VALUE = 10;
  const RUB_PER_LC = RUB_PER_USD * LC_USD_VALUE;
  const CURRENCY = 'RUB';
  const PRICE_VERSION = 'market-multi-v31-16';
  const CURRENCY_OPTIONS = Object.freeze({
    RUB:{label:'₽', name:'Рубли', rate:1, suffix:'₽', decimals:0},
    USD:{label:'$', name:'Доллары', rate:RUB_PER_USD, prefix:'$', decimals:2},
    EUR:{label:'€', name:'Евро', rate:RUB_PER_EUR, suffix:'€', decimals:2},
    LC:{label:'LC', name:'LC', rate:RUB_PER_LC, suffix:'LC', decimals:2}
  });
  const THEME_KEY = 'cs2_case_lab_theme';
  const SITE_THEMES = Object.freeze([
    {id:'classic', name:'Classic', logo:'✦', title:'Классика'},
    {id:'dark', name:'Dark', logo:'🌙', title:'Тёмная'},
    {id:'light', name:'Light', logo:'☀', title:'Светлая'},
    {id:'vitality', name:'Vitality', logo:'VIT', title:'Team Vitality'},
    {id:'falcons', name:'Falcons', logo:'FLC', title:'Team Falcons'},
    {id:'fnatic', name:'Fnatic', logo:'FNC', title:'Fnatic'},
    {id:'9z', name:'9z', logo:'9Z', title:'9z Team'},
    {id:'spirit', name:'Spirit', logo:'TS', title:'Team Spirit'},
    {id:'vp', name:'VP', logo:'VP', title:'Virtus.pro'},
    {id:'cloud9', name:'Cloud9', logo:'C9', title:'Cloud9'},
    {id:'navi', name:'NAVI', logo:'NAVI', title:'Natus Vincere'},
    {id:'faze', name:'FaZe', logo:'FZ', title:'FaZe Clan'},
    {id:'parivision', name:'PARI', logo:'PV', title:'PARIVISION'}
  ]);
  const WHEEL_COOLDOWN = 2 * 60 * 60 * 1000;
  const AD_DAILY_LIMIT = 10;
  const AD_REWARD = 750;
  const AD_CLICK_REWARD_MAX = 5000;
  const AD_PROJECTS = Object.freeze([
    {id:'worldcup', title:'World Cup 2026', url:'https://efim26470-ops.github.io/worldcup/', emoji:'🏆', desc:'Интерактивный футбольный проект: команды, матчи, таблицы, бомбардиры и стилизованные темы чемпионата.'},
    {id:'fempriem', title:'FEM Приёмная комиссия', url:'https://efim26470-ops.github.io/Fempriem/', emoji:'🎓', desc:'Справочник абитуриента ФЭМ: направления, экзамены, формы обучения, цены, места и расчёт скидок.'},
    {id:'byrmalda-mobile', title:'Byrmalda Mobile', url:'https://efim26470-ops.github.io/byrmaldaMOBILE/', emoji:'📱', desc:'Мобильная версия проекта: адаптированный интерфейс для телефона, PWA-логика и быстрый доступ с экрана iPhone.'},
    {id:'project-prod', title:'Project Prod YouTube', url:'https://www.youtube.com/@proectprod', emoji:'▶️', desc:'YouTube-канал с видео, проектами, разбором учебных работ и демонстрациями разработок.'}
  ]);
  const BATTLE_PASS_PRICE = 200000;
  const BATTLE_PASS_MAX_LEVEL = 100;
  const SEASONAL_PASS_PRICE = 20 * RUB_PER_USD; // $20, хранится в рублях
  const SEASONAL_PASS_MAX_LEVEL = 30;
  const SEASONAL_PASS_DURATION = 30 * 24 * 60 * 60 * 1000;
  const SEASONAL_PASS_SEASON_ID = 'summer-dragon-v1';
  const DAILY_CONTRACT_REWARD = 6500;
  const DAILY_CONTRACT_SEED = 'daily-contracts-v1';
  const MARKET_SLOTS = 18;
  const TEAM_EVENT_NEED = 12;
  const SELL_COMMISSION = 0;
  const SEASON_TOKEN_NAME = 'ST';
  const XP_PER_LEVEL_BASE = 120;
  const INVESTMENT_SEED = 'invest-v31-13';
  const TEAM_THEMES = Object.freeze(['vitality','falcons','fnatic','9z','spirit','vp','cloud9','navi','faze','parivision']);
  const QUICK_MODE_LINKS = Object.freeze([
    {href:'wheel.html', icon:'🎡', label:'Колесо'},
    {href:'battle-pass.html', icon:'🏆', label:'Battle-pass'},
    {href:'seasonal-pass.html', icon:'⏳', label:'Season pass', seasonal:true},
    {href:'quests.html', icon:'📈', label:'Развитие'},
    {href:'promo.html', icon:'🎁', label:'Промо'},
    {href:'ads.html', icon:'📣', label:'Реклама'},
    {href:'install.html', icon:'⬇', label:'Скачать'}
  ]);
  const QUICK_MODE_HREFS = Object.freeze(QUICK_MODE_LINKS.map(x => x.href));
  const PROMO_CODES = Object.freeze({
    WELCOME30: 5000, EFIMDROP: 7500, IOSLAB: 3000, FASTOPEN: 2500, BATTLEFIX: 6000, RUBLELC: 10000, CASEKING: 15000, GREENLUCK: 4000, REDHUNT: 8000,
    KNIFEDREAM: 25000, ARMORYPASS: 12000, STICKER2026: 2000, DAILYBOOST: 1500, MEGALAB: 20000, TEST100K: 15000,
    WORLDCUP26: 9000, FEMSTART: 6500, MOBILELAB: 5500, PROJECTPROD: 7000, ADCLICK: 3500, VIEWBONUS: 2500, SKINSTART: 4500, CASEBOOST: 6000,
    DRAGONHEAT: 12000, SEASON30: 8000, MINESLUCK: 5000, UPGRADE2X: 3000, UPGRADE10X: 10000, CONTRACTPLUS: 4200, BATTLEARENA: 7500, THEMEPACK: 2800,
    VITALITYWIN: 6000, NAVINATION: 6000, FAZEUP: 6000, SPIRITDROP: 6000, CLOUDLUCK: 4000, FNATICOLD: 4000, FALCONSPEED: 4000, PARIVISION: 4000, VPPOWER: 4000, NINEZBOOST: 4000,
    GUNGNIRDREAM: 18000, KATOWICE14: 14000, PATCHDROP: 2500, STICKERHUNT: 5000, AGENTMODE: 4500, DAILY2026: 2600,
    XPSTART: 3500, MARKETKING: 6200, INVESTPLUS: 7200, RAREEVENT: 8800, SEASONCOIN: 5400, CREATORLAB: 7600, PROFILEUP: 4300, MINESSAFE: 5200,
    CRAZYBATTLE: 9300, UNDERDOG: 6400, GOLDENTICKET: 11000, DAILYMISSION: 3900, COLLECTIONRUN: 5800, TRADETAX: 4700, LIGHTTHEME: 2200, DARKTHEME: 2200,
    CASEMAKER: 8300, SHOPPINGDAY: 5100, XPBOOSTER: 6900, TOKENHUNT: 6100, TENMILLION: 10000000
  });

  const PROMO_REWARDS = Object.freeze({
    LEVELUP:{type:'xp', amount:650, label:'650 XP'}, CASETOKEN:{type:'tokens', amount:25, label:'25 сезонных жетонов'}, RANDOMSKIN:{type:'item', min:500, max:9000, label:'случайный скин'}, STICKERBOX:{type:'category', category:'sticker', min:300, max:8000, label:'случайная наклейка'}, PATCHBOX:{type:'category', category:'patch', min:250, max:6000, label:'случайный патч'}, BATTLEFREE:{type:'balance', amount:11000, label:'11 000 ₽'}, MARKETDAY:{type:'tokens', amount:40, label:'40 ST'}, DRAGONLUCK:{type:'item', min:5000, max:45000, label:'сильный предмет'}, AVATARPACK:{type:'profile', amount:1, label:'набор профиля'}, EVENTBOOST:{type:'xp_tokens', xp:350, tokens:20, label:'350 XP + 20 ST'},
    RANKBOOST:{type:'xp', amount:1200, label:'1200 XP'}, SEASONSHOP:{type:'tokens', amount:60, label:'60 ST'}, CASECREATOR:{type:'balance', amount:12500, label:'12 500 ₽'}, INVESTOR:{type:'balance', amount:9000, label:'9 000 ₽'}, COLLECTOR:{type:'category', category:'sticker', min:700, max:12000, label:'коллекционный предмет'},
    LEVEL25:{type:'xp', amount:2500, label:'2500 XP'}, ST100:{type:'tokens', amount:100, label:'100 ST'}, HIGHSKIN:{type:'item', min:12000, max:65000, label:'дорогой скин'},
    HOLODROP:{type:'category', category:'sticker', min:1200, max:25000, label:'holo/gold наклейка'}, PATCHKING:{type:'category', category:'patch', min:500, max:12000, label:'патч'},
    PROFILEBOX:{type:'profile', amount:1, label:'косметика профиля'}, EVENTPASS:{type:'xp_tokens', xp:800, tokens:80, label:'800 XP + 80 ST'},
    MAJORPACK:{type:'category', category:'sticker', min:2500, max:35000, label:'major item'}, KNIFECHASE:{type:'item', min:18000, max:95000, label:'премиум предмет'},
    STARTERPLUS:{type:'xp_tokens', xp:450, tokens:35, label:'450 XP + 35 ST'}, COLLECTORBOX:{type:'category', category:'sticker', min:800, max:16000, label:'collector drop'},
    MINEBOOST:{type:'xp', amount:900, label:'900 XP'}, MARKETBOOST:{type:'tokens', amount:55, label:'55 ST'}, DRAGONPACK:{type:'item', min:25000, max:120000, label:'dragon-tier item'}
  });
  const DAY_KEY = () => new Date().toISOString().slice(0,10);
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const rnd = (a,b) => a + cryptoRandom() * (b-a);
  function cryptoRandom(){
    try{ const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; }
    catch(e){ return Math.random(); }
  }
  const sample = arr => arr[Math.floor(cryptoRandom() * arr.length)];
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function activeCurrency(){
    try{
      const code = String((state && state.currency) || 'RUB').toUpperCase();
      return CURRENCY_OPTIONS[code] ? code : 'RUB';
    }catch(e){ return 'RUB'; }
  }
  function fmt(n, forcedCurrency){
    const rub = Number.isFinite(Number(n)) ? Number(n) : 0;
    const code = CURRENCY_OPTIONS[forcedCurrency] ? forcedCurrency : activeCurrency();
    const cfg = CURRENCY_OPTIONS[code] || CURRENCY_OPTIONS.RUB;
    const value = cfg.rate ? rub / cfg.rate : rub;
    const decimals = cfg.decimals || 0;
    const abs = Math.abs(value);
    const digits = decimals ? (abs >= 100 ? 1 : 2) : 0;
    const num = value.toLocaleString('ru-RU', {minimumFractionDigits:0, maximumFractionDigits:digits});
    return `${cfg.prefix || ''}${num}${cfg.suffix ? ' ' + cfg.suffix : ''}`;
  }
  function currencySelectHtml(){
    const current = activeCurrency();
    return `<label class="currency-switch" title="Переключает только отображение цен. Баланс и расчёты хранятся в рублях; 1 LC = $10."><span>Валюта</span><select class="currency-select" aria-label="Валюта">${Object.keys(CURRENCY_OPTIONS).map(code=>`<option value="${code}" ${code===current?'selected':''}>${CURRENCY_OPTIONS[code].label}</option>`).join('')}</select></label>`;
  }
  function fixImageUrl(url){
    url = String(url || '').trim();
    if(!url) return '';
    // raw.githubusercontent иногда не отдает картинки на мобильных/у провайдеров.
    // Переводим ассеты ByMykel на jsDelivr CDN, чтобы фото кейсов и скинов грузились стабильнее на GitHub Pages/iOS.
    const imgRaw = 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/';
    if(url.startsWith(imgRaw)) return 'https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/' + url.slice(imgRaw.length);
    const apiRaw = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/';
    if(url.startsWith(apiRaw)) return 'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/' + url.slice(apiRaw.length);
    return url;
  }
  function imgSrc(url, fallback){ return fixImageUrl(url) || fallback || svgSkin('CS2 Skin'); }
  function altImageUrl(url){
    url = String(url || '').trim();
    if(!url || /^data:image\/svg/i.test(url)) return '';
    const rawImg = 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/';
    const cdnImg = 'https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/';
    const rawApi = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/';
    const cdnApi = 'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/';
    if(url.startsWith(cdnImg)) return rawImg + url.slice(cdnImg.length);
    if(url.startsWith(rawImg)) return cdnImg + url.slice(rawImg.length);
    if(url.startsWith(cdnApi)) return rawApi + url.slice(cdnApi.length);
    if(url.startsWith(rawApi)) return cdnApi + url.slice(rawApi.length);
    return '';
  }
  window.__caseLabImgFallback = function(img){
    try{
      const alt = img && img.dataset ? img.dataset.altSrc : '';
      if(alt && img.src !== alt){ img.dataset.altSrc = ''; img.src = alt; return; }
      if(img) img.remove();
    }catch(e){}
  };
  function isSvgImage(url){ return /^data:image\/svg/i.test(String(url || '')); }
  function realImageUrl(url){ url = fixImageUrl(url); return url && !isSvgImage(url) ? url : ''; }
  const imgSafe = v => esc(imgSrc(v,''));
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

  const cs2Img = path => 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/' + path;
  const itemImg = path => cs2Img(path);
  const fallbackItemImages = {
    ak_redline:itemImg('default_generated/weapon_ak47_cu_ak47_cobra_light_png.png'),
    ak_vulcan:itemImg('default_generated/weapon_ak47_cu_ak47_vulcan_light_png.png'),
    ak_headshot:itemImg('default_generated/weapon_ak47_cu_ak_head_shot_holo_light_png.png'),
    ak_ice:itemImg('default_generated/weapon_ak47_am_ak47_courage_alt_light_png.png'),
    m4a1_print:itemImg('default_generated/weapon_m4a1_silencer_cu_m4a1s_printstream_light_png.png'),
    m4a1_decimator:itemImg('default_generated/weapon_m4a1_silencer_cu_m4a1_decimator_light_png.png'),
    m4a4_neo:itemImg('default_generated/weapon_m4a1_cu_m4a4_neo_noir_light_png.png'),
    awp_asiimov:itemImg('default_generated/weapon_awp_cu_awp_asimov_light_png.png'),
    awp_hyper:itemImg('default_generated/weapon_awp_cu_awp_hyper_beast_light_png.png'),
    awp_duality:itemImg('default_generated/weapon_awp_gs_awp_limbo_snake_light_png.png'),
    deagle_print:itemImg('default_generated/weapon_deagle_cu_deag_printstream_light_png.png'),
    deagle_ocean:itemImg('default_generated/weapon_deagle_am_deagle_ocean_drive_light_png.png'),
    usp_kill:itemImg('default_generated/weapon_usp_silencer_cu_usp_kill_confirmed_light_png.png'),
    usp_cortex:itemImg('default_generated/weapon_usp_silencer_cu_usp_cut_light_png.png'),
    glock_water:itemImg('default_generated/weapon_glock_am_water_elemental_light_png.png'),
    p250_asiimov:itemImg('default_generated/weapon_p250_cu_p250_asiimov_light_png.png'),
    tec9_isaac:itemImg('default_generated/weapon_tec9_cu_tec9_asiimov_light_png.png'),
    mp9_food:itemImg('default_generated/weapon_mp9_cu_mp9_food_chain_light_png.png'),
    mac10_neon:itemImg('default_generated/weapon_mac10_cu_mac10_neonrider_light_png.png'),
    p90_death:itemImg('default_generated/weapon_p90_cu_p90_grimm_light_png.png'),
    ssg_fever:itemImg('default_generated/weapon_ssg08_sp_ssg08_fever_dream_light_png.png'),
    ump_primal:itemImg('default_generated/weapon_ump45_cu_ump45_primalsaber_light_png.png'),
    famas_mecha:itemImg('default_generated/weapon_famas_gs_famas_mecha_light_png.png'),
    galil_chatter:itemImg('default_generated/weapon_galilar_cu_galil_chatterbox_light_png.png'),
    knife_butterfly:itemImg('weapons/base_weapons/weapon_knife_butterfly_png.png'),
    knife_karambit:itemImg('weapons/base_weapons/weapon_knife_karambit_png.png'),
    knife_kukri:itemImg('weapons/base_weapons/weapon_knife_kukri_png.png'),
    gloves_sport:itemImg('weapons/base_weapons/ct_gloves_png.png'),
    gloves_driver:itemImg('weapons/base_weapons/t_gloves_png.png'),
    gloves_broken:itemImg('weapons/base_weapons/ct_gloves_png.png')
  };

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
  ].map(x => ({id:x[0],name:x[1],rarity:x[2],value:x[3],rarityColor:rarityColors[x[2]]||'#60a5fa',weight:rarityWeight[x[2]]||8,image:fallbackItemImages[x[0]] || ''})).map(applySteamLikePrice);
  const fallbackCases = [
    {id:'kilowatt',name:'Kilowatt Case',price:690,image:cs2Img('weapon_cases/crate_community_33_png.png'),items:fallbackItems.slice(0,18).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'revolution',name:'Revolution Case',price:760,image:cs2Img('weapon_cases/crate_community_31_png.png'),items:fallbackItems.slice(4,23).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'recoil',name:'Recoil Case',price:720,image:cs2Img('weapon_cases/crate_community_30_png.png'),items:fallbackItems.slice(2,24).concat(fallbackItems.slice(-5)),source:'offline-classic',kind:'case'},
    {id:'dreams',name:'Dreams & Nightmares Case',price:650,image:cs2Img('weapon_cases/crate_community_29_png.png'),items:fallbackItems.slice(8,24).concat(fallbackItems.slice(-5)),source:'offline-classic',kind:'case'},
    {id:'snakebite',name:'Snakebite Case',price:520,image:cs2Img('weapon_cases/crate_community_27_png.png'),items:fallbackItems.slice(0,20).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'fracture',name:'Fracture Case',price:540,image:cs2Img('weapon_cases/crate_community_26_png.png'),items:fallbackItems.slice(3,22).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'clutch',name:'Clutch Case',price:620,image:cs2Img('weapon_cases/crate_community_17_png.png'),items:fallbackItems.slice(5,24).concat(fallbackItems.slice(-5)),source:'offline-classic',kind:'case'},
    {id:'prisma2',name:'Prisma 2 Case',price:590,image:cs2Img('weapon_cases/crate_community_25_png.png'),items:fallbackItems.slice(0,21).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'spectrum2',name:'Spectrum 2 Case',price:820,image:cs2Img('weapon_cases/crate_community_16_png.png'),items:fallbackItems.slice(4,24).concat(fallbackItems.slice(-5)),source:'offline-classic',kind:'case'},
    {id:'premium',name:'Covert Premium Case',price:1500,image:svgCase('VIP'),items:fallbackItems.filter(i => ['Classified','Covert','Exceedingly Rare','Extraordinary'].includes(i.rarity)),source:'offline-fallback',kind:'special'},
    {id:'knife',name:'Knife & Gloves Case',price:3200,image:svgCase('GOLD'),items:fallbackItems.filter(i => ['Covert','Exceedingly Rare','Extraordinary'].includes(i.rarity)),source:'offline-fallback',kind:'special'}
  ].map((c,i)=>withHiddenOdds(c,i));
  let catalog = {items:fallbackItems, cases:fallbackCases, source:'fallback'};
  let storageWarned = false;
  let storageHealth = {local:false, session:false, indexedDB:false, windowName:false, mode:'starting', lastError:''};
  const STORAGE_KEEP_KEYS = new Set([LS_KEY, THEME_KEY, BACKUP_KEY]);
  function shouldRemoveLegacyStorageKey(k){
    if(!k || STORAGE_KEEP_KEYS.has(k)) return false;
    // Удаляем только старые save-ключи. Раньше тут удалялся cs2_case_lab_theme,
    // поэтому тема сбрасывалась при переходе на новую HTML-страницу.
    return LEGACY_KEYS.includes(k) || /^cs2_case_lab_(state|save|session|v\d+|backup)/i.test(k);
  }
  cleanupStorageBeforeLoad();
  let state = loadState();
  let busy = {case:false,wheel:false,battle:false,ad:false,upgrade:false};
  let bootLoaded = false;
  let live = [];
  let wheelDeg = 0;
  let currentCase = null;
  let upgradeMode = 2;

  function defaultState(){ return {version:VERSION,balance:15000,currency:'RUB',inventory:[],opened:0,earned:0,spent:0,sold:0,upgrades:0,contracts:0,battles:0,wins:0,mines:0,minesWins:0,tx:[],pendingUpgrade:null,upgradeMode:2,contractSelected:[],lastWheelAt:0,adViews:{},adClicks:{},usedPromos:[],battlePass:defaultBattlePass(),seasonalPass:defaultSeasonalPass(),minesGame:null,dailyContracts:defaultDailyContracts(),achievementsClaimed:[],collectionRewards:[],market:{bought:0,sold:0,lastSeed:''},themeEvents:{},crafts:0,xp:0,seasonTokens:0,avatar:'classic',title:'Новичок',investments:[],customCases:[],rareEvents:[],createdCases:0,profileFrame:'default',createdAt:Date.now(),savedAt:Date.now()}; }
  function defaultBattlePass(){ return {active:false,level:0,activatedAt:0,current:{level:1,counts:{}},rewards:[],vouchers:[]}; }
  function defaultSeasonalPass(){ return {seasonId:SEASONAL_PASS_SEASON_ID,seasonStartedAt:Date.now(),active:false,level:0,activatedAt:0,current:{level:1,counts:{}},rewards:[],vouchers:[]}; }
  function defaultDailyContracts(){ return {date:'',claimed:false,counts:{}}; }
  function normalizeSeasonalPass(sp, fallbackStart){
    const base = defaultSeasonalPass();
    sp = (sp && typeof sp === 'object') ? sp : {};
    const out = Object.assign(base, sp);
    if(out.seasonId !== SEASONAL_PASS_SEASON_ID){
      out.seasonId = SEASONAL_PASS_SEASON_ID;
      out.seasonStartedAt = Math.max(0, Math.round(toNum(fallbackStart, Date.now())));
      out.active = false; out.level = 0; out.activatedAt = 0; out.current = {level:1, counts:{}}; out.rewards = []; out.vouchers = [];
    }
    out.seasonStartedAt = Math.max(0, Math.round(toNum(out.seasonStartedAt, fallbackStart || Date.now())));
    out.active = !!out.active;
    out.level = clamp(Math.round(toNum(out.level,0)),0,SEASONAL_PASS_MAX_LEVEL);
    out.activatedAt = Math.max(0, Math.round(toNum(out.activatedAt,0)));
    out.current = (out.current && typeof out.current === 'object') ? out.current : {level:out.level+1,counts:{}};
    out.current.level = clamp(Math.round(toNum(out.current.level,out.level+1)),1,SEASONAL_PASS_MAX_LEVEL);
    out.current.counts = (out.current.counts && typeof out.current.counts === 'object') ? out.current.counts : {};
    out.rewards = Array.isArray(out.rewards) ? out.rewards.slice(0,80) : [];
    out.vouchers = Array.isArray(out.vouchers) ? out.vouchers.slice(0,40) : [];
    return out;
  }
  function normalizeBattlePass(bp){
    const base = defaultBattlePass();
    bp = (bp && typeof bp === 'object') ? bp : {};
    const out = Object.assign(base, bp);
    out.active = !!out.active;
    out.level = clamp(Math.round(toNum(out.level,0)),0,BATTLE_PASS_MAX_LEVEL);
    out.activatedAt = Math.max(0, Math.round(toNum(out.activatedAt,0)));
    out.current = (out.current && typeof out.current === 'object') ? out.current : {level:out.level+1,counts:{}};
    out.current.level = clamp(Math.round(toNum(out.current.level,out.level+1)),1,BATTLE_PASS_MAX_LEVEL);
    out.current.counts = (out.current.counts && typeof out.current.counts === 'object') ? out.current.counts : {};
    out.rewards = Array.isArray(out.rewards) ? out.rewards.slice(0,160) : [];
    out.vouchers = Array.isArray(out.vouchers) ? out.vouchers.slice(0,80) : [];
    return out;
  }
  function normalizeMinesGame(g){
    if(!g || typeof g !== 'object' || !g.active || !g.stakeUid) return null;
    const cells = Array.isArray(g.cells) ? g.cells.map(x=>Math.round(toNum(x,-1))).filter(x=>x>=0&&x<25).slice(0,24) : [];
    const revealed = Array.isArray(g.revealed) ? Array.from(new Set(g.revealed.map(x=>Math.round(toNum(x,-1))).filter(x=>x>=0&&x<25))).slice(0,24) : [];
    const mineCount = clamp(Math.round(toNum(g.mineCount,5)),3,18);
    return {active:true, stakeUid:String(g.stakeUid), mineCount, cells:Array.from(new Set(cells)).slice(0,mineCount), revealed, startedAt:Math.max(0,Math.round(toNum(g.startedAt,Date.now()))), lostCell:Number.isFinite(Number(g.lostCell))?Math.round(Number(g.lostCell)):null, finished:!!g.finished};
  }
  function normalizeDailyContracts(dc){
    const d = (dc && typeof dc === 'object') ? dc : defaultDailyContracts();
    const today = DAY_KEY();
    if(d.date !== today) return {date:today, claimed:false, counts:{}};
    return {date:today, claimed:!!d.claimed, counts:(d.counts && typeof d.counts === 'object') ? d.counts : {}};
  }
  function toNum(v,d=0){ const n = Number(String(v).replace(/\s/g,'').replace(',','.')); return Number.isFinite(n) ? n : d; }
  function normalizeState(raw){
    const base = defaultState();
    const s = Object.assign(base, raw && typeof raw === 'object' ? raw : {});
    s.balance = toNum(s.balance, 15000);
    if(s.balance < 0 || !Number.isFinite(s.balance)) s.balance = 15000;
    s.currency = String(s.currency || 'RUB').toUpperCase();
    if(!CURRENCY_OPTIONS[s.currency]) s.currency = 'RUB';
    ['opened','earned','spent','sold','upgrades','contracts','battles','wins','mines','minesWins'].forEach(k => s[k] = Math.max(0, Math.round(toNum(s[k],0))));
    s.upgradeMode = normalizeUpgradeMode(s.upgradeMode);
    s.minesGame = normalizeMinesGame(s.minesGame);
    s.inventory = Array.isArray(s.inventory) ? s.inventory.filter(Boolean).map(normalizeInvItem).filter(Boolean) : [];
    s.tx = Array.isArray(s.tx) ? s.tx.slice(0,60) : [];
    s.contractSelected = Array.isArray(s.contractSelected) ? s.contractSelected : [];
    s.lastWheelAt = Math.max(0, Math.round(toNum(s.lastWheelAt,0)));
    s.adViews = (s.adViews && typeof s.adViews === 'object') ? s.adViews : {};
    s.adClicks = (s.adClicks && typeof s.adClicks === 'object') ? s.adClicks : {};
    s.usedPromos = Array.isArray(s.usedPromos) ? s.usedPromos.map(x=>String(x).toUpperCase()).slice(0,100) : [];
    s.dailyContracts = normalizeDailyContracts(s.dailyContracts);
    s.achievementsClaimed = Array.isArray(s.achievementsClaimed) ? s.achievementsClaimed.map(String).slice(0,80) : [];
    s.collectionRewards = Array.isArray(s.collectionRewards) ? s.collectionRewards.map(String).slice(0,80) : [];
    s.market = (s.market && typeof s.market === 'object') ? s.market : {bought:0,sold:0,lastSeed:''};
    s.market.bought = Math.max(0, Math.round(toNum(s.market.bought,0)));
    s.market.sold = Math.max(0, Math.round(toNum(s.market.sold,0)));
    s.market.lastSeed = String(s.market.lastSeed || '');
    s.themeEvents = (s.themeEvents && typeof s.themeEvents === 'object') ? s.themeEvents : {};
    s.crafts = Math.max(0, Math.round(toNum(s.crafts,0)));

    s.xp = Math.max(0, Math.round(toNum(s.xp,0)));
    s.seasonTokens = Math.max(0, Math.round(toNum(s.seasonTokens,0)));
    s.avatar = String(s.avatar || 'classic');
    s.title = String(s.title || 'Новичок');
    s.profileFrame = String(s.profileFrame || 'default');
    s.investments = Array.isArray(s.investments) ? s.investments.map(x=>({id:String(x.id||''), qty:Math.max(0,Math.round(toNum(x.qty,0))), avg:Math.max(0,Math.round(toNum(x.avg,0))), boughtAt:Math.max(0,Math.round(toNum(x.boughtAt,Date.now())))})).filter(x=>x.id&&x.qty>0).slice(0,80) : [];
    s.customCases = Array.isArray(s.customCases) ? s.customCases.map(x=>({id:String(x.id||id()), name:String(x.name||'Custom Case').slice(0,48), price:Math.max(100,Math.round(toNum(x.price,1000))), itemIds:Array.isArray(x.itemIds)?x.itemIds.map(String).slice(0,40):[], theme:String(x.theme||'custom'), createdAt:Math.max(0,Math.round(toNum(x.createdAt,Date.now())))})).filter(x=>x.itemIds.length>=3).slice(0,24) : [];
    s.rareEvents = Array.isArray(s.rareEvents) ? s.rareEvents.slice(0,40) : [];
    s.createdCases = Math.max(0, Math.round(toNum(s.createdCases,0)));
    s.battlePass = normalizeBattlePass(s.battlePass);
    s.seasonalPass = normalizeSeasonalPass(s.seasonalPass, s.createdAt || Date.now());
    return s;
  }
  function normalizeInvItem(it){
    if(!it || !(it.name || it.displayName)) return null;
    const r = it.rarity || 'Mil-Spec Grade';
    let normalized = Object.assign({}, it, {uid:it.uid||id(), name:it.name||it.displayName, displayName:it.displayName||it.name, rarity:r, rarityColor:it.rarityColor||rarityColors[r]||'#60a5fa', value:Math.max(1,Math.round(toNum(it.value,100))), image:fixImageUrl(it.image)||svgSkin(it.name||'Skin'), currency:it.currency||CURRENCY, priceVersion:it.priceVersion||'', favorite:!!it.favorite, protected:!!it.protected});
    if(normalized.priceVersion !== PRICE_VERSION){
      const repriced = applySteamLikePrice(normalized);
      normalized.value = repriced.value; normalized.steamUsd = repriced.steamUsd; normalized.steamRub = repriced.steamRub; normalized.currency = CURRENCY; normalized.priceVersion = PRICE_VERSION;
    }
    return normalized;
  }
  function allSaveKeys(){
    const keys = new Set([LS_KEY, ...LEGACY_KEYS]);
    try{
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(shouldRemoveLegacyStorageKey(k)) keys.add(k);
      }
    }catch(e){}
    return Array.from(keys).filter(k => k && k !== THEME_KEY);
  }
  function compactInvItem(it){
    if(!it) return null;
    const r = it.rarity || 'Mil-Spec Grade';
    return {
      uid: it.uid || id(), id: it.id || it.baseId || slug(it.name || it.displayName || 'item'), baseId: it.baseId || it.id || slug(it.name || it.displayName || 'item'),
      name: it.name || it.displayName || 'CS2 Item', displayName: it.displayName || it.name || 'CS2 Item',
      rarity: r, rarityColor: it.rarityColor || rarityColors[r] || '#60a5fa', category: it.category || 'skin',
      value: Math.max(1, Math.round(toNum(it.value, 100))), steamUsd: it.steamUsd || undefined, steamRub: it.steamRub || undefined, currency: it.currency || CURRENCY, priceVersion: it.priceVersion || PRICE_VERSION, marketHashName: it.marketHashName || it.market_hash_name || it.name,
      image: fixImageUrl(it.image) || svgSkin(it.name || it.displayName || 'CS2 Item'), wear: it.wear || '', float: it.float || '', source: it.source || '', favorite: !!it.favorite, protected: !!it.protected, addedAt: Math.max(0, Math.round(toNum(it.addedAt, Date.now())))
    };
  }
  function compactState(raw){
    const s = normalizeState(raw);
    return {
      version: VERSION, balance: Math.max(0, Math.round(toNum(s.balance,15000))), currency: s.currency || 'RUB', inventory: s.inventory.map(compactInvItem).filter(Boolean).slice(0,700),
      opened:s.opened, earned:s.earned, spent:s.spent, sold:s.sold, upgrades:s.upgrades, contracts:s.contracts, battles:s.battles, wins:s.wins, mines:s.mines, minesWins:s.minesWins,
      tx:(s.tx||[]).slice(0,80).map(t=>({id:t.id||id(), text:String(t.text||'Операция').slice(0,120), amount:Math.round(toNum(t.amount,0)), time:Math.max(0,Math.round(toNum(t.time,Date.now())))})),
      pendingUpgrade:s.pendingUpgrade||null, upgradeMode:s.upgradeMode||2, contractSelected:Array.isArray(s.contractSelected)?s.contractSelected.slice(0,10):[], lastWheelAt:s.lastWheelAt||0, adViews:s.adViews||{}, adClicks:s.adClicks||{}, usedPromos:Array.isArray(s.usedPromos)?s.usedPromos.slice(0,100):[], minesGame:normalizeMinesGame(s.minesGame),
      dailyContracts:normalizeDailyContracts(s.dailyContracts), achievementsClaimed:Array.isArray(s.achievementsClaimed)?s.achievementsClaimed.slice(0,80):[], collectionRewards:Array.isArray(s.collectionRewards)?s.collectionRewards.slice(0,80):[], market:s.market||{}, themeEvents:s.themeEvents||{}, crafts:Math.max(0,Math.round(toNum(s.crafts,0))), xp:Math.max(0,Math.round(toNum(s.xp,0))), seasonTokens:Math.max(0,Math.round(toNum(s.seasonTokens,0))), avatar:s.avatar||'classic', title:s.title||'Новичок', profileFrame:s.profileFrame||'default', investments:s.investments||[], customCases:s.customCases||[], rareEvents:s.rareEvents||[], createdCases:Math.max(0,Math.round(toNum(s.createdCases,0))),
      battlePass:normalizeBattlePass(s.battlePass), seasonalPass:normalizeSeasonalPass(s.seasonalPass, s.createdAt||Date.now()), createdAt:s.createdAt||Date.now(), savedAt:Date.now()
    };
  }
  function cleanupStorageBeforeLoad(){
    try{
      const keepRaw = localStorage.getItem(LS_KEY);
      const legacyRaw = !keepRaw ? LEGACY_KEYS.map(k => { try{return localStorage.getItem(k)}catch(e){return null} }).find(Boolean) : null;
      for(let i=localStorage.length-1;i>=0;i--){
        const k = localStorage.key(i);
        if(shouldRemoveLegacyStorageKey(k)) localStorage.removeItem(k);
      }
      if(!keepRaw && legacyRaw){
        try{ localStorage.setItem(LS_KEY, JSON.stringify(compactState(JSON.parse(legacyRaw)))); }catch(e){}
      }
    }catch(e){}
  }
  function parseStateRaw(raw){
    if(!raw || typeof raw !== 'string') return null;
    try{ return normalizeState(JSON.parse(raw)); }catch(e){ return null; }
  }
  function readWindowNameState(){
    try{
      const wn = String(window.name || '');
      const idx = wn.indexOf(WINDOW_SAVE_PREFIX);
      if(idx < 0) return null;
      return parseStateRaw(wn.slice(idx + WINDOW_SAVE_PREFIX.length));
    }catch(e){ return null; }
  }
  function writeWindowName(raw){
    try{
      window.name = WINDOW_SAVE_PREFIX + raw;
      storageHealth.windowName = true;
      return true;
    }catch(e){ return false; }
  }
  function bestState(candidates){
    const valid = candidates.filter(Boolean).map(normalizeState);
    if(!valid.length) return defaultState();
    valid.sort((a,b)=>{
      const sa = toNum(a.savedAt || a.createdAt,0), sb = toNum(b.savedAt || b.createdAt,0);
      if(sa !== sb) return sb - sa;
      const ia = Array.isArray(a.inventory) ? a.inventory.length : 0;
      const ib = Array.isArray(b.inventory) ? b.inventory.length : 0;
      if(ia !== ib) return ib - ia;
      return toNum(b.balance,0) - toNum(a.balance,0);
    });
    return valid[0];
  }
  function loadState(fallback=true){
    const candidates = [];
    try{ const raw = localStorage.getItem(LS_KEY); if(raw){ storageHealth.local = true; candidates.push(parseStateRaw(raw)); } }catch(e){ storageHealth.local = false; storageHealth.lastError = e && e.name ? e.name : String(e); }
    try{ const raw = sessionStorage.getItem(BACKUP_KEY); if(raw){ storageHealth.session = true; candidates.push(parseStateRaw(raw)); } }catch(e){ storageHealth.session = false; }
    const wn = readWindowNameState(); if(wn) candidates.push(wn);
    return candidates.length ? bestState(candidates) : (fallback ? defaultState() : null);
  }
  function openIDB(){
    return new Promise((resolve, reject)=>{
      if(!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
      const req = indexedDB.open(IDB_DB, 1);
      req.onupgradeneeded = () => { try{ req.result.createObjectStore(IDB_STORE); }catch(e){} };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('IndexedDB error'));
      req.onblocked = () => reject(new Error('IndexedDB blocked'));
    });
  }
  async function idbGet(){
    let db;
    try{
      db = await openIDB();
      return await new Promise((resolve,reject)=>{
        const tx = db.transaction(IDB_STORE,'readonly');
        const req = tx.objectStore(IDB_STORE).get(IDB_SAVE_ID);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error('IDB get error'));
      });
    }catch(e){ storageHealth.indexedDB = false; storageHealth.lastError = e && e.name ? e.name : String(e); return null; }
    finally{ try{ db && db.close(); }catch(e){} }
  }
  async function idbSet(raw){
    let db;
    try{
      db = await openIDB();
      await new Promise((resolve,reject)=>{
        const tx = db.transaction(IDB_STORE,'readwrite');
        tx.objectStore(IDB_STORE).put(raw, IDB_SAVE_ID);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('IDB put error'));
      });
      storageHealth.indexedDB = true;
      storageHealth.mode = storageHealth.local ? 'localStorage + IndexedDB backup' : 'IndexedDB fallback';
      return true;
    }catch(e){ storageHealth.indexedDB = false; storageHealth.lastError = e && e.name ? e.name : String(e); return false; }
    finally{ try{ db && db.close(); }catch(e){} }
  }
  async function idbDelete(){
    let db;
    try{
      db = await openIDB();
      await new Promise((resolve,reject)=>{
        const tx = db.transaction(IDB_STORE,'readwrite');
        tx.objectStore(IDB_STORE).delete(IDB_SAVE_ID);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('IDB delete error'));
      });
    }catch(e){}
    finally{ try{ db && db.close(); }catch(e){} }
  }
  async function loadStateAsync(){
    const sync = loadState(false);
    const idbRaw = await idbGet();
    const idbState = parseStateRaw(idbRaw);
    const best = bestState([sync, idbState]);
    storageHealth.mode = storageHealth.local ? 'localStorage' : (storageHealth.indexedDB ? 'IndexedDB fallback' : (storageHealth.session ? 'sessionStorage' : 'window.name / memory'));
    return best;
  }
  function save(){
    state = compactState(state);
    const raw = JSON.stringify(state);
    let okLocal = false, okSession = false, okWindow = false;
    try{ sessionStorage.setItem(BACKUP_KEY, raw); okSession = true; storageHealth.session = true; }catch(e){ storageHealth.session = false; }
    okWindow = writeWindowName(raw);
    try{
      cleanupStorageBeforeLoad();
      localStorage.setItem(LS_KEY, raw);
      okLocal = true;
      storageHealth.local = true;
    }catch(e){
      storageHealth.local = false;
      storageHealth.lastError = e && e.name ? e.name : String(e);
      try{
        for(let i=localStorage.length-1;i>=0;i--){ const k = localStorage.key(i); if(shouldRemoveLegacyStorageKey(k)) localStorage.removeItem(k); }
        localStorage.setItem(LS_KEY, raw);
        okLocal = true;
        storageHealth.local = true;
      }catch(err){ storageHealth.lastError = err && err.name ? err.name : String(err); }
    }
    idbSet(raw).then(ok => {
      if(ok){ storageHealth.indexedDB = true; renderGlobals(); }
      else if(!okLocal && !okSession && !okWindow && !storageWarned){
        storageWarned = true;
        toast('Браузер запретил постоянное сохранение. Прогресс держится только в памяти этой вкладки.', 'bad');
      }
    });
    if(okLocal) storageHealth.mode = 'localStorage';
    else if(storageHealth.indexedDB) storageHealth.mode = 'IndexedDB fallback';
    else if(okSession) storageHealth.mode = 'sessionStorage';
    else if(okWindow) storageHealth.mode = 'window.name';
    else storageHealth.mode = 'memory';
    renderGlobals();
    return okLocal || storageHealth.indexedDB || okSession || okWindow;
  }
  function addTx(text, amount){ state.tx.unshift({id:id(), text, amount:Math.round(amount), time:Date.now()}); state.tx = state.tx.slice(0,60); }
  function earn(amount, reason='Начисление'){
    amount = Math.max(0, Math.round(toNum(amount,0)));
    state.balance = Math.round(toNum(state.balance,15000) + amount);
    state.earned += amount;
    addXP(Math.max(1, Math.round(amount / 5000)), reason);
    addTx(reason, amount);
    save();
    toast(`+${fmt(amount)} · ${reason}`,'good');
  }
  function spend(amount, reason='Списание'){
    amount = Math.max(0, Math.round(toNum(amount,0)));
    state.balance = Math.round(toNum(state.balance,15000));
    if(state.balance < amount){ toast(`Недостаточно средств: нужно ${fmt(amount)}, у тебя ${fmt(state.balance)}`,'bad'); save(); return false; }
    state.balance -= amount;
    state.spent += amount;
    addTx(reason, -amount);
    save();
    toast(`-${fmt(amount)} · ${reason}`,'warn');
    return true;
  }
  function addItem(base, source='drop'){
    const w = sample(wears);
    const stattrak = cryptoRandom() < 0.07 && !String(base.name).startsWith('★');
    const value = Math.max(1, Math.round(toNum(base.value,100) * w[1] * (stattrak?1.5:1) * rnd(.88,1.16)));
    const item = compactInvItem(Object.assign({}, base, {uid:id(), baseId:base.id, displayName:(stattrak?'StatTrak™ ':'') + base.name, wear:w[0], float:rnd(w[2],w[3]).toFixed(5), value, source, addedAt:Date.now()}));
    state.inventory.unshift(item);
    state.inventory = state.inventory.slice(0,600);
    addXP(8 + Math.min(60, Math.round(value / 5000)), `Предмет: ${item.displayName||item.name}`);
    if(typeof checkMajorAlbumPickup === 'function') checkMajorAlbumPickup(item);
    if(typeof maybeAutoSellDrop === 'function') maybeAutoSellDrop(item, source);
    save();
    return item;
  }
  function removeItems(uids){
    const set = new Set(Array.isArray(uids)?uids:[uids]);
    state.inventory = state.inventory.filter(x => !set.has(x.uid));
    state.contractSelected = (state.contractSelected||[]).filter(x => !set.has(x));
    if(set.has(state.pendingUpgrade)) state.pendingUpgrade = null;
    if(state.minesGame && set.has(state.minesGame.stakeUid)) state.minesGame = null;
    save();
  }
  function sellItem(uid){
    const it = state.inventory.find(x => x.uid === uid);
    if(!it) return toast('Предмет уже не найден в инвентаре','bad');
    if(it.protected) return toast('Предмет защищён от продажи. Сними замок в инвентаре.','bad');
    const gross = Math.round(toNum(it.value,0));
    const net = applySaleCommission(gross);
    removeItems(uid);
    state.sold += net;
    earn(net, `Продажа ${it.displayName||it.name}`);
    bpEvent('sell', {value:net, count:1});
    route();
  }

  async function boot(){
    try{
      applySavedTheme();
      addToasts();
      initThemeSwitcher();
      initQuickModeDock();
      initIOSViewport();
      initScrollFix();
      initResponsiveMenu();
      initInstallPrompt();
      initMobileTapBridge();
      initV30MobileActionPatch();
      bindEvents();
      purgeOldCaches();
      // v23: service worker отключён, чтобы телефон не держал старый JS/картинки.
      // registerServiceWorker();
      seedLive();
      renderLive();
      setInterval(fakeLive, 4800);
      routeLoading();
      try{ state = await promiseTimeout(loadStateAsync(), 900, loadState(false)); }
      catch(e){ console.warn('save load fallback', e); state = loadState(false); }
      bootLoaded = true;
      window.addEventListener('pagehide', () => { try{ save(); }catch(e){} });
      window.addEventListener('beforeunload', () => { try{ save(); }catch(e){} });
      window.addEventListener('storage', e => { if(e.key === LS_KEY || e.key === BACKUP_KEY){ state = loadState(); renderGlobals(); } });
      renderGlobals();
      save();

      // v30: страницы не ждут внешний API. Сначала мгновенно рисуем встроенный каталог,
      // затем пробуем обновить его онлайн в фоне. Поэтому вкладки не зависают на «Загружаю…».
      catalog = buildOfflineCatalog();
      updateHeroShowcase();
      seedLive(true);
      renderLive();
      route();

      promiseTimeout(loadCatalog(), 6500, null).then(online => {
        if(online && online.cases && online.cases.length){
          catalog = online;
          updateHeroShowcase();
          seedLive(true);
          renderLive();
          route();
        }
      }).catch(e => console.warn('background catalog failed', e));
    }catch(err){
      console.error('Boot failed, emergency mode:', err);
      try{ applySavedTheme(); addToasts(); initThemeSwitcher(); }catch(e){}
      try{ bindEvents(); initMobileTapBridge(); initV30MobileActionPatch(); }catch(e){}
      try{ catalog = buildOfflineCatalog(); updateHeroShowcase(); route(); renderGlobals(); }catch(e){}
      try{ toast('Включён аварийный мобильный режим. Обнови страницу, если интерфейс загрузился не полностью.','warn'); }catch(e){}
    }
  }
  function promiseTimeout(p, ms, fallback){
    return new Promise(resolve => {
      let done = false;
      const t = setTimeout(() => { if(!done){ done = true; resolve(fallback); } }, ms);
      Promise.resolve(p).then(v => { if(!done){ done = true; clearTimeout(t); resolve(v); } }).catch(() => { if(!done){ done = true; clearTimeout(t); resolve(fallback); } });
    });
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
  async function loadEndpoint(name){
    const file = API_ENDPOINTS[name];
    let lastError = null;
    for(const base of API_BASES){
      try{ return await loadJSON(base + file); }
      catch(e){ lastError = e; }
    }
    throw lastError || new Error('API endpoint failed: ' + name);
  }
  async function loadCatalog(){
    try{
      const [cratesRes, stickersRes, agentsRes, patchesRes, keychainsRes, collectiblesRes, skinsRes, collectionsRes] = await Promise.allSettled([
        loadEndpoint('crates'), loadEndpoint('stickers'), loadEndpoint('agents'), loadEndpoint('patches'), loadEndpoint('keychains'), loadEndpoint('collectibles'), loadEndpoint('skins'), loadEndpoint('collections')
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
      toast('Онлайн-каталог не загрузился — включил встроенный резервный пул со старыми кейсами. Механики всё равно работают.','warn');
      return buildOfflineCatalog();
    }
  }
  function buildOfflineCatalog(){
    const stickers = ['Sticker | Natus Vincere | Copenhagen 2024','Sticker | Team Spirit (Holo) | Shanghai 2024','Sticker | FaZe Clan (Glitter) | Paris 2023','Sticker | G2 Esports (Gold) | Austin 2025','Sticker | m0NESY (Holo) | Copenhagen 2024'].map((n,i)=>applySteamLikePrice({id:'offline-sticker-'+i,name:n,rarity:['High Grade','Remarkable','Exotic','Extraordinary','Exotic'][i%5],rarityColor:rarityColors[['High Grade','Remarkable','Exotic','Extraordinary','Exotic'][i%5]],value:120+i*180,weight:20-i*3,image:svgSkin(n,'#facc15','#60a5fa'),category:'sticker'}));
    const agents = ['Sir Bloody Miami Darryl | The Professionals','Cmdr. Mae | SWAT','Number K | The Professionals','Special Agent Ava | FBI'].map((n,i)=>({id:'offline-agent-'+i,name:n,rarity:['Master','Superior','Exceptional','Distinguished'][i%4],rarityColor:rarityColors[['Master','Superior','Exceptional','Distinguished'][i%4]],value:900+i*620,weight:9+i*2,image:svgSkin(n,'#111827','#f59e0b'),category:'agent'}));
    const charms = ['Charm | Hot Hands','Charm | Baby Karat T','Charm | Lil Squirt','Charm | Chicken Lil'].map((n,i)=>applySteamLikePrice({id:'offline-charm-'+i,name:n,rarity:['High Grade','Remarkable','Exotic'][i%3],rarityColor:rarityColors[['High Grade','Remarkable','Exotic'][i%3]],value:180+i*190,weight:18-i*3,image:svgSkin(n,'#22c55e','#f97316'),category:'keychain'}));
    const patches = ['Patch | Metal Gold Nova','Patch | Bravo','Patch | Bayonet Frog','Patch | Howl'].map((n,i)=>applySteamLikePrice({id:'offline-patch-'+i,name:n,rarity:['High Grade','Remarkable','Exotic','Extraordinary'][i%4],rarityColor:rarityColors[['High Grade','Remarkable','Exotic','Extraordinary'][i%4]],value:110+i*160,weight:18-i*3,image:svgSkin(n,'#94a3b8','#ef4444'),category:'patch'}));
    const farmItems = farmEconomyItems();
    const items = [...fallbackItems, ...farmItems, ...stickers, ...agents, ...charms, ...patches];
    const base = fallbackCases.map((c,i)=>{ const pricedItems = c.items.map(applySteamLikePrice); return withHiddenOdds(Object.assign({}, c, {items:pricedItems, price:calcPrice(pricedItems,i,'case'), profitOdds:.42 + (i%4)*.08}),i); });
    return {items, cases:[...base,
      ...farmCaseSet(items),
      createSpecialCase('budget-random','Budget Random Case','Mil-Spec Grade',items.filter(x=>x.value<=450),85,'Очень дешёвый рандомный пул.'),
      createSpecialCase('profit-hunter','Profit Hunter Case','Classified',items.filter(x=>x.value>=300&&x.value<=5000),780,'Скрыто более щедрый профиль окупа.'),
      createSpecialCase('highroller-red','High Roller Red Case','Covert',items.filter(x=>x.value>=900),2800,'Дорогой рискованный пул.'),
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
    const casesRaw = crates.filter(c => c && /case/i.test(String(c.type || c.name || '')) && Array.isArray(c.contains) && c.contains.length > 5);
    const collectionsRaw = crates.filter(c => c && /collection/i.test(String(c.type || c.name || '')) && Array.isArray(c.contains) && c.contains.length > 5);
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
      return withHiddenOdds({id:(kind==='collection'?'col-':'case-') + (c.id || slug(c.name)), name:c.name, price, image:fixImageUrl(c.image) || svgCase(c.name), items, source:kind==='collection'?'CS2 Collection':'CS2 Case', kind, rareText:c.loot_list && c.loot_list.footer ? c.loot_list.footer : (kind==='collection'?'Коллекция CS2 с реальными названиями предметов.':'Редкий спецпредмет внутри')}, idx);
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
        const cc = withHiddenOdds({id:'collection-api-'+slug(name), name, price:calcPrice(pool,idx,'collection'), image:(fixImageUrl(col.image) || svgCase(name)), items:pool, source:'CS2 Collection', kind:'collection', rareText:'Коллекция CS2 / Armory с реальными названиями предметов.'}, cases.length);
        cases.push(cc);
      }
    });

    const itemList = () => Array.from(all.values()).filter(Boolean);
    const baseItems = itemList().length > 30 ? itemList() : fallbackItems;
    const items = [...baseItems, ...farmEconomyItems()];

    const add = c => { if(c && c.items && c.items.length >= 2) cases.push(withHiddenOdds(c, cases.length)); };
    farmCaseSet(items).forEach(c => { if(c) cases.push(c); });
    add(createSpecialCase('budget-random','Budget Random Case','Mil-Spec Grade',items.filter(i=>toNum(i.value,0) <= 450),85,'Очень дешёвый микс: чаще низкая цена, иногда окуп.'));
    add(createSpecialCase('budget-green','Cheap Green Case','High Grade',items.filter(i=>toNum(i.value,0) <= 650 && ['High Grade','Base Grade','Industrial Grade','Mil-Spec Grade'].includes(i.rarity)),120,'Дешёвый зелёный/синий пул.'));
    add(createSpecialCase('mid-risk','Risky Mid Case','Restricted',items.filter(i=>toNum(i.value,0) >= 180 && toNum(i.value,0) <= 2600),520,'Средний риск: может дать плюс, но часто минус.'));
    add(createSpecialCase('profit-hunter','Profit Hunter Case','Classified',items.filter(i=>toNum(i.value,0) >= 300 && toNum(i.value,0) <= 5000),780,'Скрыто более щедрый профиль окупа.'));
    add(createSpecialCase('highroller-red','High Roller Red Case','Covert',items.filter(i=>toNum(i.value,0) >= 900),2800,'Дорогой рискованный пул с большими перепадами.'));
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
  function thematicCaseImage(name, color){
    const safe = esc(name).slice(0,16);
    const c = color || '#ff7a18';
    const c2 = c === '#22c55e' ? '#064e3b' : c === '#ef4444' ? '#7f1d1d' : c === '#4b69ff' ? '#1e3a8a' : c === '#8b5cf6' ? '#4c1d95' : c === '#ec4899' ? '#831843' : '#111827';
    const icon = /knife/i.test(name) ? '★' : /glove/i.test(name) ? '✋' : /sticker|capsule|tournament/i.test(name) ? '◆' : /agent/i.test(name) ? '♟' : /charm|keychain/i.test(name) ? '✦' : /patch/i.test(name) ? '⬢' : /green/i.test(name) ? 'GREEN' : /red|covert/i.test(name) ? 'RED' : /blue|mil/i.test(name) ? 'BLUE' : /pink|classified/i.test(name) ? 'PINK' : 'CS2';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 460"><defs><radialGradient id="r" cx="50%" cy="0%" r="80%"><stop stop-color="${c}"/><stop offset="1" stop-color="${c2}"/></radialGradient><linearGradient id="g" x1="0" x2="1"><stop stop-color="#111827"/><stop offset="1" stop-color="${c}"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="26" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter></defs><rect width="680" height="460" rx="44" fill="#090d18"/><circle cx="135" cy="80" r="170" fill="${c}" opacity=".22"/><circle cx="550" cy="380" r="190" fill="${c}" opacity=".16"/><g filter="url(#s)"><path d="M120 165h440c24 0 43 19 43 43v230c0 24-19 43-43 43H120c-24 0-43-19-43-43V208c0-24 19-43 43-43z" fill="url(#g)" stroke="rgba(255,255,255,.22)" stroke-width="10"/><path d="M190 165v-36c0-44 32-76 76-76h148c44 0 76 32 76 76v36" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="22"/><rect x="110" y="205" width="460" height="132" rx="22" fill="url(#r)" opacity=".92"/><path d="M140 235h400M140 272h400M140 309h400" stroke="#020617" stroke-opacity=".28" stroke-width="9"/></g><text x="340" y="303" font-family="Arial" font-weight="900" font-size="76" fill="#fff" text-anchor="middle">${icon}</text><text x="340" y="392" font-family="Arial" font-weight="900" font-size="32" fill="#fff" text-anchor="middle">${safe}</text></svg>`);
  }
  function farmEconomyItems(){
    const defs = [
      ['farm-p2000-grass','P2000 | Grass Farm','Consumer Grade',14,'#355e3b','#9be564'],
      ['farm-glock-copper','Glock-18 | Copper Seed','Consumer Grade',16,'#7c2d12','#f59e0b'],
      ['farm-dual-barn','Dual Berettas | Old Barn','Consumer Grade',18,'#1f2937','#b45309'],
      ['farm-nova-hay','Nova | Haystack','Consumer Grade',19,'#78350f','#fde68a'],
      ['farm-mp7-field','MP7 | Field Path','Consumer Grade',22,'#14532d','#84cc16'],
      ['farm-mac10-mud','MAC-10 | Mud Track','Consumer Grade',24,'#292524','#a8a29e'],
      ['farm-ump-rust','UMP-45 | Rust Fence','Industrial Grade',27,'#431407','#fb923c'],
      ['farm-galil-wheat','Galil AR | Wheat Line','Industrial Grade',29,'#713f12','#facc15'],
      ['farm-famas-silo','FAMAS | Silo','Industrial Grade',32,'#334155','#38bdf8'],
      ['farm-mp9-dust','MP9 | Dust Stable','Industrial Grade',35,'#57534e','#fde68a'],
      ['farm-p250-fertilizer','P250 | Fertilizer','Industrial Grade',38,'#365314','#bef264'],
      ['farm-tec9-harvest','Tec-9 | Harvest','Industrial Grade',42,'#7f1d1d','#f97316'],
      ['farm-five7-orchard','Five-SeveN | Orchard','Mil-Spec Grade',48,'#064e3b','#22c55e'],
      ['farm-ssg-scarecrow','SSG 08 | Scarecrow','Mil-Spec Grade',54,'#451a03','#fbbf24'],
      ['farm-sawed-irrigation','Sawed-Off | Irrigation','Mil-Spec Grade',58,'#083344','#06b6d4'],
      ['farm-pp-bizon-market','PP-Bizon | Market Day','Mil-Spec Grade',62,'#4c1d95','#a78bfa'],
      ['farm-p90-tractor','P90 | Tractor Run','Mil-Spec Grade',68,'#7c2d12','#f97316'],
      ['farm-aug-greenhouse','AUG | Greenhouse','Mil-Spec Grade',75,'#052e16','#34d399'],
      ['farm-sg553-sunrise','SG 553 | Sunrise Field','Restricted',84,'#7c2d12','#facc15'],
      ['farm-xm-harvester','XM1014 | Harvester','Restricted',92,'#172554','#60a5fa']
    ];
    return defs.map(x => ({
      id:x[0], baseId:x[0], name:x[1], displayName:x[1], rarity:x[2], rarityColor:rarityColors[x[2]]||'#60a5fa',
      value:x[3], steamRub:x[3], steamUsd:Math.round((x[3]/RUB_PER_USD)*100)/100, currency:CURRENCY, priceVersion:PRICE_VERSION,
      weight:1, image:svgSkin(x[1],x[4],x[5]), category:'skin', marketHashName:x[1], source:'Farm Economy'
    }));
  }
  function bestFarmRare(pool, fallbackIndex=0){
    const candidates = (pool || []).filter(x => x && (x.category === 'skin' || !x.category) && toNum(x.value,0) >= 1600 && toNum(x.value,0) <= 15000 && !/souvenir package|viewer pass|capsule|sticker|patch|agent|charm|keychain/i.test(x.name || ''));
    const sorted = candidates.length ? candidates.slice().sort((a,b)=>toNum(b.value,0)-toNum(a.value,0)) : fallbackItems.slice().sort((a,b)=>toNum(b.value,0)-toNum(a.value,0));
    return sorted[fallbackIndex % Math.max(1, sorted.length)] || fallbackItems[0];
  }
  function createFarmCase(idv, name, sourcePool, price, rareIndex=0, text){
    const farm = farmEconomyItems();
    const cheapFromCatalog = (sourcePool || []).filter(x => x && (x.category === 'skin' || !x.category) && toNum(x.value,0) <= 115 && !/^farm-/i.test(x.id || '')).slice(0,18);
    const cheap = [...farm, ...cheapFromCatalog].slice(0,32).map((x,i) => Object.assign({}, x, {weight: 1 + (i % 5) * .04}));
    const rareBase = bestFarmRare(sourcePool, rareIndex);
    const rare = Object.assign({}, rareBase, {id:`${idv}-jackpot-${rareBase.id || slug(rareBase.name)}`, weight:.13 + (rareIndex % 4) * .025, source:'Farm Jackpot'});
    return {
      id:idv, name, price:clamp(Math.round(toNum(price, 79)), 25, 100), image:thematicCaseImage(name, '#22c55e'),
      items:[...cheap, rare], source:'Farm Case', kind:'farm', rareText:text || 'Фарм-кейс: много дешёвых пушек и один дорогой jackpot-дроп.',
      _odds:{profitOdds:.96,jackpot:.006,cheap:.30,priceMult:1}, _priced:true
    };
  }
  function farmCaseSet(pool){
    return [
      createFarmCase('farm-seed-49','Farm Case · Seed 49',pool,49,0,'Цена 49 ₽: почти всегда дешёвая пушка, но внутри один дорогой jackpot.'),
      createFarmCase('farm-harvest-69','Farm Case · Harvest 69',pool,69,1,'Цена 69 ₽: дешёвый широкий пул + один дорогой предмет.'),
      createFarmCase('farm-barn-89','Farm Case · Barn 89',pool,89,2,'Цена 89 ₽: больше дешёвых предметов, редкий шанс на дорогой скин.'),
      createFarmCase('farm-jackpot-99','Farm Case · Jackpot 99',pool,99,3,'Цена 99 ₽: самый рискованный фарм-кейс до 100 ₽.')
    ];
  }
  function isPersonalProfitCase(c){
    try{
      if(!c || c.kind === 'farm') return false;
      const seed = String((state && (state.createdAt || state.version)) || 'guest');
      return /profit-hunter|budget-random|budget-green/i.test(`${c.id} ${c.name}`) || stableNoise(`personal-profit:${seed}:${c.id || c.name}`) < .18;
    }catch(e){ return false; }
  }
  function createSpecialCase(idv,name,rar,pool,price,text){
    pool = (pool || []).filter(Boolean).slice(0,240);
    if(pool.length < 2) return null;
    const basePrice = Math.max(1, Math.round(toNum(price, 300)));
    const items = pool.map(x => Object.assign({}, x, {weight: (rarityWeight[x.rarity] || 8) * (x.value > basePrice ? .6 : 1.2)}));
    // v31: фиксированные кастомные кейсы тоже получают house-edge цену,
    // иначе отдельные пулы вроде агентов гарантированно давали прибыль.
    const fairPrice = Math.round(expectedDropValue(items, 'special') * 1.28);
    price = clamp(Math.max(basePrice, fairPrice), 120, 90000);
    return {id:idv, name, price, image:thematicCaseImage(name, rarityColors[rar] || themeColor({id:idv,name})), items, source:'Custom Pool', kind:'special', rareText:text};
  }
  function withHiddenOdds(c, idx=0){
    // v31: профили стали заметно жёстче. Симулятор остаётся фановой игрой,
    // но больше не должен превращать несколько тысяч рублей в миллионы за пару открытий.
    const profiles = [
      {profitOdds:.62,jackpot:.004,cheap:.72,priceMult:1.35},
      {profitOdds:.68,jackpot:.005,cheap:.66,priceMult:1.28},
      {profitOdds:.74,jackpot:.007,cheap:.60,priceMult:1.22},
      {profitOdds:.80,jackpot:.010,cheap:.54,priceMult:1.16},
      {profitOdds:.86,jackpot:.014,cheap:.48,priceMult:1.10},
      {profitOdds:.92,jackpot:.018,cheap:.42,priceMult:1.06}
    ];
    const p = profiles[Math.abs(idx) % profiles.length];
    c._odds = p;
    if(!c._priced){ c.price = clamp(Math.round(toNum(c.price,300) * (p.priceMult || 1)), 75, c.kind === 'special' ? 26000 : 14000); c._priced = true; }
    return c;
  }
  function apiItem(raw, category='skin'){
    if(!raw || !raw.name) return null;
    const r = rarityName(raw, category);
    const base = applySteamLikePrice({id:raw.id || slug(raw.market_hash_name || raw.name), name:raw.name, rarity:r, rarityColor:rarityColor(raw,r), image:fixImageUrl(raw.image) || svgSkin(raw.name), category, marketHashName:raw.market_hash_name || raw.name, weight:rarityWeight[r] || 7});
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
    const name = String(it.name || it.marketHashName || '');
    const lower = name.toLowerCase();
    const rarity = it.rarity || 'Mil-Spec Grade';
    const category = String(it.category || 'skin').toLowerCase();
    const knownRub = knownMarketRub(lower);
    const rarityBase = {
      'Consumer Grade': 18, 'Base Grade': 25, 'Industrial Grade': 65, 'Mil-Spec Grade': 170,
      'Restricted': 620, 'Classified': 2300, 'Covert': 7800, 'Contraband': 520000,
      'Exceedingly Rare': 36000, 'Extraordinary': 32000,
      'High Grade': 65, 'Remarkable': 360, 'Exotic': 1350,
      'Distinguished': 520, 'Exceptional': 1350, 'Superior': 3200, 'Master': 7600,
      'Master Agent': 7600, 'Superior Agent': 3200, 'Exceptional Agent': 1350, 'Distinguished Agent': 520
    };
    let rub = knownRub || rarityBase[rarity] || 180;

    if(!knownRub){
      const weaponTier = /ak-47|awp|m4a1-s|m4a4|desert eagle|usp-s/i.test(name) ? 1.65 : /glock|mac-10|mp9|ssg 08|famas|galil|p250|tec-9/i.test(name) ? 1.18 : 1;
      const collector = /printstream|asiimov|neo-noir|hyper beast|bloodsport|empress|vulcan|redline|case hardened|fade|doppler|slaughter|crimson web|gold arabesque|welcome to the jungle|hot rod|icarus fell|blue phosphor|wild lotus|gungnir|dragon lore|medusa|howl|hydroponic|fire serpent|fuel injector/i.test(name) ? 2.25 : 1;
      const cheapPattern = /sand dune|safari mesh|predator|storm|urban dashed|forest ddpat|groundwater|boreal forest|scorched|contractor|colony|army sheen/i.test(name) ? 0.38 : 1;
      const newCaseBump = /kilowatt|revolution|recoil|snakebite|dreams|nightmares|fracture|prisma|clutch|spectrum/i.test(name) ? 1.08 : 1;
      rub *= weaponTier * collector * cheapPattern * newCaseBump;

      if(name.startsWith('★') || /knife|bayonet|karambit|butterfly|m9|talon|kukri|skeleton|nomad|stiletto|ursus|paracord|survival|classic|flip|gut|navaja|falchion|shadow daggers/i.test(name)) rub = knifeRub(lower);
      if(/gloves/i.test(name)) rub = glovesRub(lower);
      if(category === 'sticker') rub = stickerRub(lower, rarity);
      if(category === 'patch') rub = patchRub(lower, rarity);
      if(category === 'keychain') rub = keychainRub(lower, rarity);
      if(category === 'agent') rub = agentRub(lower, rarity);
      if(category === 'collectible') rub = collectibleRub(lower, rarity);
    }

    const volatility = knownRub ? 0.08 : 0.34;
    const noise = 1 - volatility / 2 + stableNoise(name) * volatility;
    const value = Math.max(3, Math.round(rub * noise));
    return Object.assign({}, it, {
      value,
      steamUsd: Math.round((value / RUB_PER_USD) * 100) / 100,
      steamRub: value,
      currency: CURRENCY,
      priceVersion: PRICE_VERSION,
      weight: it.weight || rarityWeight[rarity] || 7
    });
  }
  function knownMarketRub(lower){
    const exact = [
      ['souvenir package | cobblestone', 320000], ['cobblestone souvenir package', 320000], ['dreamhack 2013 souvenir package', 180000],
      ['awp | dragon lore', 1120000], ['m4a4 | howl', 610000], ['ak-47 | wild lotus', 820000], ['awp | gungnir', 870000], ['awp | medusa', 410000],
      ['awp | desert hydra', 175000], ['awp | the prince', 220000], ['ak-47 | fire serpent', 98000], ['ak-47 | hydroponic', 160000], ['ak-47 | gold arabesque', 145000],
      ['m4a1-s | knight', 155000], ['m4a4 | poseidon', 120000], ['m4a1-s | hot rod', 95000], ['m4a1-s | blue phosphor', 76000], ['m4a1-s | icarus fell', 44000],
      ['ak-47 | vulcan', 17000], ['ak-47 | fuel injector', 14000], ['ak-47 | bloodsport', 6500], ['ak-47 | the empress', 6200], ['ak-47 | head shot', 3900], ['ak-47 | redline', 2250], ['ak-47 | legion of anubis', 2100], ['ak-47 | ice coaled', 1500],
      ['awp | asiimov', 10800], ['awp | hyper beast', 6200], ['awp | neo-noir', 3300], ['awp | containment breach', 7800], ['awp | chromatic aberration', 3200], ['awp | duality', 900], ['awp | fever dream', 620], ['awp | paw', 380],
      ['m4a1-s | printstream', 8100], ['m4a1-s | hyper beast', 3800], ['m4a1-s | decimator', 1850], ['m4a1-s | nightmare', 1300], ['m4a1-s | player two', 3100], ['m4a1-s | leaded glass', 850],
      ['m4a4 | neo-noir', 3100], ['m4a4 | the emperor', 3400], ['m4a4 | desolate space', 1700], ['m4a4 | in living color', 1800], ['m4a4 | temukau', 5600],
      ['desert eagle | printstream', 5900], ['desert eagle | ocean drive', 2500], ['desert eagle | code red', 2600], ['desert eagle | golden koi', 5200], ['desert eagle | conspiracy', 1100],
      ['usp-s | kill confirmed', 7200], ['usp-s | printstream', 4800], ['usp-s | the traitor', 3200], ['usp-s | cortex', 820], ['usp-s | neo-noir', 2200],
      ['glock-18 | gamma doppler', 2600], ['glock-18 | bullet queen', 1700], ['glock-18 | water elemental', 920], ['glock-18 | vogue', 680], ['glock-18 | moonrise', 240],
      ['p250 | asiimov', 780], ['p250 | see ya later', 650], ['tec-9 | fuel injector', 650], ['tec-9 | isaac', 190], ['five-seven | hyper beast', 1800], ['five-seven | fairy tale', 950],
      ['mp9 | food chain', 680], ['mp9 | starlight protector', 1200], ['mac-10 | neon rider', 1250], ['mac-10 | disco tech', 780], ['p90 | death grip', 380], ['ssg 08 | fever dream', 390], ['ump-45 | primal saber', 680], ['famas | mecha industries', 820], ['galil ar | chatterbox', 520],
      ['sticker | crown', 43000], ['sticker | howl', 39500], ['sticker | donk (holo) | austin 2025', 1030], ['sticker | m0nesy (holo) | austin 2025', 1000], ['sticker | zywoo (gold) | austin 2025', 1190],
      ['ibuyPower | katowice 2014', 860000], ['titan | katowice 2014', 520000], ['reason gaming | katowice 2014', 250000], ['dignitas | katowice 2014', 180000], ['vox eminor | katowice 2014', 92000], ['katowice 2014', 32000],
      ['patch | howl', 6200], ['patch | the boss', 5800], ['patch | bayonet frog', 950], ['patch | bravo', 650], ['patch | phoenix', 520],
      ['copenhagen 2024 viewer pass + 3 souvenir tokens', 2750], ['shanghai 2024 viewer pass + 3 souvenir tokens', 2750], ['austin 2025 viewer pass + 3 souvenir tokens', 2900],
      ['copenhagen 2024 viewer pass', 920], ['shanghai 2024 viewer pass', 980], ['austin 2025 viewer pass', 1100], ['paris 2023 viewer pass', 760],
      ['operation riptide pass', 2500], ['operation broken fang pass', 2300], ['operation shattered web pass', 4200], ['operation hydra access pass', 9800]
    ];
    const found = exact.find(([key]) => lower.includes(String(key).toLowerCase()));
    if(found) return found[1];
    if(/viewer pass/i.test(lower)) return /souvenir token/.test(lower) ? 2500 : 850;
    if(/operation .*pass|access pass/i.test(lower)) return 2200;
    if(/souvenir package/i.test(lower)) return souvenirPackageRub(lower);
    return 0;
  }
  function knifeRub(lower){
    let rub = 21000;
    if(/butterfly/.test(lower)) rub = 125000;
    else if(/karambit/.test(lower)) rub = 92000;
    else if(/m9 bayonet/.test(lower)) rub = 68000;
    else if(/skeleton/.test(lower)) rub = 52000;
    else if(/talon/.test(lower)) rub = 47000;
    else if(/bayonet/.test(lower)) rub = 38000;
    else if(/kukri/.test(lower)) rub = 31000;
    else if(/stiletto|nomad|ursus|classic/.test(lower)) rub = 27000;
    else if(/paracord|survival/.test(lower)) rub = 23000;
    else if(/flip|falchion/.test(lower)) rub = 19000;
    else if(/gut|navaja|shadow daggers/.test(lower)) rub = 11500;
    if(/emerald|sapphire|ruby|black pearl/.test(lower)) rub *= 3.4;
    else if(/gamma doppler/.test(lower)) rub *= 1.9;
    else if(/doppler|fade/.test(lower)) rub *= 1.55;
    else if(/marble fade|tiger tooth/.test(lower)) rub *= 1.35;
    else if(/slaughter/.test(lower)) rub *= 1.28;
    else if(/crimson web|case hardened/.test(lower)) rub *= 1.22;
    else if(/blue steel|damascus steel|stained/.test(lower)) rub *= .92;
    else if(/boreal forest|scorched|safari mesh|urban masked/.test(lower)) rub *= .72;
    return rub;
  }
  function glovesRub(lower){
    let rub = 23000;
    if(/pandora/.test(lower)) rub = 285000;
    else if(/vice/.test(lower)) rub = 165000;
    else if(/hedge maze|superconductor/.test(lower)) rub = 135000;
    else if(/amphibious|omega/.test(lower)) rub = 78000;
    else if(/king snake/.test(lower)) rub = 64000;
    else if(/imperial plaid/.test(lower)) rub = 48000;
    else if(/sport gloves/.test(lower)) rub = 59000;
    else if(/specialist gloves/.test(lower)) rub = 41000;
    else if(/driver gloves/.test(lower)) rub = 27000;
    else if(/broken fang|hydra|bloodhound/.test(lower)) rub = 13500;
    if(/factory new/.test(lower)) rub *= 2.1;
    else if(/minimal wear/.test(lower)) rub *= 1.45;
    else if(/battle-scarred/.test(lower)) rub *= .82;
    return rub;
  }
  function stickerRub(lower, rarity){
    if(/katowice 2014/.test(lower)) return /ibuyPower|titan|reason gaming|dignitas/i.test(lower) ? 220000 : 36000;
    if(/cologne 2014|dreamhack 2014|katowice 2015/.test(lower)) return /holo|foil/.test(lower) ? 9000 : 900;
    const currentMajor = /austin 2025|shanghai 2024|copenhagen 2024|paris 2023|antwerp 2022|stockholm 2021|rio 2022/.test(lower);
    const star = /donk|m0nesy|monesy|zywoo|s1mple|navi|natus vincere|team spirit|g2 esports|faze clan|vitality|cloud9/.test(lower) ? 1.75 : 1;
    let rub;
    if(currentMajor){
      if(/gold/.test(lower)) rub = 980;
      else if(/holo|lenticular/.test(lower)) rub = 420;
      else if(/glitter|foil/.test(lower)) rub = 135;
      else rub = {'High Grade':45,'Remarkable':110,'Exotic':260,'Extraordinary':780}[rarity] || 60;
      if(/austin 2025/.test(lower)) rub *= 1.18;
      if(/champions|winner/.test(lower)) rub *= 1.35;
      rub *= star;
    }else{
      rub = {'High Grade':90,'Remarkable':450,'Exotic':1700,'Extraordinary':6500}[rarity] || 160;
      if(/gold/.test(lower)) rub *= 3.2;
      if(/holo|lenticular|foil/.test(lower)) rub *= 2.4;
      rub *= star;
    }
    return clamp(Math.round(rub), 15, 900000);
  }
  function patchRub(lower, rarity){
    let rub = {'High Grade':95,'Remarkable':380,'Exotic':1250,'Extraordinary':4200}[rarity] || 180;
    if(/howl|the boss/.test(lower)) rub = 6000;
    else if(/bayonet frog/.test(lower)) rub = 950;
    else if(/bravo|phoenix|vanguard|wildfire|hydra|riptide|broken fang|shattered web/.test(lower)) rub *= 1.8;
    if(/gold|metal/.test(lower)) rub *= 1.35;
    return clamp(Math.round(rub), 60, 20000);
  }
  function keychainRub(lower, rarity){
    let rub = {'High Grade':120,'Remarkable':380,'Exotic':1050,'Extraordinary':3200}[rarity] || 220;
    if(/baby karat|karat|diamond/.test(lower)) rub *= 2.2;
    if(/hot hands|weapon|semi-precious|chicken lil/.test(lower)) rub *= 1.45;
    return clamp(Math.round(rub), 80, 18000);
  }
  function agentRub(lower, rarity){
    let rub = {'Distinguished':450,'Exceptional':1150,'Superior':2600,'Master':6800,'Master Agent':6800}[rarity] || 900;
    if(/darryl|number k|ava|miami|bloody|sir bloody|the professionals/.test(lower)) rub *= 1.7;
    if(/primeiro|royale|elite|doctor/.test(lower)) rub *= 1.35;
    return clamp(Math.round(rub), 250, 35000);
  }
  function souvenirPackageRub(lower){
    let rub = 950;
    if(/cobblestone/.test(lower)) rub = 320000;
    else if(/dragon lore|dreamhack 2013/.test(lower)) rub = 180000;
    else if(/nuke|inferno|mirage|overpass|vertigo|dust ii|anubis|ancient/.test(lower)) rub = 1100;
    if(/stockholm 2021|antwerp 2022/.test(lower)) rub *= 1.25;
    if(/rio 2022/.test(lower)) rub *= 1.05;
    if(/paris 2023|copenhagen 2024|shanghai 2024|austin 2025/.test(lower)) rub *= 1.15;
    return Math.round(rub);
  }
  function collectibleRub(lower, rarity){
    if(/viewer pass/.test(lower)) return /souvenir token/.test(lower) ? 2600 : 900;
    if(/operation .*pass|access pass/.test(lower)) return /hydra/.test(lower) ? 9800 : 2500;
    if(/souvenir package/.test(lower)) return souvenirPackageRub(lower);
    if(/sticker capsule|capsule/.test(lower)){
      let rub = /katowice 2014|cologne 2014/.test(lower) ? 18000 : 80;
      if(/austin 2025|shanghai 2024|copenhagen 2024/.test(lower)) rub = 115;
      if(/paris 2023|rio 2022/.test(lower)) rub = 35;
      return rub;
    }
    if(/storage unit/.test(lower)) return 180;
    if(/name tag/.test(lower)) return 170;
    return {'Base Grade':140,'High Grade':220,'Remarkable':520,'Exotic':1300,'Extraordinary':3500}[rarity] || 260;
  }
  function stableNoise(str){
    let h=2166136261; str=String(str||'');
    for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h,16777619); }
    return ((h>>>0) % 1000) / 1000;
  }
  function calcPrice(items, idx, kind='case'){
    if(!items.length) return 300;
    const ev = expectedDropValue(items, kind);
    const mult = kind === 'collection' ? .74 : kind === 'special' ? .86 : .78;
    const spread = [95, 135, 190, 280, 420, 650, 980, 1450, 2200][idx % 9];
    const raw = ev * mult + spread + idx * 11;
    return clamp(Math.round(raw), kind === 'special' ? 650 : 75, kind === 'special' ? 90000 : 22000);
  }
  function weightedAverageValue(items){
    const sumW = items.reduce((s,x)=>s+(dropBaseWeight(x,{kind:'special',items})||1),0) || 1;
    return items.reduce((s,x)=>s+(x.value||0)*(dropBaseWeight(x,{kind:'special',items})||1),0) / sumW;
  }
  function expectedDropValue(items, kind='case'){
    const fake = {kind, items};
    const weighted = items.map(x => ({it:x, w:dropBaseWeight(x, fake)}));
    const sumW = weighted.reduce((s,x)=>s+x.w,0) || 1;
    return weighted.reduce((s,x)=>s + toNum(x.it.value,0) * x.w, 0) / sumW;
  }
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9а-яё]+/gi,'-').replace(/^-|-$/g,''); }

  function bindEvents(){
    if(document.documentElement.dataset.bound === '1') return;
    document.documentElement.dataset.bound = '1';
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-action],[data-open-case],[data-view-case],[data-sell],[data-upgrade-item],[data-contract-item],[data-close-modal]');
      if(!btn) return;
      if(btn.__tapBridgeAt && Date.now() - btn.__tapBridgeAt < 650 && !e.__tapBridge){ e.preventDefault(); return; }
      if(btn.matches('[data-close-modal]')) return closeModal(btn.closest('.modal'));
      if(btn.dataset.openCase) return openCaseModal(btn.dataset.openCase, true);
      if(btn.dataset.viewCase) return openCaseModal(btn.dataset.viewCase, false);
      if(btn.dataset.sell) return sellItem(btn.dataset.sell);
      if(btn.dataset.upgradeItem){ state.pendingUpgrade = btn.dataset.upgradeItem; save(); location.href = 'upgrade.html'; return; }
      if(btn.dataset.contractItem){ toggleContract(btn.dataset.contractItem); route(); toast('Выбор контракта обновлён','good'); return; }
      const a = btn.dataset.action;
      if(a === 'scroll-top') return scrollCasesPage('top');
      if(a === 'scroll-bottom') return scrollCasesPage('bottom');
      if(a === 'case-jump') return jumpCaseSection(btn.dataset.target || 'top');
      if(a === 'spin-current-case') return spinCase(currentCase, {fast:false,count:1});
      if(a === 'spin-fast') return spinCase(currentCase, {fast:true,count:1});
      if(a === 'open-again') return spinCase(currentCase, {fast:false,count:1});
      if(a === 'open-again-fast') return spinCase(currentCase, {fast:true,count:1});
      if(a === 'open-multi') return spinCase(currentCase, {fast:true,count:btn.dataset.count||1});
      if(a === 'sell-batch') return sellBatch((btn.dataset.uids||'').split(',').filter(Boolean));
      if(a === 'redeem-promo') return redeemPromo();
      if(a === 'claim-daily-contracts') return claimDailyContracts();
      if(a === 'claim-achievement') return claimAchievement(btn.dataset.achievement || '');
      if(a === 'claim-collection') return claimCollection(btn.dataset.collection || '');
      if(a === 'market-buy') return marketBuy(btn.dataset.item || '');
      if(a === 'craft-stickers') return craftCosmetics('sticker');
      if(a === 'craft-patches') return craftCosmetics('patch');
      if(a === 'claim-theme-event') return claimThemeEvent(btn.dataset.theme || '');
      if(a === 'activate-battle-pass') return activateBattlePass();
      if(a === 'claim-battle-pass') return claimBattlePassReward();
      if(a === 'activate-seasonal-pass') return activateSeasonalPass();
      if(a === 'claim-seasonal-pass') return claimSeasonalPassReward();
      if(a === 'spin-wheel') return spinWheel();
      if(a === 'start-ad') return startAd();
      if(a === 'open-project'){ e.preventDefault(); return openProjectLink(btn.dataset.project || ''); }
      if(a === 'start-battle') return startBattle();
      if(a === 'make-contract') return makeContract();
      if(a === 'clear-contract'){ state.contractSelected=[]; save(); route(); return; }
      if(a === 'set-upgrade-mult'){ state.upgradeMode = normalizeUpgradeMode(btn.dataset.mult); save(); renderUpgrade(); return; }
      if(a === 'do-upgrade') return doUpgrade();
      if(a === 'start-mines') return startMines();
      if(a === 'mines-cell') return revealMinesCell(btn.dataset.cell);
      if(a === 'cashout-mines') return cashoutMines();
      if(a === 'cancel-mines') return cancelMinesGame();
      if(a === 'sell-cheap') return sellCheap();
      if(a === 'sell-all-inventory') return sellAllInventory();
      if(a === 'reset-save') return resetSave();
      if(a === 'export-save') return exportSave();
      if(a === 'import-save') return importSave();
      if(a === 'add-debug-coins') return earn(10000, 'Тестовое начисление');
      if(a === 'install-pwa') return installPWA();
      if(a === 'show-ios') return showIOSGuide();
    });
    document.addEventListener('input', e => {
      if(['invSearch','invRarity','invSort'].includes(e.target.id)) renderInventory();
      if(e.target.id === 'targetSearch' || e.target.id === 'upgradeBalanceAmount') renderUpgradeTargets();
    });
    document.addEventListener('change', e => {
      if(e.target.matches && e.target.matches('.currency-select')){ state.currency = CURRENCY_OPTIONS[e.target.value] ? e.target.value : 'RUB'; save(); route(); return; }
      if(['invRarity','invSort'].includes(e.target.id)) renderInventory();
      if(e.target.id === 'upgradeSource'){ state.pendingUpgrade = e.target.value === '__BALANCE__' ? null : e.target.value; save(); renderUpgrade(); }
      if(e.target.id === 'minesStake' || e.target.id === 'minesCount') renderMinesInfo();
      if(e.target.id === 'battleCase' || e.target.id === 'battleMode') renderBattleInfo();
    });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') $$('.modal.show').forEach(m => { if(!m.dataset.locked) closeModal(m); }); if(e.key === 'Enter' && e.target && e.target.id === 'promoInput') redeemPromo(); });
  }

  function route(){
    state = bootLoaded ? bestState([state, loadState(false)]) : loadState();
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
    if(page === 'mines') return renderMines();
    if(page === 'battle-pass') return renderBattlePass();
    if(page === 'seasonal-pass') return renderSeasonalPass();
    if(page === 'ads') return renderAds();
    if(page === 'promos') return renderPromos();
    if(page === 'hub') return renderHub();
    if(page === 'profile') return renderProfile();
    if(page === 'install') return renderInstall();
  }
  function setActiveNav(){
    const file = location.pathname.split('/').pop() || 'index.html';
    $$('.navlinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === file));
    $$('.quick-mode-link').forEach(a => a.classList.toggle('active', a.getAttribute('href') === file));
  }
  function renderGlobals(){
    state = normalizeState(state);
    syncCustomCasesIntoCatalog();
    $$('.wallet').forEach(w => { if(!$('.currency-switch', w)) w.insertAdjacentHTML('beforeend', currencySelectHtml()); });
    $$('.currency-select').forEach(x => { if(x.value !== state.currency) x.value = state.currency; });
    $$('.js-balance').forEach(x => x.textContent = fmt(state.balance));
    $$('.js-inv-count').forEach(x => x.textContent = String(state.inventory.length));
    $$('.js-version').forEach(x => x.textContent = VERSION);
    updateSeasonalNavLinks();
  }
  function seasonalPassState(){ state.seasonalPass = normalizeSeasonalPass(state.seasonalPass, state.createdAt || Date.now()); return state.seasonalPass; }
  function seasonalPassAvailable(sp){ sp = sp || seasonalPassState(); return Date.now() < sp.seasonStartedAt + SEASONAL_PASS_DURATION; }
  function seasonalPassEndsAt(sp){ sp = sp || seasonalPassState(); return sp.seasonStartedAt + SEASONAL_PASS_DURATION; }
  function seasonalTimeLeftText(){
    const left = Math.max(0, seasonalPassEndsAt() - Date.now());
    const d = Math.floor(left/86400000), h = Math.floor(left%86400000/3600000), m = Math.floor(left%3600000/60000);
    if(left <= 0) return 'сезон завершён';
    return `${d} дн. ${h} ч. ${m} мин.`;
  }
  function updateSeasonalNavLinks(){
    const show = seasonalPassAvailable();
    $$('.js-seasonal-pass-link').forEach(a => { a.style.display = show ? '' : 'none'; });
  }
  function getTheme(id){ return SITE_THEMES.find(t => t.id === id) || SITE_THEMES[0]; }
  function savedThemeId(){
    try{ return localStorage.getItem(THEME_KEY) || 'classic'; }catch(e){ return 'classic'; }
  }
  function applyTheme(id, persist=false){
    const theme = getTheme(id);
    document.documentElement.dataset.theme = theme.id;
    if(document.body) document.body.dataset.theme = theme.id;
    document.documentElement.style.colorScheme = theme.id === 'light' ? 'light' : 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta){
      const colors = {classic:'#090c13',dark:'#020617',light:'#f8fafc',vitality:'#f4d000',falcons:'#14392b',fnatic:'#ff5a00','9z':'#7c3aed',spirit:'#0b4ad7',vp:'#f97316',cloud9:'#00a7e1',navi:'#ffd400',faze:'#e10600',parivision:'#7c3aed'};
      meta.setAttribute('content', colors[theme.id] || '#090c13');
    }
    if(persist){ try{ localStorage.setItem(THEME_KEY, theme.id); }catch(e){} }
    $$('.theme-toggle').forEach(btn => {
      btn.innerHTML = `<span class="theme-badge theme-badge-${esc(theme.id)}">${esc(theme.logo)}</span>`;
      btn.title = `Тема: ${theme.title}`;
      btn.setAttribute('aria-label', `Сменить тему. Сейчас: ${theme.title}`);
    });
    $$('.theme-choice').forEach(btn => btn.classList.toggle('active', btn.dataset.themeChoice === theme.id));
    return theme;
  }
  function applySavedTheme(){ applyTheme(savedThemeId(), false); }
  function initThemeSwitcher(){
    applySavedTheme();
    const navrow = $('.navrow'); if(!navrow || $('.theme-switcher', navrow)) return;
    const current = getTheme(savedThemeId());
    const choices = SITE_THEMES.map(t => `<button type="button" class="theme-choice" data-theme-choice="${esc(t.id)}" title="${esc(t.title)}"><span class="theme-badge theme-badge-${esc(t.id)}">${esc(t.logo)}</span><b>${esc(t.name)}</b></button>`).join('');
    navrow.insertAdjacentHTML('afterbegin', `<div class="theme-switcher"><button type="button" class="theme-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Сменить тему"><span class="theme-badge theme-badge-${esc(current.id)}">${esc(current.logo)}</span></button><div class="theme-panel" role="menu"><div class="theme-panel-title">Тема сайта</div>${choices}</div></div>`);
    const wrap = $('.theme-switcher', navrow);
    const toggle = $('.theme-toggle', wrap);
    const close = () => { wrap.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); try{ document.body.classList.remove('theme-panel-open'); }catch(e){} };
    const open = () => { wrap.classList.add('open'); toggle.setAttribute('aria-expanded','true'); try{ document.body.classList.add('theme-panel-open'); }catch(e){} };
    toggle.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); wrap.classList.contains('open') ? close() : open(); });
    wrap.addEventListener('click', e => {
      const btn = e.target.closest('[data-theme-choice]');
      if(!btn) return;
      e.preventDefault();
      applyTheme(btn.dataset.themeChoice, true);
      close();
      toast(`Тема: ${getTheme(btn.dataset.themeChoice).title}`, 'good');
    });
    document.addEventListener('click', e => { if(!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
    applySavedTheme();
  }

  function initQuickModeDock(){
    const nav = $('.navlinks');
    if(!nav) return;
    QUICK_MODE_HREFS.forEach(href => {
      $$(`a[href="${href}"]`, nav).forEach(a => a.classList.add('nav-secondary'));
    });
    if($('.quick-mode-dock')) return;
    const file = location.pathname.split('/').pop() || 'index.html';
    const links = QUICK_MODE_LINKS.map(x => `<a class="quick-mode-link ${file===x.href?'active':''} ${x.seasonal?'js-seasonal-pass-link':''}" href="${esc(x.href)}" title="${esc(x.label)}"><span>${esc(x.icon)}</span><b>${esc(x.label)}</b></a>`).join('');
    document.body.insertAdjacentHTML('afterbegin', `<aside class="quick-mode-dock" aria-label="Быстрые режимы"><div class="quick-mode-title">Режимы</div>${links}</aside>`);
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
    if(!Array.isArray(live) || !live.length) seedLive(true);
    const safe = (live || []).filter(x => x && x.item).slice(0, 14);
    if(!safe.length){ root.innerHTML = '<div class="live-empty">Live drops загружаются...</div>'; return; }
    const card = x => {
      const it = x.item || {};
      const art = imgTag(it.image, it.name) || `<span class="live-fallback">CS2</span>`;
      return `<div class="live-card" style="--rar:${it.rarityColor||'#60a5fa'}">${art}<div><b>${esc(x.user||'bot')} выбил</b><small>${esc(it.name||'CS2 item')} · ${fmt(x.value||it.value||0)}</small></div></div>`;
    };
    const html = safe.map(card).join('');
    root.innerHTML = `<div class="live-track">${html}${html}</div>`;
  }

  function statCards(){ return `<div class="grid cards-4"><div class="stat"><small>Баланс</small><b class="js-balance">${fmt(state.balance)}</b></div><div class="stat"><small>Предметов</small><b>${state.inventory.length}</b></div><div class="stat"><small>Открыто кейсов</small><b>${state.opened}</b></div><div class="stat"><small>Заработано</small><b>${fmt(state.earned)}</b></div></div>`; }
  function itemImageOrPlaceholder(it, label='ITEM'){
    const html = imgTag(it && it.image, it && (it.displayName || it.name));
    if(html) return html;
    const text = String((it && (it.displayName || it.name)) || label).split('|').pop().trim().slice(0,18) || label;
    return `<div class="item-no-image"><b>${esc(label)}</b><span>${esc(text)}</span></div>`;
  }
  function itemCard(it, opts={}){
    const buttons = opts.buttons ? `<div class="item-actions">${opts.buttons}</div>` : '';
    return `<article class="item-card ${opts.selected?'selected':''} ${it.favorite?'favorite':''} ${it.protected?'protected':''}" data-uid="${esc(it.uid||'')}" data-item-id="${esc(it.id||'')}" style="--rar:${it.rarityColor||'#60a5fa'}"><div class="item-art">${itemImageOrPlaceholder(it)}</div><h4>${it.favorite?'★ ':''}${it.protected?'🔒 ':''}${esc(it.displayName||it.name)}</h4><small>${esc(it.rarity||'Skin')}${it.wear?` · ${esc(it.wear)}`:''}${it.float?` · ${esc(it.float)}`:''}</small><div class="value-row"><b>${fmt(it.value)}</b>${opts.badge?`<span class="pill">${esc(opts.badge)}</span>`:''}</div>${buttons}</article>`;
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
    const pool = (c && c.items ? c.items : []).filter(x=>x && realImageUrl(x.image));
    const expensive = [...pool].sort((a,b)=>(b.value||0)-(a.value||0)).slice(0,8);
    const byRarity = [...pool].sort((a,b)=>(rarityValue[b.rarity]||0)-(rarityValue[a.rarity]||0)).slice(0,8);
    const merged = [];
    [...expensive, ...byRarity, ...pool].forEach(x => { if(merged.length < 6 && !merged.some(m=>m.id===x.id)) merged.push(x); });
    return merged.slice(0,6);
  }
  function imgTag(url, alt, cls=''){
    const src = realImageUrl(url);
    if(!src) return '';
    const altSrc = altImageUrl(src);
    return `<img${cls?` class="${esc(cls)}"`:''} src="${esc(src)}"${altSrc?` data-alt-src="${esc(altSrc)}"`:''} onerror="__caseLabImgFallback(this)" alt="${esc(alt || '')}" loading="lazy" referrerpolicy="no-referrer">`;
  }
  function caseVisual(c, big=false){
    const color = themeColor(c);
    const classes = big ? 'case-visual big' : 'case-visual';
    const caseImg = realImageUrl(c && c.image);
    const covers = coverItems(c);
    const isClassic = c && (c.kind === 'case' || c.kind === 'collection' || c.source === 'offline-classic');
    const showCaseImage = !!caseImg && (isClassic || !covers.length);
    const mainImage = showCaseImage ? imgTag(caseImg, c.name, `case-img ${big?'big':''}`.trim()) : '';
    const coverHtml = covers.length ? `<div class="case-cover-items ${showCaseImage?'overlay':'collage'}">${covers.map((x,i)=>imgTag(x.image, x.name, `cover-${i}`)).join('')}</div>` : '';
    const noImg = (!mainImage && !coverHtml) ? '<div class="case-no-image"><b>CS2</b><span>изображение загружается</span></div>' : '';
    return `<div class="${classes} ${isClassic?'classic-case':''} ${showCaseImage?'':'skin-collage-case'}" style="--theme:${color}">${mainImage}${coverHtml}${noImg}<span class="case-sheen"></span></div>`;
  }
  function caseCard(c){
    const kindLabel = c.kind === 'collection' ? 'Коллекция' : c.kind === 'farm' ? 'Фарм' : c.kind === 'special' ? 'Особый пул' : 'Кейс';
    const balanceBadge = c.kind === 'farm' ? '<span class="pill">farm ≤100 ₽</span>' : (isPersonalProfitCase(c) ? '<span class="pill">твой окуп-кейс</span>' : '');
    return `<article class="case-card" style="--theme:${themeColor(c)}"><span class="case-kind">${esc(kindLabel)}</span><span class="price-tier">${c.price<750?'дешёвый':c.price>6500?'дорогой':'средний'}</span>${caseVisual(c)}<h3>${esc(c.name)}</h3><div class="case-meta"><span>${c.items.length} предметов</span><b>${fmt(c.price)}</b></div><div class="mini-list">${balanceBadge}${[...new Set(c.items.map(i=>i.rarity))].slice(0,5).map(r=>`<span class="pill">${esc(r)}</span>`).join('')}</div><small class="source">${esc(c.source||catalog.source)}</small><div class="case-actions"><button class="btn primary" data-open-case="${esc(c.id)}">Крутить</button><button class="btn" data-view-case="${esc(c.id)}">Пул</button></div></article>`;
  }
  function renderHome(){
    updateHeroShowcase();
    const root = $('#homeRoot'); if(!root) return;
    const top = [...catalog.items].sort((a,b)=>b.value-a.value).slice(0,8);
    root.innerHTML = `${statCards()}<section class="block"><div class="head"><div><h2>Популярные кейсы</h2><p>Кнопка «Крутить» сразу открывает модальное окно, списывает баланс и запускает рулетку.</p></div><a class="btn primary" href="cases.html">Все кейсы</a></div><div class="grid case-grid">${catalog.cases.slice(0,6).map(caseCard).join('')}</div></section><section class="block"><div class="head"><div><h2>Редкие дропы</h2><p>Скины из текущего пула CS2.</p></div><a class="btn" href="ads.html">Получить баланс</a></div><div class="grid item-grid">${top.map(x=>itemCard(x,{badge:'топ'})).join('')}</div></section>`;
  }

  function updateHeroShowcase(){
    // v31: главная витрина использует только жёстко заданные реальные URL из index.html.
    // Ничего не заменяем из fallback/API, чтобы на главной не появлялись SVG-заглушки.
    return true;
  }

  function renderCases(){
    const root = $('#casesRoot'); if(!root) return;
    syncCustomCasesIntoCatalog();
    const customCases = customCaseObjects();
    const allCases = catalog.cases;
    const classicRx = /Kilowatt|Revolution|Recoil|Dreams|Nightmares|Fracture|Clutch|Prisma|Spectrum|Snakebite|Horizon|Gamma|Danger Zone|CS20|Glove|Broken Fang|Chroma|Falchion|Shadow|Wildfire|Vanguard|Huntsman|Phoenix/i;
    const classic = allCases.filter(c=>c.kind==='case' && classicRx.test(c.name)).slice(0,24);
    const classicIds = new Set(classic.map(c=>c.id));
    const officialRest = allCases.filter(c=>c.kind==='case' && !classicIds.has(c.id));
    const groups = [
      {id:'classic', nav:'Классические', title:'Классические CS2-кейсы', desc:'Самые узнаваемые оружейные кейсы.', arr:classic},
      {id:'official', nav:'Оружейные', title:'Официальные оружейные кейсы', desc:'Остальные кейсы с оружейными скинами.', arr:officialRest.filter(c=>c.kind!=='farm')},
      {id:'farm', nav:'Фарм до 100 ₽', title:'Фарм-кейсы до 100 ₽', desc:'Много дешёвых пушек и один дорогой jackpot-предмет. Цена каждого кейса не выше 100 ₽.', arr:allCases.filter(c=>c.kind==='farm')},
      {id:'limited', nav:'Лимитированная серия', title:'Лимитированная серия / Armory Pass', desc:'Коллекции и временные наборы с редкими предметами.', arr:allCases.filter(c=>c.kind==='collection')},
      {id:'quality', nav:'По качеству', title:'Кейсы по качеству / цвету', desc:'Пулы по редкости: синие, фиолетовые, розовые, красные и другие.', arr:allCases.filter(c=>/^quality-/.test(c.id))},
      {id:'special', nav:'Ножи и перчатки', title:'Ножи и перчатки', desc:'Особые дорогие пулы с урезанными шансами.', arr:allCases.filter(c=>/^special-/.test(c.id))},
      {id:'stickers', nav:'Наклейки', title:'Турнирные наклейки', desc:'Капсулы и наборы наклеек.', arr:allCases.filter(c=>/^stickers-/.test(c.id))},
      {id:'extras', nav:'Агенты и другое', title:'Агенты, брелоки, нашивки', desc:'Дополнительные коллекционные предметы.', arr:allCases.filter(c=>/^(agents|charms|patches|collectibles)-/.test(c.id))},
      {id:'custom', nav:'Мои кейсы', title:'Case Creator · мои кейсы', desc:'Кастомные кейсы, созданные во вкладке «Развитие».', arr:customCases}
    ].filter(g=>g.arr && g.arr.length);
    const nav = groups.map(g=>`<button class="case-nav-btn" type="button" data-action="case-jump" data-target="${esc(g.id)}">${esc(g.nav)} <span>${g.arr.length}</span></button>`).join('');
    const sections = groups.map(g => `<section class="block case-section" id="case-section-${esc(g.id)}"><div class="head"><div><h2>${esc(g.title)}</h2><p>${esc(g.desc)}</p></div><p>${g.arr.length} шт.</p></div><div class="case-grid grid">${g.arr.map(caseCard).join('')}</div></section>`).join('');
    root.innerHTML = `<div class="notice"><b>Каталог обновлён:</b> классические CS2-кейсы, фарм-кейсы до 100 ₽, лимитированная серия / Armory Pass, quality-пулы, стикеры, агенты, брелоки и нашивки. Доступны x3/x5/x10 и быстрое открытие.</div><div class="case-tools"><div class="case-category-nav" role="navigation" aria-label="Разделы кейсов"><button class="case-nav-btn all" type="button" data-action="case-jump" data-target="top">Все разделы</button>${nav}</div></div>${sections}<div class="case-scroll-fab" aria-label="Быстрая прокрутка"><button type="button" data-action="scroll-top" title="Наверх">↑<span>Вверх</span></button><button type="button" data-action="scroll-bottom" title="Вниз">↓<span>Вниз</span></button></div>`;
  }
  function scrollCasesPage(where){
    const scroller = document.scrollingElement || document.documentElement;
    const max = Math.max(0, scroller.scrollHeight - window.innerHeight);
    window.scrollTo({top: where === 'bottom' ? max : 0, behavior:'smooth'});
  }
  function jumpCaseSection(id){
    if(id === 'top') return scrollCasesPage('top');
    const el = document.getElementById('case-section-' + id);
    if(!el) return;
    el.scrollIntoView({behavior:'smooth', block:'start'});
  }
  function openCaseModal(caseId, autoSpin){
    syncCustomCasesIntoCatalog();
    const c = catalog.cases.find(x => x.id === caseId);
    if(!c) return toast('Кейс не найден','bad');
    currentCase = c.id;
    $('#caseModalTitle').textContent = c.name;
    const content = [...c.items].sort((a,b)=>(rarityValue[a.rarity]||0)-(rarityValue[b.rarity]||0)).map(x=>caseContentCard(x)).join('');
    $('#caseModalBody').innerHTML = `<div class="case-open-layout"><aside class="open-aside">${caseVisual(c,true)}<div class="notice">Цена открытия: <b>${fmt(c.price)}</b><br>${esc(c.rareText||'Внутри могут быть редкие предметы.')}</div><button class="btn primary huge" data-action="spin-current-case">Открыть 1x за ${fmt(c.price)}</button><button class="btn blue huge" data-action="spin-fast">Открыть быстро 1x</button><div class="multi-open-row"><button class="small-btn" data-action="open-multi" data-count="3">Быстро x3 · ${fmt(c.price*3)}</button><button class="small-btn" data-action="open-multi" data-count="5">Быстро x5 · ${fmt(c.price*5)}</button><button class="small-btn" data-action="open-multi" data-count="10">Быстро x10 · ${fmt(c.price*10)}</button></div><p class="small">Стрелка по центру показывает предмет при обычном прокруте. Быстрое открытие пропускает анимацию и сразу начисляет дроп.</p></aside><section class="case-main"><div class="roulette-box"><div class="roulette-center-arrow"><span></span></div><div class="roulette-pointer"></div><div class="roulette-strip" id="rouletteStrip">${Array.from({length:20},()=>rollCard(weighted(c))).join('')}</div></div><h3>Содержимое кейса</h3><div class="case-contents">${content}</div></section></div>`;
    openModal('#caseModal');
    if(autoSpin) setTimeout(() => spinCase(c.id), 120);
  }
  function caseContentCard(it){
    return `<article class="content-card" style="--rar:${it.rarityColor||'#60a5fa'}"><div class="content-art">${itemImageOrPlaceholder(it,'CS2')}</div><b>${esc(it.name)}</b><small>${esc(it.rarity||'Skin')}</small><span>${fmt(it.value)}</span></article>`;
  }
  function rollCard(it){ return `<div class="roll-card" style="--rar:${it.rarityColor||'#60a5fa'}">${itemImageOrPlaceholder(it,'CS2')}<b>${esc(it.name)}</b></div>`; }
  function weighted(c){
    const pool = c && c.items && c.items.length ? c.items : fallbackItems;
    const weights = pool.map(it => hiddenCaseWeight(it,c));
    const total = weights.reduce((s,x)=>s+x,0) || 1;
    let r = cryptoRandom() * total;
    for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r <= 0) return pool[i]; }
    return pool[pool.length-1];
  }
  function rarityBucket(r){
    if(['Exceedingly Rare','Extraordinary','Contraband'].includes(r)) return 'Rare Special';
    if(['Master','Master Agent'].includes(r)) return 'Covert';
    if(['Superior','Superior Agent'].includes(r)) return 'Classified';
    if(['Exceptional','Exceptional Agent'].includes(r)) return 'Restricted';
    if(['Distinguished','Distinguished Agent'].includes(r)) return 'Mil-Spec Grade';
    return r || 'Mil-Spec Grade';
  }
  function officialBucketOdds(c){
    const key = `${c && c.name || ''} ${c && c.source || ''} ${c && c.kind || ''}`.toLowerCase();
    if(/sticker|capsule|tournament|patch|charm|keychain|agent/.test(key)){
      return {'High Grade':80,'Remarkable':16,'Exotic':3.2,'Extraordinary':.64,'Mil-Spec Grade':80,'Restricted':16,'Classified':3.2,'Covert':.64,'Rare Special':.26};
    }
    return {'Mil-Spec Grade':79.92327,'Restricted':15.98465,'Classified':3.19693,'Covert':.63939,'Rare Special':.25575,'Consumer Grade':55,'Base Grade':55,'Industrial Grade':28,'High Grade':80,'Remarkable':16,'Exotic':3.2,'Extraordinary':.64};
  }
  function dropBaseWeight(it,c){
    const pool = c && c.items && c.items.length ? c.items : fallbackItems;
    const kind = c && c.kind;
    if(kind === 'case' || kind === 'collection'){
      const bucket = rarityBucket(it.rarity);
      const odds = officialBucketOdds(c);
      const same = pool.filter(x => rarityBucket(x.rarity) === bucket).length || 1;
      return Math.max(0.000001, (odds[bucket] || odds[it.rarity] || 1) / same);
    }
    return Math.max(0.01, toNum(it.weight, rarityWeight[it.rarity] || 6));
  }
  function priceRiskMultiplier(ratio,c){
    const odds = (c && c._odds) || {profitOdds:.72,jackpot:.008,cheap:.56};
    let m = 1;
    if(ratio < .18) m *= 2.25 + odds.cheap;
    else if(ratio < .35) m *= 1.80 + odds.cheap * .75;
    else if(ratio < .60) m *= 1.35 + odds.cheap * .45;
    else if(ratio < .85) m *= 1.05;
    else {
      m *= odds.profitOdds;
      if(ratio >= 1.30) m *= .88;
      if(ratio >= 1.75) m *= .65;
      if(ratio >= 2.50) m *= .32;
      if(ratio >= 5.00) m *= .080;
      if(ratio >= 10.0) m *= .020;
      if(ratio >= 25.0) m *= .0035;
      if(ratio >= 50.0) m *= .00070;
      if(ratio >= 100.) m *= .00009;
      if(ratio >= 250.) m *= .000008;
      if(ratio >= 500.) m *= .000001;
    }
    if(c && c.kind === 'special') m *= ratio >= 1 ? .62 : 1.18;
    return m;
  }
  function hiddenCaseWeight(it,c){
    let w = dropBaseWeight(it,c);
    const price = Math.max(1, toNum(c && c.price, 1));
    const ratio = toNum(it.value,0) / price;
    if(c && c.kind === 'farm'){
      // Фарм-кейсы специально используют ручные веса: много дешёвых пушек + один дорогой jackpot.
      w *= .98 + stableNoise(`${c && c.id || ''}:farm:${it.id || it.name}`) * .04;
      return Math.max(0.00000001, w);
    }
    w *= priceRiskMultiplier(ratio,c);
    if(isPersonalProfitCase(c)){
      if(ratio >= 1 && ratio < 5) w *= 1.65;
      else if(ratio >= 5 && ratio < 25) w *= 1.28;
      else if(ratio < .60) w *= .86;
    }
    // Маленький детерминированный шум оставляет разнообразие, но не ломает экономику.
    w *= .96 + stableNoise(`${c && c.id || ''}:${it.id || it.name}`) * .08;
    return Math.max(0.00000001, w);
  }
  function spinCase(caseId, opts={}){
    if(busy.case) return toast('Рулетка уже крутится','warn');
    syncCustomCasesIntoCatalog();
    const c = catalog.cases.find(x => x.id === caseId);
    if(!c) return toast('Кейс не найден','bad');
    const fast = !!(opts && opts.fast);
    const count = clamp(Math.round(toNum(opts && opts.count, 1)), 1, 25);
    const totalCost = Math.max(1, Math.round(toNum(c.price,0) * count));
    if(!spend(totalCost, count > 1 ? `Открытие ${c.name} x${count}` : `Открытие ${c.name}`)) return;
    state.opened += count;
    addXP(count * 18, `Открытие кейса`);
    addSeasonTokens(Math.max(1, Math.round(count / 2)), 'Открытие кейса');
    save();
    busy.case = true;
    const buttons = $$('[data-action="spin-current-case"],[data-action="spin-fast"],[data-action="open-multi"],[data-action="open-again"],[data-action="open-again-fast"]');
    buttons.forEach(b => b.disabled = true);
    const mainBtn = $('[data-action="spin-current-case"]'); if(mainBtn) mainBtn.textContent = fast || count > 1 ? 'Открываю...' : 'Крутится...';

    if(fast || count > 1){
      const drops = Array.from({length:count}, () => addItem(weighted(c), c.name));
      drops.forEach(d => addLive('Ты', d));
      bpEvent('case_open', {case:c, count, fast:true, totalCost, drops});
      busy.case = false;
      buttons.forEach(b => b.disabled = false);
      if(mainBtn) mainBtn.textContent = `Открыть 1x за ${fmt(c.price)}`;
      maybeRareCaseEvent(c, drops, totalCost);
      if(count === 1) showDrop(drops[0], c); else showBatchDrop(drops, c, totalCost);
      return;
    }

    const strip = $('#rouletteStrip'); const box = strip && strip.closest('.roulette-box');
    const win = weighted(c); const winIndex = 41;
    if(!strip || !box){ finishDrop(win,c,mainBtn); return; }
    const cards = Array.from({length:62},(_,i)=> i===winIndex ? win : weighted(c));
    strip.style.transition='none'; strip.style.transform='translateX(0px)'; strip.innerHTML = cards.map(rollCard).join('');
    strip.getBoundingClientRect();
    requestAnimationFrame(() => {
      const card = strip.children[winIndex];
      const target = Math.max(0, card.offsetLeft - box.clientWidth/2 + card.clientWidth/2 + rnd(-18,18));
      strip.style.transition='transform 4.6s cubic-bezier(.08,.75,.08,1)';
      strip.style.transform=`translateX(-${target}px)`;
    });
    setTimeout(() => finishDrop(win,c,mainBtn), 4850);
  }
  function finishDrop(win,c,btn){
    const inv = addItem(win, c.name);
    addLive('Ты', inv);
    bpEvent('case_open', {case:c, count:1, fast:false, totalCost:c.price, drops:[inv]});
    busy.case = false;
    $$('[data-action="spin-current-case"],[data-action="spin-fast"],[data-action="open-multi"],[data-action="open-again"],[data-action="open-again-fast"]').forEach(b => b.disabled=false);
    if(btn){ btn.disabled=false; btn.textContent=`Открыть 1x за ${fmt(c.price)}`; }
    maybeRareCaseEvent(c, [inv], c.price);
    showDrop(inv, c);
  }
  function showDrop(it,c){
    $('#dropModalBody').innerHTML = `<div class="drop-box"><p class="kicker">Выпал предмет</p>${imgTag(it.image, it.name, 'drop-img')}<h2 style="color:${it.rarityColor||'#fff'}">${esc(it.displayName||it.name)}</h2><p>${esc(it.rarity)} · ${esc(it.wear||'')} · float ${esc(it.float||'')}</p><h3>${fmt(it.value)}</h3><div class="drop-actions"><button class="btn green" data-sell="${esc(it.uid)}">Продать за ${fmt(it.value)}</button><button class="btn" data-close-modal>Оставить</button><button class="btn blue" data-upgrade-item="${esc(it.uid)}">В апгрейд</button><button class="btn" data-contract-item="${esc(it.uid)}">В контракт</button>${c?`<button class="btn primary" data-action="open-again">Открыть ещё</button><button class="btn blue" data-action="open-again-fast">Быстро ещё</button>`:''}</div></div>`;
    openModal('#dropModal');
  }

  function showBatchDrop(items,c,totalCost){
    items = Array.isArray(items) ? items.filter(Boolean) : [];
    const totalValue = items.reduce((sum,it)=>sum + toNum(it.value,0),0);
    const profit = Math.round(totalValue - toNum(totalCost,0));
    const uids = items.map(x=>x.uid).join(',');
    $('#dropModalBody').innerHTML = `<div class="drop-box batch-drop"><p class="kicker">Массовое открытие</p><h2>${esc(c && c.name ? c.name : 'Кейс')} · x${items.length}</h2><div class="batch-summary"><span>Потрачено: <b>${fmt(totalCost)}</b></span><span>Выпало на: <b>${fmt(totalValue)}</b></span><span class="${profit>=0?'plus':'minus'}">Итог: <b>${profit>=0?'+':''}${fmt(profit)}</b></span></div><div class="batch-grid">${items.map(it=>itemCard(it,{badge:'drop'})).join('')}</div><div class="drop-actions"><button class="btn green" data-action="sell-batch" data-uids="${esc(uids)}">Продать всё за ${fmt(totalValue)}</button><button class="btn" data-close-modal>Оставить всё</button>${c?`<button class="btn primary" data-action="open-multi" data-count="${items.length}">Открыть ещё x${items.length}</button><button class="btn blue" data-action="open-again-fast">Быстро 1x</button>`:''}</div></div>`;
    openModal('#dropModal');
  }
  function sellBatch(uids){
    const set = new Set(Array.isArray(uids)?uids:[]);
    const items = state.inventory.filter(x => set.has(x.uid));
    if(!items.length) return toast('Эти предметы уже проданы или не найдены','bad');
    const gross = items.filter(x=>!x.protected).reduce((s,x)=>s+toNum(x.value,0),0);
    const total = applySaleCommission(gross);
    removeItems(items.filter(x=>!x.protected).map(x=>x.uid));
    state.sold += Math.round(total);
    earn(total, `Массовая продажа x${items.length} · комиссия`);
    bpEvent('sell', {value:total, count:items.length});
    closeModal($('#dropModal'));
    route();
  }

  function renderInventory(){
    state = bestState([state, loadState(false)]);
    renderGlobals();
    const root = $('#inventoryRoot'); if(!root) return;
    const controls = $('#inventoryControls');
    const prevQ = ($('#invSearch') && $('#invSearch').value || '').toLowerCase().trim();
    const prevR = $('#invRarity') ? $('#invRarity').value : 'all';
    const prevS = $('#invSort') ? $('#invSort').value : 'new';
    const fullInv = [...state.inventory].map(normalizeInvItem).filter(Boolean);
    const fullTotal = fullInv.reduce((sum,x)=>sum + toNum(x.value,0),0);
    const avgValue = fullInv.length ? Math.round(fullTotal / fullInv.length) : 0;
    const rarities = [...new Set(fullInv.map(x=>x.rarity).filter(Boolean))].sort((a,b)=>(rarityValue[b]||0)-(rarityValue[a]||0));
    if(controls){
      controls.innerHTML = `<div class="inventory-topline"><div class="inv-total-card"><small>Стоимость инвентаря</small><b>${fmt(fullTotal)}</b><span>${fullInv.length} предметов · среднее ${fmt(avgValue)}</span></div><div class="inv-total-actions"><button class="btn green" data-action="sell-all-inventory" ${fullInv.length?'':'disabled'}>Продать всё</button><button class="small-btn" data-action="sell-cheap" ${fullInv.length?'':'disabled'}>Продать дешевле ${fmt(200)}</button></div></div><div class="filters"><input id="invSearch" placeholder="Поиск по названию" value="${esc(prevQ)}"><select id="invRarity"><option value="all">Все редкости</option>${rarities.map(x=>`<option value="${esc(x)}" ${prevR===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="invSort"><option value="new" ${prevS==='new'?'selected':''}>Сначала новые</option><option value="valueDesc" ${prevS==='valueDesc'?'selected':''}>Сначала дорогие</option><option value="valueAsc" ${prevS==='valueAsc'?'selected':''}>Сначала дешёвые</option><option value="rarity" ${prevS==='rarity'?'selected':''}>По редкости</option></select></div>`;
    }
    const q = ($('#invSearch') && $('#invSearch').value || prevQ).toLowerCase().trim();
    const r = $('#invRarity') ? $('#invRarity').value : prevR;
    const srt = $('#invSort') ? $('#invSort').value : prevS;
    let arr = [...fullInv];
    if(q) arr = arr.filter(x => (x.displayName||x.name).toLowerCase().includes(q));
    if(r !== 'all') arr = arr.filter(x => x.rarity === r);
    if(srt === 'valueDesc') arr.sort((a,b)=>b.value-a.value);
    else if(srt === 'valueAsc') arr.sort((a,b)=>a.value-b.value);
    else if(srt === 'rarity') arr.sort((a,b)=>(rarityValue[b.rarity]||0)-(rarityValue[a.rarity]||0));
    else arr.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
    const visibleTotal = arr.reduce((sum,x)=>sum + toNum(x.value,0),0);
    root.innerHTML = arr.length ? `<div class="notice inv-visible-summary"><b>Показано:</b> ${arr.length} из ${fullInv.length} предметов · сумма видимых: <b>${fmt(visibleTotal)}</b> · продажа без комиссии</div><div class="grid item-grid">${arr.map(x=>itemCard(x,{buttons:`<button data-action="toggle-favorite" data-uid="${esc(x.uid)}">${x.favorite?'★':'☆'}</button><button data-action="toggle-protect" data-uid="${esc(x.uid)}">${x.protected?'🔒':'🔓'}</button><button data-sell="${esc(x.uid)}">Продать</button><button data-upgrade-item="${esc(x.uid)}">Апгрейд</button><button data-contract-item="${esc(x.uid)}">Контракт</button>`})).join('')}</div>` : `<div class="empty"><h3>Инвентарь пуст</h3><p>Открой кейс, выиграй battle или прокрути колесо. Если только что обновлял сайт на GitHub Pages — нажми Ctrl+F5, чтобы браузер не держал старый cache.</p><a class="btn primary" href="cases.html">К кейсам</a></div>`;
  }
  function sellAllInventory(){
    const items = [...state.inventory].map(normalizeInvItem).filter(x=>x && !x.protected);
    if(!items.length) return toast('Инвентарь пуст','warn');
    const gross = Math.round(items.reduce((sum,x)=>sum + toNum(x.value,0),0));
    const total = applySaleCommission(gross);
    if(!confirm(`Продать весь незаблокированный инвентарь: ${items.length} предметов за ${fmt(total)} без комиссии?`)) return;
    removeItems(items.map(x=>x.uid));
    state.sold += total;
    earn(total, `Продажа всего инвентаря x${items.length} · комиссия`);
    renderInventory();
  }
  function sellCheap(){
    const cheap = state.inventory.filter(x => x.value < 200 && !x.protected);
    if(!cheap.length) return toast(`Нет предметов дешевле ${fmt(200)}`,'warn');
    const gross = cheap.reduce((s,x)=>s+x.value,0);
    const total = applySaleCommission(gross);
    removeItems(cheap.map(x=>x.uid));
    state.sold += total;
    earn(total, `Массовая продажа ${cheap.length} предметов · комиссия`);
    renderInventory();
  }

  let currentTarget = null;
  function selectedUpgradeSource(){
    const sel = $('#upgradeSource');
    const uid = sel ? sel.value : (state.pendingUpgrade || '');
    if(!uid || uid === '__BALANCE__') return null;
    return state.inventory.find(x=>x.uid===uid && !x.protected) || null;
  }
  function upgradeBalanceAmount(){
    const el = $('#upgradeBalanceAmount');
    const n = Math.max(0, Math.round(toNum(el ? el.value : 0, 0)));
    return clamp(n, 0, Math.max(0, Math.round(toNum(state.balance,0))));
  }
  function upgradeInputValue(){
    const src = selectedUpgradeSource();
    return Math.max(0, Math.round((src ? toNum(src.value,0) : 0) + upgradeBalanceAmount()));
  }
  function normalizeUpgradeMode(value){
    const m = Math.round(toNum(value,2));
    return [2,3,5,10,67,75].includes(m) ? m : 2;
  }
  function upgradeTargetMultiplier(){
    return normalizeUpgradeMode(state.upgradeMode || upgradeMode || 2);
  }
  function upgradeTargetValue(input, mode=upgradeTargetMultiplier()){
    const v = Math.max(1, toNum(input,0));
    if(mode === 75) return Math.round(v * 1.25);
    if(mode === 67) return Math.round(v * 1.40);
    return Math.round(v * mode);
  }
  function upgradeModeText(mode=upgradeTargetMultiplier()){
    return mode === 75 || mode === 67 ? `${mode}%` : `${mode}x`;
  }
  function pickItemForValue(targetValue, q=''){
    q = String(q||'').toLowerCase();
    let pool = catalog.items.filter(x => x && toNum(x.value,0) > 0 && realImageUrl(x.image));
    if(!pool.length) pool = catalog.items.filter(x => x && toNum(x.value,0) > 0);
    if(q) pool = pool.filter(x => String(x.name||'').toLowerCase().includes(q));
    if(!pool.length) pool = catalog.items;
    return [...pool].sort((a,b)=>Math.abs(toNum(a.value,0)-targetValue)-Math.abs(toNum(b.value,0)-targetValue))[0] || fallbackItems[0];
  }
  function renderUpgrade(){
    const root = $('#upgradeRoot'); if(!root) return;
    upgradeMode = upgradeTargetMultiplier();
    const inv = [...state.inventory].filter(x=>!x.protected).sort((a,b)=>toNum(b.value,0)-toNum(a.value,0));
    const selected = state.pendingUpgrade ? inv.find(x=>x.uid===state.pendingUpgrade) : null;
    if(state.pendingUpgrade && !selected){ state.pendingUpgrade = null; save(); }
    const sourceValue = selected ? selected.uid : '__BALANCE__';
    const balanceDefault = selected ? 0 : Math.min(Math.round(toNum(state.balance,0)), 1000);
    const options = `<option value="__BALANCE__" ${!selected?'selected':''}>Баланс без скина</option>` + inv.map(x=>`<option value="${esc(x.uid)}" ${sourceValue===x.uid?'selected':''}>${esc(x.displayName||x.name)} · ${fmt(x.value)}</option>`).join('');
    root.innerHTML = `<div class="upgrade-layout upgrade-layout-pro"><aside class="panel upgrade-sidebar"><span class="kicker">Upgrade 2.0</span><h3>Ставка</h3><label class="field-label">Источник</label><select id="upgradeSource">${options}</select><div id="upgradeSourcePreview">${selected?itemCard(selected):'<div class="empty">Можно апгрейдить только балансом — без скина.</div>'}</div><label class="field-label">Добавить с баланса</label><input id="upgradeBalanceAmount" type="number" min="0" step="50" value="${balanceDefault}" placeholder="Сумма доплаты"><div class="upgrade-tabs" role="tablist"><button class="small-btn ${upgradeMode===75?'active':''}" data-action="set-upgrade-mult" data-mult="75">75%</button><button class="small-btn ${upgradeMode===67?'active':''}" data-action="set-upgrade-mult" data-mult="67">67%</button><button class="small-btn ${upgradeMode===2?'active':''}" data-action="set-upgrade-mult" data-mult="2">2x</button><button class="small-btn ${upgradeMode===3?'active':''}" data-action="set-upgrade-mult" data-mult="3">3x</button><button class="small-btn ${upgradeMode===5?'active':''}" data-action="set-upgrade-mult" data-mult="5">5x</button><button class="small-btn ${upgradeMode===10?'active':''}" data-action="set-upgrade-mult" data-mult="10">10x</button></div><div id="upgradeChance"></div><button class="btn primary huge" data-action="do-upgrade">Апгрейд</button><p class="small">При проигрыше сгорает выбранный скин и/или списанная сумма. При победе выдаётся автоматически подобранная вещь из подходящего ценового диапазона.</p></aside><section><div class="upgrade-roulette" id="upgradeRoulette"><div class="upgrade-arrow"></div><div class="upgrade-lane" id="upgradeLane"><span class="zone lose">LOSE</span><span class="zone win">WIN</span><span class="zone lose">LOSE</span></div></div><div class="notice"><b>Автоподбор:</b> выбери 75% / 67% или 2x / 3x / 5x / 10x — список ниже сам подберёт цель под выбранный риск.</div><div class="filters"><input id="targetSearch" placeholder="Поиск цели"></div><div id="upgradeTargets" class="target-row"></div></section></div>`;
    renderUpgradeTargets();
  }
  function renderUpgradeTargets(){
    const q = ($('#targetSearch') && $('#targetSearch').value || '').toLowerCase();
    const input = upgradeInputValue();
    const mult = upgradeTargetMultiplier();
    const targetValue = upgradeTargetValue(input, mult);
    let pool = catalog.items.filter(x => x && toNum(x.value,0) >= Math.max(1,targetValue*.72) && toNum(x.value,0) <= targetValue*1.55);
    if(q) pool = pool.filter(x => String(x.name||'').toLowerCase().includes(q));
    if(pool.length < 8){
      let wider = catalog.items.filter(x => x && toNum(x.value,0) >= Math.max(1,targetValue*.45) && toNum(x.value,0) <= targetValue*2.2);
      if(q) wider = wider.filter(x => String(x.name||'').toLowerCase().includes(q));
      pool = wider;
    }
    pool = [...pool].sort((a,b)=>Math.abs(toNum(a.value,0)-targetValue)-Math.abs(toNum(b.value,0)-targetValue)).slice(0,60);
    currentTarget = pool[0] || null;
    const box = $('#upgradeTargets'); if(!box) return;
    box.innerHTML = pool.map((x,i)=>itemCard(x,{selected:i===0,badge:i===0?'автоцель':'цель'})).join('') || '<div class="empty">Целей под такой множитель не найдено. Увеличь ставку или измени поиск.</div>';
    $$('#upgradeTargets .item-card').forEach((card,i)=>card.addEventListener('click',()=>{
      $$('#upgradeTargets .item-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected'); currentTarget = pool[i]; updateUpgradeChance();
    }));
    updateUpgradeChance();
  }
  function chance(srcOrValue,tgt){
    const input = typeof srcOrValue === 'number' ? srcOrValue : (srcOrValue ? toNum(srcOrValue.value,0) : upgradeInputValue());
    if(!input || !tgt) return 0;
    const mode = upgradeTargetMultiplier();
    if(mode === 75) return 75;
    if(mode === 67) return 67;
    const ratio = input / Math.max(1, toNum(tgt.value,1));
    return clamp(ratio * 67, 0.35, 58);
  }
  function updateUpgradeChance(){
    const input = upgradeInputValue();
    const src = selectedUpgradeSource();
    const add = upgradeBalanceAmount();
    const ch = chance(input,currentTarget);
    const el = $('#upgradeChance');
    if(el) el.innerHTML = input && currentTarget ? `<div class="upgrade-summary"><p>Ставка: <b>${fmt(input)}</b> ${src?`<span>скин ${fmt(src.value)}</span>`:''} ${add?`<span>+ баланс ${fmt(add)}</span>`:''}</p><p>Режим: <b>${upgradeModeText()}</b></p><p>Цель: <b>${esc(currentTarget.name)}</b> · ${fmt(currentTarget.value)}</p></div><div class="chance"><span style="width:${ch}%"></span></div><b>${ch.toFixed(2)}%</b>` : '<p class="small">Укажи сумму или выбери скин, чтобы увидеть шанс.</p>';
    const win = $('#upgradeLane .win'); if(win) win.style.width = `${clamp(ch,4,76)}%`;
  }
  function doUpgrade(){
    if(busy.upgrade) return toast('Апгрейд уже крутится','warn');
    const src = selectedUpgradeSource();
    const add = upgradeBalanceAmount();
    const input = Math.round((src ? toNum(src.value,0) : 0) + add);
    const tgt = currentTarget;
    if(input <= 0) return toast('Выбери скин или сумму с баланса','bad');
    if(add > toNum(state.balance,0)) return toast('Недостаточно баланса для доплаты','bad');
    if(!tgt) return toast('Цель не найдена','bad');
    const ch = chance(input,tgt);
    busy.upgrade = true;
    const btn = $('[data-action="do-upgrade"]'); if(btn){ btn.disabled=true; btn.textContent='Крутится...'; }
    if(add > 0 && !spend(add, src ? 'Доплата к апгрейду' : 'Апгрейд за баланс')){ busy.upgrade=false; if(btn){btn.disabled=false; btn.textContent='Апгрейд';} return; }
    const lane = $('#upgradeLane');
    const success = cryptoRandom() < (ch / 100);
    const winStart = 50 - ch/2;
    const winEnd = 50 + ch/2;
    const stopPercent = success ? rnd(winStart+1, winEnd-1) : (cryptoRandom()<.5 ? rnd(2, Math.max(3,winStart-1)) : rnd(Math.min(97,winEnd+1),98));
    if(lane){
      lane.style.transition='none'; lane.style.transform='translateX(0)'; lane.getBoundingClientRect();
      requestAnimationFrame(()=>{ lane.style.transition='transform 3.6s cubic-bezier(.08,.75,.08,1)'; lane.style.transform=`translateX(calc(-${stopPercent}% + 50%))`; });
    }
    setTimeout(()=>{
      if(src) removeItems(src.uid);
      state.upgrades += 1;
      if(success){ const win = addItem(tgt,'upgrade'); state.pendingUpgrade=win.uid; addLive('Ты',win); toast(`Апгрейд успешен: ${win.displayName}`,'good'); showDrop(win,null); }
      else{ state.pendingUpgrade=null; toast('Апгрейд не прошёл: ставка сгорела','bad'); }
      bpEvent('upgrade', {success});
      busy.upgrade=false; save(); renderUpgrade();
    }, 3900);
  }

  function toggleContract(uid){
    const srcIt = state.inventory.find(x=>x.uid===uid);
    if(srcIt && srcIt.protected) return toast('Защищённые предметы нельзя использовать в режимах. Сними замок в инвентаре.','bad');
    const set = new Set(state.contractSelected||[]);
    if(set.has(uid)) set.delete(uid); else if(set.size < 10) set.add(uid); else return toast('В контракт можно максимум 10 предметов','bad');
    state.contractSelected = Array.from(set); save();
  }
  function renderContracts(){
    const root = $('#contractsRoot'); if(!root) return;
    const set = new Set(state.contractSelected||[]);
    const selected = state.inventory.filter(x=>set.has(x.uid) && !x.protected);
    const total = selected.reduce((s,x)=>s+x.value,0);
    root.innerHTML = `<div class="contract-layout"><aside class="panel"><h3>Контракт</h3><div class="big-count">${selected.length}/10</div><p>Минимум 3 предмета.</p><p>Сумма: <b>${fmt(total)}</b></p><p>Примерный результат: <b>${fmt(total*rnd(1.05,1.85))}</b></p><button class="btn primary huge" data-action="make-contract" ${selected.length>=3?'':'disabled'}>Создать контракт</button><button class="btn" data-action="clear-contract">Очистить</button></aside><section><div class="grid item-grid">${state.inventory.filter(x=>!x.protected).map(x=>itemCard(x,{selected:set.has(x.uid),buttons:`<button data-contract-item="${esc(x.uid)}">${set.has(x.uid)?'Убрать':'Добавить'}</button>`})).join('') || '<div class="empty">Нет предметов.</div>'}</div></section></div>`;
  }
  function makeContract(){
    const set = new Set(state.contractSelected||[]);
    const selected = state.inventory.filter(x=>set.has(x.uid) && !x.protected);
    if(selected.length < 3) return toast('Нужно минимум 3 предмета','bad');
    const total = selected.reduce((s,x)=>s+x.value,0);
    let candidates = catalog.items.filter(x => x.value >= total*.5 && x.value <= total*2.3);
    if(!candidates.length) candidates = catalog.items;
    const base = Object.assign({}, sample(candidates), {value:Math.round(total*rnd(.92,1.9))});
    removeItems(selected.map(x=>x.uid));
    state.contractSelected=[]; state.contracts += 1;
    const reward = addItem(base,'contract'); addLive('Ты',reward); bpEvent('contract', {value:reward.value}); save(); renderContracts(); showDrop(reward,null);
    toast(`Контракт создан: ${reward.displayName}`,'good');
  }

  function cooldownLeft(){ return Math.max(0, (state.lastWheelAt || 0) + WHEEL_COOLDOWN - Date.now()); }
  function formatTime(ms){ const s=Math.ceil(ms/1000); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; return h>0?`${h}ч ${m}м ${sec}с`:`${m}м ${sec}с`; }
  function renderWheel(){
    const root = $('#wheelRoot'); if(!root) return;
    const left = cooldownLeft();
    root.innerHTML = `<div class="wheel-page"><div class="wheel-pointer"></div><div class="wheel" id="wheel"><span>LAB</span></div><button class="btn primary huge" data-action="spin-wheel" ${left?'disabled':''}>${left?'Доступно через '+formatTime(left):'Крутить бонусное колесо'}</button><div class="notice">Лимит: 1 прокрутка в 2 часа. После остановки сразу начисляет баланс или предмет.</div><div id="wheelResult" class="wheel-result"></div></div>`;
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
      [`+${fmt(250)}`,'coins',250],[`+${fmt(500)}`,'coins',500],[`+${fmt(750)}`,'coins',750],[`+${fmt(1000)}`,'coins',1000],[`+${fmt(2500)}`,'coins',2500],[`Промо +${fmt(1500)}`,'coins',1500],['Случайный скин','item',0],['Редкий скин','rare',0]
    ];
    const idx = Math.floor(cryptoRandom()*rewards.length);
    wheelDeg += 360*6 + (360 - idx*45) + rnd(8,35);
    const wh = $('#wheel'); if(wh) wh.style.transform = `rotate(${wheelDeg}deg)`;
    setTimeout(()=>{
      const [label,type,amount] = rewards[idx];
      if(type === 'coins'){ earn(amount,'Бонусное колесо'); bpEvent('wheel', {type:'coins', amount}); $('#wheelResult').innerHTML = `<div class="result-card"><h2>${esc(label)}</h2><p>Баланс обновлён: ${fmt(state.balance)}</p></div>`; }
      else{
        let pool = catalog.items;
        if(type === 'rare') pool = catalog.items.filter(x => ['Classified','Covert','Exceedingly Rare','Extraordinary'].includes(x.rarity));
        const it = addItem(sample(pool.length?pool:catalog.items),'wheel'); addLive('Ты',it); bpEvent('wheel', {type:'item', item:it}); $('#wheelResult').innerHTML = itemCard(it,{badge:'колесо'});
      }
      busy.wheel=false; renderWheel();
    }, 3300);
  }

  function todayAdViews(){ const k = DAY_KEY(); return Math.max(0, Math.round(toNum(state.adViews && state.adViews[k],0))); }
  function todayAdClicks(){ const k = DAY_KEY(); state.adClicks = (state.adClicks && typeof state.adClicks === 'object') ? state.adClicks : {}; const day = state.adClicks[k]; return (day && typeof day === 'object') ? day : {}; }
  function renderAds(){
    const root = $('#adsRoot'); if(!root) return;
    const used = todayAdViews();
    const clicks = todayAdClicks();
    const claimed = Object.keys(clicks).length;
    root.innerHTML = `<div class="ad-projects-hero ad-card"><div><span class="kicker">Партнёрские переходы</span><h2>Перейди на проект и получи бонус</h2><p>Каждый ресурс можно открыть один раз в день за награду: случайный скин или баланс до ${fmt(AD_CLICK_REWARD_MAX)}. Переход открывается в новой вкладке, а бонус фиксируется локально в сохранении браузера.</p><div class="ad-mini-stats"><span>Сегодня получено: <b>${claimed}/${AD_PROJECTS.length}</b></span><span>Награда: <b>скин / до ${fmt(AD_CLICK_REWARD_MAX)}</b></span></div></div></div><div class="project-grid ad-project-grid">${projectCards()}</div><div class="ad-card ad-watch-card"><div><span class="kicker">Просмотр рекламы</span><h2>10 секунд просмотра = ${fmt(AD_REWARD)}</h2><p>Окно рекламы нельзя закрыть до конца таймера. Лимит в статической версии: ${AD_DAILY_LIMIT} просмотров в сутки на браузер/устройство.</p><button class="btn primary huge" data-action="start-ad" ${used>=AD_DAILY_LIMIT?'disabled':''}>${used>=AD_DAILY_LIMIT?'Лимит на сегодня исчерпан':'Смотреть рекламу'}</button><p class="small">Сегодня использовано: <b>${used}/${AD_DAILY_LIMIT}</b></p></div><div class="project-grid compact-projects">${projectCards(true)}</div></div>`;
  }
  function projectCards(compact=false){
    const clicks = todayAdClicks();
    return AD_PROJECTS.map(p=>{
      const done = !!clicks[p.id];
      return `<a class="project-card ad-project-card ${done?'claimed':''} ${compact?'compact':''}" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" data-action="open-project" data-project="${esc(p.id)}"><div class="project-icon">${esc(p.emoji)}</div><div><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><span class="project-link">${done?'Бонус сегодня получен':'Перейти и получить бонус'} →</span></div></a>`;
    }).join('');
  }
  function projectById(projectId){ return AD_PROJECTS.find(x => x.id === projectId) || null; }
  function openProjectLink(projectId){
    const project = projectById(projectId);
    if(!project) return toast('Проект не найден','bad');
    const k = DAY_KEY();
    state.adClicks = (state.adClicks && typeof state.adClicks === 'object') ? state.adClicks : {};
    state.adClicks[k] = (state.adClicks[k] && typeof state.adClicks[k] === 'object') ? state.adClicks[k] : {};
    const already = !!state.adClicks[k][project.id];
    try{ window.open(project.url, '_blank', 'noopener,noreferrer'); }catch(e){ location.href = project.url; }
    if(already){ toast('Переход засчитан ранее сегодня. Завтра бонус снова будет доступен.','warn'); renderAds(); save(); return; }
    state.adClicks[k][project.id] = {time:Date.now(), url:project.url};
    if(cryptoRandom() < .45){
      const pool = catalog.items.filter(x => toNum(x.value,0) >= 120 && toNum(x.value,0) <= AD_CLICK_REWARD_MAX);
      const base = sample(pool.length ? pool : catalog.items);
      const reward = addItem(base, 'project-ad');
      addLive('Ты', reward);
      addTx(`Переход: ${project.title} · скин`, 0);
      toast(`Переход засчитан: получен ${reward.displayName || reward.name}`,'good');
    }else{
      const amount = Math.round(rnd(500, AD_CLICK_REWARD_MAX) / 100) * 100;
      earn(amount, `Переход: ${project.title}`);
      toast(`Переход засчитан: +${fmt(amount)}`,'good');
    }
    bpEvent('ad', {type:'project-click', project:project.id});
    save();
    renderAds();
    renderGlobals();
  }
  function startAd(){
    if(busy.ad) return;
    const used = todayAdViews();
    if(used >= AD_DAILY_LIMIT) return toast('Лимит рекламы на сегодня исчерпан','warn');
    busy.ad = true;
    const modal = document.createElement('div');
    modal.className = 'modal show ad-lock-modal'; modal.dataset.locked = '1';
    modal.innerHTML = `<div class="modal-card ad-watch"><div class="modal-head"><h3>Реклама проекта</h3><button class="close" data-close-modal title="Закроется после таймера">×</button></div><div class="modal-body"><div class="ad-card"><div><span class="kicker">Просмотр ${fmt(AD_REWARD)}</span><h2 id="adLockTitle">Осталось 10 секунд</h2><p>Закрытие заблокировано до конца просмотра.</p><div class="progress"><span id="adProgress"></span></div><p id="adTimer">10 сек.</p></div><div class="project-grid">${projectCards()}</div></div></div></div>`;
    document.body.appendChild(modal);
    const bar = $('#adProgress', modal); const timer = $('#adTimer', modal); const title = $('#adLockTitle', modal);
    let sec = 10; if(bar) bar.style.width='0%';
    const int = setInterval(()=>{
      sec--; if(bar) bar.style.width = `${(10-sec)*10}%`; if(timer) timer.textContent = sec>0 ? `${sec} сек.` : 'Готово'; if(title) title.textContent = sec>0 ? `Осталось ${sec} сек.` : 'Просмотр завершён';
      if(sec <= 0){
        clearInterval(int);
        const k = DAY_KEY(); state.adViews[k] = todayAdViews() + 1;
        earn(AD_REWARD,'Просмотр рекламы');
        bpEvent('ad', {amount:AD_REWARD});
        busy.ad=false; modal.dataset.locked='0';
        modal.querySelector('.close').textContent = '×';
        setTimeout(()=>{ closeModal(modal); modal.remove(); renderAds(); }, 700);
      }
    },1000);
  }

  function minesActiveGame(){ state.minesGame = normalizeMinesGame(state.minesGame); return state.minesGame; }
  function minesMultiplier(mineCount, revealedCount){
    mineCount = clamp(Math.round(toNum(mineCount,5)),3,10);
    revealedCount = clamp(Math.round(toNum(revealedCount,0)),0,25-mineCount);
    let prob = 1;
    for(let i=0;i<revealedCount;i++) prob *= Math.max(1,(25-mineCount-i)) / Math.max(1,(25-i));
    return clamp((1 / Math.max(.001,prob)) * .82, 1.02, 55);
  }
  function minesStakeItem(){
    const g = minesActiveGame();
    const uid = g ? g.stakeUid : (($('#minesStake') && $('#minesStake').value) || '');
    return state.inventory.find(x=>x.uid===uid) || null;
  }
  function renderMines(){
    const root = $('#minesRoot'); if(!root) return;
    const g = minesActiveGame();
    const inv = [...state.inventory].filter(x=>!x.protected).sort((a,b)=>toNum(b.value,0)-toNum(a.value,0));
    if(g && !state.inventory.some(x=>x.uid===g.stakeUid && !x.protected)) state.minesGame = null;
    const current = minesActiveGame();
    const options = inv.map(x=>`<option value="${esc(x.uid)}">${esc(x.displayName||x.name)} · ${fmt(x.value)}</option>`).join('');
    const selected = current ? state.inventory.find(x=>x.uid===current.stakeUid) : inv[0];
    const gameHtml = current ? minesBoardHtml(current, selected) : `<div class="mines-start-card"><label class="field-label">Скин для ставки</label><select id="minesStake">${options}</select><label class="field-label">Мин на поле</label><select id="minesCount"><option value="3">Easy · 3 мины</option><option value="5" selected>Medium · 5 мин</option><option value="9">Hard · 9 мин</option><option value="14">Insane · 14 мин</option></select><div id="minesInfo"></div><button class="btn primary huge" data-action="start-mines" ${inv.length?'':'disabled'}>Начать сапёр</button><p class="small">Выбери клетки. Попал на мину — скин исчезает. Забрал вовремя — получаешь предмет дороже твоей ставки.</p></div>`;
    root.innerHTML = `<div class="mines-hero panel"><span class="kicker">Skin Mines</span><h2>Сапёр на скины</h2><p>Стилизованный сапёр без реальных ставок и вывода: всё работает локально в браузере. Чем больше безопасных клеток открыл — тем выше множитель награды.</p><div class="grid cards-3"><div class="stat"><small>Игр</small><b>${state.mines||0}</b></div><div class="stat"><small>Побед</small><b>${state.minesWins||0}</b></div><div class="stat"><small>Активный риск</small><b>${selected?fmt(selected.value):'нет'}</b></div></div></div><div class="mines-layout"><aside class="panel mines-sidebar"><h3>Условия</h3>${selected?itemCard(selected):'<div class="empty">В инвентаре нет предметов для ставки.</div>'}<div class="notice"><b>Совет:</b> на 3 минах множитель растёт медленно, на 10 — быстро, но риск огромный.</div></aside><section>${gameHtml}</section></div>`;
    if(!current) renderMinesInfo();
  }
  function renderMinesInfo(){
    const stake = minesStakeItem() || state.inventory[0];
    const mines = clamp(Math.round(toNum($('#minesCount') && $('#minesCount').value,5)),3,18);
    const el = $('#minesInfo'); if(!el) return;
    const preview = [1,3,5,8].map(n=>`<span>${n} safe: <b>${minesMultiplier(mines,n).toFixed(2)}x</b></span>`).join('');
    el.innerHTML = stake ? `<div class="battle-price"><span>Ставка</span><b>${fmt(stake.value)}</b></div><div class="battle-price"><span>Поле</span><b>5×5 / ${mines} мин</b></div><div class="mines-preview">${preview}</div>` : '<div class="empty">Нет скинов для игры.</div>';
  }
  function minesBoardHtml(g, stake){
    const revealed = new Set(g.revealed||[]);
    const mines = new Set(g.cells||[]);
    const safe = revealed.size;
    const mult = minesMultiplier(g.mineCount, safe);
    const value = stake ? Math.round(toNum(stake.value,0) * mult) : 0;
    const cells = Array.from({length:25},(_,i)=>{
      const open = revealed.has(i) || g.finished;
      const mine = mines.has(i);
      const label = open ? (mine ? '✹' : '✓') : '';
      return `<button class="mine-cell ${open?'open':''} ${mine&&open?'mine':''}" data-action="mines-cell" data-cell="${i}" ${g.finished||open?'disabled':''}>${label}</button>`;
    }).join('');
    return `<div class="mines-game"><div class="mines-top"><div><span class="kicker">Активная игра</span><h2>${g.finished?'Раунд завершён':'Выбирай клетки'}</h2><p>Открыто безопасных клеток: <b>${safe}</b> · мин: <b>${g.mineCount}</b></p></div><div class="mines-bank"><span>Текущий множитель</span><b>${mult.toFixed(2)}x</b><small>Потенциально: ${fmt(value)}</small></div></div><div class="mines-board">${cells}</div><div class="mines-actions"><button class="btn green huge" data-action="cashout-mines" ${safe<1||g.finished?'disabled':''}>Забрать ${fmt(value)}</button><button class="btn" data-action="cancel-mines" ${g.finished?'':'disabled'}>Новый раунд</button></div></div>`;
  }
  function startMines(){
    if(minesActiveGame()) return toast('Сначала заверши текущий сапёр','warn');
    const stake = minesStakeItem() || state.inventory.find(x=>!x.protected);
    if(!stake) return toast('В инвентаре нет незаблокированного скина для ставки','bad');
    if(stake.protected) return toast('Защищённый предмет нельзя поставить в сапёр','bad');
    const mineCount = clamp(Math.round(toNum($('#minesCount') && $('#minesCount').value,5)),3,18);
    const cells = [];
    while(cells.length < mineCount){ const n = Math.floor(cryptoRandom()*25); if(!cells.includes(n)) cells.push(n); }
    state.minesGame = {active:true, stakeUid:stake.uid, mineCount, cells, revealed:[], startedAt:Date.now(), finished:false, lostCell:null};
    state.mines = Math.round(toNum(state.mines,0)) + 1;
    bpEvent('mines', {won:false, started:true, mineCount});
    save(); renderMines(); toast('Сапёр начался. Удачи!','good');
  }
  function revealMinesCell(cell){
    const g = minesActiveGame(); if(!g || g.finished) return;
    cell = Math.round(toNum(cell,-1)); if(cell < 0 || cell >= 25) return;
    if((g.revealed||[]).includes(cell)) return;
    const stake = state.inventory.find(x=>x.uid===g.stakeUid);
    if(!stake){ state.minesGame=null; save(); renderMines(); return toast('Ставочный скин не найден','bad'); }
    if((g.cells||[]).includes(cell)){
      g.revealed = Array.from(new Set([...(g.revealed||[]), cell])); g.finished = true; g.lostCell = cell;
      removeItems(stake.uid); state.minesGame = null; save(); renderMines(); toast('Мина! Скин сгорел.','bad'); return;
    }
    g.revealed = Array.from(new Set([...(g.revealed||[]), cell]));
    if(g.revealed.length >= 25 - g.mineCount) return cashoutMines(true);
    save(); renderMines();
  }
  function cashoutMines(auto=false){
    const g = minesActiveGame(); if(!g || g.finished) return;
    const stake = state.inventory.find(x=>x.uid===g.stakeUid); if(!stake){ state.minesGame=null; save(); renderMines(); return; }
    const safe = (g.revealed||[]).length;
    if(safe < 1 && !auto) return toast('Открой хотя бы одну безопасную клетку','warn');
    const mult = minesMultiplier(g.mineCount, safe);
    const targetValue = Math.max(stake.value + 50, Math.round(toNum(stake.value,0) * mult));
    const base = Object.assign({}, pickItemForValue(targetValue), {value:targetValue});
    removeItems(stake.uid);
    const reward = addItem(base, 'sapper-win');
    state.minesWins = Math.round(toNum(state.minesWins,0)) + 1;
    bpEvent('mines', {won:true, safe, mineCount:g.mineCount});
    state.minesGame = null;
    addLive('Ты', reward);
    save(); renderMines(); showDrop(reward,null); toast(`Сапёр выигран: ${reward.displayName}`,'good');
  }
  function cancelMinesGame(){ state.minesGame = null; save(); renderMines(); }

  function renderBattle(){
    const root = $('#battleRoot'); if(!root) return;
    const first = catalog.cases[0];
    root.innerHTML = `<div class="battle-layout improved-battle"><aside class="panel battle-sidebar"><span class="kicker">Case Battle</span><h3>Баттл против ботов</h3><p>Ты оплачиваешь своё место. Каждый игрок открывает один и тот же кейс. Победитель по сумме дропа забирает весь пул.</p><label class="field-label">Кейс</label><select id="battleCase">${catalog.cases.map(c=>`<option value="${esc(c.id)}">${esc(c.name)} · ${fmt(c.price)}</option>`).join('')}</select><label class="field-label">Режим</label><select id="battleMode"><option value="1v1">1 vs 1</option><option value="1v1v1" selected>1 vs 1 vs 1</option><option value="2v2">2 vs 2 Team</option><option value="1v1v1v1">1 vs 1 vs 1 vs 1</option><option value="crazy">Crazy Mode</option><option value="underdog">Underdog Mode</option></select><div id="battleInfo"></div><button class="btn primary huge" data-action="start-battle">Начать баттл</button><p class="small">Без реальных ставок и вывода. Всё сохраняется в localStorage.</p></aside><section class="battle-stage"><div class="battle-top"><h2>Арена</h2><p id="battleStatus">Выбери кейс и режим, затем начни баттл.</p></div><div id="battleArena" class="battle-arena"><div class="empty">Пока баттла нет.</div></div></section></div>`;
    if(first) $('#battleCase').value = first.id;
    renderBattleInfo();
  }
  function battlePlayers(mode){
    if(mode === '1v1') return ['Ты','BOT Max'];
    if(mode === '2v2' || mode === '1v1v1v1' || mode === 'crazy' || mode === 'underdog') return ['Ты','BOT Max','BOT Neo','BOT Rex'];
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
    const battleCasePool = catalog.cases.filter(x=>x.items&&x.items.length&&toNum(x.price,0)>0);
    const players = names.map((name,idx) => { const pc = mode==='crazy' ? sample(battleCasePool) : c; return {name, caseName:pc.name, team: mode==='2v2' ? (idx%2===0?'A':'B') : name, item: weighted(pc)}; });
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
        const top = [...results].sort((a,b)=> mode==='underdog' ? a.inv.value-b.inv.value : b.inv.value-a.inv.value)[0];
        winner = {team:top.team, name:top.name, value:top.inv.value};
      }
      const userWon = mode === '2v2' ? winner.team === 'A' : winner.name === 'Ты';
      arena.innerHTML = `<div class="battle-summary ${userWon?'win':'lose'}"><h2>${userWon?'Победа!':'Поражение'}</h2><p>${esc(winner.name)} забирает пул на ${fmt(results.reduce((s,x)=>s+x.inv.value,0))}</p></div>` + results.map(x => `<article class="battle-player result ${((mode==='2v2' && x.team===winner.team) || (mode!=='2v2' && x.name===winner.name))?'winner':''}"><div class="battle-player-head"><b>${esc(x.name)}</b>${mode==='2v2'?`<span class="pill">Team ${x.team}</span>`:''}</div>${itemCard(x.inv,{badge:fmt(x.inv.value)})}</article>`).join('');
      bpEvent('battle', {won:userWon, mode, players:results.length});
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

  function isIOSDevice(){
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function isStandaloneMode(){
    return !!(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
  }

  function initResponsiveMenu(){
    const nav = $('.navlinks');
    if(!nav) return;
    let btn = $('.menu-toggle');
    if(!btn){
      nav.insertAdjacentHTML('beforebegin', '<button class="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false"><span class="menu-lines"><i></i><i></i><i></i></span><b>Меню</b></button>');
      btn = $('.menu-toggle');
    }
    let backdrop = $('.menu-backdrop');
    if(!backdrop){
      document.body.insertAdjacentHTML('afterbegin', '<div class="menu-backdrop" aria-hidden="true"></div>');
      backdrop = $('.menu-backdrop');
    }
    const close = () => { document.body.classList.remove('nav-open'); btn.setAttribute('aria-expanded','false'); };
    const open = () => { document.body.classList.add('nav-open'); btn.setAttribute('aria-expanded','true'); };
    let lastMenuTap = 0;
    const toggleMenu = e => {
      if(e){ e.preventDefault(); e.stopPropagation(); }
      const now = Date.now();
      if(now - lastMenuTap < 260) return;
      lastMenuTap = now;
      document.body.classList.contains('nav-open') ? close() : open();
    };
    btn.addEventListener('click', toggleMenu);
    btn.addEventListener('pointerup', toggleMenu, {passive:false});
    btn.addEventListener('touchend', toggleMenu, {passive:false});
    if(backdrop){ backdrop.addEventListener('click', close); backdrop.addEventListener('touchend', e => { e.preventDefault(); close(); }, {passive:false}); }
    nav.addEventListener('click', e => { if(e.target.closest('a')) close(); });
    nav.addEventListener('touchend', e => { if(e.target.closest('a')) close(); }, {passive:true});
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if(innerWidth > 1100) close(); }, {passive:true});
  }

  function initScrollFix(){
    const root = document.documentElement;
    const body = document.body;
    const unlock = () => {
      try{
        root.style.overflowY = 'auto';
        body.style.overflowY = 'auto';
        body.style.overflowX = 'hidden';
        body.style.position = 'relative';
        body.classList.remove('scroll-lock','no-scroll','lock-scroll');
      }catch(e){}
    };
    unlock();
    window.addEventListener('pageshow', unlock, {passive:true});
    window.addEventListener('focus', unlock, {passive:true});
    document.addEventListener('wheel', e => {
      if(e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if(e.target.closest('.modal.show .modal-card')) return;
      const horizontalZone = e.target.closest('.topbar,.live-wrap,.navlinks,.live-feed');
      if(!horizontalZone || document.body.classList.contains('nav-open')) return;
      const scroller = document.scrollingElement || document.documentElement;
      const max = scroller.scrollHeight - window.innerHeight;
      if(max > 4) scroller.scrollTop += e.deltaY;
    }, {passive:true, capture:true});
  }

  function initIOSViewport(){
    const html = document.documentElement;
    const setVh = () => {
      try{ html.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px'); }catch(e){}
    };
    setVh();
    window.addEventListener('resize', setVh, {passive:true});
    window.addEventListener('orientationchange', () => setTimeout(setVh, 250), {passive:true});
    document.addEventListener('visibilitychange', setVh, {passive:true});
    if(isIOSDevice()) html.classList.add('ios');
    if(isStandaloneMode()) html.classList.add('standalone');
    try{ document.addEventListener('touchstart', function(){}, {passive:true}); }catch(e){}
  }

  function initMobileTapBridge(){
    if(document.documentElement.dataset.tapBridge === '1') return;
    document.documentElement.dataset.tapBridge = '1';
    const actionSelector = '[data-action],[data-open-case],[data-view-case],[data-sell],[data-upgrade-item],[data-contract-item],[data-close-modal]';
    const linkSelector = 'a[href]';
    let lastTarget = null, lastAt = 0;
    const getTouchTarget = e => {
      let target = e.target && e.target.closest ? e.target.closest(actionSelector) : null;
      if(target) return target;
      try{
        const t = e.changedTouches && e.changedTouches[0];
        if(t){
          const el = document.elementFromPoint(t.clientX, t.clientY);
          if(el && el.closest) target = el.closest(actionSelector);
        }
      }catch(err){}
      return target;
    };
    const bridge = e => {
      const target = getTouchTarget(e);
      if(!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
      const now = Date.now();
      if(lastTarget === target && now - lastAt < 420) return;
      lastTarget = target; lastAt = now;
      target.__tapBridgeAt = now;
      try{ e.preventDefault(); e.stopPropagation(); }catch(err){}
      const ev = new MouseEvent('click', {bubbles:true, cancelable:true, view:window});
      ev.__tapBridge = true;
      target.dispatchEvent(ev);
    };
    document.addEventListener('touchend', bridge, {passive:false, capture:true});
    if(window.PointerEvent){
      document.addEventListener('pointerup', e => {
        if(e.pointerType === 'touch' || e.pointerType === 'pen') bridge(e);
      }, {passive:false, capture:true});
    }
    // Страховка для обычных ссылок-кнопок на iOS: если Safari не отдаёт click, переходим вручную.
    document.addEventListener('touchend', e => {
      const a = e.target && e.target.closest ? e.target.closest(linkSelector) : null;
      if(!a || a.closest('[data-action]') || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if(!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      if(a.target && a.target !== '_self') return;
      if(!/\.html($|[?#])/.test(href) && !/^[a-z0-9_-]+\.html/i.test(href)) return;
      try{ e.preventDefault(); document.body.classList.remove('nav-open'); location.href = href; }catch(err){}
    }, {passive:false, capture:true});
    document.addEventListener('touchstart', e => {
      if(document.body.classList.contains('nav-open')) return;
      const b = document.querySelector('.menu-backdrop');
      if(b) b.style.pointerEvents = 'none';
      $$('.modal:not(.show)').forEach(m => { m.style.pointerEvents = 'none'; });
    }, {passive:true});
  }


  // v30: non-invasive iOS tap insurance. It does NOT replace desktop click logic.
  // It only mirrors touch/pointer activation into the same internal actions if iOS drops click.
  function initV30MobileActionPatch(){
    if(document.documentElement.dataset.v30MobilePatch === '1') return;
    document.documentElement.dataset.v30MobilePatch = '1';

    const selector = '[data-action],[data-open-case],[data-view-case],[data-sell],[data-upgrade-item],[data-contract-item],[data-close-modal]';
    const run = (el) => {
      if(!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
      if(el.matches('[data-close-modal]')){ closeModal(el.closest('.modal')); return true; }
      if(el.dataset.openCase){ openCaseModal(el.dataset.openCase, true); return true; }
      if(el.dataset.viewCase){ openCaseModal(el.dataset.viewCase, false); return true; }
      if(el.dataset.sell){ sellItem(el.dataset.sell); return true; }
      if(el.dataset.upgradeItem){ state.pendingUpgrade = el.dataset.upgradeItem; save(); location.href = 'upgrade.html'; return true; }
      if(el.dataset.contractItem){ toggleContract(el.dataset.contractItem); route(); toast('Выбор контракта обновлён','good'); return true; }
      const a = el.dataset.action;
      if(!a) return false;
      if(a === 'spin-current-case'){ spinCase(currentCase, {fast:false,count:1}); return true; }
      if(a === 'spin-fast'){ spinCase(currentCase, {fast:true,count:1}); return true; }
      if(a === 'open-again'){ spinCase(currentCase, {fast:false,count:1}); return true; }
      if(a === 'open-again-fast'){ spinCase(currentCase, {fast:true,count:1}); return true; }
      if(a === 'open-multi'){ spinCase(currentCase, {fast:true,count:el.dataset.count||1}); return true; }
      if(a === 'sell-batch'){ sellBatch((el.dataset.uids||'').split(',').filter(Boolean)); return true; }
      if(a === 'redeem-promo'){ redeemPromo(); return true; }
      if(a === 'spin-wheel'){ spinWheel(); return true; }
      if(a === 'start-ad'){ startAd(); return true; }
      if(a === 'open-project'){ openProjectLink(el.dataset.project || ''); return true; }
      if(a === 'start-battle'){ startBattle(); return true; }
      if(a === 'make-contract'){ makeContract(); return true; }
      if(a === 'clear-contract'){ state.contractSelected=[]; save(); route(); return true; }
      if(a === 'set-upgrade-mult'){ state.upgradeMode = normalizeUpgradeMode(el.dataset.mult); save(); renderUpgrade(); return true; }
      if(a === 'do-upgrade'){ doUpgrade(); return true; }
      if(a === 'start-mines'){ startMines(); return true; }
      if(a === 'mines-cell'){ revealMinesCell(el.dataset.cell); return true; }
      if(a === 'cashout-mines'){ cashoutMines(); return true; }
      if(a === 'cancel-mines'){ cancelMinesGame(); return true; }
      if(a === 'sell-cheap'){ sellCheap(); return true; }
      if(a === 'sell-all-inventory'){ sellAllInventory(); return true; }
      if(a === 'reset-save'){ resetSave(); return true; }
      if(a === 'export-save'){ exportSave(); return true; }
      if(a === 'import-save'){ importSave(); return true; }
      if(a === 'add-debug-coins'){ earn(10000, 'Тестовое начисление'); return true; }
      if(a === 'install-pwa'){ installPWA(); return true; }
      if(a === 'show-ios'){ showIOSGuide(); return true; }
      return false;
    };

    let touchMoved = false;
    let sx = 0, sy = 0, last = 0;
    document.addEventListener('touchstart', e => {
      const t = e.changedTouches && e.changedTouches[0];
      if(t){ sx = t.clientX; sy = t.clientY; }
      touchMoved = false;
    }, {passive:true, capture:true});
    document.addEventListener('touchmove', e => {
      const t = e.changedTouches && e.changedTouches[0];
      if(t && (Math.abs(t.clientX - sx) > 12 || Math.abs(t.clientY - sy) > 12)) touchMoved = true;
    }, {passive:true, capture:true});
    document.addEventListener('touchend', e => {
      if(touchMoved) return;
      let el = e.target && e.target.closest ? e.target.closest(selector) : null;
      if(!el){
        const t = e.changedTouches && e.changedTouches[0];
        if(t){
          const hit = document.elementFromPoint(t.clientX, t.clientY);
          el = hit && hit.closest ? hit.closest(selector) : null;
        }
      }
      if(!el) return;
      const now = Date.now();
      if(now - last < 300) return;
      last = now;
      e.preventDefault();
      e.stopPropagation();
      el.__tapBridgeAt = now;
      run(el);
    }, {passive:false, capture:true});

    // Ensure closed overlays never capture taps.
    const unlock = () => {
      const bd = document.querySelector('.menu-backdrop');
      if(bd && !document.body.classList.contains('nav-open')) bd.style.pointerEvents = 'none';
      document.querySelectorAll('.modal:not(.show)').forEach(m => m.style.pointerEvents = 'none');
      document.querySelectorAll('.modal.show').forEach(m => m.style.pointerEvents = 'auto');
    };
    unlock();
    setInterval(unlock, 800);
  }

  let deferredInstallPrompt = null;
  function initInstallPrompt(){
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; $$('.js-install-ready').forEach(x=>x.textContent='Готово к установке'); });
  }
  function registerServiceWorker(){ return; }
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
      document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="iosGuideModal"><div class="modal-card"><div class="modal-head"><h3>Как добавить на экран iPhone</h3><button class="close" data-close-modal>×</button></div><div class="modal-body"><div class="panel"><ol class="steps"><li>Открой сайт именно в <b>Safari</b>, не во встроенном браузере мессенджера.</li><li>Нажми кнопку <b>«Поделиться»</b> ⬆︎ внизу Safari.</li><li>Прокрути меню и выбери <b>«На экран Домой»</b>.</li><li>Нажми <b>«Добавить»</b>. Иконка появится как обычное приложение.</li><li>После первого запуска из иконки зайди в <b>Профиль</b> и проверь статус сохранения.</li></ol><p>В standalone-режиме iOS сайт использует safe-area: элементы не залезают под Dynamic Island/чёлку и нижнюю домашнюю полоску.</p></div></div></div></div>`);
      modal = $('#iosGuideModal');
    }
    openModal(modal);
  }
  function renderInstall(){
    const root = $('#installRoot'); if(!root) return;
    const ios = isIOSDevice();
    const standalone = isStandaloneMode();
    root.innerHTML = `<div class="grid cards-2 install-grid"><article class="panel install-card"><span class="kicker">Windows / Chrome / Edge</span><h2>Установить как приложение</h2><p>На GitHub Pages сайт работает как обычная статическая PWA: достаточно залить файлы в репозиторий. Никакие .bat, database-файлы и сервер не нужны.</p><button class="btn primary huge" data-action="install-pwa">Установить на Windows</button><p class="small js-install-ready">Если кнопка не появилась: меню браузера → «Установить приложение».</p></article><article class="panel install-card ${ios?'ios-device':''}"><span class="kicker">iPhone / iPad</span><h2>${standalone?'Открыто как приложение':'Добавить на экран Домой'}</h2><p>${standalone?'Сайт уже запущен в standalone-режиме iOS. Нижняя панель Safari скрыта, safe-area активна.':'Открой сайт именно в Safari: кнопка «Поделиться» → «На экран Домой». После установки будет полноэкранный режим с iOS-иконкой.'}</p><button class="btn blue huge" data-action="show-ios">Показать инструкцию iOS</button><div class="ios-mini-guide"><b>Быстро:</b> Safari → ⬆︎ Поделиться → На экран Домой → Добавить</div></article></div><div class="notice block ios-notice"><b>GitHub Pages v31:</b> чистая статическая сборка без .bat и архивов для Windows. Save хранится только в браузере пользователя через localStorage/IndexedDB, без внешней базы данных.</div>`;
  }


  function bpState(){ state.battlePass = normalizeBattlePass(state.battlePass); return state.battlePass; }
  function bpCaseGroup(c){
    const idv = String(c && c.id || '').toLowerCase();
    const name = String(c && c.name || '').toLowerCase();
    if(/stickers-|sticker|capsule/.test(idv + ' ' + name)) return 'stickers';
    if(/special-|knife|glove/.test(idv + ' ' + name)) return 'special';
    if(/collection|limited|armory/.test(String(c && c.kind || '') + ' ' + name)) return 'limited';
    if(/quality-|consumer|industrial|milspec|restricted|classified|covert/.test(idv)) return 'quality';
    if(/agents|charms|patches|collectibles/.test(idv)) return 'extras';
    return 'classic';
  }
  function bpRarityClass(it){
    const r = rarityBucket(it && it.rarity || 'Mil-Spec Grade');
    if(['Covert','Rare Special','Contraband','Exceedingly Rare','Extraordinary'].includes(r)) return 'redOrGold';
    if(['Classified','Superior','Master'].includes(r)) return 'pinkPlus';
    if(['Restricted','Exceptional'].includes(r)) return 'purplePlus';
    return r;
  }
  function bpFindCase(words, fallback=0){
    const arr = Array.isArray(words) ? words : [words];
    const found = catalog.cases.find(c => arr.some(w => String(c.name).toLowerCase().includes(String(w).toLowerCase())));
    return found || catalog.cases[fallback % Math.max(1,catalog.cases.length)] || fallbackCases[0];
  }
  function bpReqTitle(req){
    const unit = req.unit || 'раз';
    if(req.type === 'openAny') return `Открыть любые кейсы: ${req.need} ${unit}`;
    if(req.type === 'openCase') return `Открыть ${req.caseName || 'заданный кейс'}: ${req.need} ${unit}`;
    if(req.type === 'openGroup') return `Открыть раздел «${req.groupName || req.group}»: ${req.need} ${unit}`;
    if(req.type === 'fastOpen') return `Сделать быстрые открытия: ${req.need} ${unit}`;
    if(req.type === 'multiOpen') return `Открыть кейсы через x3/x5/x10: ${req.need} ${unit}`;
    if(req.type === 'spendCases') return `Потратить на кейсы: ${fmt(req.need)}`;
    if(req.type === 'dropRarity') return `Выбить ${req.label || req.rarity}: ${req.need} ${unit}`;
    if(req.type === 'sellValue') return `Продать предметов на сумму: ${fmt(req.need)}`;
    if(req.type === 'upgradeTry') return `Сделать апгрейды: ${req.need} ${unit}`;
    if(req.type === 'upgradeSuccess') return `Выиграть апгрейды: ${req.need} ${unit}`;
    if(req.type === 'contract') return `Собрать контракты: ${req.need} ${unit}`;
    if(req.type === 'battlePlay') return `Сыграть Case Battle: ${req.need} ${unit}`;
    if(req.type === 'battleWin') return `Победить в Case Battle: ${req.need} ${unit}`;
    if(req.type === 'minesPlay') return `Сыграть в сапёр на скины: ${req.need} ${unit}`;
    if(req.type === 'minesWin') return `Выиграть в сапёре: ${req.need} ${unit}`;
    if(req.type === 'wheel') return `Прокрутить бонусное колесо: ${req.need} ${unit}`;
    if(req.type === 'ad') return `Просмотреть рекламу проектов: ${req.need} ${unit}`;
    return req.title || `Задание: ${req.need}`;
  }
  function bpMissionForLevel(level){
    const names = ['Kilowatt','Revolution','Recoil','Dreams','Fracture','Clutch','Prisma','Spectrum','Riptide','Snakebite','Horizon','Gamma','Danger Zone','CS20','Glove','Chroma','Falchion','Huntsman','Phoenix','Fever','Gallery'];
    const c = bpFindCase(names[(level-1) % names.length], level);
    const groupCycle = [
      ['classic','Классические'],['limited','Лимитированная серия'],['quality','Кейсы по качеству'],['stickers','Наклейки'],['special','Ножи и перчатки'],['extras','Агенты и другое']
    ];
    const g = groupCycle[(level-1) % groupCycle.length];
    const stage = Math.floor((level-1)/10);
    const hard = 1 + stage * 0.55;
    const mod = level % 10;
    let reqs;
    if(level === 1) reqs = [{type:'openAny', need:8, unit:'открытий'}];
    else if(level === 25) reqs = [{type:'battleWin', need:4, unit:'победы'}];
    else if(level === 50) reqs = [{type:'dropRarity', rarity:'pinkPlus', label:'Classified/розовые или выше', need:10, unit:'дропов'}];
    else if(level === 75) reqs = [{type:'spendCases', need:180000, unit:'₽'}];
    else if(level === 100) reqs = [
      {type:'openGroup', group:'special', groupName:'Ножи и перчатки', need:45, unit:'открытий'},
      {type:'battleWin', need:10, unit:'побед'},
      {type:'dropRarity', rarity:'redOrGold', label:'красные/золотые дропы', need:6, unit:'дропов'},
      {type:'contract', need:8, unit:'контрактов'}
    ];
    else if(mod === 1) reqs = [{type:'openCase', caseId:c.id, caseName:c.name, need:Math.round(4 + level*.9*hard), unit:'открытий'}];
    else if(mod === 2) reqs = [{type:'openGroup', group:g[0], groupName:g[1], need:Math.round(7 + level*.75*hard), unit:'открытий'}];
    else if(mod === 3) reqs = [{type:'fastOpen', need:Math.round(8 + level*.55*hard), unit:'быстрых открытий'}];
    else if(mod === 4) reqs = [{type:'dropRarity', rarity: stage>=5 ? 'redOrGold' : (stage>=2 ? 'pinkPlus' : 'purplePlus'), label: stage>=5 ? 'красные/золотые дропы' : (stage>=2 ? 'розовые или выше' : 'фиолетовые или выше'), need:Math.round(2 + stage*1.6), unit:'дропов'}];
    else if(mod === 5) reqs = [{type:'sellValue', need:Math.round(4500 + level*1300*hard), unit:'₽'}];
    else if(mod === 6) reqs = [{type:'upgradeTry', need:Math.round(1 + stage*.9), unit:'апгрейдов'}];
    else if(mod === 7) reqs = [{type:'battlePlay', need:Math.round(2 + stage*.8), unit:'баттлов'}];
    else if(mod === 8) reqs = [{type:'multiOpen', need:Math.round(9 + level*.5*hard), unit:'открытий'}];
    else if(mod === 9) reqs = [{type: stage >= 3 ? 'minesWin' : 'minesPlay', need:Math.max(1, Math.round(1 + stage*.35)), unit: stage >= 3 ? 'побед' : 'игр'}];
    else reqs = [{type:'contract', need:Math.max(1, Math.round(1 + stage*.5)), unit:'контрактов'}];
    const chapter = stage < 2 ? 'Разведка' : stage < 4 ? 'Арсенал' : stage < 6 ? 'Красная зона' : stage < 8 ? 'Охота за легендой' : 'Драконий контракт';
    return {level, title:`Уровень ${level}: ${chapter}`, reqs, reward:bpRewardForLevel(level)};
  }
  function bpRewardForLevel(level){
    if(level === 100) return {type:'finalCase', label:'Dragon Hoard Case', text:'AWP | Gungnir / AWP | Dragon Lore / Katowice 2014'};
    if(level % 25 === 0) return {type:'item', tier:'legend', label:'Легендарный предмет', text:'дорогой красный/золотой приз'};
    if(level % 10 === 0) return {type:'case', tier:'premium', label:'Премиум pass-кейс', text:'один предмет из дорогого пула'};
    if(level % 7 === 0) return {type:'promo', amount:Math.round(3500 + level*260), label:'Промокод pass'};
    if(level % 3 === 0) return {type:'item', tier:'mid', label:'Случайный предмет'};
    return {type:'coins', amount:Math.round(1200 + level*180), label:'Баланс'};
  }
  function bpReqKey(req, idx){ return `${idx}:${req.type}:${req.caseId||req.group||req.rarity||''}`; }
  function bpMissionProgress(m){
    const bp = bpState();
    if(!bp.current || bp.current.level !== m.level) bp.current = {level:m.level, counts:{}};
    return m.reqs.map((req,idx) => {
      const key = bpReqKey(req, idx);
      const got = Math.max(0, Math.round(toNum(bp.current.counts[key],0)));
      const need = Math.max(1, Math.round(toNum(req.need,1)));
      return {req, key, got, need, pct:clamp(got / need * 100, 0, 100), done:got >= need};
    });
  }
  function bpMissionDone(m){ return bpMissionProgress(m).every(x=>x.done); }
  function bpAddToReq(req, payload, event){
    if(event === 'case_open'){
      const c = payload.case || {};
      const count = Math.max(1, Math.round(toNum(payload.count,1)));
      const drops = Array.isArray(payload.drops) ? payload.drops : [];
      if(req.type === 'openAny') return count;
      if(req.type === 'openCase' && req.caseId === c.id) return count;
      if(req.type === 'openGroup' && req.group === bpCaseGroup(c)) return count;
      if(req.type === 'fastOpen' && payload.fast) return count;
      if(req.type === 'multiOpen' && count >= 3) return count;
      if(req.type === 'spendCases') return Math.max(0, Math.round(toNum(payload.totalCost,0)));
      if(req.type === 'dropRarity') return drops.filter(d => bpRarityClass(d) === req.rarity || (req.rarity === 'purplePlus' && ['purplePlus','pinkPlus','redOrGold'].includes(bpRarityClass(d))) || (req.rarity === 'pinkPlus' && ['pinkPlus','redOrGold'].includes(bpRarityClass(d)))).length;
    }
    if(event === 'sell'){
      if(req.type === 'sellValue') return Math.max(0, Math.round(toNum(payload.value,0)));
    }
    if(event === 'upgrade'){
      if(req.type === 'upgradeTry') return 1;
      if(req.type === 'upgradeSuccess' && payload.success) return 1;
    }
    if(event === 'contract' && req.type === 'contract') return 1;
    if(event === 'battle'){
      if(req.type === 'battlePlay') return 1;
      if(req.type === 'battleWin' && payload.won) return 1;
    }
    if(event === 'mines'){
      if(req.type === 'minesPlay') return 1;
      if(req.type === 'minesWin' && payload.won) return 1;
    }
    if(event === 'wheel' && req.type === 'wheel') return 1;
    if(event === 'ad' && req.type === 'ad') return 1;
    return 0;
  }
  function bpEvent(event, payload={}){
    const bp = bpState();
    if(bp.active && bp.level < BATTLE_PASS_MAX_LEVEL){
      const level = bp.level + 1;
      const m = bpMissionForLevel(level);
      if(!bp.current || bp.current.level !== level) bp.current = {level, counts:{}};
      let changed = false;
      m.reqs.forEach((req,idx)=>{
        const add = bpAddToReq(req,payload,event);
        if(add > 0){ const key = bpReqKey(req,idx); bp.current.counts[key] = Math.min(Math.round(toNum(req.need,1)), Math.round(toNum(bp.current.counts[key],0) + add)); changed = true; }
      });
      if(changed){ save(); if((document.body.dataset.page || '') === 'battle-pass') renderBattlePass(); }
    }
    seasonalPassEvent(event, payload);
    dailyAdd(event, payload);
    teamEventAdd(event, payload);
  }
  function activateBattlePass(){
    const bp = bpState();
    if(bp.active) return toast('Battle-pass уже активирован','warn');
    if(!spend(BATTLE_PASS_PRICE, 'Активация Battle-pass')) return;
    state.battlePass = {active:true, level:0, activatedAt:Date.now(), current:{level:1, counts:{}}, rewards:[], vouchers:[]};
    save();
    toast('Battle-pass активирован. Прогресс идёт только после покупки.', 'good');
    renderBattlePass();
  }
  function bpRewardPool(tier){
    let pool = catalog.items.filter(Boolean);
    if(tier === 'legend') pool = pool.filter(x => toNum(x.value,0) >= 45000 || ['Covert','Exceedingly Rare','Extraordinary','Contraband'].includes(x.rarity));
    else if(tier === 'premium') pool = pool.filter(x => toNum(x.value,0) >= 12000 || ['Covert','Exceedingly Rare','Extraordinary'].includes(x.rarity));
    else pool = pool.filter(x => toNum(x.value,0) >= 700 && toNum(x.value,0) <= 16000);
    return pool.length ? pool : catalog.items;
  }
  const FIXED_PRIZE_IMAGES = Object.freeze({
    'sticker | team dignitas (holo) | katowice 2014':'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL3N0aWNrZXJzL2Vtc2thdG93aWNlMjAxNC9kaWduaXRhc19ob2xvLmFhZGE2ODQzNTgwMGI0YjRjZmIyZWYyOTlhYmY3ZjgxYWM1Y2ExMjcucG5n/auto/auto/85/notrim/13a12251bc42a5ed67eda770c9fced71.webp'
  });
  function bpFindPrize(name, rarity='Covert', value=50000, category='skin'){
    const low = name.toLowerCase();
    let found = catalog.items.find(x => String(x.name||'').toLowerCase().includes(low));
    if(!found && /operation pass/.test(low)) found = catalog.items.find(x => /operation .*pass|access pass/i.test(String(x.name||'')));
    if(!found && /viewer pass/.test(low)) found = catalog.items.find(x => /viewer pass/i.test(String(x.name||'')));
    const fixed = FIXED_PRIZE_IMAGES[low] || '';
    const image = fixed || realImageUrl(found && found.image) || svgSkin(name,'#facc15','#ef4444');
    return Object.assign({id:'bp-prize-'+slug(name), name, rarity, rarityColor:rarityColors[rarity]||'#ffd700', value, category, image, weight:1}, found || {}, {name:(found && found.name) || name, value:(found && found.value && found.value > value*.4) ? found.value : value, image});
  }
  function bpFinalPool(){
    return [
      bpFindPrize('AWP | Gungnir','Covert',870000,'skin'),
      bpFindPrize('AWP | Dragon Lore','Covert',1120000,'skin'),
      bpFindPrize('Sticker | iBUYPOWER (Holo) | Katowice 2014','Extraordinary',860000,'sticker'),
      bpFindPrize('Sticker | Titan (Holo) | Katowice 2014','Extraordinary',520000,'sticker'),
      bpFindPrize('Sticker | Reason Gaming (Holo) | Katowice 2014','Extraordinary',250000,'sticker'),
      bpFindPrize('Sticker | Team Dignitas (Holo) | Katowice 2014','Extraordinary',180000,'sticker')
    ];
  }
  function bpApplyReward(level, reward){
    let label = reward.label || 'Приз';
    let item = null;
    if(reward.type === 'coins'){
      earn(reward.amount, `Battle-pass уровень ${level}`);
      label = `${fmt(reward.amount)} на баланс`;
    }else if(reward.type === 'promo'){
      const code = `BP${String(level).padStart(3,'0')}${Math.floor(1000 + stableNoise(Date.now()+':'+level)*9000)}`;
      const bp = bpState(); bp.vouchers.unshift({code, amount:reward.amount, level, time:Date.now()});
      earn(reward.amount, `Battle-pass промокод ${code}`);
      label = `Промокод ${code} на ${fmt(reward.amount)}`;
    }else if(reward.type === 'item'){
      item = addItem(sample(bpRewardPool(reward.tier)), `battle-pass lvl ${level}`);
      addLive('Ты', item);
      label = item.displayName || item.name;
    }else if(reward.type === 'case'){
      item = addItem(sample(bpRewardPool('premium')), `premium pass-case lvl ${level}`);
      addLive('Ты', item);
      label = `Премиум pass-кейс: ${item.displayName || item.name}`;
    }else if(reward.type === 'finalCase'){
      item = addItem(sample(bpFinalPool()), 'Dragon Hoard Final Case');
      addLive('Ты', item);
      label = `Dragon Hoard Case: ${item.displayName || item.name}`;
    }
    return {label, item};
  }
  function claimBattlePassReward(){
    const bp = bpState();
    if(!bp.active) return toast('Сначала активируй Battle-pass','bad');
    if(bp.level >= BATTLE_PASS_MAX_LEVEL) return toast('Battle-pass уже завершён','good');
    const level = bp.level + 1;
    const m = bpMissionForLevel(level);
    if(!bpMissionDone(m)) return toast('Задание уровня ещё не выполнено','warn');
    const res = bpApplyReward(level, m.reward);
    bp.level = level;
    bp.current = {level:Math.min(BATTLE_PASS_MAX_LEVEL, level + 1), counts:{}};
    bp.rewards.unshift({level, label:res.label, time:Date.now()});
    state.battlePass = bp;
    save();
    if(res.item) showDrop(res.item,null); else toast(`Уровень ${level}: ${res.label}`, 'good');
    renderBattlePass();
  }
  function bpRewardLabel(r){
    if(r.type === 'coins') return `${fmt(r.amount)} на баланс`;
    if(r.type === 'promo') return `Промокод на ${fmt(r.amount)}`;
    return r.text || r.label;
  }
  function renderBattlePass(){
    const root = $('#battlePassRoot'); if(!root) return;
    const bp = bpState();
    const level = bp.level || 0;
    const currentLevel = Math.min(BATTLE_PASS_MAX_LEVEL, level + 1);
    const mission = bpMissionForLevel(currentLevel);
    const progress = bpMissionProgress(mission);
    const done = bp.active && level < BATTLE_PASS_MAX_LEVEL && progress.every(x=>x.done);
    const totalPct = clamp(level / BATTLE_PASS_MAX_LEVEL * 100, 0, 100);
    const finalPool = bpFinalPool();
    const missionHtml = level >= BATTLE_PASS_MAX_LEVEL ? `<div class="bp-current done"><h2>Пасс завершён</h2><p>Все 100 уровней закрыты. Финальный Dragon Hoard Case уже выдан.</p></div>` : `<div class="bp-current"><div class="bp-current-head"><span class="kicker">Текущее задание</span><h2>${esc(mission.title)}</h2><p>Награда: <b>${esc(bpRewardLabel(mission.reward))}</b></p></div><div class="bp-reqs">${progress.map(x=>`<div class="bp-req"><div><b>${esc(bpReqTitle(x.req))}</b><small>${Math.min(x.got,x.need).toLocaleString('ru-RU')} / ${x.need.toLocaleString('ru-RU')}</small></div><div class="bp-bar"><span style="width:${x.pct}%"></span></div></div>`).join('')}</div><button class="btn primary huge" data-action="claim-battle-pass" ${done?'':'disabled'}>${done?'Забрать награду':'Задание не выполнено'}</button></div>`;
    const levels = Array.from({length:BATTLE_PASS_MAX_LEVEL},(_,i)=>i+1).map(l=>{ const r=bpRewardForLevel(l); return `<div class="bp-node ${l<=level?'claimed':l===currentLevel?'current':'locked'}" title="Уровень ${l}: ${esc(bpRewardLabel(r))}"><b>${l}</b><span>${r.type==='finalCase'?'🐉':r.type==='promo'?'CODE':r.type==='coins'?CURRENCY_OPTIONS[activeCurrency()].label:r.type==='case'?'CASE':'ITEM'}</span></div>`; }).join('');
    root.innerHTML = `<section class="bp-hero"><div><span class="kicker">Dragon Hoard Battle-pass</span><h2>100 уровней охоты за древним дропом</h2><p>Сложный статический pass для GitHub Pages: задания идут последовательно после активации. Нужно открывать конкретные кейсы, играть battle, делать контракты, ловить редкие дропы и тратить баланс.</p><div class="bp-price">Активация: <b>${fmt(BATTLE_PASS_PRICE)}</b></div>${bp.active?'<span class="bp-status good">Активирован</span>':`<button class="btn primary huge" data-action="activate-battle-pass">Активировать за ${fmt(BATTLE_PASS_PRICE)}</button>`}</div><div class="bp-final"><h3>Финал 100 уровня</h3><p>Dragon Hoard Case гарантированно выдаёт один из трофеев:</p><div class="bp-final-grid">${finalPool.map(x=>`<div>${itemImageOrPlaceholder(x,'CS2')}<b>${esc(x.name)}</b><small>${fmt(x.value)}</small></div>`).join('')}</div></div></section><section class="panel bp-progress-panel"><div class="head"><div><h2>Прогресс: ${level}/${BATTLE_PASS_MAX_LEVEL}</h2><p>${bp.active ? 'Прогресс учитывается только после покупки pass.' : 'Пасс ещё не активирован, задания не засчитываются.'}</p></div><b>${Math.round(totalPct)}%</b></div><div class="bp-bar big"><span style="width:${totalPct}%"></span></div></section>${missionHtml}<section class="block"><div class="head"><div><h2>Карта уровней</h2><p>Каждый уровень даёт предмет, pass-кейс, промокод или баланс. 25/50/75/100 — усиленные контрольные призы.</p></div></div><div class="bp-level-grid">${levels}</div></section><section class="grid cards-2 block"><article class="panel"><h3>Последние награды</h3><div class="bp-history">${bp.rewards.length ? bp.rewards.slice(0,12).map(x=>`<div><b>Уровень ${x.level}</b><span>${esc(x.label)}</span><small>${new Date(x.time).toLocaleString('ru-RU')}</small></div>`).join('') : '<p class="small">Пока наград нет.</p>'}</div></article><article class="panel"><h3>Полученные pass-промокоды</h3><div class="promo-used">${bp.vouchers.length ? bp.vouchers.slice(0,20).map(x=>`<span class="pill">${esc(x.code)} · ${fmt(x.amount)}</span>`).join('') : '<p class="small">Промокоды появятся на уровнях 7, 14, 21...</p>'}</div></article></section>`;
  }


  function seasonalMissionForLevel(level){
    const names = ['Kilowatt','Revolution','Recoil','Dreams','Fracture','Snakebite','Clutch','Prisma','Spectrum','CS20','Fever','Gallery'];
    const c = bpFindCase(names[(level-1) % names.length], level);
    const groups = [
      ['classic','Классические'],['stickers','Наклейки'],['quality','Кейсы по качеству'],['limited','Лимитированная серия'],['extras','Агенты и другое'],['special','Ножи и перчатки']
    ];
    const g = groups[(level-1) % groups.length];
    const stage = Math.floor((level-1)/5);
    const mod = level % 6;
    let reqs;
    if(level === 1) reqs = [{type:'openAny', need:2, unit:'открытия'}];
    else if(level === 5) reqs = [{type:'openCase', caseId:c.id, caseName:c.name, need:5, unit:'открытий'}];
    else if(level === 10) reqs = [{type:'dropRarity', rarity:'purplePlus', label:'фиолетовый или выше', need:2, unit:'дропа'}];
    else if(level === 15) reqs = [{type:'sellValue', need:6500, unit:'₽'}];
    else if(level === 20) reqs = [{type:'battlePlay', need:3, unit:'баттла'}];
    else if(level === 25) reqs = [{type:'contract', need:2, unit:'контракта'}];
    else if(level === 30) reqs = [
      {type:'openGroup', group:'stickers', groupName:'Наклейки', need:10, unit:'открытий'},
      {type:'dropRarity', rarity:'pinkPlus', label:'розовый или выше', need:2, unit:'дропа'},
      {type:'upgradeTry', need:2, unit:'апгрейда'}
    ];
    else if(mod === 1) reqs = [{type:'openGroup', group:g[0], groupName:g[1], need:Math.round(3 + stage*1.5), unit:'открытий'}];
    else if(mod === 2) reqs = [{type:'fastOpen', need:Math.round(3 + stage), unit:'быстрых открытий'}];
    else if(mod === 3) reqs = [{type:'minesPlay', need:1, unit:'игра'}];
    else if(mod === 4) reqs = [{type:'openCase', caseId:c.id, caseName:c.name, need:Math.round(3 + stage*1.4), unit:'открытий'}];
    else if(mod === 5) reqs = [{type:'upgradeTry', need:1 + Math.floor(stage/2), unit:'апгрейд'}];
    else reqs = [{type:'sellValue', need:Math.round(1500 + stage*1600), unit:'₽'}];
    const chapter = stage < 2 ? 'Старт сезона' : stage < 4 ? 'Летний контракт' : stage < 5 ? 'Охота за наклейками' : 'Финальный рывок';
    return {level, title:`Сезонный уровень ${level}: ${chapter}`, reqs, reward:seasonalRewardForLevel(level)};
  }
  function seasonalRewardForLevel(level){
    if(level === 30) return {type:'seasonalCase', label:'Season Final Case', text:'финальный сезонный кейс'};
    if(level % 10 === 0) return {type:'item', tier:'premium', label:'Сильный сезонный предмет', text:'дорогой, но без легендарного финала'};
    if(level % 5 === 0) return {type:'case', tier:'mid', label:'Season Drop Case', text:'случайный предмет среднего пула'};
    if(level % 4 === 0) return {type:'promo', amount:Math.round(900 + level*120), label:'Сезонный промокод'};
    if(level % 3 === 0) return {type:'item', tier:'seasonal', label:'Сезонный предмет'};
    return {type:'coins', amount:Math.round(500 + level*90), label:'Баланс'};
  }
  function seasonalMissionProgress(m){
    const sp = seasonalPassState();
    if(!sp.current || sp.current.level !== m.level) sp.current = {level:m.level, counts:{}};
    return m.reqs.map((req,idx) => {
      const key = bpReqKey(req, idx);
      const got = Math.max(0, Math.round(toNum(sp.current.counts[key],0)));
      const need = Math.max(1, Math.round(toNum(req.need,1)));
      return {req, key, got, need, pct:clamp(got / need * 100, 0, 100), done:got >= need};
    });
  }
  function seasonalMissionDone(m){ return seasonalMissionProgress(m).every(x=>x.done); }
  function seasonalPassEvent(event, payload={}){
    const sp = seasonalPassState();
    if(!seasonalPassAvailable(sp) || !sp.active || sp.level >= SEASONAL_PASS_MAX_LEVEL) return;
    const level = sp.level + 1;
    const m = seasonalMissionForLevel(level);
    if(!sp.current || sp.current.level !== level) sp.current = {level, counts:{}};
    let changed = false;
    m.reqs.forEach((req,idx)=>{
      const add = bpAddToReq(req,payload,event);
      if(add > 0){ const key = bpReqKey(req,idx); sp.current.counts[key] = Math.min(Math.round(toNum(req.need,1)), Math.round(toNum(sp.current.counts[key],0) + add)); changed = true; }
    });
    if(changed){ save(); if((document.body.dataset.page || '') === 'seasonal-pass') renderSeasonalPass(); }
  }
  function seasonalRewardPool(tier){
    let pool = catalog.items.filter(Boolean);
    if(tier === 'premium') pool = pool.filter(x => toNum(x.value,0) >= 3500 && toNum(x.value,0) <= 45000);
    else if(tier === 'mid') pool = pool.filter(x => toNum(x.value,0) >= 900 && toNum(x.value,0) <= 18000);
    else pool = pool.filter(x => toNum(x.value,0) >= 350 && toNum(x.value,0) <= 9000);
    return pool.length ? pool : catalog.items;
  }
  function seasonalFinalPool(){
    return [
      bpFindPrize('AK-47 | Redline','Classified',5200,'skin'),
      bpFindPrize('M4A1-S | Printstream','Covert',14500,'skin'),
      bpFindPrize('AWP | Hyper Beast','Covert',12500,'skin'),
      bpFindPrize('Sticker | Crown (Foil)','Extraordinary',36000,'sticker'),
      bpFindPrize('Sticker | Titan | Katowice 2014','High Grade',65000,'sticker'),
      bpFindPrize('Operation Pass','High Grade',2500,'collectible')
    ];
  }
  function seasonalApplyReward(level, reward){
    let label = reward.label || 'Сезонный приз';
    let item = null;
    if(reward.type === 'coins'){
      earn(reward.amount, `Season pass уровень ${level}`);
      label = `${fmt(reward.amount)} на баланс`;
    }else if(reward.type === 'promo'){
      const code = `SP${String(level).padStart(2,'0')}${Math.floor(1000 + stableNoise(Date.now()+':season:'+level)*9000)}`;
      const sp = seasonalPassState(); sp.vouchers.unshift({code, amount:reward.amount, level, time:Date.now()});
      earn(reward.amount, `Season pass промокод ${code}`);
      label = `Промокод ${code} на ${fmt(reward.amount)}`;
    }else if(reward.type === 'item'){
      item = addItem(sample(seasonalRewardPool(reward.tier)), `season-pass lvl ${level}`);
      addLive('Ты', item);
      label = item.displayName || item.name;
    }else if(reward.type === 'case'){
      item = addItem(sample(seasonalRewardPool('mid')), `season drop-case lvl ${level}`);
      addLive('Ты', item);
      label = `Season Drop Case: ${item.displayName || item.name}`;
    }else if(reward.type === 'seasonalCase'){
      item = addItem(sample(seasonalFinalPool()), 'Season Final Case');
      addLive('Ты', item);
      label = `Season Final Case: ${item.displayName || item.name}`;
    }
    return {label, item};
  }
  function activateSeasonalPass(){
    const sp = seasonalPassState();
    if(!seasonalPassAvailable(sp)) return toast('Сезон завершён — вкладка больше недоступна','bad');
    if(sp.active) return toast('Сезонный pass уже активирован','warn');
    if(!spend(SEASONAL_PASS_PRICE, 'Активация Seasonal battle-pass')) return;
    state.seasonalPass = Object.assign(sp, {active:true, level:0, activatedAt:Date.now(), current:{level:1, counts:{}}, rewards:[], vouchers:[]});
    save();
    toast('Сезонный battle-pass активирован на 30 уровней.', 'good');
    renderSeasonalPass();
  }
  function claimSeasonalPassReward(){
    const sp = seasonalPassState();
    if(!seasonalPassAvailable(sp)) return toast('Сезон завершён','bad');
    if(!sp.active) return toast('Сначала активируй сезонный pass','bad');
    if(sp.level >= SEASONAL_PASS_MAX_LEVEL) return toast('Сезонный pass уже завершён','good');
    const level = sp.level + 1;
    const m = seasonalMissionForLevel(level);
    if(!seasonalMissionDone(m)) return toast('Сезонное задание ещё не выполнено','warn');
    const res = seasonalApplyReward(level, m.reward);
    sp.level = level;
    sp.current = {level:Math.min(SEASONAL_PASS_MAX_LEVEL, level + 1), counts:{}};
    sp.rewards.unshift({level, label:res.label, time:Date.now()});
    state.seasonalPass = sp;
    save();
    if(res.item) showDrop(res.item,null); else toast(`Season ${level}: ${res.label}`, 'good');
    renderSeasonalPass();
  }
  function renderSeasonalPass(){
    const root = $('#seasonalPassRoot'); if(!root) return;
    const sp = seasonalPassState();
    if(!seasonalPassAvailable(sp)){
      updateSeasonalNavLinks();
      root.innerHTML = `<section class="panel bp-expired"><span class="kicker">Season ended</span><h2>Сезонный battle-pass завершён</h2><p>30 дней истекли. Вкладка скрывается из меню, а новые задания и награды больше недоступны.</p><a class="btn primary" href="battle-pass.html">Перейти в основной Battle-pass</a></section>`;
      return;
    }
    const level = sp.level || 0;
    const currentLevel = Math.min(SEASONAL_PASS_MAX_LEVEL, level + 1);
    const mission = seasonalMissionForLevel(currentLevel);
    const progress = seasonalMissionProgress(mission);
    const done = sp.active && level < SEASONAL_PASS_MAX_LEVEL && progress.every(x=>x.done);
    const totalPct = clamp(level / SEASONAL_PASS_MAX_LEVEL * 100, 0, 100);
    const finalPool = seasonalFinalPool();
    const missionHtml = level >= SEASONAL_PASS_MAX_LEVEL ? `<div class="bp-current done"><h2>Сезонный pass завершён</h2><p>Все 30 уровней закрыты. Финальный сезонный кейс уже выдан.</p></div>` : `<div class="bp-current seasonal"><div class="bp-current-head"><span class="kicker">Текущее сезонное задание</span><h2>${esc(mission.title)}</h2><p>Награда: <b>${esc(bpRewardLabel(mission.reward))}</b></p></div><div class="bp-reqs">${progress.map(x=>`<div class="bp-req"><div><b>${esc(bpReqTitle(x.req))}</b><small>${Math.min(x.got,x.need).toLocaleString('ru-RU')} / ${x.need.toLocaleString('ru-RU')}</small></div><div class="bp-bar"><span style="width:${x.pct}%"></span></div></div>`).join('')}</div><button class="btn primary huge" data-action="claim-seasonal-pass" ${done?'':'disabled'}>${done?'Забрать награду':'Задание не выполнено'}</button></div>`;
    const levels = Array.from({length:SEASONAL_PASS_MAX_LEVEL},(_,i)=>i+1).map(l=>{ const r=seasonalRewardForLevel(l); return `<div class="bp-node seasonal ${l<=level?'claimed':l===currentLevel?'current':'locked'}" title="Уровень ${l}: ${esc(bpRewardLabel(r))}"><b>${l}</b><span>${r.type==='seasonalCase'?'☀️':r.type==='promo'?'CODE':r.type==='coins'?CURRENCY_OPTIONS[activeCurrency()].label:r.type==='case'?'CASE':'ITEM'}</span></div>`; }).join('');
    root.innerHTML = `<section class="bp-hero seasonal-hero"><div><span class="kicker">Limited Seasonal Battle-pass</span><h2>Сезон «Dragon Heat» — 30 уровней</h2><p>Лимитированная вкладка на 30 дней: задания проще основного pass, награды скромнее, финал — сезонный кейс без гарантированных Gungnir/Dragon Lore.</p><div class="bp-price">Активация: <b>${fmt(SEASONAL_PASS_PRICE,'USD')}</b> / ${fmt(SEASONAL_PASS_PRICE)}</div><div class="season-timer">До скрытия вкладки: <b>${esc(seasonalTimeLeftText())}</b></div>${sp.active?'<span class="bp-status good">Активирован</span>':`<button class="btn primary huge" data-action="activate-seasonal-pass">Активировать за ${fmt(SEASONAL_PASS_PRICE,'USD')}</button>`}</div><div class="bp-final"><h3>Финал 30 уровня</h3><p>Season Final Case выдаёт один из сезонных трофеев:</p><div class="bp-final-grid">${finalPool.map(x=>`<div>${itemImageOrPlaceholder(x,'CS2')}<b>${esc(x.name)}</b><small>${fmt(x.value)}</small></div>`).join('')}</div></div></section><section class="panel bp-progress-panel"><div class="head"><div><h2>Прогресс: ${level}/${SEASONAL_PASS_MAX_LEVEL}</h2><p>${sp.active ? 'Прогресс учитывается только после покупки сезонного pass.' : 'Pass ещё не активирован, задания не засчитываются.'}</p></div><b>${Math.round(totalPct)}%</b></div><div class="bp-bar big"><span style="width:${totalPct}%"></span></div></section>${missionHtml}<section class="block"><div class="head"><div><h2>Карта сезонных уровней</h2><p>30 уровней: баланс, предметы, pass-промокоды и сезонные drop-кейсы. 10/20/30 — усиленные призы.</p></div></div><div class="bp-level-grid seasonal-grid">${levels}</div></section><section class="grid cards-2 block"><article class="panel"><h3>Последние сезонные награды</h3><div class="bp-history">${sp.rewards.length ? sp.rewards.slice(0,12).map(x=>`<div><b>Уровень ${x.level}</b><span>${esc(x.label)}</span><small>${new Date(x.time).toLocaleString('ru-RU')}</small></div>`).join('') : '<p class="small">Пока наград нет.</p>'}</div></article><article class="panel"><h3>Сезонные промокоды</h3><div class="promo-used">${sp.vouchers.length ? sp.vouchers.slice(0,20).map(x=>`<span class="pill">${esc(x.code)} · ${fmt(x.amount)}</span>`).join('') : '<p class="small">Промокоды появятся на нескольких уровнях сезона.</p>'}</div></article></section>`;
  }


  function profilePower(){ return Math.round(toNum(state.balance,0) + state.inventory.reduce((s,x)=>s+toNum(x.value,0),0)); }
  function profileRank(){
    const power = profilePower();
    const ranks = [
      {name:'Silver I', icon:'🥈', need:0}, {name:'Silver Elite', icon:'🥈', need:50000}, {name:'Gold Nova', icon:'🥇', need:150000},
      {name:'Master Guardian', icon:'🛡️', need:400000}, {name:'Legendary Eagle', icon:'🦅', need:900000}, {name:'Supreme', icon:'💎', need:1800000}, {name:'Global Elite', icon:'🌐', need:3500000}
    ];
    let cur = ranks[0], next = ranks[1];
    for(let i=0;i<ranks.length;i++){ if(power >= ranks[i].need){ cur = ranks[i]; next = ranks[i+1] || null; } }
    const pct = next ? clamp((power-cur.need)/Math.max(1,next.need-cur.need)*100,0,100) : 100;
    return Object.assign({}, cur, {pct, nextText: next ? `До ${next.name}: ${fmt(next.need-power)}` : 'Максимальный ранг'});
  }
  function dailyDefinitions(){
    const day = DAY_KEY();
    const n = stableNoise(DAILY_CONTRACT_SEED + ':' + day);
    const cases = Math.round(4 + n*5);
    const sell = Math.round((2500 + n*4500)/100)*100;
    const variants = [
      {key:'openAny', title:'Открыть кейсы', req:{type:'openAny', need:cases, unit:'открытий'}},
      {key:'sellValue', title:'Продать предметы', req:{type:'sellValue', need:sell, unit:'₽'}},
      {key:'upgradeTry', title:'Сделать апгрейд', req:{type:'upgradeTry', need:1, unit:'раз'}},
      {key:'contract', title:'Собрать контракт', req:{type:'contract', need:1, unit:'раз'}},
      {key:'minesPlay', title:'Сыграть в сапёр', req:{type:'minesPlay', need:1, unit:'раз'}},
      {key:'battlePlay', title:'Сыграть Case Battle', req:{type:'battlePlay', need:1, unit:'раз'}}
    ];
    const start = Math.floor(n * variants.length) % variants.length;
    const tasks = [];
    for(let i=0;i<variants.length && tasks.length<3;i++) tasks.push(variants[(start+i)%variants.length]);
    if(!tasks.find(x=>x.key==='openAny')) tasks[0] = variants[0];
    return tasks;
  }
  function dailyState(){ state.dailyContracts = normalizeDailyContracts(state.dailyContracts); return state.dailyContracts; }
  function dailyProgress(task){
    const dc = dailyState(); const got = Math.max(0, Math.round(toNum(dc.counts[task.key],0))); const need = Math.max(1, Math.round(toNum(task.req.need,1)));
    return {got, need, pct:clamp(got/need*100,0,100), done:got>=need};
  }
  function dailyAdd(event,payload){
    const dc = dailyState(); if(dc.claimed) return;
    let changed=false;
    dailyDefinitions().forEach(t=>{ const add = bpAddToReq(t.req,payload,event); if(add>0){ dc.counts[t.key] = Math.min(Math.round(toNum(t.req.need,1)), Math.round(toNum(dc.counts[t.key],0)+add)); changed=true; } });
    if(changed){ state.dailyContracts=dc; save(); if((document.body.dataset.page||'')==='hub') renderHub(); }
  }
  function claimDailyContracts(){
    const dc = dailyState(); const tasks = dailyDefinitions();
    if(dc.claimed) return toast('Ежедневный контракт уже закрыт сегодня','warn');
    if(!tasks.every(t=>dailyProgress(t).done)) return toast('Закрой все 3 ежедневных задания','bad');
    dc.claimed = true; state.dailyContracts = dc;
    const bonus = DAILY_CONTRACT_REWARD + Math.round(stableNoise(DAY_KEY())*2500/100)*100;
    earn(bonus, 'Ежедневный контракт');
    const pool = catalog.items.filter(x=>toNum(x.value,0)>=600 && toNum(x.value,0)<=9000);
    if(cryptoRandom()<.35 && pool.length){ const it=addItem(sample(pool),'daily-contract'); addLive('Ты',it); showDrop(it,null); }
    save(); renderHub();
  }
  function achievementList(){ return [
    {id:'first_case', title:'Первый кейс', desc:'Открыть 1 кейс', done:()=>state.opened>=1, reward:1200},
    {id:'case_50', title:'Разогрев', desc:'Открыть 50 кейсов', done:()=>state.opened>=50, reward:6000},
    {id:'case_250', title:'Кейс-машина', desc:'Открыть 250 кейсов', done:()=>state.opened>=250, reward:18000},
    {id:'first_knife', title:'Нож в инвентаре', desc:'Получить любой нож/золотой предмет', done:()=>state.inventory.some(x=>/^★/.test(x.name||x.displayName||'') || ['Exceedingly Rare','Extraordinary'].includes(x.rarity)), reward:22000, item:true},
    {id:'contract_5', title:'Контрактник', desc:'Создать 5 контрактов', done:()=>state.contracts>=5, reward:8500},
    {id:'upgrade_10', title:'Апгрейдер', desc:'Сделать 10 апгрейдов', done:()=>state.upgrades>=10, reward:9000},
    {id:'mines_5', title:'Сапёр', desc:'Выиграть 5 игр в сапёре', done:()=>toNum(state.minesWins,0)>=5, reward:12000},
    {id:'profile_gold', title:'Gold Nova профиль', desc:'Достичь оценки профиля 150 000 ₽', done:()=>profilePower()>=150000, reward:10000},
    {id:'millionaire', title:'Миллионер инвентаря', desc:'Оценка профиля 1 000 000 ₽', done:()=>profilePower()>=1000000, reward:50000, item:true}
  ]; }
  function claimAchievement(idv){
    const a = achievementList().find(x=>x.id===idv); if(!a) return toast('Достижение не найдено','bad');
    state.achievementsClaimed = Array.isArray(state.achievementsClaimed) ? state.achievementsClaimed : [];
    if(state.achievementsClaimed.includes(a.id)) return toast('Награда уже получена','warn');
    if(!a.done()) return toast('Условие достижения ещё не выполнено','bad');
    state.achievementsClaimed.push(a.id); earn(a.reward, `Достижение: ${a.title}`);
    if(a.item){ const pool = catalog.items.filter(x=>toNum(x.value,0)>=9000); if(pool.length){ const it=addItem(sample(pool),'achievement'); addLive('Ты',it); showDrop(it,null); } }
    save(); renderHub();
  }
  function collectionSets(){ return [
    {id:'stickers', title:'Sticker Hunter', desc:'Собрать 5 наклеек в инвентаре', need:5, filter:x=>/sticker/i.test(x.category||x.name||''), reward:'Sticker Reward Case'},
    {id:'patches', title:'Patch Wall', desc:'Собрать 3 патча', need:3, filter:x=>/patch/i.test(x.category||x.name||''), reward:'Patch Reward'},
    {id:'agents', title:'Agent Squad', desc:'Собрать 4 агентов', need:4, filter:x=>/agent/i.test(x.category||x.name||''), reward:'Agent Drop'},
    {id:'redline', title:'Red Zone', desc:'Иметь 3 красных/золотых предмета', need:3, filter:x=>['Covert','Exceedingly Rare','Extraordinary','Contraband'].includes(x.rarity), reward:'Red Zone Case'},
    {id:'armory', title:'Armory Shelf', desc:'Собрать 8 любых предметов дороже 2 000 ₽', need:8, filter:x=>toNum(x.value,0)>=2000, reward:'Armory Bonus'}
  ]; }
  function claimCollection(idv){
    const c = collectionSets().find(x=>x.id===idv); if(!c) return toast('Коллекция не найдена','bad');
    state.collectionRewards = Array.isArray(state.collectionRewards) ? state.collectionRewards : [];
    if(state.collectionRewards.includes(c.id)) return toast('Награда коллекции уже получена','warn');
    const got = state.inventory.filter(c.filter).length;
    if(got < c.need) return toast('Коллекция ещё не собрана','bad');
    state.collectionRewards.push(c.id);
    const pool = catalog.items.filter(x=>toNum(x.value,0)>=1500 && toNum(x.value,0)<=30000);
    const it = addItem(sample(pool.length?pool:catalog.items), 'collection-reward'); addLive('Ты',it); showDrop(it,null);
    addTx(`Коллекция: ${c.title}`, 0); save(); renderHub();
  }
  function marketSeed(){ return DAY_KEY() + ':' + activeCurrency() + ':market-v2'; }
  function marketItems(){
    const seed = marketSeed();
    let pool = catalog.items.filter(x=>x && realImageUrl(x.image) && toNum(x.value,0)>=300 && toNum(x.value,0)<=120000);
    if(pool.length < MARKET_SLOTS) pool = catalog.items.filter(x=>x && toNum(x.value,0)>0);
    return [...pool].sort((a,b)=>stableNoise(seed+':'+(a.id||a.name))-stableNoise(seed+':'+(b.id||b.name))).slice(0,MARKET_SLOTS).map(x=>{ const n=stableNoise(seed+':p:'+x.name); const trend=Math.round((stableNoise(seed+':t:'+x.name)-.5)*26); return Object.assign({},x,{marketTrend:trend,marketPrice:Math.round(toNum(x.value,0)*(1.00+n*.26)*(1+trend/100))}); });
  }
  function marketBuy(itemId){
    const it = marketItems().find(x=>(x.id||slug(x.name))===itemId || slug(x.name)===itemId); if(!it) return toast('Предмет маркета не найден','bad');
    const price = Math.max(1,Math.round(toNum(it.marketPrice,it.value)));
    if(!spend(price, `Маркет: ${it.name}`)) return;
    const reward = addItem(Object.assign({},it,{value:Math.round(price*.92)}),'market-buy');
    state.market = state.market || {}; state.market.bought = Math.max(0,Math.round(toNum(state.market.bought,0))) + 1;
    addLive('Ты',reward); bpEvent('market', {value:price}); showDrop(reward,null); save(); renderHub();
  }
  function cosmeticPool(kind){ return state.inventory.filter(x=> kind==='patch' ? /patch/i.test(x.category||x.name||'') : /sticker/i.test(x.category||x.name||'')); }
  function craftCosmetics(kind){
    const pool = cosmeticPool(kind).sort((a,b)=>toNum(a.value,0)-toNum(b.value,0));
    if(pool.length < 5) return toast(kind==='patch'?'Нужно 5 патчей':'Нужно 5 наклеек','bad');
    const used = pool.slice(0,5); const total = used.reduce((s,x)=>s+toNum(x.value,0),0);
    removeItems(used.map(x=>x.uid));
    let candidates = catalog.items.filter(x => (kind==='patch'?/patch/i.test(x.category||x.name||''):/sticker/i.test(x.category||x.name||'')) && toNum(x.value,0)>=total*.75 && toNum(x.value,0)<=total*3.4);
    if(!candidates.length) candidates = catalog.items.filter(x=>kind==='patch'?/patch/i.test(x.category||x.name||''):/sticker/i.test(x.category||x.name||''));
    const base = candidates.length ? sample(candidates) : sample(catalog.items);
    const reward = addItem(Object.assign({},base,{value:Math.max(toNum(base.value,0),Math.round(total*rnd(1.05,2.4)))}), kind==='patch'?'patch-craft':'sticker-craft');
    state.crafts = Math.max(0,Math.round(toNum(state.crafts,0))) + 1;
    addLive('Ты',reward); bpEvent('craft', {kind,value:reward.value}); showDrop(reward,null); save(); renderHub();
  }
  function currentThemeId(){ return getTheme(savedThemeId()).id; }
  function teamEventState(themeId){ state.themeEvents = state.themeEvents || {}; const t = state.themeEvents[themeId] || {count:0,claimed:false}; t.count=Math.max(0,Math.round(toNum(t.count,0))); t.claimed=!!t.claimed; state.themeEvents[themeId]=t; return t; }
  function teamEventAdd(event,payload){
    const theme = currentThemeId(); if(!TEAM_THEMES.includes(theme) || event!=='case_open') return;
    const t = teamEventState(theme); if(t.claimed) return; t.count = Math.min(TEAM_EVENT_NEED, t.count + Math.max(1,Math.round(toNum(payload.count,1)))); state.themeEvents[theme]=t; save(); if((document.body.dataset.page||'')==='hub') renderHub();
  }
  function claimThemeEvent(themeId){
    if(!TEAM_THEMES.includes(themeId)) return toast('Командный ивент не найден','bad');
    const t = teamEventState(themeId); const theme = getTheme(themeId);
    if(t.claimed) return toast('Награда темы уже получена','warn');
    if(t.count < TEAM_EVENT_NEED) return toast('Нужно открыть больше кейсов в этой теме','bad');
    t.claimed = true; state.themeEvents[themeId]=t;
    const pool = catalog.items.filter(x=>toNum(x.value,0)>=1200 && toNum(x.value,0)<=25000);
    const it = addItem(sample(pool.length?pool:catalog.items), `${theme.name}-event`); addLive('Ты',it); showDrop(it,null); save(); renderHub();
  }
  function renderHub(){
    const root = $('#hubRoot'); if(!root) return;
    const rank = profileRank();
    const daily = dailyDefinitions(); const dc = dailyState();
    const dailyHtml = daily.map(t=>{ const p=dailyProgress(t); return `<div class="bp-req"><div><b>${esc(t.title)}</b><small>${esc(bpReqTitle(t.req))} · ${Math.min(p.got,p.need)} / ${p.need}</small></div><div class="bp-bar"><span style="width:${p.pct}%"></span></div></div>`; }).join('');
    const achHtml = achievementList().map(a=>{ const claimed=(state.achievementsClaimed||[]).includes(a.id), done=a.done(); return `<article class="mini-card ${claimed?'claimed':done?'ready':''}"><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p><b>${fmt(a.reward)}</b><button class="btn ${done&&!claimed?'primary':''}" data-action="claim-achievement" data-achievement="${esc(a.id)}" ${done&&!claimed?'':'disabled'}>${claimed?'Получено':done?'Забрать':'Не выполнено'}</button></article>`; }).join('');
    const colHtml = collectionSets().map(c=>{ const got=state.inventory.filter(c.filter).length, done=got>=c.need, claimed=(state.collectionRewards||[]).includes(c.id); return `<article class="mini-card ${claimed?'claimed':done?'ready':''}"><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p><div class="bp-bar"><span style="width:${clamp(got/c.need*100,0,100)}%"></span></div><small>${Math.min(got,c.need)} / ${c.need} · ${esc(c.reward)}</small><button class="btn ${done&&!claimed?'primary':''}" data-action="claim-collection" data-collection="${esc(c.id)}" ${done&&!claimed?'':'disabled'}>${claimed?'Забрано':done?'Получить кейс':'Собирать'}</button></article>`; }).join('');
    const marketHtml = marketItems().map(it=>`<article class="market-card">${itemImageOrPlaceholder(it,'CS2')}<h3>${esc(it.name)}</h3><p>${esc(it.rarity||'CS2')} · ${fmt(it.marketPrice)} <span class="${it.marketTrend>=0?'plus':'minus'}">${it.marketTrend>=0?'+':''}${it.marketTrend}%</span></p><button class="btn primary" data-action="market-buy" data-item="${esc(it.id||slug(it.name))}">Купить</button></article>`).join('');
    const stickerCount=cosmeticPool('sticker').length, patchCount=cosmeticPool('patch').length;
    const theme = getTheme(currentThemeId()); const team = TEAM_THEMES.includes(theme.id) ? teamEventState(theme.id) : null;
    const themeHtml = team ? `<div class="theme-event-card"><div><span class="theme-badge theme-badge-${esc(theme.id)}">${esc(theme.logo)}</span><h3>${esc(theme.title)} event</h3><p>Открой ${TEAM_EVENT_NEED} кейсов с активной командной темой и получи тематический приз.</p><div class="bp-bar"><span style="width:${clamp(team.count/TEAM_EVENT_NEED*100,0,100)}%"></span></div><small>${team.count}/${TEAM_EVENT_NEED}</small></div><button class="btn primary" data-action="claim-theme-event" data-theme="${esc(theme.id)}" ${team.count>=TEAM_EVENT_NEED&&!team.claimed?'':'disabled'}>${team.claimed?'Получено':'Забрать'}</button></div>` : `<div class="notice">Выбери командную тему в левом верхнем переключателе, чтобы активировать командный ивент.</div>`;
    root.innerHTML = `<section class="hub-hero panel"><div><span class="kicker">Развитие аккаунта</span><h2>Задания, коллекции, маркет и крафт</h2><p>Все системы работают локально на GitHub Pages и используют твой текущий save.</p></div><div class="rank-card"><div class="rank-badge">${esc(rank.icon)} ${esc(rank.name)}</div><p>Оценка профиля: <b>${fmt(profilePower())}</b></p><div class="bp-bar"><span style="width:${rank.pct}%"></span></div><small>${esc(rank.nextText)}</small></div></section><section class="panel block"><div class="head"><div><h2>Ежедневный контракт</h2><p>3 задания в день. За полное закрытие — баланс и шанс на предмет.</p></div><button class="btn primary" data-action="claim-daily-contracts" ${!dc.claimed && daily.every(t=>dailyProgress(t).done)?'':'disabled'}>${dc.claimed?'Закрыто сегодня':'Забрать награду'}</button></div><div class="bp-reqs">${dailyHtml}</div></section><section class="block"><div class="head"><h2>Коллекции</h2></div><div class="grid cards-5">${colHtml}</div></section><section class="block"><div class="head"><h2>Достижения</h2></div><div class="grid cards-5">${achHtml}</div></section><section class="panel block"><div class="head"><div><h2>Командный ивент темы</h2><p>Награда зависит от выбранной темы. Classic/Dark/Light не участвуют.</p></div></div>${themeHtml}</section><section class="panel block"><div class="head"><div><h2>Крафт наклеек и патчей</h2><p>Автоматически забирает 5 самых дешёвых наклеек или патчей и выдаёт один более сильный предмет того же типа.</p></div></div><div class="craft-row"><button class="btn primary" data-action="craft-stickers" ${stickerCount>=5?'':'disabled'}>Скрафтить 5 наклеек · есть ${stickerCount}</button><button class="btn primary" data-action="craft-patches" ${patchCount>=5?'':'disabled'}>Скрафтить 5 патчей · есть ${patchCount}</button></div></section><section class="block"><div class="head"><div><h2>Внутренний маркет</h2><p>Ежедневная витрина из реального каталога. Покупка за игровой баланс, предмет сразу попадает в инвентарь.</p></div></div><div class="market-grid">${marketHtml}</div></section>`;
  }
  function normalizePromoCode(code){ return String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').trim(); }
  function renderPromos(){
    const root = $('#promosRoot'); if(!root) return;
    const used = Array.isArray(state.usedPromos) ? state.usedPromos : [];
    const totalCodes = Object.keys(PROMO_CODES).length + Object.keys(PROMO_REWARDS).length;
    root.innerHTML = `<div class="promo-layout"><article class="panel promo-card"><span class="kicker">Промокоды</span><h2>Активировать бонус</h2><p>Промокод можно использовать один раз на одно сохранение. Бонус сразу начисляется: баланс, XP, ST, скин, наклейка, патч или косметика профиля. Валюту отображения можно переключить в шапке.</p><div class="promo-form"><input id="promoInput" placeholder="Введи промокод" autocomplete="off" autocapitalize="characters"><button class="btn primary" data-action="redeem-promo">Активировать</button></div><p class="small">Использовано: <b>${used.length}</b> / ${totalCodes}. Пример формата: <b>WELCOME30</b></p></article><article class="panel"><h3>История промокодов</h3><div class="promo-used">${used.length ? used.map(x=>`<span class="pill">${esc(x)}</span>`).join('') : '<p class="small">Пока промокодов не активировано.</p>'}</div></article></div>`;
  }
  function redeemPromo(){
    const input = $('#promoInput');
    const code = normalizePromoCode(input && input.value);
    if(!code) return toast('Введи промокод','bad');
    const amount = PROMO_CODES[code];
    if(!amount) return toast('Промокод не найден','bad');
    state.usedPromos = Array.isArray(state.usedPromos) ? state.usedPromos : [];
    if(state.usedPromos.includes(code)) return toast('Этот промокод уже активирован','warn');
    state.usedPromos.push(code);
    earn(amount, `Промокод ${code}`);
    if(input) input.value = '';
    renderPromos();
  }

  function storageStatusText(){
    let localOk = false, sessionOk = false, idbOk = !!storageHealth.indexedDB, winOk = !!storageHealth.windowName;
    try{ const test = '__cs2_case_lab_test__'; localStorage.setItem(test,'1'); localStorage.removeItem(test); localOk = true; }catch(e){ localOk = false; }
    try{ const test = '__cs2_case_lab_session_test__'; sessionStorage.setItem(test,'1'); sessionStorage.removeItem(test); sessionOk = true; }catch(e){ sessionOk = false; }
    const rawLen = (()=>{ try{ return (localStorage.getItem(LS_KEY)||'').length; }catch(e){ return JSON.stringify(compactState(state)).length; } })();
    if(localOk) return `<span class="plus">localStorage работает</span><br><small>Постоянный save активен · ${Math.round(rawLen/1024)} KB · ключ: ${LS_KEY}</small>`;
    if(idbOk) return `<span class="plus">Сохранение работает через IndexedDB</span><br><small>localStorage недоступен или не используется, но постоянный save активен через IndexedDB. Баланс и инвентарь должны сохраняться.</small>`;
    if(sessionOk || winOk) return `<span class="minus">Постоянное сохранение ограничено</span><br><small>Сайт использует sessionStorage/window.name. Прогресс держится в текущей вкладке; экспортируй save перед закрытием.</small>`;
    return `<span class="minus">Все хранилища заблокированы</span><br><small>Проверь private mode, расширения и настройки site data. Пока прогресс только в памяти страницы.</small>`;
  }
  function renderProfile(){
    const root = $('#profileRoot'); if(!root) return;
    const rank = profileRank();
    root.innerHTML = `${statCards()}<div class="grid cards-3 block"><div class="panel rank-panel"><h3>Ранг профиля</h3><div class="rank-badge">${esc(rank.icon)} ${esc(rank.name)}</div><p>Оценка профиля: <b>${fmt(profilePower())}</b></p><div class="bp-bar"><span style="width:${rank.pct}%"></span></div><small>${esc(rank.nextText)}</small><a class="btn" href="quests.html">Развитие профиля</a></div><div class="panel"><h3>Статистика</h3><p>Апгрейды: <b>${state.upgrades}</b></p><p>Контракты: <b>${state.contracts}</b></p><p>Баттлы: <b>${state.battles}</b></p><p>Победы: <b>${state.wins}</b></p><p>Сапёр: <b>${state.mines||0}</b> игр / <b>${state.minesWins||0}</b> побед</p><p>Крафты: <b>${state.crafts||0}</b></p><p>Продано: <b>${fmt(state.sold)}</b></p></div><div class="panel"><h3>Сохранение</h3><p>Версия save: <b>${esc(state.version||VERSION)}</b></p><p>${storageStatusText()}</p><button class="btn" data-action="export-save">Экспорт</button><button class="btn" data-action="import-save">Импорт</button><textarea id="saveBox" placeholder="Тут появится или сюда вставляется save"></textarea></div><div class="panel danger"><h3>Сброс</h3><p>Полностью чистит сохранение и возвращает ${fmt(15000)}. Также убирает старые сломанные ключи v3–v8.</p><button class="btn red" data-action="reset-save">Сбросить прогресс</button></div></div><section class="block"><div class="head"><h2>История баланса</h2></div><div class="tx-list">${state.tx.slice(0,25).map(t=>`<div class="tx"><div><b>${esc(t.text)}</b><small>${new Date(t.time).toLocaleString('ru-RU')}</small></div><strong class="${t.amount>=0?'plus':'minus'}">${t.amount>=0?'+':''}${fmt(t.amount)}</strong></div>`).join('') || '<div class="empty">История пуста.</div>'}</div></section>`;
  }
  function resetSave(){
    if(!confirm(`Сбросить прогресс и вернуть стартовый баланс ${fmt(15000)}?`)) return;
    const keepTheme = savedThemeId();
    try{ allSaveKeys().forEach(k => localStorage.removeItem(k)); localStorage.removeItem(LS_KEY); localStorage.setItem(THEME_KEY, keepTheme); }catch(e){}
    try{ sessionStorage.removeItem(BACKUP_KEY); }catch(e){}
    try{ if(String(window.name||'').startsWith(WINDOW_SAVE_PREFIX)) window.name=''; }catch(e){}
    idbDelete();
    state = defaultState(); save(); toast('Прогресс сброшен','good'); route();
  }
  function exportSave(){ const box=$('#saveBox'); if(box) box.value = btoa(unescape(encodeURIComponent(JSON.stringify(compactState(state))))); toast('Save выгружен в поле','good'); }
  function importSave(){
    const box=$('#saveBox'); if(!box || !box.value.trim()) return toast('Вставь save в поле','bad');
    try{ state = compactState(JSON.parse(decodeURIComponent(escape(atob(box.value.trim()))))); save(); toast('Save импортирован','good'); route(); }
    catch(e){ toast('Не удалось импортировать save','bad'); }
  }



  /* v31.13 — progression pack */
  function addXP(amount, reason='XP'){
    amount = Math.max(0, Math.round(toNum(amount,0)));
    if(!amount) return;
    state.xp = Math.max(0, Math.round(toNum(state.xp,0))) + amount;
  }
  function accountLevel(){
    const xp = Math.max(0, Math.round(toNum(state.xp,0)));
    let lvl = 1, need = XP_PER_LEVEL_BASE, left = xp;
    while(left >= need && lvl < 200){ left -= need; lvl++; need = Math.round(XP_PER_LEVEL_BASE * Math.pow(lvl, 1.18)); }
    return {level:lvl, xp, current:left, need, pct:clamp(left/need*100,0,100)};
  }
  function profileTitleList(){ return ['Новичок','Коллекционер','Трейдер','Контрактор','Case Master','Dragon Hunter','Major Baron','Global Collector']; }
  function defaultTitle(){ const lvl=accountLevel().level; const list=profileTitleList(); return list[clamp(Math.floor((lvl-1)/8),0,list.length-1)]; }
  function addSeasonTokens(amount, reason=''){ amount=Math.max(0,Math.round(toNum(amount,0))); if(!amount) return; state.seasonTokens=Math.max(0,Math.round(toNum(state.seasonTokens,0)))+amount; }
  function applySaleCommission(gross){ gross=Math.max(0,Math.round(toNum(gross,0))); return Math.max(0, Math.round(gross * (1 - SELL_COMMISSION))); }
  function rareLog(type, text){ state.rareEvents=Array.isArray(state.rareEvents)?state.rareEvents:[]; state.rareEvents.unshift({id:id(),type,text,time:Date.now()}); state.rareEvents=state.rareEvents.slice(0,40); }
  function maybeRareCaseEvent(c, drops, cost){
    if(!c || !drops || !drops.length) return;
    const r = cryptoRandom();
    if(r < .018){ const refund = Math.max(100, Math.round(toNum(cost,0) * rnd(.18,.55))); earn(refund, 'Rare Event: Lucky Refund'); rareLog('refund', `Возврат ${fmt(refund)} после ${c.name}`); toast('Rare Event: Lucky Refund!','good'); }
    else if(r < .030){ const extra = addItem(weighted(c), 'rare-double-drop'); addLive('Ты', extra); rareLog('double', `Double Drop: ${extra.displayName}`); toast('Rare Event: Double Drop!','good'); }
    else if(r < .045){ addSeasonTokens(12, 'Golden Ticket'); rareLog('ticket', `Golden Ticket: +12 ${SEASON_TOKEN_NAME}`); toast(`Rare Event: Golden Ticket +12 ${SEASON_TOKEN_NAME}`,'good'); }
  }
  function customCaseObjects(){
    state.customCases = Array.isArray(state.customCases) ? state.customCases : [];
    return state.customCases.map(cc=>{
      const items = cc.itemIds.map(pid=>catalog.items.find(x=>String(x.id||slug(x.name))===String(pid) || slug(x.name)===String(pid))).filter(Boolean);
      return {id:cc.id, name:cc.name, price:cc.price, image:svgCase(cc.theme||'CUSTOM'), items:items.length?items:catalog.items.slice(0,12), source:'custom-creator', kind:'custom'};
    }).filter(c=>c.items.length>=3);
  }
  function syncCustomCasesIntoCatalog(){
    try{
      const custom = customCaseObjects();
      const ids = new Set(custom.map(x=>x.id));
      catalog.cases = catalog.cases.filter(c=>c.source!=='custom-creator' && !ids.has(c.id)).concat(custom);
    }catch(e){}
  }
  function investmentDefs(){
    return [
      {id:'cases', title:'Кейсы CS2', emoji:'📦', base:2200, desc:'Стабильный актив, растёт медленно.'},
      {id:'stickers', title:'Наклейки Major', emoji:'🏷️', base:1600, desc:'Волатильные наклейки турниров.'},
      {id:'patches', title:'Патчи', emoji:'🧵', base:900, desc:'Дешёвый вход и редкие скачки.'},
      {id:'gold', title:'Gold/Holo фонд', emoji:'✨', base:6200, desc:'Дорогой актив с сильными колебаниями.'},
      {id:'operation', title:'Operation Pass', emoji:'🎫', base:2500, desc:'Пропуски и лимитированные предметы.'}
    ];
  }
  function investmentPrice(def){
    const day = DAY_KEY(); const n=stableNoise(INVESTMENT_SEED+':'+day+':'+def.id); const n2=stableNoise(INVESTMENT_SEED+':trend:'+def.id+':'+new Date().getUTCMonth());
    return Math.max(100, Math.round(def.base * (.82 + n*.46) * (.92+n2*.24)));
  }
  function buyInvestment(idv){ const d=investmentDefs().find(x=>x.id===idv); if(!d) return toast('Актив не найден','bad'); const price=investmentPrice(d); if(!spend(price, `Инвестиция: ${d.title}`)) return; const inv=state.investments.find(x=>x.id===idv); if(inv){ inv.avg=Math.round((inv.avg*inv.qty+price)/(inv.qty+1)); inv.qty++; } else state.investments.push({id:idv,qty:1,avg:price,boughtAt:Date.now()}); addXP(25,'Инвестиция'); save(); renderHub(); }
  function sellInvestment(idv){ const d=investmentDefs().find(x=>x.id===idv), inv=state.investments.find(x=>x.id===idv); if(!d||!inv||inv.qty<1) return toast('Нет такого актива','bad'); const price=applySaleCommission(investmentPrice(d)); inv.qty--; if(inv.qty<=0) state.investments=state.investments.filter(x=>x!==inv); earn(price, `Продажа инвестиции: ${d.title}`); save(); renderHub(); }
  function seasonStoreItems(){ return [
    {id:'case', title:'Season Drop Case', cost:30, type:'item', min:800, max:12000},
    {id:'xp', title:'XP Boost', cost:20, type:'xp', amount:500},
    {id:'sticker', title:'Sticker Pack', cost:24, type:'category', category:'sticker', min:400, max:9000},
    {id:'premium', title:'Premium Skin Drop', cost:70, type:'item', min:5000, max:60000},
    {id:'avatar', title:'Profile Cosmetic', cost:18, type:'profile'}
  ]; }
  function buySeasonStore(idv){ const it=seasonStoreItems().find(x=>x.id===idv); if(!it) return toast('Товар не найден','bad'); if(toNum(state.seasonTokens,0)<it.cost) return toast(`Нужно ${it.cost} ${SEASON_TOKEN_NAME}`,'bad'); state.seasonTokens-=it.cost; applyRewardObject(it, `Season Store: ${it.title}`); save(); renderHub(); }
  function applyRewardObject(r, reason='Награда'){
    if(!r) return;
    if(typeof r === 'number') return earn(r, reason);
    if(r.type==='balance') return earn(r.amount||0, reason);
    if(r.type==='xp'){ addXP(r.amount||0, reason); toast(`+${r.amount||0} XP · ${reason}`,'good'); return; }
    if(r.type==='tokens'){ addSeasonTokens(r.amount||0, reason); toast(`+${r.amount||0} ${SEASON_TOKEN_NAME} · ${reason}`,'good'); return; }
    if(r.type==='xp_tokens'){ addXP(r.xp||0, reason); addSeasonTokens(r.tokens||0, reason); toast(`+${r.xp||0} XP и +${r.tokens||0} ${SEASON_TOKEN_NAME}`,'good'); return; }
    if(r.type==='category'){ const pool=catalog.items.filter(x=>String(x.category||x.name||'').toLowerCase().includes(r.category||'') && toNum(x.value,0)>=toNum(r.min,0) && toNum(x.value,0)<=toNum(r.max,1e9)); const it=addItem(sample(pool.length?pool:catalog.items), reason); addLive('Ты',it); showDrop(it,null); return; }
    if(r.type==='item'){ const pool=catalog.items.filter(x=>toNum(x.value,0)>=toNum(r.min,0) && toNum(x.value,0)<=toNum(r.max,1e9)); const it=addItem(sample(pool.length?pool:catalog.items), reason); addLive('Ты',it); showDrop(it,null); return; }
    if(r.type==='profile'){ state.profileFrame='event'; addXP(150, reason); toast('Получена косметика профиля +150 XP','good'); return; }
  }
  function createCustomCase(){
    const name = ($('#customCaseName') && $('#customCaseName').value.trim()) || 'My Custom Case';
    const price = clamp(Math.round(toNum($('#customCasePrice') && $('#customCasePrice').value, 2500)), 200, 90000);
    const mode = ($('#customCaseMode') && $('#customCaseMode').value) || 'balanced';
    let pool = catalog.items.filter(x=>toNum(x.value,0)>0);
    if(mode==='stickers') pool = pool.filter(x=>/sticker/i.test(x.category||x.name||''));
    if(mode==='premium') pool = pool.filter(x=>toNum(x.value,0)>=3000);
    if(mode==='budget') pool = pool.filter(x=>toNum(x.value,0)<=8000);
    pool = pool.length?pool:catalog.items;
    const seed = `${Date.now()}:${name}:${mode}`;
    const items = [...pool].sort((a,b)=>stableNoise(seed+':'+a.name)-stableNoise(seed+':'+b.name)).slice(0, clamp(Math.round(toNum($('#customCaseSize')&&$('#customCaseSize').value,18)),8,40));
    const cc = {id:'custom-'+slug(name)+'-'+Date.now().toString(36), name, price, theme:mode, itemIds:items.map(x=>x.id||slug(x.name)), createdAt:Date.now()};
    state.customCases = Array.isArray(state.customCases) ? state.customCases : [];
    state.customCases.unshift(cc); state.customCases=state.customCases.slice(0,24); state.createdCases=Math.round(toNum(state.createdCases,0))+1; addXP(120,'Case Creator'); save(); syncCustomCasesIntoCatalog(); renderHub(); toast('Кастомный кейс создан','good');
  }
  function deleteCustomCase(idv){ state.customCases=(state.customCases||[]).filter(x=>x.id!==idv); save(); syncCustomCasesIntoCatalog(); renderHub(); }
  function collectorMissions(){ return [
    {id:'mission-awp', title:'AWP Hunter', desc:'Собери 3 AWP-предмета', need:3, filter:x=>/AWP/i.test(x.name||x.displayName||''), reward:{type:'item',min:3000,max:30000}},
    {id:'mission-holo', title:'Holo Collector', desc:'Собери 4 Holo/Gold наклейки', need:4, filter:x=>/Holo|Gold|Foil|Lenticular/i.test(x.name||'')&&/sticker/i.test(x.category||x.name||''), reward:{type:'tokens',amount:55}},
    {id:'mission-knife', title:'Knife Dream', desc:'Получи 1 нож или перчатки', need:1, filter:x=>/^★|Knife|Gloves/i.test(x.name||x.displayName||''), reward:{type:'xp_tokens',xp:800,tokens:80}}
  ]; }
  function claimMission(idv){ const m=collectorMissions().find(x=>x.id===idv); if(!m) return; state.collectionRewards=state.collectionRewards||[]; if(state.collectionRewards.includes(idv)) return toast('Миссия уже закрыта','warn'); const got=state.inventory.filter(m.filter).length; if(got<m.need) return toast('Миссия ещё не выполнена','bad'); state.collectionRewards.push(idv); applyRewardObject(m.reward, `Миссия: ${m.title}`); save(); renderHub(); }
  function seasonalEventDefs(){ return [
    {id:'dragon-week', title:'Dragon Week', desc:'Открой 20 кейсов и получи жетоны.', need:20, metric:'opened', reward:{type:'tokens',amount:75}},
    {id:'sticker-fest', title:'Sticker Fest', desc:'Собери 5 наклеек в инвентаре.', need:5, metric:'stickers', reward:{type:'category',category:'sticker',min:1000,max:18000}},
    {id:'knife-hunt', title:'Knife Hunt', desc:'Сыграй 5 баттлов.', need:5, metric:'battles', reward:{type:'item',min:2000,max:22000}}
  ]; }
  function eventProgress(ev){ if(ev.metric==='opened') return Math.min(state.opened||0,ev.need); if(ev.metric==='battles') return Math.min(state.battles||0,ev.need); if(ev.metric==='stickers') return Math.min(state.inventory.filter(x=>/sticker/i.test(x.category||x.name||'')).length,ev.need); return 0; }
  function claimSeasonEvent(idv){ const ev=seasonalEventDefs().find(x=>x.id===idv); if(!ev) return; state.collectionRewards=state.collectionRewards||[]; const key='season-event-'+idv; if(state.collectionRewards.includes(key)) return toast('Ивент уже получен','warn'); if(eventProgress(ev)<ev.need) return toast('Ивент не завершён','bad'); state.collectionRewards.push(key); applyRewardObject(ev.reward, `Ивент: ${ev.title}`); save(); renderHub(); }
  function setAvatar(idv){ state.avatar=String(idv||'classic'); save(); renderProfile(); toast('Аватар обновлён','good'); }
  function setTitle(idv){ state.title=String(idv||defaultTitle()); save(); renderProfile(); toast('Титул обновлён','good'); }
  function toggleInventoryFlag(uid, flag){ const it=state.inventory.find(x=>x.uid===uid); if(!it) return; it[flag]=!it[flag]; save(); renderInventory(); }
  function profileChartsHtml(){
    const vals=[['Открыто',state.opened||0],['Апгрейды',state.upgrades||0],['Контракты',state.contracts||0],['Battle',state.battles||0],['Сапёр',state.mines||0],['Победы',state.wins||0]];
    const max=Math.max(1,...vals.map(x=>x[1]));
    return `<div class="profile-chart">${vals.map(x=>`<div><span>${esc(x[0])}</span><i><b style="width:${clamp(x[1]/max*100,2,100)}%"></b></i><strong>${x[1]}</strong></div>`).join('')}</div>`;
  }
  function profileCosmeticsHtml(){ const avatars=[['classic','✦'],['dragon','🐉'],['major','🏆'],['trader','💼'],['knife','🔪'],['sticker','🏷️']]; const titles=profileTitleList(); return `<div class="cosmetic-grid"><div><h3>Аватар</h3><div class="craft-row">${avatars.map(a=>`<button class="small-btn ${state.avatar===a[0]?'active':''}" data-action="set-avatar" data-avatar="${a[0]}">${a[1]}</button>`).join('')}</div></div><div><h3>Титул</h3><div class="craft-row">${titles.map(t=>`<button class="small-btn ${state.title===t?'active':''}" data-action="set-title" data-title="${esc(t)}">${esc(t)}</button>`).join('')}</div></div></div>`; }
  const oldRenderHub = renderHub;
  renderHub = function(){
    const root = $('#hubRoot'); if(!root) return oldRenderHub();
    oldRenderHub();
    const lvl=accountLevel();
    const invDefs=investmentDefs();
    const invHtml=invDefs.map(d=>{ const h=(state.investments||[]).find(x=>x.id===d.id); const p=investmentPrice(d); const diff=h?Math.round((p-h.avg)/Math.max(1,h.avg)*100):0; return `<article class="mini-card"><h3>${d.emoji} ${esc(d.title)}</h3><p>${esc(d.desc)}</p><b>${fmt(p)} <span class="${diff>=0?'plus':'minus'}">${h?`${diff>=0?'+':''}${diff}%`:''}</span></b><small>В наличии: ${h?h.qty:0}${h?` · средняя ${fmt(h.avg)}`:''}</small><button class="btn primary" data-action="buy-investment" data-invest="${d.id}">Купить</button><button class="btn" data-action="sell-investment" data-invest="${d.id}" ${h&&h.qty?'':'disabled'}>Продать</button></article>`; }).join('');
    const storeHtml=seasonStoreItems().map(x=>`<article class="mini-card"><h3>${esc(x.title)}</h3><p>Цена: <b>${x.cost} ${SEASON_TOKEN_NAME}</b></p><button class="btn primary" data-action="buy-season-store" data-store="${x.id}" ${toNum(state.seasonTokens,0)>=x.cost?'':'disabled'}>Купить</button></article>`).join('');
    const cc=(state.customCases||[]).map(x=>`<div class="tx"><div><b>${esc(x.name)}</b><small>${fmt(x.price)} · ${x.itemIds.length} предметов</small></div><button class="small-btn" data-action="delete-custom-case" data-case="${esc(x.id)}">Удалить</button></div>`).join('') || '<p class="small">Пока нет кастомных кейсов.</p>';
    const missions=collectorMissions().map(m=>{ const got=state.inventory.filter(m.filter).length, done=got>=m.need, claimed=(state.collectionRewards||[]).includes(m.id); return `<article class="mini-card ${claimed?'claimed':done?'ready':''}"><h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p><div class="bp-bar"><span style="width:${clamp(got/m.need*100,0,100)}%"></span></div><small>${Math.min(got,m.need)} / ${m.need}</small><button class="btn ${done&&!claimed?'primary':''}" data-action="claim-mission" data-mission="${m.id}" ${done&&!claimed?'':'disabled'}>${claimed?'Получено':done?'Забрать':'В процессе'}</button></article>`; }).join('');
    const events=seasonalEventDefs().map(ev=>{ const got=eventProgress(ev), done=got>=ev.need, key='season-event-'+ev.id, claimed=(state.collectionRewards||[]).includes(key); return `<article class="mini-card ${claimed?'claimed':done?'ready':''}"><h3>${esc(ev.title)}</h3><p>${esc(ev.desc)}</p><div class="bp-bar"><span style="width:${clamp(got/ev.need*100,0,100)}%"></span></div><small>${got}/${ev.need}</small><button class="btn ${done&&!claimed?'primary':''}" data-action="claim-season-event" data-event="${ev.id}" ${done&&!claimed?'':'disabled'}>${claimed?'Получено':done?'Забрать':'В процессе'}</button></article>`; }).join('');
    root.insertAdjacentHTML('afterbegin', `<section class="panel block xp-panel"><div class="head"><div><h2>Уровень аккаунта</h2><p>XP начисляется за открытия, дропы, покупки, ивенты, сапёр и прогресс.</p></div><div class="rank-badge">LVL ${lvl.level}</div></div><div class="bp-bar"><span style="width:${lvl.pct}%"></span></div><small>${lvl.current}/${lvl.need} XP · сезонные жетоны: <b>${toNum(state.seasonTokens,0)} ${SEASON_TOKEN_NAME}</b></small></section>`);
    root.insertAdjacentHTML('beforeend', `<section class="block"><div class="head"><div><h2>Миссии коллекционера</h2><p>Длинные цепочки для редких категорий инвентаря.</p></div></div><div class="grid cards-3">${missions}</div></section><section class="block"><div class="head"><div><h2>Сезонные ивенты</h2><p>Dragon Week, Sticker Fest и Knife Hunt работают без сервера.</p></div></div><div class="grid cards-3">${events}</div></section><section class="panel block"><div class="head"><div><h2>Инвестиции</h2><p>Цены меняются каждый день. Продажа теперь без комиссии.</p></div></div><div class="grid cards-5">${invHtml}</div></section><section class="panel block"><div class="head"><div><h2>Сезонный магазин</h2><p>Баланс жетонов: <b>${toNum(state.seasonTokens,0)} ${SEASON_TOKEN_NAME}</b></p></div></div><div class="grid cards-5">${storeHtml}</div></section><section class="panel block"><div class="head"><div><h2>Case Creator</h2><p>Создай свой кейс — он появится на странице кейсов в разделе «Мои кейсы».</p></div></div><div class="creator-form"><input id="customCaseName" placeholder="Название кейса"><input id="customCasePrice" type="number" value="2500" min="200"><select id="customCaseMode"><option value="balanced">Balanced</option><option value="budget">Budget</option><option value="premium">Premium</option><option value="stickers">Sticker Case</option></select><select id="customCaseSize"><option value="12">12 предметов</option><option value="18" selected>18 предметов</option><option value="30">30 предметов</option></select><button class="btn primary" data-action="create-custom-case">Создать кейс</button></div><div class="tx-list">${cc}</div></section>`);
  };
  const oldRenderProfile = renderProfile;
  renderProfile = function(){
    const root = $('#profileRoot'); if(!root) return oldRenderProfile();
    oldRenderProfile();
    const lvl=accountLevel();
    root.insertAdjacentHTML('afterbegin', `<section class="panel profile-head"><div class="profile-avatar">${esc(({classic:'✦',dragon:'🐉',major:'🏆',trader:'💼',knife:'🔪',sticker:'🏷️'}[state.avatar]||'✦'))}</div><div><span class="kicker">${esc(state.title||defaultTitle())}</span><h2>Уровень ${lvl.level}</h2><div class="bp-bar"><span style="width:${lvl.pct}%"></span></div><small>${lvl.current}/${lvl.need} XP · ${toNum(state.seasonTokens,0)} ${SEASON_TOKEN_NAME}</small></div></section><section class="panel block"><div class="head"><h2>Графики статистики</h2></div>${profileChartsHtml()}</section><section class="panel block"><div class="head"><h2>Кастомизация профиля</h2></div>${profileCosmeticsHtml()}</section>`);
  };
  document.addEventListener('click', e=>{
    const btn=e.target.closest('[data-action]'); if(!btn) return;
    const a=btn.dataset.action;
    if(a==='buy-investment') return buyInvestment(btn.dataset.invest||'');
    if(a==='sell-investment') return sellInvestment(btn.dataset.invest||'');
    if(a==='buy-season-store') return buySeasonStore(btn.dataset.store||'');
    if(a==='create-custom-case') return createCustomCase();
    if(a==='delete-custom-case') return deleteCustomCase(btn.dataset.case||'');
    if(a==='claim-mission') return claimMission(btn.dataset.mission||'');
    if(a==='claim-season-event') return claimSeasonEvent(btn.dataset.event||'');
    if(a==='set-avatar') return setAvatar(btn.dataset.avatar||'classic');
    if(a==='set-title') return setTitle(btn.dataset.title||defaultTitle());
    if(a==='toggle-favorite') return toggleInventoryFlag(btn.dataset.uid,'favorite');
    if(a==='toggle-protect') return toggleInventoryFlag(btn.dataset.uid,'protected');
  });
  const oldRedeemPromo = redeemPromo;
  redeemPromo = function(){
    const input = $('#promoInput'); const code = normalizePromoCode(input && input.value);
    if(!code) return toast('Введи промокод','bad');
    const reward = PROMO_REWARDS[code] || PROMO_CODES[code];
    if(!reward) return toast('Промокод не найден','bad');
    state.usedPromos = Array.isArray(state.usedPromos) ? state.usedPromos : [];
    if(state.usedPromos.includes(code)) return toast('Этот промокод уже активирован','warn');
    state.usedPromos.push(code);
    applyRewardObject(reward, `Промокод ${code}`);
    if(input) input.value=''; save(); renderPromos();
  };


  /* v31.15 — Major sticker album, daily timed shop, auto-sell, prestige and protected-item filters */
  const V315_PROMOS = Object.freeze({
    MAJORALBUM:{type:'tokens',amount:80,label:'80 ST'}, STICKERALBUM:{type:'category',category:'sticker',min:900,max:24000,label:'альбомная наклейка'}, DAILYSHOP:{type:'balance',amount:6500,label:'6 500 ₽'}, SHOPRESET:{type:'tokens',amount:45,label:'45 ST'}, AUTOSALE:{type:'balance',amount:4200,label:'4 200 ₽'}, PROTECTLOCK:{type:'xp',amount:900,label:'900 XP'}, PRESTIGE1:{type:'xp_tokens',xp:3200,tokens:120,label:'3200 XP + 120 ST'}, PRESTIGEPLUS:{type:'xp_tokens',xp:5600,tokens:180,label:'5600 XP + 180 ST'}, GLOBALPRESTIGE:{type:'xp_tokens',xp:8800,tokens:240,label:'8800 XP + 240 ST'}, MAJOR2025:{type:'category',category:'sticker',min:450,max:16000,label:'Major sticker'}, KATOWICEBOOST:{type:'category',category:'sticker',min:4500,max:60000,label:'Katowice drop'}, COPENHAGEN24:{type:'category',category:'sticker',min:650,max:18000,label:'Copenhagen sticker'}, SHANGHAI24:{type:'category',category:'sticker',min:650,max:18000,label:'Shanghai sticker'}, AUSTIN25:{type:'category',category:'sticker',min:650,max:18000,label:'Austin sticker'}, ALBUMXP:{type:'xp',amount:1500,label:'1500 XP'}, SAFEITEMS:{type:'profile',amount:1,label:'protect cosmetic'}, TIMERDEAL:{type:'balance',amount:7300,label:'7 300 ₽'}, CHEAPCLEAN:{type:'balance',amount:3600,label:'3 600 ₽'}, DROPSELL:{type:'balance',amount:5200,label:'5 200 ₽'}, MAJORPASS:{type:'item',min:900,max:9000,label:'viewer pass / item'}, PRESTIGELAB:{type:'xp_tokens',xp:2500,tokens:90,label:'2500 XP + 90 ST'}, STICKERKING:{type:'category',category:'sticker',min:1000,max:35000,label:'rare sticker'}, SHOPHUNTER:{type:'item',min:1500,max:22000,label:'shop hunter skin'}, LOCKEDDROP:{type:'item',min:1200,max:15000,label:'safe drop'}, CLEANINV:{type:'balance',amount:4800,label:'4 800 ₽'}, ALBUMFINAL:{type:'item',min:12000,max:90000,label:'album final item'}
  });
  function ensureV315(){
    state.autoSell = (state.autoSell && typeof state.autoSell==='object') ? state.autoSell : {enabled:false,limit:200};
    state.autoSell.enabled = !!state.autoSell.enabled;
    state.autoSell.limit = clamp(Math.round(toNum(state.autoSell.limit,200)),50,5000);
    state.majorAlbum = (state.majorAlbum && typeof state.majorAlbum==='object') ? state.majorAlbum : {claimed:[],rewards:[]};
    state.majorAlbum.claimed = Array.isArray(state.majorAlbum.claimed) ? state.majorAlbum.claimed.map(String).slice(0,80) : [];
    state.majorAlbum.rewards = Array.isArray(state.majorAlbum.rewards) ? state.majorAlbum.rewards.map(String).slice(0,80) : [];
    state.dailyShop = (state.dailyShop && typeof state.dailyShop==='object') ? state.dailyShop : {bought:[],seed:''};
    state.dailyShop.bought = Array.isArray(state.dailyShop.bought) ? state.dailyShop.bought.map(String).slice(0,80) : [];
    state.dailyShop.seed = String(state.dailyShop.seed||'');
    if(state.dailyShop.seed !== DAY_KEY()){ state.dailyShop.seed = DAY_KEY(); state.dailyShop.bought = []; }
    state.prestige = Math.max(0, Math.round(toNum(state.prestige,0)));
  }
  function xpNeedForLevel(lvl){ return Math.round(XP_PER_LEVEL_BASE * Math.pow(Math.max(1,lvl), 1.18)); }
  function totalXpForLevel(target){ let total=0; for(let l=1;l<target;l++) total += xpNeedForLevel(l); return total; }
  function prestigeRoman(n){ const r=['0','I','II','III','IV','V','VI','VII','VIII','IX','X']; return r[n] || String(n); }
  const oldAccountLevelV315 = accountLevel;
  accountLevel = function(){ ensureV315(); const base = oldAccountLevelV315(); base.prestige = state.prestige||0; base.prestigeTitle = base.prestige ? `Prestige ${prestigeRoman(base.prestige)}` : 'Без престижа'; base.canPrestige = base.level >= 100; return base; };
  const oldCompactStateV315 = compactState;
  compactState = function(raw){ const out = oldCompactStateV315(raw); const src = raw && typeof raw==='object' ? raw : state; out.autoSell = src.autoSell || {enabled:false,limit:200}; out.majorAlbum = src.majorAlbum || {claimed:[],rewards:[]}; out.dailyShop = src.dailyShop || {bought:[],seed:DAY_KEY()}; out.prestige = Math.max(0,Math.round(toNum(src.prestige,0))); return out; };
  function safeItems(){ return (state.inventory||[]).filter(x=>x && !x.protected); }
  function maybeAutoSellDrop(it, source){ ensureV315(); if(!it || !state.autoSell.enabled) return false; if(it.protected || it.favorite) return false; if(/^rare|achievement|battle-pass|season|premium|dragon|album|prestige/i.test(String(source||''))) return false; const limit = state.autoSell.limit; if(toNum(it.value,0) > limit) return false; const net = applySaleCommission(it.value||0); state.inventory = state.inventory.filter(x=>x.uid!==it.uid); state.sold = Math.round(toNum(state.sold,0) + net); state.balance = Math.round(toNum(state.balance,0) + net); state.earned = Math.round(toNum(state.earned,0) + net); addTx(`Авто-продажа ${it.displayName||it.name}`, net); toast(`Авто-продано: ${it.displayName||it.name} за ${fmt(net)}`,'good'); return true; }
  function checkMajorAlbumPickup(it){ ensureV315(); if(!it) return; const key=majorAlbumKey(it); if(key && !state.majorAlbum.claimed.includes(key)){ state.majorAlbum.claimed.push(key); if(state.majorAlbum.claimed.length%3===0) addSeasonTokens(10,'Альбом Major'); } }
  function majorAlbumSlots(){ return [
    {id:'katowice-2014', title:'Katowice 2014', match:/katowice 2014/i, reward:{type:'tokens',amount:80}}, {id:'cologne-2014', title:'Cologne 2014', match:/cologne 2014/i, reward:{type:'tokens',amount:45}}, {id:'atlanta-2017', title:'Atlanta 2017', match:/atlanta 2017/i, reward:{type:'xp',amount:900}}, {id:'boston-2018', title:'Boston 2018', match:/boston 2018/i, reward:{type:'tokens',amount:35}}, {id:'stockholm-2021', title:'Stockholm 2021', match:/stockholm 2021/i, reward:{type:'category',category:'sticker',min:700,max:12000}}, {id:'antwerp-2022', title:'Antwerp 2022', match:/antwerp 2022/i, reward:{type:'tokens',amount:35}}, {id:'paris-2023', title:'Paris 2023', match:/paris 2023/i, reward:{type:'xp_tokens',xp:600,tokens:30}}, {id:'copenhagen-2024', title:'Copenhagen 2024', match:/copenhagen 2024/i, reward:{type:'category',category:'sticker',min:600,max:16000}}, {id:'shanghai-2024', title:'Shanghai 2024', match:/shanghai 2024/i, reward:{type:'category',category:'sticker',min:600,max:16000}}, {id:'austin-2025', title:'Austin 2025', match:/austin 2025/i, reward:{type:'category',category:'sticker',min:600,max:18000}}, {id:'holo-gold', title:'Holo / Gold', match:/holo|gold|foil|lenticular/i, reward:{type:'tokens',amount:70}}, {id:'dignitas', title:'Dignitas / Legacy', match:/dignitas|ibuypower|titan|reason/i, reward:{type:'item',min:5000,max:60000}}
  ]; }
  function majorAlbumKey(it){ const name=String((it&&it.name)||it&&it.displayName||''); if(!/sticker/i.test(String((it&&it.category)||name))) return ''; const s=majorAlbumSlots().find(x=>x.match.test(name)); return s ? s.id : ''; }
  function majorAlbumHtml(){ ensureV315(); const slots=majorAlbumSlots(); const inv=state.inventory||[]; return `<section class="panel block major-album"><div class="head"><div><h2>Альбом наклеек Major</h2><p>Собирай наклейки турниров. Слот заполняется, когда соответствующая наклейка есть или была получена в инвентарь.</p></div><b>${state.majorAlbum.claimed.length}/${slots.length}</b></div><div class="album-grid">${slots.map(s=>{ const has=state.majorAlbum.claimed.includes(s.id) || inv.some(x=>majorAlbumKey(x)===s.id); if(has && !state.majorAlbum.claimed.includes(s.id)) state.majorAlbum.claimed.push(s.id); const rew=(state.majorAlbum.rewards||[]).includes(s.id); return `<article class="album-slot ${has?'filled':''}"><h3>${has?'🏷️':'▫️'} ${esc(s.title)}</h3><p>${has?'Наклейка найдена':'Слот пуст'}</p><button class="btn ${has&&!rew?'primary':''}" data-action="claim-major-album" data-album="${esc(s.id)}" ${has&&!rew?'':'disabled'}>${rew?'Награда получена':has?'Забрать награду':'Нужно найти'}</button></article>`; }).join('')}</div></section>`; }
  function claimMajorAlbum(idv){ ensureV315(); const s=majorAlbumSlots().find(x=>x.id===idv); if(!s) return toast('Слот не найден','bad'); if(!state.majorAlbum.claimed.includes(idv)) return toast('Сначала найди наклейку для этого слота','bad'); if(state.majorAlbum.rewards.includes(idv)) return toast('Награда уже получена','warn'); state.majorAlbum.rewards.push(idv); applyRewardObject(s.reward, `Альбом Major: ${s.title}`); if(state.majorAlbum.rewards.length>=majorAlbumSlots().length){ applyRewardObject({type:'item',min:15000,max:120000}, 'Финал альбома Major'); } save(); renderHub(); }
  function secondsToMidnight(){ const now=new Date(); const end=new Date(now); end.setHours(24,0,0,0); return Math.max(0,end-now); }
  function dailyShopItems(){ ensureV315(); const seed='daily-shop:'+DAY_KEY(); const pool=(catalog.items||[]).filter(x=>x && toNum(x.value,0)>=150 && toNum(x.value,0)<=80000); return [...(pool.length?pool:catalog.items)].sort((a,b)=>stableNoise(seed+':'+a.name)-stableNoise(seed+':'+b.name)).slice(0,8).map((x,i)=>Object.assign({},x,{shopId:slug(x.name)+'-'+i, shopPrice:Math.round(toNum(x.value,0)*(0.72+stableNoise(seed+':p:'+x.name)*0.46))})); }
  function dailyShopHtml(){ ensureV315(); const left=secondsToMidnight(); const items=dailyShopItems(); return `<section class="panel block daily-shop"><div class="head"><div><h2>Ежедневный магазин</h2><p>Витрина обновляется в полночь. Покупки сохраняются только на текущий день.</p></div><div class="rank-badge">${formatTime(left)}</div></div><div class="market-grid">${items.map(it=>`<article class="mini-card"><div class="shop-img">${itemImageOrPlaceholder(it,'CS2')}</div><h3>${esc(it.name)}</h3><p>${esc(it.rarity||'')} · <b>${fmt(it.shopPrice)}</b></p><button class="btn primary" data-action="daily-shop-buy" data-shop="${esc(it.shopId)}" ${(state.dailyShop.bought||[]).includes(it.shopId)?'disabled':''}>${(state.dailyShop.bought||[]).includes(it.shopId)?'Куплено':'Купить'}</button></article>`).join('')}</div></section>`; }
  function dailyShopBuy(shopId){ ensureV315(); const it=dailyShopItems().find(x=>x.shopId===shopId); if(!it) return toast('Товар не найден','bad'); if((state.dailyShop.bought||[]).includes(shopId)) return toast('Этот товар уже куплен сегодня','warn'); if(!spend(it.shopPrice, `Daily Shop: ${it.name}`)) return; state.dailyShop.bought.push(shopId); const got=addItem(Object.assign({},it,{value:it.shopPrice}), 'daily-shop'); addLive('Ты',got); addXP(35,'Daily Shop'); save(); renderHub(); showDrop(got,null); }
  function autoSellSettingsHtml(){ ensureV315(); return `<section class="panel block autosell-panel"><div class="head"><div><h2>Авто-продажа дешёвых дропов</h2><p>Новые дешёвые предметы автоматически продаются после открытия кейса/награды. Избранное и защищённое не продаётся.</p></div><label class="switch-row"><input type="checkbox" id="autoSellEnabled" ${state.autoSell.enabled?'checked':''}> Включено</label></div><div class="creator-form"><input id="autoSellLimit" type="number" min="50" max="5000" step="50" value="${state.autoSell.limit}"><button class="btn primary" data-action="save-autosell">Сохранить лимит</button><span class="small">Сейчас продаёт всё до <b>${fmt(state.autoSell.limit)}</b> без комиссии.</span></div></section>`; }
  function saveAutoSell(){ ensureV315(); const en=$('#autoSellEnabled'); const lim=$('#autoSellLimit'); state.autoSell.enabled=!!(en&&en.checked); state.autoSell.limit=clamp(Math.round(toNum(lim&&lim.value,200)),50,5000); save(); renderHub(); toast(`Авто-продажа ${state.autoSell.enabled?'включена':'выключена'} до ${fmt(state.autoSell.limit)}`,'good'); }
  function prestigePanelHtml(){ const lvl=accountLevel(); const reward=120000+toNum(state.prestige,0)*35000; return `<section class="panel block prestige-panel"><div class="head"><div><h2>Престиж аккаунта</h2><p>После 100 уровня можно сбросить 100 уровней XP и получить постоянный престиж, ST и крупный бонус.</p></div><div class="rank-badge">${esc(lvl.prestigeTitle)}</div></div><p>Текущий уровень: <b>${lvl.level}</b>. Престижей: <b>${toNum(state.prestige,0)}</b>. Награда за следующий престиж: <b>${fmt(reward)}</b> + <b>150 ST</b>.</p><button class="btn primary huge" data-action="claim-prestige" ${lvl.canPrestige?'':'disabled'}>${lvl.canPrestige?'Получить престиж':'Нужен 100 уровень'}</button></section>`; }
  function claimPrestige(){ ensureV315(); const lvl=accountLevel(); if(!lvl.canPrestige) return toast('Престиж доступен с 100 уровня аккаунта','bad'); const need=totalXpForLevel(100); state.xp=Math.max(0,Math.round(toNum(state.xp,0)-need)); state.prestige=Math.round(toNum(state.prestige,0))+1; addSeasonTokens(150,'Престиж'); earn(120000+(state.prestige-1)*35000, `Prestige ${prestigeRoman(state.prestige)}`); applyRewardObject({type:'profile'}, 'Престижная косметика'); save(); renderHub(); renderProfile(); }
  const oldRenderHubV315 = renderHub;
  renderHub = function(){ oldRenderHubV315(); const root=$('#hubRoot'); if(!root) return; ensureV315(); root.insertAdjacentHTML('afterbegin', prestigePanelHtml()+autoSellSettingsHtml()+dailyShopHtml()+majorAlbumHtml()); const refresh=()=>{ const el=$('.daily-shop .rank-badge'); if(el) el.textContent=formatTime(secondsToMidnight()); }; clearInterval(window.__v315ShopTimer); window.__v315ShopTimer=setInterval(refresh,1000); };
  const oldRenderProfileV315 = renderProfile;
  renderProfile = function(){ oldRenderProfileV315(); const root=$('#profileRoot'); if(!root) return; const lvl=accountLevel(); root.insertAdjacentHTML('afterbegin', `<section class="panel block prestige-mini"><div class="head"><div><h2>${esc(lvl.prestigeTitle)}</h2><p>Система престижа открывается после 100 уровня.</p></div><a class="btn" href="quests.html">Престиж и развитие</a></div></section>`); };
  const oldRenderPromosV315 = renderPromos;
  renderPromos = function(){ oldRenderPromosV315(); const root=$('#promosRoot'); if(!root) return; root.insertAdjacentHTML('beforeend', `<section class="panel block"><div class="head"><h2>Новые типы промокодов v31.15</h2></div><div class="promo-used">${Object.keys(V315_PROMOS).map(x=>`<span class="pill">${esc(x)}</span>`).join('')}</div></section>`); };
  const oldRedeemPromoV315 = redeemPromo;
  redeemPromo = function(){ const input=$('#promoInput'); const code=normalizePromoCode(input&&input.value); if(V315_PROMOS[code]){ state.usedPromos=Array.isArray(state.usedPromos)?state.usedPromos:[]; if(state.usedPromos.includes(code)) return toast('Этот промокод уже активирован','warn'); state.usedPromos.push(code); applyRewardObject(V315_PROMOS[code], `Промокод ${code}`); if(input) input.value=''; save(); renderPromos(); return; } return oldRedeemPromoV315(); };
  document.addEventListener('click', e=>{ const btn=e.target.closest('[data-action]'); if(!btn) return; const a=btn.dataset.action; if(a==='claim-major-album') return claimMajorAlbum(btn.dataset.album||''); if(a==='daily-shop-buy') return dailyShopBuy(btn.dataset.shop||''); if(a==='save-autosell') return saveAutoSell(); if(a==='claim-prestige') return claimPrestige(); });


  /* v31.16 — upgrade sync, no sale fee, sticker pricing, tiered missions/events, creator balance */

  const v316OldNormalizeState = normalizeState;
  normalizeState = function(raw){
    const out = v316OldNormalizeState(raw);
    const src = raw && typeof raw === 'object' ? raw : {};
    out.profileBg = String(src.profileBg || out.profileBg || 'default');
    out.profileUnlocked = src.profileUnlocked && typeof src.profileUnlocked === 'object' ? src.profileUnlocked : (out.profileUnlocked || {avatars:['classic'],titles:['Новичок'],frames:['default'],backgrounds:['default']});
    out.seasonEvents = src.seasonEvents && typeof src.seasonEvents === 'object' ? src.seasonEvents : (out.seasonEvents || {active:[],lastRefreshAt:0,claimed:[]});
    out.majorAlbum = src.majorAlbum && typeof src.majorAlbum === 'object' ? src.majorAlbum : (out.majorAlbum || {claimed:[],rewards:[],tasks:[],lastRefreshAt:0});
    return out;
  };
  const v316OldCompactState = compactState;
  compactState = function(raw){
    const out = v316OldCompactState(raw);
    const src = raw && typeof raw === 'object' ? raw : state;
    out.profileBg = src.profileBg || 'default';
    out.profileUnlocked = src.profileUnlocked || {avatars:['classic'],titles:['Новичок'],frames:['default'],backgrounds:['default']};
    out.seasonEvents = src.seasonEvents || {active:[],lastRefreshAt:0,claimed:[]};
    out.majorAlbum = src.majorAlbum || {claimed:[],rewards:[],tasks:[],lastRefreshAt:0};
    return out;
  };
  const V316_SEASON_RENEW_PRICE = 10 * RUB_PER_USD;
  const V316_MAJOR_REFRESH_COOLDOWN = 0;
  const V316_EVENT_REFRESH_COOLDOWN = 24 * 60 * 60 * 1000;
  const V316_CASE_TYPE_LIMITS = Object.freeze({
    classic: 250, limited: 650, quality: 120, stickers: 180, special: 2200, extras: 300, collection: 260, custom: 350,
    budget: 350, balanced: 1200, premium: 6500, creator_stickers: 260
  });
  const V316_PRICE_SOURCES = Object.freeze(['Market.CSGO','CS.MONEY','LIS-SKINS']);

  function v316Ensure(){
    state.profileUnlocked = state.profileUnlocked && typeof state.profileUnlocked === 'object' ? state.profileUnlocked : {avatars:['classic'],titles:['Новичок'],frames:['default'],backgrounds:['default']};
    ['avatars','titles','frames','backgrounds'].forEach(k=>{ state.profileUnlocked[k] = Array.isArray(state.profileUnlocked[k]) ? state.profileUnlocked[k] : []; });
    if(!state.profileBg) state.profileBg = 'default';
    if(!state.majorAlbum || typeof state.majorAlbum !== 'object') state.majorAlbum = {claimed:[],rewards:[]};
    state.majorAlbum.claimed = Array.isArray(state.majorAlbum.claimed) ? state.majorAlbum.claimed : [];
    state.majorAlbum.rewards = Array.isArray(state.majorAlbum.rewards) ? state.majorAlbum.rewards : [];
    state.majorAlbum.tasks = Array.isArray(state.majorAlbum.tasks) ? state.majorAlbum.tasks : [];
    state.majorAlbum.lastRefreshAt = Math.max(0, Math.round(toNum(state.majorAlbum.lastRefreshAt,0)));
    state.seasonEvents = state.seasonEvents && typeof state.seasonEvents === 'object' ? state.seasonEvents : {active:[],lastRefreshAt:0,claimed:[]};
    state.seasonEvents.active = Array.isArray(state.seasonEvents.active) ? state.seasonEvents.active : [];
    state.seasonEvents.claimed = Array.isArray(state.seasonEvents.claimed) ? state.seasonEvents.claimed : [];
    state.seasonEvents.lastRefreshAt = Math.max(0, Math.round(toNum(state.seasonEvents.lastRefreshAt,0)));
    state.seasonalPass = normalizeSeasonalPass(state.seasonalPass, state.createdAt || Date.now());
  }
  function v316IsSticker(it){ return /sticker/i.test(String((it && (it.category || it.name || it.displayName)) || '')); }
  function v316IsCosmeticNoWear(it){ return /sticker|patch|keychain|collectible|viewer pass|operation .*pass|souvenir package/i.test(String((it && (it.category || it.name || it.displayName)) || '')); }
  function v316SourceForName(name){ return V316_PRICE_SOURCES[Math.floor(stableNoise('src:'+name) * V316_PRICE_SOURCES.length) % V316_PRICE_SOURCES.length]; }
  function v316StickerSourceRub(lower, rarity){
    const base = stickerRub(lower, rarity || 'High Grade');
    const src = v316SourceForName(lower);
    const srcMul = src === 'CS.MONEY' ? 1.08 : src === 'LIS-SKINS' ? .94 : 1.0;
    const individuality = .88 + stableNoise('sticker-price:'+lower) * .32;
    const star = /donk|m0nesy|monesy|zywoo|s1mple|navi|spirit|g2|faze|vitality|cloud9|dignitas|titan|ibuyPower|reason/i.test(lower) ? 1.12 : 1;
    return Math.max(15, Math.round(base * srcMul * individuality * star));
  }
  function v316CaseGroup(c){ return bpCaseGroup(c); }
  function v316CaseMin(c){
    const g = v316CaseGroup(c || {});
    if((c && c.kind) === 'collection') return V316_CASE_TYPE_LIMITS.collection;
    if((c && c.kind) === 'custom') return V316_CASE_TYPE_LIMITS.custom;
    return V316_CASE_TYPE_LIMITS[g] || 250;
  }
  function v316RebalanceCase(c, idx=0){
    if(!c || !Array.isArray(c.items) || !c.items.length) return c;
    const out = Object.assign({}, c);
    const ev = expectedDropValue(out.items, out.kind || 'case');
    const group = v316CaseGroup(out);
    const min = v316CaseMin(out);
    const max = group === 'special' ? 90000 : group === 'stickers' ? 16000 : 32000;
    const houseMult = group === 'special' ? 1.18 : group === 'stickers' ? 1.08 : group === 'quality' ? 1.12 : group === 'limited' ? 1.20 : 1.15;
    const lucky = stableNoise(`lucky-case:${state.createdAt||'new'}:${out.id||out.name}`) > .84;
    let price = Math.max(toNum(out.price, min), Math.round(ev * houseMult));
    if(lucky){ price = Math.min(price, Math.round(ev * (.78 + stableNoise('lucky-price:'+out.id) * .16))); out._luckyPersonal = true; }
    out.price = clamp(Math.round(price), min, max);
    out._balance = {ev:Math.round(ev), min, group, lucky:!!lucky};
    return out;
  }

  const v316OldApplySteamLikePrice = applySteamLikePrice;
  applySteamLikePrice = function(it){
    const priced = v316OldApplySteamLikePrice(it || {});
    const category = String((it && it.category) || priced.category || '').toLowerCase();
    const lower = String(priced.name || priced.marketHashName || '').toLowerCase();
    if(category === 'sticker' || /sticker \|/i.test(priced.name || '')){
      const value = v316StickerSourceRub(lower, priced.rarity || 'High Grade');
      priced.value = value;
      priced.steamRub = value;
      priced.steamUsd = Math.round(value / RUB_PER_USD * 100) / 100;
      priced.priceSource = v316SourceForName(lower);
      priced.priceVersion = PRICE_VERSION;
      priced.wear = '';
      priced.float = '';
    }else{
      priced.priceSource = v316SourceForName(lower || priced.name || 'item');
    }
    return priced;
  };

  compactInvItem = function(it){
    if(!it) return null;
    const r = it.rarity || 'Mil-Spec Grade';
    const noWear = v316IsCosmeticNoWear(it);
    return {
      uid: it.uid || id(), id: it.id || it.baseId || slug(it.name || it.displayName || 'item'), baseId: it.baseId || it.id || slug(it.name || it.displayName || 'item'),
      name: it.name || it.displayName || 'CS2 Item', displayName: it.displayName || it.name || 'CS2 Item',
      rarity: r, rarityColor: it.rarityColor || rarityColors[r] || '#60a5fa', category: it.category || 'skin',
      value: Math.max(1, Math.round(toNum(it.value, 100))), steamUsd: it.steamUsd || undefined, steamRub: it.steamRub || undefined, currency: it.currency || CURRENCY, priceVersion: it.priceVersion || PRICE_VERSION, marketHashName: it.marketHashName || it.market_hash_name || it.name,
      image: fixImageUrl(it.image) || svgSkin(it.name || it.displayName || 'CS2 Item'), wear: noWear ? '' : (it.wear || ''), float: noWear ? '' : (it.float || ''), source: it.source || '', priceSource: it.priceSource || '', favorite: !!it.favorite, protected: !!it.protected, addedAt: Math.max(0, Math.round(toNum(it.addedAt, Date.now())))
    };
  };

  const v316OldLoadCatalog = loadCatalog;
  loadCatalog = async function(){
    const cat = await v316OldLoadCatalog();
    cat.items = (cat.items || []).map(x => applySteamLikePrice(x));
    cat.cases = (cat.cases || []).map(v316RebalanceCase);
    return cat;
  };

  const v316OldMaybeAutoSellDrop = typeof maybeAutoSellDrop === 'function' ? maybeAutoSellDrop : null;
  maybeAutoSellDrop = function(it, source){
    if(/^upgrade/i.test(String(source||''))) return false;
    return v316OldMaybeAutoSellDrop ? v316OldMaybeAutoSellDrop(it, source) : false;
  };

  applySaleCommission = function(gross){ return Math.max(0, Math.round(toNum(gross,0))); };

  addItem = function(base, source='drop'){
    const priced = applySteamLikePrice(Object.assign({}, base || {}));
    const noWear = v316IsCosmeticNoWear(priced);
    const w = noWear ? null : sample(wears);
    const stattrak = !noWear && cryptoRandom() < 0.07 && !String(priced.name).startsWith('★');
    const valueMult = noWear ? (.96 + stableNoise(`${priced.name}:${source}:${Date.now()}`) * .08) : (w[1] * (stattrak?1.5:1) * rnd(.88,1.16));
    const item = compactInvItem(Object.assign({}, priced, {uid:id(), baseId:priced.id, displayName:(stattrak?'StatTrak™ ':'') + priced.name, wear:noWear?'':w[0], float:noWear?'':rnd(w[2],w[3]).toFixed(5), value:Math.max(1, Math.round(toNum(priced.value,100) * valueMult)), source, addedAt:Date.now()}));
    if(noWear){ item.wear=''; item.float=''; }
    state.inventory.unshift(item);
    state.inventory = state.inventory.slice(0,600);
    addXP(8 + Math.min(60, Math.round(item.value / 5000)), `Предмет: ${item.displayName||item.name}`);
    if(typeof checkMajorAlbumPickup === 'function') checkMajorAlbumPickup(item);
    if(typeof maybeAutoSellDrop === 'function') maybeAutoSellDrop(item, source);
    save();
    return item;
  };

  itemCard = function(it, opts={}){
    const buttons = opts.buttons ? `<div class="item-actions">${opts.buttons}</div>` : '';
    const noWear = v316IsCosmeticNoWear(it);
    const meta = noWear ? `${esc(it.rarity||'Предмет')}${it.priceSource?` · ${esc(it.priceSource)}`:''}` : `${esc(it.rarity||'Skin')}${it.wear?` · ${esc(it.wear)}`:''}${it.float?` · ${esc(it.float)}`:''}`;
    return `<article class="item-card ${opts.selected?'selected':''} ${it.favorite?'favorite':''} ${it.protected?'protected':''}" data-uid="${esc(it.uid||'')}" data-item-id="${esc(it.id||'')}" style="--rar:${it.rarityColor||'#60a5fa'}"><div class="item-art">${itemImageOrPlaceholder(it)}</div><h4>${it.favorite?'★ ':''}${it.protected?'🔒 ':''}${esc(it.displayName||it.name)}</h4><small>${meta}</small><div class="value-row"><b>${fmt(it.value)}</b>${opts.badge?`<span class="pill">${esc(opts.badge)}</span>`:''}</div>${buttons}</article>`;
  };

  showDrop = function(it,c){
    const noWear = v316IsCosmeticNoWear(it);
    const meta = noWear ? `${esc(it.rarity||'Предмет')}${it.priceSource?` · цена: ${esc(it.priceSource)}`:''}` : `${esc(it.rarity)}${it.wear?` · ${esc(it.wear)}`:''}${it.float?` · float ${esc(it.float)}`:''}`;
    $('#dropModalBody').innerHTML = `<div class="drop-box"><p class="kicker">Выпал предмет</p>${imgTag(it.image, it.name, 'drop-img')}<h2 style="color:${it.rarityColor||'#fff'}">${esc(it.displayName||it.name)}</h2><p>${meta}</p><h3>${fmt(it.value)}</h3><div class="drop-actions"><button class="btn green" data-sell="${esc(it.uid)}">Продать за ${fmt(it.value)}</button><button class="btn" data-close-modal>Оставить</button><button class="btn blue" data-upgrade-item="${esc(it.uid)}">В апгрейд</button><button class="btn" data-contract-item="${esc(it.uid)}">В контракт</button>${c?`<button class="btn primary" data-action="open-again">Открыть ещё</button><button class="btn blue" data-action="open-again-fast">Быстро ещё</button>`:''}</div></div>`;
    openModal('#dropModal');
  };

  sellItem = function(uid){
    const it = state.inventory.find(x => x.uid === uid);
    if(!it) return toast('Предмет уже не найден в инвентаре','bad');
    if(it.protected) return toast('Предмет защищён от продажи. Сними замок в инвентаре.','bad');
    const gross = Math.round(toNum(it.value,0));
    removeItems(uid);
    state.sold += gross;
    earn(gross, `Продажа ${it.displayName||it.name}`);
    bpEvent('sell', {value:gross, count:1});
    route();
  };
  sellBatch = function(uids){
    const set = new Set((uids||[]).filter(Boolean));
    const arr = state.inventory.filter(x=>set.has(x.uid) && !x.protected);
    if(!arr.length) return toast('Нет предметов для продажи','bad');
    const sum = arr.reduce((s,x)=>s+Math.round(toNum(x.value,0)),0);
    removeItems(arr.map(x=>x.uid));
    state.sold += sum;
    earn(sum, `Массовая продажа ${arr.length} предметов`);
    bpEvent('sell', {value:sum, count:arr.length});
    route();
  };

  function v316UpgradeStop(success, ch){
    const width = clamp(ch, 4, 78);
    const left = 50 - width/2, right = 50 + width/2;
    if(success) return rnd(left + .8, right - .8);
    return cryptoRandom() < .5 ? rnd(3, Math.max(4,left-1)) : rnd(Math.min(96,right+1),97);
  }
  renderUpgrade = function(){
    const root = $('#upgradeRoot'); if(!root) return;
    upgradeMode = upgradeTargetMultiplier();
    const inv = [...state.inventory].filter(x=>!x.protected).sort((a,b)=>toNum(b.value,0)-toNum(a.value,0));
    const selected = state.pendingUpgrade ? inv.find(x=>x.uid===state.pendingUpgrade) : null;
    if(state.pendingUpgrade && !selected){ state.pendingUpgrade = null; save(); }
    const sourceValue = selected ? selected.uid : '__BALANCE__';
    const balanceDefault = selected ? 0 : Math.min(Math.round(toNum(state.balance,0)), 1000);
    const options = `<option value="__BALANCE__" ${!selected?'selected':''}>Баланс без скина</option>` + inv.map(x=>`<option value="${esc(x.uid)}" ${sourceValue===x.uid?'selected':''}>${esc(x.displayName||x.name)} · ${fmt(x.value)}</option>`).join('');
    root.innerHTML = `<div class="upgrade-layout upgrade-layout-pro"><aside class="panel upgrade-sidebar"><span class="kicker">Upgrade 3.0 · fixed sync</span><h3>Ставка</h3><label class="field-label">Источник</label><select id="upgradeSource">${options}</select><div id="upgradeSourcePreview">${selected?itemCard(selected):'<div class="empty">Можно апгрейдить только балансом — без скина.</div>'}</div><label class="field-label">Добавить с баланса</label><input id="upgradeBalanceAmount" type="number" min="0" step="50" value="${balanceDefault}" placeholder="Сумма доплаты"><div class="upgrade-tabs" role="tablist"><button class="small-btn ${upgradeMode===75?'active':''}" data-action="set-upgrade-mult" data-mult="75">75%</button><button class="small-btn ${upgradeMode===67?'active':''}" data-action="set-upgrade-mult" data-mult="67">67%</button><button class="small-btn ${upgradeMode===2?'active':''}" data-action="set-upgrade-mult" data-mult="2">2x</button><button class="small-btn ${upgradeMode===3?'active':''}" data-action="set-upgrade-mult" data-mult="3">3x</button><button class="small-btn ${upgradeMode===5?'active':''}" data-action="set-upgrade-mult" data-mult="5">5x</button><button class="small-btn ${upgradeMode===10?'active':''}" data-action="set-upgrade-mult" data-mult="10">10x</button></div><div id="upgradeChance"></div><button class="btn primary huge" data-action="do-upgrade">Апгрейд</button><p class="small">Результат и анимация теперь используют одну шкалу 0–100%. Визуальный WIN всегда совпадает с выдачей предмета.</p></aside><section><div class="upgrade-roulette v316" id="upgradeRoulette"><div class="upgrade-scale"><span class="loss left">LOSE</span><span class="win" id="upgradeWinZone">WIN</span><span class="loss right">LOSE</span><i class="upgrade-marker" id="upgradeMarker">◆</i></div></div><div class="notice"><b>Автоподбор:</b> выбери режим — список ниже подберёт цель под выбранный риск.</div><div class="filters"><input id="targetSearch" placeholder="Поиск цели"></div><div id="upgradeTargets" class="target-row"></div></section></div>`;
    renderUpgradeTargets();
  };
  updateUpgradeChance = function(){
    const input = upgradeInputValue();
    const src = selectedUpgradeSource();
    const add = upgradeBalanceAmount();
    const ch = chance(input,currentTarget);
    const el = $('#upgradeChance');
    if(el) el.innerHTML = input && currentTarget ? `<div class="upgrade-summary"><p>Ставка: <b>${fmt(input)}</b> ${src?`<span>скин ${fmt(src.value)}</span>`:''} ${add?`<span>+ баланс ${fmt(add)}</span>`:''}</p><p>Режим: <b>${upgradeModeText()}</b></p><p>Цель: <b>${esc(currentTarget.name)}</b> · ${fmt(currentTarget.value)}</p></div><div class="chance"><span style="width:${ch}%"></span></div><b>${ch.toFixed(2)}%</b>` : '<p class="small">Укажи сумму или выбери скин, чтобы увидеть шанс.</p>';
    const win = $('#upgradeWinZone'); if(win){ const w=clamp(ch,4,78); win.style.left = `${50-w/2}%`; win.style.width = `${w}%`; }
  };
  doUpgrade = function(){
    if(busy.upgrade) return toast('Апгрейд уже крутится','warn');
    const src = selectedUpgradeSource();
    const add = upgradeBalanceAmount();
    const input = Math.round((src ? toNum(src.value,0) : 0) + add);
    const tgt = currentTarget;
    if(input <= 0) return toast('Выбери скин или сумму с баланса','bad');
    if(add > toNum(state.balance,0)) return toast('Недостаточно баланса для доплаты','bad');
    if(!tgt) return toast('Цель не найдена','bad');
    const ch = chance(input,tgt);
    const success = cryptoRandom() < (ch / 100);
    const stop = v316UpgradeStop(success, ch);
    busy.upgrade = true;
    const btn = $('[data-action="do-upgrade"]'); if(btn){ btn.disabled=true; btn.textContent='Крутится...'; }
    if(add > 0 && !spend(add, src ? 'Доплата к апгрейду' : 'Апгрейд за баланс')){ busy.upgrade=false; if(btn){btn.disabled=false; btn.textContent='Апгрейд';} return; }
    const marker = $('#upgradeMarker');
    if(marker){ marker.classList.remove('win','lose'); marker.style.transition='none'; marker.style.left='50%'; marker.getBoundingClientRect(); requestAnimationFrame(()=>{ marker.style.transition='left 3.2s cubic-bezier(.08,.75,.08,1), transform .25s ease'; marker.style.left = `${stop}%`; marker.classList.add(success?'win':'lose'); }); }
    setTimeout(()=>{
      if(src) removeItems(src.uid);
      state.upgrades += 1;
      if(success){ const win = addItem(tgt,'upgrade'); state.pendingUpgrade=win.uid; addLive('Ты',win); toast(`Апгрейд успешен: ${win.displayName}`,'good'); showDrop(win,null); }
      else{ state.pendingUpgrade=null; toast('Апгрейд не прошёл: ставка сгорела','bad'); }
      bpEvent('upgrade', {success});
      busy.upgrade=false; save(); renderUpgrade();
    }, 3400);
  };

  function v316TierDefs(baseId, title, desc, metric, thresholds, rewards, filter){
    return thresholds.map((need,idx)=>({id:`${baseId}-t${idx+1}`, baseId, level:idx+1, maxLevel:thresholds.length, title:`${title} · ур. ${idx+1}`, desc:`${desc}. Уровень ${idx+1}/${thresholds.length}`, need, filter, metric, reward:rewards[idx]}));
  }
  achievementList = function(){
    const tiers = [];
    tiers.push(...v316TierDefs('cases','Кейс-машина','Открывай кейсы','opened',[1,25,75,180,420],[1200,4500,11000,26000,65000]));
    tiers.push(...v316TierDefs('upgrades','Апгрейдер','Делай апгрейды','upgrades',[1,8,25,60,140],[1500,6500,16000,38000,85000]));
    tiers.push(...v316TierDefs('contracts','Контрактник','Создавай контракты','contracts',[1,5,15,35],[1800,8500,23000,52000]));
    tiers.push(...v316TierDefs('mines','Сапёр','Выигрывай в сапёре','minesWins',[1,5,15,40],[2200,12000,32000,76000]));
    tiers.push({id:'first-knife-t1', title:'Нож в инвентаре · ур. 1', desc:'Получить любой нож/золотой предмет. Уровень 1/3', need:1, level:1, maxLevel:3, filter:x=>/^★/.test(x.name||x.displayName||'') || ['Exceedingly Rare','Extraordinary'].includes(x.rarity), reward:22000, item:true});
    tiers.push({id:'first-knife-t2', title:'Ножевой клуб · ур. 2', desc:'Иметь 3 ножа/золотых предмета. Уровень 2/3', need:3, level:2, maxLevel:3, filter:x=>/^★/.test(x.name||x.displayName||'') || ['Exceedingly Rare','Extraordinary'].includes(x.rarity), reward:65000, item:true});
    tiers.push({id:'first-knife-t3', title:'Витрина редкостей · ур. 3', desc:'Иметь 7 ножей/золотых предметов. Уровень 3/3', need:7, level:3, maxLevel:3, filter:x=>/^★/.test(x.name||x.displayName||'') || ['Exceedingly Rare','Extraordinary'].includes(x.rarity), reward:145000, item:true});
    tiers.push(...[150000,500000,1000000,2500000].map((need,i)=>({id:`profile-power-t${i+1}`, title:`Профиль ${['Gold Nova','Guardian','Supreme','Global'][i]} · ур. ${i+1}`, desc:`Достичь оценки профиля ${fmt(need)}. Уровень ${i+1}/4`, done:()=>profilePower()>=need, reward:[10000,30000,65000,150000][i], item:i>=2})));
    return tiers.map(a=>Object.assign({done:()=> a.filter ? state.inventory.filter(a.filter).length >= a.need : (a.metric ? toNum(state[a.metric],0) >= a.need : false)}, a));
  };
  claimAchievement = function(idv){
    const a = achievementList().find(x=>x.id===idv); if(!a) return toast('Достижение не найдено','bad');
    state.achievementsClaimed = Array.isArray(state.achievementsClaimed) ? state.achievementsClaimed : [];
    if(state.achievementsClaimed.includes(a.id)) return toast('Награда уже получена','warn');
    if(!a.done()) return toast('Условие достижения ещё не выполнено','bad');
    state.achievementsClaimed.push(a.id); earn(a.reward, `Достижение: ${a.title}`);
    addXP(120 * (a.level || 1), 'Уровень достижения');
    if(a.item){ const pool = catalog.items.filter(x=>toNum(x.value,0)>=9000); if(pool.length){ const it=addItem(sample(pool),'achievement'); addLive('Ты',it); showDrop(it,null); } }
    save(); renderHub();
  };

  collectorMissions = function(){
    const defs = [];
    defs.push(...v316TierDefs('mission-awp','AWP Hunter','Собирай AWP-предметы','',[2,5,10,18],[{type:'item',min:2000,max:18000},{type:'item',min:6000,max:35000},{type:'xp_tokens',xp:1800,tokens:110},{type:'item',min:25000,max:110000}],x=>/AWP/i.test(x.name||x.displayName||'')));
    defs.push(...v316TierDefs('mission-holo','Holo Collector','Собирай Holo/Gold наклейки','',[2,5,9,16],[{type:'tokens',amount:45},{type:'category',category:'sticker',min:1000,max:18000},{type:'xp_tokens',xp:2200,tokens:160},{type:'category',category:'sticker',min:6000,max:70000}],x=>/Holo|Gold|Foil|Lenticular/i.test(x.name||'')&&/sticker/i.test(x.category||x.name||'')));
    defs.push(...v316TierDefs('mission-knife','Knife Dream','Получай ножи или перчатки','',[1,2,5],[{type:'xp_tokens',xp:800,tokens:80},{type:'item',min:12000,max:45000},{type:'item',min:45000,max:180000}],x=>/^★|Knife|Gloves/i.test(x.name||x.displayName||'')));
    defs.push(...v316TierDefs('mission-pass','Pass Collector','Собирай viewer/operation pass','',[1,3,6],[{type:'tokens',amount:50},{type:'item',min:1500,max:18000},{type:'xp_tokens',xp:2500,tokens:190}],x=>/viewer pass|operation .*pass|access pass/i.test(x.name||x.displayName||'')));
    return defs.map(m=>Object.assign(m,{desc:`${m.desc}. Нужно: ${m.need}. Награда растёт с уровнем.`}));
  };

  const v316MajorTaskPool = Object.freeze([
    ['katowice-2014','Katowice 2014',/katowice 2014/i,{type:'tokens',amount:90}], ['cologne-2014','Cologne 2014',/cologne 2014/i,{type:'tokens',amount:55}], ['atlanta-2017','Atlanta 2017',/atlanta 2017/i,{type:'xp',amount:1000}], ['boston-2018','Boston 2018',/boston 2018/i,{type:'tokens',amount:45}], ['stockholm-2021','Stockholm 2021',/stockholm 2021/i,{type:'category',category:'sticker',min:700,max:14000}], ['antwerp-2022','Antwerp 2022',/antwerp 2022/i,{type:'tokens',amount:45}], ['paris-2023','Paris 2023',/paris 2023/i,{type:'xp_tokens',xp:700,tokens:40}], ['copenhagen-2024','Copenhagen 2024',/copenhagen 2024/i,{type:'category',category:'sticker',min:600,max:18000}], ['shanghai-2024','Shanghai 2024',/shanghai 2024/i,{type:'category',category:'sticker',min:600,max:18000}], ['austin-2025','Austin 2025',/austin 2025/i,{type:'category',category:'sticker',min:700,max:21000}], ['holo-gold','Holo / Gold',/holo|gold|foil|lenticular/i,{type:'tokens',amount:80}], ['legacy','Legacy Teams',/dignitas|ibuypower|titan|reason|vox eminor/i,{type:'item',min:5000,max:70000}], ['navi','NAVI',/navi|natus vincere/i,{type:'tokens',amount:60}], ['spirit','Team Spirit',/team spirit|donk/i,{type:'tokens',amount:60}], ['faze','FaZe Clan',/faze clan/i,{type:'tokens',amount:50}], ['g2','G2 / m0NESY',/g2 esports|m0nesy|monesy/i,{type:'category',category:'sticker',min:800,max:24000}]
  ]);
  function v316GenerateMajorTasks(force=false){
    v316Ensure();
    if(state.majorAlbum.tasks.length && !force) return;
    const seed = `major:${state.createdAt||Date.now()}:${state.majorAlbum.lastRefreshAt||0}`;
    state.majorAlbum.tasks = [...v316MajorTaskPool].sort((a,b)=>stableNoise(seed+a[0])-stableNoise(seed+b[0])).slice(0,12).map(x=>x[0]);
  }
  majorAlbumSlots = function(){
    v316GenerateMajorTasks(false);
    return state.majorAlbum.tasks.map(idv=>{ const x=v316MajorTaskPool.find(t=>t[0]===idv); return {id:x[0], title:x[1], match:x[2], reward:x[3]}; });
  };
  majorAlbumHtml = function(){
    v316Ensure(); v316GenerateMajorTasks(false);
    const slots=majorAlbumSlots(); const inv=state.inventory||[]; const currentFilled = slots.filter(s=>state.majorAlbum.claimed.includes(s.id) || inv.some(x=>majorAlbumKey(x)===s.id)).length; const canRefresh = Date.now() - toNum(state.majorAlbum.lastRefreshAt,0) >= V316_MAJOR_REFRESH_COOLDOWN;
    return `<section class="panel block major-album"><div class="head"><div><h2>Альбом наклеек Major</h2><p>Теперь это набор случайных задач: команды, турниры, Holo/Gold и legacy-наклейки. Можно обновлять список задач кнопкой.</p></div><div><b>${currentFilled}/${slots.length}</b><button class="btn" data-action="refresh-major-album" ${canRefresh?'':'disabled'}>Обновить альбом</button></div></div><div class="album-grid">${slots.map(s=>{ const has=state.majorAlbum.claimed.includes(s.id) || inv.some(x=>majorAlbumKey(x)===s.id); if(has && !state.majorAlbum.claimed.includes(s.id)) state.majorAlbum.claimed.push(s.id); const rew=(state.majorAlbum.rewards||[]).includes(s.id); return `<article class="album-slot ${has?'filled':''}"><h3>${has?'🏷️':'▫️'} ${esc(s.title)}</h3><p>${has?'Задача закрыта':'Найди подходящую наклейку'}</p><button class="btn ${has&&!rew?'primary':''}" data-action="claim-major-album" data-album="${esc(s.id)}" ${has&&!rew?'':'disabled'}>${rew?'Награда получена':has?'Забрать награду':'В процессе'}</button></article>`; }).join('')}</div></section>`;
  };
  function refreshMajorAlbum(){ v316Ensure(); state.majorAlbum.lastRefreshAt = Date.now(); state.majorAlbum.tasks = []; v316GenerateMajorTasks(true); save(); renderHub(); toast('Альбом Major обновлён: задачи сгенерированы заново','good'); }

  function v316SeasonalEventPool(){ return [
    {id:'dragon-week', title:'Dragon Week', desc:'Открой кейсы и получи жетоны.', need:18, metric:'opened', reward:{type:'tokens',amount:80}},
    {id:'sticker-fest', title:'Sticker Fest', desc:'Собери наклейки в инвентаре.', need:5, metric:'stickers', reward:{type:'category',category:'sticker',min:1000,max:20000}},
    {id:'knife-hunt', title:'Knife Hunt', desc:'Сыграй Case Battle.', need:5, metric:'battles', reward:{type:'item',min:2500,max:26000}},
    {id:'upgrade-rush', title:'Upgrade Rush', desc:'Сделай апгрейды.', need:8, metric:'upgrades', reward:{type:'xp_tokens',xp:900,tokens:70}},
    {id:'contract-chain', title:'Contract Chain', desc:'Собери контракты.', need:4, metric:'contracts', reward:{type:'item',min:2500,max:30000}},
    {id:'miner-night', title:'Miner Night', desc:'Выиграй в сапёре.', need:3, metric:'minesWins', reward:{type:'tokens',amount:95}},
    {id:'market-day', title:'Market Day', desc:'Купи предметы на маркете.', need:3, metric:'marketBought', reward:{type:'balance',amount:9000}},
    {id:'creator-lab', title:'Creator Lab', desc:'Создай кастомные кейсы.', need:2, metric:'createdCases', reward:{type:'xp_tokens',xp:1200,tokens:90}}
    ]; }
  seasonalEventDefs = function(){
    v316Ensure();
    if(!state.seasonEvents.active.length){ const seed='season-events:'+DAY_KEY()+':'+(state.createdAt||''); state.seasonEvents.active = v316SeasonalEventPool().sort((a,b)=>stableNoise(seed+a.id)-stableNoise(seed+b.id)).slice(0,3).map(x=>x.id); }
    return state.seasonEvents.active.map(idv=>v316SeasonalEventPool().find(x=>x.id===idv)).filter(Boolean);
  };
  eventProgress = function(ev){
    if(ev.metric==='opened') return Math.min(state.opened||0,ev.need);
    if(ev.metric==='battles') return Math.min(state.battles||0,ev.need);
    if(ev.metric==='upgrades') return Math.min(state.upgrades||0,ev.need);
    if(ev.metric==='contracts') return Math.min(state.contracts||0,ev.need);
    if(ev.metric==='minesWins') return Math.min(state.minesWins||0,ev.need);
    if(ev.metric==='createdCases') return Math.min(state.createdCases||0,ev.need);
    if(ev.metric==='marketBought') return Math.min(toNum(state.market && state.market.bought,0),ev.need);
    if(ev.metric==='stickers') return Math.min(state.inventory.filter(x=>/sticker/i.test(x.category||x.name||'')).length,ev.need);
    return 0;
  };
  function refreshSeasonEvents(){
    v316Ensure();
    if(Date.now() - state.seasonEvents.lastRefreshAt < V316_EVENT_REFRESH_COOLDOWN) return toast('Сезонные ивенты можно обновлять 1 раз в сутки','warn');
    state.seasonEvents.lastRefreshAt = Date.now();
    const seed='season-events-refresh:'+Date.now()+':'+(state.createdAt||'');
    state.seasonEvents.active = v316SeasonalEventPool().sort((a,b)=>stableNoise(seed+a.id)-stableNoise(seed+b.id)).slice(0,3).map(x=>x.id);
    save(); renderHub(); toast('Сезонные ивенты обновлены','good');
  }

  seasonStoreItems = function(){ return [
    {id:'case', title:'Season Drop Case', cost:30, type:'item', min:800, max:12000}, {id:'xp', title:'XP Boost', cost:20, type:'xp', amount:500}, {id:'sticker', title:'Sticker Pack', cost:24, type:'category', category:'sticker', min:400, max:9000}, {id:'premium', title:'Premium Skin Drop', cost:70, type:'item', min:5000, max:60000}, {id:'avatar', title:'Profile Cosmetic', cost:18, type:'profile'},
    {id:'major', title:'Major Capsule Drop', cost:42, type:'category', category:'sticker', min:1000, max:30000}, {id:'knife-ticket', title:'Knife Ticket', cost:125, type:'item', min:18000, max:95000}, {id:'pass', title:'Viewer/Operation Pass', cost:36, type:'item', min:850, max:9800}, {id:'case-credit', title:'Balance Pack', cost:28, type:'balance', amount:9000}, {id:'dragon', title:'Dragon Premium', cost:180, type:'item', min:35000, max:180000}
  ]; };
  function buySeasonStoreQty(idv, qty){
    const it=seasonStoreItems().find(x=>x.id===idv); if(!it) return toast('Товар не найден','bad');
    qty = qty === 'all' ? Math.floor(toNum(state.seasonTokens,0) / it.cost) : Math.max(1, Math.round(toNum(qty,1)));
    qty = clamp(qty,1,100);
    const total = it.cost * qty;
    if(toNum(state.seasonTokens,0)<total) return toast(`Нужно ${total} ${SEASON_TOKEN_NAME}`,'bad');
    state.seasonTokens -= total;
    for(let i=0;i<qty;i++) applyRewardObject(it, `Season Store x${qty}: ${it.title}`);
    save(); renderHub();
  }
  buySeasonStore = function(idv){ return buySeasonStoreQty(idv, 1); };

  function v316SeasonStoreHtml(){ const items=seasonStoreItems(); return `<section class="panel block season-store-v316"><div class="head"><div><h2>Сезонный магазин 2.0</h2><p>Баланс жетонов: <b>${toNum(state.seasonTokens,0)} ${SEASON_TOKEN_NAME}</b>. Массовая покупка: 3, 10 или на все жетоны.</p></div></div><div class="grid cards-5">${items.map(x=>`<article class="mini-card"><h3>${esc(x.title)}</h3><p>Цена: <b>${x.cost} ${SEASON_TOKEN_NAME}</b></p><div class="mass-buy"><button class="btn primary" data-action="buy-season-store-v316" data-store="${x.id}" data-qty="1" ${toNum(state.seasonTokens,0)>=x.cost?'':'disabled'}>1</button><button class="btn" data-action="buy-season-store-v316" data-store="${x.id}" data-qty="3" ${toNum(state.seasonTokens,0)>=x.cost*3?'':'disabled'}>x3</button><button class="btn" data-action="buy-season-store-v316" data-store="${x.id}" data-qty="10" ${toNum(state.seasonTokens,0)>=x.cost*10?'':'disabled'}>x10</button><button class="btn" data-action="buy-season-store-v316" data-store="${x.id}" data-qty="all" ${toNum(state.seasonTokens,0)>=x.cost?'':'disabled'}>Все</button></div></article>`).join('')}</div></section>`; }
  function v316SeasonEventsPanelHtml(){ v316Ensure(); const left = Math.max(0,V316_EVENT_REFRESH_COOLDOWN - (Date.now()-state.seasonEvents.lastRefreshAt)); return `<section class="panel block"><div class="head"><div><h2>Обновление сезонных ивентов</h2><p>Можно обновить случайный набор ивентов не чаще 1 раза в сутки.</p></div><button class="btn primary" data-action="refresh-season-events" ${left<=0?'':'disabled'}>${left<=0?'Обновить ивенты':`Доступно через ${formatTime(left)}`}</button></div></section>`; }
  function v316TeamEventHtml(){
    const theme = getTheme(currentThemeId());
    if(!TEAM_THEMES.includes(theme.id)) return `<section class="panel block"><div class="head"><div><h2>Командный ивент темы 2.0</h2><p>Выбери командную тему в левом верхнем переключателе, чтобы открыть прогресс и награды.</p></div></div><div class="notice">Classic/Dark/Light не участвуют. Командные темы: NAVI, FaZe, Spirit, Vitality и другие.</div></section>`;
    const st=teamEventState(theme.id); const levels=[{need:8,reward:{type:'tokens',amount:50},label:'Фан-разогрев'},{need:18,reward:{type:'item',min:1200,max:25000},label:'Team Drop'},{need:36,reward:{type:'item',min:10000,max:70000},label:'MVP Prize'}];
    const claimed=Array.isArray(st.claimedLevels)?st.claimedLevels:[];
    return `<section class="panel block team-event-v316"><div class="head"><div><h2>Командный ивент темы 2.0</h2><p><span class="theme-badge theme-badge-${esc(theme.id)}">${esc(theme.logo)}</span> ${esc(theme.title)}: открывай кейсы с активной темой и закрывай уровни наград.</p></div><b>${st.count} открытий</b></div><div class="grid cards-3">${levels.map((l,i)=>{ const done=st.count>=l.need, got=claimed.includes(i+1); return `<article class="mini-card ${got?'claimed':done?'ready':''}"><h3>${esc(l.label)} · ур. ${i+1}</h3><div class="bp-bar"><span style="width:${clamp(st.count/l.need*100,0,100)}%"></span></div><small>${Math.min(st.count,l.need)} / ${l.need}</small><button class="btn ${done&&!got?'primary':''}" data-action="claim-theme-event-v316" data-theme="${esc(theme.id)}" data-team-level="${i+1}" ${done&&!got?'':'disabled'}>${got?'Получено':done?'Забрать':'В процессе'}</button></article>`; }).join('')}</div></section>`;
  }
  teamEventState = function(themeId){ state.themeEvents = state.themeEvents || {}; const old = state.themeEvents[themeId] || {}; const t = {count:Math.max(0,Math.round(toNum(old.count,0))), claimed:!!old.claimed, claimedLevels:Array.isArray(old.claimedLevels)?old.claimedLevels:[]}; state.themeEvents[themeId]=t; return t; };
  function claimThemeEventLevel(themeId, level){
    if(!TEAM_THEMES.includes(themeId)) return toast('Командный ивент не найден','bad');
    const rewards=[{type:'tokens',amount:50},{type:'item',min:1200,max:25000},{type:'item',min:10000,max:70000}], needs=[8,18,36];
    const t=teamEventState(themeId); level=clamp(Math.round(toNum(level,1)),1,3);
    if(t.claimedLevels.includes(level)) return toast('Награда уровня уже получена','warn');
    if(t.count<needs[level-1]) return toast('Нужно открыть больше кейсов в этой теме','bad');
    t.claimedLevels.push(level); state.themeEvents[themeId]=t; applyRewardObject(rewards[level-1], `${getTheme(themeId).title} event ур. ${level}`); save(); renderHub();
  }

  function v316CreatorHtml(){
    const cc=(state.customCases||[]).map(x=>`<div class="tx"><div><b>${esc(x.name)}</b><small>${fmt(x.price)} · ${x.itemIds.length} предметов · ${esc(x.theme||'custom')}</small></div><button class="small-btn" data-action="delete-custom-case" data-case="${esc(x.id)}">Удалить</button></div>`).join('') || '<p class="small">Пока нет кастомных кейсов.</p>';
    return `<section class="panel block case-creator-v316"><div class="head"><div><h2>Case Creator 2.0</h2><p>Тип кейса задаёт минимальную цену и баланс пула: budget, balanced, premium, sticker. Цена ниже лимита поднимется автоматически.</p></div></div><div class="creator-form"><input id="customCaseName" placeholder="Название кейса"><input id="customCasePrice" type="number" value="2500" min="200"><select id="customCaseMode"><option value="balanced">Balanced · от ${fmt(V316_CASE_TYPE_LIMITS.balanced)}</option><option value="budget">Budget · от ${fmt(V316_CASE_TYPE_LIMITS.budget)}</option><option value="premium">Premium · от ${fmt(V316_CASE_TYPE_LIMITS.premium)}</option><option value="stickers">Sticker Case · от ${fmt(V316_CASE_TYPE_LIMITS.creator_stickers)}</option></select><select id="customCaseSize"><option value="12">12 предметов</option><option value="18" selected>18 предметов</option><option value="30">30 предметов</option><option value="40">40 предметов</option></select><select id="customCaseRisk"><option value="safe">Safe</option><option value="normal" selected>Normal</option><option value="wild">Wild</option></select><button class="btn primary" data-action="create-custom-case">Создать кейс</button></div><div class="tx-list">${cc}</div></section>`;
  }
  customCaseObjects = function(){
    state.customCases = Array.isArray(state.customCases) ? state.customCases : [];
    return state.customCases.map(cc=>{ const items = cc.itemIds.map(pid=>catalog.items.find(x=>String(x.id||slug(x.name))===String(pid) || slug(x.name)===String(pid))).filter(Boolean); return v316RebalanceCase({id:cc.id, name:cc.name, price:cc.price, image:svgCase(cc.theme||'CUSTOM'), items:items.length?items:catalog.items.slice(0,12), source:'custom-creator', kind:'custom', theme:cc.theme, rareText:`Пользовательский кейс ${cc.theme||''}. Цена сбалансирована автоматически.`}); }).filter(c=>c.items.length>=3);
  };
  syncCustomCasesIntoCatalog = function(){ try{ const custom = customCaseObjects(); const ids = new Set(custom.map(x=>x.id)); catalog.cases = catalog.cases.filter(c=>c.source!=='custom-creator' && !ids.has(c.id)).concat(custom); }catch(e){} };
  createCustomCase = function(){
    const name = ($('#customCaseName') && $('#customCaseName').value.trim()) || 'My Custom Case';
    const mode = ($('#customCaseMode') && $('#customCaseMode').value) || 'balanced';
    const risk = ($('#customCaseRisk') && $('#customCaseRisk').value) || 'normal';
    const minPrice = mode==='premium'?V316_CASE_TYPE_LIMITS.premium:mode==='budget'?V316_CASE_TYPE_LIMITS.budget:mode==='stickers'?V316_CASE_TYPE_LIMITS.creator_stickers:V316_CASE_TYPE_LIMITS.balanced;
    let rawPrice = Math.round(toNum($('#customCasePrice') && $('#customCasePrice').value, minPrice));
    let pool = catalog.items.filter(x=>toNum(x.value,0)>0);
    if(mode==='stickers') pool = pool.filter(x=>/sticker/i.test(x.category||x.name||''));
    if(mode==='premium') pool = pool.filter(x=>toNum(x.value,0)>=3000);
    if(mode==='budget') pool = pool.filter(x=>toNum(x.value,0)<=9000);
    if(risk==='safe') pool = pool.filter(x=>toNum(x.value,0)<=Math.max(rawPrice*3,5000));
    if(risk==='wild') pool = pool.filter(x=>toNum(x.value,0)>=Math.max(200,rawPrice*.35));
    pool = pool.length?pool:catalog.items;
    const seed = `${Date.now()}:${name}:${mode}:${risk}`;
    const size = clamp(Math.round(toNum($('#customCaseSize')&&$('#customCaseSize').value,18)),8,40);
    const items = [...pool].sort((a,b)=>stableNoise(seed+':'+a.name)-stableNoise(seed+':'+b.name)).slice(0,size);
    const ev = expectedDropValue(items, 'custom');
    const fair = Math.round(ev * (risk==='wild'?1.18:risk==='safe'?1.28:1.22));
    const price = clamp(Math.max(rawPrice, minPrice, fair), minPrice, 90000);
    const cc = {id:'custom-'+slug(name)+'-'+Date.now().toString(36), name, price, theme:mode+'-'+risk, itemIds:items.map(x=>x.id||slug(x.name)), createdAt:Date.now()};
    state.customCases = Array.isArray(state.customCases) ? state.customCases : [];
    state.customCases.unshift(cc); state.customCases=state.customCases.slice(0,24); state.createdCases=Math.round(toNum(state.createdCases,0))+1; addXP(160,'Case Creator 2.0'); save(); syncCustomCasesIntoCatalog(); renderHub(); toast(`Кейс создан. Цена: ${fmt(price)} · EV: ${fmt(ev)}`,'good');
  };

  function v316ProfileCosmeticsHtml(){
    v316Ensure();
    const avatars=[['classic','✦'],['dragon','🐉'],['major','🏆'],['trader','💼'],['knife','🔪'],['sticker','🏷️'],['global','🌐'],['ruby','♦️'],['neon','⚡'],['ghost','👻'],['crown','👑'],['fire','🔥']];
    const titles=[...new Set([...profileTitleList(),'Case Creator','Major Collector','No Fee Trader','Upgrade Master','Season Grinder','Global Elite','Knife Dreamer'])];
    const frames=[['default','Default'],['event','Event'],['gold','Gold'],['neon','Neon'],['dragon','Dragon'],['major','Major']];
    const bgs=[['default','Default'],['dust','Dust II'],['inferno','Inferno'],['nuke','Nuke'],['major','Major Stage'],['dragon','Dragon Heat']];
    return `<div class="cosmetic-grid v316"><div><h3>Аватар</h3><div class="craft-row">${avatars.map(a=>`<button class="small-btn ${state.avatar===a[0]?'active':''}" data-action="set-avatar" data-avatar="${a[0]}">${a[1]}</button>`).join('')}</div></div><div><h3>Титул</h3><div class="craft-row">${titles.map(t=>`<button class="small-btn ${state.title===t?'active':''}" data-action="set-title" data-title="${esc(t)}">${esc(t)}</button>`).join('')}</div></div><div><h3>Рамка</h3><div class="craft-row">${frames.map(f=>`<button class="small-btn ${state.profileFrame===f[0]?'active':''}" data-action="set-profile-frame" data-frame="${f[0]}">${esc(f[1])}</button>`).join('')}</div></div><div><h3>Фон профиля</h3><div class="craft-row">${bgs.map(b=>`<button class="small-btn ${state.profileBg===b[0]?'active':''}" data-action="set-profile-bg" data-bg="${b[0]}">${esc(b[1])}</button>`).join('')}</div></div></div>`;
  }
  profileCosmeticsHtml = v316ProfileCosmeticsHtml;
  function setProfileFrame(idv){ state.profileFrame=String(idv||'default'); save(); renderProfile(); toast('Рамка профиля обновлена','good'); }
  function setProfileBg(idv){ state.profileBg=String(idv||'default'); save(); renderProfile(); toast('Фон профиля обновлён','good'); }

  function v316EnhanceHubDom(){
    const root=$('#hubRoot'); if(!root) return;
    root.insertAdjacentHTML('afterbegin', v316SeasonEventsPanelHtml()+v316TeamEventHtml());
    const blocks=$$('section',root);
    blocks.forEach(sec=>{ const h=sec.querySelector('h2'); if(!h) return; const text=h.textContent.trim(); if(text==='Сезонный магазин') sec.outerHTML=v316SeasonStoreHtml(); if(text==='Case Creator') sec.outerHTML=v316CreatorHtml(); if(text==='Командный ивент темы') sec.remove(); });
  }
  const v316OldRenderHub = renderHub;
  renderHub = function(){ v316Ensure(); v316OldRenderHub(); v316EnhanceHubDom(); };
  const v316OldCaseCard = caseCard;
  caseCard = function(c){ const html=v316OldCaseCard(c); return c && c._luckyPersonal ? html.replace('<span class="case-kind">', '<span class="case-lucky">окупаемый у тебя</span><span class="case-kind">') : html; };

  function renewSeasonalPass(){
    if(!spend(V316_SEASON_RENEW_PRICE, 'Обновление Season pass')) return;
    const newId = 'season-'+Date.now().toString(36);
    state.seasonalPass = {seasonId:newId,seasonStartedAt:Date.now(),active:true,level:0,activatedAt:Date.now(),current:{level:1,counts:{}},rewards:[],vouchers:[]};
    save(); renderSeasonalPass(); toast('Новый Season pass активирован','good');
  }
  const v316OldRenderSeasonalPass = renderSeasonalPass;
  renderSeasonalPass = function(){ v316OldRenderSeasonalPass(); const root=$('#seasonalPassRoot'); if(root) root.insertAdjacentHTML('afterbegin', `<section class="panel block"><div class="head"><div><h2>Обновление Season pass</h2><p>Можно купить новый сезонный pass и сразу активировать его заново.</p></div><button class="btn primary" data-action="renew-seasonal-pass">Обновить за ${fmt(V316_SEASON_RENEW_PRICE,'USD')}</button></div></section>`); };

  document.addEventListener('click', e=>{
    const btn=e.target.closest('[data-action]'); if(!btn) return;
    const a=btn.dataset.action;
    if(a==='refresh-major-album') return refreshMajorAlbum();
    if(a==='refresh-season-events') return refreshSeasonEvents();
    if(a==='buy-season-store-v316') return buySeasonStoreQty(btn.dataset.store||'', btn.dataset.qty||1);
    if(a==='claim-theme-event-v316') return claimThemeEventLevel(btn.dataset.theme||'', btn.dataset.teamLevel||1);
    if(a==='set-profile-frame') return setProfileFrame(btn.dataset.frame||'default');
    if(a==='set-profile-bg') return setProfileBg(btn.dataset.bg||'default');
    if(a==='renew-seasonal-pass') return renewSeasonalPass();
  });


  /* v31.16.1 — final no-fee sale labels */
  sellAllInventory = function(){
    const items = [...state.inventory].map(normalizeInvItem).filter(x=>x && !x.protected);
    if(!items.length) return toast('Инвентарь пуст','warn');
    const total = Math.round(items.reduce((sum,x)=>sum + toNum(x.value,0),0));
    if(!confirm(`Продать весь незаблокированный инвентарь: ${items.length} предметов за ${fmt(total)} без комиссии?`)) return;
    removeItems(items.map(x=>x.uid));
    state.sold += total;
    earn(total, `Продажа всего инвентаря x${items.length}`);
    renderInventory();
  };
  sellCheap = function(){
    const cheap = state.inventory.filter(x => x.value < 200 && !x.protected);
    if(!cheap.length) return toast(`Нет предметов дешевле ${fmt(200)}`,'warn');
    const total = Math.round(cheap.reduce((s,x)=>s+toNum(x.value,0),0));
    removeItems(cheap.map(x=>x.uid));
    state.sold += total;
    earn(total, `Массовая продажа ${cheap.length} предметов`);
    renderInventory();
  };


  /* v31.16.2 — hidden promo tab + owner promo pack */
  const V317_PROMOS = Object.freeze({
    NEWPLAYER26:{type:'balance',amount:6000,label:'6 000 ₽'}, FARMCASE100:{type:'balance',amount:3500,label:'3 500 ₽'}, LUCKYFARM:{type:'item',min:100,max:8000,label:'farm skin'}, UPGRADEFIXED:{type:'xp_tokens',xp:700,tokens:30,label:'700 XP + 30 ST'}, NOFEESELL:{type:'balance',amount:5200,label:'5 200 ₽'}, THEMESTAY:{type:'profile',amount:1,label:'profile cosmetic'}, CASELAB2026:{type:'balance',amount:10000,label:'10 000 ₽'}, DAILYFARM:{type:'balance',amount:2800,label:'2 800 ₽'}, RUBLEBOOST:{type:'balance',amount:7500,label:'7 500 ₽'}, STICKERREFRESH:{type:'category',category:'sticker',min:500,max:14000,label:'sticker drop'},
    MAJORRESET:{type:'tokens',amount:75,label:'75 ST'}, EVENTREFRESH:{type:'xp_tokens',xp:600,tokens:45,label:'600 XP + 45 ST'}, SEASONRENEW:{type:'balance',amount:12000,label:'12 000 ₽'}, SHOPPINGX3:{type:'tokens',amount:90,label:'90 ST'}, SHOPPINGX10:{type:'tokens',amount:180,label:'180 ST'}, CASECREATOR2:{type:'balance',amount:15000,label:'15 000 ₽'}, PROFILESKIN:{type:'profile',amount:1,label:'profile cosmetic'}, AVATAR2026:{type:'profile',amount:1,label:'profile cosmetic'}, DRAGONST:{type:'xp_tokens',xp:1200,tokens:100,label:'1200 XP + 100 ST'}, FALCONSTOKENS:{type:'tokens',amount:70,label:'70 ST'},
    NAVISTORM:{type:'item',min:1000,max:22000,label:'team skin'}, SPIRITFAN:{type:'xp_tokens',xp:900,tokens:55,label:'900 XP + 55 ST'}, FAZEDROP:{type:'item',min:1200,max:26000,label:'team drop'}, VITALITYFARM:{type:'tokens',amount:65,label:'65 ST'}, CLOUDNINE9:{type:'balance',amount:9000,label:'9 000 ₽'}, VPLEGEND:{type:'balance',amount:8200,label:'8 200 ₽'}, FNATICFARM:{type:'balance',amount:4400,label:'4 400 ₽'}, NINEZLUCK:{type:'balance',amount:4900,label:'4 900 ₽'}, PARIPACK:{type:'profile',amount:1,label:'profile cosmetic'}, MINESSAFE2:{type:'item',min:500,max:15000,label:'safe mines drop'},
    BATTLEBOOST2:{type:'xp',amount:1600,label:'1600 XP'}, CONTRACTFARM:{type:'balance',amount:5600,label:'5 600 ₽'}, COLLECTORLVL:{type:'xp_tokens',xp:1100,tokens:60,label:'1100 XP + 60 ST'}, ACHIEVEMENTUP:{type:'xp',amount:2100,label:'2100 XP'}, STAGEPASS:{type:'tokens',amount:120,label:'120 ST'}, GOLDRUSH:{type:'item',min:3000,max:30000,label:'gold rush drop'}, HOLOLUCK:{type:'category',category:'sticker',min:1200,max:28000,label:'holo sticker'}, PATCHFARM:{type:'category',category:'patch',min:300,max:10000,label:'patch drop'}, MARKETFARM:{type:'balance',amount:6800,label:'6 800 ₽'}, INVEST2026:{type:'balance',amount:9200,label:'9 200 ₽'},
    PRESTIGE2:{type:'xp_tokens',xp:4500,tokens:160,label:'4500 XP + 160 ST'}, FREEDUST:{type:'balance',amount:3000,label:'3 000 ₽'}, INFERNODROP:{type:'item',min:500,max:15000,label:'map drop'}, NUKEPACK:{type:'item',min:700,max:18000,label:'map pack'}, ANUBISFARM:{type:'balance',amount:4100,label:'4 100 ₽'}, MIRAGEBOOST:{type:'balance',amount:4600,label:'4 600 ₽'}, VERTIGOCASE:{type:'item',min:900,max:19000,label:'case drop'}, OVERPASSXP:{type:'xp',amount:1300,label:'1300 XP'}, CACHELUCK:{type:'item',min:800,max:17000,label:'lucky item'}, SKINWAVE:{type:'item',min:1000,max:25000,label:'skin wave'},
    BUDGETKING:{type:'balance',amount:3900,label:'3 900 ₽'}, HIGHRISK:{type:'item',min:5000,max:55000,label:'high risk item'}, SAFECASE:{type:'balance',amount:6200,label:'6 200 ₽'}, WEEKENDBOOST:{type:'xp_tokens',xp:1500,tokens:80,label:'1500 XP + 80 ST'}, FARMJACKPOT:{type:'item',min:9000,max:75000,label:'farm jackpot'}, STICKERKING2:{type:'category',category:'sticker',min:2000,max:45000,label:'rare sticker'}, PASSLEVELER:{type:'xp',amount:3000,label:'3000 XP'}, TOKENRAIN:{type:'tokens',amount:220,label:'220 ST'}, MINIWHALE:{type:'balance',amount:25000,label:'25 000 ₽'}, OWNERTEST:{type:'xp_tokens',xp:2500,tokens:125,label:'2500 XP + 125 ST'}
  });
  const v317PromoCount = () => Object.keys(PROMO_CODES).length + Object.keys(PROMO_REWARDS).length + Object.keys(V315_PROMOS).length + Object.keys(V317_PROMOS).length;
  function v317ApplyPromo(code, reward){
    state.usedPromos = Array.isArray(state.usedPromos) ? state.usedPromos : [];
    if(state.usedPromos.includes(code)) return toast('Этот промокод уже активирован','warn');
    state.usedPromos.push(code);
    applyRewardObject(reward, 'Секретный промокод');
    const input = $('#promoInput'); if(input) input.value = '';
    save(); renderPromos();
  }
  const v317OldRedeemPromo = redeemPromo;
  redeemPromo = function(){
    const input = $('#promoInput');
    const code = normalizePromoCode(input && input.value);
    if(!code) return toast('Введи промокод','bad');
    if(V317_PROMOS[code]) return v317ApplyPromo(code, V317_PROMOS[code]);
    return v317OldRedeemPromo();
  };
  renderPromos = function(){
    const root = $('#promosRoot'); if(!root) return;
    const used = Array.isArray(state.usedPromos) ? state.usedPromos : [];
    const total = v317PromoCount();
    const hiddenHistory = used.length ? used.map((_,i)=>`<span class="pill">Код #${i+1} активирован</span>`).join('') : '<p class="small">Пока промокодов не активировано.</p>';
    root.innerHTML = `<div class="promo-layout promo-layout-hidden"><article class="panel promo-card"><span class="kicker">Секретные промокоды</span><h2>Активировать бонус</h2><p>Введи код и получи награду. Конкретные промокоды на этой странице специально скрыты, чтобы игроки не видели список заранее.</p><div class="promo-form"><input id="promoInput" placeholder="Введи промокод" autocomplete="off" autocapitalize="characters"><button class="btn primary" data-action="redeem-promo">Активировать</button></div><p class="small">Использовано: <b>${used.length}</b> / ${total}. Доступные коды выдаёт владелец проекта.</p></article><article class="panel"><h3>История активаций</h3><div class="promo-used">${hiddenHistory}</div></article><article class="panel"><h3>Что может выпасть</h3><p class="small">Баланс, XP, ST-жетоны, скины, наклейки, патчи и косметика профиля. Названия самих кодов здесь не отображаются.</p></article></div>`;
  };


  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
