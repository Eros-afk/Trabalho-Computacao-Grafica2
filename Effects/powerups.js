// ---------- POWER-UPS ----------
function setupPowerups() {
  const types = ['energetico','escudo'];
  for (let i=0; i<3; i++) {
    const type = types[Math.floor(Math.random()*types.length)];
    const z = 34 - i*24 + (Math.random()*5-2.5);
    const x = (Math.random()*16-8);
    createPowerup(type, x, z);
  }
}

function createPowerup(type, x, z) {
  let color = 0xffee00;
  if (type === 'escudo') color = 0x33aaff;

  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
  const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), mat);
  mesh.position.set(x, 1.2, z);
  mesh.castShadow = true;
  scene.add(mesh);

  powerupItems.push({ mesh, type, collected: false, baseY: 1.2 });
}


function updatePowerupsRotation(dt) {
  powerupItems.forEach(p => {
    if (p.collected) return;
    p.mesh.rotation.y += dt*2;
    p.mesh.position.y = p.baseY + Math.sin(performance.now()*0.003 + p.mesh.position.x)*0.15;
  });
}

// ---------- POWER-UPS: PICKUP ----------
function checkPickups() {
  powerupItems.forEach(p => {
    if (p.collected) return;
    if (player.position.distanceTo(p.mesh.position) < 1.4) {
      p.collected = true;
      scene.remove(p.mesh);
      sfxPickup();
      flashMsg('msgPower');
      applyPowerup(p.type);
    }
  });
}

function applyPowerup(type) {
  if (type === 'energetico') {
    activePowerups.energetico = 3; // 3s de boost de velocidade
  } else if (type === 'escudo') {
    shieldCount += 1;
  }
}

// ---------- MOEDAS ----------
function setupCoins() {
  for (let i=0; i<14; i++) {
    const z = 44 - i*7 + (Math.random()*2-1);
    const lane = i % 3;
    const x = lane === 0 ? -7 + Math.random()*2 : (lane === 1 ? Math.random()*4-2 : 5 + Math.random()*3);
    createCoin(x, z);
  }
  updateScoreHUD();
}

function createCoin(x, z) {
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xffd84a,
    emissive: 0xc98a00,
    emissiveIntensity: 0.45,
    metalness: 0.5,
    roughness: 0.35,
  });
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 10, 24), coinMat);
  mesh.position.set(x, 1.05, z);
  mesh.rotation.x = Math.PI/2;
  mesh.castShadow = true;
  scene.add(mesh);

  coinItems.push({ mesh, collected: false, baseY: 1.05 });
}

function updateCoins(dt) {
  coinItems.forEach(c => {
    if (c.collected) return;
    c.mesh.rotation.z += dt*5;
    c.mesh.position.y = c.baseY + Math.sin(performance.now()*0.004 + c.mesh.position.z)*0.12;
  });
}

function checkCoins() {
  coinItems.forEach(c => {
    if (c.collected) return;
    if (player.position.distanceTo(c.mesh.position) < 1.25) {
      c.collected = true;
      scene.remove(c.mesh);
      coinsCollected++;
      score += 100;
      sfxPickup();
      flashMsg('msgCoin');
      updateScoreHUD();
    }
  });
}

function updateScoreHUD() {
  const scoreEl = document.getElementById('scoreValue');
  const coinEl = document.getElementById('coinValue');
  if (!scoreEl || !coinEl) return;
  scoreEl.textContent = score;
  coinEl.textContent = coinsCollected;
}
