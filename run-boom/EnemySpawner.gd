extends Node3D

@export var enemy_scene: PackedScene
@export var spawn_count: int = 8
@export var spawn_area: Vector2 = Vector2(34.0, 38.0)

func _ready():
	if enemy_scene:
		for i in range(spawn_count):
			var spawn_pos = Vector3(
				randf_range(-spawn_area.x, spawn_area.x),
				15.0, # Caindo do céu para evitar nascer preso em objetos
				randf_range(-spawn_area.y, spawn_area.y)
			)
			var enemy_instance = enemy_scene.instantiate()
			enemy_instance.global_position = spawn_pos
			add_child(enemy_instance)
