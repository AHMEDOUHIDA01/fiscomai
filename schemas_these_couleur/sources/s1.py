import re, subprocess
from common import *

branches = {
 "B1": ("1. LE PROBLÈME\nCrise du rattachement territorial", "brown", [
   ("es","Établissement stable\n(art. 5 Modèle OCDE)\nfondé sur la présence physique"),
   ("swm","« Scale without mass »\nrevenus sans présence"),
   ("cv","Création de valeur\nnotion disputée"),
   ("donnees","Données & participation\ndes utilisateurs"),
   ("incorp","Incorporels mobiles\n(brevets, marques, algorithmes)"),
   ("tb","Transfert de bénéfices\n≈ 36 % vers paradis fiscaux"),
   ("resid","Résidence / lieu de\ndirection effective incertain")]),
 "B2": ("2. RÉPONSES UNILATÉRALES", "ochre", [
   ("tsn","Taxes sur les services\nnumériques (TSN)\nFrance 2019, Italie, Kenya…"),
   ("peq","Taxe de péréquation\n(Inde 2016)"),
   ("pes","Présence économique\nsignificative\n(Nigeria 2020, Kenya 2024)"),
   ("tvasn","TVA sur services\nnumériques des\nnon-résidents"),
   ("esv","ES virtuel / numérique\n(Inde, proposition UE 2018)")]),
 "B3": ("3. RÉPONSE MULTILATÉRALE\n(harmonisation)", "teal", [
   ("beps","Projet BEPS (2013-2015)\nActions 1, 5, 7, 13\nInstrument multilatéral"),
   ("p1","PILIER 1\nRéallocation aux marchés"),
   ("p2","PILIER 2\nImpôt minimum 15 %\n(GloBE, CA ≥ 750 M€)"),
   ("onu","ONU\nArticle 12B (2021)\nConvention-cadre"),
   ("ue","Union européenne\nDirective 2022/2523\nBEFIT")]),
 "B4": ("4. GOUVERNANCE &\nORDRES JURIDIQUES", "violet", [
   ("ci","Cadre inclusif\n> 140 juridictions\nexamen par les pairs"),
   ("legit","Légitimité contestée\n(agenda OCDE,\nasymétries de pouvoir)"),
   ("omc","Droit de l'OMC / AGCS\n(non-discrimination)"),
   ("ti","Traités d'investissement\n(expropriation, ISDS)"),
   ("cf","Conventions fiscales\n(art. 2, champ des impôts)"),
   ("rep","Représailles US\n(section 301, 899)")]),
 "B5": ("5. COMPÉTITIVITÉ DE L'ÉTAT\n(attractivité fiscale)", "blue", [
   ("conc","Concurrence fiscale\nplancher « poreux »"),
   ("increv","Incitations fondées\nsur le REVENU\n(neutralisées)"),
   ("incdep","Incitations fondées\nsur les DÉPENSES\n(préservées)"),
   ("rec","Recettes\n(gains modestes,\nincertains pour PVD)"),
   ("souv","Souveraineté fiscale\ncontrainte (droit souple)"),
   ("lnf","Leviers non fiscaux\n(subventions, climat\ndes affaires)")]),
 "B6": ("6. COMPÉTITIVITÉ DES\nENTREPRISES", "green", [
   ("etr","Taux effectif d'imposition\n& coût du capital"),
   ("loc","Localisation / relocalisation\n& fusions-acquisitions"),
   ("conf","Coûts de conformité\n(calcul ETR, données comptables)"),
   ("insec","Insécurité juridique\n(PME, transactions numériques)"),
   ("egal","Égalité des conditions\nde concurrence\nlocal vs plateformes"),
   ("bourse","Valeur boursière\n(-0,69 %, 52 Md€)")]),
 "B7": ("7. LE MAROC\n(terrain de la thèse)", "crimson", [
   ("mci","Cadre inclusif & IML\n(2019)"),
   ("mgris","Sortie liste grise UE\n(2021) — réforme des\nrégimes préférentiels"),
   ("m6919","Loi-cadre 69-19\n(2021)"),
   ("mis","Convergence IS\n20 % / 35 % (LF 2023 → 2026)"),
   ("mtva","TVA numérique\nnon-résidents (LF 2024)"),
   ("mqd","QDMTT :\naucun texte identifié"),
   ("mlit","Littérature indexée :\n3 études sur 291")]),
}
sub = {  # 3e niveau
 "cv": [("pcons","Pays de consommation\n(aval des chaînes)"),("pprod","Pays de production\n(amont, bas revenu)")],
 "tsn": [("rente","Rente de localisation\n(justification)"),("incid","Incidence : répercussion\nsur clients / consommateurs"),("levier","Levier de négociation\n→ accord de 2021")],
 "p1": [("ma","Montant A\n(échec probable)"),("mb","Montant B\n(distribution de base)")],
 "p2": [("qdmtt","QDMTT\n(impôt complémentaire\nnational)"),("iir","IIR / UTPR"),("sbie","SBIE\n(exclusion substance)"),
        ("qrtc","QRTC\n(crédits remboursables)"),("sttr","STTR\n(règle d'assujettissement)"),("cac","Système « côte à côte »\n(groupes US, 2026)")],
}
cross = [  # (src, dst, label, strong)
 ("swm","tsn","déclenche",False), ("tb","p2","justifie",False), ("cv","p1","fonde",False),
 ("levier","p1","pression",False), ("tsn","omc","contesté par",False), ("tvasn","egal","rééquilibre ?",False),
 ("beps","mgris","Action 5",False), ("p2","ti","litiges",False), ("p2","increv","neutralise",True),
 ("p2","etr","↑ ETR, ↑ coût capital",True), ("qdmtt","conf","↑ conformité",False),
 ("onu","souv","alternative PVD",False), ("qdmtt","rec","capte recettes",False),
 ("sbie","conc","laisse subsister",False), ("qrtc","incdep","réoriente",False),
 ("rep","cac","impose",False), ("ci","mci","engage",False), ("mqd","increv","enjeu",False),
 ("ue","mgris","via",False), ("mgris","increv","modifie",False), ("mis","etr","modifie",False),
]

pal_of = {}
nodes, tree = "", ""
center = "FISCALITÉ NUMÉRIQUE\nà l'aune de l'harmonisation internationale\n—\nimpact sur la compétitivité\ndes entreprises (Maroc)"
nodes += (f'"C" [label={lab(center, True, size=15, color="white")}, shape=box, style="rounded,filled", '
          f'color="{P["navy"][0]}", fillcolor="{P["navy"][0]}", penwidth=3, margin="0.3,0.18"];\n')
for b,(t,pal,kids) in branches.items():
    d,l = P[pal]
    nodes += (f'"{b}" [label={lab(t, True, size=13, color="white")}, shape=box, style="rounded,filled", '
              f'color="{d}", fillcolor="{d}", penwidth=2, margin="0.2,0.1"];\n')
    tree += f'"C" -- "{b}" [color="{d}", penwidth=4.5];\n'
    for k,kt in kids:
        pal_of[k]=pal
        strong = k in ("p1","p2")
        nodes += node(k, kt, pal, bold_first=strong, strong=strong, size=11)
        tree += f'"{b}" -- "{k}" [color="{d}", penwidth=1.8];\n'
        for s,st in sub.get(k,[]):
            pal_of[s]=pal
            nodes += node(s, st, (d, "white"), size=10, penwidth=1.1)
            tree += f'"{k}" -- "{s}" [color="{d}", penwidth=1.1];\n'

# 1) layout radial de l'arbre seul
tg = f'graph T {{ graph [ranksep="2.5 2.9 2.1", overlap=false, root="C"]; node [fontname="{SANS}", margin="0.14,0.07"];\n{nodes}{tree}}}'
open("s1_tree.gv","w").write(tg)
out = subprocess.run(["twopi","-Tdot","s1_tree.gv"],capture_output=True,text=True,check=True).stdout
pos = dict(re.findall(r'\n\s*"?([^\s"\[]+)"?\s+\[[^\]]*?pos="([\d.\-]+,[\d.\-]+)"', out))
for m in re.finditer(r'^\s*"?([\w]+)"?\s+\[(.*?)\];', out, re.S | re.M):
    pm = re.search(r'pos="([\d.\-]+,[\d.\-]+)"', m.group(2))
    if pm and m.group(1) not in pos: pos[m.group(1)] = pm.group(1)

def pinned(ns):
    def rep(m):
        nid = m.group(1)
        return m.group(0)[:-3] + f', pos="{pos[nid]}!"];\n'
    return re.sub(r'^"([^"]+)" \[.*\];\n', rep, ns, flags=re.M)

xs = ""
for a,b,t,strong in cross:
    c = "#B23A48" if strong else "#8B95A1"
    xs += (f'"{a}" -- "{b}" [style=dashed, color="{c}", penwidth={2.0 if strong else 1.1}, '
           f'label={elab(t)}, dir=forward, arrowhead=vee, arrowsize=0.8];\n')

g = graph_header("graph", "S1",
   "Schéma 1. Carte conceptuelle générale : fiscalité numérique, harmonisation internationale et compétitivité",
   "Traits pleins : arborescence des notions (une couleur par branche). Traits pointillés : relations transversales entre branches (le libellé indique la nature du lien) ; en rouge : effets majeurs du Pilier 2.",
   'splines=true, overlap=false, outputorder=edgesfirst, labelloc=t')
g += pinned(nodes) + tree + xs + "}\n"
open("s1.gv","w").write(g)
