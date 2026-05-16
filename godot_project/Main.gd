extends Node2D

var lumen_label: Label

func _ready() -> void:
    setup_parallax_background()
    setup_ui()
    spawn_goal()
    
    if has_node("/root/GameManager"):
        var gm = get_node("/root/GameManager")
        if FileAccess.file_exists(gm.SAVE_FILE_PATH):
            prompt_load_save()

func prompt_load_save() -> void:
    var canvas = get_node_or_null("CanvasLayer")
    if not canvas: return
    
    var panel = Panel.new()
    panel.name = "LoadPrompt"
    panel.set_anchors_preset(Control.PRESET_CENTER)
    panel.size = Vector2(300, 150)
    panel.position = Vector2(362, 225) # Approx center for 1024x600
    
    var label = Label.new()
    label.text = "Save file found.\nWould you like to load your progress?"
    label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    label.position = Vector2(20, 20)
    label.size = Vector2(260, 50)
    panel.add_child(label)
    
    var btn_yes = Button.new()
    btn_yes.text = "Load Game"
    btn_yes.position = Vector2(40, 90)
    btn_yes.size = Vector2(100, 40)
    btn_yes.pressed.connect(func():
        var gm = get_node("/root/GameManager")
        if gm.load_game():
            # Update UI or player based on loaded state if necessary
            _on_lumen_collected(0, gm.total_lumens)
        panel.queue_free()
    )
    panel.add_child(btn_yes)
    
    var btn_no = Button.new()
    btn_no.text = "New Game"
    btn_no.position = Vector2(160, 90)
    btn_no.size = Vector2(100, 40)
    btn_no.pressed.connect(func(): panel.queue_free())
    panel.add_child(btn_no)
    
    canvas.add_child(panel)

func spawn_goal() -> void:
    var goal_script = load("res://Goal.gd")
    if goal_script:
        var goal = Area2D.new()
        goal.set_script(goal_script)
        goal.position = Vector2(740, 300) # Mock position matching App.tsx level 1
        goal.name = "LevelGoal"
        add_child(goal)
        
        # Connect the dynamically attached script signal
        goal.connect("goal_reached", _on_goal_reached)

func _on_goal_reached() -> void:
    # Show Level Complete UI
    var ui_scene = load("res://LevelCompleteUI.tscn")
    if ui_scene:
        var ui_node = ui_scene.instantiate()
        ui_node.name = "LevelCompleteUI"
        
        # Connect the proceed button signal
        ui_node.connect("next_level_requested", _on_next_level_requested)
        
        var canvas = get_node_or_null("CanvasLayer")
        if canvas:
            canvas.add_child(ui_node)

func _on_next_level_requested() -> void:
    # For now, just reload the current scene or setup the next layout
    print("Transitioning to the next level...")
    get_tree().reload_current_scene()

func setup_ui() -> void:
    var canvas_layer = CanvasLayer.new()
    canvas_layer.name = "CanvasLayer"
    add_child(canvas_layer)
    
    lumen_label = Label.new()
    lumen_label.name = "LumenLabel"
    lumen_label.text = "LUMENS: 0"
    
    # Stylize the label using Artistic Flair theme colors (Cyan)
    lumen_label.add_theme_color_override("font_color", Color(0.0, 0.95, 1.0, 1.0))
    lumen_label.add_theme_color_override("font_shadow_color", Color(0.0, 0.0, 0.0, 1.0))
    lumen_label.add_theme_constant_override("shadow_offset_x", 1)
    lumen_label.add_theme_constant_override("shadow_offset_y", 1)
    
    # Scale and position
    lumen_label.position = Vector2(25, 25)
    lumen_label.scale = Vector2(2.0, 2.0)
    
    canvas_layer.add_child(lumen_label)
    
    # Instantiate the Pause Menu into the Canvas Layer
    var pause_script = load("res://PauseMenu.gd")
    if pause_script:
        var pause_node = Control.new()
        pause_node.set_script(pause_script)
        pause_node.name = "PauseMenu"
        canvas_layer.add_child(pause_node)
    
    # Connect to the GameManager singleton
    # (Assuming GameManager is registered as an Autoload in Godot Project Settings)
    if has_node("/root/GameManager"):
        var gm = get_node("/root/GameManager")
        gm.lumen_collected.connect(_on_lumen_collected)
        gm.game_over.connect(_on_game_over)

func _on_game_over() -> void:
    # Build System Failure (GameOver) UI instance
    var ui_script = load("res://GameOverUI.gd")
    if ui_script:
        var ui_node = Control.new()
        ui_node.set_script(ui_script)
        ui_node.name = "GameOverUI"
        
        var canvas = get_node_or_null("CanvasLayer")
        if canvas:
            canvas.add_child(ui_node)

func _on_lumen_collected(_amount: int, total: int) -> void:
    if is_instance_valid(lumen_label):
        lumen_label.text = "LUMENS: " + str(total)

func setup_parallax_background() -> void:
    # 1. Create the ParallaxBackground node
    var parallax_bg = ParallaxBackground.new()
    parallax_bg.name = "ParallaxBackground"
    add_child(parallax_bg)
    
    # 2. Create the ParallaxLayer node
    var parallax_layer = ParallaxLayer.new()
    parallax_layer.name = "ParallaxLayer"
    
    # The motion_scale controls the parallax effect. 
    # (0.1, 0.1) means it moves 10% as fast as the camera, placing it far in the background.
    parallax_layer.motion_scale = Vector2(0.1, 0.1)
    
    # motion_mirroring allows the texture to repeat infinitely.
    # We set this to match our 1024x1024 texture size.
    parallax_layer.motion_mirroring = Vector2(1024, 1024)
    parallax_bg.add_child(parallax_layer)
    
    # 3. Create the Sprite2D node and assign the starry texture
    var bg_sprite = Sprite2D.new()
    bg_sprite.name = "BackgroundSprite"
    var star_tex = load("res://star_bg.svg")
    bg_sprite.texture = star_tex
    
    # Disable centering so the sprite aligns perfectly with the layer's 0,0 origin for mirroring
    bg_sprite.centered = false 
    parallax_layer.add_child(bg_sprite)
