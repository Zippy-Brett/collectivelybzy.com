# Blue Velocity — Godot source

This is the native Godot 4 project for Blue Velocity. Open `project.godot` in Godot and run the main scene. It builds its ocean, dolphin, HUD, obstacles, and collectible effects from the script, so there are no external art assets to manage.

## Controls

- **A / D** or **← / →**: steer
- **W / ↑**: boost
- **S / ↓**: brake
- **Space**: leap; tap again in mid-air to add a flip
- **Enter**: start or restart

Each dive gets a new random run seed, obstacle layout, and power-up mix. Three collisions end a run.

## Web export for itch.io

1. In Godot, install the matching export templates from **Editor → Manage Export Templates** if they are not already installed.
2. Add a **Web** export preset from **Project → Export**, choose a 1280×720 canvas, and export into a new `build/web` folder.
3. Zip the exported files with `index.html` at the root of the archive.
4. On itch.io, create a new project, choose **HTML** as the project kind, upload the ZIP, and enable **This file will be played in the browser**.

The exported Web build can also be copied to the site’s public assets once it is ready. The current site route has its own lightweight Canvas fallback so the public-site preview does not depend on a locally installed Godot export template.
