// Core data model for the editor.

export type MediaKind = 'video' | 'audio' | 'image';

export interface MediaAsset {
  id: string;
  name: string;
  kind: MediaKind;
  /** Object URL for playback/preview. */
  url: string;
  /** Original File handle, kept for export/processing. */
  file: File;
  /** Intrinsic duration in seconds (0 for still images -> use clip duration). */
  duration: number;
  width?: number;
  height?: number;
}

export type TrackKind = 'video' | 'audio' | 'text';

export interface Keyframe {
  /** Time within the clip, in seconds. */
  t: number;
  value: number;
}

export interface ClipTransform {
  x: number; // offset px
  y: number;
  scale: number; // 1 = 100%
  rotation: number; // degrees
  opacity: number; // 0..1
}

export interface TextStyle {
  content: string;
  fontSize: number;
  color: string;
  background: string;
  bold: boolean;
  align: 'left' | 'center' | 'right';
}

export interface Clip {
  id: string;
  trackId: string;
  assetId?: string; // undefined for pure text clips
  /** Position on the timeline, in seconds. */
  start: number;
  /** Visible duration on the timeline, in seconds. */
  duration: number;
  /** In/out trim relative to the source asset, in seconds. */
  inPoint: number;
  outPoint: number;
  speed: number; // 1 = normal
  volume: number; // 0..1
  transform: ClipTransform;
  text?: TextStyle;
  /** Set when background removal has been applied; holds a processed object URL. */
  processedUrl?: string;
  removeBackground?: boolean;
}

export interface Track {
  id: string;
  kind: TrackKind;
  name: string;
  muted: boolean;
  locked: boolean;
}

export interface Caption {
  id: string;
  start: number;
  end: number;
  text: string;
}

export type AspectPreset = '9:16' | '1:1' | '16:9' | '4:5';

export interface ProjectSettings {
  name: string;
  aspect: AspectPreset;
  fps: number;
  /** Output canvas width; height is derived from aspect. */
  width: number;
}

export interface EditorProject {
  settings: ProjectSettings;
  assets: MediaAsset[];
  tracks: Track[];
  clips: Clip[];
  captions: Caption[];
}

export const ASPECT_RATIOS: Record<AspectPreset, { w: number; h: number; label: string }> = {
  '9:16': { w: 9, h: 16, label: 'TikTok / Reels / Shorts' },
  '1:1': { w: 1, h: 1, label: 'Post carré' },
  '16:9': { w: 16, h: 9, label: 'YouTube / paysage' },
  '4:5': { w: 4, h: 5, label: 'Portrait Instagram' },
};

export function aspectDimensions(aspect: AspectPreset, width: number): { width: number; height: number } {
  const r = ASPECT_RATIOS[aspect];
  return { width, height: Math.round((width * r.h) / r.w) };
}
