@tool
extends CharacterBody2D

enum State { PATROL, CHASE, ATTACK, WANDER, STUNNED }

@export var patrol_path: NodePath
var _path_points: Array[Vector2] = []
var _current_path_idx: int = 0

@export var current_state: State = State.PATROL
var patrol_direction: float = 1.0
var patrol_speed: float = 60.0
var chase_speed: float = 130.0
var gravity: float = 1200.0

var detect_radius: float = 250.0
var attack_radius: float = 35.0

var player_ref: Node2D = null
var attack_timer: float = 0.0
var stun_timer: float = 0.0
var wander_timer: float = 0.0

# Visual feedback
var visual: ColorRect
var eye: ColorRect
var particles: CPUParticles2D

func _ready() -> void:
    if Engine.is_editor_hint():
        return
        
    if not patrol_path.is_empty():
        var p_node = get_node_or_null(patrol_path)
        if p_node and p_node is Path2D and p_node.curve:
            var baked = p_node.curve.get_baked_points()
            var p_trans = p_node.global_transform
            for pt in baked:
                _path_points.append(p_trans * pt)
            if _path_points.size() > 0:
                global_position = _path_points[0]

    # Adding basic placeholder collision if not defined by the designer
    if get_child_count() == 0:
        var col = CollisionShape2D.new()
        var shape = RectangleShape2D.new()
        shape.size = Vector2(24, 24)
        col.shape = shape
        add_child(col)
    
    # Body Visual 
    visual = ColorRect.new()
    visual.size = Vector2(24, 24)
    visual.position = Vector2(-12, -12)
    visual.color = Color(0.4, 0.4, 0.4) # Grey default
    add_child(visual)
    
    # "Eye" visual to show facing direction & state intensity
    eye = ColorRect.new()
    eye.size = Vector2(8, 8)
    eye.position = Vector2(4, -4)
    eye.color = Color(0.0, 0.95, 1.0)
    visual.add_child(eye)
    
    # State Particle Feedback Emitter
    particles = CPUParticles2D.new()
    particles.emitting = false
    particles.amount = 16
    particles.lifetime = 0.6
    particles.one_shot = false
    particles.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
    particles.emission_rect_extents = Vector2(10, 10)
    particles.gravity = Vector2(0, -98)
    particles.scale_amount_min = 1.0
    particles.scale_amount_max = 3.0
    add_child(particles)
    
    add_to_group("enemies")

func _process(_delta: float) -> void:
    if Engine.is_editor_hint():
        queue_redraw()

func _draw() -> void:
    if Engine.is_editor_hint():
        # Editor-only placeholder shape
        var body_col = Color(0.4, 0.4, 0.4)
        var eye_col = Color(0.0, 0.95, 1.0)
        
        match current_state:
            State.CHASE:
                body_col = Color(0.8, 0.6, 0.0)
                eye_col = Color(1.0, 0.8, 0.0)
            State.ATTACK:
                body_col = Color(0.9, 0.1, 0.1)
                eye_col = Color(1.0, 1.0, 1.0)
            State.WANDER:
                body_col = Color(0.3, 0.4, 0.3)
                eye_col = Color(0.4, 0.9, 0.4)
            State.STUNNED:
                body_col = Color(0.2, 0.2, 0.8)
                eye_col = Color(0.1, 0.1, 0.4)
                
        draw_rect(Rect2(-12, -12, 24, 24), body_col)
        draw_rect(Rect2(4, -4, 8, 8), eye_col)
        
        # Dynamic Patrol Visual Indicator System
        if not patrol_path.is_empty():
            var p_node = get_node_or_null(patrol_path)
            if p_node and p_node is Path2D and p_node.curve:
                var baked = p_node.curve.get_baked_points()
                if baked.size() > 1:
                    var local_pts = PackedVector2Array()
                    # Transform global map paths into local vectors relative to the Enemy's location
                    for pt in baked:
                        local_pts.append(to_local(p_node.global_transform * pt))
                    draw_polyline(local_pts, Color(0.6, 0.0, 1.0, 0.8), 2.0, true)

func _physics_process(delta: float) -> void:
    if Engine.is_editor_hint():
        return
        
    if not is_instance_valid(player_ref):
        find_player()
        
    if not is_on_floor():
        velocity.y += gravity * delta
        
    match current_state:
        State.PATROL:
            process_patrol(delta)
        State.CHASE:
            process_chase(delta)
        State.ATTACK:
            process_attack(delta)
        State.WANDER:
            process_wander(delta)
        State.STUNNED:
            process_stunned(delta)
            
    # Update visuals
    if velocity.x != 0:
        eye.position.x = 4 if velocity.x > 0 else 12 # Flip eye based on direction relative to parent visual
        
    move_and_slide()

func find_player() -> void:
    var players = get_tree().get_nodes_in_group("player")
    if players.size() > 0:
        player_ref = players[0]
    else:
        var root = get_tree().current_scene
        if root and root.has_node("Player"):
            player_ref = root.get_node("Player")

func process_patrol(_delta: float) -> void:
    visual.color = visual.color.lerp(Color(0.4, 0.4, 0.4), 0.1) # Smoothly transition to grey
    eye.color = Color(0.0, 0.95, 1.0)
    particles.emitting = false
    
    if _path_points.size() > 1:
        var target_x = _path_points[_current_path_idx].x
        var dir = sign(target_x - global_position.x)
        
        # Move towards the designated Node waypoint if not tightly within threshold
        if abs(global_position.x - target_x) > 5.0:
            velocity.x = dir * patrol_speed
        else:
            velocity.x = 0
            _current_path_idx = (_current_path_idx + 1) % _path_points.size()
    else:
        # Fallback to physical wall-bouncing if no Path2D is piped in
        velocity.x = patrol_direction * patrol_speed
        if is_on_wall():
            patrol_direction *= -1.0
            
    # Randomly drift into WANDER if there is no explicit strict path
    if _path_points.size() <= 1 and randf() < 0.005:
        change_state(State.WANDER)
        
    if is_instance_valid(player_ref):
        var dist = global_position.distance_to(player_ref.global_position)
        if dist < detect_radius:
            change_state(State.CHASE)

func process_chase(_delta: float) -> void:
    visual.color = visual.color.lerp(Color(0.8, 0.6, 0.0), 0.1) # Yellow warning pulse
    eye.color = Color(1.0, 0.8, 0.0)
    
    # Yellow speed lines during chase
    particles.emitting = true
    particles.color = Color(1.0, 0.8, 0.0, 0.6)
    particles.gravity = Vector2(-sign(velocity.x) * 200, 0)
    
    if is_instance_valid(player_ref):
        var dist = global_position.distance_to(player_ref.global_position)
        
        if dist > detect_radius * 1.3: # Hysteresis to avoid rapid toggling
            change_state(State.PATROL)
        elif dist <= attack_radius:
            change_state(State.ATTACK)
        else:
            var dir = sign(player_ref.global_position.x - global_position.x)
            if dir != 0:
                velocity.x = dir * chase_speed
    else:
        change_state(State.PATROL)

func process_attack(delta: float) -> void:
    velocity.x = move_toward(velocity.x, 0, 800 * delta) # Stop moving
    visual.color = visual.color.lerp(Color(0.9, 0.1, 0.1), 0.2) # Red danger
    eye.color = Color(1.0, 1.0, 1.0)
    
    # Red hostility burst
    particles.emitting = true
    particles.color = Color(0.9, 0.1, 0.1, 0.8)
    particles.gravity = Vector2(0, -200)
    
    attack_timer -= delta
    if attack_timer <= 0:
        # Attack Logic Burst (Visual Flash & Damage Check)
        visual.color = Color(1.0, 1.0, 1.0) # Flash white rapidly
        attack_timer = 1.0 # Attack Cooldown
        
        if is_instance_valid(player_ref):
            var dist = global_position.distance_to(player_ref.global_position)
            if dist <= attack_radius * 1.2:
                # Mock up damage to player:
                if player_ref.has_method("die"):
                    player_ref.die()
            else:
                change_state(State.CHASE)

func process_wander(delta: float) -> void:
    visual.color = visual.color.lerp(Color(0.3, 0.4, 0.3), 0.1) # Soft green/gray for idle wander
    eye.color = Color(0.4, 0.9, 0.4)
    particles.emitting = false
    
    wander_timer -= delta
    if wander_timer <= 0:
        # Pick new direction: -1, 0, or 1
        patrol_direction = round(randf_range(-1.0, 1.0))
        wander_timer = randf_range(1.5, 4.0)
        
    velocity.x = patrol_direction * (patrol_speed * 0.4) # Wander slower than patrol
    
    if is_on_wall():
        patrol_direction *= -1.0
        
    if is_instance_valid(player_ref):
        var dist = global_position.distance_to(player_ref.global_position)
        if dist < detect_radius:
            change_state(State.CHASE)

func process_stunned(delta: float) -> void:
    velocity.x = move_toward(velocity.x, 0, 1000 * delta) # Slide to halt
    
    # Stun visuals (cyan/blue flash)
    var stun_intensity = (sin(stun_timer * 30.0) + 1.0) / 2.0
    visual.color = Color(0.2, 0.2, 0.8).lerp(Color(0.8, 0.8, 1.0), stun_intensity)
    eye.color = Color(0.1, 0.1, 0.4)
    
    # Disorientation particles (electric blue flying upwards rapidly)
    particles.emitting = true
    particles.color = Color(0.0, 0.95, 1.0, 0.8)
    particles.gravity = Vector2(randf_range(-100, 100), -300)
    
    stun_timer -= delta
    if stun_timer <= 0:
        change_state(State.PATROL)

func hit_by_dash(force_direction: float) -> void:
    change_state(State.STUNNED)
    # Apply minor knockback
    velocity.x = force_direction * 400.0
    velocity.y = -200.0

func change_state(new_state: State) -> void:
    current_state = new_state
    if new_state == State.ATTACK:
        attack_timer = 0.3 # Initial startup "wind-up" before striking
    elif new_state == State.PATROL:
        patrol_direction = sign(velocity.x)
        if patrol_direction == 0:
            patrol_direction = 1.0
    elif new_state == State.WANDER:
        wander_timer = randf_range(1.0, 3.0)
    elif new_state == State.STUNNED:
        stun_timer = 2.5 # Stun lasts 2.5 seconds
