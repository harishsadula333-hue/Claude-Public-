const {chromium}=require('playwright');
const FPS=30,TOTAL=1200,WORKERS=4;
(async()=>{
 const b=await chromium.launch();
 await Promise.all([...Array(WORKERS).keys()].map(async w=>{
  const p=await b.newPage({viewport:{width:1080,height:1920}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('http://localhost:8765/index.html');await p.evaluate(()=>window.ready);
  for(let f=w;f<TOTAL;f+=WORKERS){
   await p.evaluate(t=>render(t),f/FPS);
   await p.screenshot({path:`frames/${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:94});
   if(f%200===0)console.log('frame',f);
  }
 }));
 await b.close();
})();
