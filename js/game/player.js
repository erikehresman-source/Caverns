export class Player{
  constructor(x,y){ this.x=x; this.y=y; this.tx=x; this.ty=y; this.dir={x:1,y:0}; this.alive=true; this.score=0; this.pumping=false; this.tether=null; this.tetherTimer=0; this.anim=0; }
  update(input, grid, dt){
    if(!this.alive) return;
    const dx=input.dirX, dy=input.dirY;
    if((dx||dy) && this.tx===this.x && this.ty===this.y){
      if(Math.abs(dx)>Math.abs(dy)) this.dir={x:Math.sign(dx),y:0}; else if(dy) this.dir={x:0,y:Math.sign(dy)};
      const nx=this.x+this.dir.x, ny=this.y+this.dir.y; grid.set(nx,ny,0); this.tx=nx; this.ty=ny;
    }
    const speed=15*dt; if(this.x!==this.tx) this.x=mv(this.x,this.tx,speed); if(this.y!==this.ty) this.y=mv(this.y,this.ty,speed);
    this.pumping=input.pump; if(!this.pumping){ this.tether=null; this.tetherTimer=0; } this.anim+=dt*10;
  }
}
function mv(a,b,m){ const d=b-a; if(Math.abs(d)<=m) return b; return a+Math.sign(d)*m; }