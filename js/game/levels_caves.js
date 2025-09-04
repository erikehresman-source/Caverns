export function makeLevel(seed=2){
  function rnd(){ seed=(seed*1103515245+12345)%2147483647; return seed/2147483647; }
  const cols=32, rows=42, enemies=[], rocks=[], treasures=[];
  for(let i=0;i<9;i++) enemies.push({x:3+Math.floor(rnd()*26), y:6+Math.floor(rnd()*32), type:rnd()<0.4?'fygar':'pooka'});
  for(let i=0;i<14;i++) rocks.push({x:2+Math.floor(rnd()*28), y:5+Math.floor(rnd()*35)});
  for(let i=0;i<8;i++) treasures.push({x:2+Math.floor(rnd()*28), y:5+Math.floor(rnd()*35)});
  return {theme:'caves', cols, rows, enemies, rocks, treasures, player:{x:Math.floor(cols/2),y:1}};
}