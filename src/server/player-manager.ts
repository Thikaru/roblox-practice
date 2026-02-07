const Players = game.GetService("Players");
const PhysicsService = game.GetService("PhysicsService");

const ALIVE_GROUP = "Alive";
const GHOST_GROUP = "Ghost";
const GHOST_TRANSPARENCY = 0.6;
const FIRE_DURATION = 2;

// 生存プレイヤーのセット
const alivePlayers = new Set<Player>();
// ゴーストプレイヤーのセット
const ghostPlayers = new Set<Player>();

function setupCollisionGroups(): void {
	PhysicsService.RegisterCollisionGroup(ALIVE_GROUP);
	PhysicsService.RegisterCollisionGroup(GHOST_GROUP);

	// Ghost同士のコリジョンを無効化
	PhysicsService.CollisionGroupSetCollidable(GHOST_GROUP, GHOST_GROUP, false);
	// Ghost-Alive間のコリジョンを無効化
	PhysicsService.CollisionGroupSetCollidable(GHOST_GROUP, ALIVE_GROUP, false);
}

function setCharacterCollisionGroup(character: Model, groupName: string): void {
	for (const part of character.GetDescendants()) {
		if (part.IsA("BasePart")) {
			part.CollisionGroup = groupName;
		}
	}
}

function setCharacterTransparency(character: Model, transparency: number): void {
	for (const part of character.GetDescendants()) {
		if (part.IsA("BasePart") && part.Name !== "HumanoidRootPart") {
			part.Transparency = transparency;
		}
	}
}

function addFireEffect(character: Model): void {
	const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (!rootPart) return;

	const fire = new Instance("Fire");
	fire.Name = "EliminationFire";
	fire.Size = 10;
	fire.Heat = 15;
	fire.Color = new Color3(1, 0.5, 0);
	fire.SecondaryColor = new Color3(1, 0, 0);
	fire.Parent = rootPart;

	// 一定時間後にFireを消す
	task.delay(FIRE_DURATION, () => {
		if (fire && fire.Parent) {
			fire.Destroy();
		}
	});
}

export function initPlayerManager(): void {
	setupCollisionGroups();

	// プレイヤー参加時にAliveグループに設定
	Players.PlayerAdded.Connect((player) => {
		player.CharacterAdded.Connect((character) => {
			if (alivePlayers.has(player)) {
				setCharacterCollisionGroup(character, ALIVE_GROUP);
			} else if (ghostPlayers.has(player)) {
				setCharacterCollisionGroup(character, GHOST_GROUP);
				setCharacterTransparency(character, GHOST_TRANSPARENCY);
			}
		});
	});

	// プレイヤー退出時にリストから削除
	Players.PlayerRemoving.Connect((player) => {
		alivePlayers.delete(player);
		ghostPlayers.delete(player);
	});
}

export function registerPlayer(player: Player): void {
	alivePlayers.add(player);
	ghostPlayers.delete(player);

	const character = player.Character;
	if (character) {
		setCharacterCollisionGroup(character, ALIVE_GROUP);
		setCharacterTransparency(character, 0);
	}
}

export function eliminatePlayer(player: Player): void {
	alivePlayers.delete(player);
	ghostPlayers.add(player);

	const character = player.Character;
	if (character) {
		// 燃えるエフェクト
		addFireEffect(character);

		// エフェクト後にゴースト化
		task.delay(FIRE_DURATION, () => {
			const currentCharacter = player.Character;
			if (currentCharacter) {
				setCharacterCollisionGroup(currentCharacter, GHOST_GROUP);
				setCharacterTransparency(currentCharacter, GHOST_TRANSPARENCY);
			}
		});
	}
}

export function isAlive(player: Player): boolean {
	return alivePlayers.has(player);
}

export function getAlivePlayers(): Player[] {
	const result: Player[] = [];
	alivePlayers.forEach((player) => {
		if (player.Parent) {
			result.push(player);
		}
	});
	return result;
}

export function getAliveCount(): number {
	return getAlivePlayers().size();
}

export function resetAllPlayers(): void {
	// 全プレイヤーをAlive状態にリセット
	for (const player of Players.GetPlayers()) {
		alivePlayers.add(player);
		ghostPlayers.delete(player);

		const character = player.Character;
		if (character) {
			setCharacterCollisionGroup(character, ALIVE_GROUP);
			setCharacterTransparency(character, 0);
		}
	}
}
