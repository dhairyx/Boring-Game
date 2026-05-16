extends Area2D

signal goal_reached

func _ready() -> void:
    var col_shape = CollisionShape2D.new()
    var shape = RectangleShape2D.new()
    shape.size = Vector2(40, 40)
    col_shape.shape = shape
    add_child(col_shape)
    
    var visual = ColorRect.new()
    visual.name = "GoalVisual"
    visual.color = Color(0.2, 0.2, 0.2, 0.5) # Gray out until unlocked
    visual.size = Vector2(40, 40)
    visual.position = Vector2(-20, -20)
    add_child(visual)
    
    body_entered.connect(_on_body_entered)

func _process(_delta: float) -> void:
    # Continuously check if criteria are met to animate/color unlocked goal
    var active_lumens = get_tree().get_nodes_in_group("lumens")
    var visual = get_node("GoalVisual")
    if visual:
        if active_lumens.size() == 0:
            visual.color = Color(0.0, 0.95, 1.0, 0.5) # Active cyan
        else:
            visual.color = Color(0.2, 0.2, 0.2, 0.5) # Locked gray

func _on_body_entered(body: Node2D) -> void:
    # Ensure it's the player triggering the goal
    if "velocity" in body: # A quick duck-typing check to see if it's the Kinematic Player
        var active_lumens = get_tree().get_nodes_in_group("lumens")
        if active_lumens.size() == 0:
            emit_signal("goal_reached")
        else:
            print("Cannot progress: Collect all lumens first!")
            # Optional: Visual rejection feedback could be added here

