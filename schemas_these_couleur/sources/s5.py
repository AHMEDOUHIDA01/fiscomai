from common import *
J, M, ENT, LAC, Y = P["teal"], P["crimson"], P["ochre"], P["violet"], P["navy"]
rows = [
 ("2013","Lancement du projet\nBEPS OCDE/G20",None,None,None),
 ("2015","Rapports finaux BEPS\n(Action 1 numérique,\nAction 5 régimes)",None,None,None),
 ("2016-17","Cadre inclusif ;\ninstrument multilatéral ;\ntaxe de péréquation (Inde)",None,None,None),
 ("2018","Rapport intérimaire OCDE ;\npropositions UE (présence\nnumérique, TSN 3 %)","Engagements envers l'UE\n(LF 2018 : début de la réforme\ndes régimes préférentiels)",None,None),
 ("2019","Programme de travail\ndeux piliers ;\nTSN française (2019)","Adhésion au Cadre inclusif ;\nsignature de l'IML (25 juin)",None,None),
 ("2020","Plans directeurs\nPiliers 1 et 2 ;\nSEP Nigeria","LF 2020 : zones franches → ZAI,\nréforme du statut CFC\net des exportateurs","Exportateurs et entreprises\nen zones franches :\nperte d'avantages ciblés","LACUNE 1\nEffet des réformes post-UE\nsur la compétitivité des\nentreprises exportatrices"),
 ("2021","Accord du 8 octobre 2021\n(Piliers 1 et 2) ;\nRègles GloBE (déc.) ;\nart. 12B ONU","Sortie de la liste grise UE\n(février 2021) ;\nloi-cadre 69-19 (juillet)",None,None),
 ("2022","Directive UE 2022/2523 ;\nmandat ONU vers une\nconvention fiscale","Charte de l'investissement\n(loi-cadre 03-22)",None,None),
 ("2023","Convention Montant A\n(non entrée en vigueur) ;\nSTTR","LF 2023 : convergence\nprogressive de l'IS\n(20 % / 35 % / 40 %)","Petites entreprises : taux de 10 %\nporté à 20 % ; bénéfices ≥ 100 M MAD :\n31 % porté à 35 %","LACUNE 2\nEffet de la convergence de l'IS\nsur l'investissement et\nles marges des PME"),
 ("2024","Entrée en vigueur\nde l'IIR / QDMTT\n(UE, Japon, Corée…)","LF 2024 : TVA sur services\nnumériques des non-résidents\n(art. 115 bis CGI)","Prestataires numériques locaux\nvs plateformes étrangères :\nconditions de concurrence","LACUNE 3\nEffet de la TVA numérique\nsur la concurrence\nlocal / étranger"),
 ("2025","Retrait US de l'accord ;\nmenaces de représailles",None,None,None),
 ("2026","Système « côte à côte »\n(janvier 2026)","Fin de la convergence de l'IS\n(2026) ; QDMTT : aucun texte\nidentifié ; Symposium IBFD-DGI","Filiales de groupes ≥ 750 M€ :\nimpôt complémentaire perçu\nà l'étranger si pas de QDMTT","LACUNE 4\nArbitrage QDMTT pour le Maroc\net incidence sur les filiales"),
]
cols = [("y","Année",Y),("j","Jalons internationaux",J),("m","Réponses de l'État marocain",M),("e","Entreprises touchées",ENT),("l","Lacunes de la littérature",LAC)]
g = graph_header("digraph","S5",
 "Schéma 5. Le Maroc face à l'harmonisation internationale : chronologie croisée (2013-2026) et chaîne d'effets",
 "Colonne 2 : jalons internationaux (vert d'eau). Colonne 3 : réponses de l'État marocain (rouge). Colonne 4 : entreprises touchées (ocre). Colonne 5 : lacunes de la littérature (violet, cadres épais). Pointillés : influence d'un jalon sur une décision.",
 'rankdir=TB, newrank=true, nodesep=0.55, ranksep=0.32, splines=true')
# en-têtes de colonnes
for c,t,pal in cols:
    g += (f'"h_{c}" [shape=box, style="rounded,filled", color="{pal[0]}", fillcolor="{pal[0]}", width=2.8, '
          f'label=<<FONT FACE="{SERIF}" POINT-SIZE="15" COLOR="white"><B>{esc(t)}</B></FONT>>];\n')
g += "{rank=same; " + " ".join(f"h_{c[0]};" for c in cols) + "}\n"
for c in cols[:-1]: pass
g += " -> ".join(f"h_{c[0]}" for c in cols) + " [style=invis];\n"
for i,(y,j,m,e,l) in enumerate(rows):
    g += (f'"y{i}" [shape=circle, style=filled, fixedsize=true, width=0.95, color="{Y[0]}", fillcolor="{Y[0]}", '
          f'label=<<FONT FACE="{SERIF}" POINT-SIZE="{14 if len(y)<5 else 11}" COLOR="white"><B>{y}</B></FONT>>];\n')
    g += node(f"j{i}", j, (J[0], J[1]), size=11)
    g += node(f"m{i}", m, (M[0], M[1]), size=11, strong=True) if m else f'"m{i}" [style=invis, shape=box, width=2.6];\n'
    g += node(f"e{i}", e, (ENT[0], "white"), size=11) if e else f'"e{i}" [style=invis, shape=box, width=2.6];\n'
    g += node(f"l{i}", l, (LAC[0], LAC[1]), size=11, bold_first=True, penwidth=2.6) if l else f'"l{i}" [style=invis, shape=box, width=2.6];\n'
    g += f'{{rank=same; y{i}; j{i}; m{i}; e{i}; l{i};}}\n'
    g += f'y{i} -> j{i} -> m{i} -> e{i} -> l{i} [style=invis];\n'
for c,_,_ in cols:
    prev = f"h_{c}"
    for i in range(len(rows)):
        if c == "y" and i>0:
            g += f'y{i-1} -> y{i} [color="{Y[0]}", penwidth=2.4, arrowsize=0.9, weight=100];\n'
        else:
            g += f'{prev} -> {c}{i} [style=invis, weight=100];\n'
        prev = f"{c}{i}"
R = M[0]
inf = [(1,3,"Action 5"),(1,5,"régimes\ndommageables"),(2,4,None),(3,9,"consommation\nà destination"),(6,8,"pression vers\nla convergence"),(6,11,None),(9,11,None),(10,11,None),(11,11,None)]
for a,b,l in inf:
    g += f'j{a} -> m{b} [style=dashed, color="{J[0]}", penwidth=1.3, constraint=false{", label="+elab(l) if l else ""}];\n'
g += f'm5 -> m6 [color="{R}", penwidth=1.6, constraint=false];\n'
for i in (5,8,9,11):
    g += f'm{i} -> e{i} [color="{R}", penwidth=2];\n'
    g += f'e{i} -> l{i} [style=dotted, color="{LAC[0]}", penwidth=1.8];\n'
g += "}\n"
open("s5.gv","w").write(g)
