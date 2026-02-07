import { QuizQuestion } from "./types";

// 問題追加はこの配列に追加するだけ
export const QUIZ_QUESTIONS: QuizQuestion[] = [
	{
		questionText: "日本の首都はどこ？ ⭕東京 ❌大阪",
		timeLimit: 15,
		zones: [
			{
				position: new Vector3(20, 1, 0),
				size: new Vector3(20, 1, 20),
				label: "⭕",
				isCorrect: true,
			},
			{
				position: new Vector3(-20, 1, 0),
				size: new Vector3(20, 1, 20),
				label: "❌",
				isCorrect: false,
			},
		],
	},
	{
		questionText: "地球は太陽の周りを回っている？ ⭕はい ❌いいえ",
		timeLimit: 12,
		zones: [
			{
				position: new Vector3(25, 1, 10),
				size: new Vector3(16, 1, 16),
				label: "⭕",
				isCorrect: true,
			},
			{
				position: new Vector3(-25, 1, -10),
				size: new Vector3(16, 1, 16),
				label: "❌",
				isCorrect: false,
			},
		],
	},
	{
		questionText: "水の化学式はH2Oである？ ⭕正しい ❌間違い",
		timeLimit: 10,
		zones: [
			{
				position: new Vector3(15, 1, 20),
				size: new Vector3(12, 1, 12),
				label: "⭕",
				isCorrect: true,
			},
			{
				position: new Vector3(-15, 1, -20),
				size: new Vector3(12, 1, 12),
				label: "❌",
				isCorrect: false,
			},
		],
	},
	{
		questionText: "ピカチュウはみずタイプ？ ⭕はい ❌いいえ",
		timeLimit: 10,
		zones: [
			{
				position: new Vector3(30, 1, 0),
				size: new Vector3(10, 1, 10),
				label: "⭕",
				isCorrect: false,
			},
			{
				position: new Vector3(-30, 1, 0),
				size: new Vector3(10, 1, 10),
				label: "❌",
				isCorrect: true,
			},
		],
	},
	{
		questionText: "1+1=3である？ ⭕正しい ❌間違い",
		timeLimit: 8,
		zones: [
			{
				position: new Vector3(20, 1, -15),
				size: new Vector3(14, 1, 14),
				label: "⭕",
				isCorrect: false,
			},
			{
				position: new Vector3(-20, 1, 15),
				size: new Vector3(14, 1, 14),
				label: "❌",
				isCorrect: true,
			},
		],
	},
];
