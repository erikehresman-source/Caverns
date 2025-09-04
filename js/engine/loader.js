export class Loader{
  constructor(onProgress){ this.cache=new Map(); this.total=0; this.done=0; this.onProgress=onProgress; }
  _bump(){ this.done++; if(this.onProgress) this.onProgress(this.done,this.total); }
  async queue(list){ this.total=list.length; this.done=0; const out=[];
    for(const it of list){
      if(it.type==='image'){ out.push(await this.loadImage(it.key,it.src)); }
      else if(it.type==='json'){ out.push(await (await fetch(it.src)).json()); }
      else { out.push(null); }
      this._bump();
    }
    return out;
  }
  async loadImage(key,src){ if(this.cache.has(key)) return this.cache.get(key); const img=new Image(); img.decoding='async'; img.src=src; try{ await img.decode(); }catch{} this.cache.set(key,img); return img; }
  get(key){ return this.cache.get(key); }
}