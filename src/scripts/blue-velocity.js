const canvas = document.querySelector('#ocean-canvas');
const game = document.querySelector('#blue-game');

if (canvas && game) {
  const ctx = canvas.getContext('2d');
  const ids = ['distance', 'score', 'speed', 'run-seed', 'best-distance', 'game-message', 'start-run', 'toast', 'tail-length', 'tangle-flash'];
  const ui = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  const dolphin = new Image();
  dolphin.src = '/images/blue-velocity-dolphin.png';
  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const courseCenter = (y) => 2.1 * Math.sin(y * 0.026) + 1.1 * Math.sin(y * 0.009 + 1.2);
  const courseHalfWidth = 10.5;
  const WORLD = { sampleStep: 0.42, wakeLength: 18 };
  let width = 1, height = 1, dpr = 1, scale = 20, last = 0, raf = 0, toastUntil = 0;
  let state = 'ready', run = 0, distance = 0, score = 0, speed = 5.2;
  let player = { x: 0, y: 0, heading: 0, vx: 0, vy: 0 };
  let camera = { x: 0, y: 0 }, wake = [], wakeDrawDistance = 0, things = [], bubbles = [], held = new Set();
  let shield = 0, surge = 0, slow = 0, best = Number(localStorage.getItem('blueVelocityBest') || 0);
  let pad = { turn: 0, boost: false, brake: false, flick: false }, padFlick = false;
  let seed = 0, nextSpawnY = 18, lastNearMiss = -10;
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

  const screen = (x, y) => ({ x: width * 0.5 + (x - camera.x) * scale, y: height * 0.68 - (y - camera.y) * scale });
  const isOnscreen = (x, y, margin = 150) => { const p = screen(x, y); return p.x > -margin && p.x < width + margin && p.y > -margin && p.y < height + margin; };

  function newRun() {
    run += 1; seed = Math.floor(Math.random() * 899999) + 100000;
    distance = 0; score = 0; speed = 5.2; shield = 0; surge = 0; slow = 0; WORLD.wakeLength = 18;
    player = { x: courseCenter(0), y: 0, heading: 0, vx: 0, vy: 0 };
    camera = { x: player.x, y: player.y }; wake = [{ x: player.x, y: player.y, traveled: 0 }];
    wakeDrawDistance = 0; things = []; bubbles = []; nextSpawnY = 18; lastNearMiss = -10;
    ui['run-seed'].textContent = String(seed); ui.distance.textContent = '0'; ui.score.textContent = '000000';
    state = 'running'; ui['game-message'].classList.add('hidden'); ui['tangle-flash'].classList.remove('show');
    held.clear(); last = performance.now();
    nextSpawnY = 18;
    while (nextSpawnY < 125) { spawnEncounter(nextSpawnY); nextSpawnY += rand(19, 29); }
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }

  function spawnEncounter(y) {
    const center = courseCenter(y), kindRoll = Math.random();
    let kind;
    if (kindRoll < 0.30) kind = 'net';
    else if (kindRoll < 0.57) kind = 'rope';
    else if (kindRoll < 0.68) kind = 'reef';
    else if (kindRoll < 0.76) kind = 'wreck';
    else if (kindRoll < 0.9) kind = 'power';
    else kind = 'down';
    const x = center + rand(-6.5, 6.5);
    const item = { kind, x, y, hit: false, passed: false, seed: Math.random() * 20, color: Math.floor(Math.random() * 4) };
    if (kind === 'net') { item.angle = rand(-0.48, 0.48); item.w = rand(2.8, 4.1); item.h = rand(3.6, 5.5); }
    if (kind === 'rope') { item.angle = rand(-0.75, 0.75); item.len = rand(4.8, 8.2); }
    if (kind === 'reef') { item.r = rand(1.4, 2.5); }
    if (kind === 'wreck') { item.r = rand(1.5, 2.25); item.angle = rand(-0.4, 0.4); }
    if (kind === 'power' || kind === 'down') item.powerType = kind === 'power' ? ['surge', 'shield', 'trim'][Math.floor(Math.random() * 3)] : ['silt', 'longwake'][Math.floor(Math.random() * 2)];
    things.push(item);
  }

  function showToast(message) {
    ui.toast.textContent = message; ui.toast.classList.add('show'); toastUntil = performance.now() + 1350;
  }
  function award(points) { score += points; }
  function tangler(reason) {
    if (shield > 0) {
      shield = 0; wake = [{ x: player.x, y: player.y, traveled: distance }]; wakeDrawDistance = 0;
      ui['tail-length'].textContent = `WAKE ${Math.round(WORLD.wakeLength)} M`; showToast('SHIELD SNAPPED · WAKE CUT · SWIM FREE'); return false;
    }
    finish(reason); return true;
  }

  function update(dt) {
    if (state !== 'running') return;
    dt = Math.min(dt, 0.04);
    const turnInput = clamp((held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0) + pad.turn, -1, 1);
    const boost = held.has('boost') || pad.boost;
    const brake = held.has('brake') || pad.brake;
    const maxTurn = 2.15;
    player.heading += turnInput * maxTurn * dt;
    const targetSpeed = (boost ? 8.6 : brake ? 3.0 : 5.6) * (slow > 0 ? 0.62 : 1) * (surge > 0 ? 1.45 : 1);
    speed += (targetSpeed - speed) * Math.min(1, dt * 2.7);
    player.vx = Math.sin(player.heading) * speed;
    player.vy = Math.cos(player.heading) * speed;
    const oldX = player.x, oldY = player.y;
    player.x += player.vx * dt; player.y += player.vy * dt;
    distance += Math.max(0, Math.hypot(player.x - oldX, player.y - oldY));
    award(dt * speed * 1.8);
    if (surge > 0) surge = Math.max(0, surge - dt);
    if (slow > 0) slow = Math.max(0, slow - dt);

    const center = courseCenter(player.y);
    if (Math.abs(player.x - center) > courseHalfWidth - 0.7) {
      const side = Math.sign(player.x - center);
      player.x = center + side * (courseHalfWidth - 0.7);
      player.heading *= 0.985;
      if (distance - lastNearMiss > 12) { lastNearMiss = distance; showToast('REEF EDGE · COURSE BOUNDARY'); }
    }
    camera.x += (player.x - camera.x) * Math.min(1, dt * 1.55);
    camera.y += (player.y - camera.y) * Math.min(1, dt * 5.0);

    wakeDrawDistance += Math.hypot(player.x - oldX, player.y - oldY);
    if (wakeDrawDistance >= WORLD.sampleStep) {
      wake.push({ x: player.x, y: player.y, traveled: distance });
      wakeDrawDistance = 0;
      while (wake.length > 2 && distance - wake[0].traveled > WORLD.wakeLength) wake.shift();
    }
    if (wake.length > 12 && checkWakeCollision()) return;

    while (nextSpawnY < player.y + 105) {
      spawnEncounter(nextSpawnY);
      nextSpawnY += rand(19, 29);
    }
    for (const thing of things) {
      if (thing.hit) continue;
      const dx = player.x - thing.x, dy = player.y - thing.y;
      if ((thing.kind === 'net' || thing.kind === 'rope') && hitsTrap(thing, player.x, player.y)) {
        thing.hit = true;
        if (tangler(thing.kind === 'net' ? 'TANGLED IN A FISHING NET' : 'TANGLED IN A ROPE')) return;
      } else if (thing.kind === 'reef' && Math.hypot(dx, dy) < thing.r + 0.55) {
        thing.hit = true; player.heading += (dx < 0 ? -1 : 1) * 0.9; speed *= 0.65; award(-70); showToast('REEF SCRAPE · −70');
      } else if (thing.kind === 'wreck' && Math.hypot(dx, dy) < thing.r + 0.65) {
        thing.hit = true; player.heading += (dx < 0 ? -1 : 1) * 0.7; speed *= 0.58; award(-100); showToast('WRECK CURRENT · −100');
      } else if ((thing.kind === 'power' || thing.kind === 'down') && Math.hypot(dx, dy) < 1.15) {
        thing.hit = true; collect(thing);
      } else if (dy < -5 && !thing.passed) {
        thing.passed = true;
        if ((thing.kind === 'net' || thing.kind === 'rope') && Math.abs(dx) < 1.8) { award(100); showToast('CLEAN THREAD · +100'); }
      }
    }
    things = things.filter((thing) => thing.y > player.y - 28 && !thing.hit);
    for (let i = 0; i < 4; i++) bubbles.push({ x: player.x + rand(-0.4, 0.4), y: player.y - rand(1, 2), life: 0.45 + Math.random() * 0.5 });
    for (const b of bubbles) { b.y -= dt * 2.5; b.life -= dt; }
    bubbles = bubbles.filter((b) => b.life > 0);
    if (distance > best) { best = Math.floor(distance); localStorage.setItem('blueVelocityBest', String(best)); ui['best-distance'].textContent = `${best} M`; }
    ui.distance.textContent = Math.floor(distance).toLocaleString();
    ui.score.textContent = String(Math.max(0, Math.floor(score))).padStart(6, '0');
    ui.speed.textContent = String(Math.round(speed * 3.6));
    if (shield > 0) ui['tail-length'].textContent = `SHIELD · WAKE ${Math.round(WORLD.wakeLength)} M`;
    else ui['tail-length'].textContent = `WAKE ${Math.round(WORLD.wakeLength)} M`;
    if (performance.now() > toastUntil) ui.toast.classList.remove('show');
  }

  function collect(thing) {
    const p = thing.powerType;
    if (p === 'surge') { surge = 5.5; award(250); showToast('BLUE CURRENT · SPEED SURGE +250'); }
    if (p === 'shield') { shield = 1; award(220); showToast('SHELL SHIELD · ONE TANGLE SAVED +220'); }
    if (p === 'trim') { trimWake(6); award(180); showToast('WAKE CUT · −6 M · +180'); }
    if (p === 'silt') { slow = 5; showToast('SILT CLOUD · SLOW CURRENT'); }
    if (p === 'longwake') { WORLD.wakeLength = Math.min(28, WORLD.wakeLength + 5); showToast('KELP SNAG · LONGER WAKE'); }
  }

  function trimWake(meters) {
    WORLD.wakeLength = Math.max(10, WORLD.wakeLength - meters);
    while (wake.length > 2 && distance - wake[0].traveled > WORLD.wakeLength) wake.shift();
  }

  function checkWakeCollision() {
    const checkX = player.x, checkY = player.y;
    for (let i = 0; i < wake.length - 6; i++) {
      const a = wake[i], b = wake[i + 1];
      if (distance - b.traveled < 2.8) continue;
      if (pointSegmentDistance(checkX, checkY, a.x, a.y, b.x, b.y) < 0.72) {
        if (tangler('TANGLED IN YOUR OWN WAKE')) return true;
        return false;
      }
    }
    return false;
  }

  function pointSegmentDistance(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, lengthSq = dx * dx + dy * dy;
    const t = lengthSq ? clamp(((px - ax) * dx + (py - ay) * dy) / lengthSq, 0, 1) : 0;
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  function hitsTrap(thing, x, y) {
    if (thing.kind === 'rope') {
      const hx = Math.cos(thing.angle) * thing.len * 0.5, hy = Math.sin(thing.angle) * thing.len * 0.5;
      return pointSegmentDistance(x, y, thing.x - hx, thing.y - hy, thing.x + hx, thing.y + hy) < 0.7;
    }
    const dx = x - thing.x, dy = y - thing.y, c = Math.cos(thing.angle), s = Math.sin(thing.angle);
    const localX = dx * c + dy * s, localY = -dx * s + dy * c;
    return Math.abs(localX) < thing.w * 0.5 + 0.45 && Math.abs(localY) < thing.h * 0.5 + 0.45;
  }

  function drawBackground(time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#39a5aa'); gradient.addColorStop(0.38, '#08728b'); gradient.addColorStop(1, '#032f50');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    ctx.save();
    for (let i = 0; i < 20; i++) {
      const x = ((i * 149 + time * (0.012 + (i % 3) * 0.006)) % (width + 100)) - 50;
      const y = (i * 71 + Math.sin(time * 0.00035 + i) * 14) % height;
      ctx.globalAlpha = 0.08 + (i % 5) * 0.018; ctx.strokeStyle = '#d9fff0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, y, 24 + i % 4 * 7, 3, Math.sin(time * 0.0002 + i) * 0.1, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    const step = 8;
    const fromY = Math.floor((camera.y - 40) / step) * step;
    const toY = camera.y + 58;
    // A broad, softly lit corridor and two unmistakable reef edges define the route.
    ctx.beginPath();
    for (let y = fromY; y <= toY; y += 1.5) { const p = screen(courseCenter(y) - courseHalfWidth, y); ctx.lineTo(p.x, p.y); }
    for (let y = toY; y >= fromY; y -= 1.5) { const p = screen(courseCenter(y) + courseHalfWidth, y); ctx.lineTo(p.x, p.y); }
    ctx.closePath(); ctx.fillStyle = '#9ae6d119'; ctx.fill();
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let y = fromY; y <= toY; y += 1.2) { const p = screen(courseCenter(y) + side * (courseHalfWidth - 0.1), y); y === fromY ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }
      ctx.strokeStyle = side === -1 ? '#9bffe0' : '#76d8cd'; ctx.lineWidth = 2.2; ctx.shadowColor = '#73ffe0'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.setLineDash([4, 13]); ctx.lineWidth = 1; ctx.strokeStyle = '#e5ffe888'; ctx.stroke(); ctx.setLineDash([]);
    }
    // Current dashes in the center make forward motion and the route direction easy to read.
    for (let y = fromY; y < toY; y += 9) {
      const p = screen(courseCenter(y), y); ctx.globalAlpha = 0.24; ctx.fillStyle = '#d4fff0'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 2, 6, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawWake() {
    if (wake.length < 2) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 1; i < wake.length; i++) {
      const a = wake[i - 1], b = wake[i], pa = screen(a.x, a.y), pb = screen(b.x, b.y);
      const age = (distance - b.traveled) / Math.max(1, WORLD.wakeLength);
      ctx.globalAlpha = 0.11 + (1 - age) * 0.36; ctx.strokeStyle = age < 0.2 ? '#e6ff8d' : '#70f6da'; ctx.lineWidth = Math.max(2, scale * (0.11 + (1 - age) * 0.08));
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.restore();
  }

  function drawNet(t) {
    const p = screen(t.x, t.y); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-t.angle);
    const w = t.w * scale, h = t.h * scale;
    ctx.fillStyle = '#243f3999'; ctx.strokeStyle = '#e5c477'; ctx.lineWidth = 2.4; ctx.shadowColor = '#edc97b88'; ctx.shadowBlur = 10;
    ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0;
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); ctx.strokeStyle = '#f3e0a1a0'; ctx.lineWidth = 1;
    for (let x = -w; x <= w; x += 13) { ctx.beginPath(); ctx.moveTo(x, -h); ctx.lineTo(x + h * 0.35, h); ctx.stroke(); }
    for (let y = -h; y <= h; y += 12) { ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = '#f9d57f'; for (const x of [-w / 2, w / 2]) { ctx.beginPath(); ctx.arc(x, 0, 4.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  function drawRope(t, time) {
    const p = screen(t.x, t.y), hx = Math.cos(t.angle) * t.len * scale * 0.5, hy = Math.sin(t.angle) * t.len * scale * 0.5;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = '#e7bd73'; ctx.lineWidth = 4; ctx.shadowColor = '#ffda8b'; ctx.shadowBlur = 9;
    ctx.beginPath(); ctx.moveTo(p.x - hx, p.y - hy); ctx.quadraticCurveTo(p.x + Math.sin(time * 0.002 + t.seed) * 7, p.y + 3, p.x + hx, p.y + hy); ctx.stroke(); ctx.shadowBlur = 0;
    for (const sign of [-1, 1]) { const x = p.x + hx * sign, y = p.y + hy * sign; ctx.fillStyle = '#f7a05e'; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#ffe9b6'; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.restore();
  }

  function drawReef(t, time) {
    const p = screen(t.x, t.y), r = t.r * scale; ctx.save();
    const colors = ['#f08a7e', '#ffc067', '#a1dd99', '#d898d4'];
    ctx.fillStyle = '#123d49'; ctx.beginPath(); ctx.ellipse(p.x, p.y + r * 0.27, r * 1.05, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = -2; i <= 2; i++) { const h = r * (0.65 + ((i + 3) % 3) * 0.16); const x = p.x + i * r * 0.22; ctx.strokeStyle = colors[(t.color + i + 8) % colors.length]; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, p.y + r * 0.25); ctx.quadraticCurveTo(x + Math.sin(time * 0.001 + i) * 4, p.y - h * 0.35, x + Math.sin(i * 5) * r * 0.18, p.y - h); ctx.stroke(); ctx.beginPath(); ctx.arc(x + Math.sin(i * 5) * r * 0.18, p.y - h, 3.5, 0, Math.PI * 2); ctx.fillStyle = colors[(t.color + i + 8) % colors.length]; ctx.fill(); }
    ctx.restore();
  }

  function drawWreck(t) {
    const p = screen(t.x, t.y), r = t.r * scale; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(t.angle);
    ctx.fillStyle = '#263d45'; ctx.strokeStyle = '#a9825d'; ctx.lineWidth = 2; ctx.shadowColor = '#00182288'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(-r * 0.5, -r); ctx.lineTo(r * 0.45, -r * 0.88); ctx.lineTo(r * 0.82, r * 0.68); ctx.lineTo(0, r); ctx.lineTo(-r * 0.76, r * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#c5a16f'; ctx.beginPath(); ctx.moveTo(0, -r * 0.8); ctx.lineTo(0, r * 0.6); ctx.moveTo(-r * 0.55, 0); ctx.lineTo(r * 0.55, 0); ctx.stroke(); ctx.restore();
  }

  function drawPower(t, time) {
    const p = screen(t.x, t.y + Math.sin(time * 0.003 + t.seed) * 0.15), r = scale * 0.52;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(time * 0.0006 + t.seed); ctx.fillStyle = t.kind === 'power' ? '#d7ff83' : '#fa7881'; ctx.strokeStyle = '#f4fff0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.82, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.82, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.rotate(-(time * 0.0006 + t.seed)); ctx.fillStyle = '#173c45'; ctx.font = `bold ${Math.max(11, r * 0.85)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const labels = { surge: '↗', shield: '◇', trim: '✂', silt: '!', longwake: '↝' }; ctx.fillText(labels[t.powerType], 0, 0); ctx.restore();
  }

  function drawThings(time) {
    const visible = things.filter((t) => !t.hit && isOnscreen(t.x, t.y, 120)).sort((a, b) => a.y - b.y);
    for (const t of visible) {
      if (t.kind === 'net') drawNet(t);
      if (t.kind === 'rope') drawRope(t, time);
      if (t.kind === 'reef') drawReef(t, time);
      if (t.kind === 'wreck') drawWreck(t);
      if (t.kind === 'power' || t.kind === 'down') drawPower(t, time);
    }
  }

  function drawDolphin(time) {
    const p = screen(player.x, player.y); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(player.heading);
    const pulse = 1 + Math.sin(time * 0.008) * 0.012;
    if (dolphin.complete && dolphin.naturalWidth) {
      const size = scale * 3.45 * pulse;
      ctx.shadowColor = '#002432aa'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7;
      ctx.drawImage(dolphin, -size * 0.5, -size * 0.5, size, size);
    } else {
      ctx.fillStyle = '#d9eee5'; ctx.beginPath(); ctx.ellipse(0, 0, scale * 0.58, scale * 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#204f64'; ctx.beginPath(); ctx.moveTo(0, -scale * 1.8); ctx.lineTo(scale * 0.3, -scale * 1.1); ctx.lineTo(-scale * 0.3, -scale * 1.1); ctx.closePath(); ctx.fill();
    }
    if (shield > 0) { ctx.shadowColor = '#c6ff90'; ctx.shadowBlur = 22; ctx.strokeStyle = '#dcff9977'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, scale * 1.22, scale * 2.1, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }

  function render(time) {
    drawBackground(time); drawWake(); drawThings(time);
    for (const b of bubbles) { const p = screen(b.x, b.y); ctx.globalAlpha = Math.min(0.45, b.life * 0.6); ctx.strokeStyle = '#d3fff3'; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1, scale * 0.07), 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 1; drawDolphin(time);
  }

  function flick() {
    if (state !== 'running') { if (state === 'ready' || state === 'over') newRun(); return; }
    const before = wake.length;
    while (wake.length > 2 && distance - wake[0].traveled > 5) wake.shift();
    const removed = before - wake.length;
    award(100 + removed * 5); showToast('TAIL FLICK · WAKE CLEARED +100');
  }

  function pollGamepad() {
    const controller = navigator.getGamepads?.().find((p) => p && p.connected);
    if (!controller) { pad.turn = 0; pad.boost = false; pad.brake = false; pad.flick = false; padFlick = false; return; }
    const raw = controller.axes[0] || 0; pad.turn = Math.abs(raw) < 0.17 ? 0 : raw;
    pad.boost = !!(controller.buttons[7]?.pressed || controller.buttons[5]?.pressed);
    pad.brake = !!(controller.buttons[6]?.pressed || controller.buttons[4]?.pressed);
    const flickDown = !!(controller.buttons[0]?.pressed || controller.buttons[2]?.pressed);
    if (flickDown && !padFlick) flick();
    padFlick = flickDown; pad.flick = flickDown;
  }

  function frame(time) {
    const dt = Math.min(0.04, Math.max(0, (time - last) / 1000)); last = time;
    pollGamepad(); update(dt); render(time);
    raf = requestAnimationFrame(state === 'running' ? frame : menuFrame);
  }
  function menuFrame(time) { pollGamepad(); render(time); raf = requestAnimationFrame(state === 'running' ? frame : menuFrame); }

  function finish(reason) {
    state = 'over'; ui['tangle-flash'].classList.add('show');
    const result = Math.floor(distance), total = Math.max(0, Math.floor(score));
    ui['game-message'].innerHTML = `<div class="message-stamp">DIVE ENDED · RUN ${seed}</div><h2 class="tangle-title">Tangled<br />up.</h2><p>${reason}. You swam ${result.toLocaleString()} metres and scored ${total.toLocaleString()} points.</p><button class="launch" id="start-run">DIVE AGAIN <span>↗</span></button><div class="best-line">BEST DISTANCE <b>${best} M</b></div>`;
    ui['game-message'].classList.remove('hidden'); ui['start-run'] = document.getElementById('start-run');
    ui['start-run'].addEventListener('click', newRun); showToast(reason);
  }

  const keyMap = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'boost', KeyW: 'boost', ArrowDown: 'brake', KeyS: 'brake' };
  window.addEventListener('keydown', (event) => {
    if (keyMap[event.code]) { held.add(keyMap[event.code]); event.preventDefault(); }
    if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) flick(); }
    if (event.code === 'Enter' && state !== 'running') newRun();
  });
  window.addEventListener('keyup', (event) => { if (keyMap[event.code]) held.delete(keyMap[event.code]); });
  window.addEventListener('blur', () => held.clear());
  window.addEventListener('gamepadconnected', () => { showToast('CONTROLLER READY · LEFT STICK · A TAIL FLICK'); if (state !== 'running') raf = requestAnimationFrame(menuFrame); });
  window.addEventListener('gamepaddisconnected', () => showToast('CONTROLLER DISCONNECTED'));
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
  game.querySelector('[data-action="flick"]')?.addEventListener('click', flick);
  ui['start-run'].addEventListener('click', newRun);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { held.clear(); last = performance.now(); } });
  state = 'ready'; render(performance.now()); raf = requestAnimationFrame(menuFrame);
}
