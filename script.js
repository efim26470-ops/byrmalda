const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const rarity = {
  consumer: {label:'Ширпотреб', color:'linear-gradient(135deg,#8fa1b8,#2f3b50)', icon:'▧'},
  industrial: {label:'Промышленное', color:'linear-gradient(135deg,#6fb7ff,#193b63)', icon:'◈'},
  milspec: {label:'Армейское', color:'linear-gradient(135deg,#5a7cff,#1c245c)', icon:'◆'},
  restricted: {label:'Запрещённое', color:'linear-gradient(135deg,#b76cff,#42105a)', icon:'✦'},
  classified: {label:'Засекреченное', color:'linear-gradient(135deg,#ff6cca,#55103d)', icon:'✹'},
  covert: {label:'Тайное', color:'linear-gradient(135deg,#ff5470,#5b0c1d)', icon:'✺'},
  special: {label:'Особое', color:'linear-gradient(135deg,#ffd36c,#7b4b00)', icon:'★'}
};

const items = [
  ['Nova | Urban Pulse','consumer',45],['P250 | Blue Dust','consumer',55],['MP9 | Neon Wire','industrial',90],['FAMAS | Acid Grid','industrial',120],
  ['USP-S | Night Byte','milspec',210],['Glock-18 | Pixel Flame','milspec',240],['AK-47 | Carbon Beast','restricted',520],['M4A1-S | Cyber Reef','restricted',610],
  ['AWP | Violet Storm','classified',1300],['Desert Eagle | Gold Core','classified',1650],['AK-47 | Red Reactor','covert',3300],['M4A4 | Phantom Howl','covert',3900],
  ['Karambit | Lab Fade','special',9200],['Butterfly | Solar Edge','special',11800],['Gloves | Neon Circuit','special',8600]
].map((x,i)=>({id:'skin_'+i,name:x[0],rarity:x[1],value:x[2]}));

const cases = [
  {id:'starter',name:'Starter Lab',price:120,tag:'дешёвый старт',art:'SL',theme:'linear-gradient(135deg,#6cf3ff,#3358ff)',pool:[0,1,2,3,4,5,6]},
  {id:'neon',name:'Neon Strike',price:420,tag:'средний риск',art:'NS',theme:'linear-gradient(135deg,#ff6cca,#6cf3ff)',pool:[2,3,4,5,6,7,8,9,10]},
  {id:'rifle',name:'Rifle Dreams',price:850,tag:'AK / M4 / AWP',art:'RD',theme:'linear-gradient(135deg,#ffd36c,#ff5470)',pool:[4,5,6,7,8,9,10,11,12]},
  {id:'knife',name:'Knife Mirage',price:1800,tag:'шанс на особое',art:'KM',theme:'linear-gradient(135deg,#ffd36c,#9b6cff)',pool:[6,7,8,9,10,11,12,13,14]},
  {id:'covert',name:'Covert Heat',price:1350,tag:'дорогой пул',art:'CH',theme:'linear-gradient(135deg,#ff5470,#141a31)',pool:[5,6,7,8,9,10,11,12]},
  {id:'budget',name:'Budget Farm',price:65,tag:'фарм монет',art:'BF',theme:'linear-gradient(135deg,#65ffb7,#1b4d3a)',pool:[0,1,2,3,4]},
  {id:'violet',name:'Violet Rush',price:690,tag:'красивые дропы',art:'VR',theme:'linear-gradient(135deg,#9b6cff,#23114d)',pool:[3,4,5,6,7,8,9,10]},
  {id:'elite',name:'Elite Contract',price:2500,tag:'топовый кейс',art:'EC',theme:'linear-gradient(135deg,#ffd36c,#ffffff 42%,#9b6cff)',pool:[8,9,10,11,12,13,14]}
];

const projects = [
  {title:'Портфолио',desc:'Личный сайт с работами и блоками видео.',url:'#'},
  {title:'Пасьянс Косынка',desc:'PWA-игра с темами и сохранением рекорда.',url:'#'},
  {title:'Сайт ЧМ 2026',desc:'Интерактивные таблицы, матчи и статистика.',url:'#'},
  {title:'Учебный проект',desc:'Презентации, доклады и модели для колледжа.',url:'#'}
];

const state = JSON.parse(localStorage.getItem('cs2CaseLab') || 'null') || {
  balance: 1250, inventory: [], opened: 0, best: null, wheelRotation: 0, lastWheel: 0
};
let selectedCase = cases[0];
let rolling = false;
const save = () => localStorage.setItem('cs2CaseLab', JSON.stringify(state));
const money = n => Math.round(n).toLocaleString('ru-RU');
function weightedPick(pool){
  const entries = pool.map(id=>items[id]);
  const weights = entries.map(it=> Math.max(2, 10000 / Math.pow(it.value, .88)));
  let total = weights.reduce((a,b)=>a+b,0), r = Math.random()*total;
  for(let i=0;i<entries.length;i++){ r -= weights[i]; if(r<=0) return entries[i]; }
  return entries[0];
}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function render(){
  $('#balance').textContent = money(state.balance);
  $('#openedCount').textContent = state.opened;
  $('#inventoryValue').textContent = money(state.inventory.reduce((s,it)=>s+it.value,0));
  $('#bestDrop').textContent = state.best ? state.best.name.split('|')[0].trim() : '—';
  renderCases(); renderInventory(); renderUpgrade(); renderProjects();
}
function renderCases(){
  $('#caseGrid').innerHTML = cases.map(c=>`<article class="case-card ${selectedCase.id===c.id?'active':''}" data-case="${c.id}">
    <div class="case-art" style="background:${c.theme}">${c.art}</div><h3>${c.name}</h3><div class="case-meta"><span>${c.tag}</span><b>◆ ${money(c.price)}</b></div>
  </article>`).join('');
  $$('.case-card').forEach(card=>card.onclick=()=>{selectedCase=cases.find(c=>c.id===card.dataset.case);$('#selectedCaseName').textContent=selectedCase.name;$('#openCaseBtn').textContent=`Открыть за ◆ ${money(selectedCase.price)}`;$('#openCaseBtn').disabled=false;renderCases();prepareStrip();});
}
function cardHTML(it){const r=rarity[it.rarity];return `<div class="roll-card"><div class="item-art" style="background:${r.color}">${r.icon}</div><b>${it.name}</b><span>${r.label} • ◆ ${money(it.value)}</span></div>`}
function prepareStrip(){
  const sample = Array.from({length:24},()=>weightedPick(selectedCase.pool));
  $('#rouletteStrip').style.transition='none'; $('#rouletteStrip').style.transform='translateX(0)';
  $('#rouletteStrip').innerHTML = sample.map(cardHTML).join('');
}
function openCase(){
  if(rolling || !selectedCase) return;
  if(state.balance < selectedCase.price){flash('#dropResult',`Не хватает монет. Нажми «Смотреть рекламу» или продай предметы.`);return;}
  rolling = true; state.balance -= selectedCase.price; state.opened++;
  const won = weightedPick(selectedCase.pool); const wonCopy = {...won, uid:uid(), obtained:new Date().toISOString()};
  const filler = Array.from({length:30},()=>weightedPick(selectedCase.pool)); filler[24]=won;
  const strip=$('#rouletteStrip'); strip.innerHTML=filler.map(cardHTML).join(''); strip.style.transition='none'; strip.style.transform='translateX(0)';
  requestAnimationFrame(()=>{strip.style.transition='transform 3.2s cubic-bezier(.08,.72,.13,1)'; strip.style.transform='translateX(-3120px)';});
  setTimeout(()=>{
    state.inventory.unshift(wonCopy); if(!state.best || won.value>state.best.value) state.best=won;
    save(); rolling=false; render();
    const r=rarity[won.rarity];
    $('#dropResult').classList.remove('hidden');
    $('#dropResult').innerHTML=`Выпало: <b>${won.name}</b> <span style="color:var(--muted)">(${r.label}, ◆ ${money(won.value)})</span>`;
  },3300);
  render();
}
function renderInventory(){
  const grid=$('#inventoryGrid'); grid.classList.toggle('empty',state.inventory.length===0);
  grid.innerHTML = state.inventory.map(it=>{const r=rarity[it.rarity];return `<article class="item-card">
    <div class="item-art" style="background:${r.color}">${r.icon}</div><b>${it.name}</b><small>${r.label} • ◆ ${money(it.value)}</small>
    <div class="item-actions"><button class="ghost" data-sell="${it.uid}">Продать</button><button class="ghost" data-use="${it.uid}">В апгрейд</button></div></article>`}).join('');
  $$('[data-sell]').forEach(b=>b.onclick=()=>sellItem(b.dataset.sell));
  $$('[data-use]').forEach(b=>b.onclick=()=>{$('#upgradeItem').value=b.dataset.use;location.hash='upgrade';renderUpgrade();});
}
function sellItem(id){ const i=state.inventory.findIndex(x=>x.uid===id); if(i>-1){state.balance+=state.inventory[i].value;state.inventory.splice(i,1);save();render();}}
function sellAll(){state.balance += state.inventory.reduce((s,it)=>s+it.value,0); state.inventory=[]; save(); render();}
function renderUpgrade(){
  $('#upgradeItem').innerHTML = state.inventory.length ? state.inventory.map(it=>`<option value="${it.uid}">${it.name} — ◆ ${money(it.value)}</option>`).join('') : '<option value="">Нет предметов</option>';
  $('#targetItem').innerHTML = items.filter(it=>it.value>=200).map(it=>`<option value="${it.id}">${it.name} — ◆ ${money(it.value)}</option>`).join('');
  updateChance();
}
function updateChance(){
  const source=state.inventory.find(x=>x.uid===$('#upgradeItem').value); const target=items.find(x=>x.id===$('#targetItem').value);
  let chance=0; if(source&&target){chance=Math.min(75,Math.max(2,(source.value/target.value)*62)); if(target.value<=source.value) chance=80;}
  $('#upgradeChance').textContent=chance.toFixed(1)+'%'; $('#upgradeMeter').style.width=chance+'%';
}
function doUpgrade(){
  const source=state.inventory.find(x=>x.uid===$('#upgradeItem').value); const target=items.find(x=>x.id===$('#targetItem').value); if(!source||!target)return;
  let chance=Math.min(75,Math.max(2,(source.value/target.value)*62)); if(target.value<=source.value) chance=80;
  const idx=state.inventory.findIndex(x=>x.uid===source.uid); state.inventory.splice(idx,1);
  if(Math.random()*100 <= chance){const copy={...target,uid:uid(),obtained:new Date().toISOString()}; state.inventory.unshift(copy); if(!state.best||copy.value>state.best.value)state.best=copy; $('#upgradeResult').innerHTML=`Успех! Получен <b>${target.name}</b>.`;}
  else {$('#upgradeResult').innerHTML=`Не повезло. Предмет <b>${source.name}</b> сгорел.`;}
  save(); render();
}
function renderProjects(){
  $('#projectGrid').innerHTML=projects.map(p=>`<article class="project-card"><h3>${p.title}</h3><p>${p.desc}</p><a href="${p.url}" target="_blank" rel="noopener">Открыть</a></article>`).join('');
}
function spinWheel(){
  const rewards=[75,100,150,200,250,350,500,900]; const reward=rewards[Math.floor(Math.random()*rewards.length)];
  state.wheelRotation += 1440 + Math.floor(Math.random()*360); $('#bonusWheel').style.transform=`rotate(${state.wheelRotation}deg)`;
  $('#spinBtn').disabled=true; setTimeout(()=>{state.balance+=reward;save();render();$('#wheelResult').innerHTML=`Колесо принесло <b>◆ ${reward}</b> LabCoins.`;$('#spinBtn').disabled=false;},3100);
}
function watchAd(){
  const overlay=$('#adOverlay'), btn=$('#closeAdBtn'), timer=$('#adTimer'); let t=10;
  const p=projects[Math.floor(Math.random()*projects.length)]; $('#adProject').innerHTML=`<div class="project-card"><h3>${p.title}</h3><p>${p.desc}</p><a href="${p.url}" target="_blank">Посмотреть проект</a></div>`;
  overlay.classList.remove('hidden'); btn.disabled=true; timer.textContent=t; btn.textContent='Подожди...';
  const int=setInterval(()=>{t--;timer.textContent=t;if(t<=0){clearInterval(int);btn.disabled=false;btn.textContent='Получить ◆ 250';}},1000);
}
function closeAd(){state.balance+=250;save();render();$('#adOverlay').classList.add('hidden');}
function flash(sel,msg){const el=$(sel);el.classList.remove('hidden');el.innerHTML=msg;}

$('#openCaseBtn').onclick=openCase; $('#sellAllBtn').onclick=sellAll; $('#upgradeBtn').onclick=doUpgrade; $('#upgradeItem').onchange=updateChance; $('#targetItem').onchange=updateChance; $('#spinBtn').onclick=spinWheel; $('#watchAdBtn').onclick=watchAd; $('#closeAdBtn').onclick=closeAd;
$$('[data-scroll]').forEach(b=>b.onclick=()=>document.querySelector(b.dataset.scroll).scrollIntoView({behavior:'smooth'}));
selectedCase=cases[0]; $('#selectedCaseName').textContent=selectedCase.name; $('#openCaseBtn').textContent=`Открыть за ◆ ${money(selectedCase.price)}`; $('#openCaseBtn').disabled=false; prepareStrip(); render();
