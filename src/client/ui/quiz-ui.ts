const Players = game.GetService("Players");
const LocalPlayer = Players.LocalPlayer;

let screenGui: ScreenGui | undefined;

// UI要素の参照
let questionLabel: TextLabel;
let timerLabel: TextLabel;
let resultLabel: TextLabel;
let statusLabel: TextLabel;
let questionInfoLabel: TextLabel;

function createScreenGui(): ScreenGui {
	// 既存のGUIを削除
	const existing = LocalPlayer.FindFirstChild("PlayerGui") as PlayerGui | undefined;
	if (existing) {
		const old = existing.FindFirstChild("QuizGui");
		if (old) old.Destroy();
	}

	const gui = new Instance("ScreenGui");
	gui.Name = "QuizGui";
	gui.ResetOnSpawn = false;
	gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;

	return gui;
}

function createTextLabel(
	name: string,
	position: UDim2,
	size: UDim2,
	textSize: number,
	parent: Instance,
): TextLabel {
	const label = new Instance("TextLabel");
	label.Name = name;
	label.Position = position;
	label.Size = size;
	label.AnchorPoint = new Vector2(0.5, 0);
	label.BackgroundTransparency = 0.3;
	label.BackgroundColor3 = new Color3(0, 0, 0);
	label.TextColor3 = new Color3(1, 1, 1);
	label.TextSize = textSize;
	label.Font = Enum.Font.GothamBold;
	label.TextWrapped = true;
	label.Visible = false;
	label.Parent = parent;

	// 角丸
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 12);
	corner.Parent = label;

	return label;
}

export function initUI(): void {
	screenGui = createScreenGui();

	// 問題文（画面上部）
	questionLabel = createTextLabel(
		"QuestionLabel",
		new UDim2(0.5, 0, 0.02, 0),
		new UDim2(0.8, 0, 0.1, 0),
		28,
		screenGui,
	);

	// 問題番号（問題文の下）
	questionInfoLabel = createTextLabel(
		"QuestionInfoLabel",
		new UDim2(0.5, 0, 0.13, 0),
		new UDim2(0.3, 0, 0.04, 0),
		18,
		screenGui,
	);
	questionInfoLabel.BackgroundTransparency = 0.5;

	// タイマー（画面中央）
	timerLabel = createTextLabel(
		"TimerLabel",
		new UDim2(0.5, 0, 0.35, 0),
		new UDim2(0.2, 0, 0.15, 0),
		72,
		screenGui,
	);

	// 結果表示（画面中央やや下）
	resultLabel = createTextLabel(
		"ResultLabel",
		new UDim2(0.5, 0, 0.4, 0),
		new UDim2(0.5, 0, 0.12, 0),
		48,
		screenGui,
	);

	// ステータス（画面下部）
	statusLabel = createTextLabel(
		"StatusLabel",
		new UDim2(0.5, 0, 0.85, 0),
		new UDim2(0.6, 0, 0.06, 0),
		22,
		screenGui,
	);

	const playerGui = LocalPlayer.FindFirstChildWhichIsA("PlayerGui");
	if (playerGui) {
		screenGui.Parent = playerGui;
	}
}

export function showWaiting(): void {
	hideAll();
	statusLabel.Text = "プレイヤーを待っています...";
	statusLabel.Visible = true;
}

export function showCountdown(seconds: number): void {
	hideAll();
	timerLabel.Text = tostring(seconds);
	timerLabel.TextColor3 = new Color3(1, 1, 0);
	timerLabel.Visible = true;
	statusLabel.Text = "ゲーム開始まで...";
	statusLabel.Visible = true;
}

export function showQuestion(questionText: string, timeLimit: number, questionNum: number, totalQuestions: number): void {
	hideAll();
	questionLabel.Text = questionText;
	questionLabel.Visible = true;

	questionInfoLabel.Text = `第${questionNum}問 / 全${totalQuestions}問`;
	questionInfoLabel.Visible = true;

	timerLabel.Text = tostring(timeLimit);
	timerLabel.TextColor3 = new Color3(1, 1, 1);
	timerLabel.Visible = true;
}

export function updateTimer(seconds: number): void {
	timerLabel.Text = tostring(seconds);
	timerLabel.Visible = true;

	// 残り少ないと赤くする
	if (seconds <= 3) {
		timerLabel.TextColor3 = new Color3(1, 0.2, 0.2);
	} else if (seconds <= 5) {
		timerLabel.TextColor3 = new Color3(1, 1, 0);
	} else {
		timerLabel.TextColor3 = new Color3(1, 1, 1);
	}
}

export function showResult(correct: boolean): void {
	timerLabel.Visible = false;

	resultLabel.Visible = true;
	if (correct) {
		resultLabel.Text = "正解!";
		resultLabel.TextColor3 = new Color3(0.2, 1, 0.2);
		resultLabel.BackgroundColor3 = new Color3(0, 0.3, 0);
	} else {
		resultLabel.Text = "不正解...";
		resultLabel.TextColor3 = new Color3(1, 0.2, 0.2);
		resultLabel.BackgroundColor3 = new Color3(0.3, 0, 0);
	}
}

export function showEliminated(playerName: string): void {
	statusLabel.Text = `${playerName} が脱落しました!`;
	statusLabel.Visible = true;
}

export function showGhost(): void {
	statusLabel.Text = "あなたは見学者です 👻";
	statusLabel.Visible = true;
}

export function showFinished(winnerNames: string[], hasWinner: boolean): void {
	hideAll();
	resultLabel.Visible = true;

	if (hasWinner && winnerNames.size() > 0) {
		resultLabel.Text = `おめでとう!\n勝者: ${winnerNames.join(", ")}`;
		resultLabel.TextColor3 = new Color3(1, 0.84, 0);
		resultLabel.BackgroundColor3 = new Color3(0.2, 0.15, 0);
	} else {
		resultLabel.Text = "全員脱落! 勝者なし";
		resultLabel.TextColor3 = new Color3(0.7, 0.7, 0.7);
		resultLabel.BackgroundColor3 = new Color3(0.1, 0.1, 0.1);
	}

	statusLabel.Visible = false;
}

export function hideAll(): void {
	questionLabel.Visible = false;
	questionInfoLabel.Visible = false;
	timerLabel.Visible = false;
	resultLabel.Visible = false;
	statusLabel.Visible = false;
}
