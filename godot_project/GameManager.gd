extends Node
# GameManager.gd - Autoload Singleton
# Handles persistent game state and long-range system communication via signals.

signal lumen_collected(amount, total)
signal milestone_reached(milestone)
signal environment_interacted(obj_name)
signal game_over

var total_lumens: int = 0
var milestones: Array = [10, 50, 100, 500]

func _ready() -> void:
    print("GameManager initialized. Ready to receive signals.")

func add_lumen(amount: int = 1) -> void:
    total_lumens += amount
    emit_signal("lumen_collected", amount, total_lumens)
    print("Total Lumens: ", total_lumens)
    
    # Check for milestones
    if milestones.size() > 0 and total_lumens >= milestones[0]:
        var reached = milestones.pop_front()
        emit_signal("milestone_reached", reached)

func interact_environment(obj_name: String) -> void:
    # Triggers a global interaction that other nodes (like SoundManager or UI) can listen to.
    emit_signal("environment_interacted", obj_name)
