import html, subprocess, re

SERIF = "Caladea"
SANS = "Inter"
INK = "#1E2A38"
MUTED = "#5C6773"
LINK = "#7C8794"

# palette académique (teinte forte, fond clair)
P = {
    "navy":   ("#1F3A5F", "#E3EAF3"),
    "brown":  ("#7A5230", "#F4ECE3"),
    "ochre":  ("#A8741A", "#FBF1DD"),
    "teal":   ("#1F7A72", "#DDF0EC"),
    "violet": ("#5B4B8A", "#ECE8F5"),
    "blue":   ("#2E6A9E", "#E1ECF6"),
    "green":  ("#3C7A3B", "#E4F1E2"),
    "crimson":("#A3283A", "#F8E2E5"),
    "slate":  ("#4A5868", "#EEF1F4"),
    "gold":   ("#9A7B1C", "#FAF3DC"),
}

def esc(s):
    return html.escape(s, quote=False)

def lab(text, bold_first=False, size=None, color=None):
    """HTML label: lines separated by \\n; optional bold first line."""
    lines = text.split("\n")
    out = []
    for i, l in enumerate(lines):
        e = esc(l)
        if bold_first and i == 0:
            e = f"<B>{e}</B>"
        out.append(e)
    body = "<BR/>".join(out)
    attrs = ""
    if size: attrs += f' POINT-SIZE="{size}"'
    if color: attrs += f' COLOR="{color}"'
    if attrs:
        body = f"<FONT{attrs}>{body}</FONT>"
    return f"<{body}>"

def title_label(title, subtitle):
    return (f'<<FONT FACE="{SERIF}" POINT-SIZE="26" COLOR="{INK}"><B>{esc(title)}</B></FONT>'
            f'<BR/><FONT POINT-SIZE="6"> </FONT><BR/>'
            f'<FONT FACE="{SANS}" POINT-SIZE="12" COLOR="{MUTED}"><I>{esc(subtitle)}</I></FONT>'
            f'<BR/><FONT POINT-SIZE="10"> </FONT>>')

def cluster_label(text, color, size=15):
    lines = text.split("\n")
    parts = [f'<FONT FACE="{SERIF}" POINT-SIZE="{size}" COLOR="{color}"><B>{esc(lines[0])}</B></FONT>']
    for l in lines[1:]:
        parts.append(f'<FONT FACE="{SERIF}" POINT-SIZE="{size-2}" COLOR="{color}"><I>{esc(l)}</I></FONT>')
    return "<" + "<BR/>".join(parts) + ">"

def node(nid, text, pal, bold_first=False, strong=False, fill=None, fontcolor=None, shape="box",
         size=11, penwidth=None, extra=""):
    dark, light = P[pal] if isinstance(pal, str) else pal
    f = fill or light
    fc = fontcolor or INK
    pw = penwidth or (2.4 if strong else 1.2)
    return (f'"{nid}" [label={lab(text, bold_first)}, shape={shape}, style="rounded,filled", '
            f'color="{dark}", fillcolor="{f}", fontcolor="{fc}", penwidth={pw}, fontsize={size} {extra}];\n')

def elab(text):
    return f'<<FONT FACE="{SANS} Italic" POINT-SIZE="10" COLOR="{MUTED}"><I>{'<BR/>'.join(esc(t) for t in text.split(chr(10)))}</I></FONT>>'

def graph_header(kind, name, title, subtitle, extra=""):
    return (f'{kind} "{name}" {{\n'
            f'  graph [fontname="{SANS}", bgcolor="white", label={title_label(title, subtitle)}, '
            f'labelloc=t, labeljust=c, pad=0.5, {extra}];\n'
            f'  node [fontname="{SANS}", margin="0.14,0.07", color="{INK}"];\n'
            f'  edge [fontname="{SANS}", color="{LINK}", arrowsize=0.75, penwidth=1.1];\n')

def run(engine, dotfile, out, fmt):
    subprocess.run([engine, "-T" + fmt, dotfile, "-o", out], check=True)
