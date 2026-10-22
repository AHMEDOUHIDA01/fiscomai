# ClipCraft Studio

Un éditeur vidéo **open-source** qui tourne entièrement dans le navigateur. Inspiré
des fonctionnalités d'éditeurs modernes (montage multi-pistes, sous-titres
automatiques, suppression d'arrière-plan, export réseaux sociaux), mais **100 %
code original** et bâti sur des briques libres — aucune dépendance à un logiciel
propriétaire, aucun abonnement.

> Projet original. Ce n'est pas un clone ni une redistribution d'un logiciel
> commercial : seules les *idées* de fonctionnalités (non protégeables) sont
> reprises, l'implémentation est entièrement nouvelle.

## Fonctionnalités

- 🎬 **Montage timeline multi-pistes** — vidéo, audio et texte. Import par
  glisser-déposer, découpe au curseur, déplacement des clips, zoom.
- 💬 **Sous-titres automatiques** — transcription locale avec Whisper via
  [transformers.js](https://github.com/huggingface/transformers.js). Les
  sous-titres sont ajoutés à la timeline et éditables.
- 🪄 **Suppression d'arrière-plan** — détourage d'images avec
  [@imgly/background-removal](https://github.com/imgly/background-removal-js),
  plus un chroma-key (fond vert) instantané sans modèle.
- 📱 **Export réseaux sociaux** — ratios 9:16 (TikTok/Reels/Shorts), 1:1, 16:9,
  4:5, encodage H.264 via [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).
- 🔒 **Tout en local** — aucune vidéo ni audio n'est envoyé sur un serveur.

## Stack

| Besoin | Technologie |
|---|---|
| Interface | React 18 + TypeScript + Vite |
| État | Zustand |
| Traitement vidéo | ffmpeg.wasm |
| Transcription IA | transformers.js (Whisper) |
| Détourage IA | @imgly/background-removal |

## Démarrage

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173.

> Les en-têtes `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy` sont
> activés par le serveur de dev (nécessaires à `SharedArrayBuffer` pour
> ffmpeg.wasm). Pour un déploiement, configure ces en-têtes côté hébergeur.

## Build

```bash
npm run build
npm run preview
```

## État du projet (v1)

| Fonction | État |
|---|---|
| Timeline multi-pistes, découpe, déplacement | ✅ |
| Preview synchronisé + lecture | ✅ |
| Sous-titres auto (Whisper) | ✅ |
| Suppression d'arrière-plan (image) | ✅ |
| Export aux ratios sociaux | ✅ (clip unique — concaténation multi-clips : prochaine étape) |
| Transitions, keyframes, étalonnage | 🔜 feuille de route |

## Licence

MIT — voir [LICENSE](LICENSE).
