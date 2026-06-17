extends GPUParticles2D

func _ready():
	amount = 100
	lifetime = 1.0
	one_shot = true
	explosiveness = 1.0
	emitting = false

func explodir():
	emitting = true
	await get_tree().create_timer(lifetime).timeout
	queue_free()
