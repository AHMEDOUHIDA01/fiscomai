type ProgressFn = (phase: string, pct: number) => void;

/**
 * Remove the background from an image File in the browser using @imgly/background-removal.
 * Returns an object URL to a transparent PNG. Everything runs locally.
 */
export async function removeImageBackground(file: File, onProgress: ProgressFn): Promise<string> {
  onProgress('Chargement du moteur…', 5);
  type RemoveBg = (input: Blob, config?: Record<string, unknown>) => Promise<Blob>;
  let removeBackground: RemoveBg | null = null;
  try {
    const mod = (await import('@imgly/background-removal')) as unknown as { removeBackground: RemoveBg };
    removeBackground = mod.removeBackground;
  } catch {
    throw new Error(
      "Le moteur de détourage n'est pas installé. Lance `npm install` pour ajouter @imgly/background-removal.",
    );
  }
  if (!removeBackground) throw new Error('Moteur de détourage indisponible.');

  const blob = await removeBackground(file, {
    progress: (_key: string, current: number, total: number) => {
      onProgress('Détourage en cours…', Math.min(95, Math.round((current / Math.max(1, total)) * 90) + 5));
    },
  });
  onProgress('Terminé', 100);
  return URL.createObjectURL(blob);
}

/**
 * Chroma-key (green-screen) removal for a single video frame or image, done on a
 * canvas without any model. Useful as an instant, dependency-free fallback.
 */
export function chromaKeyCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  keyColor: [number, number, number] = [0, 177, 64],
  threshold = 90,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0, width, height);
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;
  const [kr, kg, kb] = keyColor;
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.hypot(d[i] - kr, d[i + 1] - kg, d[i + 2] - kb);
    if (dist < threshold) d[i + 3] = 0;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
