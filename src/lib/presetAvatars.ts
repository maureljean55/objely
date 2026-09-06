// A fixed set of illustrated character avatars (DiceBear's "adventurer"
// style — https://www.dicebear.com), rendered as SVG. Each seed always
// produces the same character, so this list is stable across renders.
const SEEDS = ["Zoe", "Leo", "Mia", "Max", "Nina", "Theo", "Luna", "Felix", "Alba", "Sam", "Ines", "Milo"];

export const PRESET_AVATARS = SEEDS.map((seed) => ({
  seed,
  url: `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundType=gradientLinear`,
}));
