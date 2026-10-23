from common import *
N1,N2,N3,N4,MOD = P["slate"],P["teal"],P["ochre"],P["green"],P["violet"]
def cl(name, title, pal, body, style="rounded,filled", fill=None):
    d,l = pal
    return (f'subgraph "cluster_{name}" {{ label={cluster_label(title, d)}; style="{style}"; '
            f'color="{d}"; fillcolor="{fill or l+"80"}"; penwidth=1.6; margin=16;\n{body}}}\n')
def n(i,t,pal,**k): return node(i,t,(pal[0],"white"),**k)

g = graph_header("digraph","S2",
 "Schéma 2. Modèle conceptuel de la thèse : la chaîne de transmission « normes internationales → État marocain → entreprises → compétitivité »",
 "Flèche pleine : effet causal postulé. Flèche épaisse : canal principal. Flèche pointillée : rétroaction. Losange : variable modératrice. P1-P3 : propositions de recherche issues de l'état de l'art.",
 'rankdir=LR, newrank=true, nodesep=0.28, ranksep=1.1, splines=true, compound=true')
g += cl("n1","NIVEAU 1 — Normes internationales\n(variables exogènes)",N1,
  n("ue","Pressions de l'UE\n(liste des juridictions non\ncoopératives, code de conduite)",N1)+
  n("p2","Pilier 2 — GloBE\nimpôt minimum effectif 15 %\nQDMTT · IIR · UTPR · STTR\nSBIE · QRTC",N1,bold_first=True,strong=True)+
  n("cac","Système « côte à côte »\n(2026) — fragmentation",N1)+
  n("beps","BEPS : standards minimums\n(Action 5 pratiques dommageables,\nAction 6, Action 13, IML)",N1)+
  n("p1","Pilier 1 / Article 12B ONU\nréallocation aux juridictions\nde marché (incertaine)",N1)+
  n("tvao","Lignes directrices TVA (OCDE)\nimposition à destination\ndes services numériques",N1))
g += cl("n2","NIVEAU 2 — Réception par l'État marocain\n(choix de politique fiscale = variables médiatrices)",N2,
  n("ref","Réforme des régimes préférentiels\n(zones franches → ZAI, statut CFC,\nexportateurs) — sortie liste grise 2021",N2)+
  n("recomp","Recomposition des incitations\nrevenu → dépenses (QRTC,\nsubventions, Charte de l'investissement)",N2)+
  n("conv","Convergence des taux d'IS\n20 % / 35 % / 40 %\n(loi-cadre 69-19 ; LF 2023 → 2026)",N2)+
  n("qd","Option QDMTT / impôt\nminimum national\n(non adoptée à ce jour)",N2)+
  n("cap","Capacité administrative\n(DGI, échange d'informations,\ndéclaration pays par pays)",N2)+
  n("tva","TVA sur services numériques\ndes non-résidents (LF 2024,\nart. 115 bis CGI)",N2)+
  f'"attr" [label={lab("ATTRACTIVITÉ FISCALE\nDU TERRITOIRE\n(compétitivité de l'État)",True,size=13,color="white")}, shape=box, style="rounded,filled", color="{N2[0]}", fillcolor="{N2[0]}", penwidth=2.5, margin="0.25,0.12"];\n')
g += cl("n3","NIVEAU 3 — Canaux de transmission à l'entreprise",N3,
  n("acc","Accès aux incitations\n& au soutien public",N3)+
  n("sec","Sécurité juridique\n& prévisibilité",N3)+
  n("charge","Charge fiscale effective\n(taux effectif, coût du capital)",N3,bold_first=True,strong=True)+
  n("comp","Comportement fiscal\n(transfert de bénéfices,\nlocalisation des profits)",N3)+
  n("conf","Coûts de conformité\n& complexité administrative",N3)+
  n("concu","Conditions de concurrence\nentreprises locales\nvs plateformes étrangères",N3))
g += cl("n4","NIVEAU 4 — Compétitivité des entreprises\n(variable dépendante)",N4,
  n("inv","Investissement\n& capacité d'innovation",N4)+
  n("loc","Localisation / maintien\ndes activités au Maroc",N4)+
  n("prix","Compétitivité-prix\n(coûts, marges)",N4)+
  n("croiss","Croissance, parts de marché\n& exportations",N4)+
  f'"compet" [label={lab("COMPÉTITIVITÉ\nDES ENTREPRISES\n(perçue et mesurée)",True,size=14,color="white")}, shape=box, style="rounded,filled", color="{N4[0]}", fillcolor="{N4[0]}", penwidth=2.5, margin="0.25,0.14"];\n')
dm = lambda i,t: f'"{i}" [label={lab(t,True,size=10)}, shape=diamond, style=filled, color="{MOD[0]}", fillcolor="{MOD[1]}", penwidth=1.3, margin="0.02,0.02"];\n'
g += cl("mod","Modérateurs",MOD,
  dm("m_reg","Régime\nd'incitation\nbénéficié")+dm("m_exp","Exposition\ninternationale\n(filiale, exportateur)")+
  dm("m_taille","Taille\n(groupe ≥ 750 M€\nvs PME)")+dm("m_sect","Secteur\n(numérique,\nindustrie, services)"),
  style="rounded,dashed,filled", fill="#FBFAFE")
props = ("[P1] Les normes réduisent l'usage des incitations fondées sur le revenu et réorientent l'État vers d'autres leviers.\n"
 "[P2] Les choix de l'État modifient la charge effective et les coûts de conformité, différemment selon la taille, le secteur et l'exposition.\n"
 "[P3] La TVA numérique rééquilibre la concurrence local / étranger, sous réserve de l'effectivité du recouvrement et de la répercussion.")
plines = "".join(f'<TR><TD ALIGN="LEFT"><FONT COLOR="#A3283A"><B>{esc(l[:4])}</B></FONT>{esc(l[4:])}</TD></TR>' for l in props.split("\n"))
g += (f'"props" [shape=plain, label=<<TABLE BORDER="1" COLOR="{P["crimson"][0]}" STYLE="ROUNDED" BGCOLOR="#FFFDF8" CELLPADDING="5" CELLSPACING="0" CELLBORDER="0">'
      f'<TR><TD><FONT FACE="{SERIF}" POINT-SIZE="14" COLOR="{P["crimson"][0]}"><B>Propositions de recherche (repérées sur les flèches)</B></FONT></TD></TR>{plines}</TABLE>>, fontsize=11];\n')

E = lambda a,b,c=LINK,w=1.1,s="solid",l=None,x="": f'"{a}" -> "{b}" [color="{c}", penwidth={w}, style={s}{", label="+elab(l) if l else ""}{x}];\n'
D1,D2,D3,D4 = N1[0],N2[0],N3[0],N4[0]
RED = P["crimson"][0]
g += E("ue","ref",D1,2.6)+E("p2","recomp",RED,3,"solid","[P1] neutralise les\nincitations revenu")+E("p2","conv",D1,1.3,"dashed","pression\nconvergente")
g += E("p2","qd",D1,2.6)+E("beps","ref",D1,1.3)+E("beps","cap",D1,1.3)
g += E("cac","qd",D1,1.3,"dotted","incertitude")+E("cac","sec",D1,1.3,"dotted")+E("p1","tva",D1,1.3,"dotted","alternative")+E("tvao","tva",D1,2.6)
for s in ["ref","recomp","conv","qd","cap","tva"]: g += E(s,"attr",D2,1.1)
g += E("attr","recomp",D2,1.3,"dashed","ajustement\nde la politique",', constraint=false')
g += E("recomp","acc",D2,2.6)+E("ref","acc",D2,1.1)+E("ref","sec",D2,1.1)+E("recomp","sec",D2,1.1)
g += E("conv","charge",RED,3,"solid","[P2]")+E("qd","charge",D2,2.6)+E("qd","comp",D2,1.1)+E("qd","conf",D2,1.1)+E("cap","conf",D2,1.3)
g += E("tva","concu",RED,3,"solid","[P3]")
g += E("acc","inv",D3,2.6)+E("sec","inv",D3,1.2)+E("charge","inv",D3,1.2)+E("charge","loc",D3,1.2)+E("charge","prix",D3,2.6)
g += E("comp","loc",D3,1.2)+E("conf","prix",D3,1.2)+E("concu","croiss",D3,2.6)
g += E("attr","loc",D2,2.6,"solid","attire / retient")
for s in ["inv","loc","prix","croiss"]: g += E(s,"compet",D4,1.6)
g += E("compet","attr",D4,1.4,"dashed","base fiscale,\nrecettes, emploi",', constraint=false')
M = P["violet"][0]
for a,b in [("m_reg","acc"),("m_exp","comp"),("m_taille","charge"),("m_taille","conf"),("m_sect","concu")]:
    g += E(a,b,M,1.1,"dashed",None,', arrowhead=odot')
g += '{rank=same; m_reg; m_exp; m_taille; m_sect; ref;}\n'
g += '"tvao" -> "props" [style=invis];\n'
g += "}\n"
open("s2.gv","w").write(g)
