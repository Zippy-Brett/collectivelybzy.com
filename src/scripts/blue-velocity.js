const canvas = document.querySelector('#ocean-canvas');
const game = document.querySelector('#blue-game');
if (canvas && game) {
  const ctx = canvas.getContext('2d');
  const ui = Object.fromEntries(['distance', 'score', 'speed', 'run-seed', 'best-distance', 'game-message', 'start-run', 'toast', 'jump-fill', 'hits'].map((id) => [id, document.getElementById(id)]));
  const rand = (min, max) => min + Math.random() * (max - min);
  let width = 1, height = 1, dpr = 1, last = 0, raf = 0, toastUntil = 0;
  let state = 'ready', run = 0, distance = 0, score = 0, speed = 28, playerX = 0, lean = 0, jump = 0, jumpTime = 0, trick = 0, invuln = 0, hull = 0;
  let held = new Set(), things = [], particles = [], best = Number(localStorage.getItem('blueVelocityBest') || 0), cameraShake = 0;
  ui['best-distance'].textContent = `${best} M`;

  function resize() {
    const r = canvas.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); width = Math.max(1, r.width); height = Math.max(1, r.height);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(canvas); resize();
  const project = (x, y, z) => {
    const focal = Math.min(width, height) * .9, scale = focal / (z + 5);
    return { x: width * .5 + (x - playerX * .55) * scale, y: height * .46 + (0.2 - y) * scale, s: scale };
  };
  function path(points, color, stroke, line = 1) {
    ctx.beginPath(); points.forEach((p, i) => { const q = project(p[0], p[1], p[2]); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
    if (color) { ctx.fillStyle = color; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.stroke(); }
  }
  function newRun() {
    run++; distance = 0; score = 0; speed = 28; playerX = 0; lean = 0; jump = 0; jumpTime = 0; trick = 0; invuln = 1.4; hull = 0; ui.hits.querySelectorAll('i').forEach(i => i.classList.remove('lost')); things = []; particles = [];
    ui['run-seed'].textContent = String(Math.floor(Math.random() * 9000) + 1000); state = 'running'; ui['game-message'].classList.add('hidden'); last = performance.now();
    for (let z = 30; z < 245; z += rand(15, 26)) spawn(z);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function spawn(z) {
    const lane = () => rand(-5.1, 5.1), type = Math.random();
    let kind = type < .28 ? 'wreck' : type < .52 ? 'coral' : type < .7 ? 'net' : type < .86 ? 'ring' : Math.random() < .5 ? 'boost' : 'down';
    things.push({ kind, x: lane(), z, y: 0, wobble: rand(0, 6), hit: false, color: Math.random() });
  }
  function toast(message) { ui.toast.textContent = message; ui.toast.classList.add('show'); toastUntil = performance.now() + 1250; }
  function addScore(n) { score += n; }
  function update(dt) {
    if (state !== 'running') return;
    const steer = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0);
    const boosting = held.has('boost') && speed > 14, braking = held.has('brake');
    speed += (boosting ? 20 : braking ? -25 : 3.6) * dt; speed = Math.max(12, Math.min(61, speed));
    playerX = Math.max(-7, Math.min(7, playerX + steer * dt * (3.7 + speed * .045))); lean += (steer * .29 - lean) * Math.min(1, dt * 6);
    distance += speed * dt * .12; addScore(speed * dt * .35);
    if (jumpTime > 0) { jumpTime -= dt; jump = Math.sin((1 - jumpTime / .95) * Math.PI) * 5.5; if (jumpTime <= 0) { jump = 0; if (trick) { addScore(250 + trick * 150); toast(trick >= 2 ? 'DOUBLE BARREL · +550' : 'CLEAN FLIP · +400'); } trick = 0; } }
    if (boosting) particles.push({ x: playerX + rand(-.35,.35), y: -jump - .5, z: rand(2, 5), life: .5, max: .5 });
    for (const p of particles) p.life -= dt;
    particles = particles.filter(p => p.life > 0);
    for (const t of things) {
      t.z -= speed * dt * .78;
      if (t.hit) continue;
      const near = t.z < 7.7 && t.z > 1.5 && Math.abs(t.x - playerX) < (t.kind === 'ring' ? 1.2 : 1.25);
      if (t.kind === 'ring' && t.z < 6 && t.z > 1.5) { if (Math.abs(t.x-playerX)<.95 && jump>1.4) { t.hit=true; addScore(650); toast('RING THREAD · +650'); } }
      else if (near && t.kind === 'boost') { t.hit=true; speed=Math.min(64,speed+16); addScore(180); toast('CURRENT SURGE · +180'); }
      else if (near && t.kind === 'down') { t.hit=true; speed=Math.max(13,speed-13); cameraShake=.3; toast(Math.random()<.5?'COLD POCKET · SLOWDOWN':'SILT CLOUD · BLIND SPOT'); }
      else if (near && ['wreck','coral','net'].includes(t.kind) && jump < 2.7 && invuln <= 0) {
        t.hit=true; speed=Math.max(14,speed*.53); invuln=1.15; cameraShake=.48; hull++; ui.hits.children[hull-1]?.classList.add('lost');
        if (t.kind === 'net') toast('GHOST NET · TANGLED'); else if(t.kind==='coral') toast('REEF KISS · WATCH THE FIN'); else toast('WRECKED CURRENT · RECOVER');
        if (hull >= 3) { finish(); return; }
      }
      if (t.z < 2 && !t.hit) { t.hit=true; if(t.kind==='ring') { addScore(30); } }
    }
    things = things.filter(t => t.z > -2);
    while (things.length < 15) spawn(rand(155, 255));
    invuln=Math.max(0,invuln-dt);cameraShake=Math.max(0,cameraShake-dt);
    ui.distance.textContent = Math.floor(distance).toLocaleString(); ui.score.textContent = String(Math.floor(score)).padStart(6,'0'); ui.speed.textContent = Math.floor(speed * 2.35); ui['jump-fill'].style.width = `${Math.max(0,100-jumpTime/0.95*100)}%`;
    if (performance.now() > toastUntil) ui.toast.classList.remove('show');
  }
  function drawBackground(time) {
    const g = ctx.createLinearGradient(0,0,0,height); g.addColorStop(0,'#65c3c5');g.addColorStop(.22,'#278a9d');g.addColorStop(.53,'#075372');g.addColorStop(1,'#031e3a');ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
    const horizon=height*.46;
    const sun=ctx.createRadialGradient(width*.72,horizon*.75,1,width*.72,horizon*.75,width*.45);sun.addColorStop(0,'#d8ffd477');sun.addColorStop(.2,'#b7fff033');sun.addColorStop(1,'#b7fff000');ctx.fillStyle=sun;ctx.fillRect(0,0,width,height*.7);
    ctx.fillStyle='#b1efcf';ctx.globalAlpha=.72;ctx.beginPath();ctx.ellipse(width*.72,horizon*.65,Math.min(width,height)*.055,Math.min(width,height)*.055,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    // Sun shafts converge toward the surface and drift with the swell.
    ctx.save();ctx.globalAlpha=.09;for(let i=0;i<8;i++){const x=width*(.16+i*.12)+Math.sin(time*.00035+i)*18;ctx.fillStyle=i%2?'#c9ffe7':'#ecffce';ctx.beginPath();ctx.moveTo(x-4,horizon*.12);ctx.lineTo(x+4,horizon*.12);ctx.lineTo(x+width*.12,horizon+40);ctx.lineTo(x-width*.12,horizon+40);ctx.fill();}ctx.restore();
    // Broken glints along the breathing surface.
    ctx.save();ctx.globalAlpha=.32;ctx.strokeStyle='#c4fff0';for(let i=0;i<21;i++){const x=((i*139+time*.035)% (width+60))-30,y=horizon+Math.sin(time*.001+i)*4+i%4*2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand(6,25),y);ctx.stroke();}ctx.restore();
    // Deep-sea floor tracks sell speed and perspective.
    ctx.save();ctx.strokeStyle='#7cddcf';ctx.globalAlpha=.095;for(let i=-10;i<=10;i++){const q=project(i*3,-5,0);ctx.beginPath();ctx.moveTo(width*.5+(i*width*.09),horizon);ctx.lineTo(q.x,height);ctx.stroke();}for(let j=1;j<9;j++){const z=((j*19-distance*.9)%155)+4;const a=project(-40,-5,z),b=project(40,-5,z);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}ctx.restore();
    // Floating marine snow.
    ctx.fillStyle='#d3fff0';for(let i=0;i<38;i++){const x=((i*157+time*.018*(i%3+1))%(width+30))-15,y=(i*91+Math.sin(time*.0004+i)*12)%(height*.92);ctx.globalAlpha=.1+(i%5)*.045;ctx.fillRect(x,y,i%7===0?2:1,i%7===0?2:1);}ctx.globalAlpha=1;
  }
  function drawWreck(t) {
    const z=t.z,x=t.x, rust='#675344', edge='#b38961';
    path([[x-3.2,.2,z],[x-2.5,1.15,z],[x+2.3,1.15,z],[x+3.1,.2,z],[x+2.2,-.28,z],[x-2.3,-.28,z]],'#354955',edge,Math.max(1,project(x,0,z).s*.025));
    path([[x-2.4,1.15,z],[x-2.3,2.3,z],[x+1.8,2.3,z],[x+2.3,1.15,z]],'#725c49','#b38a64');
    path([[x-2.3,2.3,z],[x-1.2,2.8,z],[x+1.8,2.3,z],[x-2.3,2.3,z]],null,'#c5a77c',2);
    for(const d of [-1.4,0,1.3])path([[x+d,.2,z-.02],[x+d,1.1,z-.02]],null,'#d2ac77',Math.max(1,project(x,0,z).s*.035));
    const p=project(x,2.9,z);ctx.fillStyle='#d8c19c';ctx.font=`${Math.max(7,p.s*.3)}px monospace`;ctx.fillText('✳',p.x,p.y);
  }
  function drawCoral(t,time) {
    const z=t.z,x=t.x,s=project(x,0,z).s, colors=['#ff826e','#f5c271','#cc8dc2','#9ad27f'];ctx.save();ctx.lineCap='round';
    for(let i=0;i<5;i++){const bx=x+(i-2)*.47,h=rand(1.1,2.6);const a=project(bx,-.35,z),b=project(bx+Math.sin(time*.001+i)*.2,h,z);ctx.strokeStyle=colors[(i+Math.floor(t.color*4))%4];ctx.lineWidth=Math.max(2,s*.11);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x+Math.sin(i*4)*s*.17,b.y-s*.28);ctx.stroke();ctx.beginPath();ctx.arc(b.x,b.y,s*.095,0,Math.PI*2);ctx.fillStyle=ctx.strokeStyle;ctx.fill();}
    const base=project(x,-.1,z);ctx.fillStyle='#88745e';ctx.beginPath();ctx.ellipse(base.x,base.y,s*.7,s*.17,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawNet(t,time) {
    const x=t.x,z=t.z,p1=project(x-1.8,.1,z),p2=project(x+1.8,.1,z),p3=project(x+1.8,3.2,z),p4=project(x-1.8,3.2,z);ctx.strokeStyle='#cfb76b';ctx.lineWidth=Math.max(1,project(x,0,z).s*.025);ctx.fillStyle='#826c4355';ctx.beginPath();[p1,p2,p3,p4].forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#d6c98777';for(let i=1;i<7;i++){const q=i/7;ctx.beginPath();ctx.moveTo(p1.x+(p2.x-p1.x)*q,p1.y);ctx.lineTo(p4.x+(p3.x-p4.x)*q,p4.y);ctx.stroke();}for(let i=1;i<7;i++){const q=i/7;ctx.beginPath();ctx.moveTo(p1.x,p1.y+(p4.y-p1.y)*q);ctx.lineTo(p2.x,p2.y+(p3.y-p2.y)*q);ctx.stroke();}
  }
  function drawRing(t) {
    const p=project(t.x,1.8,t.z),r=p.s*1.38;ctx.save();ctx.strokeStyle='#d8fb78';ctx.lineWidth=Math.max(2,p.s*.13);ctx.shadowColor='#c8ff8a';ctx.shadowBlur=Math.max(4,p.s*.2);ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*1.12,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#f0ffe5';ctx.lineWidth=Math.max(1,p.s*.025);ctx.beginPath();ctx.ellipse(p.x,p.y,r*.84,r*.94,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  function drawPower(t,time) {
    const p=project(t.x,1.7+Math.sin(time*.004+t.wobble)*.2,t.z),s=p.s*.38;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(time*.001+t.wobble);ctx.fillStyle=t.kind==='boost'?'#d8fb78':'#ff887b';ctx.strokeStyle='#efffdf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*.82,0);ctx.lineTo(0,s);ctx.lineTo(-s*.82,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#173841';ctx.font=`bold ${Math.max(9,s*.9)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.kind==='boost'?'↗':'!',0,0);ctx.restore();
  }
  function drawWorld(time) {
    for(const t of [...things].sort((a,b)=>b.z-a.z)){if(t.hit)continue;switch(t.kind){case'wreck':drawWreck(t);break;case'coral':drawCoral(t,time);break;case'net':drawNet(t,time);break;case'ring':drawRing(t);break;default:drawPower(t,time)}}
    for(const p of particles){const q=project(p.x,p.y,p.z);ctx.globalAlpha=p.life/p.max;ctx.fillStyle='#e9ffd4';ctx.beginPath();ctx.arc(q.x,q.y,Math.max(1,q.s*.06),0,7);ctx.fill();}ctx.globalAlpha=1;
  }
  function drawDolphin(time) {
    const cx=width*.5-lean*18,cy=height*.77-jump*Math.min(height*.04,22),scale=Math.min(width,height)*.115;ctx.save();ctx.translate(cx,cy);ctx.rotate(-lean*.22);ctx.scale(scale,scale);
    // A sculpted, three-quarter dolphin silhouette with a moonlit back and pale belly.
    const flick=Math.sin(time*.014)*.18;
    ctx.shadowColor='#00111e88';ctx.shadowBlur=30;ctx.shadowOffsetY=16;
    ctx.fillStyle='#071e2b';ctx.beginPath();ctx.moveTo(-.55,.1);ctx.quadraticCurveTo(-1.02,-.13,-1.02,-.52);ctx.lineTo(-.64,-.34);ctx.quadraticCurveTo(-.75,-.93,-.2,-1.14);ctx.quadraticCurveTo(.37,-1.3,.72,-1.02);ctx.quadraticCurveTo(1.03,-.79,1.07,-.46);ctx.lineTo(1.58,-.18);ctx.quadraticCurveTo(1.67,-.09,1.5,-.07);ctx.lineTo(1.03,-.15);ctx.quadraticCurveTo(.85,.12,.44,.21);ctx.lineTo(.07,.28);ctx.lineTo(-.25,.87+flick);ctx.quadraticCurveTo(-.32,.99,-.44,.85);ctx.lineTo(-.56,.29);ctx.quadraticCurveTo(-.95,.41,-1.18,.2);ctx.quadraticCurveTo(-.9,.04,-.55,.1);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.fillStyle='#1c6575';ctx.beginPath();ctx.moveTo(-.4,-.86);ctx.quadraticCurveTo(.14,-1.28,.67,-.99);ctx.quadraticCurveTo(.92,-.77,.98,-.52);ctx.quadraticCurveTo(.45,-.65,-.02,-.56);ctx.quadraticCurveTo(-.27,-.51,-.58,-.26);ctx.quadraticCurveTo(-.76,-.55,-.4,-.86);ctx.fill();
    ctx.fillStyle='#d5ebe0';ctx.beginPath();ctx.moveTo(-.45,.12);ctx.quadraticCurveTo(-.02,.04,.31,-.05);ctx.quadraticCurveTo(.68,-.14,1.03,-.21);ctx.quadraticCurveTo(.77,.22,.28,.27);ctx.lineTo(-.15,.53);ctx.lineTo(-.4,.29);ctx.closePath();ctx.fill();
    ctx.fillStyle='#0b3442';ctx.beginPath();ctx.moveTo(.12,-.59);ctx.quadraticCurveTo(.26,-1.12,.54,-1.35);ctx.quadraticCurveTo(.63,-1.4,.6,-1.29);ctx.lineTo(.4,-.55);ctx.fill();
    ctx.fillStyle='#071f2d';ctx.beginPath();ctx.moveTo(.28,.05);ctx.quadraticCurveTo(.65,.04,.74,.45);ctx.quadraticCurveTo(.69,.57,.58,.49);ctx.lineTo(.1,.23);ctx.fill();
    ctx.fillStyle='#e9fff0';ctx.beginPath();ctx.arc(.76,-.66,.055,0,7);ctx.fill();ctx.fillStyle='#061921';ctx.beginPath();ctx.arc(.78,-.66,.025,0,7);ctx.fill();
    ctx.fillStyle='#527e82';ctx.beginPath();ctx.arc(1.06,-.23,.018,0,7);ctx.arc(1.11,-.21,.018,0,7);ctx.fill();ctx.restore();
  }
  function render(time) {
    ctx.save();if(cameraShake){ctx.translate(rand(-1,1)*cameraShake*15,rand(-1,1)*cameraShake*12);}drawBackground(time);drawWorld(time);drawDolphin(time);ctx.restore();
    if(jump>2){ctx.save();ctx.globalAlpha=Math.min(.18,jump*.025);ctx.fillStyle='#e8ffe4';ctx.fillRect(0,0,width,height*.46);ctx.restore();}
  }
  function frame(time) {const dt=Math.min(.05,Math.max(0,(time-last)/1000));last=time;update(dt);render(time);if(state==='running')raf=requestAnimationFrame(frame);}
  function leap() {if(state==='running'&&jumpTime<=.05){jumpTime=.95;jump=0;trick=0;}else if(state==='running'&&jumpTime>.05){trick=Math.min(2,trick+1);}}
  const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'boost',KeyW:'boost',ArrowDown:'brake',KeyS:'brake'};
  window.addEventListener('keydown',e=>{if(keys[e.code]){held.add(keys[e.code]);e.preventDefault();}if(e.code==='Space'){e.preventDefault();if(!e.repeat)leap();}if(e.code==='Enter'&&state!=='running')newRun();});
  window.addEventListener('keyup',e=>{if(keys[e.code])held.delete(keys[e.code]);});
  window.addEventListener('blur',()=>held.clear());
  game.querySelectorAll('[data-hold]').forEach(button=>{const key=button.dataset.hold;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);held.add(key);button.classList.add('active');});const release=()=>{held.delete(key);button.classList.remove('active');};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);});
  ui['start-run'].addEventListener('click',newRun);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){held.clear();last=performance.now();}});
  function finish() {state='over';if(distance>best){best=Math.floor(distance);localStorage.setItem('blueVelocityBest',String(best));ui['best-distance'].textContent=`${best} M`;}ui['game-message'].innerHTML=`<div class="message-stamp">CURRENT COMPLETE · RUN ${ui['run-seed'].textContent}</div><h2>${Math.floor(distance)}<br />metres.</h2><p>You scored ${Math.floor(score).toLocaleString()} points in the open blue.</p><button class="launch" id="start-run">SWIM AGAIN <span>↗</span></button><div class="best-line">PERSONAL BEST <b>${best} M</b></div>`;ui['game-message'].classList.remove('hidden');ui['start-run']=document.getElementById('start-run');ui['start-run'].addEventListener('click',newRun);}
  // Keep this dream endless: a soft reef wash at the margins nudges you back toward open water.
  function boundaryCheck(){if(state==='running'&&Math.abs(playerX)>6.85){playerX=Math.sign(playerX)*6.85;speed=Math.max(16,speed-6);toast('THE BLUE HAS EDGES');}}
  const gameFrame=frame;frame=function(time){boundaryCheck();gameFrame(time);};
  state='ready';render(performance.now());
}
