extends Control

@onready var titulo = $Titulo
@onready var botao_jogar = $BotaoJogar
@onready var instrucoes = $Instrucoes

func _ready():
	add_to_group("hud")
	var largura = get_viewport().size.x
	var altura = get_viewport().size.y
	
	# Titulo
	titulo.text = "	RunBoom"
	titulo.add_theme_font_size_override("font_size", 72)
	titulo.add_theme_color_override("font_color", Color.RED)
	titulo.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	titulo.set_size(Vector2(largura, 100))
	titulo.set_position(Vector2(0, altura * 0.2))
	
	# Botao jogar
	botao_jogar.text = "JOGAR"
	botao_jogar.set_size(Vector2(200, 60))
	botao_jogar.set_position(Vector2((largura - 200) / 2, altura * 0.5))
	botao_jogar.add_theme_font_size_override("font_size", 32)
	
	# Instrucoes
	instrucoes.text = "WASD para mover | SHIFT para correr | ESPAÇO para pular"
	instrucoes.add_theme_font_size_override("font_size", 16)
	instrucoes.add_theme_color_override("font_color", Color.WHITE)
	instrucoes.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	instrucoes.set_size(Vector2(largura, 50))
	instrucoes.set_position(Vector2(0, altura * 0.75))
	
	# Conecta o botao
	botao_jogar.pressed.connect(_on_botao_jogar_pressed)

func _on_botao_jogar_pressed():
	get_tree().change_scene_to_file("res://Map.tscn")
