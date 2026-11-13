const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Element{constructor(){this.value='';this.defaultValue='';this.textContent='';this.listeners={};this.selectionStart=this.selectionEnd=0;}addEventListener(n,f){this.listeners[n]=f;}cloneNode(){return new Element;}replaceWith(e){els['#text']=e;}setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b;}setRangeText(t,a,b){this.value=this.value.slice(0,a)+t+this.value.slice(b);}focus(){}select(){this.selected=true;}}
const els=Object.fromEntries(['#text','#status','#count','#paste','#copy','#clear'].map(k=>[k,new Element]));
const doc={hidden:false,listeners:{},querySelector:s=>els[s],addEventListener(n,f){this.listeners[n]=f;}};
const win={listeners:{},addEventListener(n,f){this.listeners[n]=f;}};
let written='',resolvePaste;
const context={document:doc,window:win,navigator:{clipboard:{readText:async()=>'<b>Hello</b>\u200B\u202E\r\nworld',writeText:async t=>{written=t;}}},location:{reload(){}},setInterval(){}};
vm.runInNewContext(fs.readFileSync(__dirname+'/app.js','utf8'),context);
(async()=>{
 await els['#paste'].listeners.click(); assert.equal(els['#text'].value,'<b>Hello</b>\nworld');
 await els['#copy'].listeners.click();assert.equal(written,'<b>Hello</b>\nworld');
 const old=els['#text'];els['#clear'].listeners.click();assert.equal(els['#text'].value,'');assert.notEqual(old,els['#text']);
 for(const event of ['blur','pagehide']){els['#text'].value='private';win.listeners[event]({});assert.equal(els['#text'].value,'');}
 els['#text'].value='private';doc.hidden=true;doc.listeners.visibilitychange();assert.equal(els['#text'].value,'');doc.hidden=false;
 context.navigator.clipboard.readText=()=>new Promise(r=>resolvePaste=r);const pending=els['#paste'].listeners.click();win.listeners.blur();resolvePaste('late secret');await pending;assert.equal(els['#text'].value,'');
 context.navigator.clipboard.readText=async()=>{throw Error('denied')};await els['#paste'].listeners.click();assert.match(els['#status'].textContent,/Touch and hold/);
 context.navigator.clipboard.writeText=async()=>{throw Error('denied')};await els['#copy'].listeners.click();assert.match(els['#status'].textContent,/selection menu/);
 let prevented=false;els['#text'].listeners.paste({preventDefault(){prevented=true;},clipboardData:{getData(type){assert.equal(type,'text/plain');return 'clean\uFEFF';}}});assert(prevented);assert.equal(els['#text'].value,'clean');
 const code=fs.readFileSync(__dirname+'/app.js','utf8');assert(!/localStorage|sessionStorage|indexedDB|sendBeacon|fetch\(/.test(code));
 const handlers={},entries=new Map;let network=0;
 const cache={addAll:async urls=>urls.forEach(u=>entries.set(u,{body:u})),match:async r=>entries.get(r.url)};
 const sw={registration:{scope:'https://example.test/notepad/'},addEventListener:(n,f)=>handlers[n]=f,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
 vm.runInNewContext(fs.readFileSync(__dirname+'/sw.js','utf8'),{self:sw,URL,caches:{open:async()=>cache,keys:async()=>['notepad-v1']},fetch:async()=>{network++;throw Error('offline')}});
 let task;handlers.install({waitUntil:p=>task=p});await task;
 for(const path of ['','index.html','app.js','style.css','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png']){let result;handlers.fetch({request:{method:'GET',url:'https://example.test/notepad/'+path},respondWith:p=>result=p});assert(await result);}
 assert.equal(network,0);let intercepted=false;handlers.fetch({request:{method:'POST',url:'https://example.test/notepad/'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
 console.log('PASS: plain-text paste/copy, control stripping, clear/undo reset, lifecycle clearing, delayed-paste race, clipboard-denial fallbacks, no text persistence/network, offline cached app assets, non-GET exclusion.');
})().catch(e=>{console.error(e);process.exitCode=1;});
