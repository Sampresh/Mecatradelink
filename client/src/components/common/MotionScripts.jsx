// Tiny, framework-free motion runtime (runs before React hydrates, so above-the-fold
// content reveals immediately). It only touches attributes React doesn't render
// (data-motion on <html>, data-revealed / data-reveal-delay, --mx/--my), so hydration is clean.

// <head>: enable reveal styles only when JS runs; fail open after 3s if the observer never starts.
const HEAD = `(function(){var d=document.documentElement;
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
d.setAttribute('data-motion','');
setTimeout(function(){if(!window.__mtlReveal)d.removeAttribute('data-motion')},3000);})();`;

// end of <body>: reveal [data-reveal] elements as they enter the viewport, staggering
// elements that enter together (top-to-bottom, left-to-right), and feed cursor position
// to .card-glow cards on pointer devices.
const BODY = `(function(){var d=document.documentElement;if(!d.hasAttribute('data-motion'))return;
if(!('IntersectionObserver' in window)){d.removeAttribute('data-motion');return;}
window.__mtlReveal=1;
var io=new IntersectionObserver(function(entries){
  var shown=entries.filter(function(e){return e.isIntersecting}).sort(function(a,b){
    var x=a.boundingClientRect,y=b.boundingClientRect;return (x.top-y.top)||(x.left-y.left)});
  shown.forEach(function(e,i){var el=e.target;if(i)el.setAttribute('data-reveal-delay',Math.min(i,8));
    el.setAttribute('data-revealed','');io.unobserve(el);});
},{rootMargin:'0px 0px -6% 0px',threshold:0.08});
function scan(root){if(root.matches&&root.matches('[data-reveal]:not([data-revealed])'))io.observe(root);
  if(root.querySelectorAll)root.querySelectorAll('[data-reveal]:not([data-revealed])').forEach(function(el){io.observe(el)});}
scan(document);
new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n)})})})
  .observe(document.body,{childList:true,subtree:true});
if(matchMedia('(hover: hover) and (pointer: fine)').matches){
  document.addEventListener('pointermove',function(e){var c=e.target.closest&&e.target.closest('.card-glow');if(!c)return;
    var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');},{passive:true});
}})();`;

export function MotionHeadScript() {
  return <script dangerouslySetInnerHTML={{ __html: HEAD }} />;
}

export function MotionBodyScript() {
  return <script dangerouslySetInnerHTML={{ __html: BODY }} />;
}
