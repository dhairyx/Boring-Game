extends Control

func _ready() -> void:
    # Semi-transparent red/black background
    var bg = ColorRect.new()
    bg.color = Color(0.05, 0.0, 0.0, 0.9)
    bg.set_anchors_preset(PRESET_FULL_RECT)
    bg.size = get_viewport_rect().size
    add_child(bg)
    
    # "SYSTEM FAILURE" fall message
    var label = Label.new()
    label.text = "SYSTEM FAILURE"
    label.add_theme_color_override("font_color", Color(1.0, 0.2, 0.2, 1.0))
    label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 1))
    label.add_theme_font_size_override("font_size", 48)
    label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    label.set_anchors_preset(PRESET_CENTER)
    label.position = Vector2((bg.size.x / 2.0) - 200, (bg.size.y / 2.0) - 150)
    label.size = Vector2(400, 100)
    add_child(label)
    
    # Retry Level Button
    var btn_retry = Button.new()
    btn_retry.text = "RETRY LEVEL"
    btn_retry.add_theme_font_size_override("font_size", 20)
    btn_retry.position = Vector2((bg.size.x / 2.0) - 100, (bg.size.y / 2.0) - 20)
    btn_retry.size = Vector2(200, 50)
    btn_retry.pressed.connect(func(): get_tree().reload_current_scene())
    add_child(btn_retry)
    
    # New Game Button
    var btn_new = Button.new()
    btn_new.text = "NEW GAME"
    btn_new.add_theme_font_size_override("font_size", 20)
    btn_new.position = Vector2((bg.size.x / 2.0) - 100, (bg.size.y / 2.0) + 50)
    btn_new.size = Vector2(200, 50)
    btn_new.pressed.connect(func(): 
        var gm = get_node_or_null("/root/GameManager")
        if gm:
            gm.total_lumens = 0 # Reset progression parameters here
        get_tree().reload_current_scene()
    )
    add_child(btn_new)
    
    # Main Menu Button
    var btn_menu = Button.new()
    btn_menu.text = "MAIN MENU"
    btn_menu.add_theme_font_size_override("font_size", 20)
    btn_menu.position = Vector2((bg.size.x / 2.0) - 100, (bg.size.y / 2.0) + 120)
    btn_menu.size = Vector2(200, 50)
    btn_menu.pressed.connect(func(): 
        print("Returning to main menu... (Transition to Menu Scene here)")
        queue_free()
    )
    add_child(btn_menu)
