import { useEffect, useMemo, useRef } from 'react';
import { useEditor } from '../store/editorStore';
import { aspectDimensions } from '../types';

/**
 * Live preview. Renders video/image layers and text overlays positioned by the
 * current playhead. Video elements are kept mounted and seeked/played in sync
 * with the global transport, which keeps scrubbing responsive.
 */
export function Preview() {
  const clips = useEditor((s) => s.clips);
  const assets = useEditor((s) => s.assets);
  const tracks = useEditor((s) => s.tracks);
  const playhead = useEditor((s) => s.playhead);
  const playing = useEditor((s) => s.playing);
  const settings = useEditor((s) => s.settings);

  const { width, height } = aspectDimensions(settings.aspect, 540);

  // Determine which clips are active at the current playhead, per track.
  const activeByTrack = useMemo(() => {
    const map = new Map<string, (typeof clips)[number]>();
    for (const t of tracks) {
      const c = clips.find(
        (cl) => cl.trackId === t.id && playhead >= cl.start && playhead < cl.start + cl.duration,
      );
      if (c) map.set(t.id, c);
    }
    return map;
  }, [clips, tracks, playhead]);

  return (
    <div className="preview-frame" style={{ width, height, aspectRatio: `${width}/${height}` }}>
      {tracks
        .filter((t) => t.kind !== 'text')
        .map((t) => {
          const clip = activeByTrack.get(t.id);
          if (!clip) return null;
          const asset = assets.find((a) => a.id === clip.assetId);
          if (!asset) return null;
          return (
            <MediaLayer
              key={t.id}
              src={clip.processedUrl ?? asset.url}
              kind={asset.kind}
              isVideo={asset.kind === 'video'}
              clipStart={clip.start}
              inPoint={clip.inPoint}
              speed={clip.speed}
              volume={t.muted ? 0 : clip.volume}
              opacity={clip.transform.opacity}
              playhead={playhead}
              playing={playing}
            />
          );
        })}

      {tracks
        .filter((t) => t.kind === 'text')
        .map((t) => {
          const clip = activeByTrack.get(t.id);
          if (!clip?.text) return null;
          const style = clip.text;
          return (
            <div
              key={t.id}
              className="preview-text"
              style={{ bottom: '12%', justifyContent: style.align === 'center' ? 'center' : style.align }}
            >
              <span
                style={{
                  fontSize: Math.round((style.fontSize / 1080) * height),
                  color: style.color,
                  background: style.background,
                  fontWeight: style.bold ? 800 : 500,
                  padding: '4px 12px',
                  borderRadius: 6,
                  textAlign: style.align,
                  lineHeight: 1.25,
                }}
              >
                {style.content}
              </span>
            </div>
          );
        })}
    </div>
  );
}

function MediaLayer(props: {
  src: string;
  kind: string;
  isVideo: boolean;
  clipStart: number;
  inPoint: number;
  speed: number;
  volume: number;
  opacity: number;
  playhead: number;
  playing: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  // Keep the video element's currentTime aligned with the timeline playhead.
  useEffect(() => {
    const v = ref.current;
    if (!v || !props.isVideo) return;
    const localTime = props.inPoint + (props.playhead - props.clipStart) * props.speed;
    if (Math.abs(v.currentTime - localTime) > 0.2) {
      try {
        v.currentTime = Math.max(0, localTime);
      } catch {
        /* seeking before metadata is ready */
      }
    }
    v.volume = props.volume;
    v.playbackRate = props.speed;
  }, [props.playhead, props.isVideo, props.inPoint, props.clipStart, props.speed, props.volume]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !props.isVideo) return;
    if (props.playing) v.play().catch(() => {});
    else v.pause();
  }, [props.playing, props.isVideo]);

  if (!props.isVideo) {
    return <img className="preview-layer" src={props.src} alt="" style={{ opacity: props.opacity, objectFit: 'cover' }} />;
  }
  return (
    <video
      ref={ref}
      className="preview-layer"
      src={props.src}
      muted={props.volume === 0}
      playsInline
      style={{ opacity: props.opacity, objectFit: 'cover' }}
    />
  );
}
