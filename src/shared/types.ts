// 押せるオブジェクトの種類
export type CoverType = "crate" | "barrel" | "rock";

// 回答ゾーン定義
export interface AnswerZoneDef {
	position: Vector3; // ゾーンの位置
	size: Vector3; // ゾーンの大きさ
	label: string; // 表示テキスト（"⭕", "❌", "A: 東京" 等、自由なテキスト）
	isCorrect: boolean; // 正解かどうか
	hidden?: boolean; // trueならラベルが壁越しに見えない（隠しゾーン）
	cover?: CoverType; // 押せるオブジェクトで蓋をする（押しのけないとゾーンが見えない）
}

// クイズ問題定義
export interface QuizQuestion {
	questionText: string; // 問題文
	timeLimit: number; // 制限時間（秒）
	zones: AnswerZoneDef[]; // 回答ゾーン配列
	explanation?: string; // 正解後の解説文
}

// ゲーム状態
export type GamePhase = "waiting" | "countdown" | "answering" | "judging" | "result" | "explanation" | "finished";

// サウンドID定数
export const SOUND_IDS = {
	CORRECT: "rbxassetid://9125402735",
	INCORRECT: "rbxassetid://9125958726",
	COUNTDOWN_TICK: "rbxassetid://9125958726",
	WINNER: "rbxassetid://1843463175",
	FIRE: "rbxassetid://9125402735",
} as const;

// シールアイコン画像ID
// ※ Roblox Studioで画像をアップロード後、ここのIDを差し替えてください
// アップロード手順: Roblox Studio → Asset Manager → Images → Upload → IDをコピー
export const STICKER_ICON_ID = "rbxassetid://6031075938"; // ← アップロード後に差し替え

// シール画像ID（マップ上のDecal用）
export const STICKER_IMAGE_IDS: string[] = [
	STICKER_ICON_ID,
];
