import { AnswerZoneDef, QuizQuestion } from "shared/types";

const Workspace = game.GetService("Workspace");

let currentZones: Part[] = [];

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

	// 色: 控えめな緑/赤（判定前は中間色）
	zone.BrickColor = new BrickColor("Medium stone grey");
	zone.Transparency = 0.3;

	// BillboardGuiでラベル表示
	const billboard = new Instance("BillboardGui");
	billboard.Name = "ZoneLabel";
	billboard.Size = new UDim2(8, 0, 4, 0);
	billboard.StudsOffset = new Vector3(0, 5, 0);
	billboard.AlwaysOnTop = true;
	billboard.Parent = zone;

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
	}

	print(`[ZoneManager] Spawned ${question.zones.size()} zones.`);
}

export function revealAnswers(question: QuizQuestion): void {
	for (let i = 0; i < currentZones.size(); i++) {
		const zone = currentZones[i];
		const zoneDef = question.zones[i];

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

	for (const zoneDef of question.zones) {
		if (isInsideZone(playerPos, zoneDef)) {
			return zoneDef.isCorrect;
		}
	}

	// どのゾーンにも入っていなければ不正解
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

	const zonesFolder = Workspace.FindFirstChild("QuizZones");
	if (zonesFolder) {
		zonesFolder.Destroy();
	}
}
