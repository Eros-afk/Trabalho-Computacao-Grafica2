// ---------- NPCs: Pedestres, Assaltantes, Policiais ----------
function setupNPCs() {
  const zStart = 44, zEnd = -48;
  for (let z = zStart; z > zEnd; z -= 5) {
    if (Math.random() < 0.85) {
      const types = ['pedestre','pedestre','pedestre','assaltante','policial'];
      const type = types[Math.floor(Math.random()*types.length)];
      createNPC(type, (Math.random()*20-10), z);
    }
  }
}

function createNPC(type, x, z) {
  let color = 0xffcc66;
  if (type === 'assaltante') color = 0x660000;
  if (type === 'policial') color = 0x1144aa;

  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.9, 6, 10), bodyMat);
  body.position.y = 1.0;
  body.castShadow = true;
  g.add(body);

  if (type === 'policial') {
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x0a1a4a });
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.15, 10), hatMat);
    hat.position.y = 1.65;
    g.add(hat);
  }
  if (type === 'assaltante') {
    const maskMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), maskMat);
    mask.position.y = 1.45;
    g.add(mask);
  }

  g.position.set(x, 0, z);
  scene.add(g);

  const dir = Math.random() < 0.5 ? -1 : 1;
  npcs.push({
    mesh: g,
    type,
    baseX: x,
    z,
    dir,
    speed: type === 'assaltante' ? 3.8 : (type === 'policial' ? 2.6 : 3.0),
    box: new THREE.Box3().setFromObject(g),
    chaseRange: type === 'assaltante' ? 6 : 0,
  });
}


function updateNPCs(dt) {
  npcs.forEach(npc => {
    const m = npc.mesh;

    if (npc.type === 'assaltante') {
      const distToPlayer = m.position.distanceTo(player.position);
      if (distToPlayer < npc.chaseRange) {
        const dir = new THREE.Vector3().subVectors(player.position, m.position);
        dir.y = 0; dir.normalize();
        m.position.addScaledVector(dir, npc.speed*dt);
        m.rotation.y = Math.atan2(dir.x, dir.z);
      } else {
        m.position.x = npc.baseX + Math.sin(performance.now()*0.0014 + npc.z)*5;
      }
    } else if (npc.type === 'policial') {
      m.position.x = npc.baseX + Math.sin(performance.now()*0.0011 + npc.z)*6;
      m.rotation.y = Math.PI/2 * Math.sign(Math.cos(performance.now()*0.0011 + npc.z));
    } else {
      // pedestre atravessando a rua
      m.position.x += npc.dir * npc.speed * dt;
      if (m.position.x > 13 || m.position.x < -13) npc.dir *= -1;
      m.rotation.y = npc.dir > 0 ? Math.PI/2 : -Math.PI/2;
    }

    npc.box.setFromObject(m);
  });
}
