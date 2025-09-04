import {Loader} from './engine/loader.js';
import {Store} from './engine/storage.js';
import {Input} from './engine/input.js';
import {Sfx} from './engine/audio.js';
import {Game} from './game/game.js';

const cv = document.getElementById('game');
const btnPause = document.getElementById('btnPause');
const btnRestart = document.getElementById('btnRestart');
const btnPump = document.getElementById('btnPump');
const btnPumpTouch = document.getElementById('btnPumpTouch');
const btnMenu = document.getElementById('btnMenu');
const btnExport = document.getElementById('btnExport');
const importFile = document.getElementById('importFile');
const loaderEl = document.getElementById('loader');
const barEl = document.getElementById('bar');
const pctEl = document.getElementById('pct');
const menu = document.getElementById('menu');
const worldSelect = document.getElementById('worldSelect');
const optSound = document.getElementById('optSound');
const optLefty = document.getElementById('optLefty');
const optDiff = document.getElementById('optDiff');
const scoresEl = document.getElementById('scores');
const resetScoresBtn = document.getElementById('btnResetScores');
const unlockInfo = document.getElementById('unlockInfo');
const treasureCountEl = document.getElementById('treasureCount');

const store = new Store();
const sfx = new Sfx();
const input = new Input(cv);
let game;

function showProgress(done,total){ const p=total?Math.floor(done/total*100):0; barEl.style.width=p+'%'; pctEl.textContent=p+'%'; if(p>=100) loaderEl.style.display='none'; }
const loader = new Loader(showProgress);

document.querySelectorAll('.touchpad [data-dir]').forEach(btn=>{
  const dir = btn.getAttribute('data-dir');
  btn.addEventListener('touchstart', e=>{ e.preventDefault(); input.setTouchDir(dir,true); }, {passive:false});
  btn.addEventListener('touchend',   e=>{ e.preventDefault(); input.setTouchDir(dir,false); }, {passive:false});
});
btnPumpTouch.addEventListener('touchstart', e=>{ e.preventDefault(); input.setPump(true); }, {passive:false});
btnPumpTouch.addEventListener('touchend',   e=>{ e.preventDefault(); input.setPump(false); }, {passive:false});

btnPause.onclick = ()=> game.togglePause();
btnRestart.onclick = ()=> game.restart();
btnMenu.onclick = ()=> menu.showModal();

btnExport.onclick = async ()=>{
  const json = game.exportState(); await store.set('saves','autosave', json);
  const blob = new Blob([json], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='cavernquest-save.json'; a.click();
};
importFile.addEventListener('change', async (e)=>{
  const f=e.target.files[0]; if(!f) return; const text=await f.text();
  await game.importState(text); await store.set('saves','autosave', text); refreshUnlocks();
});

worldSelect.onchange = async ()=>{ await loadWorld(worldSelect.value); await saveAuto(); };
optSound.onchange = ()=>{ sfx.setEnabled(optSound.checked); saveSettings(); };
optLefty.onchange = ()=>{ document.body.classList.toggle('lefty', optLefty.checked); saveSettings(); };
optDiff.onchange = ()=>{ game.difficulty = parseInt(optDiff.value,10); saveSettings(); };
resetScoresBtn.onclick = async ()=>{ await store.del('scores','table'); await refreshScores(); };

function applySettings(){
  try{
    const s = JSON.parse(localStorage.getItem('cq_settings')||'{}');
    optSound.checked = s.sound!==false; sfx.setEnabled(optSound.checked);
    optLefty.checked = !!s.lefty; document.body.classList.toggle('lefty', optLefty.checked);
    optDiff.value = s.diff||'1';
  }catch{}
}
async function saveSettings(){ const s={sound:optSound.checked,lefty:optLefty.checked,diff:optDiff.value}; localStorage.setItem('cq_settings', JSON.stringify(s)); }
async function refreshScores(){ const json=await store.get('scores','table'); scoresEl.innerHTML=''; const arr=json?JSON.parse(json):[]; arr.forEach((r,i)=>{ const li=document.createElement('li'); li.textContent=`${i+1}. ${r.score} — ${new Date(r.date).toLocaleDateString()}`; scoresEl.appendChild(li); }); }
function refreshUnlocks(){ const n = parseInt(localStorage.getItem('cq_unlocks')||'0',10); treasureCountEl.textContent = String(n); }
async function saveAuto(){ const json = game.exportState(); await store.set('saves','autosave', json); }

async function boot(){
  if('serviceWorker' in navigator){ try{ await navigator.serviceWorker.register('./sw.js'); }catch(e){ console.warn(e);} }
  loaderEl.style.display='block';
  await loader.queue([{type:'image', key:'sprites', src:'./assets/sprites.png'}]);
  const sprites = loader.get('sprites');

  game = new Game(cv, sfx, sprites, store);
  applySettings(); game.difficulty = parseInt(optDiff.value,10);
  await loadWorld(worldSelect.value);

  const json = await store.get('saves','autosave'); if(json){ try{ await game.importState(json); }catch{} }
  requestAnimationFrame(loop); cv.focus();
  await refreshScores(); refreshUnlocks();
}
async function loadWorld(url){ game.attachFactory(url,'makeLevel'); await game.loadAndSetup(url,'makeLevel'); }
function loop(t){ const dt=Math.min(0.05,(loop.last?(t-loop.last)/1000:0)); loop.last=t; game.tick(dt,input); requestAnimationFrame(loop); }
window.addEventListener('resize', ()=>game.fit());
boot();