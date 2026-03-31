/**
 * Injected with next/script strategy="beforeInteractive".
 * Extensions (e.g. Bitwarden: bis_register, others: __processed_*) mutate <html>/<body>
 * before hydration; removing those attributes restores a DOM that matches SSR.
 */
export const extensionRootAttrGuardScript = `(function(){
"use strict";
function shouldRemove(n){return n==="bis_register"||n.indexOf("__processed_")===0;}
function strip(el){
if(!el||!el.attributes)return;
var names=[],i,n;
for(i=el.attributes.length-1;i>=0;i--){
n=el.attributes[i].name;
if(shouldRemove(n))names.push(n);
}
for(i=0;i<names.length;i++)el.removeAttribute(names[i]);
}
function watch(el){
if(!el)return null;
strip(el);
var mo=new MutationObserver(function(records){
var j,t;
for(j=0;j<records.length;j++){
if(records[j].type!=="attributes")continue;
t=records[j].target;
if(t===document.documentElement||t===document.body)strip(t);
}
});
mo.observe(el,{attributes:true});
return mo;
}
function run(){
var root=document.documentElement;
var body=document.body;
strip(root);
if(body)strip(body);
var obs=[];
var a=watch(root);
var b=body?watch(body):null;
if(a)obs.push(a);
if(b)obs.push(b);
function dis(){var k;for(k=0;k<obs.length;k++){try{obs[k].disconnect();}catch(e){}}}
window.addEventListener("load",function(){setTimeout(dis,0);});
setTimeout(dis,10000);
}
if(document.readyState==="loading")
document.addEventListener("DOMContentLoaded",run);
else
run();
})();`;
