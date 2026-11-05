# FISCOMA — Command Center

`FISCOMA_APP.html` : application monofichier (ouvrir directement dans le navigateur).

## Outil 09 · Taxes Locales — XML EDI

Reprise web du classeur `taxe_loc_xml.xlsm` et de ses macros VBA :

| Macro VBA | Équivalent dans l'outil |
|---|---|
| `GenererCodeRepereEnColonneK` (Module1) | « Générer les REF_INTERNE_LINK manquantes » (clé `TP-TSC-XXXX`, unique) — seules les lignes sans clé sont traitées pour ne pas casser les liaisons |
| `GenererListeUniqueFusionnee` (Module2) | Liste déroulante des clés d'établissement sur la colonne A des onglets Terrains / Matériel / Retraits |
| `CleanVal` / `FormatDateXML` (Modules 3-4) | Nettoyage identique : trim, suppression du `.0`, échappement `& < > " '`, dates `AAAA-MM-JJ` |
| `GenererXML_DGI_Final_V3` (Module5) | Génération `DecElementImposableWrapper` : même ordre des balises, indentation, CRLF, UTF-8 sans BOM |

Structure (colonnes lues par position, données à partir de la ligne 2) :

- **Etablissements** A identifiantFiscal · B annee · C depotDirect · D exerciceFiscalDu · E exerciceFiscalAu · F numTPLocaleDec · G numTSCLocaleDec · H adressLocaleDec · I modificative · J natureDeclElemImpos · K REF_INTERNE_LINK
- **Terrains** A lien · B refNatureAcquision · C estImmatricule · D numTSC · E numTF · F consistance · G superficie · H refStatutPatrimonial · I prixAcquision · J dateAcquisition
- **Materiel** A lien · B refDesignationMat · C refEtatAcquision · D refStatutPatrimonial · E dateAcquisition · F dateMiseEnService · G prixAcquisition
- **Retraits** A lien · B designationRetrait · C natureOperationRetrait · D numTSC · E numTF · F prixAcquisition · G prixCession · H dateAcquisition · I dateRetrait

Fonctions : import `.xlsm/.xlsx/.xls` ou d'un XML EDI existant (reprise / correction), saisie et édition
dans des grilles identiques aux onglets, contrôles avant dépôt (liaisons orphelines, clés en double,
cellules Excel en erreur, dates, montants, codes), export Excel au même format (+ modèle vierge),
génération et téléchargement du XML. Traitement 100 % local, sauvegarde automatique dans le navigateur.

Vérification : sur le classeur de référence, le XML produit est identique octet par octet à celui de
la macro, à une ligne près — une cellule `#VALEUR!` (adresse), que la macro écrivait « Erreur 2015 »,
est désormais signalée comme erreur et laissée vide.

`taxes-locales/taxes-locales.html` : source autonome du module (embarqué dans `FISCOMA_APP.html`).
