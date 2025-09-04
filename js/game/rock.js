export class Rock{
  constructor(x,y){ this.x=x; this.y=y; this.falling=false; this.fallDelay=0; this.dead=false; this.vy=0; }
  update(grid, entities, dt){
    if(this.dead) return;
    const gx=Math.round(this.x), gy=Math.round(this.y);
    const emptyBelow = grid.get(gx,gy+1)===0 && !blocked(entities,gx,gy+1);
    if(emptyBelow){ this.fallDelay+=dt; if(this.fallDelay>0.25){ this.falling=true; } }
    else{
      const canLeft = grid.get(gx-1,gy)===0 && grid.get(gx-1,gy+1)===0 && !blocked(entities,gx-1,gy) && !blocked(entities,gx-1,gy+1);
      const canRight= grid.get(gx+1,gy)===0 && grid.get(gx+1,gy+1)===0 && !blocked(entities,gx+1,gy) && !blocked(entities,gx+1,gy+1);
      if(canLeft) this.x-=dt*6; else if(canRight) this.x+=dt*6;
      this.fallDelay=0; this.falling=false; this.vy=0;
    }
    if(this.falling){
      this.vy+=40*dt; this.y+=this.vy*dt;
      for(const e of entities){ if(!e.alive||e.dead) continue; if(Math.abs(e.x-this.x)<0.4 && e.y>this.y && Math.abs(e.y-this.y)<1.0){ e.alive=false; e.dead=true; } }
      if(grid.get(Math.round(this.x), Math.floor(this.y)+1)===1){ this.falling=false; this.vy=0; }
    }
  }
}
function blocked(entities,x,y){ return entities.some(e=>!e.dead && Math.round(e.x)===x && Math.round(e.y)===y); }