
export function bootGame(){
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');
  const overlay = document.getElementById('overlay');
  const ovTitle = document.getElementById('ovTitle');
  const ovMsg = document.getElementById('ovMsg');
  const btnPause = document.getElementById('btnPause');
  const btnRestart = document.getElementById('btnRestart');
  const btnPump = document.getElementById('btnPump');

  const TILE=24, COLS=20, ROWS=26, VW=COLS*TILE, VH=ROWS*TILE;
  let scale=1, ox=0, oy=0, paused=false, gameOver=false;
  const grid = Array.from({length:ROWS}, _=> Array.from({length:COLS}, _=> 1));
  const player = {x:Math.floor(COLS/2), y:2, dir:'down', inv:0};
  let enemies = spawnEnemies(1), level=1, score=0, lives=3;
  let harpoon=null, harpoonCd=0, stepTimer=0, enemyTimer=0;

  function spawnEnemies(level){
    const bases=[{x:2,y:ROWS-3},{x:COLS-3,y:ROWS-3},{x:2,y:Math.floor(ROWS/2)},{x:COLS-3,y:Math.floor(ROWS/2)}];
    const list=[]; for(let i=0;i<Math.min(4,2+Math.floor(level/2));i++){ const b=bases[i%bases.length]; list.push({x:b.x,y:b.y,ghost:false,dead:false}); }
    return list;
  }

  function fit(){
    const r=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
    canvas.width=Math.floor(r.width*dpr); canvas.height=Math.floor(r.height*dpr);
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr);
    scale=Math.min(r.width/VW,r.height/VH); ox=(r.width-VW*scale)/2; oy=(r.height-VH*scale)/2;
  }
  window.addEventListener('resize', fit, {passive:true});

  function carve(x,y){ if (grid[y] && grid[y][x]===1) grid[y][x]=0; }
  carve(player.x,player.y);

  const input={left:false,right:false,up:false,down:false,pump:false};
  addEventListener('keydown',e=>{const k=e.key;
    if(k==='ArrowLeft'||k==='a'||k==='A'){input.left=true; e.preventDefault();}
    if(k==='ArrowRight'||k==='d'||k==='D'){input.right=true; e.preventDefault();}
    if(k==='ArrowUp'||k==='w'||k==='W'){input.up=true; e.preventDefault();}
    if(k==='ArrowDown'||k==='s'||k==='S'){input.down=true; e.preventDefault();}
    if(k===' '){input.pump=true; e.preventDefault();}
    if(k==='p'||k==='P'){togglePause(); e.preventDefault();}
    if(k==='r'||k==='R'){restart(); e.preventDefault();}
  }, {passive:false});
  addEventListener('keyup',e=>{const k=e.key;
    if(k==='ArrowLeft'||k==='a'||k==='A') input.left=false;
    if(k==='ArrowRight'||k==='d'||k==='D') input.right=false;
    if(k==='ArrowUp'||k==='w'||k==='W') input.up=false;
    if(k==='ArrowDown'||k==='s'||k==='S') input.down=false;
    if(k===' ') input.pump=false;
  });
  document.querySelectorAll('.tbtn[data-dir]').forEach(b=>{
    const d=b.getAttribute('data-dir');
    b.addEventListener('touchstart',e=>{e.preventDefault(); input[d]=true;},{passive:false});
    b.addEventListener('touchend',e=>{e.preventDefault(); input[d]=false;},{passive:false});
  });
  btnPump?.addEventListener('touchstart',e=>{e.preventDefault(); input.pump=true;},{passive:false});
  btnPump?.addEventListener('touchend',e=>{e.preventDefault(); input.pump=false;},{passive:false});
  btnPause.onclick=()=>togglePause();
  btnRestart.onclick=()=>restart();

  function togglePause(v){ paused=(typeof v==='boolean')?v:!paused; document.getElementById('overlay').style.display=paused?'grid':'none'; ovTitle.textContent=gameOver?'Game Over':'Paused'; ovMsg.textContent=gameOver?'Press Restart.':'Arrows/WASD to dig. Space to pump.'; }
  function restart(){ for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) grid[y][x]=1; player.x=Math.floor(COLS/2); player.y=2; player.inv=0; enemies=spawnEnemies(1); level=1; score=0; lives=3; harpoon=null; harpoonCd=0; gameOver=false; carve(player.x,player.y); togglePause(false); }

  function passable(x,y,ghost=false){ if(x<0||y<0||x>=COLS||y>=ROWS) return false; return ghost || grid[y][x]===0; }
  function move(ent,dx,dy,carveTo){ const nx=ent.x+dx, ny=ent.y+dy; if(nx<0||ny<0||nx>=COLS||ny>=ROWS) return false; if(carveTo) carve(nx,ny); if(!passable(nx,ny,ent.ghost)) return false; ent.x=nx; ent.y=ny; return true; }

  function playerStep(){
    if(player.inv>0) player.inv--;
    let dx=0,dy=0;
    if(input.left){dx=-1; player.dir='left';}
    else if(input.right){dx=1; player.dir='right';}
    else if(input.up){dy=-1; player.dir='up';}
    else if(input.down){dy=1; player.dir='down';}
    if(dx||dy){ if(move(player,dx,dy,true)) carve(player.x,player.y); }
    if(harpoonCd>0) harpoonCd--;
    if(!harpoon && input.pump && harpoonCd===0){ const d=player.dir||'left'; harpoon={x:player.x,y:player.y,dir:d,life:12,len:0}; harpoonCd=10; }
    if(harpoon){
      harpoon.life--; if(harpoon.life<=0){harpoon=null;} else {
        harpoon.len=Math.min(6,harpoon.len+1);
        const v=dvec(harpoon.dir);
        for(let i=1;i<=harpoon.len;i++){
          const hx=player.x+v.x*i, hy=player.y+v.y*i;
          for(const e of enemies){ if(!e.dead && e.x===hx && e.y===hy){ e.dead=true; score+=100; } }
        }
      }
    }
  }

  function dvec(d){ return d==='left'?{x:-1,y:0}: d==='right'?{x:1,y:0}: d==='up'?{x:0,y:-1}:{x:0,y:1}; }

  function nextStep(sx,sy,tx,ty){
    const q=[{x:sx,y:sy}], prev=new Map(), seen=new Set([sx+','+sy]);
    while(q.length){
      const n=q.shift(); if(n.x===tx && n.y===ty) break;
      for(const d of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]){
        const nx=n.x+d.x, ny=n.y+d.y; if(nx<0||ny<0||nx>=COLS||ny>=ROWS) continue;
        if(grid[ny][nx]!==0) continue; const k=nx+','+ny; if(!seen.has(k)){ seen.add(k); prev.set(k,n.x+','+n.y); q.push({x:nx,y:ny}); }
      }
    }
    let k=tx+','+ty; if(!prev.has(k)) return null;
    const path=[]; while(k!==(sx+','+sy)){ path.push(k); k=prev.get(k); if(!k) break; }
    if(!path.length) return null; const [x,y]=path[path.length-1].split(',').map(Number); return {x,y};
  }

  function enemyAI(){
    if(enemies.every(e=>e.dead)){ level++; enemies=spawnEnemies(level); }
    for(const e of enemies){
      if(e.dead) continue;
      if(e.x===player.x && e.y===player.y && player.inv===0){ lives--; player.x=Math.floor(COLS/2); player.y=2; player.inv=30; if(lives<=0){ gameOver=true; togglePause(true); } continue; }
      if(Math.random()<0.08) e.ghost=!e.ghost;
      const step=nextStep(e.x,e.y,player.x,player.y); let moved=false;
      if(step){ moved=move(e, step.x-e.x, step.y-e.y, false); }
      if(!moved){ for(const d of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]){ if(passable(e.x+d.x,e.y+d.y,e.ghost)){ move(e,d.x,d.y,false); break; } } }
      if(e.ghost && Math.random()<0.04) e.ghost=false;
    }
  }

  function draw(){
    const ctx=canvas.getContext('2d');
    const r=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
    canvas.width=Math.floor(r.width*dpr); canvas.height=Math.floor(r.height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const s=Math.min(r.width/VW,r.height/VH); scale=s; ox=(r.width-VW*s)/2; oy=(r.height-VH*s)/2;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save(); ctx.translate(ox,oy); ctx.scale(scale,scale);
    ctx.fillStyle='#1a1833'; ctx.fillRect(0,0,VW,VH);
    for(let y=0;y<ROWS;y++){ for(let x=0;x<COLS;x++){ if(grid[y][x]===1){ ctx.fillStyle='#2a274e'; ctx.fillRect(x*TILE,y*TILE,TILE,TILE); ctx.fillStyle='#231f45'; ctx.fillRect(x*TILE+6,y*TILE+6,3,3); ctx.fillRect(x*TILE+14,y*TILE+12,2,2);} } }
    ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1;
    for(let y=0;y<ROWS;y++){ for(let x=0;x<COLS;x++){ if(grid[y][x]===0) ctx.strokeRect(x*TILE+0.5,y*TILE+0.5,TILE-1,TILE-1);} }
    // player
    const px=player.x*TILE, py=player.y*TILE;
    ctx.fillStyle='#ffd54a'; ctx.fillRect(px+5,py+5,TILE-10,TILE-10);
    ctx.fillStyle='#fff'; ctx.fillRect(px+8,py+8,8,6);
    ctx.fillStyle='#ff8a65'; if(player.dir==='left')ctx.fillRect(px,py+10,6,4);
    if(player.dir==='right')ctx.fillRect(px+TILE-6,py+10,6,4);
    if(player.dir==='up')ctx.fillRect(px+10,py,4,6);
    if(player.dir==='down')ctx.fillRect(px+10,py+TILE-6,4,6);
    if(player.inv>0 && (player.inv%6<3)){ ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fillRect(px+3,py+3,TILE-6,TILE-6); }
    // harpoon
    if(harpoon){ const v=dvec(harpoon.dir); ctx.strokeStyle='#9cf'; ctx.lineWidth=2; ctx.beginPath();
      ctx.moveTo(player.x*TILE+TILE/2,player.y*TILE+TILE/2);
      ctx.lineTo((player.x+v.x*harpoon.len)*TILE+TILE/2,(player.y+v.y*harpoon.len)*TILE+TILE/2);
      ctx.stroke();
    }
    for(const e of enemies){ if(e.dead) continue; const ex=e.x*TILE, ey=e.y*TILE; if(e.ghost){ ctx.fillStyle='rgba(255,50,50,0.35)'; } else { ctx.fillStyle='#ff6e6e'; } ctx.fillRect(ex+4,ey+4,TILE-8,TILE-8); ctx.fillStyle='#fff'; if(!e.ghost){ ctx.fillRect(ex+8,ey+8,3,3); ctx.fillRect(ex+TILE-11,ey+8,3,3);} }
    ctx.restore();
    hud.textContent=`Score ${score} · Lives ${lives} · Level ${level}`;
  }

  function tick(){ if(!paused){ stepTimer++; enemyTimer++; if(stepTimer>=4){playerStep(); stepTimer=0;} if(enemyTimer>=6){enemyAI(); enemyTimer=0;} draw(); } requestAnimationFrame(tick); }
  fit(); draw(); requestAnimationFrame(tick);
}
