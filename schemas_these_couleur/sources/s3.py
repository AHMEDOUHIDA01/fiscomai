from common import *
CALC, TEST, ST, LIT, ORD, CH = P["navy"],P["slate"],P["blue"],P["gold"],P["teal"],P["crimson"]
def cl(name, title, pal, body, fill=None, style="rounded,filled"):
    d,l = pal
    return (f'subgraph "cluster_{name}" {{ label={cluster_label(title, d, 14)}; style="{style}"; color="{d}"; '
            f'fillcolor="{fill or l+"70"}"; penwidth=1.6; margin=14;\n{body}}}\n')
def n(i,t,pal,white=True,**k): return node(i,t,(pal[0],"white") if white else pal,**k)
def dm(i,t): return f'"{i}" [label={lab(t,True,size=11)}, shape=diamond, style=filled, color="{TEST[0]}", fillcolor="#FFFFFF", penwidth=1.6, margin="0.05,0.03"];\n'
g = graph_header("digraph","S3",
 "Schéma 3. Mécanique de l'impôt minimum mondial (Pilier 2) et ses conséquences pour l'attractivité fiscale d'un pays d'accueil",
 "Losanges : tests successifs. Cadres rouges : décisions de politique fiscale ouvertes à l'État d'accueil (cas du Maroc). Flèches épaisses : séquence de calcul. Cadres dorés : conséquences documentées par la littérature.",
 'rankdir=TB, newrank=true, nodesep=0.35, ranksep=0.55, splines=ortho')
g += node("grp","Groupe multinational\nchiffre d'affaires consolidé ≥ 750 M€\n(2 des 4 derniers exercices)",CALC,bold_first=True,strong=True,fill=CALC[1])
g += dm("champ","Dans le champ ?")
g += node("hors","Hors champ :\nincitations nationales\npleinement efficaces\n(PME, groupes < 750 M€)",P["green"])
g += node("sttr","Règle d'assujettissement (STTR)\nconventionnelle, prioritaire :\nretenue complémentaire jusqu'à 9 %\nsur paiements intragroupe\n(intérêts, redevances, services)",P["violet"],bold_first=True)
g += n("calc","Calcul par juridiction (blending juridictionnel)\nRésultat GloBE = résultat comptable ajusté\nImpôts couverts ajustés",CALC)
g += n("etr","Taux effectif (ETR) =\nimpôts couverts / résultat GloBE",CALC,bold_first=True)
g += dm("t15","ETR < 15 % ?")
g += node("aucun","Aucun impôt complémentaire",P["green"])
g += n("sbie","Exclusion fondée sur la substance (SBIE)\n≈ 5 % de la masse salariale + 5 % des actifs corporels\n(taux transitoires plus élevés)",CALC,bold_first=True)
g += n("bex","Bénéfice excédentaire = résultat GloBE − SBIE",CALC)
g += node("ic","Impôt complémentaire = (15 % − ETR) × bénéfice excédentaire",CALC,strong=True,fill=CALC[1])
g += cl("ord","Ordre de perception de l'impôt complémentaire",ORD,
  node("qd","1. QDMTT\nimpôt complémentaire national\nqualifié de l'État d'accueil",ORD,bold_first=True,strong=True)+
  n("iir","2. IIR\nrègle d'inclusion du revenu\n(État de la société mère)",ORD,bold_first=True)+
  n("utpr","3. UTPR\nrègle des bénéfices\ninsuffisamment imposés\n(autres juridictions)",ORD,bold_first=True)+
  n("cac","Système « côte à côte » (2026)\ngroupes à société mère américaine\nexemptés d'IIR et d'UTPR",P["slate"]))
g += cl("eff","Effet sur les instruments d'attractivité de l'État d'accueil",ST,
  n("qrtc","QRTC — crédits d'impôt\nremboursables qualifiés\ntraités comme un revenu\n→ effet préservé (« sous le plancher »)",P["green"])+
  n("dep","Incitations fondées sur les DÉPENSES\namortissement accéléré, déductions,\nincitations liées à la substance\n→ effet partiellement préservé",P["green"])+
  node("rev","Incitations fondées sur le REVENU\nexonérations temporaires, taux réduits,\nzones franches / ZAI, régimes préférentiels\n→ abaissent l'ETR → récupérées\npar l'impôt complémentaire",CH,bold_first=True,strong=True)+
  n("subv","Subventions directes & leviers\nnon fiscaux (foncier, formation,\ninfrastructures, climat des affaires)\n→ hors du champ GloBE",P["green"])+
  n("tax","Crédit d'impôt fictif (tax sparing)\nconventionnel → neutralisé\npar l'IIR",CH))
g += cl("choix","Choix stratégiques de l'État d'accueil (Maroc)",CH,
  node("gen","Impôt minimum de portée\ngénérale / convergence\ndes taux (20 % / 35 %)",CH)+
  node("adopt","Adopter un QDMTT\n+ capter la recette localement\n− complexité, examen par les pairs,\nrecettes incertaines",CH,bold_first=True)+
  node("recomp","Recomposer les incitations\nrevenu → dépenses / QRTC /\nsubventions ; Charte de\nl'investissement",CH,bold_first=True)+
  node("afr","Réponse régionale africaine\n(coordination, ATAF,\nconvention ONU)",CH)+
  node("nonad","Ne pas l'adopter\n→ l'impôt part vers l'État\nde la société mère (IIR / UTPR)\n= perte nette de recettes",CH,bold_first=True),
  fill="#FDF4F5")
g += cl("lit","Conséquences documentées par la littérature",LIT,
  n("l1","Relocalisations préventives\nvers pays à fiscalité plus élevée\n(Yoo, 2026)",LIT,size=10)+
  n("l2","Plancher « poreux » : la concurrence\nsubsiste sous le plancher\n(Devereux et al., 2023 ; Englisch, 2022)",LIT,size=10)+
  n("l3","SBIE = subvention implicite à la\nproduction : ↑ emploi / investissement\n(Schjelderup et Stähler, 2023)",LIT,size=10)+
  n("l4","↑ coût du capital, ↓ transfert de\nbénéfices, ↓ investissement total\n(Bares et al., 2026)",LIT,size=10)+
  n("l5","Gains limités et charge\nadministrative pour les PVD\n(Das, 2024 ; Mollagee, 2024)",LIT,size=10)+
  'l1 -> l2 -> l3 -> l4 -> l5 [style=invis];\n', fill="#FFFCF2")
C, R, G, L = CALC[0], CH[0], P["slate"][0], LIT[0]
E = lambda a,b,c=G,w=1.2,s="solid",l=None,x="": f'"{a}" -> "{b}" [color="{c}", penwidth={w}, style={s}{", xlabel="+elab(l) if l else ""}{x}];\n'
g += E("grp","champ",C,2.6)+E("champ","hors",G,1.2,"solid","non")+E("champ","calc",C,2.6,"solid","oui")
g += E("sttr","calc",P["violet"][0],1.4,"dashed","s'applique avant")+E("calc","etr",C,2.6)+E("etr","t15",C,2.6)
g += E("etr","qrtc",G,1.2,"dashed","numérateur / dénominateur")
g += E("t15","aucun",G,1.2,"solid","non")+E("t15","sbie",C,2.6,"solid","oui")+E("sbie","bex",C,2.6)+E("bex","ic",C,2.6)
g += E("sbie","dep",G,1.2,"dashed","ménage")+E("ic","qd",C,2.6)+E("ic","rev",R,2.6,"solid","neutralise")
g += E("qd","iir",ORD[0],1.4,"solid","à défaut")+E("iir","utpr",ORD[0],1.4,"solid","à défaut")
g += E("iir","tax",R,1.3,"dashed","annule")+E("iir","nonad",G,1.2,"dashed")+E("qd","adopt",G,1.2,"dashed")
g += E("cac","iir",G,1.2,"dashed")+E("cac","utpr",G,1.2,"dashed")
g += E("qrtc","recomp",G,1.2,"dashed")+E("rev","recomp",G,1.2,"dashed")+E("subv","recomp",G,1.2,"dashed")
for a,b in [("grp","l1"),("qrtc","l2"),("sbie","l3"),("ic","l4"),("adopt","l5")]:
    g += E(a,b,L,1.2,"dotted",None,", arrowhead=none, constraint=false")
g += "{rank=same; champ; sttr;}\n{rank=same; hors; calc;}\n{rank=same; qd; cac; rev; subv; gen; afr;}\n{rank=same; iir; adopt; recomp;}\n{rank=same; utpr; tax; nonad;}\n{rank=same; champ; l1;}\n{rank=same; etr; l2;}\n{rank=same; sbie; l3;}\n{rank=same; ic; l4;}\n{rank=same; iir; l5;}\n"
g += "}\n"
open("s3.gv","w").write(g)
