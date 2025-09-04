export class Input{
  constructor(canvas){
    this.keys=new Set();
    this.touchX=0; this.touchY=0; this.touchPump=false;
    canvas.addEventListener('touchstart', e=> e.preventDefault(), {passive:false});
    window.addEventListener('keydown', e=> this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup',   e=> this.keys.delete(e.key.toLowerCase()));
  }
  setTouchDir(dir,down){ const v=down?1:0; if(dir==='left'){this.touchX=-v;this.touchY=0;} if(dir==='right'){this.touchX=v;this.touchY=0;} if(dir==='up'){this.touchY=-v;this.touchX=0;} if(dir==='down'){this.touchY=v;this.touchX=0;} }
  setPump(down){ this.touchPump=!!down; }
  get pump(){ return this.touchPump || this.keys.has(' ') || this.keys.has('space'); }
  get dirX(){ if(this.touchX) return this.touchX; return (this.keys.has('arrowleft')||this.keys.has('a')?-1:0)+(this.keys.has('arrowright')||this.keys.has('d')?1:0); }
  get dirY(){ if(this.touchY) return this.touchY; return (this.keys.has('arrowup')||this.keys.has('w')?-1:0)+(this.keys.has('arrowdown')||this.keys.has('s')?1:0); }
}