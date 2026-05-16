extends CharacterBody2D

signal wall_hit
signal dash_used
signal state_changed(new_state)

const SPEED = 250.0
const JUMP_VELOCITY = -450.0
const WALL_SLIDE_SPEED = 120.0
const DASH_SPEED = 700.0
const DASH_DURATION = 0.2
const MOMENTUM_MULTIPLIER = 1.3
const FRICTION = 1000.0
const ACCELERATION = 1400.0
const GRAVITY = 1200.0

var is_dashing: bool = false
var dash_timer: float = 0.0
var coyote_timer: float = 0.0
var jump_buffer_timer: float = 0.0
var dash_buffer_timer: float = 0.0
var dash_buffer_dir: float = 0.0
var can_dash: bool = true
var max_jumps: int = 2
var jumps_left: int = 2

var max_health: int = 100
var current_health: int = 100
var health_bar: ProgressBar

var current_state: String = "idle"

@onready var trail: Line2D = $Trail
@onready var anim_player: AnimationPlayer = $AnimationPlayer
@onready var sprite: Sprite2D = $Sprite2D

var max_trail_points: int = 15
var spawn_position: Vector2

func _ready() -> void:
    spawn_position = global_position
    
    # Initialize Health Bar UI Elements
    health_bar = ProgressBar.new()
    health_bar.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
    health_bar.position = Vector2(-20, -30)
    health_bar.size = Vector2(40, 6)
    health_bar.show_percentage = false
    health_bar.max_value = max_health
    health_bar.value = current_health
    
    # Style the health bar
    var sb_fill = StyleBoxFlat.new()
    sb_fill.bg_color = Color(0.9, 0.2, 0.2, 1.0) # Red
    health_bar.add_theme_stylebox_override("fill", sb_fill)
    
    var sb_bg = StyleBoxFlat.new()
    sb_bg.bg_color = Color(0.2, 0.2, 0.2, 0.8) # Dark
    health_bar.add_theme_stylebox_override("background", sb_bg)
    
    add_child(health_bar)
    
    # Visual enhancement for the neon trail using a texture and gradient
    trail.width = 12.0
    var gradient = Gradient.new()
    gradient.add_point(0, Color(0, 1, 1, 0)) # Fades out (Transparent Cyan)
    gradient.add_point(1, Color(0, 1, 1, 1)) # Solid Cyan at the player end
    trail.gradient = gradient
    
    # Load the particle texture to give it a neon glow over the Line2D
    trail.texture = preload("res://particle.svg")
    trail.texture_mode = Line2D.LINE_TEXTURE_STRETCH

func _physics_process(delta: float) -> void:
    handle_timers(delta)
    handle_movement(delta)
    handle_trail()
    update_state_machine()
    
    var was_on_wall = is_on_wall()
    move_and_slide()
    check_enemy_collisions()
    
    # Fall death registration out of bounds
    if global_position.y > 1500:
        die()
    
    # Trigger signal when making contact with a wall
    if not was_on_wall and is_on_wall():
        emit_signal("wall_hit")

func check_enemy_collisions() -> void:
    for i in range(get_slide_collision_count()):
        var collision = get_slide_collision(i)
        var collider = collision.get_collider()
        if collider and collider.is_in_group("enemies"):
            if is_dashing:
                if collider.has_method("hit_by_dash"):
                    var force_dir = sign(velocity.x)
                    if force_dir == 0: force_dir = sprite.scale.x
                    collider.hit_by_dash(force_dir)
            else:
                # Apply knockback to prevent stacked damage over frames
                var dir = global_position.direction_to(collider.global_position).x
                var knockback_dir = -sign(dir) if dir != 0 else -1.0
                velocity.y = -350
                velocity.x = knockback_dir * 400
                take_damage(25)

func take_damage(amount: int) -> void:
    current_health -= amount
    if current_health < 0:
        current_health = 0
    if health_bar:
        health_bar.value = current_health
        
    # Visual feedback for damage
    sprite.modulate = Color(1.0, 0.0, 0.0, 1.0)
    var tween = create_tween()
    if tween:
        tween.tween_property(sprite, "modulate", Color(1, 1, 1, 1), 0.3)
        
    if current_health <= 0:
        die()

func handle_timers(delta: float) -> void:
    if is_on_floor():
        coyote_timer = 0.15 # 150ms coyote time
        can_dash = true
        jumps_left = max_jumps
    else:
        coyote_timer -= delta
        
    jump_buffer_timer -= delta
    dash_buffer_timer -= delta
    
    if is_dashing:
        dash_timer -= delta
        if dash_timer <= 0:
            is_dashing = false
            # Cut speed down post-dash to retain momentum but stop rapid dash movement
            velocity.x = sign(velocity.x) * SPEED 
            
            # Fade out dash glow
            var tween = create_tween()
            tween.tween_property(sprite, "modulate", Color(1, 1, 1, 1), 0.3)

func handle_movement(delta: float) -> void:
    var direction = Input.get_axis("ui_left", "ui_right")
    
    # Dash mechanic
    if Input.is_action_just_pressed("dash"):
        dash_buffer_timer = 0.15 # Buffer dash for 150ms
        dash_buffer_dir = direction
        
    if dash_buffer_timer > 0 and can_dash and not is_dashing:
        start_dash(dash_buffer_dir)
        dash_buffer_timer = 0.0
    
    if is_dashing:
        velocity.y = 0 # Freeze gravity during dash
        var dash_dir = direction if direction != 0 else sprite.scale.x
        velocity.x = dash_dir * DASH_SPEED
        return
        
    # Gravity and Wall Slide
    if not is_on_floor():
        if is_on_wall() and velocity.y > 0 and direction != 0:
            # Player is holding against the wall, slide down slowly
            velocity.y = min(velocity.y + GRAVITY * delta, WALL_SLIDE_SPEED)
            jumps_left = max_jumps # Reset jumps when wall sliding
        else:
            velocity.y += GRAVITY * delta

    # Jump buffering
    if Input.is_action_just_pressed("ui_up"):
        jump_buffer_timer = 0.1 # Buffer jump for 100ms
        
    # Jump Execution (Ground, Wall, Double)
    if jump_buffer_timer > 0:
        if is_on_wall() and not is_on_floor():
            var wall_normal = get_wall_normal()
            velocity.y = JUMP_VELOCITY * 1.1
            velocity.x = wall_normal.x * SPEED * 2.5
            jump_buffer_timer = 0.0
            jumps_left = max_jumps - 1
        elif coyote_timer > 0:
            velocity.y = JUMP_VELOCITY
            jump_buffer_timer = 0.0
            coyote_timer = 0.0
            jumps_left = max_jumps - 1
        elif jumps_left > 0:
            velocity.y = JUMP_VELOCITY * 0.9 # Double jump
            jump_buffer_timer = 0.0
            jumps_left -= 1

    # Momentum and Friction
    if direction != 0:
        # Give the player "weight" by moving toward max speed progressively
        velocity.x = move_toward(velocity.x, direction * SPEED, ACCELERATION * delta)
        sprite.scale.x = sign(direction)
    else:
        # Gradually slow down (drift) when no input is provided
        velocity.x = move_toward(velocity.x, 0, FRICTION * delta)

func start_dash(dir: float) -> void:
    is_dashing = true
    dash_timer = DASH_DURATION
    can_dash = false
    var dash_dir = dir if dir != 0 else sprite.scale.x
    velocity.x = dash_dir * DASH_SPEED * MOMENTUM_MULTIPLIER
    
    # White flare/glow effect at the start of the dash
    sprite.modulate = Color(3.0, 3.0, 3.0, 1.0)
    
    emit_signal("dash_used")

func handle_trail() -> void:
    # Add points to the neon line to follow the player
    trail.add_point(global_position)
    # Ensure it doesn't grow infinitely and hurt performance
    if trail.get_point_count() > max_trail_points:
        trail.remove_point(0)

func die() -> void:
    var gm = get_node_or_null("/root/GameManager")
    if gm:
        gm.emit_signal("game_over")
    
    # Properly handle game over scenarios by resetting the player's position and state
    respawn()
    
    # Optionally, we leave physics paused until the player clicks retry on a game over UI,
    # but the prompt asks to reset position and state when die is called.
    # To properly handle the standard game over scenario, we disable physics/visibility
    # here so the player is ready, but frozen until the game restarts.
    set_physics_process(false)
    sprite.visible = false

func respawn() -> void:
    global_position = spawn_position
    velocity = Vector2.ZERO
    is_dashing = false
    can_dash = true
    jumps_left = max_jumps
    coyote_timer = 0.0
    jump_buffer_timer = 0.0
    dash_buffer_timer = 0.0
    dash_timer = 0.0
    current_state = "idle"
    current_health = max_health
    if health_bar:
        health_bar.value = current_health
        
    if trail:
        trail.clear_points()
    
    # Re-enable the player in case it was previously disabled
    set_physics_process(true)
    sprite.visible = true
    
    # Add a visual flash to indicate respawn
    sprite.modulate = Color(1.0, 0.2, 0.2, 1.0)
    var tween = create_tween()
    if tween:
        tween.tween_property(sprite, "modulate", Color(1, 1, 1, 1), 0.5)

func update_state_machine() -> void:
    var new_state = "idle"
    if is_dashing:
        new_state = "dash"
    elif is_on_wall() and not is_on_floor() and velocity.y > 0 and Input.get_axis("ui_left", "ui_right") != 0:
        new_state = "slide"
    elif not is_on_floor():
        new_state = "jump"
    elif abs(velocity.x) > 10:
        new_state = "run"
        
    if new_state != current_state:
        current_state = new_state
        # Play the animation based on state
        anim_player.play(current_state)
        emit_signal("state_changed", current_state)
