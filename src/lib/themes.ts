export type Theme = {
  name: string;
  label: string;
  description: string;
  category: "minimal" | "vibrant" | "dark" | "creative";
  bgColor: string;
  textColor: string;
  cardBg: string;
  cardBorder: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  buttonStyle: "rounded" | "pill" | "square" | "soft";
  cardStyle: "flat" | "elevated" | "bordered" | "glass";
  fontFamily: string;
  previewGradient: string;
};

export const themes: Record<string, Theme> = {
  // === Minimal Category ===
  minimal: {
    name: "minimal",
    label: "ミニマル",
    description: "シンプルで洗練されたデザイン",
    category: "minimal",
    bgColor: "bg-white",
    textColor: "text-gray-900",
    cardBg: "bg-gray-50",
    cardBorder: "border border-gray-200",
    accentColor: "bg-gray-900",
    gradientFrom: "from-gray-700",
    gradientTo: "to-gray-900",
    buttonStyle: "rounded",
    cardStyle: "bordered",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-gray-100 to-gray-200",
  },
  
  cream: {
    name: "cream",
    label: "クリーム",
    description: "温かみのあるクリームカラー",
    category: "minimal",
    bgColor: "bg-amber-50",
    textColor: "text-amber-950",
    cardBg: "bg-white",
    cardBorder: "border border-amber-200",
    accentColor: "bg-amber-600",
    gradientFrom: "from-amber-400",
    gradientTo: "to-orange-500",
    buttonStyle: "soft",
    cardStyle: "elevated",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-amber-100 to-orange-200",
  },

  monochrome: {
    name: "monochrome",
    label: "モノクローム",
    description: "白黒のモダンなデザイン",
    category: "minimal",
    bgColor: "bg-white",
    textColor: "text-black",
    cardBg: "bg-black",
    cardBorder: "border-2 border-black",
    accentColor: "bg-black",
    gradientFrom: "from-black",
    gradientTo: "to-gray-800",
    buttonStyle: "square",
    cardStyle: "bordered",
    fontFamily: "font-mono",
    previewGradient: "bg-gradient-to-br from-gray-100 to-gray-300",
  },

  // === Vibrant Category ===
  sunset: {
    name: "sunset",
    label: "サンセット",
    description: "夕焼けをイメージした暖色系",
    category: "vibrant",
    bgColor: "bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50",
    textColor: "text-gray-900",
    cardBg: "bg-white",
    cardBorder: "border border-orange-200",
    accentColor: "bg-gradient-to-r from-orange-500 to-pink-500",
    gradientFrom: "from-orange-400",
    gradientTo: "to-rose-500",
    buttonStyle: "pill",
    cardStyle: "elevated",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-orange-300 via-pink-300 to-purple-400",
  },

  ocean: {
    name: "ocean",
    label: "オーシャン",
    description: "海をイメージした青系グラデーション",
    category: "vibrant",
    bgColor: "bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50",
    textColor: "text-blue-950",
    cardBg: "bg-white/80 backdrop-blur",
    cardBorder: "border border-blue-200",
    accentColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
    gradientFrom: "from-blue-500",
    gradientTo: "to-cyan-600",
    buttonStyle: "pill",
    cardStyle: "glass",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500",
  },

  sakura: {
    name: "sakura",
    label: "サクラ",
    description: "桜をイメージしたピンク系",
    category: "vibrant",
    bgColor: "bg-gradient-to-br from-pink-50 via-rose-50 to-red-50",
    textColor: "text-pink-950",
    cardBg: "bg-white",
    cardBorder: "border border-pink-200",
    accentColor: "bg-gradient-to-r from-pink-400 to-rose-500",
    gradientFrom: "from-pink-400",
    gradientTo: "to-rose-500",
    buttonStyle: "pill",
    cardStyle: "elevated",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-pink-300 via-rose-300 to-red-300",
  },

  aurora: {
    name: "aurora",
    label: "オーロラ",
    description: "北極光をイメージした神秘的なデザイン",
    category: "vibrant",
    bgColor: "bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900",
    textColor: "text-white",
    cardBg: "bg-white/10 backdrop-blur-md",
    cardBorder: "border border-white/20",
    accentColor: "bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500",
    gradientFrom: "from-cyan-400",
    gradientTo: "to-purple-600",
    buttonStyle: "pill",
    cardStyle: "glass",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500",
  },

  // === Dark Category ===
  dark: {
    name: "dark",
    label: "ダーク",
    description: "シンプルなダークモード",
    category: "dark",
    bgColor: "bg-slate-900",
    textColor: "text-slate-100",
    cardBg: "bg-slate-800",
    cardBorder: "border border-slate-700",
    accentColor: "bg-slate-600",
    gradientFrom: "from-slate-700",
    gradientTo: "to-gray-800",
    buttonStyle: "rounded",
    cardStyle: "elevated",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-slate-700 to-slate-900",
  },

  midnight: {
    name: "midnight",
    label: "ミッドナイト",
    description: "深夜をイメージした深い青",
    category: "dark",
    bgColor: "bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950",
    textColor: "text-blue-100",
    cardBg: "bg-blue-950/50 backdrop-blur",
    cardBorder: "border border-blue-800/50",
    accentColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
    gradientFrom: "from-blue-600",
    gradientTo: "to-indigo-700",
    buttonStyle: "rounded",
    cardStyle: "glass",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-blue-800 to-indigo-900",
  },

  neon: {
    name: "neon",
    label: "ネオン",
    description: "サイバーパンク風のネオンデザイン",
    category: "dark",
    bgColor: "bg-black",
    textColor: "text-white",
    cardBg: "bg-black",
    cardBorder: "border border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
    accentColor: "bg-gradient-to-r from-cyan-500 to-purple-500",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-purple-600",
    buttonStyle: "square",
    cardStyle: "bordered",
    fontFamily: "font-mono",
    previewGradient: "bg-gradient-to-br from-cyan-500 to-purple-600",
  },

  // === Creative Category ===
  glass: {
    name: "glass",
    label: "グラスモーフィズム",
    description: "ガラス効果を使ったモダンなデザイン",
    category: "creative",
    bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
    textColor: "text-white",
    cardBg: "bg-white/20 backdrop-blur-xl",
    cardBorder: "border border-white/30",
    accentColor: "bg-white/30 backdrop-blur",
    gradientFrom: "from-white/40",
    gradientTo: "to-white/20",
    buttonStyle: "pill",
    cardStyle: "glass",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400",
  },

  luxury: {
    name: "luxury",
    label: "ラグジュアリー",
    description: "高級感のあるゴールド×ブラック",
    category: "creative",
    bgColor: "bg-gradient-to-br from-stone-900 via-neutral-900 to-zinc-900",
    textColor: "text-amber-100",
    cardBg: "bg-gradient-to-br from-neutral-900 to-stone-900",
    cardBorder: "border border-amber-600/30",
    accentColor: "bg-gradient-to-r from-amber-500 to-yellow-500",
    gradientFrom: "from-amber-500",
    gradientTo: "to-yellow-600",
    buttonStyle: "rounded",
    cardStyle: "elevated",
    fontFamily: "font-serif",
    previewGradient: "bg-gradient-to-br from-amber-600 to-yellow-500",
  },

  retro: {
    name: "retro",
    label: "レトロ",
    description: "80年代風レトロデザイン",
    category: "creative",
    bgColor: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
    textColor: "text-white",
    cardBg: "bg-white/10 backdrop-blur",
    cardBorder: "border-2 border-white/30",
    accentColor: "bg-gradient-to-r from-yellow-400 to-orange-500",
    gradientFrom: "from-yellow-400",
    gradientTo: "to-orange-500",
    buttonStyle: "square",
    cardStyle: "bordered",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
  },

  nature: {
    name: "nature",
    label: "ネイチャー",
    description: "自然をテーマにしたグリーン系",
    category: "creative",
    bgColor: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",
    textColor: "text-green-950",
    cardBg: "bg-white",
    cardBorder: "border border-green-200",
    accentColor: "bg-gradient-to-r from-green-500 to-emerald-600",
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-600",
    buttonStyle: "soft",
    cardStyle: "elevated",
    fontFamily: "font-sans",
    previewGradient: "bg-gradient-to-br from-green-400 to-emerald-500",
  },
};

export function getTheme(themeName?: string | null): Theme {
  if (themeName && themes[themeName]) {
    return themes[themeName];
  }
  return themes.minimal;
}

export function getThemesByCategory(): Record<string, Theme[]> {
  return {
    minimal: Object.values(themes).filter(t => t.category === "minimal"),
    vibrant: Object.values(themes).filter(t => t.category === "vibrant"),
    dark: Object.values(themes).filter(t => t.category === "dark"),
    creative: Object.values(themes).filter(t => t.category === "creative"),
  };
}
