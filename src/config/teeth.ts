/**
 * Teeth template + hotspot positions (FDI numbering).
 *
 * TEETH_IMAGE_URL: set to your uploaded template image (e.g. "/teeth-template.png" in /public).
 * Leave null to use the built-in drawn chart.
 *
 * HOTSPOTS: x / y are percentages (0–100) of the image width / height.
 * If you replace the image, edit the numbers below so the dots sit on each tooth.
 * The image box keeps the ratio TEETH_IMAGE_RATIO (width / height).
 */
export const TEETH_IMAGE_URL: string | null = null;
export const TEETH_IMAGE_RATIO = 1 / 1.15;

export const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function arch(nums: number[], upper: boolean) {
  const out: Record<number, { x: number; y: number }> = {};
  nums.forEach((n, i) => {
    const a = Math.PI * (0.06 + (0.88 * i) / (nums.length - 1)); // 0..π
    const x = 50 - 40 * Math.cos(a);
    const y = upper ? 46 - 36 * Math.sin(a) : 54 + 36 * Math.sin(a);
    out[n] = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });
  return out;
}

export const HOTSPOTS: Record<number, { x: number; y: number }> = {
  ...arch(UPPER, true),
  ...arch(LOWER, false),
  // Manual overrides, e.g. 11: { x: 47, y: 10 },
};
