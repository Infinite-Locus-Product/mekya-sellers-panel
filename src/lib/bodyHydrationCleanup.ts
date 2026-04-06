/**
 * Inline script run synchronously inside <body> (before and after SSR children).
 * Strips attributes commonly injected onto document.body by browser extensions
 * (e.g. __processed_<uuid>__) so the DOM matches React’s expected <body> props
 * at hydration time — without suppressHydrationWarning.
 *
 * Side effects: mutates document.body attribute list when matches are found.
 * Failure modes: none (no-op if body missing); CSP must allow inline script (default here).
 */
export const BODY_HYDRATION_CLEANUP_SCRIPT = String.raw`(function(){
function strip(){
var el=document.body;
if(!el||!el.attributes)return;
for(var i=el.attributes.length-1;i>=0;i--){
var n=el.attributes[i].name;
if(/^__processed_[\w-]+__$/.test(n)||n==="cz-shortcut-listen")el.removeAttribute(n);
}
}
strip();
})();`
