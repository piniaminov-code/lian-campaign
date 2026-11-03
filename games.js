/* Campaign arcade: one round at a time, time-based motion and local-only records. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const names={rhythm:'בימת הקצב',catch:'מעבדת הרעיונות',balloon:'משימת ליאן'};
const ids=['rhythm','catch','balloon'];
let active=null;
function best(id,value){try{const key='lian-arcade-v2-'+id;const old=Number(localStorage.getItem(key))||0;if(value>old)localStorage.setItem(key,String(value));return Math.max(old,value||0);}catch(e){return value||0;}}
function status(id,text){$(id+'-feedback').textContent=text;}
function stopMedia(){document.querySelectorAll('audio').forEach(a=>a.pause());resetJingle();}
ids.forEach(id=>{
 const root=$(id==='rhythm'?'g1':id==='catch'?'g2':'g3');
 root.classList.add('arcade');
 const timer=$(id+'-time'),timerCell=document.createElement('span');timerCell.className='arcade-timer';timer.before(timerCell);const timerLabel=document.createElement('span');timerLabel.textContent='זמן';timerCell.append(timerLabel,timer);
 root.querySelector('h3').textContent=names[id];
 root.querySelector('.game-head>span').textContent={rhythm:'♫',catch:'✦',balloon:'○'}[id];
 root.querySelectorAll('.overlay button').forEach(b=>{if(b.textContent.includes('עוד פעם'))b.textContent='↻ עוד פעם';});
 root.querySelector('.overlay[id$="-end"] .vote').textContent='בום פצצה, ליאן למועצה!';
 const bar=document.createElement('div');bar.className='arcade-tools';
 bar.innerHTML='<span id="'+id+'-best">שיא: '+best(id,0)+'</span><button type="button" id="'+id+'-pause" disabled>השהיה</button>';
 root.querySelector('.stage').before(bar);
 const feedback=document.createElement('div');feedback.id=id+'-feedback';feedback.className='arcade-feedback';feedback.setAttribute('aria-live','polite');feedback.textContent=id==='rhythm'?'4 טורים · רצף פגיעות מגדיל את הבונוס':id==='catch'?'כל רעיון שווה מקום · זהב שווה יותר':'אוספים את ל־י־א־ן · משלימים וזוכים בבונוס';
 root.querySelector('.scorebar').after(feedback);
 const stage=root.querySelector('.stage');const pause=document.createElement('div');pause.id=id+'-paused';pause.className='overlay arcade-pause hidden';pause.innerHTML='<div class="big">רגע לנשום</div><div class="mid">הזמן עצר. ממשיכים כשמוכנים.</div><button class="btn btn-purple" type="button">▶ ממשיכים</button>';stage.append(pause);
 $(id+'-pause').onclick=()=>toggle(id);pause.querySelector('button').onclick=()=>toggle(id);
 const controls=document.createElement('div');controls.className='arcade-controls';
 if(id==='rhythm'){
  controls.innerHTML=[1,2,3,4].map((n,i)=>'<button type="button" aria-label="טור '+n+'">'+['★','♫','♥','✦'][i]+'<small>'+n+'</small></button>').join('');
  [...controls.children].forEach((b,i)=>b.onpointerdown=e=>{e.preventDefault();if(active?.id===id&&!active.paused)active.hit(i);});
 }else if(id==='catch'){
  controls.innerHTML='<button type="button" aria-label="הזזה שמאלה">◀</button><span>גררו את הסל<br>או השתמשו בחצים</span><button type="button" aria-label="הזזה ימינה">▶</button>';
  const move=(dir)=>{if(active?.id===id&&!active.paused)active.px=Math.max(28,Math.min(active.w-28,active.px+dir*active.w*.16));};
  controls.firstChild.onclick=()=>move(-1);controls.lastChild.onclick=()=>move(1);
 }
 if(id!=='balloon')stage.after(controls);
 const end=$(id+'-end');end.querySelector('.mid').id=id+'-result';
 const start=$(id+'-start');start.querySelector('.big').textContent=names[id];
 start.querySelector('.vote').textContent='בום פצצה, ליאן למועצה!';
});
$('rhythm-start').querySelector('.mid').textContent='כשהכוכב מגיע לפס: נוגעים בטור או בכפתור שמתחת. במחשב: 1–4. כל פגיעה ממשיכה את השיר.';
$('catch-start').querySelector('.mid').textContent='גוררים את סל הרעיונות. תפסו כוכבי זהב וצרו רצף. ככל שמתקדמים, הקצב עולה!';
$('balloon-start').querySelector('.mid').textContent='חפשו את האות המודגשת ואספו ל־י־א־ן לפי הסדר. כל שם מלא פותח סיבוב בונוס!';
$('g1').querySelector('.game-desc').textContent='הופעה קטנה עם השיר של ליאן. בונים רצף, קולעים לביט ומנסים לשבור שיא.';
$('g2').querySelector('.game-desc').textContent='הכיתה מלאה ברעיונות. אספו אותם בסל, תפסו זהב והתקדמו משלבים רגועים לאתגר מהיר.';
$('g3').querySelector('.game-desc').textContent='לא רק לפוצץ: צדים אותיות לפי הסדר, משלימים את השם ופותחים חגיגת בונוס.';
function toggle(id){if(!active||active.id!==id)return;active.paused=!active.paused;active.last=performance.now();$(id+'-paused').classList.toggle('hidden',!active.paused);$(id+'-pause').textContent=active.paused?'ממשיכים':'השהיה';if(active.paused)jingle.pause();}
function finish(s,interrupted=false){
 if(!s||s.done)return;s.done=true;cancelAnimationFrame(s.raf);s.cleanup?.();resetJingle();
 $(s.id+'-pause').disabled=true;$(s.id+'-paused').classList.add('hidden');
 const record=best(s.id,s.score);$(s.id+'-best').textContent='שיא: '+record;
 $(s.id+'-score-txt').textContent=s.score+' נקודות';
 $(s.id+'-result').textContent=interrupted?'הסיבוב הסתיים. אפשר לחזור מתי שרוצים.':s.score===0?'סיבוב חימום! נסו שוב, עכשיו אתם מכירים את המשחק.':s.id==='rhythm'?'הרצף הכי טוב: '+s.maxCombo+' פגיעות':s.id==='catch'?'אספתם '+s.caught+' רעיונות לכיתה!':'השלמתם את השם '+s.rounds+' פעמים!';
 $(s.id+'-end').classList.remove('hidden');
 if(!interrupted&&s.score>0&&!matchMedia('(prefers-reduced-motion: reduce)').matches)confetti($(s.id+'-conf'));
 if(active===s)active=null;
}
function begin(id){
 if(active)finish(active,true);stopMedia();
 const s={id,score:0,combo:0,maxCombo:0,caught:0,rounds:0,elapsed:0,last:performance.now(),paused:false,done:false,spawn:0,items:[],fx:[]};active=s;
 $(id+'-start').classList.add('hidden');$(id+'-end').classList.add('hidden');$(id+'-pause').disabled=false;$(id+'-pause').textContent='השהיה';
 $(id+'-score').textContent='נקודות: 0';$(id+'-time').textContent='30';return s;
}
function add(s,n,text,x,y){s.score+=n;$(s.id+'-score').textContent='נקודות: '+s.score;if(text)status(s.id,text);if(x!=null)s.fx.push({x,y,t:0,text:'+'+n});}
function run(s,frame){
 function tick(ts){if(s.done)return;const elapsed=Math.max(0,(ts-s.last)/1000),dt=Math.min(elapsed,.1);s.last=ts;
 if(!s.paused){s.elapsed+=elapsed;if(s.elapsed>=30){$(s.id+'-time').textContent='0';finish(s);return;}$(s.id+'-time').textContent=Math.ceil(30-s.elapsed);frame(dt);}
 s.raf=requestAnimationFrame(tick);
 }s.raf=requestAnimationFrame(tick);
}
function background(s){const {ctx:c,w,h}=s;const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#171b38');g.addColorStop(1,'#302449');c.fillStyle=g;c.fillRect(0,0,w,h);
 c.fillStyle='rgba(255,255,255,.16)';for(let i=0;i<20;i++){c.beginPath();c.arc((i*79+19)%w,(i*61+20)%(h-70),i%3===0?2:1,0,Math.PI*2);c.fill();}
 c.font='600 12px Heebo, sans-serif';c.textAlign='left';c.fillStyle='#c5bfe3';c.fillText('שלב '+(1+Math.floor(s.elapsed/10)),14,25);
}
function effects(s,dt){s.fx=s.fx.filter(f=>f.t<.65);s.fx.forEach(f=>{f.t+=dt;s.ctx.globalAlpha=1-f.t/.65;s.ctx.fillStyle='#fde68a';s.ctx.font='bold 23px Heebo';s.ctx.textAlign='center';s.ctx.direction='ltr';s.ctx.fillText(f.text,f.x,f.y-f.t*55);s.ctx.direction='inherit';});s.ctx.globalAlpha=1;}
window.startRhythm=function(){
 const s=begin('rhythm');Object.assign(s,fitCanvas($('rhythm')));const {ctx:c,w,h}=s;const lw=w/4,target=h-66;let flashes=[0,0,0,0];
 s.hit=lane=>{flashes[lane]=.16;let nearest=null;for(const n of s.items)if(n.lane===lane&&(!nearest||Math.abs(n.y-target)<Math.abs(nearest.y-target)))nearest=n;
 if(nearest&&Math.abs(nearest.y-target)<40){const perfect=Math.abs(nearest.y-target)<18;s.items=s.items.filter(n=>n!==nearest);s.combo++;s.maxCombo=Math.max(s.maxCombo,s.combo);add(s,(perfect?20:10)+Math.min(s.combo,10),perfect?'בדיוק בביט! רצף '+s.combo:'יפה! רצף '+s.combo,lane*lw+lw/2,target);playJingleSlice();}else{s.combo=0;status('rhythm','עוד רגע... חכו לכוכב על הפס');}};
 const cv=$('rhythm');cv.onpointerdown=e=>{if(s.done||s.paused)return;e.preventDefault();const r=cv.getBoundingClientRect();s.hit(Math.max(0,Math.min(3,Math.floor((e.clientX-r.left)/r.width*4))));};s.cleanup=()=>{cv.onpointerdown=null;};
 run(s,dt=>{background(s);s.spawn-=dt;if(s.spawn<=0){s.spawn=.76-s.elapsed*.009;s.items.push({lane:Math.floor(Math.random()*4),y:-25});}
 for(let i=0;i<4;i++){flashes[i]=Math.max(0,flashes[i]-dt);c.fillStyle=flashes[i]>0?'rgba(167,139,250,.28)':i%2?'rgba(255,255,255,.025)':'rgba(255,255,255,.055)';c.fillRect(i*lw,36,lw-1,h-36);}
 c.fillStyle='rgba(45,212,191,.13)';c.fillRect(0,target-25,w,50);c.strokeStyle='#5eead4';c.lineWidth=2;c.beginPath();c.moveTo(0,target);c.lineTo(w,target);c.stroke();
 s.items=s.items.filter(n=>{n.y+=dt*(150+s.elapsed*2.5);if(n.y>target+48){s.combo=0;status('rhythm','פספוס קטן, בונים רצף חדש');return false;}return true;});
 s.items.forEach(n=>{c.fillStyle=['#c4b5fd','#5eead4','#f9a8d4','#fde68a'][n.lane];c.shadowColor=c.fillStyle;c.shadowBlur=14;c.font='32px sans-serif';c.textAlign='center';c.fillText('★',n.lane*lw+lw/2,n.y+11);c.shadowBlur=0;});effects(s,dt);
 });
};
window.startCatch=function(){
 const s=begin('catch');Object.assign(s,fitCanvas($('catch')));const {ctx:c,w,h}=s;s.px=w/2;const py=h-48;
 const cv=$('catch');const move=e=>{if(s.done||s.paused)return;const r=cv.getBoundingClientRect();s.px=Math.max(28,Math.min(w-28,(e.clientX-r.left)/r.width*w));};cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);move(e);};cv.onpointermove=move;s.cleanup=()=>{cv.onpointerdown=null;cv.onpointermove=null;};
 run(s,dt=>{background(s);s.spawn-=dt;if(s.spawn<=0){s.spawn=.64-s.elapsed*.008;s.items.push({x:25+Math.random()*(w-50),y:-20,gold:Math.random()<.18});}
 s.items=s.items.filter(n=>{n.y+=dt*(110+s.elapsed*4);if(n.y>py-22&&n.y<py+20&&Math.abs(n.x-s.px)<36){s.caught++;s.combo++;s.maxCombo=Math.max(s.maxCombo,s.combo);add(s,n.gold?30:10+Math.min(s.combo,10),n.gold?'רעיון זהב! +30':'רעיון נוסף בסל! רצף '+s.combo,n.x,n.y);return false;}if(n.y>h+25){s.combo=0;return false;}return true;});
 s.items.forEach(n=>{c.textAlign='center';c.font=n.gold?'31px sans-serif':'27px sans-serif';if(n.gold){c.fillStyle='#fde68a';c.fillText('★',n.x,n.y);}else{c.fillStyle='#c4b5fd';c.beginPath();c.arc(n.x,n.y-8,10,0,Math.PI*2);c.fill();c.fillStyle='#8b7ab4';c.fillRect(n.x-5,n.y+2,10,7);}});
 c.fillStyle='#5eead4';c.beginPath();c.moveTo(s.px-30,py-6);c.lineTo(s.px+30,py-6);c.lineTo(s.px+23,py+20);c.lineTo(s.px-23,py+20);c.closePath();c.fill();c.strokeStyle='#a7f3d0';c.lineWidth=3;c.beginPath();c.arc(s.px,py-6,20,Math.PI,0);c.stroke();c.fillStyle='#132f40';c.textAlign='center';c.font='bold 13px Heebo';c.fillText('רעיונות',s.px,py+12);effects(s,dt);
 });
};
window.startBalloons=function(){
 const s=begin('balloon'),zone=$('balloon-zone'),letters=['ל','י','א','ן'];let step=0,nextLetter=0;s.w=zone.clientWidth;s.h=zone.clientHeight;
 zone.querySelectorAll('.balloon').forEach(b=>b.remove());
 const show=()=>$('letters-box').innerHTML=letters.map((l,i)=>'<span class="'+(i<step?'letter-done':i===step?'letter-next':'')+'">'+l+'</span>').join('')+'<small>סיבוב '+(s.rounds+1)+'</small>';show();
 function spawn(){const letter=nextLetter++%3===0;const b=document.createElement('button');b.type='button';b.className='balloon';const char=letter?letters[step]:'';b.textContent=char||'✦';b.setAttribute('aria-label',char?'בלון האות '+char:'בלון בונוס');const item={el:b,y:s.h+20,x:12+Math.random()*(s.w-78),speed:65+s.elapsed*2+Math.random()*18,letter:char};b.style.left=item.x+'px';b.style.background=['#7c6fd3','#d66c9f','#319f9c'][nextLetter%3];b.style.bottom='auto';
 b.onpointerdown=e=>{e.preventDefault();if(s.paused||s.done||!s.items.includes(item))return;let pts=5;if(char===letters[step]){step++;pts=30;if(step===4){s.rounds++;step=0;pts+=75;status('balloon','ליאן! שם מלא, בונוס +75!');}else status('balloon','מצוין! עכשיו מחפשים '+letters[step]);}else status('balloon',char?'עכשיו מחפשים את האות '+letters[step]:'פיצוץ! +5');add(s,pts);s.items=s.items.filter(n=>n!==item);b.remove();show();};
 zone.append(b);s.items.push(item);}
 s.cleanup=()=>zone.querySelectorAll('.balloon').forEach(b=>b.remove());
 run(s,dt=>{s.spawn-=dt;if(s.spawn<=0){s.spawn=.7-s.elapsed*.006;spawn();}s.items=s.items.filter(n=>{n.y-=dt*n.speed;n.el.style.top=n.y+'px';if(n.y< -90){n.el.remove();return false;}return true;});});
};
document.addEventListener('keydown',e=>{if(!active||active.paused||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(active.id==='rhythm'&&/^[1-4]$/.test(e.key)){e.preventDefault();active.hit(Number(e.key)-1);}if(active.id==='catch'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();active.px=Math.max(28,Math.min(active.w-28,active.px+(e.key==='ArrowLeft'?-24:24)));}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!active.paused)toggle(active.id);});
document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>{if(active&&!active.paused)toggle(active.id);}));
window.addEventListener('resize',()=>{if(active)finish(active,true);});
})();
