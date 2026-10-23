from common import *
L, Q, PR, MET, CH, AR, PB = P["brown"], P["blue"], P["teal"], P["violet"], P["green"], P["crimson"], P["navy"]
def cl(name, title, pal, body):
    d,l = pal
    return (f'subgraph "cluster_{name}" {{ label={cluster_label(title, d, 14)}; style="rounded,filled"; color="{d}"; '
            f'fillcolor="{l}80"; penwidth=1.6; margin=14;\n{body}}}\n')
n = lambda i,t,pal,**k: node(i,t,(pal[0],"white"),bold_first=True,**k)
g = graph_header("digraph","S6",
 "Schéma 6. Architecture logique de la thèse : des lacunes de la littérature aux chapitres et aux articles",
 "Lecture de gauche à droite : chaque lacune fonde une question, chaque question une proposition, chaque proposition une méthode, un chapitre et un article.",
 'rankdir=LR, newrank=true, nodesep=0.3, ranksep=0.75, splines=true')
g += cl("lac","Lacunes établies par la revue systématique (n = 291)",L,
  n("L1","L1 Géographique\nMaroc : 3 études / 291 ;\nMaghreb absent",L)+n("L2","L2 Maillon entreprise\n56 travaux / 291 ;\nentreprises locales ignorées",L)+
  n("L3","L3 Articulation\nÉtat ↔ entreprise\njamais modélisée",L)+n("L4","L4 Méthodologique\n78 % d'analyses juridiques ;\n1 seule étude mixte",L)+
  n("L5","L5 Temporelle\nmise en œuvre du Pilier 2\n(2024-2026) non documentée",L))
g += (f'"PB" [label={lab("PROBLÉMATIQUE\nComment l\'harmonisation internationale de la fiscalité de l\'économie numérique,\nà travers les choix de politique fiscale qu\'elle impose à l\'État marocain,\naffecte-t-elle la compétitivité des entreprises installées au Maroc ?",True,size=13,color="white")}, '
      f'shape=box, style="rounded,filled", color="{PB[0]}", fillcolor="{PB[0]}", penwidth=3, margin="0.3,0.18"];\n')
g += cl("qr","Questions de recherche",Q,
  n("QR1","QR1\nQuels mécanismes d'harmonisation\net quelle cohérence ?",Q)+n("QR2","QR2\nComment l'État marocain reçoit-il ces normes\net quelle marge d'attractivité conserve-t-il ?",Q)+
  n("QR4","QR4\nQuelles différences selon taille, secteur\net exposition internationale ?",Q)+n("QR3","QR3\nQuels effets de ces choix\nsur la compétitivité des entreprises ?",Q))
g += cl("pr","Propositions",PR,
  n("P1","P1\nRecomposition des instruments d'attractivité\n(revenu → dépenses / non fiscal)",PR)+
  n("P2","P2\nVariation de la charge effective et des coûts\nde conformité, modérée par taille / secteur / exposition",PR)+
  n("P3","P3\nTVA numérique et rééquilibrage\nde la concurrence local / étranger",PR))
g += cl("met","Dispositif méthodologique mixte séquentiel",MET,
  n("M0","Revue systématique PRISMA\n+ analyse bibliométrique",MET)+n("M1","Analyse documentaire et juridique\n(lois de finances, CGI, conventions,\nengagements OCDE / UE)",MET)+
  n("M2","Volet qualitatif exploratoire\n12-15 entretiens d'experts\n(analyse thématique)",MET)+n("M3","Volet quantitatif confirmatoire\nquestionnaire ≈ 150 entreprises\nmodélisation PLS-SEM",MET))
g += cl("ch","Chapitres (≈ 400 pages)",CH,
  n("C1","Ch. 1 — État de l'art\n(RSL, bibliométrie)\nPartie 1",CH)+n("C2","Ch. 2 — Réception des normes\npar le Maroc et attractivité\nPartie 1",CH)+
  n("C3","Ch. 3 — Cadre théorique,\nhypothèses, méthodologie\nPartie 2",CH)+n("C4","Ch. 4 — Résultats qualitatifs\net quantitatifs, discussion\nPartie 2",CH))
g += cl("ar","Articles indexés exigés (4)",AR,
  n("A1","A1 Analyse bibliométrique\n(soumission visée : déc. 2026)",AR,strong=True)+n("A2","A2 Revue systématique\n& agenda de recherche\n(janv. 2027)",AR,strong=True)+
  n("A3","A3 Maroc : réception des normes\net attractivité\n(mars 2027)",AR,strong=True)+n("A4","A4 Résultats empiriques\ncompétitivité des entreprises\n(juin 2027)",AR,strong=True))
E = lambda a,b,c,w=1.3,s="solid",x="": f'"{a}" -> "{b}" [color="{c}", penwidth={w}, style={s}{x}];\n'
for i in range(1,6): g += E(f"L{i}","PB",L[0],1.4,"solid",", arrowhead=none")
for q in ["QR1","QR2","QR4","QR3"]: g += E("PB",q,PB[0],2.4)
g += E("QR1","P1",Q[0],1.2,"dashed")+E("QR2","P1",Q[0])+E("QR4","P2",Q[0])+E("QR3","P2",Q[0])+E("QR3","P3",Q[0])
g += E("P1","M1",PR[0])+E("P1","M2",PR[0])+E("P2","M2",PR[0])+E("P2","M3",PR[0])+E("P3","M3",PR[0])
g += E("M1","M0",MET[0],2.4,"solid",", dir=back")+E("M2","M1",MET[0],2.4,"solid",", dir=back")+E("M3","M2",MET[0],2.4,"solid",", dir=back")
g += E("M0","C1",MET[0])+E("M1","C2",MET[0])+E("M1","C3",MET[0],1.2,"dashed")+E("M2","C3",MET[0],1.2,"dashed")+E("M2","C4",MET[0])+E("M3","C4",MET[0])
g += E("C1","A1",CH[0])+E("C1","A2",CH[0])+E("C2","A3",CH[0])+E("C4","A4",CH[0])
g += "{rank=same; M0; M1; M2; M3;}\n{rank=same; C4 -> C3 -> C2 -> C1 [style=invis];}\n{rank=same; A4 -> A3 -> A2 -> A1 [style=invis];}\n{rank=same; QR3 -> QR4 -> QR2 -> QR1 [style=invis];}\n{rank=same; P3 -> P2 -> P1 [style=invis];}\n"
g += "}\n"
open("s6.gv","w").write(g)
