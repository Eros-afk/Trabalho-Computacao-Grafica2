extends CharacterBody3D

# --- Variáveis de Movimento Padrão ---
const WALK_SPEED = 5.0
const RUN_SPEED = 10.0 # Velocidade ao correr
const JUMP_VELOCITY = 6

var base_speed = WALK_SPEED
var speed_multiplier = 2.0
var current_speed = WALK_SPEED


# --- Variáveis do Dash ---
const DASH_SPEED = 18.0
const DASH_DURATION = 0.2
var is_dashing = false
var dash_timer = 0.0
var dash_direction = Vector3.ZERO
var can_dash = true
const DASH_STAMINA_COST = 30.0 # Quanto de stamina gasta por Dash

# --- Variáveis de Stamina ---
const MAX_STAMINA = 100.0
var stamina = 100.0
const STAMINA_DRAIN = 25.0 # Quanto gasta por segundo correndo
const STAMINA_REGEN = 15.0 # Quanto recupera por segundo parado/andando
const REGEN_DELAY = 1.0 # Tempo de espera (em segundos) sem correr para voltar a regenerar
var regen_timer = 0.0
var is_exhausted = false # Se a stamina zerar, impede o jogador de correr até ela subir um pouco

# --- Referências de Nós ---
const MOUSE_SENSITIVITY = 0.003
@onready var camera_pivot = $CameraPivot
@onready var visual_model = $Visual

# Referência ao HUD via grupo (a cena de HUD precisa ter add_to_group("hud") no _ready)
var hud = null

var gravity = ProjectSettings.get_setting("physics/3d/default_gravity")

func _ready():
	add_to_group("player")
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	hud = get_tree().get_first_node_in_group("hud")
	if hud:
		hud.atualizar_velocidade(stamina)

func _unhandled_input(event):
	if event.is_action_pressed("ui_cancel"):
		if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
			Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		else:
			Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)

	if event is InputEventMouseMotion and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		camera_pivot.rotate_y(-event.relative.x * MOUSE_SENSITIVITY)

func _physics_process(delta):
	# --- GERENCIAMENTO DE STAMINA ---
	var input_dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	var is_moving = input_dir != Vector2.ZERO

	# Verifica se o jogador quer e PODE correr (Apertando Shift, se movendo, no chão e não exausto)
	var is_running = Input.is_action_pressed("run") and is_moving and is_on_floor() and not is_exhausted

	if is_running:
		base_speed = RUN_SPEED
		stamina -= STAMINA_DRAIN * delta
		regen_timer = REGEN_DELAY # Reseta o tempo de espera para regenerar

		if stamina <= 0:
			stamina = 0
			is_exhausted = true # Entra em estado de exaustão
	else:
		base_speed = WALK_SPEED
		
	current_speed = base_speed * speed_multiplier

	# Diminui o cronômetro de espera para regenerar
	if regen_timer > 0:
		regen_timer -= delta
	else:
		# Começa a recuperar a stamina após o delay
		stamina += STAMINA_REGEN * delta
		if stamina > MAX_STAMINA:
			stamina = MAX_STAMINA

	# Se recuperou pelo menos 20% da stamina, sai do estado de exaustão
	if is_exhausted and stamina >= 20.0:
		is_exhausted = false

	# Atualiza a barra de stamina no HUD
	if hud:
		hud.atualizar_velocidade(stamina)

	# --- MOVIMENTAÇÃO FÍSICA ---
	if is_on_floor():
		can_dash = true

	if not is_on_floor() and not is_dashing:
		velocity.y -= gravity * delta

	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y = JUMP_VELOCITY

	var direction = (camera_pivot.global_transform.basis * Vector3(input_dir.x, 0, input_dir.y))
	direction.y = 0
	direction = direction.normalized()

	# Lógica do Dash (Gasta stamina também!)
	if Input.is_action_just_pressed("dash") and not is_dashing and can_dash and stamina >= DASH_STAMINA_COST:
		is_dashing = true
		can_dash = false
		stamina -= DASH_STAMINA_COST
		regen_timer = REGEN_DELAY # Dash também reseta o tempo de espera da regeneração
		dash_timer = DASH_DURATION

		if direction:
			dash_direction = direction
		else:
			dash_direction = -camera_pivot.global_transform.basis.z
			dash_direction.y = 0
			dash_direction = dash_direction.normalized()

	# Aplicar velocidades
	if is_dashing:
		dash_timer -= delta
		if dash_timer <= 0:
			is_dashing = false
		else:
			velocity.x = dash_direction.x * DASH_SPEED
			velocity.z = dash_direction.z * DASH_SPEED
			velocity.y = 0
	else:
		if direction:
			velocity.x = direction.x * current_speed
			velocity.z = direction.z * current_speed

			var target_rotation = atan2(-direction.x, -direction.z)
			visual_model.rotation.y = lerp_angle(visual_model.rotation.y, target_rotation, 10.0 * delta)
		else:
			velocity.x = move_toward(velocity.x, 0, current_speed)
			velocity.z = move_toward(velocity.z, 0, current_speed)

	move_and_slide()

func apply_slow(amount: float, duration: float):
	speed_multiplier = max(0.1, speed_multiplier - amount)
	await get_tree().create_timer(duration).timeout
	speed_multiplier = min(1.0, speed_multiplier + amount)
