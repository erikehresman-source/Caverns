(function(){
  const hud = document.createElement('div');
  hud.style.position='fixed'; hud.style.top='8px'; hud.style.left='8px';
  hud.style.padding='6px 10px'; hud.style.background='rgba(0,0,0,0.6)';
  hud.style.color='#0f0'; hud.style.font='12px monospace'; hud.style.zIndex=9999;
  hud.textContent='Booting…'; document.body.appendChild(hud);
  function ok(m){ hud.style.color='#0f0'; hud.textContent=m; }
  function err(e){ hud.style.color='#f55'; hud.textContent='Error: '+(e?.message||e); console.error(e); }

  if ('serviceWorker' in navigator){
    addEventListener('load', ()=> navigator.serviceWorker.register('./sw.js').catch(console.warn));
  }
  import('./main_real.js?v=3').then(mod=>{
    const run = mod.bootGame || mod.startGame;
    if (!run) throw new Error('main_real.js must export bootGame()');
    const p = run();
    if (p && typeof p.then==='function') p.then(()=>ok('Running')).catch(err);
    else ok('Running');
  }).catch(err);
})();