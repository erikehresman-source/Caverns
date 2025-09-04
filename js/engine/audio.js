export class Sfx{
  constructor(){ this.ctx=null; this.enabled=true; }
  setEnabled(v){ this.enabled=v; }
  _ctx(){ if(!this.ctx) this.ctx=new (window.AudioContext||window.webkitAudioContext)(); return this.ctx; }
  beep(freq=440,dur=0.06,type='square',gain=0.03){ if(!this.enabled) return; const ctx=this._ctx(); const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=gain; o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+dur); }
  step(){ this.beep(220,0.03,'square',0.02); } pump(){ this.beep(140,0.04,'sawtooth',0.04); } pop(){ this.beep(880,0.08,'triangle',0.05); } crush(){ this.beep(100,0.12,'square',0.06); }
}