const webFile = name => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(name) + '?width=1600';

const PRESETS = [
  {
    id:'graduation', name:'Graduation Sky', artist:'Kanye West', type:'artist',
    description:'Purple sky, warm glow, animated energy.',
    accent:'#f3a8ff', background:'#140d22', panel:'#24192e', panelHover:'#352342', text:'#fff7fb', subtext:'#bea9c8',
    blur:20, opacity:76, radius:16, dim:30,
    media:'https://i.giphy.com/media/CwBYQ8WkQT6sGVXs7g/giphy.gif',
    source:'https://giphy.com/gifs/kanye-west-bully-CwBYQ8WkQT6sGVXs7g'
  },
  {
    id:'utopia', name:'Utopia Concrete', artist:'Travis Scott', type:'artist',
    description:'Dark stone, smoke and burnt-orange details.',
    accent:'#d89556', background:'#090907', panel:'#171713', panelHover:'#24231d', text:'#f5f2e8', subtext:'#9f998d',
    blur:14, opacity:82, radius:10, dim:52,
    media:webFile('Travis Scott 2023.jpg'),
    source:'https://commons.wikimedia.org/wiki/File:Travis_Scott_2023.jpg'
  },
  {
    id:'views', name:'Midnight Views', artist:'Drake', type:'artist',
    description:'Cold city blues with polished glass surfaces.',
    accent:'#9ab9ff', background:'#070a11', panel:'#101723', panelHover:'#172235', text:'#f2f6ff', subtext:'#8d9cb5',
    blur:24, opacity:70, radius:18, dim:57,
    media:webFile('Drake July 2016.jpg'),
    source:'https://commons.wikimedia.org/wiki/File:Drake_July_2016.jpg'
  },
  {
    id:'damn', name:'DAMN. Red', artist:'Kendrick Lamar', type:'artist',
    description:'Sharp red accent, documentary texture, minimal chrome.',
    accent:'#ff4b3f', background:'#0b0909', panel:'#181212', panelHover:'#281919', text:'#fff6f4', subtext:'#ad9693',
    blur:10, opacity:85, radius:8, dim:56,
    media:webFile('Kendrick Lamar 2013.jpg'),
    source:'https://commons.wikimedia.org/wiki/File:Kendrick_Lamar_2013.jpg'
  },
  {
    id:'chroma', name:'Chroma Green', artist:'Tyler, The Creator', type:'artist',
    description:'Military green, crisp black and playful geometry.',
    accent:'#b7d739', background:'#0b0d08', panel:'#15190f', panelHover:'#242b19', text:'#f6f7ef', subtext:'#a8ad94',
    blur:9, opacity:88, radius:7, dim:46,
    media:webFile('Tyler The Creator.jpg'),
    source:'https://commons.wikimedia.org/wiki/File:Tyler_The_Creator.jpg'
  },
  {
    id:'glass', name:'Glass Black', artist:'Customify', type:'clean',
    description:'Ultra-clean smoked glass with Spotify green.',
    accent:'#1ed760', background:'#050607', panel:'#111318', panelHover:'#1a1d23', text:'#f7f7f7', subtext:'#92969e',
    blur:28, opacity:64, radius:18, dim:65, media:'', source:''
  },
  {
    id:'frost', name:'Frost', artist:'Customify', type:'clean',
    description:'Cool minimal surfaces with icy blue accents.',
    accent:'#b4d8ff', background:'#0a1018', panel:'#182330', panelHover:'#223244', text:'#f5f9ff', subtext:'#9eb0c2',
    blur:30, opacity:67, radius:20, dim:50, media:'', source:''
  },
  {
    id:'ember', name:'Ember', artist:'Customify', type:'clean',
    description:'Soft black with amber highlights and low blur.',
    accent:'#ffad57', background:'#0b0907', panel:'#19130e', panelHover:'#281d14', text:'#fff8ef', subtext:'#aa9a89',
    blur:8, opacity:88, radius:12, dim:48, media:'', source:''
  }
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const DEFAULT = {...PRESETS.find(p=>p.id==='glass'), id:'custom', name:'My Custom Theme'};
let current = {...DEFAULT};
let localMedia = '';

function renderCards(filter='all') {
  const items = PRESETS.filter(x => filter==='all' || x.type===filter);
  $('#themeGrid').innerHTML = items.map(p => `
    <article class="theme-card" data-id="${p.id}" style="--image:${p.media ? `url('${p.media}')` : `linear-gradient(135deg,${p.background},${p.panelHover})`}">
      <span class="card-badge">${p.type==='artist' ? p.artist.toUpperCase() : 'CLEAN PRESET'}</span>
      ${p.source ? '<span class="card-source" data-source-card="'+p.id+'">↗</span>' : ''}
      <div class="theme-info"><h4>${p.name}</h4><p>${p.description}</p>
        <div class="swatches"><i style="background:${p.accent}"></i><i style="background:${p.background}"></i><i style="background:${p.panel}"></i></div>
      </div>
    </article>`).join('');

  $$('.theme-card').forEach(card => card.addEventListener('click', e => {
    if (e.target.closest('[data-source-card]')) return;
    selectPreset(card.dataset.id);
  }));
  $$('[data-source-card]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const p=PRESETS.find(x=>x.id===b.dataset.sourceCard);
    if(p?.source) window.customify.openExternal(p.source);
  }));
}

function switchPage(page) {
  $$('.page').forEach(p=>p.classList.remove('active'));
  $('#' + page + 'Page').classList.add('active');
  $$('.nav').forEach(n=>n.classList.toggle('active', n.dataset.page===page));
  const copy={
    discover:['Make Spotify yours.','Curated themes, artist moods and a full visual studio.'],
    studio:['Visual Studio','Tune every layer, then apply it straight to Spotify.'],
    saved:['My themes','Your custom looks, stored locally on this PC.']
  }[page];
  $('#pageTitle').textContent=copy[0]; $('#pageSubtitle').textContent=copy[1];
}

function selectPreset(id){
  const p=PRESETS.find(x=>x.id===id); if(!p)return;
  current={...p}; localMedia='';
  syncControls(); switchPage('studio'); toast(p.name+' loaded');
}

function syncControls(){
  $('#themeName').value=current.name||'Untitled theme';
  $('#mediaUrl').value=current.media||'';
  ['accent','background','panel','text'].forEach(k=>$('#'+k).value=current[k]||DEFAULT[k]);
  ['blur','opacity','radius','dim'].forEach(k=>$('#'+k).value=current[k] ?? DEFAULT[k]);
  updateCurrent();
}

function updateCurrent(){
  current.name=$('#themeName').value.trim()||'Untitled theme';
  current.media=localMedia || $('#mediaUrl').value.trim();
  current.mediaType=localMedia ? 'local' : 'remote';
  ['accent','background','panel','text'].forEach(k=>current[k]=$('#'+k).value);
  ['blur','opacity','radius','dim'].forEach(k=>current[k]=Number($('#'+k).value));
  current.subtext=current.subtext||'#9b9ea5';
  current.panelHover=current.panelHover||current.panel;
  $('#blurOut').textContent=current.blur+'px';
  $('#opacityOut').textContent=current.opacity+'%';
  $('#radiusOut').textContent=current.radius+'px';
  $('#dimOut').textContent=current.dim+'%';
  $('#previewName').textContent=current.name;
  const preview=$('#spotifyPreview');
  preview.style.setProperty('--preview-accent',current.accent);
  $('#previewDim').style.background=`rgba(0,0,0,${current.dim/100})`;
  $('.sp-side').style.background=hexAlpha(current.background, Math.min(.92,current.opacity/100));
  $('.sp-player').style.background=hexAlpha(current.panel, Math.min(.94,current.opacity/100));
  $$('.album,.rows').forEach(el=>{el.style.background=hexAlpha(current.panel,current.opacity/100);el.style.borderRadius=current.radius+'px'});
  preview.style.setProperty('color',current.text);
  const bg=$('#previewBg');
  bg.style.backgroundImage=current.mediaType==='local'&&localMedia ? `linear-gradient(135deg,${current.background},${current.panelHover})` : (current.media ? `url("${current.media.replaceAll('"','%22')}")` : `linear-gradient(135deg,${current.background},${current.panelHover})`);
  document.documentElement.style.setProperty('--accent',current.accent);
  renderAlbums();
}

function hexAlpha(hex,a){
  const h=(hex||'#111318').replace('#','');
  const n=parseInt(h,16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}

function renderAlbums(){
  const arts=[
    `linear-gradient(135deg,${current.accent},${current.panelHover})`,
    `linear-gradient(45deg,${current.background},${current.accent})`,
    `radial-gradient(circle at 30% 30%,${current.text},${current.panel} 14%,${current.background} 65%)`,
    `linear-gradient(160deg,${current.panelHover},${current.accent})`
  ];
  $('#albumGrid').innerHTML=arts.map((a,i)=>`<div class="album"><div class="album-art" style="--art:${a}"></div><b>${['Discover Weekly','Late Night Mix','On Repeat','Daily Mix 01'][i]}</b><small>Made for you</small></div>`).join('');
  $$('.album-art').forEach((el,i)=>el.style.background=arts[i]);
}

function toast(msg){
  const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),1900);
}

async function status(){
  const s=await window.customify.status(); const el=$('#status');
  el.classList.remove('ok','bad');
  if(s.spicetify){el.classList.add('ok');el.querySelector('b').textContent='Spicetify ready';el.querySelector('small').textContent=s.version||'Connected'}
  else{el.classList.add('bad');el.querySelector('b').textContent='Spicetify not found';el.querySelector('small').textContent='Install it before applying'}
}

function saveLocal(){
  const saved=JSON.parse(localStorage.getItem('customify.saved')||'[]');
  const item={...current,id:'saved-'+Date.now()};
  saved.unshift(item);localStorage.setItem('customify.saved',JSON.stringify(saved.slice(0,20)));
  renderSaved(); toast('Theme saved');
}

function renderSaved(){
  const saved=JSON.parse(localStorage.getItem('customify.saved')||'[]');
  const root=$('#savedList');
  if(!saved.length){root.className='empty';root.innerHTML='<div>♡</div><h2>Your themes live here</h2><p>Save a custom look from Studio and it will stay on this PC.</p><button class="primary" id="savedCreate">Create your first theme</button>';$('#savedCreate').onclick=()=>switchPage('studio');return}
  root.className='saved-grid';
  root.innerHTML=saved.map((t,i)=>`<article class="saved-item" data-saved="${i}"><div class="saved-preview" style="--c1:${t.background};--c2:${t.accent}"></div><h4>${t.name}</h4><p>Blur ${t.blur}px · opacity ${t.opacity}%</p><div class="saved-actions"><button class="ghost load-saved" data-i="${i}">Edit</button><button class="ghost delete-saved" data-i="${i}">Delete</button></div></article>`).join('');
  $$('.load-saved').forEach(b=>b.onclick=()=>{current={...saved[+b.dataset.i]};localMedia=current.mediaType==='local'?current.media:'';syncControls();switchPage('studio')});
  $$('.delete-saved').forEach(b=>b.onclick=()=>{saved.splice(+b.dataset.i,1);localStorage.setItem('customify.saved',JSON.stringify(saved));renderSaved()});
}

$$('.nav').forEach(n=>n.onclick=()=>switchPage(n.dataset.page));
$('#openStudio').onclick=()=>switchPage('studio');
$$('[data-select]').forEach(b=>b.onclick=()=>selectPreset(b.dataset.select));
$$('[data-source]').forEach(b=>b.onclick=()=>{const p=PRESETS.find(x=>x.id===b.dataset.source);if(p?.source)window.customify.openExternal(p.source)});
$$('.chip').forEach(c=>c.onclick=()=>{$$('.chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');renderCards(c.dataset.filter)});
['themeName','mediaUrl','accent','background','panel','text','blur','opacity','radius','dim'].forEach(id=>$('#'+id).addEventListener('input',()=>{if(id==='mediaUrl')localMedia='';updateCurrent()}));
$('#chooseMedia').onclick=async()=>{const p=await window.customify.chooseMedia();if(p){localMedia=p;$('#mediaUrl').value=p;updateCurrent();toast('Local media selected')}};
$('#resetTheme').onclick=()=>{current={...DEFAULT};localMedia='';syncControls();toast('Studio reset')};
$('#exportTheme').onclick=async()=>{updateCurrent();await window.customify.saveTheme({...current});saveLocal()};
$('#importTheme').onclick=async()=>{const t=await window.customify.loadTheme();if(t?.error)return toast(t.error);if(t){current={...DEFAULT,...t};localMedia=current.mediaType==='local'?current.media:'';syncControls();switchPage('studio');toast('Theme imported')}};
$('#applyTheme').onclick=async()=>{updateCurrent();const btn=$('#applyTheme');btn.disabled=true;btn.textContent='Applying…';$('#applyMessage').textContent='Downloading media and writing the Spicetify theme…';const r=await window.customify.applyTheme({...current});btn.disabled=false;btn.textContent='Apply to Spotify';if(r.ok){$('#applyMessage').textContent='Applied. Spotify may restart or refresh automatically.';saveLocal();toast('Applied to Spotify')}else{$('#applyMessage').textContent=r.error||'Could not apply theme.';toast('Apply failed')}};
$('#restore').onclick=async()=>{const r=await window.customify.restore();toast(r.ok?'Spotify restored':'Restore failed')};

renderCards();renderSaved();syncControls();status();
