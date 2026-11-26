/* An original interactive field of mathematical signals. No external libraries. */
(() => {
  'use strict';
  const canvas = document.getElementById('field');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;
  const button = document.getElementById('motion');
  const rippleButton = document.getElementById('ripple');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: -1000, y: -1000, active: false, strength: 0 };
  const ripples = [];
  let width = 0, height = 0, rows = 40, cols = 96, time = 0;
  let paused = reduce.matches, frame = 0, previous = 0, spread = 0, targetSpread = 0;
  let lines = [], touchTimer;
  const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
  const lerp = (a, b, n) => a + (b - a) * n;
  const smooth = v => v * v * (3 - 2 * v);
  function scrollPosition() {
    targetSpread = document.body.classList.contains('page-projects') ? 1 : smooth(clamp(scrollY / Math.max(height * .82, 420), 0, 1));
    if (paused) { spread = targetSpread; draw(); }
  }
  function resize() {
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, width < 720 ? 1.5 : 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rows = width < 720 ? 28 : 42;
    cols = width < 720 ? 64 : 96;
    lines = Array.from({length: rows}, () => new Float32Array(cols * 2));
    scrollPosition(); spread = targetSpread; draw(); drawSmallSignal();
  }
  function point(row, col) {
    const u = col / (cols - 1), v = row / (rows - 1);
    const phase = time * .3;
    const heroX = width * (.14 + u * 1.01);
    const heroY = height * (.50 + v * .30) + Math.sin(u * 8.5 + phase + v * 2.8) * height * .086 + Math.sin(u * 4.5 - v * 3.9 + phase * .48) * height * .095;
    const right = row >= rows / 2;
    const depth = (row % (rows / 2)) / (rows / 2 - 1);
    const sideWidth = Math.min(width * .062, 95);
    const edgeDistance = sideWidth * (.09 + depth * .82) + Math.sin(u * 8 + phase + depth * 2) * sideWidth * .24;
    const sideX = right ? width - edgeDistance : edgeDistance;
    const sideY = (u * 1.2 - .1) * height + Math.sin(depth * 3 + phase) * 18;
    let x = lerp(heroX, sideX, spread), y = lerp(heroY, sideY, spread);
    if (!paused) {
      const dx = x - pointer.x, dy = y - pointer.y;
      const dist = Math.hypot(dx, dy), radius = width < 720 ? 135 : 210;
      const influence = Math.pow(clamp(1 - dist / radius, 0, 1), 2) * pointer.strength;
      const boundedForce = 34 * influence * (1 - spread * .52);
      x += dx / Math.max(dist, 1) * boundedForce;
      y += dy / Math.max(dist, 1) * boundedForce;
      for (const r of ripples) {
        const rx = x - r.x, ry = y - r.y, rd = Math.hypot(rx, ry);
        const wave = Math.exp(-Math.pow((rd - r.age * 220) / 40, 2));
        const force = Math.sin((rd - r.age * 220) * .04) * wave * 18 * (1 - r.age / 1.6);
        x += rx / Math.max(rd, 1) * force;
        y += ry / Math.max(rd, 1) * force;
      }
    }
    return [x, y];
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let row = 0; row < rows; row++) {
      const v = row / (rows - 1), warm = row % 5 < 3;
      const rgb = warm ? '243,174,137' : '137,146,184';
      const coordinates = lines[row];
      ctx.beginPath();
      for (let col = 0; col < cols; col++) {
        const [x,y] = point(row, col);
        coordinates[col * 2] = x; coordinates[col * 2 + 1] = y;
        if (col === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = `rgba(${rgb},${.12 + v * .16 + spread * .07})`;
      ctx.lineWidth = row % 7 === 0 ? 1 : .65;
      ctx.stroke();
      ctx.fillStyle = `rgba(${rgb},${.36 + v * .23})`;
      ctx.beginPath();
      for (let col = row % 4; col < cols; col += 5) {
        const x = coordinates[col * 2], y = coordinates[col * 2 + 1];
        ctx.moveTo(x + 1.15,y); ctx.arc(x,y,row % 6 === 0 ? 1.15 : .8,0,Math.PI * 2);
      }
      ctx.fill();
    }
  }
  function animate(now) {
    frame = 0;
    if (paused || document.hidden) return;
    if (now - previous >= 30) {
      const dt = Math.min((now - previous) / 1000 || .033, .06);
      previous = now; time += dt;
      spread = lerp(spread, targetSpread, 1 - Math.exp(-dt * 8));
      pointer.strength = lerp(pointer.strength, pointer.active ? 1 : 0, 1 - Math.exp(-dt * 9));
      for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].age += dt; if (ripples[i].age > 1.6) ripples.splice(i,1); }
      draw();
    }
    frame = requestAnimationFrame(animate);
  }
  function run() {
    cancelAnimationFrame(frame); previous = 0;
    if (!paused && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function controls() {
    if (button) {
      button.textContent = paused ? 'Motion off' : 'Motion on';
      button.setAttribute('aria-pressed', String(!paused));
      button.setAttribute('aria-label', paused ? 'Enable signal motion' : 'Pause signal motion');
    }
    if (rippleButton) rippleButton.disabled = paused;
    if (paused) { ripples.length = 0; pointer.strength = 0; spread = targetSpread; draw(); }
    run();
  }
  function addRipple(x,y) {
    if (paused) return;
    if (ripples.length >= 3) ripples.shift();
    ripples.push({x,y,age:0});
  }
  window.addEventListener('pointermove', e => {
    pointer.x=e.clientX; pointer.y=e.clientY; pointer.active=true;
    if (e.pointerType !== 'mouse') { clearTimeout(touchTimer); touchTimer=setTimeout(()=>pointer.active=false,600); }
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>pointer.active=false);
  window.addEventListener('blur',()=>pointer.active=false);
  window.addEventListener('pointerdown',e=>{
    if (e.target.closest('a,button,input,select,textarea,summary')) return;
    pointer.x=e.clientX; pointer.y=e.clientY; pointer.active=true;
    addRipple(e.clientX,e.clientY);
    if (e.pointerType !== 'mouse') { clearTimeout(touchTimer); touchTimer=setTimeout(()=>pointer.active=false,600); }
  },{passive:true});
  if (rippleButton) rippleButton.addEventListener('click',()=>addRipple(width*.72,height*.7));
  if (button) button.addEventListener('click',()=>{paused=!paused;controls();});
  reduce.addEventListener('change',e=>{paused=e.matches;controls();});
  document.addEventListener('visibilitychange',run);
  window.addEventListener('scroll',scrollPosition,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  function drawSmallSignal() {
    const c = document.getElementById('signal'); if (!c) return;
    const g=c.getContext('2d'); if (!g) return;
    const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
    c.width=r.width*d; c.height=r.height*d;g.setTransform(d,0,0,d,0,0);
    for(let j=1;j<5;j++){g.strokeStyle='#252731';g.beginPath();g.moveTo(0,j*r.height/5);g.lineTo(r.width,j*r.height/5);g.stroke();}
    g.beginPath();for(let x=0;x<r.width;x++){const u=x/r.width,a=u<.49?21:65,y=r.height*.48+Math.sin(u*70)*a+Math.sin(u*181)*7;if(x===0)g.moveTo(x,y);else g.lineTo(x,y);}
    g.strokeStyle='#f0ad89';g.lineWidth=1.5;g.stroke();g.setLineDash([4,6]);g.beginPath();g.moveTo(r.width*.49,30);g.lineTo(r.width*.49,r.height-45);g.strokeStyle='#c3c6d6';g.stroke();g.setLineDash([]);
  }
  resize(); controls();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting)document.querySelectorAll('nav a[href^="#"]').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));
    }),{rootMargin:'-15% 0px -55% 0px'});
    document.querySelectorAll('section[id]').forEach(s=>observer.observe(s));
  }
})();
