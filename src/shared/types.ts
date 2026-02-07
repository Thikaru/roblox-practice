// 回答ゾーン定義
export interface AnswerZoneDef {
	position: Vector3; // ゾーンの位置
	size: Vector3; // ゾーンの大きさ
	label: string; // 表示テキスト（"⭕", "❌", "A", "B"等）
	isCorrect: boolean; // 正解かどうか
}

// クイズ問題定義
export interface QuizQuestion {
	questionText: string; // 問題文
	timeLimit: number; // 制限時間（秒）
	zones: AnswerZoneDef[]; // 回答ゾーン配列
}

// ゲーム状態
export type GamePhase = "waiting" | "countdown" | "answering" | "judging" | "result" | "finished";

// サウンドID定数
export const SOUND_IDS = {
	CORRECT: "rbxassetid://9125402735",
	INCORRECT: "rbxassetid://9125958726",
	COUNTDOWN_TICK: "rbxassetid://9125958726",
	WINNER: "rbxassetid://1843463175",
	FIRE: "rbxassetid://9125402735",
} as const;
