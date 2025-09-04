export class Grid{
  constructor(cols,rows){ this.cols=cols; this.rows=rows; this.cells=new Uint8Array(cols*rows); this.reset(); }
  reset(){ this.cells.fill(1); for(let x=0;x<this.cols;x++) this.set(x,0,0); for(let y=0;y<this.rows;y++) this.set(Math.floor(this.cols/2),y,0); }
  idx(x,y){ return y*this.cols+x; }
  inBounds(x,y){ return x>=0&&y>=0&&x<this.cols&&y<this.rows; }
  get(x,y){ return this.inBounds(x,y)? this.cells[this.idx(x,y)] : 1; }
  set(x,y,v){ if(this.inBounds(x,y)) this.cells[this.idx(x,y)] = v; }
}