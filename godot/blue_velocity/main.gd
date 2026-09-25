extends Node3D

const LANES := [-6.0, -3.0, 0.0, 3.0, 6.0]
const OCEAN := Color("08718a")
const LIME := Color("d8fb78")
var rng := RandomNumberGenerator.new()
var dolphin: Node3D
var camera: Camera3D
var world: Node3D
var hud: Label
var toast: Label
var distance := 0.0
var score := 0.0
var speed := 12.0
var lane := 0.0
var jump_left := 0.0
var jump_height := 0.0
var hull := 0
var next_spawn := 30.0
var run_seed := 0
var active := false
var boost_left := 0.0
var toast_left := 0.0
var space_was_down := false
var trick_count := 0

func _ready() -> void:
	rng.randomize()
	_make_world()
	_make_dolphin()
	_make_ui()
	_show_intro()

func _make_world() -> void:
	world = Node3D.new()
	world.name = "ProceduralOcean"
	add_child(world)
	var env := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_SKY
	environment.sky = Sky.new()
	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color("087e91")
	sky_mat.sky_horizon_color = Color("72d2be")
	sky_mat.ground_bottom_color = Color("04152c")
	sky_mat.ground_horizon_color = Color("126075")
	environment.sky.sky_material = sky_mat
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("77cad0")
	environment.ambient_light_energy = 0.55
	environment.fog_enabled = true
	environment.fog_light_color = Color("08718a")
	environment.fog_density = 0.006
	env.environment = environment
	add_child(env)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-48, -22, 0)
	sun.light_color = Color("b9ffe5")
	sun.light_energy = 1.4
	add_child(sun)
	var sea := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(260, 260)
	sea.mesh = plane
	sea.position = Vector3(0, -12, -105)
	sea.rotation_degrees.x = -90
	var water := StandardMaterial3D.new()
	water.albedo_color = Color("082d51")
	water.roughness = 0.32
	water.metallic = 0.16
	water.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
	sea.material_override = water
	world.add_child(sea)
	# A blue horizon and moving flecks make the otherwise endless world feel deep.
	for i in 100:
		var mote := MeshInstance3D.new()
		var sphere := SphereMesh.new()
		sphere.radius = rng.randf_range(0.025, 0.09)
		sphere.height = sphere.radius * 2.0
		mote.mesh = sphere
		mote.position = Vector3(rng.randf_range(-24, 24), rng.randf_range(-8, 9), rng.randf_range(-180, 8))
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.72, 1.0, 0.88, rng.randf_range(0.22, 0.7))
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		mote.material_override = mat
		world.add_child(mote)
		mote.set_meta("mote", true)

func _make_dolphin() -> void:
	dolphin = Node3D.new()
	dolphin.name = "Dolphin"
	add_child(dolphin)
	var body := SphereMesh.new()
	body.radius = 0.78
	body.height = 2.15
	_add_shape(dolphin, body, Vector3(0, 0, 0), Color("226c7a"), Vector3(0.7, 0.62, 1.65))
	var belly := SphereMesh.new()
	belly.radius = 0.62
	belly.height = 1.7
	_add_shape(dolphin, belly, Vector3(0, -0.25, -0.08), Color("d8e9d9"), Vector3(0.72, 0.5, 1.5))
	var beak := CylinderMesh.new()
	beak.top_radius = 0.04
	beak.bottom_radius = 0.24
	beak.height = 0.9
	_add_shape(dolphin, beak, Vector3(0, -0.05, -1.08), Color("286d7a"), Vector3(1, 0.45, 1))
	var fin := PrismMesh.new()
	fin.size = Vector3(0.65, 0.12, 0.8)
	_add_shape(dolphin, fin, Vector3(0.12, 0.66, 0.0), Color("113d51"), Vector3(0.6, 0.55, 1))
	var tail := PrismMesh.new()
	tail.size = Vector3(0.82, 0.12, 0.55)
	_add_shape(dolphin, tail, Vector3(0, -0.1, 1.15), Color("153e52"), Vector3(1, 0.45, 1))
	for side in [-1.0, 1.0]:
		var eye := SphereMesh.new()
		eye.radius = 0.075
		eye.height = 0.15
		_add_shape(dolphin, eye, Vector3(side * 0.54, 0.18, -0.58), Color("efffe7"), Vector3(1, 1, 0.5))
	camera = Camera3D.new()
	camera.position = Vector3(0, 4.5, 11.5)
	camera.rotation_degrees.x = -15
	camera.fov = 74
	camera.current = true
	dolphin.add_child(camera)

func _add_shape(parent: Node3D, mesh: Mesh, pos: Vector3, color: Color, scale: Vector3 = Vector3.ONE) -> MeshInstance3D:
	var part := MeshInstance3D.new()
	part.mesh = mesh
	part.position = pos
	part.scale = scale
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.37
	part.material_override = mat
	parent.add_child(part)
	return part

func _make_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	hud = Label.new()
	hud.position = Vector2(26, 20)
	hud.add_theme_font_size_override("font_size", 18)
	hud.add_theme_color_override("font_color", Color("e7fff1"))
	layer.add_child(hud)
	toast = Label.new()
	toast.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	toast.position.y = 92
	toast.add_theme_font_size_override("font_size", 22)
	toast.add_theme_color_override("font_color", LIME)
	layer.add_child(toast)
	var controls := Label.new()
	controls.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	controls.offset_left = 24
	controls.offset_bottom = -18
	controls.text = "A / D  STEER     SPACE  LEAP + TRICK     W  BOOST     S  BRAKE"
	controls.add_theme_color_override("font_color", Color("bbddd1"))
	layer.add_child(controls)
	_refresh_hud()

func _show_intro() -> void:
	toast.text = "BLUE VELOCITY   ·   Press ENTER to dive"
	toast.visible = true

func _start_run() -> void:
	run_seed = rng.randi_range(1000, 9999)
	distance = 0
	score = 0
	speed = 12
	hull = 0
	lane = 0
	jump_left = 0
	jump_height = 0
	space_was_down = false
	trick_count = 0
	next_spawn = 22
	boost_left = 0
	active = true
	for node in world.get_children():
		if node.has_meta("kind"):
			node.queue_free()
	toast.text = "RUN %04d   ·   FIND YOUR OWN CURRENT" % run_seed
	toast_left = 2.2

func _process(delta: float) -> void:
	if not active:
		if Input.is_key_pressed(KEY_ENTER):
			_start_run()
		return
	var steering := float(Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT)) - float(Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT))
	lane = clampf(lane + steering * delta * 8.0, -8.0, 8.0)
	var braking := Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN)
	var boosting := Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP)
	speed = move_toward(speed, 9.0 if braking else 25.0 if boosting else 13.0, delta * (20.0 if braking or boosting else 2.0))
	distance += speed * delta * 0.12
	score += speed * delta * 2.0
	dolphin.position.x = lerpf(dolphin.position.x, lane, delta * 5.5)
	dolphin.position.z -= speed * delta
	dolphin.rotation.z = lerpf(dolphin.rotation.z, -steering * 0.3, delta * 5)
	dolphin.rotation.x = sin(Time.get_ticks_msec() * 0.006) * 0.025
	var space_down := Input.is_key_pressed(KEY_SPACE)
	if space_down and not space_was_down:
		if jump_left <= 0:
			jump_left = 0.82
			trick_count = 0
		else:
			trick_count = mini(2, trick_count + 1)
	space_was_down = space_down
	var was_airborne := jump_left > 0
	jump_left = maxf(0, jump_left - delta)
	jump_height = sin((0.82 - jump_left) / 0.82 * PI) * 4.4 if jump_left > 0 else move_toward(jump_height, 0, delta * 10)
	if was_airborne and jump_left == 0 and trick_count > 0:
		score += 250.0 + trick_count * 150.0
		_say("DOUBLE BARREL   +550" if trick_count > 1 else "CLEAN FLIP   +400")
		trick_count = 0
	dolphin.position.y = jump_height
	for node in world.get_children():
		if node.has_meta("mote"):
			node.position.z += speed * delta
			if node.position.z > 12:
				node.position = Vector3(rng.randf_range(-22, 22), rng.randf_range(-8, 9), -190)
		elif node.has_meta("kind"):
			if absf(node.global_position.z - dolphin.global_position.z) < 1.8 and not node.get_meta("hit", false):
				_handle_encounter(node)
			if node.global_position.z > dolphin.global_position.z + 18:
				node.queue_free()
	next_spawn -= speed * delta
	if next_spawn < 0:
		_spawn_wave(-120.0 - rng.randf_range(0, 34))
		next_spawn = rng.randf_range(22, 38)
	if toast_left > 0:
		toast_left -= delta
		if toast_left <= 0:
			toast.text = ""
	_refresh_hud()

func _handle_encounter(item: Node3D) -> void:
	var kind: String = item.get_meta("kind")
	var dx := absf(item.global_position.x - dolphin.global_position.x)
	if kind == "ring":
		if dx < 1.2 and jump_height > 1.8:
			item.set_meta("hit", true)
			score += 650
			_say("RING THREAD   +650")
		return
	if dx > 1.5:
		return
	item.set_meta("hit", true)
	match kind:
		"surge":
			speed = minf(27, speed + 8)
			score += 180
			_say("CURRENT SURGE   +180")
		"silt":
			speed = maxf(7, speed - 5)
			_say("SILT CLOUD   ·   SLOWDOWN")
		"wreck", "reef", "net":
			if jump_height > 2.0:
				score += 35
				_say("CLEAN CLEAR   +35")
				return
			hull += 1
			speed = maxf(7, speed * 0.62)
			_say("HIT %d / 3   ·   %s" % [hull, "GHOST NET" if kind == "net" else "REEF" if kind == "reef" else "WRECK"])
			if hull >= 3:
				active = false
				toast.text = "DIVE COMPLETE   ·   %d M   ·   PRESS ENTER TO RETRY" % int(distance)

func _spawn_wave(z: float) -> void:
	var lane_x := LANES[rng.randi_range(0, LANES.size() - 1)]
	var roll := rng.randf()
	var kind := "wreck" if roll < 0.23 else "reef" if roll < 0.44 else "net" if roll < 0.61 else "ring" if roll < 0.76 else "surge" if roll < 0.9 else "silt"
	if kind == "ring":
		var ring := MeshInstance3D.new()
		var ring_mesh := TorusMesh.new()
		ring_mesh.inner_radius = 1.12
		ring_mesh.outer_radius = 1.28
		ring.mesh = ring_mesh
		ring.position = Vector3(lane_x, 2.2, z)
		_set_material(ring, LIME, 0.2, true)
		_add_obstacle(ring, "ring")
		return
	var obstacle := Node3D.new()
	obstacle.position = Vector3(lane_x, 0, z)
	match kind:
		"wreck":
			_add_shape(obstacle, BoxMesh.new(), Vector3(0, 0.3, 0), Color("46535a"), Vector3(5, 0.7, 3))
			_add_shape(obstacle, BoxMesh.new(), Vector3(0, 1.5, -0.1), Color("75614e"), Vector3(2.7, 2.4, 2.2))
		"reef":
			for i in 5:
				var coral := CylinderMesh.new()
				coral.top_radius = 0.12
				coral.bottom_radius = 0.42
				coral.height = rng.randf_range(1.3, 3.0)
				_add_shape(obstacle, coral, Vector3((i - 2) * 0.62, coral.height * 0.5 - 0.2, 0), [Color("f28b74"), Color("e9c277"), Color("ad86b9")][i % 3], Vector3.ONE)
		"net":
			_add_shape(obstacle, BoxMesh.new(), Vector3(0, 2.1, 0), Color(0.76, 0.69, 0.42, 0.75), Vector3(3.4, 4.2, 0.15))
		"surge", "silt":
			var orb := SphereMesh.new()
			orb.radius = 0.8
			orb.height = 1.6
			_add_shape(obstacle, orb, Vector3(0, 2.1, 0), LIME if kind == "surge" else Color("ff867c"), Vector3.ONE)
	_add_obstacle(obstacle, kind)

func _add_obstacle(node: Node3D, kind: String) -> void:
	node.set_meta("kind", kind)
	node.set_meta("hit", false)
	world.add_child(node)

func _set_material(item: MeshInstance3D, color: Color, roughness: float, emissive: bool) -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = roughness
	if emissive:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = 0.8
	item.material_override = mat

func _say(text: String) -> void:
	toast.text = text
	toast_left = 1.4

func _refresh_hud() -> void:
	hud.text = "DISTANCE  %05d m                    SCORE  %06d                    SPEED  %02d km/h     DAMAGE  %d / 3" % [int(distance), int(score), int(speed * 2.3), hull]
