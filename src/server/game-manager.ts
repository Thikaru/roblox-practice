import { GamePhase, SOUND_IDS } from "shared/types";
import { QUIZ_QUESTIONS } from "shared/quiz-data";
import { spawnZones, clearZones, judgePlayer, revealAnswers } from "./zone-manager";
import {
	initPlayerManager,
	registerPlayer,
	eliminatePlayer,
	isAlive,
	getAlivePlayers,
	getAliveCount,
	resetAllPlayers,
} from "./player-manager";
import { generateMap, updateScreen, updateScreenTimer, updateScreenResult, resetScreen } from "./map-generator";

const Players = game.GetService("Players");
const ReplicatedStorage = game.GetService("ReplicatedStorage");

const MIN_PLAYERS = 1;
const COUNTDOWN_TIME = 10;
const RESULT_DISPLAY_TIME = 3;

// RemoteEventsフォルダ
let eventsFolder: Folder;

function getOrCreateEvent(name: string): RemoteEvent {
	let event = eventsFolder.FindFirstChild(name) as RemoteEvent | undefined;
	if (!event) {
		event = new Instance("RemoteEvent");
		event.Name = name;
		event.Parent = eventsFolder;
	}
	return event;
}

// RemoteEvent参照
let quizStartEvent: RemoteEvent;
let questionShowEvent: RemoteEvent;
let timerUpdateEvent: RemoteEvent;
let judgeResultEvent: RemoteEvent;
let playerEliminatedEvent: RemoteEvent;
let gameFinishedEvent: RemoteEvent;
let phaseChangedEvent: RemoteEvent;

function setupEvents(): void {
	eventsFolder =
		(ReplicatedStorage.FindFirstChild("QuizEvents") as Folder) || (() => {
			const folder = new Instance("Folder");
			folder.Name = "QuizEvents";
			folder.Parent = ReplicatedStorage;
			return folder;
		})();

	quizStartEvent = getOrCreateEvent("QuizStart");
	questionShowEvent = getOrCreateEvent("QuestionShow");
	timerUpdateEvent = getOrCreateEvent("TimerUpdate");
	judgeResultEvent = getOrCreateEvent("JudgeResult");
	playerEliminatedEvent = getOrCreateEvent("PlayerEliminated");
	gameFinishedEvent = getOrCreateEvent("GameFinished");
	phaseChangedEvent = getOrCreateEvent("PhaseChanged");
}

function setupSounds(): void {
	let soundsFolder = ReplicatedStorage.FindFirstChild("Sounds") as Folder | undefined;
	if (!soundsFolder) {
		soundsFolder = new Instance("Folder");
		soundsFolder.Name = "Sounds";
		soundsFolder.Parent = ReplicatedStorage;
	}

	const soundDefs: { name: string; id: string }[] = [
		{ name: "Correct", id: SOUND_IDS.CORRECT },
		{ name: "Incorrect", id: SOUND_IDS.INCORRECT },
		{ name: "CountdownTick", id: SOUND_IDS.COUNTDOWN_TICK },
		{ name: "Winner", id: SOUND_IDS.WINNER },
	];

	for (const def of soundDefs) {
		if (!soundsFolder.FindFirstChild(def.name)) {
			const sound = new Instance("Sound");
			sound.Name = def.name;
			sound.SoundId = def.id;
			sound.Volume = 0.5;
			sound.Parent = soundsFolder;
		}
	}
}

function fireAllClients(event: RemoteEvent, ...args: unknown[]): void {
	event.FireAllClients(...args);
}

function fireClient(event: RemoteEvent, player: Player, ...args: unknown[]): void {
	event.FireClient(player, ...args);
}

let currentPhase: GamePhase = "waiting";
let currentQuestionIndex = 0;

function setPhase(phase: GamePhase): void {
	currentPhase = phase;
	fireAllClients(phaseChangedEvent, phase);
	print(`[GameManager] Phase: ${phase}`);
}

async function waitForPlayers(): Promise<void> {
	setPhase("waiting");
	resetScreen();

	while (Players.GetPlayers().size() < MIN_PLAYERS) {
		task.wait(1);
	}

	print(`[GameManager] ${Players.GetPlayers().size()} players joined. Starting game...`);
}

async function runCountdown(): Promise<void> {
	setPhase("countdown");
	fireAllClients(quizStartEvent);

	// 全プレイヤーを登録
	for (const player of Players.GetPlayers()) {
		registerPlayer(player);
	}

	updateScreenResult("ゲーム開始!");

	for (let i = COUNTDOWN_TIME; i > 0; i--) {
		fireAllClients(timerUpdateEvent, i, `ゲーム開始まで ${i}秒`);
		updateScreenTimer(i);
		task.wait(1);
	}
}

async function runQuestion(questionIndex: number): Promise<void> {
	const question = QUIZ_QUESTIONS[questionIndex];

	// ゾーン生成 & 問題表示
	spawnZones(question);
	setPhase("answering");
	fireAllClients(questionShowEvent, question.questionText, question.timeLimit, questionIndex + 1, QUIZ_QUESTIONS.size());
	updateScreen(question.questionText, questionIndex + 1, QUIZ_QUESTIONS.size());

	// タイマーカウントダウン
	for (let i = question.timeLimit; i > 0; i--) {
		fireAllClients(timerUpdateEvent, i, question.questionText);
		updateScreenTimer(i);
		task.wait(1);
	}
	fireAllClients(timerUpdateEvent, 0, question.questionText);
	updateScreenTimer(0);

	// 判定フェーズ
	setPhase("judging");
	revealAnswers(question);

	const alivePlayers = getAlivePlayers();
	const eliminatedThisRound: Player[] = [];

	for (const player of alivePlayers) {
		const correct = judgePlayer(player, question);
		fireClient(judgeResultEvent, player, correct);

		if (!correct) {
			eliminatedThisRound.push(player);
		}
	}

	task.wait(1);

	// 不正解者を脱落処理
	for (const player of eliminatedThisRound) {
		eliminatePlayer(player);
		fireAllClients(playerEliminatedEvent, player.Name);
	}

	// 結果表示
	setPhase("result");
	task.wait(RESULT_DISPLAY_TIME);

	// ゾーン削除
	clearZones();
}

async function runFinished(): Promise<void> {
	setPhase("finished");

	const winners = getAlivePlayers();
	const winnerNames = winners.map((p) => p.Name);

	if (winners.size() > 0) {
		fireAllClients(gameFinishedEvent, winnerNames, true);
		updateScreenResult(`おめでとう!\n勝者: ${winnerNames.join(", ")}`);
	} else {
		fireAllClients(gameFinishedEvent, [], false);
		updateScreenResult("全員脱落! 勝者なし");
	}

	// 勝者発表後の待ち時間
	task.wait(10);
}

export async function startGameLoop(): Promise<void> {
	// 初期化
	generateMap();
	initPlayerManager();
	setupEvents();
	setupSounds();

	print("[GameManager] Game system initialized.");

	// メインゲームループ
	while (true) {
		// プレイヤー待ち
		await waitForPlayers();

		// カウントダウン
		await runCountdown();

		// 問題ループ（全問必ず出題する）
		currentQuestionIndex = 0;
		while (currentQuestionIndex < QUIZ_QUESTIONS.size()) {
			await runQuestion(currentQuestionIndex);
			currentQuestionIndex++;
		}

		// ゲーム終了
		await runFinished();

		// リセット
		resetAllPlayers();
		clearZones();

		print("[GameManager] Game reset. Waiting for next round...");
		task.wait(3);
	}
}
