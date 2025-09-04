export class Store{
  constructor(dbName='cq', stores=['saves','scores']){ this.dbName=dbName; this.stores=stores; this.db=null; }
  async open(){ if(this.db) return this.db; return new Promise((res,rej)=>{
    const req=indexedDB.open(this.dbName,1);
    req.onupgradeneeded=()=>{ const db=req.result; this.stores.forEach(n=>{ if(!db.objectStoreNames.contains(n)) db.createObjectStore(n); }); };
    req.onsuccess=()=>{ this.db=req.result; res(this.db); };
    req.onerror=()=>rej(req.error);
  }); }
  async set(store,key,val){ const db=await this.open(); return new Promise((res,rej)=>{ const tx=db.transaction(store,'readwrite'); tx.objectStore(store).put(val,key); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); }); }
  async get(store,key){ const db=await this.open(); return new Promise((res,rej)=>{ const tx=db.transaction(store,'readonly'); const rq=tx.objectStore(store).get(key); rq.onsuccess=()=>res(rq.result); rq.onerror=()=>rej(rq.error); }); }
  async del(store,key){ const db=await this.open(); return new Promise((res,rej)=>{ const tx=db.transaction(store,'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); }); }
}