// ---------- POWER-UPS ----------
function setupPowerups() {
  const types = ['energetico','escudo','adrenalina'];
  for (let i=0; i<7; i++) {
    const type = types[Math.floor(Math.random()*types.length)];
    const z = 38 - i*11 + (Math.random()*4-2);
    const x = (Math.random()*18-9);
    createPowerup(type, x, z);
  }
}

function createPowerup(type, x, z) {
  let color = 0xffee00;
  if (type === 'escudo') color = 0x33aaff;
  if (type === 'adrenalina') color = 0xff33aa;

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
    activePowerups.energetico = 8; // 8s de boost de velocidade
  } else if (type === 'escudo') {
    shieldCount += 1;
  } else if (type === 'adrenalina') {
    bombTime = Math.max(0, bombTime - 8); // reduz contador da bomba (risco/recompensa, conforme o txt)
  }
}

