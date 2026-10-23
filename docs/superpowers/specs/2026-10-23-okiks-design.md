# OKIKS — Design (v1)

Date : 2026-10-23 · Statut : approuvé en conversation

## 1. Intention

OKIKS est une application d'apprentissage de l'**anglais** pour un public
**marocain**, qui reprend les **mécanismes** de Duolingo (leçons générées,
correction tolérante par graphe de réponses, XP, série, cœurs, gemmes, quêtes,
ligues, hors ligne) avec une identité **100 % marocaine** et trois profils :
**enfant**, **adulte**, **professionnel**.

Aucun code, texte, image, son ni marque de Duolingo n'est réutilisé : seuls les
mécanismes (non protégeables) sont réimplémentés avec du contenu original.

### Critères de réussite v1
- Un nouvel utilisateur choisit sa langue d'interface (العربية / الدارجة / Français),
  son profil et son objectif, puis termine une leçon complète.
- La correction accepte les variantes et signale les fautes de frappe sans les compter fausses.
- XP, série, cœurs, gemmes, quêtes, ligue simulée et succès évoluent correctement.
- Fonctionne hors ligne (PWA installable), interface RTL correcte en arabe/darija.
- Déployée sur Netlify.

### Hors périmètre v1
Comptes, vraies ligues, amis, paiements réels, histoires, voix enregistrées
(v2 : Netlify Functions + Netlify DB, sans réécrire le moteur).

## 2. Architecture

React + TypeScript + Vite, PWA statique, état Zustand, persistance IndexedDB.

```
okiks/src/
  engine/   moteur pur, testé sans UI
    grader/     DSL de réponses → graphe → alignement de coût minimal
    session/    génération de leçons (nouveaux mots, révision, re-file des erreurs)
    srs/        force des mots, décroissance, sélection des plus faibles
    progress/   reducer d'événements : XP, série, cœurs, gemmes, quêtes, ligue, succès
  content/en/   cours d'anglais par profil (kids / adult / pro)
  i18n/         ar, darija, fr (+ direction RTL/LTR)
  storage/      Repository (IndexedDB) + file d'événements (outbox v2)
  ui/           écrans React
```

**Événements.** Toute mutation passe par `applyEvent(state, event, now)` (pur).
Les événements sont aussi conservés dans une outbox pour la synchronisation v2.
**Repository.** L'UI ne touche jamais IndexedDB directement ; la v2 remplacera
l'implémentation locale par une implémentation distante.

## 3. Contenu

Cours = sections → unités. Une unité contient des **mots** (en, ar, darija, fr,
emoji) et des **phrases** (réponses anglaises en DSL + traductions ar/darija/fr).
Les exercices sont **dérivés automatiquement** du contenu.

DSL de réponses : `I [am|'m] [a|] student` — `[x|y]` alternatives, branche vide = optionnel.
Plusieurs réponses complètes séparées par ` || `.

Volume v1 : 2 sections × 4 unités par profil, 5 niveaux (leçons) par unité.

## 4. Correction (grader)

1. Le DSL est compilé en DAG de mots (sommets numérotés topologiquement).
2. La réponse est normalisée (minuscules, apostrophes unifiées, ponctuation retirée).
3. Programmation dynamique sur (sommet, position dans la réponse), coût minimal :
   exact 0 · faute de frappe (Levenshtein ≤ 1, ≤ 2 si ≥ 8 lettres) 1 ·
   espace manquant/en trop 0,5 · mot faux / manquant / en trop 3.
4. Verdict : `correct` (aucun écart), `typo` (seulement fautes de frappe/espaces,
   affichées), `wrong` (sinon) avec la meilleure correction et les mots fautifs.

Réponses vers la langue maternelle : banque de mots, comparaison exacte normalisée.
Prononciation : même graphe, tolérance de 25 % de mots en écart.

## 5. Exercices v1

choisir l'image · traduire vers l'anglais (clavier ou banque) · traduire vers la
langue maternelle (banque) · écouter et taper · compléter la phrase · associer les
paires · écouter et ordonner · prononcer (Web Speech API, désactivable) ·
vrai/faux à l'écoute.

## 6. Génération des leçons

12 exercices. Niveaux 1–2 : introduction des nouveaux mots (toujours d'abord en
« choisir l'image »). Niveaux 3–5 : phrases et production. ~20 % de révision tirée
du SRS (mots les plus faibles d'autres unités). Les exercices ratés reviennent en
fin de leçon. Sessions spéciales : révision des erreurs, entraînement général.
Le profil enfant privilégie image/écoute/paires (peu d'écriture).

## 7. Gamification

- XP : leçon 10, sans faute 15, révision 5, +5 pour 5 bonnes réponses d'affilée,
  « défi du matin » (avant 9 h) ×2. Objectif quotidien 10/20/30/50.
- Série : +1 jour si ≥ 1 XP le jour local ; protection (max 2) consommée automatiquement
  pour un jour manqué ; record conservé.
- Cœurs : 5 max, −1 par erreur, +1 / 4 h, recharge 350 gemmes ou +1 via révision ;
  à 0 seules les révisions sont permises. Désactivés pour le profil enfant.
- Gemmes : quêtes, coffres de fin d'unité, succès ; boutique (cœurs, protection,
  tenues de la mascotte).
- Quêtes : 3 par jour (déterministes par jour).
- Ligues : 10 niveaux (villes marocaines), 30 joueurs dont 29 simulés de façon
  déterministe par semaine ; top 7 montent, 5 derniers descendent.
- Succès : ~10 badges.

## 8. Profils

| | Enfant | Adulte | Pro |
|---|---|---|---|
| Thèmes | animaux, couleurs, école, famille… | souk, café, taxi, voyage… | emails, réunions, entretien, call center… |
| Cœurs | désactivés | oui | oui |
| Voix | lente par défaut | normale | normale |
| UI | grands boutons, mascotte | standard | sobre, moins d'animations |
| Ligue | désactivée par défaut | oui | oui |
| Parental | limite quotidienne, pas de boutique | — | — |

## 9. Design

Couleurs : Majorelle `#2A4BD7`, terracotta `#C8553D`, menthe `#2E9E6A`,
safran `#F2A541`, sable `#F6EFE3` ; mode sombre « nuit du désert ».
Motifs zellige SVG originaux, nœuds du parcours en étoile à 8 branches.
Mascotte originale : **Okiko le fennec** (SVG). Personnages : Yassine, Salma,
Hajja Fatima, Mehdi, Amina, Karim, Noura. Polices : Cairo (arabe), Nunito
(latin), Noto Sans Tifinagh (ⵓⴽⵉⴽⵙ). WCAG AA, clavier, réduction des animations.

## 10. Tests & déploiement

Vitest : grader, génération, SRS, reducer (série/fuseau/protection, cœurs, XP,
quêtes, ligue). Validation du contenu (DSL compilable, traductions présentes).
Playwright : onboarding → leçon → XP/série, en arabe et en français.
Netlify : `okiks/` comme base, `npm run build`, publication `dist`, réécriture SPA,
en-têtes de cache/sécurité.
