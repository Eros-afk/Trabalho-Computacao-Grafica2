// ---------- OBSTÁCULOS: Carros abandonados, Caixas, Buracos, Barricadas ----------
function setupObstacles() {
  const zStart = 45, zEnd = -45;
  const obsTypes = ['carro','caixa','buraco','barricada'];

  for (let z = zStart; z > zEnd; z -= 7) {
    if (Math.random() < 0.55) {
      const type = obsTypes[Math.floor(Math.random()*obsTypes.length)];
      const x = (Math.random()*16 - 8);
      createObstacle(type, x, z);
    }
  }
}

function createObstacle(type, x, z) {
  let mesh;
  if (type === 'carro') {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xaa3333 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x88aacc });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2), cabinMat);
    cabin.position.y = 1.3;
    cabin.castShadow = true;
    g.add(body, cabin);
    mesh = g;
  } else if (type === 'caixa') {
    const mat = new THREE.MeshStandardMaterial({ color: 0xb5854a });
    mesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), mat);
    mesh.position.y = 0.6;
    mesh.castShadow = true;
  } else if (type === 'buraco') {
    const mat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 0.3, 16), mat);
    mesh.position.y = -0.1;
  } else { // barricada
    const mat = new THREE.MeshStandardMaterial({ color: 0xff8800 });
    mesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 0.4), mat);
    mesh.position.y = 0.5;
    mesh.castShadow = true;
  }
  mesh.position.x = x;
  mesh.position.z = z;
  scene.add(mesh);

  const box = new THREE.Box3().setFromObject(mesh);
  obstacles.push({ mesh, box, type });
}


// ---------- COLISÕES ----------
function checkCollisions() {
  const playerBox = new THREE.Box3().setFromCenterAndSize(
    player.position.clone().add(new THREE.Vector3(0,1,0)),
    new THREE.Vector3(0.9, 1.8, 0.9)
  );

  // obstáculos: colidir empurra (ricochete). Caixas/barricadas baixas podem ser "vaultadas" quando o player já está no ar.
  obstacles.forEach(o => {
    const isLowObstacle = (o.type === 'caixa' || o.type === 'barricada');
    if (isLowObstacle && !onGround && player.position.y > 0.9) return; // está passando por cima (vault)
    o.box.setFromObject(o.mesh);
    if (playerBox.intersectsBox(o.box)) {
      const pushDir = new THREE.Vector3().subVectors(player.position, o.mesh.position);
      pushDir.y = 0;
      if (pushDir.lengthSq() < 0.0001) pushDir.set(0,0,1);
      pushDir.normalize();
      player.position.addScaledVector(pushDir, 0.25);
    }
  });

  // NPCs
  npcs.forEach(npc => {
    if (npc._hitCooldown && npc._hitCooldown > 0) { npc._hitCooldown -= lastDt; return; }
    if (playerBox.intersectsBox(npc.box)) {
      handleNPCHit(npc);
      npc._hitCooldown = 1.2;
    }
  });
}

function handleNPCHit(npc) {
  if (npc.type === 'assaltante') {
    if (shieldCount > 0) {
      shieldCount--;
      flashMsg('msgShield');
      sfxShieldBreak();
    } else {
      bombTime = Math.max(0, bombTime - 4);
      sfxHit();
    }
  } else if (npc.type === 'policial') {
    // confunde o personagem com o criminoso: pequeno empurrão/atraso
    if (shieldCount > 0) {
      shieldCount--;
      flashMsg('msgShield');
    } else {
      bombTime = Math.max(0, bombTime - 2);
    }
    sfxHit();
  }
  // pedestre: sem penalidade, apenas obstáculo físico (empurra)
  const pushDir = new THREE.Vector3().subVectors(player.position, npc.mesh.position);
  pushDir.y = 0; pushDir.normalize();
  player.position.addScaledVector(pushDir, 0.3);
}

