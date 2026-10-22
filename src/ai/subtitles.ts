import type { Caption } from '../types';
import { uid } from '../store/editorStore';

type ProgressFn = (phase: string, pct: number) => void;

/**
 * Transcribe an audio/video File entirely in the browser using Whisper via
 * transformers.js (WASM/WebGPU). The model is downloaded once and cached by the
 * browser. No audio leaves the device.
 */
export async function transcribeToCaptions(file: File, onProgress: ProgressFn): Promise<Caption[]> {
  onProgress('Chargement du moteur IA…', 5);
  let pipelineFactory: unknown;
  try {
    const mod = await import('@huggingface/transformers');
    pipelineFactory = (mod as { pipeline: unknown }).pipeline;
  } catch (e) {
    throw new Error(
      "Le moteur de transcription n'est pas installé. Lance `npm install` pour ajouter @huggingface/transformers.",
    );
  }

  const audio = await decodeToMono16k(file, (p) => onProgress('Décodage audio…', 10 + p * 0.15));

  onProgress('Téléchargement du modèle Whisper…', 30);
  const pipeline = pipelineFactory as (
    task: string,
    model: string,
    opts: Record<string, unknown>,
  ) => Promise<unknown>;

  const transcriber = (await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
    progress_callback: (info: { status?: string; progress?: number }) => {
      if (info?.progress != null) onProgress('Téléchargement du modèle…', 30 + info.progress * 0.3);
    },
  })) as (
    input: Float32Array,
    opts: Record<string, unknown>,
  ) => Promise<{ chunks?: { timestamp: [number, number]; text: string }[]; text?: string }>;

  onProgress('Transcription en cours…', 65);
  const result = await transcriber(audio, {
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
  });

  onProgress('Finalisation…', 95);
  const chunks = result.chunks ?? [];
  const captions: Caption[] = chunks
    .filter((c) => c.text?.trim())
    .map((c) => ({
      id: uid(),
      start: c.timestamp[0] ?? 0,
      end: c.timestamp[1] ?? (c.timestamp[0] ?? 0) + 2,
      text: c.text.trim(),
    }));

  if (captions.length === 0 && result.text?.trim()) {
    captions.push({ id: uid(), start: 0, end: 4, text: result.text.trim() });
  }
  onProgress('Terminé', 100);
  return captions;
}

/** Decode any media file to a mono Float32Array at 16 kHz (Whisper's rate). */
async function decodeToMono16k(file: File, onProgress: (p: number) => void): Promise<Float32Array> {
  const arrayBuf = await file.arrayBuffer();
  onProgress(0.3);
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
  onProgress(0.7);

  const targetRate = 16000;
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetRate), targetRate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  onProgress(1);
  await ctx.close();
  return rendered.getChannelData(0);
}
