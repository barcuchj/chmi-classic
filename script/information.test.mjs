import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

function boot({enabled=true, visibleText="Historická data. Teploty a srážkové úhrny, historické extrémy a další datové výstupy."}={}) {
  const listeners={}, messages=[], classes=new Set(), nodes=[], assigned=[];
  class Element {
    constructor(tag="div") {this.tag=tag;this.children=[];this.dataset={};this.attributes={};this.textContent="";}
    setAttribute(key,value){this.attributes[key]=value;}
    hasAttribute(key){return Object.hasOwn(this.attributes,key);}
    append(...children){this.children.push(...children);}
    insertBefore(child){this.children.unshift(child);}
    contains(node){return this===node||this.children.some(child=>child.contains(node));}
  }
  const heading=new Element("h1");heading.textContent="Historická data";
  const content=new Element();content.append(heading);content.innerText=visibleText;content.textContent="large hidden script ".repeat(100);
  heading.parentElement=content;
  const main=new Element("main");main.append(content);main.querySelector=()=>heading;
  const document={referrer:"https://www.chmi.cz/",documentElement:{classList:{add:n=>classes.add(n)}},
    createElement:tag=>{const node=new Element(tag);nodes.push(node);return node;},
    getElementById:id=>nodes.find(n=>n.id===id), querySelector:()=>main,
    addEventListener:(name,fn)=>{listeners[name]=fn;}};
  const context=vm.createContext({URL,Element,document,location:{href:"https://www.chmi.cz/namerena-data/historicka-data",assign:url=>assigned.push(url)},
    chrome:{storage:{sync:{get:(_defaults,fn)=>fn({chmiRadarClassicEnabled:enabled})}}},
    window:{top:{},name:"chmi-classic:history:test-session",parent:{postMessage:(data,origin)=>messages.push({data,origin})}},
    MutationObserver:class{observe(){}},requestAnimationFrame:fn=>fn()});
  for(const file of ["portal-registry.js","information.js"])
    vm.runInContext(readFileSync(new URL("../chrome-edge/"+file,import.meta.url),"utf8"),context);
  function click(href, {metaKey=false,target="_self",download=false}={}) {
    const link=new Element("a");link.href=href;link.target=target;link.closest=()=>link;
    if(download)link.setAttribute("download","");
    const event={target:link,button:0,metaKey,preventDefault(){this.prevented=true;},stopImmediatePropagation(){}};
    listeners.click?.(event);return event;
  }
  return {content,main,messages,classes,assigned,click};
}

test("information readiness requires native visible text, not scripts or the new navigation",()=>{
  assert.equal(boot().content.dataset.chmiInformationNative,"verified");
  assert.equal(boot({visibleText:"Načítání…"}).content.dataset.chmiInformationNative,undefined);
  assert.equal(boot({enabled:false}).classes.size,0);
});
test("native app links hand off to the parent; home returns to the portal",()=>{
  const page=boot();page.click("https://www.chmi.cz/namerena-data/webkamery");
  assert.equal(page.messages[0].data.target,"webcams");
  assert.equal(page.messages[0].data.url,"https://www.chmi.cz/namerena-data/webkamery");
  assert.equal(page.messages[0].data.app,"history");
  assert.equal(page.messages[0].origin,"https://www.chmi.cz");
  page.click("https://www.chmi.cz/");assert.equal(page.messages.at(-1).data.target,"home");
});
test("internal target blank stays in the frame; deliberate new tabs and downloads remain native",()=>{
  const page=boot();const url="https://www.chmi.cz/namerena-data/historicka-data/mapy-teploty-vzduchu";
  assert.equal(page.click(url,{target:"_blank"}).prevented,true);
  assert.deepEqual(page.assigned,[url]);
  assert.equal(page.click(url,{metaKey:true,target:"_blank"}).prevented,undefined);
  assert.equal(page.click(url,{download:true,target:"_blank"}).prevented,undefined);
  assert.equal(page.click("https://evil.test/o-chmu",{target:"_blank"}).prevented,undefined);
  assert.equal(page.messages.length,0);
});
