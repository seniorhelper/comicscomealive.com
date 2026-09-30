/* Comics Come Alive: shared script (menu, Captain Kapow guide, sound, face capture) */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const CCA=window.CCA=window.CCA||{};CCA.RM=RM;

/* ---------- Captain Kapow art ---------- */
CCA.kapowSVG=(cls)=>`<svg class="${cls||''}" viewBox="0 0 200 240" aria-hidden="true"><g stroke="#000" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
<path d="M66 94 Q44 160 30 222 Q66 206 100 220 Q134 206 170 222 Q156 160 134 94Z" fill="#2448A8"/><path d="M106 104 Q114 160 112 214 Q138 206 162 214 Q150 160 130 100Z" fill="rgba(0,0,0,.25)" stroke="none"/>
<path d="M80 158 L78 204 H97 L100 162Z M120 158 L122 204 H103 L100 162Z" fill="#E8242A"/><path d="M74 194 H98 L99 216 H68 Q66 204 74 194Z M102 194 H126 Q134 204 132 216 H101Z" fill="#FFD91A"/>
<path d="M70 94 Q100 84 130 94 L126 160 Q100 168 74 160Z" fill="#E8242A"/><path d="M114 92 Q124 92 129 95 L125 158 Q118 162 110 163Z" fill="rgba(0,0,0,.18)" stroke="none"/>
<path d="M74 148 Q100 156 126 148 L126 160 Q100 168 74 160Z" fill="#FFD91A"/><rect x="92" y="150" width="16" height="12" rx="2" fill="#E8242A" stroke-width="2.5"/>
<path d="M84 116 Q84 106 100 106 Q116 106 116 116 Q116 126 104 126 L97 134 L98 126 Q84 126 84 116Z" fill="#fff" stroke-width="3"/><text x="100" y="123" text-anchor="middle" font-family="Bangers,Impact" font-size="16" fill="#E8242A" stroke="none">!</text>
<path d="M72 98 Q50 116 58 140 L70 137" fill="none" stroke-width="16"/><path d="M72 98 Q50 116 58 140 L70 137" fill="none" stroke="#E8242A" stroke-width="9"/><circle cx="72" cy="136" r="8" fill="#FFD91A"/>
<g class="kp-arm"><path d="M128 98 Q150 116 142 140 L130 137" fill="none" stroke-width="16"/><path d="M128 98 Q150 116 142 140 L130 137" fill="none" stroke="#E8242A" stroke-width="9"/><circle cx="128" cy="136" r="8" fill="#FFD91A"/></g>
<rect x="92" y="80" width="16" height="14" fill="#F5C9A0"/><ellipse cx="76" cy="64" rx="4.5" ry="7" fill="#F5C9A0"/><ellipse cx="124" cy="64" rx="4.5" ry="7" fill="#F5C9A0"/>
<path d="M76 62 Q76 36 100 36 Q124 36 124 62 Q124 82 110 92 Q100 96 90 92 Q76 82 76 62Z" fill="#F5C9A0"/><path d="M112 42 Q124 46 123 64 Q122 82 110 91 Q116 70 112 42Z" fill="rgba(0,0,0,.13)" stroke="none"/>
<path d="M74 58 Q70 30 100 28 Q130 28 126 58 Q120 44 108 44 Q114 36 100 38 Q92 30 88 42 Q80 44 74 58Z" fill="#1A1A2E"/><path d="M86 35 Q96 31 108 33" fill="none" stroke="#6CA0FF" stroke-width="3"/>
<path d="M78 58 Q100 50 122 58 L121 70 Q108 66 100 70 Q92 66 79 70Z" fill="#2448A8"/>
<g class="kp-eyes"><ellipse cx="90" cy="62" rx="6" ry="4.5" fill="#fff" stroke-width="2"/><ellipse cx="110" cy="62" rx="6" ry="4.5" fill="#fff" stroke-width="2"/><circle cx="91" cy="62" r="2.6" fill="#000" stroke="none"/><circle cx="111" cy="62" r="2.6" fill="#000" stroke="none"/></g>
<path d="M100 70 L98 77 L102 78" fill="none" stroke-width="2"/><path d="M89 83 Q100 90 111 83" fill="none" stroke-width="3"/></g></svg>`;

/* ---------- sound (made in the browser, off until you turn it on) ---------- */
const SND=CCA.SND={on:false,c:null,
 init(){if(!this.c){try{this.c=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(this.c&&this.c.state==='suspended')this.c.resume()},
 tone(f1,f2,d,type,v){if(!this.on||!this.c)return;const c=this.c,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(v||.2,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+.02)},
 noise(d,f,v){if(!this.on||!this.c)return;const c=this.c,t=c.currentTime,n=Math.floor(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=b;fl.type='bandpass';fl.frequency.value=f;fl.Q.value=.8;g.gain.value=v;s.connect(fl).connect(g).connect(c.destination);s.start(t)},
 pop(){this.tone(700,1600,.08,'sine',.18)},boing(){this.tone(160,480,.3,'triangle',.22)},whoosh(){this.noise(.28,900,.35)},
 thud(){this.tone(130,40,.28,'sine',.5);this.noise(.12,300,.4)},chime(){this.tone(880,1320,.16,'sine',.14)},win(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>this.tone(f,f*1.01,.18,'triangle',.16),i*110))},
 oops(){this.tone(400,180,.3,'sawtooth',.08)},splash(){this.noise(.5,700,.4)},zap(){this.tone(1200,200,.25,'square',.06)}};
CCA.sound=(on)=>{SND.on=on;SND.init();try{localStorage.setItem('cca-snd',on?'1':'0')}catch(e){}document.dispatchEvent(new CustomEvent('cca-sound',{detail:on}));if(on)SND.chime()};

/* ---------- read aloud (optional voice) ---------- */
CCA.speak=(text,o={})=>{if(!('speechSynthesis' in window)||!CCA.voiceOn)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=o.rate||1;u.pitch=o.pitch||1.05;
 const vs=speechSynthesis.getVoices().filter(v=>/^en(-|_)US/i.test(v.lang));if(vs.length)u.voice=vs.find(v=>/natural|samantha|aria|jenny|google us/i.test(v.name))||vs[0];speechSynthesis.speak(u)};
CCA.voiceOn=false;

/* ---------- face swap (camera stays on this device, nothing is uploaded) ---------- */
CCA.face={get(){try{return localStorage.getItem('cca-face')}catch(e){return null}},clear(){try{localStorage.removeItem('cca-face')}catch(e){}document.dispatchEvent(new CustomEvent('cca-face',{detail:null}))},
 capture(){return new Promise(res=>{const m=document.createElement('div');m.className='menu on';m.style.display='block';m.innerHTML=`<div class="panelbox" style="max-width:440px;margin:0 auto;text-align:center">
  <h2 class="h2">Put your face in the comic!</h2><p style="font-weight:400;margin:0 0 10px">Line your face up in the circle. Your photo stays on this device and is never uploaded.</p>
  <div style="position:relative;width:260px;height:260px;margin:0 auto;border:4px solid #000;border-radius:50%;overflow:hidden;background:#000"><video playsinline autoplay muted style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1)"></video></div>
  <div class="kp-row" style="justify-content:center;margin-top:12px"><button type="button" data-a="snap">Snap it!</button><button type="button" data-a="x">Cancel</button></div><p class="kp-note" data-msg></p></div>`;
  document.body.appendChild(m);const v=$('video',m);let st=null;const done=val=>{if(st)st.getTracks().forEach(t=>t.stop());m.remove();res(val)};
  navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:640,height:640}}).then(s=>{st=s;v.srcObject=s}).catch(()=>{$('[data-msg]',m).textContent='Camera not available. Check your browser permission and try again.'}):($('[data-msg]',m).textContent='This browser does not support the camera.');
  m.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(!a)return;if(a.dataset.a==='x')return done(null);if(!v.videoWidth)return;
   const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const s=Math.min(v.videoWidth,v.videoHeight)*.78;x.translate(256,0);x.scale(-1,1);
   x.drawImage(v,(v.videoWidth-s)/2,(v.videoHeight-s)/2-s*.04,s,s,0,0,256,256);const url=c.toDataURL('image/jpeg',.85);try{localStorage.setItem('cca-face',url)}catch(e){}
   document.dispatchEvent(new CustomEvent('cca-face',{detail:url}));SND.chime();done(url)})})}};

/* ---------- menu ---------- */
function menu(){const btn=$('.menubtn'),m=$('.menu');if(!btn||!m)return;const x=$('.menu-close',m);
 const open=on=>{m.classList.toggle('on',on);btn.setAttribute('aria-expanded',on);document.documentElement.style.overflow=on?'hidden':'';if(on){$$('.menu-grid a',m).forEach((a,i)=>{a.style.setProperty('--dl',i*.03+'s');a.style.setProperty('--rt',(i%3-1)*.8+'deg')});x.focus()}else btn.focus()};
 btn.addEventListener('click',()=>open(true));x.addEventListener('click',()=>open(false));m.addEventListener('click',e=>{if(e.target===m)open(false)});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('on'))open(false)})}

/* ---------- Captain Kapow guide (a comic character, not an AI) ---------- */
const JOKES=["Why did the comic book go to school? To get a little more CHARACTER!","What do you call a sleeping dinosaur? A dino-SNORE!","Why did the banana go to the doctor? It wasn't PEELING well!","What do clouds wear? THUNDERWEAR!","Why can't a bicycle stand up on its own? It's TWO-TIRED!","What do you call a bear with no teeth? A GUMMY BEAR!","Why did the cookie cry? Its mom was a WAFER so long!","How do you make an octopus laugh? With TEN-TICKLES!","What did one plate say to the other? Lunch is on ME!","Why did the teddy bear skip dessert? It was STUFFED!","What do you call a fish with no eyes? A FSH!","Why was the math book sad? Too many PROBLEMS!","What has ears but can't hear? A CORNFIELD!","Why do bees have sticky hair? They use HONEYCOMBS!","What's a superhero's favorite drink? FRUIT PUNCH! KAPOW!","Why did the scarecrow win an award? He was OUTSTANDING in his field!","What do you call a dog magician? A LABRACADABRADOR!","Why are ghosts bad liars? You can see right THROUGH them!","What did the ocean say to the beach? Nothing, it just WAVED!","Why did the student eat his homework? The teacher said it was a PIECE OF CAKE!"];
const HYPE=["Kindness is the real superpower. You've got plenty!","You can do hard things. I've seen it!","Mistakes are just first drafts. Keep going!","Somebody out there is smiling because of you.","Be the hero of your own story today!","Brave doesn't mean not scared. It means trying anyway!","Your imagination is stronger than any villain."];
function guide(){const page=window.CCA_PAGE||{};const tips=page.tips||["Welcome to Comics Come Alive! Pick a comic, tap everything, and have fun."];
 const tab=document.createElement('button');tab.className='kp-tab';tab.type='button';tab.setAttribute('aria-label','Open Captain Kapow, your guide');tab.innerHTML=CCA.kapowSVG()+'<span class="kp-hi">Need a hand?</span>';
 const p=document.createElement('div');p.className='kp-panel';p.setAttribute('role','dialog');p.setAttribute('aria-label','Captain Kapow guide');
 p.innerHTML=`<button class="kp-x" type="button" aria-label="Close guide">×</button><h2>Captain Kapow</h2><div class="kp-say" aria-live="polite"></div>
 <div class="kp-row"><button type="button" data-k="tip">Give me a tip</button><button type="button" data-k="joke">Tell a joke</button><button type="button" data-k="hype">Cheer me on</button><button type="button" data-k="snd">Sound: off</button></div>
 <h2 style="font-size:22px;margin-top:14px">Where to?</h2><div class="kp-row">${(CCA.NAV||[]).map(n=>`<a href="${n[0]}">${n[1]}</a>`).join('')}</div>
 <p class="kp-note">I'm a comic character, not an AI. I only know what's on this site, and I never collect your info.</p>`;
 document.body.append(tab,p);const say=$('.kp-say',p);let ti=0,ji=Math.floor(Math.random()*JOKES.length),hi=Math.floor(Math.random()*HYPE.length),tmr;
 const type=s=>{clearInterval(tmr);if(RM){say.textContent=s;return}let i=0;say.textContent='';tmr=setInterval(()=>{i+=2;say.textContent=s.slice(0,i);if(i>=s.length)clearInterval(tmr)},18);CCA.speak&&CCA.speak(s)};
 const sndB=$('[data-k=snd]',p);const syncS=()=>{sndB.textContent='Sound: '+(SND.on?'on':'off')};document.addEventListener('cca-sound',syncS);
 const open=on=>{p.classList.toggle('on',on);tab.setAttribute('aria-expanded',on);if(on){type(tips[ti%tips.length]);ti++;SND.boing();const hiEl=$('.kp-hi',tab);if(hiEl)hiEl.remove()}};
 tab.addEventListener('click',()=>open(!p.classList.contains('on')));$('.kp-x',p).addEventListener('click',()=>open(false));
 p.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k;if(k==='tip'){type(tips[ti%tips.length]);ti++}
  if(k==='joke'){type(JOKES[ji%JOKES.length]);ji++;SND.pop()}if(k==='hype'){type(HYPE[hi%HYPE.length]);hi++;SND.win()}if(k==='snd'){CCA.sound(!SND.on);syncS()}});
 CCA.guideSay=s=>{open(true);type(s)}}

/* ---------- shared utils ---------- */
CCA.typeIn=(el,text,speed)=>{if(RM){el.textContent=text;return}const t=[...text];let i=0;el.textContent='';const iv=setInterval(()=>{i++;el.textContent=t.slice(0,i).join('');if(i>=t.length)clearInterval(iv)},speed||24);return iv};
CCA.esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));


/* ---------- forms (grown-ups only) ---------- */
CCA.form=(form)=>{const t0=Date.now();let human=false;const mark=()=>{human=true};form.addEventListener('keydown',mark);form.addEventListener('pointerdown',mark);
 const out=form.querySelector('[data-status]');const say=(m,cls)=>{if(out){out.textContent=m;out.className='fstatus '+(cls||'')}};
 form.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(form);
  if(fd.get('_honey')||Date.now()-t0<4000||!human){say('Thanks! We got it.','ok');form.reset();return}
  if(!form.checkValidity()){form.reportValidity();return}
  const d=form.dataset;const who=atob(d.a)+String.fromCharCode(64)+d.b.split('|').map(x=>atob(x)).join('');
  fd.delete('_honey');fd.append('_captcha','false');fd.append('_template','table');
  say('Sending...','');const btn=form.querySelector('[type=submit]');if(btn)btn.disabled=true;
  try{const r=await fetch('https://formsubmit.co/ajax/'+who,{method:'POST',body:fd,headers:{Accept:'application/json'}});const j=await r.json().catch(()=>({}));
   if(r.ok&&String(j.success)==='true'){say('KAPOW! Sent. We will get back to you soon.','ok');form.reset();SND.win()}
   else say('Your message was sent, but we could not confirm delivery. If you do not hear back in a day or two, call 1-800-481-8638.','warn')}
  catch(err){say('Oops, that did not go through. Please call 1-800-481-8638 or try again in a minute.','bad')}
  if(btn)btn.disabled=false})};
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('form[data-cca]').forEach(CCA.form)});

document.addEventListener('DOMContentLoaded',()=>{menu();guide();try{if(localStorage.getItem('cca-snd')==='1'){SND.on=true;document.addEventListener('pointerdown',()=>SND.init(),{once:true})}}catch(e){}
 document.dispatchEvent(new CustomEvent('cca-sound',{detail:SND.on}))});
})();
