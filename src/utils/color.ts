// Darken a hex color by mixing it toward black by `factor` (0-1)
export function darkenHex(hex: string, factor: number): string {
  const rgb = hex.match(/\w\w/g);
  if (!rgb) return hex;
  const [r, g, b] = rgb.map(x => parseInt(x, 16));
  const channel = (c: number) => Math.floor(c * (1 - factor)).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}
