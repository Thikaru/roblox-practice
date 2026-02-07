import { STICKER_IMAGE_IDS } from "shared/types";
import { isAlive } from "./player-manager";

const Workspace = game.GetService("Workspace");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const Players = game.GetService("Players");

const STICKER_COUNT_MIN = 20;
const STICKER_COUNT_MAX = 30;
const STICKER_FOLDER_NAME = "QuizStickers";

// プレイヤーごとのシール取得数
const stickerCounts = new Map<Player, number>();
// 取得済みフラグ（Part単位で1人限定）
const collectedStickers = new Set<Part>();
// Touch接続の保持
const touchConnections: RBXScriptConnection[] = [];

// RemoteEvent参照
let stickerCollectedEvent: RemoteEvent | undefined;
let stickerCountEvent: RemoteEvent | undefined;

function getEventsFolder(): Folder {
	return ReplicatedStorage.FindFirstChild("QuizEvents") as Folder;
}

function getOrCreateEvent(name: string): RemoteEvent {
	const folder = getEventsFolder();
	let event = folder.FindFirstChild(name) as RemoteEvent | undefined;
	if (!event) {
		event = new Instance("RemoteEvent");
		event.Name = name;
		event.Parent = folder;
	}
	return event;
}

function ensureEvents(): void {
	stickerCollectedEvent = getOrCreateEvent("StickerCollected");
	stickerCountEvent = getOrCreateEvent("StickerCount");
}

// --- 配置候補座標 ---

interface StickerPlacement {
	position: Vector3;
	normal: Vector3; // Decal面の向き（壁: Front/Back/Left/Right, 床: Top）
	type: "wall" | "floor";
}

function getStickerPlacements(): StickerPlacement[] {
	const placements: StickerPlacement[] = [];

	// 壁貼り: 迷路壁の側面
	const wallPositions: { pos: Vector3; normal: Vector3 }[] = [
		// 北東エリアの壁
		{ pos: new Vector3(35, 3, 26), normal: new Vector3(0, 0, 1) },
		{ pos: new Vector3(40, 3, 26), normal: new Vector3(0, 0, 1) },
		{ pos: new Vector3(29, 3, 30), normal: new Vector3(1, 0, 0) },
		{ pos: new Vector3(29, 3, 38), normal: new Vector3(1, 0, 0) },
		{ pos: new Vector3(42, 3, 19), normal: new Vector3(0, 0, 1) },
		{ pos: new Vector3(51, 3, 25), normal: new Vector3(1, 0, 0) },
		{ pos: new Vector3(51, 3, 35), normal: new Vector3(1, 0, 0) },
		// 北西エリアの壁
		{ pos: new Vector3(-35, 3, 26), normal: new Vector3(0, 0, 1) },
		{ pos: new Vector3(-40, 3, 26), normal: new Vector3(0, 0, 1) },
		{ pos: new Vector3(-29, 3, 30), normal: new Vector3(-1, 0, 0) },
		{ pos: new Vector3(-42, 3, 19), normal: new Vector3(0, 0, 1) },
		{ pos: new Vector3(-51, 3, 25), normal: new Vector3(-1, 0, 0) },
		// 南東エリアの壁
		{ pos: new Vector3(35, 3, -26), normal: new Vector3(0, 0, -1) },
		{ pos: new Vector3(29, 3, -30), normal: new Vector3(1, 0, 0) },
		{ pos: new Vector3(51, 3, -25), normal: new Vector3(1, 0, 0) },
		{ pos: new Vector3(42, 3, -19), normal: new Vector3(0, 0, -1) },
		// 南西エリアの壁
		{ pos: new Vector3(-35, 3, -26), normal: new Vector3(0, 0, -1) },
		{ pos: new Vector3(-29, 3, -30), normal: new Vector3(-1, 0, 0) },
		{ pos: new Vector3(-51, 3, -25), normal: new Vector3(-1, 0, 0) },
		// 外壁
		{ pos: new Vector3(20, 3, 74), normal: new Vector3(0, 0, -1) },
		{ pos: new Vector3(-20, 3, 74), normal: new Vector3(0, 0, -1) },
		{ pos: new Vector3(20, 3, -74), normal: new Vector3(0, 0, 1) },
		{ pos: new Vector3(-20, 3, -74), normal: new Vector3(0, 0, 1) },
		{ pos: new Vector3(74, 3, 20), normal: new Vector3(-1, 0, 0) },
		{ pos: new Vector3(-74, 3, 20), normal: new Vector3(1, 0, 0) },
		// 柱の側面
		{ pos: new Vector3(23, 3, 0), normal: new Vector3(1, 0, 0) },
		{ pos: new Vector3(-23, 3, 0), normal: new Vector3(-1, 0, 0) },
		{ pos: new Vector3(0, 3, 23), normal: new Vector3(0, 0, 1) },
		// 通路の壁
		{ pos: new Vector3(35, 3, 5), normal: new Vector3(0, 0, -1) },
		{ pos: new Vector3(-35, 3, -5), normal: new Vector3(0, 0, 1) },
		{ pos: new Vector3(5, 3, 35), normal: new Vector3(-1, 0, 0) },
		{ pos: new Vector3(-5, 3, -35), normal: new Vector3(1, 0, 0) },
	];

	for (const w of wallPositions) {
		placements.push({ position: w.pos, normal: w.normal, type: "wall" });
	}

	// 床置き: 広間の隅、通路、迷路の行き止まり
	const floorPositions: Vector3[] = [
		// 中央広間
		new Vector3(15, 0.8, 15),
		new Vector3(-15, 0.8, 15),
		new Vector3(15, 0.8, -15),
		new Vector3(-15, 0.8, -15),
		// 通路
		new Vector3(35, 0.8, 0),
		new Vector3(-35, 0.8, 0),
		new Vector3(0, 0.8, 35),
		new Vector3(0, 0.8, -35),
		new Vector3(45, 0.8, 0),
		new Vector3(-45, 0.8, 0),
		// 迷路の行き止まり
		new Vector3(48, 0.8, 45),
		new Vector3(-48, 0.8, 45),
		new Vector3(48, 0.8, -45),
		new Vector3(-48, 0.8, -45),
		new Vector3(55, 0.8, 15),
		new Vector3(-55, 0.8, 15),
		new Vector3(55, 0.8, -15),
		new Vector3(-55, 0.8, -15),
		// 追加
		new Vector3(30, 0.8, 40),
		new Vector3(-30, 0.8, -40),
		new Vector3(10, 0.8, 50),
		new Vector3(-10, 0.8, -50),
	];

	for (const pos of floorPositions) {
		placements.push({
			position: pos,
			normal: new Vector3(0, 1, 0),
			type: "floor",
		});
	}

	return placements;
}

// --- シャッフル ---

function shuffle<T>(arr: T[]): T[] {
	const result = [...arr];
	for (let i = result.size() - 1; i > 0; i--) {
		const j = math.floor(math.random() * (i + 1));
		const tmp = result[i];
		result[i] = result[j];
		result[j] = tmp;
	}
	return result;
}

// --- Decal面の決定 ---

function getNormalFace(normal: Vector3): Enum.NormalId {
	if (normal.Y > 0.5) return Enum.NormalId.Top;
	if (normal.Y < -0.5) return Enum.NormalId.Bottom;
	if (normal.X > 0.5) return Enum.NormalId.Right;
	if (normal.X < -0.5) return Enum.NormalId.Left;
	if (normal.Z > 0.5) return Enum.NormalId.Front;
	return Enum.NormalId.Back;
}

// --- シール1枚を生成 ---

function createStickerPart(placement: StickerPlacement, index: number): Part {
	const part = new Instance("Part");
	part.Name = `Sticker_${index}`;
	part.Anchored = true;
	part.CanCollide = false;

	if (placement.type === "wall") {
		// 壁貼り: 薄い板をDecal面に配置
		part.Size = new Vector3(3, 3, 0.2);
		// 壁面に沿うようにCFrameを設定
		const lookAt = placement.position.add(placement.normal);
		part.CFrame = CFrame.lookAt(placement.position, lookAt);
	} else {
		// 床置き: 薄い板をフラット配置
		part.Size = new Vector3(3, 0.2, 3);
		part.Position = placement.position;
	}

	part.Transparency = 0.5;
	part.Material = Enum.Material.Neon;
	part.BrickColor = new BrickColor("Bright yellow");

	// Decalを追加
	const decal = new Instance("Decal");
	const imageIndex = index % STICKER_IMAGE_IDS.size();
	decal.Texture = STICKER_IMAGE_IDS[imageIndex];

	if (placement.type === "wall") {
		decal.Face = Enum.NormalId.Back; // CFrame.lookAtの正面はBack
	} else {
		decal.Face = Enum.NormalId.Top;
	}

	decal.Parent = part;

	// 光るエフェクト
	const light = new Instance("PointLight");
	light.Color = new Color3(1, 1, 0.5);
	light.Brightness = 0.8;
	light.Range = 8;
	light.Parent = part;

	return part;
}

// --- Touch処理 ---

function onStickerTouched(stickerPart: Part, otherPart: BasePart): void {
	// 既に取得済みなら無視
	if (collectedStickers.has(stickerPart)) return;

	// プレイヤーのキャラクターか判定
	const character = otherPart.Parent as Model | undefined;
	if (!character) return;

	const humanoid = character.FindFirstChildWhichIsA("Humanoid");
	if (!humanoid) return;

	const player = Players.GetPlayerFromCharacter(character);
	if (!player) return;

	// 脱落済みプレイヤーは取得不可
	if (!isAlive(player)) return;

	// 1人限定で取得
	collectedStickers.add(stickerPart);

	// カウント加算
	const currentCount = (stickerCounts.get(player) ?? 0) + 1;
	stickerCounts.set(player, currentCount);

	// パーツを即Destroy
	stickerPart.Destroy();

	// クライアントに通知
	if (stickerCollectedEvent) {
		stickerCollectedEvent.FireClient(player, currentCount);
	}

	print(`[StickerManager] ${player.Name} collected sticker! Count: ${currentCount}`);
}

// === 公開API ===

export function spawnStickers(): void {
	ensureEvents();
	clearStickers();

	const folder = new Instance("Folder");
	folder.Name = STICKER_FOLDER_NAME;
	folder.Parent = Workspace;

	const allPlacements = getStickerPlacements();
	const shuffled = shuffle(allPlacements);

	// 20~30枚をランダムに選出
	const count = math.floor(math.random() * (STICKER_COUNT_MAX - STICKER_COUNT_MIN + 1)) + STICKER_COUNT_MIN;
	const selected: StickerPlacement[] = [];
	const limit = math.min(count, shuffled.size());
	for (let i = 0; i < limit; i++) {
		selected.push(shuffled[i]);
	}

	for (let i = 0; i < selected.size(); i++) {
		const placement = selected[i];
		const stickerPart = createStickerPart(placement, i);
		stickerPart.Parent = folder;

		// Touchイベント設定
		const conn = stickerPart.Touched.Connect((otherPart) => {
			onStickerTouched(stickerPart, otherPart);
		});
		touchConnections.push(conn);
	}

	// 全プレイヤーに初期カウント(0)を送信
	if (stickerCountEvent) {
		for (const player of Players.GetPlayers()) {
			stickerCountEvent.FireClient(player, 0);
		}
	}

	print(`[StickerManager] Spawned ${selected.size()} stickers.`);
}

export function getStickerCount(player: Player): number {
	return stickerCounts.get(player) ?? 0;
}

export function resetStickers(): void {
	stickerCounts.clear();
	collectedStickers.clear();
}

export function clearStickers(): void {
	// Touch接続を全解除
	for (const conn of touchConnections) {
		conn.Disconnect();
	}
	touchConnections.clear();

	// Workspace上のシールフォルダを削除
	const folder = Workspace.FindFirstChild(STICKER_FOLDER_NAME);
	if (folder) {
		folder.Destroy();
	}

	collectedStickers.clear();
}
