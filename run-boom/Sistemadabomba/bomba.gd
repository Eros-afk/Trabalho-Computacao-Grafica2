extends Node

@export var limite_velocidade: float = 1.0 # Limite abaixo do qual o timer conta
@export var tempo_max_parado: float = 4.0  # Tempo máximo que pode ficar parado

var tempo_parado: float = 0.0
var player: CharacterBody3D = null
var hud: Node = null
var bobeou_dancou: bool = false

# Elementos da nossa interface dinâmica e estilizada
var timer_container: VBoxContainer = null
var label_timer_parado: Label = null
var barra_timer_parado: ProgressBar = null

func _ready() -> void:
	# Procura o Player automaticamente (assume que a Bomba será filha direta dele)
	player = get_parent() as CharacterBody3D
	if not player:
		push_warning("Bomba: Nó pai não é um CharacterBody3D. Certifique-se de colocá-lo dentro do Player no projeto final.")
	
	# Busca a HUD dinamicamente na cena ativa para evitar quebra de caminhos
	buscar_hud()

func _process(delta: float) -> void:
	if bobeou_dancou:
		return
		
	# Tenta reajustar a HUD caso ela demore a carregar no projeto principal
	if not hud:
		buscar_hud()
		return

	# 1. Puxa a velocidade do Player do Christian
	var velocidade_atual: float = 0.0
	if player:
		velocidade_atual = player.velocity.length()

	# 2. Atualiza a barra gráfica que a Tay desenhou
	if hud.has_method("atualizar_velocidade"):
		hud.atualizar_velocidade(velocidade_atual)

	# 3. Lógica do temporizador de parada (4 segundos) + Interface customizada
	if velocidade_atual < limite_velocidade:
		tempo_parado += delta
		
		# ATUALIZAÇÃO DO TIMER VISUAL BONITO:
		if timer_container and label_timer_parado and barra_timer_parado:
			timer_container.visible = true
			
			var tempo_restante = max(0.0, tempo_max_parado - tempo_parado)
			# Texto com o emoji de bomba e 1 casa decimal
			label_timer_parado.text = "💣 MOVA-SE! %.1fs" % tempo_restante
			
			# A barra aumenta gradativamente conforme o tempo parado chega perto do limite (4s)
			barra_timer_parado.value = tempo_parado
			
			# Força o reposicionamento em tempo real para evitar distorções
			ajustar_posicao_canto_inferior_direito()
	else:
		tempo_parado = 0.0 # Reset instantâneo se mover
		
		# ESCONDE O TIMER SE O PLAYER VOLTAR A SE MOVER:
		if timer_container:
			timer_container.visible = false

	# 4. Condições de derrota (Tempo parado atingido ou tempo geral zerado)
	var tempo_restante_hud = hud.get("tempo_restante") if "tempo_restante" in hud else 60.0
	
	if tempo_parado >= tempo_max_parado or tempo_restante_hud <= 0.0:
		disparar_derrota()

func buscar_hud() -> void:
	# Substitua a sua linha de captura da HUD por esta estrutura ultra-segura:
	hud = get_tree().get_first_node_in_group("hud")

	if not hud:
	# Fallback 1: Caso eles tenham esquecido o grupo, procura pelo nó "Control" (nome atual na branch)
		hud = get_tree().current_scene.find_child("Control", true, false)

	if not hud:
	# Fallback 2: Caso o Gustavo mude o nome do nó para "HUD" mais para frente
		hud = get_tree().current_scene.find_child("HUD", true, false)
	
	# Se achou a HUD e a nossa interface customizada ainda não foi criada, monta ela
	if hud and not timer_container:
		configurar_hud_dinamica()

# Cria, estiliza e injeta os nós visuais de forma 100% isolada
func configurar_hud_dinamica() -> void:
	# 1. Cria o VBoxContainer (gerenciador vertical do texto + barra)
	timer_container = VBoxContainer.new()
	timer_container.visible = false
	
	# 2. Cria o Label do Texto
	label_timer_parado = Label.new()
	label_timer_parado.text = ""
	
	# Aplica customizações de tema: Cor Vermelha Forte e fonte destacada
	label_timer_parado.add_theme_color_override("font_color", Color(0.9, 0.1, 0.1)) # Vermelho vivo
	label_timer_parado.add_theme_font_size_override("font_size", 22) # Tamanho nítido e bonito
	
	# Alinha o texto à direita para ficar visualmente alinhado com a quina da barra
	label_timer_parado.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	
	# 3. Cria a Barra de Progresso (ProgressBar)
	barra_timer_parado = ProgressBar.new()
	barra_timer_parado.max_value = tempo_max_parado
	barra_timer_parado.value = 0.0
	barra_timer_parado.show_percentage = false # Esconde o texto de "0%" padrão da engine
	barra_timer_parado.custom_minimum_size = Vector2(220, 10) # Largura de 220px e espessura de 10px
	
	# Estilização da barra preenchida (Vermelho Forte)
	var estilo_preenchimento = StyleBoxFlat.new()
	estilo_preenchimento.bg_color = Color(0.9, 0.1, 0.1)
	estilo_preenchimento.set_corner_radius_all(3) # Deixa os cantos levemente arredondados
	barra_timer_parado.add_theme_stylebox_override("fill", estilo_preenchimento)
	
	# Estilização do fundo da barra (Cinza escuro transparente para dar contraste)
	var estilo_fundo = StyleBoxFlat.new()
	estilo_fundo.bg_color = Color(0.15, 0.15, 0.15, 0.6)
	estilo_fundo.set_corner_radius_all(3)
	barra_timer_parado.add_theme_stylebox_override("background", estilo_fundo)
	
	# 4. Organiza a hierarquia: insere o texto e a barra dentro do container
	timer_container.add_child(label_timer_parado)
	timer_container.add_child(barra_timer_parado)
	
	# Injeta o bloco inteiro como filho da HUD da Tay em tempo de execução
	hud.add_child(timer_container)
	
	# Executa o posicionamento matemático inicial
	ajustar_posicao_canto_inferior_direito()

# NOVA FUNÇÃO: Faz o cálculo manual baseado no tamanho da janela (independe do nó da Tay)
func ajustar_posicao_canto_inferior_direito() -> void:
	if not timer_container:
		return
		
	# Pega o tamanho real da janela do jogo (no seu caso, 1152 x 648)
	var tamanho_janela = timer_container.get_viewport_rect().size
	
	# Especificações de tamanho do nosso painel
	var largura_alerta = 220.0
	var altura_estimada_alerta = 50.0 # Altura combinada aproximada do texto + barra + margem interna
	var margem_de_seguranca = 40.0
	
	# MATEMÁTICA DO CANTO INFERIOR DIREITO:
	# X = Largura total da tela - largura da barra - recuo da borda
	# Y = Altura total da tela - altura estimada do bloco - recuo da borda
	var posicao_x = tamanho_janela.x - largura_alerta - margem_de_seguranca
	var posicao_y = tamanho_janela.y - altura_estimada_alerta - margem_de_seguranca
	
	# Aplica diretamente na propriedade global de posição
	timer_container.position = Vector2(posicao_x, posicao_y)

func disparar_derrota() -> void:
	bobeou_dancou = true
	set_process(false) # Desliga o loop para não disparar duas vezes ou travar
	
	# Garante que todo o container do temporizador suma na tela de Game Over
	if timer_container:
		timer_container.visible = false
	
	# 1. Ativa primeiro a tela de derrota e sons da Tay
	if hud and hud.has_method("mostrar_derrota"):
		hud.mostrar_derrota()
	
	# 2. Instancia as partículas de explosão (2D) criadas pela Tay
	var cena_explosao = load("res://Explosao.tscn")
	if cena_explosao and hud:
		var instancia_explosao = cena_explosao.instantiate()
		
		# CORREÇÃO: Como a explosão é 2D, ela DEVE ser filha da HUD (que é Control/2D)
		hud.add_child(instancia_explosao)
		
		# 3. Pega a câmera 3D ativa para traduzir a posição do mundo 3D para a tela 2D
		var camera = get_viewport().get_camera_3d()
		if camera and player:
			# Transforma o Vector3 do Player em um Vector2 de tela
			var posicao_2d = camera.unproject_position(player.global_position)
			instancia_explosao.global_position = posicao_2d
		else:
			# Caso não ache a câmera por algum motivo, joga a explosão no centro do monitor
			instancia_explosao.global_position = get_viewport().get_visible_rect().size / 2
			
		# 4. Executa o efeito da Tay
		if instancia_explosao.has_method("explodir"):
			instancia_explosao.explodir()
			
	
# Função para exibir o bônus de tempo exatamente embaixo do timer principal (Cálculo Manual)
func mostrar_bonus_tempo(valor: float) -> void:
	# Procuramos a HUD principal da cena
	var hud_node = get_tree().current_scene.find_child("HUD", true, false)
	if not hud_node:
		return
	
	# Cria o Label dinamicamente
	var label_bonus = Label.new()
	label_bonus.text = "+" + str(int(valor)) + "s"
	
	# Estilização: Verde forte e alinhamento centralizado
	label_bonus.add_theme_color_override("font_color", Color.WHITE)
	label_bonus.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	
	# Faz o texto crescer uniformemente para os dois lados (esquerda e direita)
	label_bonus.grow_horizontal = Control.GROW_DIRECTION_BOTH
	
	# Adiciona o nó diretamente na HUD para ele poder aparecer na tela
	hud_node.add_child(label_bonus)
	
	# MÁGICA REVOLUCIONÁRIA: Pega o tamanho real da janela do jogo (ex: 1152x648)
	var tamanho_tela = label_bonus.get_viewport_rect().size
	
	# Posiciona o eixo X exatamente na metade da largura da tela (Centro Perfeito)
	label_bonus.position.x = tamanho_tela.x / 2
	
	# Empurra o texto para baixo no eixo Y (60 pixels) para ficar logo abaixo do "70.0s"
	label_bonus.position.y = 60 
	
	# Aguarda 1.5 segundos com o bônus brilhando na tela
	await get_tree().create_timer(1.5).timeout
	
	# Remove o texto da memória de forma segura
	if is_instance_valid(label_bonus):
		label_bonus.queue_free()
