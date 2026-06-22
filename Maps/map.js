// ---------- MAPA (chão pequeno + ruas, paleta clara estilo concreto urbano) ----------
function setupGround() {
  const groundGeo = new THREE.PlaneGeometry(CONFIG.mapHalfSize*2, CONFIG.mapHalfSize*2);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xaab0b6, roughness: 0.95 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);

  // pista central (asfalto escuro pra contrastar com calçadas claras)
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x3a3d40, roughness: 0.9 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(20, CONFIG.mapHalfSize*2), roadMat);
  road.rotation.x = -Math.PI/2;
  road.position.y = 0.005;
  road.receiveShadow = true;
  scene.add(road);

  // faixa central (rua)
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf5d020, emissive: 0xf5d020, emissiveIntensity: 0.15 });
  for (let i=-CONFIG.mapHalfSize; i<CONFIG.mapHalfSize; i+=8) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.3), stripeMat);
    stripe.rotation.x = -Math.PI/2;
    stripe.position.set(0, 0.01, i+2);
    scene.add(stripe);
  }

  // calçadas claras (concreto branco, marca da estética runner)
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xe8e9ea, roughness: 0.8 });
  const sidewalkAccentMat = new THREE.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0xff5a1f, emissiveIntensity: 0.25 });
  [-1, 1].forEach(side => {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, CONFIG.mapHalfSize*2), sidewalkMat);
    sw.position.set(side*14, 0.1, 0);
    sw.receiveShadow = true;
    sw.castShadow = true;
    scene.add(sw);

    // faixa de destaque laranja na borda da calçada (sinalização visual de percurso, estilo runner-vision)
    const accent = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, CONFIG.mapHalfSize*2), sidewalkAccentMat);
    accent.position.set(side*11.1, 0.1, 0);
    scene.add(accent);
  });
}

function setupCityProps() {
  // prédios brancos/concreto com janelas e detalhes de destaque, estilo "runner-city"
  const buildingPalette = [0xf2f3f1, 0xe9eaea, 0xdfe1e0, 0xd6cfc4, 0xc9cdd1];
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x9fd6ff, emissive: 0x3a7ea8, emissiveIntensity: 0.4, roughness: 0.3 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff5a1f, roughness: 0.5 });
  const parkMat = new THREE.MeshStandardMaterial({ color: 0x3f9b55, roughness: 0.9 });
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4528, roughness: 0.8 });
  const treeLeafMat = new THREE.MeshStandardMaterial({ color: 0x2f7d43, roughness: 0.9 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x3b4148, metalness: 0.25, roughness: 0.55 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfff1a8, emissive: 0xffd45a, emissiveIntensity: 0.65 });
  const constructionMat = new THREE.MeshStandardMaterial({ color: 0xffb020, roughness: 0.6 });

  for (let i=-66; i<=66; i+=14) {
    [-26, 26].forEach((x, idx) => {
      const h = 10 + Math.random()*22;
      const w = 9 + Math.random()*3;
      const color = buildingPalette[Math.floor(Math.random()*buildingPalette.length)];
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat);
      const zPos = i + (Math.random()*4-2);
      b.position.set(x, h/2, zPos);
      b.castShadow = true;
      b.receiveShadow = true;
      scene.add(b);

      // grade de janelas na face voltada pra rua
      const faceX = idx === 0 ? w/2 + 0.02 : -w/2 - 0.02;
      const rows = Math.floor(h/2.2);
      const cols = 3;
      for (let r=0; r<rows; r++) {
        for (let c=0; c<cols; c++) {
          if (Math.random() < 0.3) continue; // algumas janelas "apagadas"
          const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), windowMat);
          win.position.set(
            x + faceX,
            1.5 + r*2.2,
            zPos + (c-1)*(w/3.4)
          );
          win.rotation.y = idx === 0 ? Math.PI/2 : -Math.PI/2;
          scene.add(win);
        }
      }

      // faixa de destaque laranja no topo de alguns prédios (referência ao "runner vision")
      if (Math.random() < 0.35) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(w*0.94, 0.4, w*0.94), accentMat);
        cap.position.set(x, h + 0.2, zPos);
        cap.castShadow = true;
        scene.add(cap);
      }

      // caixa de ar-condicionado / estrutura no topo (silhueta mais urbana)
      if (Math.random() < 0.5) {
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x888c8f, roughness: 0.7 });
        const acBox = new THREE.Mesh(new THREE.BoxGeometry(w*0.3, 1.2, w*0.3), boxMat);
        acBox.position.set(x + (Math.random()*2-1), h + 0.6, zPos + (Math.random()*2-1));
        acBox.castShadow = true;
        scene.add(acBox);
      }
    });
  }

  // Trechos de cenário diferentes ao longo da rota: praça, obra, beco e área policial.
  [-42, 18].forEach(z => {
    const park = new THREE.Mesh(new THREE.BoxGeometry(10, 0.12, 14), parkMat);
    park.position.set(-17.5, 0.08, z);
    park.receiveShadow = true;
    scene.add(park);

    for (let i=0; i<4; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.4, 8), treeTrunkMat);
      trunk.position.y = 0.75;
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), treeLeafMat);
      leaves.position.y = 1.8;
      tree.add(trunk, leaves);
      tree.position.set(-20 + (i%2)*5, 0, z - 4 + Math.floor(i/2)*8);
      scene.add(tree);
    }
  });

  [-55, -25, 5, 35, 58].forEach(z => {
    [-1, 1].forEach(side => {
      const lamp = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.4, 10), metalMat);
      pole.position.y = 1.7;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.08), metalMat);
      arm.position.set(side * -0.45, 3.25, 0);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), lightMat);
      bulb.position.set(side * -0.95, 3.15, 0);
      lamp.add(pole, arm, bulb);
      lamp.position.set(side * 10.5, 0, z);
      scene.add(lamp);
    });
  });

  for (let i=0; i<4; i++) {
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 5), constructionMat);
    barrier.position.set(17.5, 0.65, -28 + i*4);
    barrier.rotation.y = i % 2 === 0 ? 0.08 : -0.08;
    barrier.castShadow = true;
    scene.add(barrier);
  }

  const alleyMat = new THREE.MeshStandardMaterial({ color: 0x252a30, roughness: 0.9 });
  [-8, -2, 4].forEach(z => {
    const alley = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.5, 5), alleyMat);
    alley.position.set(22, 2.25, z);
    alley.castShadow = true;
    scene.add(alley);
  });

  const policeMat = new THREE.MeshStandardMaterial({ color: 0x1d4fa3, emissive: 0x0b2f7a, emissiveIntensity: 0.25 });
  const policeLine = new THREE.Mesh(new THREE.BoxGeometry(7, 0.15, 0.35), policeMat);
  policeLine.position.set(7.5, 1.2, -60);
  policeLine.castShadow = true;
  scene.add(policeLine);
}


// ---------- POSTOS DE DESARME TEMPORÁRIO ----------
function setupDesarmePosts() {
  const positions = [25, 5, -15, -35];
  positions.forEach(z => {
    const x = (Math.random()*10 - 5);
    const g = new THREE.Group();

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x00cc66, emissive: 0x004422, emissiveIntensity: 0.4 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.15, 20), baseMat);
    base.position.y = 0.08;
    g.add(base);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8), poleMat);
    pole.position.y = 1.2;
    g.add(pole);

    const signMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.6 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.15), signMat);
    sign.position.y = 2.4;
    g.add(sign);

    g.position.set(x, 0, z);
    scene.add(g);

    desarmePosts.push({ mesh: g, pos: new THREE.Vector3(x, 0, z), usableAt: 0, ring: base });
  });
}


// ---------- PONTO DE EXTRAÇÃO ----------
function setupExtraction() {
  extractionPoint = new THREE.Vector3(0, 0, -68);

  const g = new THREE.Group();
  const padMat = new THREE.MeshStandardMaterial({ color: 0x224488, emissive: 0x2244ff, emissiveIntensity: 0.3 });
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.2, 24), padMat);
  pad.position.y = 0.1;
  g.add(pad);

  const towerMat = new THREE.MeshStandardMaterial({ color: 0x335577 });
  for (let i=0;i<4;i++) {
    const angle = (i/4)*Math.PI*2;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,5,8), towerMat);
    pole.position.set(Math.cos(angle)*4.5, 2.5, Math.sin(angle)*4.5);
    g.add(pole);
  }

  const signMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x00aaff, emissiveIntensity: 0.7 });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.3), signMat);
  sign.position.set(0, 5.2, 0);
  g.add(sign);

  g.position.copy(extractionPoint);
  scene.add(g);
  extractionMesh = g;
}


// ---------- POSTOS DE DESARME ----------
function checkDesarmePosts() {
  const now = performance.now()/1000;
  desarmePosts.forEach(post => {
    if (now < post.usableAt) {
      post.ring.material.emissiveIntensity = 0.1;
      return;
    }
    post.ring.material.emissiveIntensity = 0.5;
    if (player.position.distanceTo(post.pos) < 2.2) {
      bombTime += CONFIG.desarmeBonus;
      post.usableAt = now + CONFIG.desarmeCooldown;
      flashMsg('msgDesarme');
      sfxDesarme();
    }
  });
}

// ---------- EXTRAÇÃO ----------
function checkExtraction() {
  if (player.position.distanceTo(extractionPoint) < 5.5) {
    triggerWin();
  }
}

function updateDistanceHUD() {
  const d = Math.max(0, Math.round(player.position.distanceTo(extractionPoint)));
  document.getElementById('distValue').textContent = d;
}
