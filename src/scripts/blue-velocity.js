const canvas = document.querySelector('#ocean-canvas');
const game = document.querySelector('#blue-game');

if (canvas && game) {
  const ctx = canvas.getContext('2d');
  const ids = ['distance', 'score', 'speed', 'run-seed', 'best-distance', 'game-message', 'start-run', 'toast', 'run-status', 'tangle-flash'];
  const ui = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  const dolphin = new Image();
  dolphin.src = '/images/blue-velocity-dolphin.png';
  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const courseCenter = (distance) => 1.3 * Math.sin(distance * 0.018) + 0.7 * Math.sin(distance * 0.043);
  const courseHalfWidth = 9.5;
  let width = 1, height = 1, dpr = 1, scale = 20, last = 0, raf = 0, toastUntil = 0;
  let state = 'ready', run = 0, distance = 0, score = 0, speed = 5.4;
  let playerX = 0, jumpTime = 0, whipTime = 0, whipCooldown = 0, cameraX = 0, cameraY = 0;
  let things = [], bubbles = [], held = new Set(), pad = { turn: 0, boost: false, brake: false }, padJump = false, padWhip = false;
  let seed = 0, nextSpawnDistance = 18, whipButton;
  let best = Number(localStorage.getItem('blueVelocityBest') || 0);
  ui['best-distance'].textContent = `${best} M`;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.max(12, Math.min(width / 21, height / 22));
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const screen = (x, y) => ({ x: width * 0.5 + (x - cameraX) * scale, y: height * 0.69 - (y - cameraY) * scale });

  function newRun() {
    run += 1; seed = Math.floor(Math.random() * 899999) + 100000;
    distance = 0; score = 0; speed = 5.4; playerX = courseCenter(0); jumpTime = 0; whipTime = 0; whipCooldown = 0;
    cameraX = playerX; cameraY = 0; things = []; bubbles = []; nextSpawnDistance = 18;
    ui['run-seed'].textContent = String(seed); ui.distance.textContent = '0'; ui.score.textContent = '000000';
    ui['run-status'].textContent = 'JUMP READY';
    state = 'running'; ui['game-message'].classList.add('hidden'); ui['tangle-flash'].classList.remove('show');
    held.clear(); last = performance.now();
    while (nextSpawnDistance < 115) {
      spawnEncounter(nextSpawnDistance);
      nextSpawnDistance += rand(20, 27);
    }
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }

  function spawnEncounter(atDistance) {
    const roll = Math.random();
    const kind = roll < 0.59 ? 'hoop' : roll < 0.82 ? 'net' : 'rope';
    const x = courseCenter(atDistance) + rand(-5.8, 5.8);
    things.push({ kind, x, distance: atDistance, hit: false, passed: false, angle: rand(-0.28, 0.28), w: rand(3.1, 4.4), h: rand(2.3, 3.2), length: rand(4.2, 6.1), seed: Math.random() * 10 });
  }

  function showToast(message) {
    ui.toast.textContent = message; ui.toast.classList.add('show'); toastUntil = performance.now() + 1250;
  }

  function update(dt) {
    if (state !== 'running') return;
    dt = Math.min(dt, 0.04);
    const turn = clamp((held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0) + pad.turn, -1, 1);
    const boosting = held.has('boost') || pad.boost;
    const braking = held.has('brake') || pad.brake;
    const targetSpeed = boosting ? 8.1 : braking ? 3.3 : 5.6;
    speed += (targetSpeed - speed) * Math.min(1, dt * 3.2);
    whipCooldown = Math.max(0, whipCooldown - dt);
    whipTime = Math.max(0, whipTime - dt);
    for (const thing of things) if (thing.whipped) thing.flyTime += dt;

    const previousDistance = distance;
    distance += speed * dt;
    playerX += turn * 7.4 * dt;
    playerX = clamp(playerX, courseCenter(distance) - courseHalfWidth + 0.8, courseCenter(distance) + courseHalfWidth - 0.8);
    if (jumpTime > 0) jumpTime = Math.max(0, jumpTime - dt);
    cameraX += (playerX - cameraX) * Math.min(1, dt * 1.45);
    cameraY += (distance - cameraY) * Math.min(1, dt * 5.5);
    score += dt * speed * 1.4;

    while (nextSpawnDistance < distance + 100) {
      spawnEncounter(nextSpawnDistance);
      nextSpawnDistance += rand(20, 27);
    }

    for (const thing of things) {
      if (thing.hit) continue;
      const forwardGap = thing.distance - distance;
      const sideGap = playerX - thing.x;
      if (thing.kind === 'net' && Math.abs(forwardGap) < thing.h * 0.5 + 0.65 && Math.abs(sideGap) < thing.w * 0.5 + 0.5) {
        finish('TANGLED IN A FISHING NET'); return;
      }
      if (thing.kind === 'rope' && !thing.whipped && Math.abs(forwardGap) < thing.length * 0.5 + 0.6) {
        const halfX = Math.cos(thing.angle) * thing.length * 0.5;
        const halfY = Math.sin(thing.angle) * thing.length * 0.5;
        if (pointSegmentDistance(playerX, distance, thing.x - halfX, thing.distance - halfY, thing.x + halfX, thing.distance + halfY) < 0.7) {
          finish('TANGLED IN A LOOSE ROPE'); return;
        }
      }
      if (thing.kind === 'hoop' && !thing.passed && forwardGap <= 0) {
        thing.passed = true;
        if (Math.abs(forwardGap) < 1.2 && Math.abs(sideGap) < 1.55 && jumpTime > 0) {
          thing.hit = true; score += 500; showToast('CLEAN HOOP JUMP · +500');
        } else {
          thing.hit = true; showToast('MISSED HOOP · LINE UP AND JUMP');
        }
      }
    }
    things = things.filter((thing) => thing.distance > distance - 12 && !thing.hit && !(thing.whipped && thing.flyTime > 0.8));
    for (let i = 0; i < 2; i++) bubbles.push({ x: playerX + rand(-0.3, 0.3), distance: distance - rand(0.5, 1.5), life: 0.5 + Math.random() * 0.5 });
    for (const bubble of bubbles) bubble.life -= dt;
    bubbles = bubbles.filter((bubble) => bubble.life > 0);

    if (distance > best) {
      best = Math.floor(distance); localStorage.setItem('blueVelocityBest', String(best)); ui['best-distance'].textContent = `${best} M`;
    }
    ui.distance.textContent = Math.floor(distance).toLocaleString();
    ui.score.textContent = String(Math.max(0, Math.floor(score))).padStart(6, '0');
    ui.speed.textContent = String(Math.round(speed * 3.6));
    ui['run-status'].textContent = whipCooldown > 0 ? `WHIP ${whipCooldown.toFixed(1)} S` : jumpTime > 0 ? 'AIRBORNE' : 'JUMP READY';
    if (whipButton) {
      whipButton.textContent = whipCooldown > 0 ? `TAIL WHIP · ${whipCooldown.toFixed(1)} S` : '↝ TAIL WHIP';
      whipButton.classList.toggle('cooling', whipCooldown > 0);
    }
    if (performance.now() > toastUntil) ui.toast.classList.remove('show');
    if (distance < previousDistance) distance = previousDistance;
  }

  function jump() {
    if (state !== 'running' || jumpTime > 0) return;
    jumpTime = 1.05;
  }

  function tailWhip() {
    if (state !== 'running') return;
    if (whipCooldown > 0) { showToast(`TAIL WHIP RECHARGING · ${whipCooldown.toFixed(1)} S`); return; }
    whipCooldown = 4.5; whipTime = 0.52;
    let target = null, nearest = Infinity;
    for (const thing of things) {
      if (thing.kind !== 'rope' || thing.hit || thing.whipped) continue;
      const halfX = Math.cos(thing.angle) * thing.length * 0.5;
      const halfY = Math.sin(thing.angle) * thing.length * 0.5;
      const gap = pointSegmentDistance(playerX, distance, thing.x - halfX, thing.distance - halfY, thing.x + halfX, thing.distance + halfY);
      if (gap < 3.8 && gap < nearest) { target = thing; nearest = gap; }
    }
    if (target) {
      target.whipped = true; target.flyTime = 0;
      target.flyDx = Math.sign(target.x - playerX) || (Math.random() < 0.5 ? -1 : 1);
      target.flyDx *= 4.5; target.flyDy = rand(-0.7, 1.7);
      score += 175; showToast('TAIL WHIP · ROPE KNOCKED CLEAR +175');
    } else {
      showToast('TAIL WHIP · NO ROPE IN REACH');
    }
  }

  function pointSegmentDistance(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, lengthSq = dx * dx + dy * dy;
    const amount = lengthSq ? clamp(((px - ax) * dx + (py - ay) * dy) / lengthSq, 0, 1) : 0;
    return Math.hypot(px - (ax + amount * dx), py - (ay + amount * dy));
  }

  function drawBackground(time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#39a5aa'); gradient.addColorStop(0.38, '#08728b'); gradient.addColorStop(1, '#032f50');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const x = ((i * 149 + time * (0.012 + (i % 3) * 0.006)) % (width + 100)) - 50;
      const y = (i * 71 + Math.sin(time * 0.00035 + i) * 14) % height;
      ctx.globalAlpha = 0.08 + (i % 5) * 0.018; ctx.strokeStyle = '#d9fff0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, y, 24 + i % 4 * 7, 3, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    const from = cameraY - 35, to = cameraY + 85;
    ctx.beginPath();
    for (let y = from; y <= to; y += 1.5) { const p = screen(courseCenter(y) - courseHalfWidth, y); ctx.lineTo(p.x, p.y); }
    for (let y = to; y >= from; y -= 1.5) { const p = screen(courseCenter(y) + courseHalfWidth, y); ctx.lineTo(p.x, p.y); }
    ctx.closePath(); ctx.fillStyle = '#9ae6d119'; ctx.fill();
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let y = from; y <= to; y += 1.2) { const p = screen(courseCenter(y) + side * (courseHalfWidth - 0.1), y); y === from ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }
      ctx.strokeStyle = side === -1 ? '#9bffe0' : '#76d8cd'; ctx.lineWidth = 2.2; ctx.shadowColor = '#73ffe0'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.setLineDash([4, 13]); ctx.lineWidth = 1; ctx.strokeStyle = '#e5ffe888'; ctx.stroke(); ctx.setLineDash([]);
    }
    for (let y = Math.floor(from / 8) * 8; y < to; y += 8) {
      const p = screen(courseCenter(y), y); ctx.globalAlpha = 0.27; ctx.fillStyle = '#d4fff0'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 2, 6, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawHoop(thing, time) {
    const p = screen(thing.x, thing.distance), r = scale * 1.25;
    const pulse = 1 + Math.sin(time * 0.004 + thing.seed) * 0.05;
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(pulse, pulse);
    ctx.fillStyle = '#d8fb7826'; ctx.beginPath(); ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d8fb78'; ctx.lineWidth = 5; ctx.shadowColor = '#d8fb78'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#f3ffd4'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#efffc6'; ctx.font = '800 9px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillText('JUMP', 0, r + 17);
    ctx.restore();
  }

  function drawNet(thing) {
    const p = screen(thing.x, thing.distance); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-thing.angle);
    const w = thing.w * scale, h = thing.h * scale;
    ctx.fillStyle = '#243f39b8'; ctx.strokeStyle = '#f1c875'; ctx.lineWidth = 2.5; ctx.shadowColor = '#edc97b88'; ctx.shadowBlur = 12;
    ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0;
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); ctx.strokeStyle = '#f3e0a1c4'; ctx.lineWidth = 1;
    for (let x = -w; x <= w; x += 13) { ctx.beginPath(); ctx.moveTo(x, -h); ctx.lineTo(x + h * 0.35, h); ctx.stroke(); }
    for (let y = -h; y <= h; y += 12) { ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = '#f9d57f';
    for (const x of [-w / 2, w / 2]) { ctx.beginPath(); ctx.arc(x, 0, 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  function drawRope(thing, time) {
    const progress = thing.whipped ? clamp(thing.flyTime / 0.8, 0, 1) : 0;
    const eased = progress * progress * (3 - 2 * progress);
    const centerX = thing.x + (thing.flyDx || 0) * eased;
    const centerY = thing.distance + (thing.flyDy || 0) * eased;
    const halfX = Math.cos(thing.angle + progress * 2.4) * thing.length * scale * 0.5;
    const halfY = Math.sin(thing.angle + progress * 2.4) * thing.length * scale * 0.5;
    const a = screen(centerX - halfX / scale, centerY - halfY / scale);
    const b = screen(centerX + halfX / scale, centerY + halfY / scale);
    ctx.save(); ctx.globalAlpha = 1 - progress * 0.9; ctx.lineCap = 'round';
    ctx.strokeStyle = '#f0c77f'; ctx.lineWidth = 5; ctx.shadowColor = '#ffd88b'; ctx.shadowBlur = 11;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo((a.x + b.x) * 0.5, (a.y + b.y) * 0.5 + Math.sin(time * 0.002 + thing.seed) * 4, b.x, b.y); ctx.stroke(); ctx.shadowBlur = 0;
    for (const p of [a, b]) { ctx.fillStyle = '#ff9b61'; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#ffeabc'; ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.restore();
  }

  function drawThings(time) {
    for (const thing of things) {
      const p = screen(thing.x, thing.distance);
      if (p.y < -140 || p.y > height + 140 || p.x < -140 || p.x > width + 140) continue;
      if (thing.kind === 'hoop') drawHoop(thing, time);
      else if (thing.kind === 'net') drawNet(thing);
      else drawRope(thing, time);
    }
  }

  function drawDolphin(time) {
    const jumpHeight = jumpTime > 0 ? Math.sin((1 - jumpTime / 1.05) * Math.PI) * 2.8 : 0;
    const p = screen(playerX, distance), y = p.y - jumpHeight * scale;
    ctx.save();
    if (jumpHeight > 0.1) {
      ctx.globalAlpha = 0.27; ctx.fillStyle = '#001722'; ctx.beginPath(); ctx.ellipse(p.x, p.y + scale * 0.6, scale * 0.65, scale * 1.1, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.translate(p.x, y);
    if (dolphin.complete && dolphin.naturalWidth) {
      const size = scale * 3.45;
      ctx.shadowColor = '#002432aa'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7;
      ctx.drawImage(dolphin, -size * 0.5, -size * 0.5, size, size);
    } else {
      ctx.fillStyle = '#d9eee5'; ctx.beginPath(); ctx.ellipse(0, 0, scale * 0.6, scale * 1.5, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (whipTime > 0) {
      const progress = 1 - whipTime / 0.52;
      const swing = Math.sin(progress * Math.PI * 2.2) * (0.6 + progress * 0.9);
      ctx.save(); ctx.globalAlpha = (whipTime / 0.52) * 0.92; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#e8ff94'; ctx.lineWidth = Math.max(4, scale * 0.2); ctx.shadowColor = '#dcff76'; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.moveTo(p.x, y + scale * 1.15); ctx.quadraticCurveTo(p.x + swing * scale * 1.45, y + scale * 1.95, p.x + swing * scale * 1.85, y + scale * 2.65); ctx.stroke();
      ctx.restore();
    }
  }

  function draw(time) {
    drawBackground(time); drawThings(time);
    for (const bubble of bubbles) {
      const p = screen(bubble.x, bubble.distance); ctx.globalAlpha = Math.min(0.45, bubble.life * 0.6); ctx.strokeStyle = '#d3fff3';
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1, scale * 0.07), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1; drawDolphin(time);
  }

  function frame(time) {
    const dt = Math.min(0.04, Math.max(0, (time - last) / 1000)); last = time;
    pollGamepad(); update(dt); draw(time);
    raf = requestAnimationFrame(state === 'running' ? frame : menuFrame);
  }
  function menuFrame(time) { pollGamepad(); draw(time); raf = requestAnimationFrame(state === 'running' ? frame : menuFrame); }

  function pollGamepad() {
    const controller = navigator.getGamepads?.().find((pad) => pad && pad.connected);
    if (!controller) { pad.turn = 0; pad.boost = false; pad.brake = false; padJump = false; padWhip = false; return; }
    const raw = controller.axes[0] || 0; pad.turn = Math.abs(raw) < 0.17 ? 0 : raw;
    pad.boost = !!(controller.buttons[7]?.pressed || controller.buttons[5]?.pressed);
    pad.brake = !!(controller.buttons[6]?.pressed || controller.buttons[4]?.pressed);
    const jumpDown = !!controller.buttons[0]?.pressed;
    const whipDown = !!controller.buttons[1]?.pressed;
    if (jumpDown && !padJump) { if (state === 'running') jump(); else newRun(); }
    if (whipDown && !padWhip) tailWhip();
    padJump = jumpDown;
    padWhip = whipDown;
  }

  function finish(reason) {
    state = 'over'; ui['tangle-flash'].classList.add('show');
    const result = Math.floor(distance), total = Math.max(0, Math.floor(score));
    ui['game-message'].innerHTML = `<div class="message-stamp">DIVE ENDED · RUN ${seed}</div><h2>Tangled<br />up.</h2><p>${reason}. You swam ${result.toLocaleString()} metres and scored ${total.toLocaleString()} points.</p><button class="launch" id="start-run">SWIM AGAIN <span>↗</span></button><div class="best-line">BEST DISTANCE <b>${best} M</b></div>`;
    ui['game-message'].classList.remove('hidden'); ui['start-run'] = document.getElementById('start-run');
    ui['start-run'].addEventListener('click', newRun); showToast(reason);
  }

  const keyMap = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'boost', KeyW: 'boost', ArrowDown: 'brake', KeyS: 'brake' };
  window.addEventListener('keydown', (event) => {
    if (keyMap[event.code]) { held.add(keyMap[event.code]); event.preventDefault(); }
    if (event.code === 'Space' || event.code === 'ArrowUp' && state === 'ready') { event.preventDefault(); if (!event.repeat) jump(); }
    if (event.code === 'KeyE') { event.preventDefault(); if (!event.repeat) tailWhip(); }
    if (event.code === 'Enter' && state !== 'running') newRun();
  });
  window.addEventListener('keyup', (event) => { if (keyMap[event.code]) held.delete(keyMap[event.code]); });
  window.addEventListener('blur', () => held.clear());
  window.addEventListener('gamepadconnected', () => showToast('CONTROLLER READY · STICK STEERS · A JUMPS · B WHIPS'));
  game.querySelectorAll('[data-hold]').forEach((button) => {
    const action = button.dataset.hold;
    button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); held.add(action); button.classList.add('active'); });
    const release = () => { held.delete(action); button.classList.remove('active'); };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  });
  game.querySelectorAll('[data-turn]').forEach((button) => {
    const action = button.dataset.turn;
    button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); held.add(action); button.classList.add('active'); });
    const release = () => { held.delete(action); button.classList.remove('active'); };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  });
  game.querySelector('[data-action="jump"]')?.addEventListener('click', jump);
  whipButton = game.querySelector('[data-action="whip"]');
  whipButton?.addEventListener('click', tailWhip);
  ui['start-run'].addEventListener('click', newRun);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { held.clear(); last = performance.now(); } });
  state = 'ready'; draw(performance.now()); raf = requestAnimationFrame(menuFrame);
}
