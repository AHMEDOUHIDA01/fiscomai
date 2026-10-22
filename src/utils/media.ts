import type { MediaAsset, MediaKind } from '../types';
import { uid } from '../store/editorStore';

function kindFromType(type: string): MediaKind | null {
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('image/')) return 'image';
  return null;
}

/** Probe a media File to build a MediaAsset with intrinsic duration/dimensions. */
export function fileToAsset(file: File): Promise<MediaAsset | null> {
  const kind = kindFromType(file.type);
  if (!kind) return Promise.resolve(null);
  const url = URL.createObjectURL(file);
  const base: MediaAsset = { id: uid(), name: file.name, kind, url, file, duration: 0 };

  if (kind === 'image') {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ ...base, width: img.naturalWidth, height: img.naturalHeight, duration: 5 });
      img.onerror = () => resolve(base);
      img.src = url;
    });
  }

  return new Promise((resolve) => {
    const el = document.createElement(kind === 'video' ? 'video' : 'audio') as HTMLMediaElement;
    el.preload = 'metadata';
    el.onloadedmetadata = () => {
      const width = kind === 'video' ? (el as HTMLVideoElement).videoWidth : undefined;
      const height = kind === 'video' ? (el as HTMLVideoElement).videoHeight : undefined;
      resolve({ ...base, duration: isFinite(el.duration) ? el.duration : 0, width, height });
    };
    el.onerror = () => resolve(base);
    el.src = url;
  });
}

export async function filesToAssets(files: FileList | File[]): Promise<MediaAsset[]> {
  const out: MediaAsset[] = [];
  for (const f of Array.from(files)) {
    const a = await fileToAsset(f);
    if (a) out.push(a);
  }
  return out;
}
