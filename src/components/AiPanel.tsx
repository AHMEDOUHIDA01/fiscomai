import { useState } from 'react';
import { useEditor } from '../store/editorStore';
import { transcribeToCaptions } from '../ai/subtitles';
import { removeImageBackground } from '../ai/backgroundRemoval';
import { exportSingleClip, downloadBlob } from '../engine/export';
import type { ExportOptions } from '../engine/export';

interface Job {
  phase: string;
  pct: number;
}

export function AiPanel({ notify }: { notify: (msg: string) => void }) {
  const assets = useEditor((s) => s.assets);
  const clips = useEditor((s) => s.clips);
  const settings = useEditor((s) => s.settings);
  const setCaptions = useEditor((s) => s.setCaptions);
  const applyCaptionsAsClips = useEditor((s) => s.applyCaptionsAsClips);
  const updateClip = useEditor((s) => s.updateClip);
  const selectedClipId = useEditor((s) => s.selectedClipId);

  const [job, setJob] = useState<Job | null>(null);
  const [quality, setQuality] = useState<ExportOptions['quality']>('medium');

  const firstAV = assets.find((a) => a.kind === 'video' || a.kind === 'audio');
  const selectedClip = clips.find((c) => c.id === selectedClipId) ?? null;
  const selectedImage =
    selectedClip && assets.find((a) => a.id === selectedClip.assetId)?.kind === 'image'
      ? selectedClip
      : null;

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setTimeout(() => setJob(null), 800);
    }
  };

  const doSubtitles = () =>
    run(async () => {
      if (!firstAV) return notify('Importe d’abord une vidéo ou un audio.');
      setJob({ phase: 'Démarrage…', pct: 0 });
      const captions = await transcribeToCaptions(firstAV.file, (phase, pct) => setJob({ phase, pct }));
      setCaptions(captions);
      applyCaptionsAsClips();
      notify(`${captions.length} sous-titres générés et ajoutés à la timeline.`);
    });

  const doBgRemoval = () =>
    run(async () => {
      if (!selectedImage) return notify('Sélectionne un clip image sur la timeline.');
      const asset = assets.find((a) => a.id === selectedImage.assetId)!;
      setJob({ phase: 'Démarrage…', pct: 0 });
      const url = await removeImageBackground(asset.file, (phase, pct) => setJob({ phase, pct }));
      updateClip(selectedImage.id, { processedUrl: url, removeBackground: true });
      notify('Arrière-plan supprimé sur le clip sélectionné.');
    });

  const doExport = () =>
    run(async () => {
      const videoClip = clips.find((c) => {
        const a = assets.find((x) => x.id === c.assetId);
        return a?.kind === 'video';
      });
      if (!videoClip) return notify('Ajoute au moins un clip vidéo à la timeline.');
      const asset = assets.find((a) => a.id === videoClip.assetId)!;
      setJob({ phase: 'Démarrage…', pct: 0 });
      const blob = await exportSingleClip(
        videoClip,
        asset,
        { aspect: settings.aspect, width: settings.width, fps: settings.fps, quality },
        (phase, pct) => setJob({ phase, pct }),
      );
      downloadBlob(blob, `${settings.name.replace(/\s+/g, '-')}-${settings.aspect.replace(':', 'x')}.mp4`);
      notify('Export terminé — le fichier a été téléchargé.');
    });

  return (
    <>
      <div className="section">
        <h3>Outils IA</h3>
        <div className="btn-list">
          <button onClick={doSubtitles} disabled={!!job}>
            💬 Sous-titres automatiques
          </button>
          <button onClick={doBgRemoval} disabled={!!job || !selectedImage}>
            🪄 Supprimer l’arrière-plan
            {!selectedImage && <span className="badge">clip image</span>}
          </button>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Tout se fait localement dans ton navigateur. Rien n’est envoyé sur un serveur.
        </p>
      </div>

      <div className="section">
        <h3>Export</h3>
        <div className="field">
          <label>Qualité</label>
          <select value={quality} onChange={(e) => setQuality(e.target.value as ExportOptions['quality'])}>
            <option value="high">Haute (lent)</option>
            <option value="medium">Moyenne</option>
            <option value="fast">Rapide (léger)</option>
          </select>
        </div>
        <button className="primary" onClick={doExport} disabled={!!job} style={{ width: '100%' }}>
          ⬇️ Exporter en {settings.aspect}
        </button>
      </div>

      {job && (
        <div className="toast">
          {job.phase}
          <div className="progress">
            <div style={{ width: `${job.pct}%` }} />
          </div>
        </div>
      )}
    </>
  );
}
