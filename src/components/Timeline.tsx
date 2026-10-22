import { useCallback, useRef, useState } from 'react';
import { useEditor } from '../store/editorStore';
import type { Clip } from '../types';

export function Timeline() {
  const tracks = useEditor((s) => s.tracks);
  const clips = useEditor((s) => s.clips);
  const pps = useEditor((s) => s.pixelsPerSecond);
  const playhead = useEditor((s) => s.playhead);
  const selectedClipId = useEditor((s) => s.selectedClipId);
  const totalDuration = useEditor((s) => s.totalDuration());

  const setZoom = useEditor((s) => s.setZoom);
  const setPlayhead = useEditor((s) => s.setPlayhead);
  const selectClip = useEditor((s) => s.selectClip);
  const moveClip = useEditor((s) => s.moveClip);
  const splitClipAtPlayhead = useEditor((s) => s.splitClipAtPlayhead);
  const removeClip = useEditor((s) => s.removeClip);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; grabX: number } | null>(null);

  const timelineWidth = Math.max(800, (totalDuration + 6) * pps) + 84;

  const labelWidth = 84;

  const onRulerClick = useCallback(
    (e: React.MouseEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left + el.scrollLeft - labelWidth;
      setPlayhead(Math.max(0, x / pps));
    },
    [pps, setPlayhead],
  );

  const onClipMouseDown = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    selectClip(clip.id);
    const startX = e.clientX;
    const origStart = clip.start;
    setDrag({ id: clip.id, grabX: startX });
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      moveClip(clip.id, origStart + dx / pps);
    };
    const onUp = () => {
      setDrag(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ruler ticks every second (adaptive)
  const tickStep = pps < 25 ? 5 : pps < 60 ? 2 : 1;
  const ticks: number[] = [];
  for (let s = 0; s <= totalDuration + 6; s += tickStep) ticks.push(s);

  return (
    <div className="timeline">
      <div className="timeline-toolbar">
        <button onClick={splitClipAtPlayhead} title="Couper au curseur (S)">✂️ Couper</button>
        <button
          onClick={() => selectedClipId && removeClip(selectedClipId)}
          disabled={!selectedClipId}
          title="Supprimer (Suppr)"
        >
          🗑️ Supprimer
        </button>
        <div className="spacer" />
        <span className="hint">Zoom</span>
        <button onClick={() => setZoom(pps - 15)}>−</button>
        <button onClick={() => setZoom(pps + 15)}>+</button>
      </div>

      <div className="tl-scroll" ref={scrollRef}>
        <div className="tl-inner" style={{ width: timelineWidth }}>
          <div className="ruler" onClick={onRulerClick} style={{ marginLeft: labelWidth }}>
            {ticks.map((s) => (
              <div key={s} className="tick" style={{ left: s * pps }}>
                {formatTick(s)}
              </div>
            ))}
          </div>

          {tracks.map((track) => (
            <div key={track.id} className="track-row">
              <div className="track-label">{track.name}</div>
              <div style={{ position: 'absolute', left: labelWidth, right: 0, top: 0, bottom: 0 }}>
                {clips
                  .filter((c) => c.trackId === track.id)
                  .map((clip) => (
                    <div
                      key={clip.id}
                      className={`clip ${track.kind} ${selectedClipId === clip.id ? 'selected' : ''}`}
                      style={{
                        left: clip.start * pps,
                        width: Math.max(12, clip.duration * pps),
                        opacity: drag?.id === clip.id ? 0.8 : 1,
                      }}
                      onMouseDown={(e) => onClipMouseDown(e, clip)}
                    >
                      {clip.text?.content ?? labelForClip(clip)}
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div
            className="playhead"
            style={{ left: labelWidth + playhead * pps, height: tracks.length * 54 + 22 }}
          />
        </div>
      </div>
    </div>
  );
}

function labelForClip(clip: Clip): string {
  return clip.assetId ? `Clip ${clip.duration.toFixed(1)}s` : 'Clip';
}

function formatTick(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
}
