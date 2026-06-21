extends Node3D

@export var enemy_scene: PackedScene
@export var spawn_count: int = 5
@export var spawn_radius: float = 10.0

func _ready():
	if enemy_scene:
		for i in range(spawn_count):
			var spawn_pos = Vector3(
				randf_range(-spawn_radius, spawn_radius),
				1.0, # Altura fixa para evitar que caia no limbo ou nasça embaixo do chão
				randf_range(-spawn_radius, spawn_radius)
			)
			var enemy_instance = enemy_scene.instantiate()
			enemy_instance.global_position = spawn_pos
			add_child(enemy_instance)
