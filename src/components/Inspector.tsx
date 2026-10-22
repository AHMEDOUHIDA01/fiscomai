import { useEditor } from '../store/editorStore';

export function Inspector() {
  const clip = useEditor((s) => s.clips.find((c) => c.id === s.selectedClipId) ?? null);
  const updateClip = useEditor((s) => s.updateClip);

  if (!clip) {
    return (
      <div className="section">
        <h3>Propriétés</h3>
        <p className="hint">Sélectionne un clip sur la timeline pour modifier sa durée, sa vitesse, son volume, ou son texte.</p>
      </div>
    );
  }

  const set = (patch: Parameters<typeof updateClip>[1]) => updateClip(clip.id, patch);

  return (
    <div className="section">
      <h3>Propriétés du clip</h3>

      <div className="field">
        <label>Durée (s)</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={clip.duration.toFixed(1)}
          onChange={(e) => set({ duration: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
        />
      </div>

      <div className="field">
        <label>Vitesse ×{clip.speed.toFixed(2)}</label>
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.05"
          value={clip.speed}
          onChange={(e) => set({ speed: parseFloat(e.target.value) })}
        />
      </div>

      <div className="field">
        <label>Volume {Math.round(clip.volume * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={clip.volume}
          onChange={(e) => set({ volume: parseFloat(e.target.value) })}
        />
      </div>

      <div className="field">
        <label>Opacité {Math.round(clip.transform.opacity * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={clip.transform.opacity}
          onChange={(e) => set({ transform: { ...clip.transform, opacity: parseFloat(e.target.value) } })}
        />
      </div>

      {clip.text && (
        <>
          <h3 style={{ marginTop: 18 }}>Texte</h3>
          <div className="field">
            <label>Contenu</label>
            <input
              value={clip.text.content}
              onChange={(e) => set({ text: { ...clip.text!, content: e.target.value } })}
            />
          </div>
          <div className="row">
            <div className="field">
              <label>Taille</label>
              <input
                type="number"
                value={clip.text.fontSize}
                onChange={(e) => set({ text: { ...clip.text!, fontSize: parseInt(e.target.value) || 44 } })}
              />
            </div>
            <div className="field">
              <label>Couleur</label>
              <input
                type="color"
                value={clip.text.color}
                onChange={(e) => set({ text: { ...clip.text!, color: e.target.value } })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
