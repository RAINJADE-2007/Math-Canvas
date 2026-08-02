export function hueOf(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return 210;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 210;
  let h = 0;
  if (max === r) h = (g - b) / (max - min);
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}
