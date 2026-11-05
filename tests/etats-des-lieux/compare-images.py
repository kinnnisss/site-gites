"""Compare every current-run browser capture and rasterized print page exactly."""
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageChops

artifacts = Path(sys.argv[1])
results = []


def compare(source, target):
    with Image.open(source) as left, Image.open(target) as right:
        left, right = left.convert("RGB"), right.convert("RGB")
        same_size = left.size == right.size
        diff = ImageChops.difference(left, right) if same_size else None
        identical = same_size and diff.getbbox() is None
        results.append({"source": str(source.name), "identical": identical,
                        "source_size": left.size, "target_size": right.size})
        if not identical and diff:
            diff.save(artifacts / ("difference-" + source.name))


for width in [320, 375, 500, 501, 780, 781, 1080, 1440]:
    for state in ["initial-entree", "initial-sortie", "filled-entree", "filled-sortie"]:
        name = f"{width}-{state}.png"
        compare(artifacts / ("html-" + name), artifacts / ("react-" + name))
for phase in ["entree", "sortie"]:
    compare(artifacts / f"html-print-{phase}.png", artifacts / f"react-print-{phase}.png")
    for kind in ["html", "react"]:
        subprocess.run(["pdftoppm", "-png", "-r", "96",
                        str(artifacts / f"{kind}-print-{phase}.pdf"),
                        str(artifacts / f"{kind}-pdf-{phase}")], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    originals = sorted(artifacts.glob(f"html-pdf-{phase}-*.png"))
    targets = sorted(artifacts.glob(f"react-pdf-{phase}-*.png"))
    assert originals and len(originals) == len(targets), "Print page count differs"
    for source, target in zip(originals, targets):
        compare(source, target)
(artifacts / "visual-results.json").write_text(json.dumps(results, indent=2))
failed = [r for r in results if not r["identical"]]
print(f"Visual comparison: {len(results) - len(failed)}/{len(results)} exact pixel matches")
if failed:
    print(json.dumps(failed, indent=2))
    sys.exit(1)
