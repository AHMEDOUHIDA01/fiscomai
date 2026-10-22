import type { AspectPreset, Clip, MediaAsset } from '../types';
import { aspectDimensions } from '../types';

type ProgressFn = (phase: string, pct: number) => void;

export interface ExportOptions {
  aspect: AspectPreset;
  width: number;
  fps: number;
  quality: 'high' | 'medium' | 'fast';
}

let ffmpegSingleton: unknown = null;

async function getFFmpeg(onProgress: ProgressFn): Promise<{
  exec: (args: string[]) => Promise<number>;
  writeFile: (name: string, data: Uint8Array) => Promise<void>;
  readFile: (name: string) => Promise<Uint8Array>;
  deleteFile: (name: string) => Promise<void>;
  on: (ev: string, cb: (e: { progress: number }) => void) => void;
}> {
  if (ffmpegSingleton) return ffmpegSingleton as never;
  onProgress('Chargement de FFmpeg…', 2);
  let FFmpeg: new () => unknown;
  let toBlobURL: (url: string, type: string) => Promise<string>;
  try {
    const core = await import('@ffmpeg/ffmpeg');
    const util = await import('@ffmpeg/util');
    FFmpeg = (core as { FFmpeg: new () => unknown }).FFmpeg;
    toBlobURL = (util as { toBlobURL: typeof toBlobURL }).toBlobURL;
  } catch {
    throw new Error("FFmpeg n'est pas installé. Lance `npm install` pour ajouter @ffmpeg/ffmpeg et @ffmpeg/util.");
  }

  const ff = new FFmpeg() as {
    load: (cfg: Record<string, string>) => Promise<void>;
    on: (ev: string, cb: (e: { progress: number }) => void) => void;
  } & Record<string, unknown>;

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ff.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  ffmpegSingleton = ff;
  return ff as never;
}

const CRF: Record<ExportOptions['quality'], string> = { high: '18', medium: '23', fast: '28' };

/**
 * Export a single video clip transformed to the target aspect ratio and quality.
 * This v1 renders the first video clip on the timeline as a ready-to-share file;
 * multi-clip concatenation is the next milestone and reuses the same pipeline.
 */
export async function exportSingleClip(
  clip: Clip,
  asset: MediaAsset,
  opts: ExportOptions,
  onProgress: ProgressFn,
): Promise<Blob> {
  const ff = await getFFmpeg(onProgress);
  const { width, height } = aspectDimensions(opts.aspect, opts.width);

  const inName = 'in' + extFromName(asset.name);
  const outName = 'out.mp4';
  onProgress('Préparation du fichier…', 8);
  const data = new Uint8Array(await asset.file.arrayBuffer());
  await ff.writeFile(inName, data);

  ff.on('progress', (e) => onProgress('Encodage…', 15 + Math.min(80, Math.round(e.progress * 80))));

  // Scale to cover the target frame then crop to exact dimensions (object-fit: cover).
  const vf = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1`;
  const trim = ['-ss', String(clip.inPoint), '-t', String(clip.duration * clip.speed)];

  const args = [
    ...trim,
    '-i', inName,
    '-vf', vf,
    '-r', String(opts.fps),
    '-c:v', 'libx264',
    '-preset', opts.quality === 'fast' ? 'veryfast' : 'medium',
    '-crf', CRF[opts.quality],
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-movflags', '+faststart',
    outName,
  ];

  await ff.exec(args);
  onProgress('Récupération du résultat…', 97);
  const out = await ff.readFile(outName);
  await ff.deleteFile(inName).catch(() => {});
  await ff.deleteFile(outName).catch(() => {});
  onProgress('Terminé', 100);
  // Copy into a fresh ArrayBuffer so the Blob owns detachment-safe memory.
  return new Blob([out.slice().buffer as ArrayBuffer], { type: 'video/mp4' });
}

function extFromName(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i) : '.mp4';
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
