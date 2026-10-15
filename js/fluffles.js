/* The Adventures of Fluffles: reveals, motion comic player, choose-a-panel, episode filter */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var SND=function(k){try{if(window.CCA&&CCA.SND&&CCA.SND[k])CCA.SND[k]()}catch(e){}};

/* panels letter in as they scroll into view */
var cells=$$('.rv');
if('IntersectionObserver' in window&&!RM){
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.35});
 cells.forEach(function(c){if(!c.closest('.fl-motion')&&!c.closest('.fl-ends'))io.observe(c)});
}else cells.forEach(function(c){c.classList.add('in')});

/* tap a panel to give it a wiggle */
$$('.cell').forEach(function(c){c.addEventListener('click',function(){c.classList.remove('wig');void c.offsetWidth;c.classList.add('wig');SND('pop')})});

/* motion comic player */
$$('.fl-motion').forEach(function(m){
 var stage=$('.fm-stage',m),ps=$$('.cell',stage),n=ps.length,i=0,timer=null;
 var cnt=$('.count',m),bp=$('[data-a=prev]',m),bn=$('[data-a=next]',m),bpl=$('[data-a=play]',m),dots=$('.fm-dots',m),live=$('.fm-live',m);
 ps.forEach(function(){dots.appendChild(document.createElement('i'))});
 m.classList.add('on');
 function show(k,quiet){i=Math.max(0,Math.min(n-1,k));ps.forEach(function(p,j){p.classList.toggle('cur',j===i);p.classList.remove('in')});
  var p=ps[i];void p.offsetWidth;p.classList.add('in');
  cnt.textContent='Panel '+(i+1)+' of '+n;bp.disabled=i===0;bn.textContent=i===n-1?'Start over':'Next panel';
  $$('i',dots).forEach(function(d,j){d.classList.toggle('on',j===i)});
  if(live)live.textContent=p.querySelector('svg').getAttribute('aria-label');
  if(!quiet)SND('whoosh')}
 function stop(){clearInterval(timer);timer=null;bpl.textContent='Play';bpl.setAttribute('aria-pressed','false')}
 bp.addEventListener('click',function(){stop();show(i-1)});
 bn.addEventListener('click',function(){if(i===n-1){stop();show(0)}else show(i+1)});
 bpl.addEventListener('click',function(){if(timer){stop();return}bpl.textContent='Pause';bpl.setAttribute('aria-pressed','true');if(i===n-1)show(0);
  timer=setInterval(function(){if(i>=n-1){stop();return}show(i+1)},4200)});
 stage.addEventListener('click',function(e){if(e.target.closest('a,button'))return;if(timer)stop();if(i<n-1)show(i+1)});
 m.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){stop();show(i+1)}if(e.key==='ArrowLeft'){stop();show(i-1)}});
 show(0,true);
});

/* choose-a-panel */
$$('.fl-choice').forEach(function(ch){
 var ends=document.getElementById(ch.dataset.ends);if(!ends)return;ends.classList.add('on');
 var bs=$$('button[data-pick]',ch);
 function pick(id){bs.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.pick===id?'true':'false')});
  $$('.fl-end',ends).forEach(function(e){var on=e.id==='end-'+id;e.classList.toggle('cur',on);var c=$('.rv',e);if(c){c.classList.remove('in');if(on){void c.offsetWidth;c.classList.add('in')}}});
  var cur=document.getElementById('end-'+id);if(cur){SND(cur.dataset.good==='1'?'win':'oops');cur.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'});var h=$('h3',cur);if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}}
 bs.forEach(function(b){b.addEventListener('click',function(){pick(b.dataset.pick)})});
 $$('.again',ends).forEach(function(a){a.addEventListener('click',function(){bs.forEach(function(b){b.setAttribute('aria-pressed','false')});$$('.fl-end',ends).forEach(function(e){e.classList.remove('cur')});ch.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'});bs[0].focus({preventScroll:true})})});
});

/* hub: tap the cartoon Fluffles */
var toon=$('.scrap .toon');
if(toon){var lines=['Wheek! Hi!','What is that? And that? And THAT?','Popcorn time!','Is this the snack door?','I have SO many questions.'],li=0,hi=$('.scrap .hi');
 toon.addEventListener('click',function(){toon.classList.remove('pop');void toon.offsetWidth;toon.classList.add('pop');SND('boing');if(hi){li=(li+1)%lines.length;hi.textContent=lines[li]}})}

/* hub: filter episodes by style */
var fb=$('.ep-filter');
if(fb){fb.hidden=false;$$('button',fb).forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.k;
 $$('button',fb).forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false')});
 $$('.eps li').forEach(function(li){li.hidden=!(k==='all'||(' '+li.dataset.k+' ').indexOf(' '+k+' ')>-1)});SND('pop')})})}
})();
