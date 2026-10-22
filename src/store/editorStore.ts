import { create } from 'zustand';
import type {
  AspectPreset,
  Caption,
  Clip,
  EditorProject,
  MediaAsset,
  Track,
} from '../types';
import { aspectDimensions } from '../types';

const uid = () => Math.random().toString(36).slice(2, 10);

function defaultTransform() {
  return { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };
}

interface EditorState extends EditorProject {
  playhead: number; // seconds
  playing: boolean;
  selectedClipId: string | null;
  pixelsPerSecond: number;

  // playback
  setPlayhead: (t: number) => void;
  setPlaying: (p: boolean) => void;

  // project
  setAspect: (a: AspectPreset) => void;
  setProjectName: (name: string) => void;
  setZoom: (pps: number) => void;

  // assets
  addAsset: (asset: MediaAsset) => void;

  // clips
  addClipFromAsset: (assetId: string, trackId?: string) => void;
  addTextClip: (content: string) => void;
  updateClip: (id: string, patch: Partial<Clip>) => void;
  moveClip: (id: string, start: number, trackId?: string) => void;
  splitClipAtPlayhead: () => void;
  removeClip: (id: string) => void;
  selectClip: (id: string | null) => void;

  // captions
  setCaptions: (captions: Caption[]) => void;
  applyCaptionsAsClips: () => void;

  // derived
  totalDuration: () => number;
}

function makeDefaultTracks(): Track[] {
  return [
    { id: 'video-1', kind: 'video', name: 'Vidéo 1', muted: false, locked: false },
    { id: 'text-1', kind: 'text', name: 'Texte', muted: false, locked: false },
    { id: 'audio-1', kind: 'audio', name: 'Audio', muted: false, locked: false },
  ];
}

export const useEditor = create<EditorState>((set, get) => ({
  settings: { name: 'Mon projet', aspect: '9:16', fps: 30, width: 1080 },
  assets: [],
  tracks: makeDefaultTracks(),
  clips: [],
  captions: [],

  playhead: 0,
  playing: false,
  selectedClipId: null,
  pixelsPerSecond: 60,

  setPlayhead: (t) => set({ playhead: Math.max(0, t) }),
  setPlaying: (p) => set({ playing: p }),

  setAspect: (a) => set((s) => ({ settings: { ...s.settings, aspect: a } })),
  setProjectName: (name) => set((s) => ({ settings: { ...s.settings, name } })),
  setZoom: (pps) => set({ pixelsPerSecond: Math.min(300, Math.max(10, pps)) }),

  addAsset: (asset) => set((s) => ({ assets: [...s.assets, asset] })),

  addClipFromAsset: (assetId, trackId) => {
    const s = get();
    const asset = s.assets.find((a) => a.id === assetId);
    if (!asset) return;
    const kind = asset.kind === 'audio' ? 'audio' : 'video';
    const track =
      s.tracks.find((t) => t.id === trackId) ??
      s.tracks.find((t) => t.kind === kind) ??
      s.tracks[0];
    const duration = asset.duration > 0 ? asset.duration : 5;
    // append after the last clip on this track
    const lastEnd = s.clips
      .filter((c) => c.trackId === track.id)
      .reduce((m, c) => Math.max(m, c.start + c.duration), 0);
    const clip: Clip = {
      id: uid(),
      trackId: track.id,
      assetId,
      start: lastEnd,
      duration,
      inPoint: 0,
      outPoint: duration,
      speed: 1,
      volume: 1,
      transform: defaultTransform(),
    };
    set({ clips: [...s.clips, clip], selectedClipId: clip.id });
  },

  addTextClip: (content) => {
    const s = get();
    const track = s.tracks.find((t) => t.kind === 'text') ?? s.tracks[0];
    const clip: Clip = {
      id: uid(),
      trackId: track.id,
      start: s.playhead,
      duration: 3,
      inPoint: 0,
      outPoint: 3,
      speed: 1,
      volume: 1,
      transform: defaultTransform(),
      text: {
        content,
        fontSize: 48,
        color: '#ffffff',
        background: 'rgba(0,0,0,0.5)',
        bold: true,
        align: 'center',
      },
    };
    set({ clips: [...s.clips, clip], selectedClipId: clip.id });
  },

  updateClip: (id, patch) =>
    set((s) => ({ clips: s.clips.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  moveClip: (id, start, trackId) =>
    set((s) => ({
      clips: s.clips.map((c) =>
        c.id === id ? { ...c, start: Math.max(0, start), trackId: trackId ?? c.trackId } : c,
      ),
    })),

  splitClipAtPlayhead: () => {
    const s = get();
    const t = s.playhead;
    const target = s.clips.find((c) => t > c.start && t < c.start + c.duration);
    if (!target) return;
    const localOffset = (t - target.start) * target.speed;
    const left: Clip = { ...target, duration: t - target.start, outPoint: target.inPoint + localOffset };
    const right: Clip = {
      ...target,
      id: uid(),
      start: t,
      duration: target.start + target.duration - t,
      inPoint: target.inPoint + localOffset,
    };
    set({ clips: s.clips.flatMap((c) => (c.id === target.id ? [left, right] : [c])) });
  },

  removeClip: (id) =>
    set((s) => ({
      clips: s.clips.filter((c) => c.id !== id),
      selectedClipId: s.selectedClipId === id ? null : s.selectedClipId,
    })),

  selectClip: (id) => set({ selectedClipId: id }),

  setCaptions: (captions) => set({ captions }),

  applyCaptionsAsClips: () => {
    const s = get();
    const track = s.tracks.find((t) => t.kind === 'text') ?? s.tracks[0];
    const clips: Clip[] = s.captions.map((cap) => ({
      id: uid(),
      trackId: track.id,
      start: cap.start,
      duration: Math.max(0.3, cap.end - cap.start),
      inPoint: 0,
      outPoint: Math.max(0.3, cap.end - cap.start),
      speed: 1,
      volume: 1,
      transform: defaultTransform(),
      text: {
        content: cap.text,
        fontSize: 44,
        color: '#ffffff',
        background: 'rgba(0,0,0,0.55)',
        bold: true,
        align: 'center',
      },
    }));
    set({ clips: [...s.clips, ...clips] });
  },

  totalDuration: () => {
    const s = get();
    return s.clips.reduce((m, c) => Math.max(m, c.start + c.duration), 0);
  },
}));

export { aspectDimensions, uid };
