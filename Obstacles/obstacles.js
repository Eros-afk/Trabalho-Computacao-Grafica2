// ---------- OBSTÁCULOS: Carros abandonados, Caixas, Buracos, Barricadas ----------
function setupObstacles() {
  const zStart = 48, zEnd = -50;
  const obsTypes = ['carro','caixa','buraco','barricada','cone','tambor','placaObra','van'];

  for (let z = zStart; z > zEnd; z -= 6) {
    if (Math.random() < 0.72) {
      const type = obsTypes[Math.floor(Math.random()*obsTypes.length)];
      const x = (Math.random()*17 - 8.5);
      createObstacle(type, x, z);
    }
  }

  // Alguns buracos fixos garantem que o perigo principal apareça em toda partida.
  [-32, -6, 22].forEach((z, i) => createObstacle('buraco', i % 2 === 0 ? -4.5 : 4.5, z));
}

function createObstacle(type, x, z) {
  let mesh;
  let hazardRadius = 0;
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
    const g = new THREE.Group();
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x5b4a3f, roughness: 0.95 });
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.2, 0.22, 24), holeMat);
    hole.position.y = -0.08;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.12, 8, 28), rimMat);
    rim.rotation.x = Math.PI/2;
    rim.position.y = 0.04;
    g.add(hole, rim);
    mesh = g;
    hazardRadius = 1.25;
  } else { // barricada
    if (type === 'cone') {
      const mat = new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: 0.5 });
      const g = new THREE.Group();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.0, 16), mat);
      cone.position.y = 0.5;
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 6, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      stripe.rotation.x = Math.PI/2;
      stripe.position.y = 0.45;
      g.add(cone, stripe);
      mesh = g;
    } else if (type === 'tambor') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x1f6fb2, metalness: 0.25, roughness: 0.55 });
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.25, 18), mat);
      mesh.position.y = 0.62;
      mesh.rotation.z = Math.random() < 0.35 ? Math.PI/2 : 0;
    } else if (type === 'placaObra') {
      const g = new THREE.Group();
      const signMat = new THREE.MeshStandardMaterial({ color: 0xffcc22, roughness: 0.45 });
      const postMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
      const sign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.12), signMat);
      sign.position.y = 1.2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), postMat);
      post.position.y = 0.55;
      g.add(sign, post);
      mesh = g;
    } else if (type === 'van') {
      const g = new THREE.Group();
      const vanMat = new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.65 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x75b8d8, emissive: 0x1d5d7a, emissiveIntensity: 0.25 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 4.6), vanMat);
      body.position.y = 0.85;
      const glass = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 1.2), glassMat);
      glass.position.set(0, 1.55, -0.7);
      g.add(body, glass);
      mesh = g;
    } else {
      const mat = new THREE.MeshStandardMaterial({ color: 0xff8800 });
      mesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 0.4), mat);
      mesh.position.y = 0.5;
    }
    mesh.castShadow = true;
  }
  mesh.position.x = x;
  mesh.position.z = z;
  scene.add(mesh);

  const box = new THREE.Box3().setFromObject(mesh);
  obstacles.push({ mesh, box, type, hazardRadius });
}


// ---------- COLISÕES ----------
function checkCollisions() {
  const playerBox = new THREE.Box3().setFromCenterAndSize(
    player.position.clone().add(new THREE.Vector3(0,1,0)),
    new THREE.Vector3(0.9, 1.8, 0.9)
  );

  // obstáculos: buraco encerra a partida; objetos baixos podem ser pulados manualmente.
  obstacles.forEach(o => {
    if (gameOver) return;

    if (o.type === 'buraco') {
      const dx = player.position.x - o.mesh.position.x;
      const dz = player.position.z - o.mesh.position.z;
      const insideHole = Math.sqrt(dx*dx + dz*dz) < o.hazardRadius;
      if (insideHole && player.position.y < 0.55) {
        triggerExplosion('Você caiu em um buraco.');
      }
      return;
    }

    const isLowObstacle = (o.type === 'caixa' || o.type === 'barricada' || o.type === 'cone');
    if (isLowObstacle && !onGround && player.position.y > 0.9) return;
    o.box.setFromObject(o.mesh);
    if (playerBox.intersectsBox(o.box)) {
      registerObstacleHit();
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
