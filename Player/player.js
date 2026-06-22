// ---------- PLAYER (estilo runner urbano — jaqueta vermelha, silhueta atlética) ----------
function setupPlayer() {
  playerGroup = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9a679, roughness: 0.7 });
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0xe5212b, roughness: 0.45, metalness: 0.05 });
  const jacketDarkMat = new THREE.MeshStandardMaterial({ color: 0x8f1218, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.8 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.4 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2b1c12, roughness: 0.9 });

  // torso anguloso (mais "atlético" que uma cápsula genérica)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.85, 8), jacketMat);
  torso.position.y = 1.15;
  torso.castShadow = true;
  playerGroup.add(torso);

  // faixa diagonal na jaqueta (detalhe icônico de runner)
  const stripeGeo = new THREE.BoxGeometry(0.5, 0.12, 0.46);
  const stripe = new THREE.Mesh(stripeGeo, jacketDarkMat);
  stripe.position.set(0, 1.25, 0);
  stripe.rotation.z = 0.5;
  playerGroup.add(stripe);

  // capuz/ombros
  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8), jacketMat);
  shoulders.scale.set(1.15, 0.55, 0.95);
  shoulders.position.y = 1.55;
  shoulders.castShadow = true;
  playerGroup.add(shoulders);

  // cabeça
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), skinMat);
  head.position.y = 1.92;
  head.castShadow = true;
  playerGroup.add(head);

  // cabelo (rabo de cavalo simples — referência leve a Faith)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), hairMat);
  hair.scale.set(1, 0.9, 1.05);
  hair.position.set(0, 1.98, -0.06);
  playerGroup.add(hair);
  const ponytail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 6), hairMat);
  ponytail.position.set(0, 1.75, -0.28);
  ponytail.rotation.x = 0.4;
  playerGroup.add(ponytail);
  playerGroup.userData.ponytail = ponytail;

  // quadril/pélvis
  const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.3, 8), pantsMat);
  hips.position.y = 0.72;
  playerGroup.add(hips);

  // braços (com pivot no ombro pra animar)
  function makeArm(side) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.4, 1.55, 0);
    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.38, 4, 8), jacketMat);
    upperArm.position.y = -0.22;
    upperArm.castShadow = true;
    armGroup.add(upperArm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), skinMat);
    hand.position.y = -0.48;
    armGroup.add(hand);
    playerGroup.add(armGroup);
    return armGroup;
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);
  playerGroup.userData.armL = armL;
  playerGroup.userData.armR = armR;

  // pernas (pivot no quadril)
  function makeLeg(side) {
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.16, 0.62, 0);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.42, 4, 8), pantsMat);
    thigh.position.y = -0.24;
    thigh.castShadow = true;
    legGroup.add(thigh);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.32), shoeMat);
    shoe.position.set(0, -0.52, 0.06);
    shoe.castShadow = true;
    legGroup.add(shoe);
    playerGroup.add(legGroup);
    return legGroup;
  }
  const legL = makeLeg(-1);
  const legR = makeLeg(1);
  playerGroup.userData.legL = legL;
  playerGroup.userData.legR = legR;

  // "bomba" nas costas — referência visual ao enredo
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.3, roughness: 0.6 });
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 8, 16), beltMat);
  belt.rotation.x = Math.PI/2;
  belt.position.set(0, 0.95, 0);
  playerGroup.add(belt);

  const bombMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.5 });
  const bombMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.32, 10), bombMat);
  bombMesh.position.set(0, 1.0, -0.42);
  bombMesh.rotation.x = Math.PI/2;
  bombMesh.castShadow = true;
  playerGroup.add(bombMesh);

  const blinkMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const blinkLight = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), blinkMat);
  blinkLight.position.set(0, 1.0, -0.58);
  playerGroup.add(blinkLight);
  playerGroup.userData.blinkLight = blinkLight;

  playerGroup.userData.torso = torso;
  playerGroup.userData.headRef = head;
  playerGroup.userData.baseHeight = 0;

  playerGroup.position.set(0, 0, 60); // começa "atrás", correndo em -Z até a extração
  scene.add(playerGroup);
  player = playerGroup;
}


// ---------- INPUT ----------
function onKeyDown(e) {
  switch(e.code) {
    case 'KeyW': keys.w = true; break;
    case 'KeyA': keys.a = true; break;
    case 'KeyS': keys.s = true; break;
    case 'KeyD': keys.d = true; break;
    case 'ShiftLeft': case 'ShiftRight': keys.shift = true; break;
    case 'Space': keys.space = true; e.preventDefault(); break;
  }
}
function onKeyUp(e) {
  switch(e.code) {
    case 'KeyW': keys.w = false; break;
    case 'KeyA': keys.a = false; break;
    case 'KeyS': keys.s = false; break;
    case 'KeyD': keys.d = false; break;
    case 'ShiftLeft': case 'ShiftRight': keys.shift = false; break;
    case 'Space': keys.space = false; break;
  }
}


function getSpeedMultiplier() {
  let mult = 1;
  if (activePowerups.energetico > 0) mult *= 1.6;
  return mult;
}

function updatePlayer(dt) {
  // movimento relativo ao eixo do mundo (câmera fixa atrás, sem rotação livre)
  let moveX = 0, moveZ = 0;
  if (keys.w) moveZ -= 1;
  if (keys.s) moveZ += 1;
  if (keys.a) moveX -= 1;
  if (keys.d) moveX += 1;

  const movingInput = (moveX !== 0 || moveZ !== 0);
  const speedMult = getSpeedMultiplier();
  const baseSpeed = (keys.shift ? CONFIG.runSpeed : CONFIG.walkSpeed) * speedMult;

  const moveVec = new THREE.Vector3(moveX, 0, moveZ);
  if (movingInput) moveVec.normalize();

  velocity.x = moveVec.x * baseSpeed;
  velocity.z = moveVec.z * baseSpeed;

  if (keys.space && onGround) {
    verticalVel = CONFIG.jumpForce;
    onGround = false;
  }

  verticalVel += CONFIG.gravity * dt;
  let newY = player.position.y + verticalVel*dt;
  if (newY <= 0) { newY = 0; verticalVel = 0; onGround = true; }

  const prevPos = player.position.clone();
  player.position.x += velocity.x*dt;
  player.position.z += velocity.z*dt;
  player.position.y = newY;

  // limites do mapa
  player.position.x = THREE.MathUtils.clamp(player.position.x, -CONFIG.mapHalfSize+2, CONFIG.mapHalfSize-2);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -CONFIG.mapHalfSize+2, CONFIG.mapHalfSize-2);

  // orientar o personagem na direção do movimento + leve inclinação lateral nas curvas (lean)
  let turnDelta = 0;
  if (movingInput) {
    const targetAngle = Math.atan2(velocity.x, velocity.z);
    const prevAngle = player.rotation.y;
    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetAngle, 0.25);
    turnDelta = THREE.MathUtils.lerp(0, (targetAngle - prevAngle), 1) ;
  }
  const targetLean = movingInput ? THREE.MathUtils.clamp(-turnDelta*6, -0.35, 0.35) : 0;
  player.userData.torso.rotation.z = THREE.MathUtils.lerp(player.userData.torso.rotation.z, targetLean, 0.2);

  // inclinação pra frente (forward lean) proporcional à velocidade — sensação de corrida agressiva
  const speedRatio = THREE.MathUtils.clamp(currentSpeed / (CONFIG.runSpeed*1.6), 0, 1);
  const forwardLean = THREE.MathUtils.lerp(0.05, 0.32, speedRatio);
  player.userData.torso.rotation.x = THREE.MathUtils.lerp(player.userData.torso.rotation.x, forwardLean, 0.2);

  // animação de corrida: pernas e braços alternados
  const moveSpeedReal = new THREE.Vector2(player.position.x-prevPos.x, player.position.z-prevPos.z).length()/dt;
  currentSpeed = moveSpeedReal;
  const animRate = movingInput ? (keys.shift ? 16 : 10) : 0;
  mixerTimeAcc += dt * animRate;
  const swing = Math.sin(mixerTimeAcc) * 0.55;
  if (onGround) {
    player.userData.legL.rotation.x = movingInput ? swing : 0;
    player.userData.legR.rotation.x = movingInput ? -swing : 0;
    player.userData.armL.rotation.x = movingInput ? -swing*0.8 : 0;
    player.userData.armR.rotation.x = movingInput ? swing*0.8 : 0;
  } else if (!onGround) {
    // pose de salto: pernas dobradas pra frente
    player.userData.legL.rotation.x = THREE.MathUtils.lerp(player.userData.legL.rotation.x, -0.9, 0.3);
    player.userData.legR.rotation.x = THREE.MathUtils.lerp(player.userData.legR.rotation.x, -0.5, 0.3);
    player.userData.armL.rotation.x = THREE.MathUtils.lerp(player.userData.armL.rotation.x, 0.6, 0.3);
    player.userData.armR.rotation.x = THREE.MathUtils.lerp(player.userData.armR.rotation.x, -0.6, 0.3);
  }
  if (player.userData.ponytail) {
    player.userData.ponytail.rotation.x = 0.4 + Math.sin(mixerTimeAcc*0.5)*0.1 + speedRatio*0.3;
  }

  // blink da bomba mais rápido conforme o tempo aperta
  const blink = player.userData.blinkLight;
  const blinkSpeed = bombTime < 15 ? 8 : (bombTime < 30 ? 4 : 2);
  blink.material.color.setHex(Math.sin(performance.now()*0.001*blinkSpeed) > 0 ? 0xff0000 : 0x550000);

  if (movingInput && onGround && Math.random() < 0.06) sfxStep();
}

function updateCamera() {
  // câmera fixa atrás do personagem, auto-segue, sem mouse — mais baixa e próxima (estilo runner)
  const heightOffset = 3.6;
  const distOffset = 6.8;
  const camOffset = new THREE.Vector3(0, heightOffset, distOffset);

  const desired = player.position.clone().add(camOffset);
  camera.position.lerp(desired, 0.14);

  const lookTarget = player.position.clone().add(new THREE.Vector3(0, 1.3, -5));
  camera.lookAt(lookTarget);

  // FOV dinâmico: aumenta com a velocidade pra dar sensação de correr rápido (efeito clássico de runner em 1ª/3ª pessoa)
  const speedRatio = THREE.MathUtils.clamp(currentSpeed / (CONFIG.runSpeed*1.6), 0, 1);
  const targetFOV = CONFIG.baseFOV + speedRatio*(CONFIG.maxFOV - CONFIG.baseFOV);
  camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.08);
  camera.updateProjectionMatrix();

  // atualiza overlay de velocidade (streak lines / vinheta) via CSS
  updateSpeedOverlay(speedRatio);
}

function updateSpeedOverlay(speedRatio) {
  const overlay = document.getElementById('speedOverlay');
  if (!overlay) return;
  overlay.style.opacity = (speedRatio > 0.55) ? Math.min(1, (speedRatio-0.55)*2.2) : 0;
}
