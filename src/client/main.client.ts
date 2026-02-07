import {
	initUI,
	showWaiting,
	showCountdown,
	showQuestion,
	updateTimer,
	showResult,
	showEliminated,
	showGhost,
	showFinished,
	hideAll,
} from "./ui/quiz-ui";
import { GamePhase, SOUND_IDS } from "shared/types";

const Players = game.GetService("Players");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const SoundService = game.GetService("SoundService");
const LocalPlayer = Players.LocalPlayer;

// RemoteEventsの取得を待つ
function waitForEvent(name: string): RemoteEvent {
	const folder = ReplicatedStorage.WaitForChild("QuizEvents");
	return folder.WaitForChild(name) as RemoteEvent;
}

// サウンド再生
function playSound(soundName: string): void {
	const soundsFolder = ReplicatedStorage.FindFirstChild("Sounds");
	if (soundsFolder) {
		const sound = soundsFolder.FindFirstChild(soundName) as Sound | undefined;
		if (sound) {
			sound.Play();
		}
	}
}

// 初期化
print("[Client] Quiz Game client starting...");
initUI();
showWaiting();

let isEliminated = false;

// イベント接続
const quizStartEvent = waitForEvent("QuizStart");
const questionShowEvent = waitForEvent("QuestionShow");
const timerUpdateEvent = waitForEvent("TimerUpdate");
const judgeResultEvent = waitForEvent("JudgeResult");
const playerEliminatedEvent = waitForEvent("PlayerEliminated");
const gameFinishedEvent = waitForEvent("GameFinished");
const phaseChangedEvent = waitForEvent("PhaseChanged");

// ゲーム開始
quizStartEvent.OnClientEvent.Connect(() => {
	isEliminated = false;
	hideAll();
});

// 問題表示
questionShowEvent.OnClientEvent.Connect((questionText: unknown, timeLimit: unknown, questionNum: unknown, totalQuestions: unknown) => {
	showQuestion(
		questionText as string,
		timeLimit as number,
		questionNum as number,
		totalQuestions as number,
	);
});

// タイマー更新
timerUpdateEvent.OnClientEvent.Connect((seconds: unknown, _text: unknown) => {
	const sec = seconds as number;
	updateTimer(sec);

	if (sec <= 3 && sec > 0) {
		playSound("CountdownTick");
	}
});

// 判定結果
judgeResultEvent.OnClientEvent.Connect((correct: unknown) => {
	const isCorrect = correct as boolean;
	showResult(isCorrect);

	if (isCorrect) {
		playSound("Correct");
	} else {
		playSound("Incorrect");
		isEliminated = true;
	}
});

// プレイヤー脱落通知
playerEliminatedEvent.OnClientEvent.Connect((playerName: unknown) => {
	const name = playerName as string;
	showEliminated(name);

	// 自分が脱落した場合
	if (name === LocalPlayer.Name) {
		task.delay(2, () => {
			showGhost();
		});
	}
});

// フェーズ変更
phaseChangedEvent.OnClientEvent.Connect((phase: unknown) => {
	const gamePhase = phase as GamePhase;

	if (gamePhase === "waiting") {
		isEliminated = false;
		showWaiting();
	}
});

// ゲーム終了
gameFinishedEvent.OnClientEvent.Connect((winnerNames: unknown, hasWinner: unknown) => {
	showFinished(winnerNames as string[], hasWinner as boolean);

	if (hasWinner as boolean) {
		playSound("Winner");
	}
});
