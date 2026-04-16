
export const BODY_HYDRATION_CLEANUP_SCRIPT = String.raw`(function(){
function strip(){
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
strip();
})();`
