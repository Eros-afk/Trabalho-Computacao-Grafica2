extends Control

@onready var tempo_bomba = $TempoBomba
@onready var barra_velocidade = $BarraVelocidade
@onready var mensagem_derrota = $MensagemDerrota
@onready var mensagem_vitoria = $MensagemVitoria
@onready var label_velocidade = $LabelVelocidade
@onready var label_tempo_recorde = $LabelTempoRecorde
@onready var botao_reiniciar_derrota = $BotaoReiniciarDerrota
@onready var botao_reiniciar_vitoria = $BotaoReiniciarVitoria

var tempo_restante = 60.0
var som_tick = preload("res://Effects/tick.wav")
var som_explosao = preload("res://Effects/explosao.wav")
var som_vitoria = preload("res://Effects/vitoria.wav")
var player_audio: AudioStreamPlayer
var player_tick: AudioStreamPlayer
var iniciado = false
var tick_timer = 0.0
var jogo_encerrado = false

func _ready():
	player_audio = AudioStreamPlayer.new()
	add_child(player_audio)
	
	player_tick = AudioStreamPlayer.new()
	player_tick.volume_db = 5.0
	add_child(player_tick)
	
	barra_velocidade.min_value = 0
	barra_velocidade.max_value = 100
	barra_velocidade.value = 50
	
	mensagem_derrota.text = "💥 VOCÊ EXPLODIU!"
	mensagem_derrota.add_theme_font_size_override("font_size", 48)
	mensagem_derrota.add_theme_color_override("font_color", Color.RED)
	mensagem_derrota.visible = false
	
	mensagem_vitoria.text = "🏆 VOCÊ CHEGOU! PARABÉNS!"
	mensagem_vitoria.add_theme_font_size_override("font_size", 48)
	mensagem_vitoria.add_theme_color_override("font_color", Color.GREEN)
	mensagem_vitoria.visible = false
	
	# botoes de reiniciar - ficam escondidos ate o jogo acabar
	botao_reiniciar_derrota.text = "JOGAR NOVAMENTE"
	botao_reiniciar_derrota.add_theme_font_size_override("font_size", 24)
	botao_reiniciar_derrota.visible = false
	botao_reiniciar_derrota.pressed.connect(_on_botao_reiniciar_pressed)
	
	botao_reiniciar_vitoria.text = "JOGAR NOVAMENTE"
	botao_reiniciar_vitoria.add_theme_font_size_override("font_size", 24)
	botao_reiniciar_vitoria.visible = false
	botao_reiniciar_vitoria.pressed.connect(_on_botao_reiniciar_pressed)
	
	label_tempo_recorde.add_theme_font_size_override("font_size", 28)
	label_tempo_recorde.add_theme_color_override("font_color", Color.WHITE)
	label_tempo_recorde.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label_tempo_recorde.visible = false

func _process(delta):
	if not iniciado:
		inicializar_posicoes()
		iniciado = true
	
	if tempo_restante > 0 and not jogo_encerrado:
		tempo_restante -= delta
		tempo_bomba.text = "⏱ " + str(ceil(tempo_restante)) + "s"
		
		tick_timer += delta
		if tick_timer >= 0.4: #mexer no som do tick (fica + lento/rapido)
			tick_timer = 0.0
			player_tick.stream = som_tick
			player_tick.stop()
			player_tick.play()
		
		# cronometro fica vermelho nos ultimos 10 segundos
		if tempo_restante <= 10:
			tempo_bomba.add_theme_color_override("font_color", Color.RED)
	elif not jogo_encerrado:
		mostrar_derrota()

func inicializar_posicoes():
	var largura = get_viewport().size.x
	var altura = get_viewport().size.y
	
	tempo_bomba.add_theme_font_size_override("font_size", 32)
	tempo_bomba.add_theme_color_override("font_color", Color.WHITE)
	tempo_bomba.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tempo_bomba.set_size(Vector2(largura, 50))
	tempo_bomba.set_position(Vector2(0, 10))
	
	barra_velocidade.set_position(Vector2(20, 20))
	barra_velocidade.set_size(Vector2(200, 20))
	
	mensagem_derrota.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	mensagem_derrota.set_size(Vector2(largura, 100))
	mensagem_derrota.set_position(Vector2(0, altura * 0.45))
	
	mensagem_vitoria.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	mensagem_vitoria.set_size(Vector2(largura, 100))
	mensagem_vitoria.set_position(Vector2(0, altura * 0.3))
	
	botao_reiniciar_derrota.set_size(Vector2(320, 60))
	botao_reiniciar_derrota.set_position(Vector2((largura - 320) / 2, altura * 0.6))
	
	botao_reiniciar_vitoria.set_size(Vector2(320, 60))
	botao_reiniciar_vitoria.set_position(Vector2((largura - 320) / 2, altura * 0.65))
	
	label_velocidade.text = "Velocidade"
	label_velocidade.add_theme_color_override("font_color", Color.WHITE)
	label_velocidade.set_position(Vector2(20, 48))

func tocar_som(som):
	player_audio.stream = som
	player_audio.play()

func parar_tick():
	player_tick.stop()

# Para atualizar a barra de velocidade, chame esta função do script do Player
# Exemplo: $HUD.atualizar_velocidade(velocidade_atual)
func atualizar_velocidade(velocidade):
	barra_velocidade.value = velocidade

# Chame esta função quando a bomba explodir (Pedro Levi - script da Bomba)
# Exemplo: $HUD.mostrar_derrota()
func mostrar_derrota():
	if jogo_encerrado:
		return
	jogo_encerrado = true
	parar_tick()
	tocar_som(som_explosao)
	mensagem_derrota.visible = true
	botao_reiniciar_derrota.visible = true
	tempo_bomba.visible = false
	barra_velocidade.visible = false
	label_velocidade.visible = false

# Chame esta função quando o jogador chegar na delegacia (Gustavo - script do Mapa)
# Exemplo: $HUD.mostrar_vitoria()
func mostrar_vitoria():
	if jogo_encerrado:
		return
	jogo_encerrado = true
	parar_tick()
	tocar_som(som_vitoria)
	var tempo_usado = 60 - int(tempo_restante)
	label_tempo_recorde.text = "⏱ Seu tempo: " + str(tempo_usado) + " segundos"
	label_tempo_recorde.set_size(Vector2(get_viewport().size.x, 50))
	label_tempo_recorde.set_position(Vector2(0, get_viewport().size.y * 0.42))
	label_tempo_recorde.visible = true
	mensagem_vitoria.visible = true
	botao_reiniciar_vitoria.visible = true
	tempo_bomba.visible = false
	barra_velocidade.visible = false
	label_velocidade.visible = false

# reinicia o jogo voltando pro menu
func _on_botao_reiniciar_pressed():
	get_tree().change_scene_to_file("res://Menu.tscn")
