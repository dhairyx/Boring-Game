extends Control

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS # Prevents pause menu from freezing when tree is paused
    visible = false
    set_anchors_preset(PRESET_FULL_RECT)
    size = get_viewport_rect().size
    
    var bg = ColorRect.new()
    bg.color = Color(0.05, 0.05, 0.05, 0.8)
    bg.set_anchors_preset(PRESET_FULL_RECT)
    bg.size = size
    add_child(bg)
    
    var label = Label.new()
    label.text = "PAUSED"
    label.add_theme_color_override("font_color", Color(1.0, 1.0, 1.0, 1.0))
    label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 1))
    label.add_theme_font_size_override("font_size", 48)
    label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    label.set_anchors_preset(PRESET_CENTER)
    label.position = Vector2((size.x / 2.0) - 200, (size.y / 2.0) - 150)
    label.size = Vector2(400, 100)
    add_child(label)
    
    var btn_resume = Button.new()
    btn_resume.text = "RESUME"
    btn_resume.add_theme_font_size_override("font_size", 20)
    btn_resume.position = Vector2((size.x / 2.0) - 100, (size.y / 2.0) - 20)
    btn_resume.size = Vector2(200, 50)
    btn_resume.pressed.connect(toggle_pause)
    add_child(btn_resume)
    
    var btn_restart = Button.new()
    btn_restart.text = "RESTART LEVEL"
    btn_restart.add_theme_font_size_override("font_size", 20)
    btn_restart.position = Vector2((size.x / 2.0) - 100, (size.y / 2.0) + 40)
    btn_restart.size = Vector2(200, 50)
    btn_restart.pressed.connect(func():
        get_tree().paused = false
        get_tree().reload_current_scene()
    )
    add_child(btn_restart)
    
    var btn_menu = Button.new()
    btn_menu.text = "MAIN MENU"
    btn_menu.add_theme_font_size_override("font_size", 20)
    btn_menu.position = Vector2((size.x / 2.0) - 100, (size.y / 2.0) + 100)
    btn_menu.size = Vector2(200, 50)
    btn_menu.pressed.connect(func():
        get_tree().paused = false
        print("Returning to main menu...")
    )
    add_child(btn_menu)

func _input(event: InputEvent) -> void:
    if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
        toggle_pause()

func toggle_pause() -> void:
    var tree = get_tree()
    if tree:
        tree.paused = !tree.paused
        visible = tree.paused
