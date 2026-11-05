// Darken a hex color by mixing it toward black by `factor` (0-1)
export function darkenHex(hex: string, factor: number): string {
  const rgb = hex.match(/\w\w/g);
  if (!rgb) return hex;
  const [r, g, b] = rgb.map(x => parseInt(x, 16));
  const channel = (c: number) => Math.floor(c * (1 - factor)).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

// Mix a hex color toward white by `factor` (0-1)
export function lightenHex(hex: string, factor: number): string {
  const rgb = hex.match(/\w\w/g);
  if (!rgb) return hex;
  const [r, g, b] = rgb.map(x => parseInt(x, 16));
  const channel = (c: number) => Math.round(c + (255 - c) * factor).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

// Relative luminance (0 = black, 1 = white) of a hex color
export function hexLuminance(hex: string): number {
  const rgb = hex.match(/\w\w/g);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(x => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// A version of `hex` that stays readable as text on a dark background:
// very dark colors are lifted toward white until they clear a minimum luminance.
export function readableOnDark(hex: string, minLuminance = 0.18): string {
  let out = hex;
  for (let f = 0.15; hexLuminance(out) < minLuminance && f <= 0.9; f += 0.15) out = lightenHex(hex, f);
  return out;
}
