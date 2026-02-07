import { QuizQuestion } from "./types";

// ゾーン配置のメモ:
// 中央広間: (-25,-25) ~ (25,25) 柱が半径22に8本
// 通路: 東西 x=25~55, 南北 z=25~52
// 迷路壁: 各象限 28~55 あたり
// 木箱: (35,10),(-38,-8),(45,-20),(-42,22),(10,45),(-12,-42),(55,20),(-55,-20)
// 結晶: (48,40),(-48,40),(48,-40),(-48,-40),(30,50),(-30,-50)

export const QUIZ_QUESTIONS: QuizQuestion[] = [
	// ============================
	// Q1: 簡単 - 広間から丸見えの大きなゾーン
	// ============================
	{
		questionText: "【世界史】1713年に締結され、スペイン継承戦争を終結させるとともに、イギリスの植民地帝国としての基礎を築くことになった条約は、ヴェルサイユ条約である。⭕正しい ❌間違い",
		timeLimit: 7,
		explanation: "正解は ❌ です。1713年に締結されたのは「ユトレヒト条約」です。ヴェルサイユ条約は1919年の第一次世界大戦後に締結されたものです。",
		zones: [
			// --- 正解（⭕）大きく見やすい ---
			{ position: new Vector3(15, 1, 8), size: new Vector3(16, 1, 16), label: "⭕", isCorrect: false },
			// --- 不正解（❌）同じく見やすい ---
			{ position: new Vector3(-15, 1, 8), size: new Vector3(16, 1, 16), label: "❌", isCorrect: true },
		],
	},

	// ============================
	// Q2: やや難しい - ゾーンが小さくなり通路に散らばる
	// ============================
	{
		questionText: "【日本史】日本の元号の中で、使用された期間が約2カ月強と「歴代で最も短かった」とされる元号は？(※改元から改元までの期間)朱鳥である。 ⭕はい ❌いいえ",
		timeLimit: 9,
		explanation: "正解は ❌ です。最も短い元号は「暦仁」（りゃくにん）で約2ヶ月半です。朱鳥（あかみとり）は約1年2ヶ月使用されました。",
		zones: [
			// --- 正解（⭕）見えるが少し遠い ---
			{ position: new Vector3(-18, 1, 0), size: new Vector3(10, 1, 10), label: "⭕", isCorrect: false },
			// --- 不正解（❌）通路の先 ---
			{ position: new Vector3(-38, 1, 0), size: new Vector3(6, 1, 6), label: "❌", isCorrect: true, hidden: true },
		],
	},

	// // ============================
	// // Q3: 4択問題 - labelに選択肢テキストを表示
	// // ============================
	// {
	// 	questionText: "【地理】世界で最も面積が大きい国はどれ？",
	// 	timeLimit: 15,
	// 	explanation: "正解は A: ロシア です。面積は約1,710万km²で、2位のカナダ（約998万km²）を大きく上回り世界最大です。",
	// 	zones: [
	// 		// --- A: ロシア（正解）広間の4方向に配置 ---
	// 		// 通路の奥にも正解を1つ隠す
	// 		{ position: new Vector3(40, 1, 3), size: new Vector3(4, 1, 4), label: "A: ロシア", isCorrect: true, hidden: true },

	// 		// --- B: カナダ（不正解） ---
	// 		{ position: new Vector3(-18, 1, 12), size: new Vector3(10, 1, 10), label: "B: カナダ", isCorrect: false },

	// 		// --- C: アメリカ（不正解） ---
	// 		{ position: new Vector3(-18, 1, -12), size: new Vector3(10, 1, 10), label: "C: アメリカ", isCorrect: false },

	// 		// --- D: 中国（不正解） ---
	// 		{ position: new Vector3(18, 1, -12), size: new Vector3(10, 1, 10), label: "D: 中国", isCorrect: false },

	// 		// 迷路内にもトラップ
	// 		{ position: new Vector3(-35, 1, 28), size: new Vector3(5, 1, 5), label: "B: カナダ", isCorrect: false, hidden: true },
	// 		{ position: new Vector3(35, 1, -28), size: new Vector3(5, 1, 5), label: "C: アメリカ", isCorrect: false, hidden: true },
	// 	],
	// },

	// ============================
	// Q4: 蓋付きギミック - 木箱/樽/岩をどかさないと回答が見えない
	// ============================
	{
		questionText: "【万葉集】「あをによし 奈良の都は 咲く花の」…この歌の下の句は？ オブジェクトを押して隠されたマスを探せ!",
		timeLimit: 20,
		explanation: "正解は D: 「にほふがごとく 今盛りなり」です。小野老(おののおゆ)が詠んだ歌で、奈良の都の繁栄を咲き誇る花に例えた有名な一首です。",
		zones: [
			// --- 正解: D: にほふがごとく 今盛りなり ---
			{ position: new Vector3(15, 1, 15), size: new Vector3(5, 1, 5), label: "D: にほふがごとく 今盛りなり", isCorrect: true, cover: "crate" },
			{ position: new Vector3(-35, 1, 30), size: new Vector3(4, 1, 4), label: "D: にほふがごとく 今盛りなり", isCorrect: true, cover: "rock", hidden: true },
			{ position: new Vector3(-8, 1, -18), size: new Vector3(4, 1, 4), label: "D: にほふがごとく 今盛りなり", isCorrect: true },

			// --- 不正解: A: うつろひにけり 世の中ぞ憂き（それっぽい偽選択肢）---
			{ position: new Vector3(-15, 1, 10), size: new Vector3(8, 1, 8), label: "A: うつろひにけり 世の中ぞ憂き", isCorrect: false },
			{ position: new Vector3(40, 1, 0), size: new Vector3(5, 1, 5), label: "A: うつろひにけり 世の中ぞ憂き", isCorrect: false, hidden: true },

			// --- 不正解: B: 散りぬるを我が世 誰ぞ常ならむ ---
			{ position: new Vector3(15, 1, -10), size: new Vector3(8, 1, 8), label: "B: 散りぬるを 我が世誰ぞ常ならむ", isCorrect: false },
			{ position: new Vector3(0, 1, 35), size: new Vector3(5, 1, 5), label: "B: 散りぬるを 我が世誰ぞ常ならむ", isCorrect: false, cover: "barrel", hidden: true },

			// --- 不正解: C: 照りはさやけき この月夜かも ---
			{ position: new Vector3(-15, 1, -10), size: new Vector3(8, 1, 8), label: "C: 照りはさやけき この月夜かも", isCorrect: false },
			{ position: new Vector3(-40, 1, -3), size: new Vector3(5, 1, 5), label: "C: 照りはさやけき この月夜かも", isCorrect: false, cover: "crate", hidden: true },
		],
	},

	// // ============================
	// // Q5: 最終問題 - 4択 + 蓋ギミック + 極小ゾーン
	// // ============================
	// {
	// 	questionText: "【歴史】「我思う、ゆえに我あり」を唱えた哲学者は？",
	// 	timeLimit: 18,
	// 	explanation: "正解は B: デカルト です。「我思う、ゆえに我あり（Cogito, ergo sum）」はフランスの哲学者ルネ・デカルトの有名な命題です。",
	// 	zones: [
	// 		// --- 正解: B: デカルト ---
	// 		// 岩の下（広間近く）
	// 		{ position: new Vector3(10, 1, 0), size: new Vector3(5, 1, 5), label: "B: デカルト", isCorrect: true, cover: "rock" },
	// 		// 迷路の奥、蓋なし極小
	// 		{ position: new Vector3(47, 1, 42), size: new Vector3(3, 1, 3), label: "B: デカルト", isCorrect: true, hidden: true },
	// 		// 樽の下（南通路）
	// 		{ position: new Vector3(3, 1, -40), size: new Vector3(3, 1, 3), label: "B: デカルト", isCorrect: true, cover: "barrel", hidden: true },

	// 		// --- 不正解: A: ソクラテス（トラップ、目立つ） ---
	// 		{ position: new Vector3(-12, 1, 12), size: new Vector3(8, 1, 8), label: "A: ソクラテス", isCorrect: false },
	// 		{ position: new Vector3(35, 1, 0), size: new Vector3(5, 1, 5), label: "A: ソクラテス", isCorrect: false, hidden: true },
	// 		// 木箱の下にもトラップ
	// 		{ position: new Vector3(-42, 1, 20), size: new Vector3(4, 1, 4), label: "A: ソクラテス", isCorrect: false, cover: "crate", hidden: true },

	// 		// --- 不正解: C: アリストテレス ---
	// 		{ position: new Vector3(12, 1, -12), size: new Vector3(8, 1, 8), label: "C: アリストテレス", isCorrect: false },
	// 		{ position: new Vector3(-35, 1, 0), size: new Vector3(5, 1, 5), label: "C: アリストテレス", isCorrect: false, hidden: true },

	// 		// --- 不正解: D: プラトン ---
	// 		{ position: new Vector3(-12, 1, -12), size: new Vector3(8, 1, 8), label: "D: プラトン", isCorrect: false },
	// 		// 岩の下にトラップ
	// 		{ position: new Vector3(45, 1, -20), size: new Vector3(4, 1, 4), label: "D: プラトン", isCorrect: false, cover: "rock", hidden: true },
	// 		{ position: new Vector3(0, 1, 38), size: new Vector3(4, 1, 4), label: "D: プラトン", isCorrect: false, cover: "crate", hidden: true },
	// 	],
	// },
];
