# Lumen Drift - Godot Setup & Deployment Guide

## 1. Node Tree Structure
To use the `Player.gd` script, set up your player scene in the Godot Editor exactly like this:
```text
Player (CharacterBody2D) - Attach Player.gd here
 ├── CollisionShape2D
 ├── Sprite2D (Your player texture)
 ├── AnimationPlayer (Add animations: "idle", "run", "jump", "slide", "dash")
 └── Trail (Line2D) 
     └── Make sure to assign the `gradient` and `texture` in inspector, or let the script set them!
```

**WorldEnvironment Setup:**
Add a `WorldEnvironment` node to your main level. Enable the **Glow** effect, set Blend Mode to *Additive*, and tweak Bloom threshold to make your cyan particle trail "pop" like neon.

## 2. Project Settings for Old Gen Laptops
In `Project -> Project Settings`, apply these optimizations for absolute maximum FPS on low-end hardware:
- **Rendering -> Rendering Method:** Set both Desktop and Mobile to `GL Compatibility` (GLES3/WebGL2 backend).
- **Rendering -> Textures -> VRAM Compression:** Enable `Import ETC2 ASTC` and `Import S3TC BPTC`.
- **Rendering -> 2D -> Use Pixel Snap:** `On` (helps prevent pixel jitter on low resolution).
- **Display -> Window -> VSync:** Set V-Sync Mode to `Disabled` or `Adaptive` to prevent input latency.
- **Physics -> 2D:** Ensure `Default Gravity` is roughly `980` to `1200`.

## 3. Communication & Signals
Godot relies on the Observer pattern via **Signals**. This loosely couples the systems so they are flexible.
* **GameManager (Autoload):** Acts as the signal bus. If a player hits a Chime, the Chime script calls `GameManager.interact_environment("chime")`.
* **SoundSystem:** An independent audio node connects to the `GameManager.environment_interacted` signal to play sounds without needing a reference to the actual Chime or Player.

## 4. Languages and Virtual Environments
* **Languages:** This project uses **GDScript**, Godot’s native, Python-like language optimized specifically for readability and Engine hooks. You can also use C#.
* **Running in a Virtual Environment:** 
  Godot is a completely standalone/portable binary. You do **not** need a Python-style `venv`.
  If you specifically want hardware virtualization (e.g., Windows virtualized inside Linux or macOS):
  1. Install VirtualBox, VMware, or WSL2.
  2. Set up a Windows or Linux guest OS. Enable 3D Hardware Acceleration in the VM settings (crucial for OpenGL).
  3. Download the standalone Godot Engine into the VM and run it natively. The entire game remains self-contained.

## 5. Migrating to a Live Platform (Deployment)
When you conquer the bugs, deploy to live platforms:
### HTML5 (Web / itch.io)
1. Go to **Project -> Export**.
2. Download the Export Templates if prompted.
3. Add **Web** as a preset.
4. Export the project to an `index.html` file and an associated `.wasm`/.`pck` package.
5. Zip these files and upload them to itch.io (mark as "Played in the browser").
### PC/Steam
1. Go to **Project -> Export**.
2. Add **Windows Desktop**, **Linux**, or **macOS** presets.
3. Export the `.exe` and `.pck` files. Wrap them in a zip and upload directly to Steamworks.

## 6. How to get these files
* Download your web IDE workspace from AI Studio.
* Open the `godot_project` folder inside the Godot Editor.
* Press `F5` to play!
