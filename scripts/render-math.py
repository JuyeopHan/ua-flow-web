"""Render the editable LaTeX sources to standalone SVGs and diagram labels.

Optional asset-generation command; serving and building use the checked-in SVGs.
Requires the local latex and dvisvgm commands, not a browser math library.
"""

from copy import deepcopy
import html
import json
from pathlib import Path
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SVG = "http://www.w3.org/2000/svg"
XLINK = "http://www.w3.org/1999/xlink"
ET.register_namespace("", SVG)
ET.register_namespace("xlink", XLINK)
items = json.loads((ROOT / "data/equations.json").read_text())
output = ROOT / "assets/math"
output.mkdir(exist_ok=True)
document = r"\documentclass[10pt]{article}\usepackage{amsmath,amssymb}\pagestyle{empty}\begin{document}" + "\n"
document += "\n\\newpage\n".join(r"\noindent $\displaystyle " + item["tex"] + "$" for item in items)
document += "\n" + r"\end{document}" + "\n"
rendered = {}

with tempfile.TemporaryDirectory(prefix="ua-flow-math-") as directory:
    work = Path(directory)
    (work / "equations.tex").write_text(document)
    for command in [
        ["latex", "-interaction=nonstopmode", "-halt-on-error", "equations.tex"],
        ["dvisvgm", "--page=1-", "--no-fonts", "--exact-bbox", "--bbox=min", "--output=equation-%p.svg", "equations.dvi"],
    ]:
        result = subprocess.run(command, cwd=work, capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(result.stdout + result.stderr)
    svg_files = sorted(work.glob("equation-*.svg"), key=lambda path: int(path.stem.split("-")[-1]))
    if len(svg_files) != len(items):
        raise RuntimeError(f"Expected {len(items)} math pages, found {len(svg_files)}")
    for item, svg_path in zip(items, svg_files):
        raw = svg_path.read_text()
        # A diagram can contain several rendered expressions; IDs must be unique.
        ids = re.findall(r"\bid=['\"]([^'\"]+)", raw)
        for identifier in sorted(ids, key=len, reverse=True):
            raw = raw.replace(f"'{identifier}'", f"'{item['id']}-{identifier}'")
            raw = raw.replace(f"'#{identifier}'", f"'#{item['id']}-{identifier}'")
        element = ET.fromstring(raw)
        element.set("fill", "#345a85")
        element.set("role", "img")
        title = ET.Element(f"{{{SVG}}}title")
        title.text = item["alt"]
        element.insert(0, title)
        rendered[item["id"]] = element
        ET.ElementTree(element).write(output / f"{item['id']}.svg", encoding="unicode", xml_declaration=False)

# Diagram placeholders retain position, size, color, and source expression IDs.
for filename in ["flow-dynamics.svg", "velocity-network.svg", "uncertainty-guidance.svg", "adaptive-guidance.svg"]:
    path = ROOT / "assets" / filename
    tree = ET.parse(path)
    for placeholder in list(tree.getroot().iter()):
        expression_id = placeholder.get("data-math")
        if expression_id is None:
            continue
        expression = rendered[expression_id]
        _, _, width, height = map(float, expression.get("viewBox").split())
        if placeholder.get("data-font-size"):
            placeholder.set("height", f"{height * float(placeholder.get('data-font-size')) / 10:.5f}")
        placeholder.set("viewBox", expression.get("viewBox"))
        placeholder.set("width", f"{float(placeholder.get('height')) * width / height:.5f}")
        placeholder.set("x", f"{float(placeholder.get('data-center')) - float(placeholder.get('width')) / 2:.5f}")
        placeholder[:] = [deepcopy(child) for child in expression]
    tree.write(path, encoding="unicode", xml_declaration=False)
    path.write_text("\n".join(line.rstrip() for line in path.read_text().splitlines()) + "\n")

# Keep the static HTML in sync, so viewing the page needs no math runtime.
by_id = {item["id"]: item for item in items}
baseline = float(next(rendered["ug-strength"].iter(f"{{{SVG}}}use")).get("y"))


def image_tag(expression_id, display=False):
    item = by_id[expression_id]
    _, top, width, height = map(float, rendered[expression_id].get("viewBox").split())
    dimensions = f' width="{round(width * 1.7)}" height="{round(height * 1.7)}"' if display else f' style="width:{width / 10:.5f}em;height:{height / 10:.5f}em;vertical-align:{-(top + height - baseline) / 10:.5f}em"'
    css_class = "equation-image" if display else "math-inline"
    return f'<img class="{css_class}" src="assets/math/{expression_id}.svg" alt="{html.escape(item["alt"], quote=True)}"{dimensions}>'


page_path = ROOT / "index.html"
page = page_path.read_text()
page = re.sub(r'(<span[^>]*data-formula="([^"]+)"[^>]*>).*?(</span>)', lambda match: match[1] + image_tag(match[2]) + match[3], page, flags=re.S)
page = re.sub(r'(<div[^>]*data-display-formula="([^"]+)"[^>]*>).*?(</div>)', lambda match: match[1] + image_tag(match[2], True) + match[3], page, flags=re.S)
page_path.write_text(page)

print(f"Rendered {len(items)} LaTeX expressions and updated the method diagram labels.")
