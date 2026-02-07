const Workspace = game.GetService("Workspace");
const Lighting = game.GetService("Lighting");

const FLOOR_SIZE = new Vector3(150, 1, 150);
const FLOOR_POSITION = new Vector3(0, 0, 0);
const OUTER_WALL_HEIGHT = 25;
const WALL_THICKNESS = 2;
const MAZE_WALL_HEIGHT = 8;
const SCREEN_WIDTH = 40;
const SCREEN_HEIGHT = 20;

let screenTextLabel: TextLabel | undefined;
let screenTimerLabel: TextLabel | undefined;
let screenInfoLabel: TextLabel | undefined;

// --- ヘルパー関数 ---

function createPart(
	parent: Instance,
	name: string,
	size: Vector3,
	position: Vector3,
	color: BrickColor,
	material: Enum.Material,
	transparency = 0,
	canCollide = true,
): Part {
	const part = new Instance("Part");
	part.Name = name;
	part.Size = size;
	part.Position = position;
	part.Anchored = true;
	part.CanCollide = canCollide;
	part.BrickColor = color;
	part.Material = material;
	part.Transparency = transparency;
	part.TopSurface = Enum.SurfaceType.Smooth;
	part.BottomSurface = Enum.SurfaceType.Smooth;
	part.Parent = parent;
	return part;
}

function addPointLight(parent: Instance, color: Color3, brightness: number, range: number): void {
	const light = new Instance("PointLight");
	light.Color = color;
	light.Brightness = brightness;
	light.Range = range;
	light.Parent = parent;
}

// --- メイン生成 ---

export function generateMap(): void {
	const existing = Workspace.FindFirstChild("QuizArena");
	if (existing) {
		existing.Destroy();
	}

	// 照明を少し暗めに
	Lighting.Ambient = new Color3(0.3, 0.3, 0.4);
	Lighting.Brightness = 1;
	Lighting.ClockTime = 0;
	Lighting.FogEnd = 300;
	Lighting.FogColor = new Color3(0.05, 0.05, 0.1);

	const arena = new Instance("Folder");
	arena.Name = "QuizArena";
	arena.Parent = Workspace;

	buildFloor(arena);
	buildOuterWalls(arena);
	buildGrandHall(arena);
	buildCorridors(arena);
	buildMaze(arena);
	buildDecorations(arena);
	buildScreen(arena);

	print("[MapGenerator] Quiz arena generated.");
}

// --- 床 ---

function buildFloor(arena: Folder): void {
	// メイン床
	createPart(
		arena, "Floor", FLOOR_SIZE, FLOOR_POSITION,
		new BrickColor("Dark stone grey"), Enum.Material.Slate,
	);

	// 中央広間の円形タイル風の床（重ね置き）
	const centerFloor = createPart(
		arena, "CenterFloor",
		new Vector3(50, 0.2, 50),
		new Vector3(0, 0.6, 0),
		new BrickColor("Medium stone grey"), Enum.Material.Marble,
	);

	// 中央の模様リング
	createPart(
		arena, "FloorRing",
		new Vector3(30, 0.25, 30),
		new Vector3(0, 0.65, 0),
		new BrickColor("Sand blue"), Enum.Material.Marble,
	);

	createPart(
		arena, "FloorInner",
		new Vector3(16, 0.3, 16),
		new Vector3(0, 0.7, 0),
		new BrickColor("Institutional white"), Enum.Material.Marble,
	);
}

// --- 外壁 ---

function buildOuterWalls(arena: Folder): void {
	const halfX = FLOOR_SIZE.X / 2;
	const halfZ = FLOOR_SIZE.Z / 2;
	const wallY = OUTER_WALL_HEIGHT / 2 + FLOOR_SIZE.Y / 2;

	const walls = [
		{ name: "WallNorth", size: new Vector3(FLOOR_SIZE.X, OUTER_WALL_HEIGHT, WALL_THICKNESS), pos: new Vector3(0, wallY, halfZ) },
		{ name: "WallSouth", size: new Vector3(FLOOR_SIZE.X, OUTER_WALL_HEIGHT, WALL_THICKNESS), pos: new Vector3(0, wallY, -halfZ) },
		{ name: "WallEast", size: new Vector3(WALL_THICKNESS, OUTER_WALL_HEIGHT, FLOOR_SIZE.Z), pos: new Vector3(halfX, wallY, 0) },
		{ name: "WallWest", size: new Vector3(WALL_THICKNESS, OUTER_WALL_HEIGHT, FLOOR_SIZE.Z), pos: new Vector3(-halfX, wallY, 0) },
	];

	for (const w of walls) {
		createPart(arena, w.name, w.size, w.pos, new BrickColor("Dark stone grey"), Enum.Material.Concrete, 0.15);
	}
}

// --- 中央広間（柱・噴水・スポーン） ---

function buildGrandHall(arena: Folder): void {
	// 8本の柱を円形配置
	const pillarRadius = 22;
	const pillarHeight = 18;
	for (let i = 0; i < 8; i++) {
		const angle = (i / 8) * math.pi * 2;
		const px = math.cos(angle) * pillarRadius;
		const pz = math.sin(angle) * pillarRadius;

		const pillar = createPart(
			arena, `Pillar_${i}`,
			new Vector3(3, pillarHeight, 3),
			new Vector3(px, pillarHeight / 2 + 0.5, pz),
			new BrickColor("Nougat"), Enum.Material.Marble,
		);

		// 柱の頭（装飾）
		createPart(
			arena, `PillarTop_${i}`,
			new Vector3(4.5, 1.5, 4.5),
			new Vector3(px, pillarHeight + 0.5, pz),
			new BrickColor("Nougat"), Enum.Material.Marble,
		);

		// 柱にライト
		addPointLight(pillar, new Color3(1, 0.9, 0.7), 1, 20);
	}

	// 中央の噴水台座
	createPart(
		arena, "FountainBase",
		new Vector3(8, 2, 8),
		new Vector3(0, 1.5, 0),
		new BrickColor("Medium stone grey"), Enum.Material.Marble,
	);

	createPart(
		arena, "FountainMiddle",
		new Vector3(4, 4, 4),
		new Vector3(0, 4, 0),
		new BrickColor("Medium stone grey"), Enum.Material.Marble,
	);

	// 噴水のトップにパーティクル
	const fountainTop = createPart(
		arena, "FountainTop",
		new Vector3(2, 1, 2),
		new Vector3(0, 6.5, 0),
		new BrickColor("Sand blue"), Enum.Material.Neon,
	);

	const particles = new Instance("ParticleEmitter");
	particles.Texture = "rbxassetid://241685484";
	particles.Rate = 30;
	particles.Lifetime = new NumberRange(1, 2);
	particles.Speed = new NumberRange(5, 10);
	particles.SpreadAngle = new Vector2(30, 30);
	particles.Color = new ColorSequence(new Color3(0.5, 0.7, 1));
	particles.Size = new NumberSequence(0.5, 0);
	particles.Parent = fountainTop;

	addPointLight(fountainTop, new Color3(0.4, 0.6, 1), 2, 30);

	// スポーン地点（噴水の横）
	const spawn = new Instance("SpawnLocation");
	spawn.Name = "QuizSpawn";
	spawn.Size = new Vector3(10, 1, 10);
	spawn.Position = new Vector3(0, 0.8, 12);
	spawn.Anchored = true;
	spawn.BrickColor = new BrickColor("Bright blue");
	spawn.Material = Enum.Material.Neon;
	spawn.Transparency = 0.4;
	spawn.TopSurface = Enum.SurfaceType.Smooth;
	spawn.BottomSurface = Enum.SurfaceType.Smooth;
	spawn.Parent = arena;
}

// --- 4方向の通路 ---

function buildCorridors(arena: Folder): void {
	const corridorWidth = 10;
	const wallH = MAZE_WALL_HEIGHT;
	const wallY = wallH / 2 + 0.5;

	// 通路の壁定義: 中央広間(~25)から外側へ伸びる左右の壁
	// 東通路
	createPart(arena, "CorridorE_L", new Vector3(30, wallH, WALL_THICKNESS), new Vector3(40, wallY, corridorWidth / 2), new BrickColor("Dark stone grey"), Enum.Material.Cobblestone);
	createPart(arena, "CorridorE_R", new Vector3(30, wallH, WALL_THICKNESS), new Vector3(40, wallY, -corridorWidth / 2), new BrickColor("Dark stone grey"), Enum.Material.Cobblestone);

	// 西通路
	createPart(arena, "CorridorW_L", new Vector3(30, wallH, WALL_THICKNESS), new Vector3(-40, wallY, corridorWidth / 2), new BrickColor("Dark stone grey"), Enum.Material.Cobblestone);
	createPart(arena, "CorridorW_R", new Vector3(30, wallH, WALL_THICKNESS), new Vector3(-40, wallY, -corridorWidth / 2), new BrickColor("Dark stone grey"), Enum.Material.Cobblestone);

	// 北通路
	createPart(arena, "CorridorN_L", new Vector3(WALL_THICKNESS, wallH, 25), new Vector3(corridorWidth / 2, wallY, 40), new BrickColor("Dark stone grey"), Enum.Material.Cobblestone);
	createPart(arena, "CorridorN_R", new Vector3(WALL_THICKNESS, wallH, 25), new Vector3(-corridorWidth / 2, wallY, 40), new BrickColor("Dark stone grey"), Enum.Material.Cobblestone);

	// 南通路
	createPart(arena, "CorridorS_L", new Vector3(WALL_THICKNESS, wallH, 25), new Vector3(corridorWidth / 2, wallY, -40), new BrickColor("Dark stone grey"), Enum.Material.Cobblestone);
	createPart(arena, "CorridorS_R", new Vector3(WALL_THICKNESS, wallH, 25), new Vector3(-corridorWidth / 2, wallY, -40), new BrickColor("Dark stone grey"), Enum.Material.Cobblestone);

	// 通路の床を少し明るく
	createPart(arena, "CorridorFloorE", new Vector3(30, 0.2, corridorWidth), new Vector3(40, 0.6, 0), new BrickColor("Brick yellow"), Enum.Material.Slate);
	createPart(arena, "CorridorFloorW", new Vector3(30, 0.2, corridorWidth), new Vector3(-40, 0.6, 0), new BrickColor("Brick yellow"), Enum.Material.Slate);
	createPart(arena, "CorridorFloorN", new Vector3(corridorWidth, 0.2, 25), new Vector3(0, 0.6, 40), new BrickColor("Brick yellow"), Enum.Material.Slate);
	createPart(arena, "CorridorFloorS", new Vector3(corridorWidth, 0.2, 25), new Vector3(0, 0.6, -40), new BrickColor("Brick yellow"), Enum.Material.Slate);
}

// --- 迷路壁 ---

function buildMaze(arena: Folder): void {
	const wallH = MAZE_WALL_HEIGHT;
	const wallY = wallH / 2 + 0.5;
	const t = WALL_THICKNESS;

	// 迷路壁の定義: [sizeX, sizeZ, posX, posZ]
	const mazeWalls: [number, number, number, number][] = [
		// === 北東エリア (右上) ===
		[20, t, 35, 25],
		[t, 15, 28, 35],
		[12, t, 42, 18],
		[t, 20, 50, 30],
		[15, t, 38, 45],
		[t, 10, 45, 50],

		// === 北西エリア (左上) ===
		[20, t, -35, 25],
		[t, 15, -28, 35],
		[12, t, -42, 18],
		[t, 20, -50, 30],
		[15, t, -38, 45],
		[t, 10, -45, 50],

		// === 南東エリア (右下) ===
		[20, t, 35, -25],
		[t, 15, 28, -35],
		[12, t, 42, -18],
		[t, 20, 50, -30],
		[15, t, 38, -45],
		[t, 10, 45, -50],

		// === 南西エリア (左下) ===
		[20, t, -35, -25],
		[t, 15, -28, -35],
		[12, t, -42, -18],
		[t, 20, -50, -30],
		[15, t, -38, -45],
		[t, 10, -45, -50],

		// === 通路途中の障害物（低い壁、分岐を作る） ===
		[8, t, 20, 15],
		[8, t, -20, 15],
		[8, t, 20, -15],
		[8, t, -20, -15],

		// === 外周付近の長い壁 ===
		[t, 30, 60, 0],
		[t, 30, -60, 0],
		[30, t, 0, 60],
		[30, t, 0, -55],
	];

	for (let i = 0; i < mazeWalls.size(); i++) {
		const [sx, sz, px, pz] = mazeWalls[i];
		createPart(
			arena, `MazeWall_${i}`,
			new Vector3(sx, wallH, sz),
			new Vector3(px, wallY, pz),
			new BrickColor("Reddish brown"), Enum.Material.Brick,
		);
	}
}

// --- 装飾オブジェクト ---

function buildDecorations(arena: Folder): void {
	// --- 松明（通路のコーナーや壁沿い） ---
	const torchPositions = [
		new Vector3(25, 6, 5), new Vector3(25, 6, -5),
		new Vector3(-25, 6, 5), new Vector3(-25, 6, -5),
		new Vector3(5, 6, 25), new Vector3(-5, 6, 25),
		new Vector3(5, 6, -25), new Vector3(-5, 6, -25),
		new Vector3(55, 6, 5), new Vector3(-55, 6, 5),
		new Vector3(55, 6, -5), new Vector3(-55, 6, -5),
		new Vector3(5, 6, 52), new Vector3(-5, 6, 52),
	];

	for (let i = 0; i < torchPositions.size(); i++) {
		const pos = torchPositions[i];
		// 松明の柱
		const torch = createPart(
			arena, `Torch_${i}`,
			new Vector3(1, 5, 1),
			new Vector3(pos.X, 3, pos.Z),
			new BrickColor("Brown"), Enum.Material.Wood,
		);

		// 炎
		const flame = createPart(
			arena, `TorchFlame_${i}`,
			new Vector3(0.5, 0.5, 0.5),
			pos,
			new BrickColor("Bright orange"), Enum.Material.Neon,
			0, false,
		);

		const fire = new Instance("Fire");
		fire.Size = 3;
		fire.Heat = 5;
		fire.Color = new Color3(1, 0.6, 0.1);
		fire.SecondaryColor = new Color3(1, 0.3, 0);
		fire.Parent = flame;

		addPointLight(flame, new Color3(1, 0.7, 0.3), 1.5, 25);
	}

	// --- 木箱・樽（散らばり） ---
	const cratePositions = [
		{ pos: new Vector3(35, 2, 10), size: new Vector3(4, 4, 4) },
		{ pos: new Vector3(-38, 1.5, -8), size: new Vector3(3, 3, 3) },
		{ pos: new Vector3(45, 2, -20), size: new Vector3(4, 4, 4) },
		{ pos: new Vector3(-42, 1.5, 22), size: new Vector3(3, 3, 3) },
		{ pos: new Vector3(10, 2, 45), size: new Vector3(4, 4, 4) },
		{ pos: new Vector3(-12, 1.5, -42), size: new Vector3(3, 3, 3) },
		{ pos: new Vector3(55, 2.5, 20), size: new Vector3(5, 5, 5) },
		{ pos: new Vector3(-55, 2, -20), size: new Vector3(4, 4, 4) },
	];

	for (let i = 0; i < cratePositions.size(); i++) {
		const c = cratePositions[i];
		createPart(
			arena, `Crate_${i}`,
			c.size, c.pos,
			new BrickColor("Brown"), Enum.Material.WoodPlanks,
		);
	}

	// --- 光る結晶 ---
	const crystalPositions = [
		new Vector3(48, 3, 40),
		new Vector3(-48, 3, 40),
		new Vector3(48, 3, -40),
		new Vector3(-48, 3, -40),
		new Vector3(30, 3, 50),
		new Vector3(-30, 3, -50),
	];

	const crystalColors: Color3[] = [
		new Color3(0.3, 1, 0.5),
		new Color3(0.5, 0.3, 1),
		new Color3(1, 0.3, 0.5),
		new Color3(0.3, 0.8, 1),
		new Color3(1, 1, 0.3),
		new Color3(1, 0.5, 0.3),
	];

	for (let i = 0; i < crystalPositions.size(); i++) {
		const pos = crystalPositions[i];
		const crystal = createPart(
			arena, `Crystal_${i}`,
			new Vector3(2, 5, 2),
			pos,
			new BrickColor("Bright blue"), Enum.Material.Neon,
			0.2, false,
		);
		crystal.Color = crystalColors[i % crystalColors.size()];

		addPointLight(crystal, crystalColors[i % crystalColors.size()], 1.2, 18);

		// 結晶を回転させて傾ける
		crystal.CFrame = new CFrame(pos).mul(CFrame.Angles(0.3, i * 1.2, 0.2));
	}

	// --- アーチ（通路の入り口） ---
	const archPositions = [
		{ pos: new Vector3(25, 0.5, 0), rot: 0 },
		{ pos: new Vector3(-25, 0.5, 0), rot: 0 },
		{ pos: new Vector3(0, 0.5, 25), rot: math.pi / 2 },
		{ pos: new Vector3(0, 0.5, -25), rot: math.pi / 2 },
	];

	for (let i = 0; i < archPositions.size(); i++) {
		const a = archPositions[i];
		const isVertical = a.rot !== 0;

		// 左柱
		const leftOffset = isVertical ? new Vector3(6, 0, 0) : new Vector3(0, 0, 6);
		createPart(
			arena, `Arch_${i}_L`,
			new Vector3(2, 12, 2),
			a.pos.add(leftOffset).add(new Vector3(0, 6, 0)),
			new BrickColor("Medium stone grey"), Enum.Material.Granite,
		);

		// 右柱
		const rightOffset = isVertical ? new Vector3(-6, 0, 0) : new Vector3(0, 0, -6);
		createPart(
			arena, `Arch_${i}_R`,
			new Vector3(2, 12, 2),
			a.pos.add(rightOffset).add(new Vector3(0, 6, 0)),
			new BrickColor("Medium stone grey"), Enum.Material.Granite,
		);

		// 梁
		const beamSize = isVertical ? new Vector3(14, 2, 3) : new Vector3(3, 2, 14);
		createPart(
			arena, `Arch_${i}_Top`,
			beamSize,
			a.pos.add(new Vector3(0, 12.5, 0)),
			new BrickColor("Medium stone grey"), Enum.Material.Granite,
		);
	}
}

// --- 3Dスクリーン ---

function buildScreen(arena: Folder): void {
	const halfZ = FLOOR_SIZE.Z / 2;
	const screenY = SCREEN_HEIGHT / 2 + FLOOR_SIZE.Y / 2;

	// スクリーン本体
	const screenPart = createPart(
		arena, "QuizScreen",
		new Vector3(SCREEN_WIDTH, SCREEN_HEIGHT, 1),
		new Vector3(0, screenY, -(halfZ - 5)),
		new BrickColor("Black"), Enum.Material.SmoothPlastic,
		0, false,
	);

	// スクリーン枠
	createPart(
		arena, "ScreenFrame",
		new Vector3(SCREEN_WIDTH + 2, SCREEN_HEIGHT + 2, 0.5),
		new Vector3(0, screenY, -(halfZ - 5) - 0.5),
		new BrickColor("Dark stone grey"), Enum.Material.Metal,
		0, false,
	);

	// スクリーン照明
	const screenLight = createPart(
		arena, "ScreenLight",
		new Vector3(1, 1, 1),
		new Vector3(0, screenY + SCREEN_HEIGHT / 2 + 2, -(halfZ - 8)),
		new BrickColor("White"), Enum.Material.Neon,
		1, false,
	);
	addPointLight(screenLight, new Color3(0.7, 0.7, 1), 2, 40);

	// SurfaceGui
	const surfaceGui = new Instance("SurfaceGui");
	surfaceGui.Name = "ScreenGui";
	surfaceGui.Face = Enum.NormalId.Front;
	surfaceGui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
	surfaceGui.PixelsPerStud = 20;
	surfaceGui.Parent = screenPart;

	const bgFrame = new Instance("Frame");
	bgFrame.Name = "Background";
	bgFrame.Size = new UDim2(1, 0, 1, 0);
	bgFrame.BackgroundColor3 = new Color3(0.05, 0.05, 0.15);
	bgFrame.BorderSizePixel = 0;
	bgFrame.Parent = surfaceGui;

	// 問題文
	const questionText = new Instance("TextLabel");
	questionText.Name = "QuestionText";
	questionText.Size = new UDim2(0.9, 0, 0.45, 0);
	questionText.Position = new UDim2(0.05, 0, 0.05, 0);
	questionText.BackgroundTransparency = 1;
	questionText.TextColor3 = new Color3(1, 1, 1);
	questionText.TextScaled = true;
	questionText.Font = Enum.Font.GothamBold;
	questionText.Text = "クイズゲーム";
	questionText.TextWrapped = true;
	questionText.Parent = bgFrame;
	screenTextLabel = questionText;

	// タイマー
	const timerText = new Instance("TextLabel");
	timerText.Name = "TimerText";
	timerText.Size = new UDim2(0.4, 0, 0.35, 0);
	timerText.Position = new UDim2(0.3, 0, 0.5, 0);
	timerText.BackgroundTransparency = 1;
	timerText.TextColor3 = new Color3(1, 1, 0);
	timerText.TextScaled = true;
	timerText.Font = Enum.Font.GothamBold;
	timerText.Text = "";
	timerText.Parent = bgFrame;
	screenTimerLabel = timerText;

	// 問題番号
	const infoText = new Instance("TextLabel");
	infoText.Name = "InfoText";
	infoText.Size = new UDim2(0.5, 0, 0.12, 0);
	infoText.Position = new UDim2(0.25, 0, 0.87, 0);
	infoText.BackgroundTransparency = 1;
	infoText.TextColor3 = new Color3(0.7, 0.7, 0.7);
	infoText.TextScaled = true;
	infoText.Font = Enum.Font.Gotham;
	infoText.Text = "";
	infoText.Parent = bgFrame;
	screenInfoLabel = infoText;
}

// --- スクリーン更新関数 ---

export function updateScreen(questionText: string, questionNum: number, totalQuestions: number): void {
	if (screenTextLabel) {
		screenTextLabel.Text = questionText;
	}
	if (screenInfoLabel) {
		screenInfoLabel.Text = `第${questionNum}問 / 全${totalQuestions}問`;
	}
	if (screenTimerLabel) {
		screenTimerLabel.Text = "";
	}
}

export function updateScreenTimer(seconds: number): void {
	if (screenTimerLabel) {
		screenTimerLabel.Text = seconds > 0 ? tostring(seconds) : "タイムアップ!";
		if (seconds <= 3) {
			screenTimerLabel.TextColor3 = new Color3(1, 0.2, 0.2);
		} else if (seconds <= 5) {
			screenTimerLabel.TextColor3 = new Color3(1, 1, 0);
		} else {
			screenTimerLabel.TextColor3 = new Color3(1, 1, 1);
		}
	}
}

export function updateScreenResult(text: string): void {
	if (screenTextLabel) {
		screenTextLabel.Text = text;
	}
	if (screenTimerLabel) {
		screenTimerLabel.Text = "";
	}
	if (screenInfoLabel) {
		screenInfoLabel.Text = "";
	}
}

export function resetScreen(): void {
	if (screenTextLabel) {
		screenTextLabel.Text = "クイズゲーム";
	}
	if (screenTimerLabel) {
		screenTimerLabel.Text = "";
	}
	if (screenInfoLabel) {
		screenInfoLabel.Text = "プレイヤーを待っています...";
	}
}
