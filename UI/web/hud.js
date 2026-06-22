// ---------- HUD HELPERS ----------
function flashMsg(id) {
  const el = document.getElementById(id);
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=> el.classList.remove('show'), 1600);
}

function updatePowerupHUD(dt) {
  const map = { energetico: 'pwEnergetico', escudo: 'pwEscudo', adrenalina: 'pwAdrenalina' };

  if (activePowerups.energetico > 0) {
    activePowerups.energetico -= dt;
    if (activePowerups.energetico < 0) activePowerups.energetico = 0;
  }
  const eEl = document.getElementById('pwEnergetico');
  eEl.classList.toggle('active', activePowerups.energetico > 0);
  eEl.querySelector('.timer').textContent = activePowerups.energetico > 0 ? activePowerups.energetico.toFixed(1)+'s' : '';

  const sEl = document.getElementById('pwEscudo');
  sEl.classList.toggle('active', shieldCount > 0);
  sEl.querySelector('.timer').textContent = shieldCount > 0 ? 'x'+shieldCount : '';

  const aEl = document.getElementById('pwAdrenalina');
  aEl.classList.toggle('active', false);
}


// ---------- FIM DE JOGO ----------
function triggerExplosion(reason) {
  if (gameOver) return;
  gameOver = true;
  spawnExplosion(player.position.clone().add(new THREE.Vector3(0,1,0)));
  sfxExplosion();
  playerGroup.visible = false;
  showOverlay(false, reason);
}

function triggerWin() {
  if (gameOver) return;
  gameOver = true;
  sfxWin();
  showOverlay(true, `Você chegou à extração com ${Math.ceil(bombTime)}s restantes!`);
}

function showOverlay(won, sub) {
  const overlay = document.getElementById('overlay');
  const title = document.getElementById('overlayTitle');
  const subEl = document.getElementById('overlaySub');
  title.textContent = won ? 'EXTRAÍDO COM SUCESSO' : 'VOCÊ EXPLODIU';
  title.className = won ? 'win' : 'lose';
  subEl.textContent = sub;
  overlay.classList.add('show');
}

