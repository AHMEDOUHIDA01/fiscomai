import { useRef, useState } from 'react';
import { useEditor } from '../store/editorStore';
import { filesToAssets } from '../utils/media';

export function MediaLibrary() {
  const assets = useEditor((s) => s.assets);
  const addAsset = useEditor((s) => s.addAsset);
  const addClipFromAsset = useEditor((s) => s.addClipFromAsset);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ingest = async (files: FileList | File[]) => {
    const newAssets = await filesToAssets(files);
    newAssets.forEach(addAsset);
  };

  return (
    <div className="section">
      <h3>Médias</h3>
      <div
        className={`dropzone ${dragOver ? 'drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void ingest(e.dataTransfer.files);
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 6 }}>⬆️</div>
        Glisse tes vidéos, images ou audios ici
        <br />
        <span className="hint">ou clique pour parcourir</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*,image/*"
        multiple
        hidden
        onChange={(e) => e.target.files && void ingest(e.target.files)}
      />

      <div className="media-grid">
        {assets.map((a) => (
          <div
            key={a.id}
            className="media-card"
            title={`${a.name} — cliquer pour ajouter à la timeline`}
            onClick={() => addClipFromAsset(a.id)}
          >
            {a.kind === 'video' && <video src={a.url} muted />}
            {a.kind === 'image' && <img src={a.url} alt={a.name} />}
            {a.kind === 'audio' && (
              <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎵</div>
            )}
            <div className="name">{a.name}</div>
          </div>
        ))}
      </div>
      {assets.length === 0 && <p className="hint">Aucun média importé pour l'instant.</p>}
    </div>
  );
}
