import { STICKER_ICON_ID } from "shared/types";

const Players = game.GetService("Players");
const LocalPlayer = Players.LocalPlayer;

let screenGui: ScreenGui | undefined;

// UI要素の参照
let questionLabel: TextLabel;
let timerLabel: TextLabel;
let resultLabel: TextLabel;
let statusLabel: TextLabel;
let questionInfoLabel: TextLabel;
let stickerFrame: Frame;
let stickerCountLabel: TextLabel;
let stickerIconsFrame: Frame;
const stickerIcons: ImageLabel[] = [];

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
	autoHeight = false,
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

	// テキスト量に応じて高さを自動拡張
	if (autoHeight) {
		label.AutomaticSize = Enum.AutomaticSize.Y;
	}

	label.Parent = parent;

	// 角丸
	const corner = new Instance("UICorner");
	corner.CornerRadius = new UDim(0, 12);
	corner.Parent = label;

	// 自動拡張時のパディング
	if (autoHeight) {
		const padding = new Instance("UIPadding");
		padding.PaddingTop = new UDim(0, 8);
		padding.PaddingBottom = new UDim(0, 8);
		padding.PaddingLeft = new UDim(0, 12);
		padding.PaddingRight = new UDim(0, 12);
		padding.Parent = label;
	}

	return label;
}

export function initUI(): void {
	screenGui = createScreenGui();

	// 問題文（画面上部）- テキスト量で高さ自動拡張
	questionLabel = createTextLabel(
		"QuestionLabel",
		new UDim2(0.5, 0, 0.02, 0),
		new UDim2(0.8, 0, 0, 0),
		28,
		screenGui,
		true,
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

	// 結果表示（画面中央やや下）- テキスト量で高さ自動拡張
	resultLabel = createTextLabel(
		"ResultLabel",
		new UDim2(0.5, 0, 0.4, 0),
		new UDim2(0.6, 0, 0, 0),
		48,
		screenGui,
		true,
	);

	// ステータス（画面下部）- テキスト量で高さ自動拡張
	statusLabel = createTextLabel(
		"StatusLabel",
		new UDim2(0.5, 0, 0.85, 0),
		new UDim2(0.7, 0, 0, 0),
		22,
		screenGui,
		true,
	);

	// シール取得パネル（画面右下）
	stickerFrame = new Instance("Frame");
	stickerFrame.Name = "StickerFrame";
	stickerFrame.Position = new UDim2(1, -10, 1, -10);
	stickerFrame.Size = new UDim2(0.18, 0, 0.22, 0);
	stickerFrame.AnchorPoint = new Vector2(1, 1);
	stickerFrame.BackgroundTransparency = 0.25;
	stickerFrame.BackgroundColor3 = new Color3(0.08, 0.08, 0.16);
	stickerFrame.Visible = false;
	stickerFrame.Parent = screenGui;

	const stickerCorner = new Instance("UICorner");
	stickerCorner.CornerRadius = new UDim(0, 14);
	stickerCorner.Parent = stickerFrame;

	// ヘッダー行: アイコン + "x 0"
	const headerFrame = new Instance("Frame");
	headerFrame.Name = "Header";
	headerFrame.Position = new UDim2(0, 0, 0, 0);
	headerFrame.Size = new UDim2(1, 0, 0.25, 0);
	headerFrame.BackgroundTransparency = 1;
	headerFrame.Parent = stickerFrame;

	const headerIcon = new Instance("ImageLabel");
	headerIcon.Name = "HeaderIcon";
	headerIcon.Position = new UDim2(0.08, 0, 0.1, 0);
	headerIcon.Size = new UDim2(0.8, 0, 0.8, 0);
	headerIcon.SizeConstraint = Enum.SizeConstraint.RelativeYY;
	headerIcon.BackgroundTransparency = 1;
	headerIcon.Image = STICKER_ICON_ID;
	headerIcon.ScaleType = Enum.ScaleType.Fit;
	headerIcon.Parent = headerFrame;

	stickerCountLabel = new Instance("TextLabel");
	stickerCountLabel.Name = "CountLabel";
	stickerCountLabel.Position = new UDim2(0.35, 0, 0, 0);
	stickerCountLabel.Size = new UDim2(0.6, 0, 1, 0);
	stickerCountLabel.BackgroundTransparency = 1;
	stickerCountLabel.TextColor3 = new Color3(1, 1, 1);
	stickerCountLabel.TextScaled = true;
	stickerCountLabel.Font = Enum.Font.GothamBold;
	stickerCountLabel.Text = "x 0";
	stickerCountLabel.TextXAlignment = Enum.TextXAlignment.Left;
	stickerCountLabel.Parent = headerFrame;

	// 取得シール一覧エリア（アイコンが並ぶグリッド）
	stickerIconsFrame = new Instance("Frame");
	stickerIconsFrame.Name = "IconsGrid";
	stickerIconsFrame.Position = new UDim2(0.05, 0, 0.28, 0);
	stickerIconsFrame.Size = new UDim2(0.9, 0, 0.68, 0);
	stickerIconsFrame.BackgroundTransparency = 1;
	stickerIconsFrame.Parent = stickerFrame;

	const gridLayout = new Instance("UIGridLayout");
	gridLayout.CellSize = new UDim2(0, 32, 0, 32);
	gridLayout.CellPadding = new UDim2(0, 4, 0, 4);
	gridLayout.FillDirection = Enum.FillDirection.Horizontal;
	gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left;
	gridLayout.VerticalAlignment = Enum.VerticalAlignment.Top;
	gridLayout.SortOrder = Enum.SortOrder.LayoutOrder;
	gridLayout.Parent = stickerIconsFrame;

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

export function showExplanation(correctAnswer: string, explanation: string): void {
	questionLabel.Visible = false;
	questionInfoLabel.Visible = false;
	timerLabel.Visible = false;

	// 正解を上部に表示
	resultLabel.Position = new UDim2(0.5, 0, 0.25, 0);
	resultLabel.Text = `正解: ${correctAnswer}`;
	resultLabel.TextColor3 = new Color3(0.2, 1, 0.2);
	resultLabel.BackgroundColor3 = new Color3(0, 0.25, 0);
	resultLabel.Visible = true;

	// 解説を正解の下に表示
	statusLabel.Position = new UDim2(0.5, 0, 0.42, 0);
	statusLabel.Size = new UDim2(0.75, 0, 0, 0);
	statusLabel.Text = explanation;
	statusLabel.TextSize = 24;
	statusLabel.TextColor3 = new Color3(1, 1, 0.8);
	statusLabel.BackgroundColor3 = new Color3(0.15, 0.15, 0.05);
	statusLabel.BackgroundTransparency = 0.2;
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

export function updateStickerCount(count: number): void {
	stickerCountLabel.Text = `x ${count}`;
	stickerFrame.Visible = true;
}

export function showStickerCollected(): void {
	// グリッドにアイコンを1つ追加
	const icon = new Instance("ImageLabel");
	icon.Name = `Sticker_${stickerIcons.size()}`;
	icon.Size = new UDim2(0, 32, 0, 32);
	icon.BackgroundTransparency = 1;
	icon.Image = STICKER_ICON_ID;
	icon.ScaleType = Enum.ScaleType.Fit;
	icon.LayoutOrder = stickerIcons.size();
	icon.Parent = stickerIconsFrame;
	stickerIcons.push(icon);

	// カウントテキストを黄色に一瞬光らせる
	stickerCountLabel.TextColor3 = new Color3(1, 1, 0);
	task.delay(0.5, () => {
		stickerCountLabel.TextColor3 = new Color3(1, 1, 1);
	});
}

export function hideStickerLabel(): void {
	stickerFrame.Visible = false;
	stickerCountLabel.Text = "x 0";

	// グリッド内のアイコンを全削除
	for (const icon of stickerIcons) {
		icon.Destroy();
	}
	stickerIcons.clear();
}

export function hideAll(): void {
	questionLabel.Visible = false;
	questionInfoLabel.Visible = false;
	timerLabel.Visible = false;

	// resultLabel を通常位置に戻す
	resultLabel.Position = new UDim2(0.5, 0, 0.4, 0);
	resultLabel.Visible = false;

	// statusLabel を通常位置・サイズに戻す
	statusLabel.Position = new UDim2(0.5, 0, 0.85, 0);
	statusLabel.Size = new UDim2(0.7, 0, 0, 0);
	statusLabel.TextSize = 22;
	statusLabel.BackgroundTransparency = 0.3;
	statusLabel.Visible = false;
}
