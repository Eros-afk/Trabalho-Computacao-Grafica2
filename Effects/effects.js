// ---------- SOM (Web Audio simples, sem assets externos) ----------
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}
function beep(freq, duration, type='sine', vol=0.2) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.stop(audioCtx.currentTime + duration);
}
function sfxStep() { beep(220 + Math.random()*40, 0.06, 'square', 0.03); }
function sfxPickup() { beep(880, 0.12, 'sine', 0.15); beep(1200, 0.1, 'sine', 0.1); }
function sfxDesarme() { beep(440, 0.15, 'sine', 0.2); setTimeout(()=>beep(660,0.2,'sine',0.2), 100); }
function sfxExplosion() {
  beep(60, 0.6, 'sawtooth', 0.4);
  beep(40, 0.8, 'square', 0.3);
}
function sfxWin() {
  [523,659,784,1046].forEach((f,i)=> setTimeout(()=>beep(f,0.25,'sine',0.2), i*150));
}
function sfxHit() { beep(120, 0.15, 'sawtooth', 0.25); }
function sfxShieldBreak() { beep(700, 0.1, 'triangle', 0.2); beep(300,0.15,'triangle',0.15); }
function sfxSlide() { beep(180, 0.25, 'sawtooth', 0.12); }
function sfxVault() { beep(500, 0.08, 'square', 0.1); beep(750, 0.06, 'square', 0.08); }


// ---------- PARTICULAS (explosão simples) ----------
function spawnExplosion(pos) {
  for (let i=0;i<40;i++) {
    const mat = new THREE.MeshBasicMaterial({ color: Math.random()<0.5?0xff6600:0xffcc00 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.15,6,6), mat);
    mesh.position.copy(pos);
    const dir = new THREE.Vector3((Math.random()-0.5), Math.random()*1.2, (Math.random()-0.5)).normalize();
    const speed = 4 + Math.random()*6;
    scene.add(mesh);
    particles.push({ mesh, vel: dir.multiplyScalar(speed), life: 1.0 });
  }
}

function updateParticles(dt) {
  for (let i=particles.length-1;i>=0;i--) {
    const p = particles[i];
    p.life -= dt*1.2;
    p.vel.y -= 9*dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    p.mesh.scale.setScalar(Math.max(p.life,0));
    if (p.life <= 0) {
      scene.remove(p.mesh);
      particles.splice(i,1);
    }
  }
}

