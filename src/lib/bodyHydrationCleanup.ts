/**
 * Removes attributes injected by browser extensions (e.g. Bitwarden `bis_*`,
 * ColorZilla `cz-shortcut-listen`) before React hydrates so the DOM matches SSR.
 *
 * Inputs: none (reads `document`)
 * Outputs: none
 * Side effects: mutates DOM attributes
 * Failure modes: no-op if `document.body` is missing; safe to call repeatedly
 */
export const BODY_HYDRATION_CLEANUP_SCRIPT = String.raw`(function(){
function strip(){
var root=document.documentElement;
if(root&&root.attributes){
for(var ri=root.attributes.length-1;ri>=0;ri--){
var rn=root.attributes[ri].name;
if(rn==="bis_register"||rn.indexOf("bis_")===0)root.removeAttribute(rn);
}
}
var el=document.body;
if(!el||!el.attributes)return;
for(var i=el.attributes.length-1;i>=0;i--){
var n=el.attributes[i].name;
if(
/^__processed_[\w-]+__$/.test(n)||
n==="cz-shortcut-listen"||
n==="bis_register"||
n.indexOf("bis_")===0
)el.removeAttribute(n);
}
var nodes=el.getElementsByTagName("*");
for(var nodeIndex=0;nodeIndex<nodes.length;nodeIndex++){
var node=nodes[nodeIndex];
if(!node||!node.attributes)continue;
for(var attrIndex=node.attributes.length-1;attrIndex>=0;attrIndex--){
var attrName=node.attributes[attrIndex].name;
if(attrName==="bis_register"||attrName.indexOf("bis_")===0){
node.removeAttribute(attrName);
}
}
}
}
function runScheduled(){
strip();
if(typeof requestAnimationFrame==="function")requestAnimationFrame(strip);
setTimeout(strip,0);
setTimeout(strip,50);
}
function start(){
if(document.body)runScheduled();
else document.addEventListener("DOMContentLoaded",runScheduled,{once:true});
}
start();
})();`
