import {astar} from './ai.js';
export class Enemy{
  constructor(x,y,type='pooka'){ this.x=x; this.y=y; this.tx=x; this.ty=y; this.inflation=0; this.type=type; this.alive=true; this.ghost=false; this.cool=0; this.path=[]; this.pathCooldown=0; this.dead=false; }
  update(player, grid, dt, diff=1){
    if(!this.alive) return;
    this.cool-=dt; this.pathCooldown-=dt;
    if(this.inflation>0 && this.cool>0){ /* stunned */ }
    else{
      if(this.pathCooldown<=0){ const sx=Math.round(this.x), sy=Math.round(this.y); const gx=Math.round(player.x), gy=Math.round(player.y); this.path=astar(grid,[sx,sy],[gx,gy])||[]; this.pathCooldown=0.6-diff*0.1; }
      if(this.path && this.path.length>1){ const [nx,ny]=this.path[1]; this.tx=nx; this.ty=ny; }
      const speed=(this.ghost?11:8+diff)*dt; if(this.x!==this.tx) this.x=mv(this.x,this.tx,speed); if(this.y!==this.ty) this.y=mv(this.y,this.ty,speed);
      if(Math.random()<0.01) this.ghost=true; else if(this.ghost && Math.random()<0.1) this.ghost=false;
    }
  }
  hitByPump(){ this.inflation=Math.min(4,this.inflation+1); this.cool=0.35; if(this.inflation>=4){ this.alive=false; return true; } return false; }
}
function mv(a,b,m){ const d=b-a; if(Math.abs(d)<=m) return b; return a+Math.sign(d)*m; }