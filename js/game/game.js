import {Player} from './player.js';
import {Enemy} from './enemy.js';
import {Rock} from './rock.js';
import {Treasure} from './treasure.js';

export class Game{
  constructor(canvas,sfx,sprites,store){
    this.cv=canvas; this.cx=canvas.getContext('2d'); this.sfx=sfx; this.sprites=sprites; this.store=store;
    this.time=0; this.running=true; this.scale=1; this.hudEl=document.getElementById('hud'); this.difficulty=1;
    this.resetRng();
  }
  resetRng(){ this.seed=Math.floor(Math.random()*1e9); }
  async setupFrom(factory){
    const data=factory(this.seed);
    this.cols=data.cols; this.rows=data.rows; this.tiles=new Uint8Array(this.cols*this.rows); this.tiles.fill(1);
    for(let x=0;x<this.cols;x++) this.tiles[x]=0;
    for(let y=0;y<this.rows;y++) this.tiles[y*this.cols+Math.floor(this.cols/2)]=0;
    this.player=new Player(data.player.x,data.player.y);
    this.enemies=data.enemies.map(e=>new Enemy(e.x,e.y,e.type));
    this.rocks=data.rocks.map(r=>new Rock(r.x,r.y));
    this.treasures=data.treasures.map(t=>new Treasure(t.x,t.y));
    this.treasureCount = parseInt(localStorage.getItem('cq_unlocks')||'0',10);
    this.fit(); this.updateHud();
  }
  fit(){ const w=this.cv.clientWidth; const tile=Math.floor(w/30); this.scale=tile; this.cv.width=this.cols*tile; this.cv.height=this.rows*tile; }
  togglePause(){ this.running=!this.running; }
  restart(){ this.resetRng(); this.loadAndSetup(this._factoryUrl,'makeLevel'); }
  attachFactory(url,fn){ this._factoryUrl=url; this._factoryFnName=fn; }
  exportState(){ return JSON.stringify({seed:this.seed, score:this.player.score, world:this._factoryUrl, treasureCount:this.treasureCount}); }
  async importState(json){ const s=JSON.parse(json); if(typeof s.seed==='number') this.seed=s.seed; if(s.world&&s.world!==this._factoryUrl) await this.loadAndSetup(s.world,'makeLevel'); if(typeof s.score==='number') this.player.score=s.score; if(typeof s.treasureCount==='number'){ this.treasureCount=s.treasureCount; localStorage.setItem('cq_unlocks', String(this.treasureCount)); } }
  updateHud(){ if(this.hudEl) this.hudEl.textContent=`Score: ${this.player?.score|0}  |  Treasures: ${this.treasureCount}`; }
  async loadAndSetup(url,fn='makeLevel'){ const mod=await import(url); this.attachFactory(url,fn); await this.setupFrom(mod[fn]); }
  getCell(x,y){ if(x<0||y<0||x>=this.cols||y>=this.rows) return 1; return this.tiles[y*this.cols+x]; }
  setCell(x,y,v){ if(x<0||y<0||x>=this.cols||y>=this.rows) return; this.tiles[y*this.cols+x]=v; }
  firstEnemyInBeam(){ const range=6, dir=this.player.dir; for(let i=1;i<=range;i++){ const x=Math.round(this.player.x)+dir.x*i, y=Math.round(this.player.y)+dir.y*i; if(this.getCell(x,y)===1) break; for(const en of this.enemies){ if(!en.alive) continue; if(Math.abs(en.x-x)<0.3 && Math.abs(en.y-y)<0.3) return en; } } return null; }
  async queueScore(score){ try{ const json=JSON.parse(await this.store.get('scores','table')||'[]'); json.push({score,date:Date.now()}); json.sort((a,b)=>b.score-a.score); await this.store.set('scores','table', JSON.stringify(json.slice(0,10))); }catch{} }
  tick(dt,input){
    if(!this.running){ this.draw(); return; }
    this.time+=dt;
    const Grid={ get:(x,y)=>this.getCell(x,y), set:(x,y,v)=>this.setCell(x,y,v) };
    this.player.update(input,Grid,dt);
    this.setCell(Math.round(this.player.x),Math.round(this.player.y),0);
    for(const e of this.enemies) e.update(this.player,Grid,dt,this.difficulty);
    for(const r of this.rocks) r.update(Grid,this.enemies,dt);
    // Pump tether
    if(this.player.pumping){
      if(!this.player.tether){ const hit=this.firstEnemyInBeam(); if(hit) this.player.tether=hit; }
      if(this.player.tether && this.player.tether.alive){
        this.player.tetherTimer+=dt; if(this.player.tetherTimer>0.2){ const killed=this.player.tether.hitByPump(); this.player.tetherTimer=0; if(killed){ this.player.score+=200; this.sfx.pop(); this.updateHud(); this.player.tether=null; } else { this.sfx.pump(); } }
      } else { this.player.tether=null; }
    }
    // Collisions
    for(const en of this.enemies){ if(en.alive && Math.abs(en.x-this.player.x)<0.3 && Math.abs(en.y-this.player.y)<0.3){ this.player.alive=false; this.running=false; } }
    // Treasure pickup when tunnel opened
    for(const t of this.treasures){
      if(t.taken) continue;
      const px=Math.round(this.player.x), py=Math.round(this.player.y);
      if(Math.round(t.x)===px && Math.round(t.y)===py){
        t.taken=true; this.player.score+=100; this.treasureCount++; localStorage.setItem('cq_unlocks', String(this.treasureCount)); this.sfx.pop(); this.updateHud();
      }
    }
    // Win when enemies cleared and at least one treasure taken
    if (this.enemies.every(e=>!e.alive)){ this.player.score+=500; this.sfx.pop(); this.running=false; this.queueScore(this.player.score); }
    this.draw();
  }
  draw(){
    const cx=this.cx, s=this.scale; cx.imageSmoothingEnabled=false;
    // Background strata
    const strata=['#2b1a1a','#3b2412','#2c2a14','#1d2a1a'];
    for(let y=0;y<this.rows;y++){ cx.fillStyle=strata[Math.floor(y/10)%strata.length]; cx.fillRect(0,y*s,this.cv.width,s); }
    // Tunnels
    cx.fillStyle='#0c0b1f'; for(let y=0;y<this.rows;y++) for(let x=0;x<this.cols;x++) if(this.getCell(x,y)===0) cx.fillRect(x*s,y*s,s,s);
    // Rocks
    for(const r of this.rocks) spr(cx,this.sprites,0,4,Math.round(r.x*s),Math.round(r.y*s),s,s);
    // Treasures
    for(const t of this.treasures){ if(t.taken) continue; spr(cx,this.sprites,3,4,Math.round(t.x*s),Math.round(t.y*s),s,s); }
    // Enemies
    for(const e of this.enemies){ if(!e.alive) continue; const frame=Math.floor((performance.now()/200)%2); const idx=e.type==='fygar'?[1,3]:[1,2]; spr(cx,this.sprites,idx[0]-1+frame, idx[1], Math.round(e.x*s), Math.round(e.y*s), s,s); if(e.inflation>0){ cx.strokeStyle='#ffd400'; cx.lineWidth=2; cx.strokeRect(Math.round(e.x*s-2),Math.round(e.y*s-2),s+4,s+4); } }
    // Player
    const pframe=this.player.pumping?2:(Math.floor(this.player.anim)%2?0:1); spr(cx,this.sprites,pframe,1,Math.round(this.player.x*s),Math.round(this.player.y*s),s,s);
    // Hose
    if(this.player.pumping){ const dir=this.player.dir, range=6; for(let i=0;i<range;i++){ const hx=Math.round(this.player.x)+dir.x*i, hy=Math.round(this.player.y)+dir.y*i; if(this.getCell(hx,hy)===1) break; const tile=dir.x!==0?[1,4]:[2,4]; spr(cx,this.sprites,tile[0],tile[1],Math.round(hx*s),Math.round(hy*s),s,s); } }
    if(!this.running){ cx.fillStyle='rgba(0,0,0,0.5)'; cx.fillRect(0,0,this.cv.width,this.cv.height); cx.fillStyle='#fff'; cx.textAlign='center'; cx.font=`${Math.floor(s*0.8)}px system-ui`; const msg=this.player.alive?'LEVEL CLEAR!':'GAME OVER'; cx.fillText(msg,this.cv.width/2,this.cv.height/2); cx.font=`${Math.floor(s*0.5)}px system-ui`; cx.fillText('Press ⟲ to restart', this.cv.width/2, this.cv.height/2 + s); }
  }
}
function spr(cx,img,sx,sy,dx,dy,w,h){ const T=16; cx.drawImage(img, sx*T, sy*T, T,T, dx,dy, w,h); }