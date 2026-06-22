// ---------- LÓGICA DA BOMBA ----------
function updateBombLogic(dt) {
  bombTime -= dt;
  obstacleHitCooldown = Math.max(0, obstacleHitCooldown - dt);

  let effectiveThreshold = CONFIG.speedThreshold;
  if (activePowerups.energetico > 0) effectiveThreshold *= 0.7; // correndo rápido, mais fácil ficar acima do limite

  if (currentSpeed < effectiveThreshold) {
    stopTimer += dt;
  } else {
    stopTimer = Math.max(0, stopTimer - dt*2);
  }

  // UI: cronômetro da bomba
  const timerBox = document.getElementById('timerBox');
  const timerVal = document.getElementById('timerValue');
  timerVal.textContent = Math.max(0, Math.ceil(bombTime));
  timerBox.classList.remove('warning','danger');
  if (bombTime <= 10) timerBox.classList.add('danger');
  else if (bombTime <= 25) timerBox.classList.add('warning');

  // UI: temporizador de parada
  const stopBox = document.getElementById('stopTimerBox');
  const stopVal = document.getElementById('stopValue');
  stopVal.textContent = stopTimer.toFixed(1)+'s';
  stopBox.classList.toggle('active', stopTimer > 0.3);

  // UI: risco por impactos em obstáculos
  const impactBox = document.getElementById('impactBox');
  const impactVal = document.getElementById('impactValue');
  impactVal.textContent = `${obstacleHits}/${CONFIG.maxObstacleHits}`;
  impactBox.classList.remove('warning','danger');
  if (obstacleHits >= CONFIG.maxObstacleHits) impactBox.classList.add('danger');
  else if (obstacleHits > 0) impactBox.classList.add('warning');

  // UI: barra de velocidade
  const maxSpeedRef = CONFIG.runSpeed * 1.6;
  const pct = THREE.MathUtils.clamp((currentSpeed/maxSpeedRef)*100, 0, 100);
  const speedBar = document.getElementById('speedBarInner');
  speedBar.style.width = pct+'%';
  speedBar.style.background = currentSpeed < effectiveThreshold
    ? 'linear-gradient(90deg, #ff5050, #ff8800)'
    : 'linear-gradient(90deg, #00e0ff, #00ff88)';
  document.getElementById('speedThreshold').style.left = ((effectiveThreshold/maxSpeedRef)*100)+'%';

  if (bombTime <= 0) {
    triggerExplosion('O cronômetro chegou a zero.');
    return;
  }
  if (stopTimer >= CONFIG.stopLimit) {
    triggerExplosion('Você ficou parado por tempo demais.');
  }
}

function registerObstacleHit() {
  if (gameOver || obstacleHitCooldown > 0) return;
  obstacleHits++;
  obstacleHitCooldown = 0.8;
  sfxHit();

  if (obstacleHits >= CONFIG.maxObstacleHits) {
    triggerExplosion('A bomba explodiu após dois impactos em obstáculos.');
  }
}
