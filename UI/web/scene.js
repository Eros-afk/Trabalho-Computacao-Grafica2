// ---------- INIT ----------
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcfe8f5);
  scene.fog = new THREE.Fog(0xdcf0fa, 50, 130);

  camera = new THREE.PerspectiveCamera(CONFIG.baseFOV, window.innerWidth/window.innerHeight, 0.1, 500);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  setupLights();
  setupSky();
  setupGround();
  setupPlayer();
  setupObstacles();
  setupNPCs();
  setupDesarmePosts();
  setupPowerups();
  setupExtraction();
  setupCityProps();

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

function onResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------- LUZ (Iluminação adequada, alto contraste estilo "Mirror's Edge") ----------
function setupLights() {
  const hemi = new THREE.HemisphereLight(0xeaf6ff, 0x6b6f78, 1.0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(45, 70, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -90;
  sun.shadow.camera.right = 90;
  sun.shadow.camera.top = 90;
  sun.shadow.camera.bottom = -90;
  sun.shadow.camera.far = 220;
  sun.shadow.bias = -0.0015;
  scene.add(sun);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  // luz de contraste fria vinda do lado oposto (realça volumes brancos dos prédios)
  const fill = new THREE.DirectionalLight(0xbfe0ff, 0.35);
  fill.position.set(-30, 20, -40);
  scene.add(fill);
}

function setupSky() {
  // gradiente de céu simples via esfera invertida
  const skyGeo = new THREE.SphereGeometry(300, 16, 16);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x4aa8e0) },
      bottomColor: { value: new THREE.Color(0xeaf6ff) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      void main() {
        float h = normalize(vWorldPosition).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
}

