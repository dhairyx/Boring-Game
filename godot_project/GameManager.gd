extends Node
# GameManager.gd - Autoload Singleton
# Handles persistent game state and long-range system communication via signals.

signal lumen_collected(amount, total)
signal milestone_reached(milestone)
signal environment_interacted(obj_name)
signal game_over
signal game_loaded(current_level, total_lumens, lumens_state)

var total_lumens: int = 0
var current_level: int = 0
var lumens_state: Dictionary = {}
var milestones: Array = [10, 50, 100, 500]

const SAVE_FILE_PATH = "user://lumen_save.dat"

func _ready() -> void:
    print("GameManager initialized. Ready to receive signals.")
    # In Godot, you could prompt the UI to load, or check here
    if FileAccess.file_exists(SAVE_FILE_PATH):
        print("Save file exists. Available to load.")

func save_game() -> void:
    var save_dict = {
        "current_level": current_level,
        "total_lumens": total_lumens,
        "lumens_state": lumens_state
    }
    var file = FileAccess.open(SAVE_FILE_PATH, FileAccess.WRITE)
    if file:
        file.store_string(JSON.stringify(save_dict))
        file.close()
        print("Game saved successfully.")

func load_game() -> bool:
    if not FileAccess.file_exists(SAVE_FILE_PATH):
        return false
        
    var file = FileAccess.open(SAVE_FILE_PATH, FileAccess.READ)
    if file:
        var json_string = file.get_as_text()
        file.close()
        
        var json = JSON.new()
        var error = json.parse(json_string)
        if error == OK:
            var data = json.get_data()
            current_level = data.get("current_level", 0)
            total_lumens = data.get("total_lumens", 0)
            lumens_state = data.get("lumens_state", {})
            
            emit_signal("game_loaded", current_level, total_lumens, lumens_state)
            print("Game loaded successfully. Level: ", current_level, " Lumens: ", total_lumens)
            return true
    return false

func add_lumen(amount: int = 1) -> void:
    total_lumens += amount
    emit_signal("lumen_collected", amount, total_lumens)
    print("Total Lumens: ", total_lumens)
    
    # Check for milestones
    if milestones.size() > 0 and total_lumens >= milestones[0]:
        var reached = milestones.pop_front()
        emit_signal("milestone_reached", reached)

func register_lumen_collected(level_id: int, lumen_id: String) -> void:
    if not lumens_state.has(str(level_id)):
        lumens_state[str(level_id)] = []
    if not lumen_id in lumens_state[str(level_id)]:
        lumens_state[str(level_id)].append(lumen_id)
        save_game()

func interact_environment(obj_name: String) -> void:
    # Triggers a global interaction that other nodes (like SoundManager or UI) can listen to.
    emit_signal("environment_interacted", obj_name)
