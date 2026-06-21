extends Area3D

@export var tempo_bonus: float = 15.0 # Quantos segundos concede
var coletado: bool = false

func _ready() -> void:
	# Garante a conexão do sinal de colisão por código
	body_entered.connect(_on_body_entered)

func _on_body_entered(body):
	# 1. Filtro Blindado: Verifica se o corpo é um CharacterBody3D e se possui 
	# a variável 'stamina' que o Christian criou no script do Player.
	if body is CharacterBody3D and "stamina" in body:
		
		# 2. Busca Híbrida da HUD (a mesma que funcionou perfeitamente na Bomba)
		var hud = get_tree().get_first_node_in_group("hud")
		if not hud:
			hud = get_tree().current_scene.find_child("Control", true, false)
		if not hud:
			hud = get_tree().current_scene.find_child("HUD", true, false)
			
		# 3. Aplica o bônus se a HUD foi encontrada
		if hud:
			hud.tempo_restante += 15.0 # Acessa direto a variável da Tay
			
			# 4. Feedback Visual: Procura o seu nó da Bomba dentro do jogador 
			# para disparar o textinho verde "+15s" no meio da tela.
			# ... (resto do código anterior continua igual)
		# ... (resto do código anterior continua idêntico)
		if hud:
			hud.tempo_restante += 15.0
			
			# Feedback Visual Corrigido: Passando um número (float) em vez de texto
			if body.has_node("Bomba"):
				body.get_node("Bomba").mostrar_bonus_tempo(15.0) 
			else:
				# Fallback de segurança caso o nó tenha outro nome no seu player de teste
				for filho in body.get_children():
					if filho.has_method("mostrar_bonus_tempo"):
						filho.mostrar_bonus_tempo(15.0) 
						break
						
		# 5. Mecânica de Uso Único: Remove o posto do mapa imediatamente
		queue_free()
