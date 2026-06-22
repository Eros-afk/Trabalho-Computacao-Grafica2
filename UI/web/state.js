/* =========================================================
   RUNBOOM — Three.js
   Estrutura baseada em Projeto_Player_Movimento.txt:
   - Player: Movimento, Câmera 3ª pessoa, Animações simples
   - Bomb: Timer (20s), Explosão, Condições de derrota (parado >4s)
   - NPC: IA simples, Colisões (pedestres, assaltantes, policiais)
   - Obstacles: Carros, Caixas, Buracos, Barricadas
   - UI: Cronômetro, Mensagens, Menu
   - Effects: Sons básicos, Partículas
   - Maps: cidade pequena com posto de desarme e ponto de extração
========================================================= */

// ---------- CONFIG GERAL ----------
const CONFIG = {
  bombStart: 20,           // bomba começa com 20 segundos
  stopLimit: 2,             // explode se < limite de velocidade por mais de 4s
  speedThreshold: 3.2,      // limite de velocidade (unid/s) abaixo do qual o timer de parada conta
  maxObstacleHits: 2,       // dois impactos em obstáculos detonam a bomba
  walkSpeed: 4.0,
  runSpeed: 8.5,
  baseFOV: 65,
  maxFOV: 82,
  jumpForce: 7.0,
  gravity: -18,
  mapHalfSize: 70,          // mapa pequeno
  desarmeBonus: 8,          // tempo ganho ao usar posto de desarme
  desarmeCooldown: 10,      // segundos antes de poder reusar o mesmo posto
};

// ---------- ESTADO ----------
let scene, camera, renderer, clock;
let player, playerGroup;
let mixerTimeAcc = 0;
let velocity = new THREE.Vector3();
let onGround = true;
let verticalVel = 0;

let lastDt = 0.016;
let bombTime = CONFIG.bombStart;
let stopTimer = 0;
let obstacleHits = 0;
let obstacleHitCooldown = 0;
let currentSpeed = 0;
let gameRunning = false;
let gameOver = false;

const keys = { w:false, a:false, s:false, d:false, shift:false, space:false };

let obstacles = [];   // {mesh, box}
let npcs = [];         // {mesh, type, speed, dir, box}
let desarmePosts = [];  // {mesh, pos, cooldownUntil}
let powerupItems = []; // {mesh, type, pos}
let coinItems = [];    // {mesh, collected, baseY}
let extractionPoint = null;
let extractionMesh = null;

let activePowerups = { energetico: 0, escudo: 0 };
let shieldCount = 0;
let coinsCollected = 0;
let score = 0;

let particles = [];
