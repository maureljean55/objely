// Preset character avatars grouped by illustration style (DiceBear —
// https://www.dicebear.com), rendered as SVG. Each seed always produces the
// same character, so these lists are stable across renders.

const CARTOON_SEEDS = [
  "Zoe", "Leo", "Mia", "Max", "Nina", "Theo", "Luna", "Felix",
  "Alba", "Sam", "Ines", "Milo", "Emma", "Noah", "Lily", "Adam",
  "Zara", "Tom", "Ana", "Ben",
];

const MANGA_SEEDS = [
  "Aiko", "Kenji", "Yuki", "Ren", "Sora", "Hana", "Riku", "Mika",
  "Kaito", "Aoi", "Haru", "Nao", "Yuna", "Sota", "Emi", "Daiki",
  "Rin", "Kazu", "Miyu", "Taro",
];

export type AvatarCategory = {
  id: "cartoon" | "manga";
  label: string;
  avatars: { seed: string; url: string }[];
};

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    id: "cartoon",
    label: "Cartoon",
    avatars: CARTOON_SEEDS.map((seed) => ({
      seed,
      url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundType=gradientLinear`,
    })),
  },
  {
    id: "manga",
    label: "Manga",
    avatars: MANGA_SEEDS.map((seed) => ({
      seed,
      url: `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&backgroundType=gradientLinear`,
    })),
  },
];
