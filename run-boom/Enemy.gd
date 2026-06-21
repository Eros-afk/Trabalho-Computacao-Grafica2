extends CharacterBody3D

var speed: float

func _ready():
	speed = randf_range(1.0, 2.0)

var gravity = ProjectSettings.get_setting("physics/3d/default_gravity")

func _physics_process(delta):
	if not is_on_floor():
		velocity.y -= gravity * delta

	var player = get_tree().get_first_node_in_group("player")
	if player:
		var direction = (player.global_position - global_position).normalized()
		direction.y = 0 
		
		velocity.x = direction.x * speed
		velocity.z = direction.z * speed
		
		if direction.length_squared() > 0.001:
			var target_rotation = atan2(-direction.x, -direction.z)
			rotation.y = lerp_angle(rotation.y, target_rotation, 10.0 * delta)
			
	move_and_slide()

func _on_detection_area_body_entered(body):
	if body.is_in_group("player") and body.has_method("apply_slow"):
		body.apply_slow(0.05, 2.0)
