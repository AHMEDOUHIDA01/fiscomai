import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from '../store/editorStore';
import { TopBar } from './TopBar';
import { MediaLibrary } from './MediaLibrary';
import { Preview } from './Preview';
import { Timeline } from './Timeline';
import { Inspector } from './Inspector';
import { AiPanel } from './AiPanel';

export function App() {
  const playing = useEditor((s) => s.playing);
  const setPlaying = useEditor((s) => s.setPlaying);
  const playhead = useEditor((s) => s.playhead);
  const setPlayhead = useEditor((s) => s.setPlayhead);
  const totalDuration = useEditor((s) => s.totalDuration());
  const splitClipAtPlayhead = useEditor((s) => s.splitClipAtPlayhead);
  const removeClip = useEditor((s) => s.removeClip);
  const selectedClipId = useEditor((s) => s.selectedClipId);

  const [toast, setToast] = useState<string | null>(null);
  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Playback clock: advance the playhead in real time while playing.
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  useEffect(() => {
    if (!playing) return;
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      const next = useEditor.getState().playhead + dt;
      if (next >= totalDuration && totalDuration > 0) {
        setPlayhead(totalDuration);
        setPlaying(false);
        return;
      }
      setPlayhead(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, totalDuration, setPlayhead, setPlaying]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(!useEditor.getState().playing);
      } else if (e.key === 's' || e.key === 'S') {
        splitClipAtPlayhead();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipId) removeClip(selectedClipId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPlaying, splitClipAtPlayhead, removeClip, selectedClipId]);

  return (
    <div className="app">
      <TopBar />

      <div className="workspace">
        <aside className="panel">
          <MediaLibrary />
        </aside>

        <main className="stage">
          <Preview />
          <div className="transport">
            <button onClick={() => setPlayhead(0)} title="Début">⏮</button>
            <button className="primary" onClick={() => setPlaying(!playing)}>
              {playing ? '⏸ Pause' : '▶ Lecture'}
            </button>
            <span className="time">
              {formatTime(playhead)} / {formatTime(totalDuration)}
            </span>
          </div>
        </main>

        <aside className="panel right">
          <AiPanel notify={notify} />
          <Inspector />
        </aside>
      </div>

      <Timeline />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const cs = Math.floor((s % 1) * 100);
  return `${m}:${sec.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}
