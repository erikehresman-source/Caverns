export function makeLevel(seed=1){
  function rnd(){ seed=(seed*1664525+1013904223)%4294967296; return seed/4294967296; }
  const cols=30, rows=40, enemies=[], rocks=[], treasures=[];
  for(let i=0;i<7;i++) enemies.push({x:3+Math.floor(rnd()*24), y:6+Math.floor(rnd()*30), type:rnd()<0.35?'fygar':'pooka'});
  for(let i=0;i<10;i++) rocks.push({x:2+Math.floor(rnd()*26), y:5+Math.floor(rnd()*33)});
  for(let i=0;i<6;i++) treasures.push({x:2+Math.floor(rnd()*26), y:4+Math.floor(rnd()*32)});
  return {theme:'classic', cols, rows, enemies, rocks, treasures, player:{x:15,y:1}};
}