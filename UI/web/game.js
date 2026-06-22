// ---------- GAME LOOP ----------
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  lastDt = dt;

  updateParticles(dt);

  if (!gameRunning || gameOver) {
    renderer.render(scene, camera);
    return;
  }

  updatePlayer(dt);
  updateNPCs(dt);
  updatePowerupsRotation(dt);
  updateBombLogic(dt);
  updateCamera();
  updatePowerupHUD(dt);
  checkCollisions();
  checkPickups();
  checkDesarmePosts();
  checkExtraction();
  updateDistanceHUD();

  renderer.render(scene, camera);
}

// ---------- RESET ----------
function resetGame() {
  // remove tudo dinâmico e reconstrói
  obstacles.forEach(o => scene.remove(o.mesh));
  npcs.forEach(n => scene.remove(n.mesh));
  desarmePosts.forEach(p => scene.remove(p.mesh));
  powerupItems.forEach(p => { if (!p.collected) scene.remove(p.mesh); });
  particles.forEach(p => scene.remove(p.mesh));
  obstacles = []; npcs = []; desarmePosts = []; powerupItems = []; particles = [];

  bombTime = CONFIG.bombStart;
  stopTimer = 0;
  obstacleHits = 0;
  obstacleHitCooldown = 0;
  currentSpeed = 0;
  shieldCount = 0;
  activePowerups = { energetico: 0, escudo: 0 };
  verticalVel = 0;
  onGround = true;
  gameOver = false;

  player.position.set(0,0,60);
  player.rotation.set(0,0,0);
  player.visible = true;

  setupObstacles();
  setupNPCs();
  setupDesarmePosts();
  setupPowerups();

  document.getElementById('overlay').classList.remove('show');
  gameRunning = true;
  clock.getDelta();
}

// ---------- START ----------
document.getElementById('startBtn').addEventListener('click', () => {
  ensureAudio();
  document.getElementById('startScreen').style.display = 'none';
  gameRunning = true;
});

document.getElementById('overlayBtn').addEventListener('click', () => {
  resetGame();
});

init();
animate();
