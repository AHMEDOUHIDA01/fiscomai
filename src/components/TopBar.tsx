import { useEditor } from '../store/editorStore';
import { ASPECT_RATIOS } from '../types';
import type { AspectPreset } from '../types';

export function TopBar() {
  const name = useEditor((s) => s.settings.name);
  const aspect = useEditor((s) => s.settings.aspect);
  const setProjectName = useEditor((s) => s.setProjectName);
  const setAspect = useEditor((s) => s.setAspect);
  const addTextClip = useEditor((s) => s.addTextClip);

  return (
    <div className="topbar">
      <div className="logo">
        Clip<span>Craft</span> Studio
      </div>
      <input
        className="project-name"
        value={name}
        onChange={(e) => setProjectName(e.target.value)}
        aria-label="Nom du projet"
      />
      <div className="spacer" />
      <button onClick={() => addTextClip('Nouveau texte')}>+ Texte</button>
      <select
        value={aspect}
        onChange={(e) => setAspect(e.target.value as AspectPreset)}
        title="Format / ratio d’export"
      >
        {(Object.keys(ASPECT_RATIOS) as AspectPreset[]).map((a) => (
          <option key={a} value={a}>
            {a} · {ASPECT_RATIOS[a].label}
          </option>
        ))}
      </select>
    </div>
  );
}
