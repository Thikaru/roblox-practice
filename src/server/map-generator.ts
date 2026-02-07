const Workspace = game.GetService("Workspace");

const FLOOR_SIZE = new Vector3(200, 1, 200);
const FLOOR_POSITION = new Vector3(0, 0, 0);
const WALL_HEIGHT = 20;
const WALL_THICKNESS = 2;
const SCREEN_WIDTH = 40;
const SCREEN_HEIGHT = 20;

let screenTextLabel: TextLabel | undefined;
let screenTimerLabel: TextLabel | undefined;
let screenInfoLabel: TextLabel | undefined;

export function generateMap(): void {
	// 既存のマップがあれば削除
	const existing = Workspace.FindFirstChild("QuizArena");
	if (existing) {
		existing.Destroy();
	}

	const arenaFolder = new Instance("Folder");
	arenaFolder.Name = "QuizArena";
	arenaFolder.Parent = Workspace;

	// 床
	const floor = new Instance("Part");
	floor.Name = "Floor";
	floor.Size = FLOOR_SIZE;
	floor.Position = FLOOR_POSITION;
	floor.Anchored = true;
	floor.BrickColor = new BrickColor("Medium stone grey");
	floor.Material = Enum.Material.SmoothPlastic;
	floor.TopSurface = Enum.SurfaceType.Smooth;
	floor.BottomSurface = Enum.SurfaceType.Smooth;
	floor.Parent = arenaFolder;

	// 壁 4面
	const halfFloorX = FLOOR_SIZE.X / 2;
	const halfFloorZ = FLOOR_SIZE.Z / 2;
	const wallY = WALL_HEIGHT / 2 + FLOOR_SIZE.Y / 2;

	const wallDefs = [
		{
			name: "WallNorth",
			size: new Vector3(FLOOR_SIZE.X, WALL_HEIGHT, WALL_THICKNESS),
			position: new Vector3(0, wallY, halfFloorZ),
		},
		{
			name: "WallSouth",
			size: new Vector3(FLOOR_SIZE.X, WALL_HEIGHT, WALL_THICKNESS),
			position: new Vector3(0, wallY, -halfFloorZ),
		},
		{
			name: "WallEast",
			size: new Vector3(WALL_THICKNESS, WALL_HEIGHT, FLOOR_SIZE.Z),
			position: new Vector3(halfFloorX, wallY, 0),
		},
		{
			name: "WallWest",
			size: new Vector3(WALL_THICKNESS, WALL_HEIGHT, FLOOR_SIZE.Z),
			position: new Vector3(-halfFloorX, wallY, 0),
		},
	];

	for (const wallDef of wallDefs) {
		const wall = new Instance("Part");
		wall.Name = wallDef.name;
		wall.Size = wallDef.size;
		wall.Position = wallDef.position;
		wall.Anchored = true;
		wall.BrickColor = new BrickColor("Dark stone grey");
		wall.Material = Enum.Material.Concrete;
		wall.TopSurface = Enum.SurfaceType.Smooth;
		wall.BottomSurface = Enum.SurfaceType.Smooth;
		wall.Transparency = 0.3;
		wall.Parent = arenaFolder;
	}

	// スポーン地点
	const spawn = new Instance("SpawnLocation");
	spawn.Name = "QuizSpawn";
	spawn.Size = new Vector3(8, 1, 8);
	spawn.Position = new Vector3(0, FLOOR_SIZE.Y / 2 + 0.5, 0);
	spawn.Anchored = true;
	spawn.BrickColor = new BrickColor("Bright blue");
	spawn.Material = Enum.Material.Neon;
	spawn.TopSurface = Enum.SurfaceType.Smooth;
	spawn.BottomSurface = Enum.SurfaceType.Smooth;
	spawn.Parent = arenaFolder;

	// 3Dスクリーン（問題表示用の大きなモニター）
	const screenPart = new Instance("Part");
	screenPart.Name = "QuizScreen";
	screenPart.Size = new Vector3(SCREEN_WIDTH, SCREEN_HEIGHT, 1);
	screenPart.Position = new Vector3(0, SCREEN_HEIGHT / 2 + FLOOR_SIZE.Y / 2, -(halfFloorZ - 5));
	screenPart.Anchored = true;
	screenPart.CanCollide = false;
	screenPart.BrickColor = new BrickColor("Black");
	screenPart.Material = Enum.Material.SmoothPlastic;
	screenPart.TopSurface = Enum.SurfaceType.Smooth;
	screenPart.BottomSurface = Enum.SurfaceType.Smooth;
	screenPart.Parent = arenaFolder;

	// スクリーン枠（少し大きい灰色パーツを後ろに）
	const screenFrame = new Instance("Part");
	screenFrame.Name = "ScreenFrame";
	screenFrame.Size = new Vector3(SCREEN_WIDTH + 2, SCREEN_HEIGHT + 2, 0.5);
	screenFrame.Position = new Vector3(0, SCREEN_HEIGHT / 2 + FLOOR_SIZE.Y / 2, -(halfFloorZ - 5) - 0.5);
	screenFrame.Anchored = true;
	screenFrame.CanCollide = false;
	screenFrame.BrickColor = new BrickColor("Dark stone grey");
	screenFrame.Material = Enum.Material.Metal;
	screenFrame.Parent = arenaFolder;

	// SurfaceGui（前面に表示）
	const surfaceGui = new Instance("SurfaceGui");
	surfaceGui.Name = "ScreenGui";
	surfaceGui.Face = Enum.NormalId.Front;
	surfaceGui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
	surfaceGui.PixelsPerStud = 20;
	surfaceGui.Parent = screenPart;

	// 背景フレーム
	const bgFrame = new Instance("Frame");
	bgFrame.Name = "Background";
	bgFrame.Size = new UDim2(1, 0, 1, 0);
	bgFrame.BackgroundColor3 = new Color3(0.05, 0.05, 0.15);
	bgFrame.BorderSizePixel = 0;
	bgFrame.Parent = surfaceGui;

	// 問題文ラベル
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

	// タイマーラベル
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

	// 問題番号ラベル
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

	print("[MapGenerator] Quiz arena generated.");
}

// 3Dスクリーンの問題文を更新
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

// 3Dスクリーンのタイマーを更新
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

// 3Dスクリーンに結果を表示
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

// 3Dスクリーンをリセット
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
