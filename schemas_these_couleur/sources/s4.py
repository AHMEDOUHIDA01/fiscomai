from common import *
A, B, AP, CTR = P["blue"], P["brown"], P["green"], P["navy"]
cons = [
 ("tsn","TSN","Controverse 1 — Les taxes sur les services numériques sont-elles légitimes et efficaces ?",
  "POUR\nimpôt sur la rente de localisation ;\nsubstitut optimal quand les bénéfices fuient ;\nlevier de négociation ayant permis 2021\n— Cui (2019, 2020) ; Becker (2026) ;\nHeering et al. (2024) ; Noonan et Plekhanova (2025)",
  "CONTRE\ndistorsif, répercuté sur les clients,\ndiscriminatoire (OMC, art. 110 TFUE, aides d'État),\nfragmentation du cadre\n— Lamensch (2019) ; Dimitropoulou (2019) ;\nPirlot et Culot (2021) ; Berger et Polezharova (2023)",
  "Apport attendu : effet de la TVA numérique\nmarocaine sur la concurrence local / étranger"),
 ("pl","Plancher\nde 15 %","Controverse 2 — Le Pilier 2 met-il fin à la course vers le bas ?",
  "OUI\nplancher significatif ; incitations à l'adoption\npar les pays de siège puis d'accueil ;\nimpôt minimum Pareto-améliorant\n— Devereux (2023) ; Hebous et Keen (2023) ;\nAwuah et Treu (2026)",
  "NON / PARTIELLEMENT\nSBIE et QRTC laissent la concurrence\nsous le plancher ; déplacement vers le contrôle ;\nincompatibilité des incitations (côte à côte)\n— Devereux et al. (2023) ; Englisch (2022) ;\nDenk (2022) ; Cui (2024)",
  "Apport attendu : comment le Maroc recompose\nses instruments d'attractivité"),
 ("qd","QDMTT","Controverse 3 — Les pays en développement doivent-ils adopter un impôt complémentaire national (QDMTT) ?",
  "OUI\ncapter la recette plutôt que la céder\nà l'État de la société mère ; outil principal ;\nréponse régionale ciblée\n— Noked (2022) ; Baraké et al. (2022) ;\nTitus (2022)",
  "NON\ncomplexité, examen par les pairs, gains faibles ;\npriorité à la réforme des incitations\net à un impôt minimum général\n— Das (2024) ; Mollagee (2024) ;\nCzoboly et Erdős (2025)",
  "Apport attendu : arbitrage QDMTT / statu quo\npour le Maroc et effets sur les entreprises"),
 ("cv","Création\nde valeur","Controverse 4 — Où se crée la valeur et qui doit imposer ?",
  "JURIDICTION DE MARCHÉ\nusagers et consommateurs participent\nà la valeur ; imposer la destination,\nfacteurs immobiles\n— Devereux et Vella (2018) ;\nDevereux et al. (2021)",
  "ACTIVITÉS INTERNES / PRODUCTION\nla valeur des données naît des activités\nde l'entreprise ; pas d'ordre fiscal spécifique ;\nbiais en faveur des pays de consommation\n— Olbert et Spengel (2019) ; Quentin (2021)",
  "Apport attendu : position du Maroc,\nà la fois marché et plateforme de production"),
 ("cf","Concurrence\nfiscale","Controverse 5 — La concurrence fiscale est-elle nuisible pour les pays en développement ?",
  "NUISIBLE\nérode la capacité redistributive ;\nla justice impose des taux minimums\nsur les bases mobiles\n— Cassee (2019) ; Tandon (2022)",
  "UTILE SI « RÉELLE »\nla concurrence pour l'investissement productif\npeut être redistributive ; distinguer concurrence\nvirtuelle et réelle ; récit « gagnant-gagnant » irréaliste\n— Chukwudumogu (2024) ; Titus (2022) ; Parada (2024)",
  "Apport attendu : effet des choix d'attractivité\nsur la compétitivité réelle des entreprises"),
 ("gv","Gouvernance","Controverse 6 — L'harmonisation multilatérale est-elle légitime et durable ?",
  "RÉVOLUTION RÉUSSIE\nplus de 140 juridictions ; passage de la double\nimposition à la lutte contre la sous-imposition\n— Avi-Yonah et Kim (2025) ; Sykes (2020)",
  "LÉGITIMITÉ ET DURABILITÉ CONTESTÉES\nagenda OCDE, asymétries de pouvoir, effets de cartel ;\nfragmentation, exemption américaine ; retour de l'ONU\n— Dagan (2023) ; Mosquera Valderrama (2018) ;\nMagwape (2024) ; Majorana (2026)",
  "Apport attendu : marge réelle de l'État marocain\nentre OCDE, UE et ONU"),
]
leg = (f'<<TABLE BORDER="0" CELLSPACING="6"><TR>'
  f'<TD BGCOLOR="{A[1]}" WIDTH="18" HEIGHT="12" STYLE="ROUNDED"> </TD><TD ALIGN="LEFT"><FONT POINT-SIZE="11">Position A</FONT></TD>'
  f'<TD BGCOLOR="{CTR[0]}" WIDTH="18" HEIGHT="12" STYLE="ROUNDED"> </TD><TD ALIGN="LEFT"><FONT POINT-SIZE="11">Objet de la controverse</FONT></TD>'
  f'<TD BGCOLOR="{B[1]}" WIDTH="18" HEIGHT="12" STYLE="ROUNDED"> </TD><TD ALIGN="LEFT"><FONT POINT-SIZE="11">Position B</FONT></TD>'
  f'<TD BGCOLOR="{AP[1]}" WIDTH="18" HEIGHT="12" STYLE="ROUNDED"> </TD><TD ALIGN="LEFT"><FONT POINT-SIZE="11">Apport attendu de la thèse</FONT></TD>'
  f'</TR></TABLE>>')
g = graph_header("digraph","S4",
 "Schéma 4. Carte des controverses de la littérature : thèses en présence, arguments et auteurs",
 "Pour chaque controverse : position A (gauche), position B (droite), apport attendu de la thèse (cadre vert). Pointillés : dépendances entre controverses. Les auteurs cités appartiennent au corpus de la revue systématique.",
 'rankdir=LR, newrank=true, nodesep=0.25, ranksep=0.9, splines=true')
g += f'"legend" [shape=plain, label={leg}];\n'
prev = "legend"
for i,(k,c,t,a,b,ap) in enumerate(cons[::-1]):
    body = (node(k+"_a",a,A,bold_first=True,size=11)+
      f'"{k}" [label={lab(c,True,size=14,color="white")}, shape=ellipse, style=filled, color="{CTR[0]}", fillcolor="{CTR[0]}", penwidth=2, margin="0.12,0.06"];\n'+
      node(k+"_b",b,B,bold_first=True,size=11)+
      node(k+"_ap",ap,AP,size=11,strong=True)+
      f'"{k}_a" -> "{k}" [arrowhead=none, color="{A[0]}", penwidth=1.6];\n'
      f'"{k}" -> "{k}_b" [dir=back, arrowtail=none, color="{B[0]}", penwidth=1.6];\n'
      f'"{k}" -> "{k}_ap" [style=dashed, color="{AP[0]}", penwidth=1.4];\n'
      f'{{rank=same; "{k}_b"; "{k}_ap";}}\n')
    g += (f'subgraph "cluster_{k}" {{ label={cluster_label(t, CTR[0], 14)}; style="rounded,filled"; '
          f'color="#C9D2DD"; fillcolor="{"#FAFBFD" if i%2==0 else "#F4F7FA"}"; penwidth=1.3; margin=14;\n{body}}}\n')
    g += f'"{prev}" -> "{k}_a" [style=invis];\n' if prev!="legend" else ""
    prev = k+"_a"
# empilement vertical : on force les colonnes
g += "{rank=same; " + " ".join(f'"{c[0]}_a";' for c in cons) + "}\n"
g += "{rank=same; " + " ".join(f'"{c[0]}";' for c in cons) + "}\n"
g += "{rank=same; legend; " + " ".join(f'"{c[0]}_b";' for c in cons) + "}\n"
R = P["crimson"][0]
for a,b,l in [("tsn","cv","dépend de"),("pl","qd","conditionne"),("cf","pl","fonde"),("gv","qd","encadre")]:
    g += f'"{a}" -> "{b}" [style=dotted, color="{R}", penwidth=1.8, constraint=false, label={elab(l)}];\n'
g += "}\n"
open("s4.gv","w").write(g)
