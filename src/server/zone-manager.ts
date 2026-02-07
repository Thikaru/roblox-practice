import { AnswerZoneDef, CoverType, QuizQuestion } from "shared/types";

const Workspace = game.GetService("Workspace");

let currentZones: Part[] = [];

// --- 蓋オブジェクト（押せるパーツ）の生成 ---

function createCoverObject(zoneDef: AnswerZoneDef, parent: Instance): Part {
	const coverType = zoneDef.cover!;
	const part = new Instance("Part");
	part.Name = `Cover_${coverType}`;
	part.Anchored = false; // 押せるようにする
	part.CanCollide = true;

	// ゾーンより少し大きく、上に乗せる
	const coverHeight = math.max(zoneDef.size.X, zoneDef.size.Z) * 0.8;
	const coverWidth = math.max(zoneDef.size.X, zoneDef.size.Z);

	switch (coverType) {
		case "crate":
			part.Size = new Vector3(coverWidth, coverHeight, coverWidth);
			part.BrickColor = new BrickColor("Brown");
			part.Material = Enum.Material.WoodPlanks;
			break;
		case "barrel":
			part.Shape = Enum.PartType.Cylinder;
			part.Size = new Vector3(coverHeight, coverWidth, coverWidth);
			part.BrickColor = new BrickColor("Reddish brown");
			part.Material = Enum.Material.Wood;
			// シリンダーは横倒しになるので回転
			part.CFrame = new CFrame(
				zoneDef.position.X,
				zoneDef.position.Y + coverHeight / 2 + 0.5,
				zoneDef.position.Z,
			).mul(CFrame.Angles(0, 0, math.rad(90)));
			break;
		case "rock":
			part.Size = new Vector3(coverWidth * 1.1, coverHeight * 0.7, coverWidth * 1.1);
			part.BrickColor = new BrickColor("Dark stone grey");
			part.Material = Enum.Material.Slate;
			break;
	}

	// barrel以外は通常配置
	if (coverType !== "barrel") {
		part.Position = new Vector3(
			zoneDef.position.X,
			zoneDef.position.Y + coverHeight / 2 + 0.5,
			zoneDef.position.Z,
		);
	}

	// 物理設定: タイプ別の重さ
	if (coverType === "rock") {
		part.CustomPhysicalProperties = new PhysicalProperties(
			8, // density: かなり重い（岩）
			1.5, // friction: 高摩擦で滑りにくい
			0, // elasticity: 跳ねない
		);
	} else {
		part.CustomPhysicalProperties = new PhysicalProperties(
			3, // density: そこそこ重い
			0.5, // friction: 適度な摩擦
			0, // elasticity: 跳ねない
		);
	}

	part.TopSurface = Enum.SurfaceType.Smooth;
	part.BottomSurface = Enum.SurfaceType.Smooth;
	part.Parent = parent;

	return part;
}

// --- ゾーンパーツの生成 ---

function createZonePart(zoneDef: AnswerZoneDef): Part {
	const zone = new Instance("Part");
	zone.Name = `AnswerZone_${zoneDef.label}`;
	zone.Size = zoneDef.size;
	zone.Position = zoneDef.position;
	zone.Anchored = true;
	zone.CanCollide = false;
	zone.Material = Enum.Material.Neon;
	zone.TopSurface = Enum.SurfaceType.Smooth;
	zone.BottomSurface = Enum.SurfaceType.Smooth;

	// 判定前は中間色
	zone.BrickColor = new BrickColor("Medium stone grey");
	zone.Transparency = 0.3;

	// ゾーンサイズに応じてラベルのサイズを調整
	const zoneMinSide = math.min(zoneDef.size.X, zoneDef.size.Z);
	const billboardScale = math.clamp(zoneMinSide / 4, 0.5, 2);

	// ラベルの文字数に応じて横幅を広げる
	const labelLen = zoneDef.label.size();
	const widthMultiplier = math.clamp(labelLen / 2, 1, 4);

	const billboard = new Instance("BillboardGui");
	billboard.Name = "ZoneLabel";
	billboard.Size = new UDim2(4 * billboardScale * widthMultiplier, 0, 2 * billboardScale, 0);
	billboard.StudsOffset = new Vector3(0, 3, 0);
	billboard.Parent = zone;

	// 隠しゾーン or 蓋付き: 壁越しにラベルが見えない
	const isObscured = zoneDef.hidden === true || zoneDef.cover !== undefined;
	billboard.AlwaysOnTop = !isObscured;

	const textLabel = new Instance("TextLabel");
	textLabel.Name = "LabelText";
	textLabel.Size = new UDim2(1, 0, 1, 0);
	textLabel.BackgroundTransparency = 1;
	textLabel.Text = zoneDef.label;
	textLabel.TextColor3 = new Color3(1, 1, 1);
	textLabel.TextScaled = true;
	textLabel.Font = Enum.Font.GothamBold;
	textLabel.Parent = billboard;

	return zone;
}

export function spawnZones(question: QuizQuestion): void {
	clearZones();

	const zonesFolder =
		(Workspace.FindFirstChild("QuizZones") as Folder) || (() => {
			const folder = new Instance("Folder");
			folder.Name = "QuizZones";
			folder.Parent = Workspace;
			return folder;
		})();

	for (const zoneDef of question.zones) {
		const zone = createZonePart(zoneDef);
		zone.Parent = zonesFolder;
		currentZones.push(zone);

		// 蓋オブジェクトがある場合は生成
		if (zoneDef.cover !== undefined) {
			createCoverObject(zoneDef, zonesFolder);
		}
	}

	print(`[ZoneManager] Spawned ${question.zones.size()} zones.`);
}

export function revealAnswers(question: QuizQuestion): void {
	for (let i = 0; i < currentZones.size(); i++) {
		const zone = currentZones[i];
		const zoneDef = question.zones[i];

		// 判定後は全ゾーンを可視化
		const billboard = zone.FindFirstChild("ZoneLabel") as BillboardGui | undefined;
		if (billboard) {
			billboard.AlwaysOnTop = true;
		}

		if (zoneDef.isCorrect) {
			zone.BrickColor = new BrickColor("Bright green");
			zone.Transparency = 0.1;
		} else {
			zone.BrickColor = new BrickColor("Bright red");
			zone.Transparency = 0.1;
		}
	}
}

export function judgePlayer(player: Player, question: QuizQuestion): boolean {
	const character = player.Character;
	if (!character) return false;

	const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (!rootPart) return false;

	const playerPos = rootPart.Position;

	// どれか一つでも正解ゾーンに乗っていればOK
	for (const zoneDef of question.zones) {
		if (isInsideZone(playerPos, zoneDef)) {
			if (zoneDef.isCorrect) {
				return true;
			}
		}
	}

	return false;
}

function isInsideZone(position: Vector3, zoneDef: AnswerZoneDef): boolean {
	const halfSize = zoneDef.size.div(2);
	const zonePos = zoneDef.position;

	return (
		position.X >= zonePos.X - halfSize.X &&
		position.X <= zonePos.X + halfSize.X &&
		position.Z >= zonePos.Z - halfSize.Z &&
		position.Z <= zonePos.Z + halfSize.Z
	);
}

export function clearZones(): void {
	for (const zone of currentZones) {
		if (zone.Parent) {
			zone.Destroy();
		}
	}
	currentZones = [];

	// フォルダごと削除（蓋オブジェクトも一緒に消える）
	const zonesFolder = Workspace.FindFirstChild("QuizZones");
	if (zonesFolder) {
		zonesFolder.Destroy();
	}
}
