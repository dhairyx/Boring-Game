extends Control

signal next_level_requested

func _ready() -> void:
    if has_node("NextLevelButton"):
        $NextLevelButton.pressed.connect(_on_next_level_pressed)

func _on_next_level_pressed() -> void:
    emit_signal("next_level_requested")
