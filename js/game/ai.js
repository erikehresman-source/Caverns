export function astar(grid,start,goal,maxNodes=500){
  const key=(x,y)=>x+'_'+y; const open=new Map(), came=new Map(), G=new Map(), F=new Map();
  const h=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
  const sk=key(...start), gk=key(...goal); open.set(sk,start); G.set(sk,0); F.set(sk,h(start,goal));
  let nodes=0;
  while(open.size && nodes<maxNodes){
    nodes++; let ck=null, cv=null, best=1e9; for(const [k,v] of open){ const fv=F.get(k)??1e9; if(fv<best){ best=fv; ck=k; cv=v; } }
    if(ck===gk){ const path=[goal]; let t=ck; while(came.has(t)){ t=came.get(t); const [x,y]=t.split('_').map(Number); path.unshift([x,y]); } return path; }
    open.delete(ck); const [cx,cy]=cv;
    for(const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]){
      if(grid.get(nx,ny)!==0) continue;
      const nk=key(nx,ny); const tg=(G.get(ck)??1e9)+1;
      if(tg<(G.get(nk)??1e9)){ came.set(nk,ck); G.set(nk,tg); F.set(nk,tg+h([nx,ny],goal)); if(!open.has(nk)) open.set(nk,[nx,ny]); }
    }
  }
  return null;
}