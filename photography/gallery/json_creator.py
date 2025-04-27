import os
import json
from PIL import Image

# Paths
direc = "C:/Users/alfie/Photography-Portfolio/photography/gallery/"
IMAGE_ROOT = direc + "images"
DATA_ROOT = direc + "data"

def format_title(filename):
    base = os.path.splitext(filename)[0]
    return base.replace("-", " ").replace("_", " ").title()

def get_orientation(image_path):
    with Image.open(image_path) as img:
        w, h = img.size
    return "landscape" if w >= h else "portrait"

def generate_json():
    os.makedirs(DATA_ROOT, exist_ok=True)

    for category in os.listdir(IMAGE_ROOT):
        full_dir = os.path.join(IMAGE_ROOT, category, "thumb")
        if not os.path.isdir(full_dir):
            continue
        if category != "studioportrait":
            continue

        # 1) Collect & reverse filenames
        all_files = [f for f in sorted(os.listdir(full_dir))
                     if f.lower().endswith((".jpg", ".jpeg", ".png"))]
        all_files.reverse()

        # 2) Pairing logic by orientation
        pending = {"landscape": None, "portrait": None}
        output_entries = []

        for fname in all_files:
            img_path = os.path.join(full_dir, fname)
            orient = get_orientation(img_path)

            entry = {
                "filename": fname,
                "title": "",
                # "desc": "A description for " + format_title(fname),
                # "position": "center center"
            }

            if pending[orient] is None:
                # hold this image until we find a matching orientation
                pending[orient] = entry
            else:
                # we have a pending partner: emit both together
                output_entries.append(pending[orient])
                output_entries.append(entry)
                pending[orient] = None

        # 3) Append any leftover pending entry (if odd count)
        for orient in ("landscape", "portrait"):
            if pending[orient] is not None:
                output_entries.append(pending[orient])

        # 4) Write out JSON
        out_path = os.path.join(DATA_ROOT, f"{category}.json")
        with open(out_path, "w") as f:
            json.dump(output_entries, f, indent=2)
        print(f"[✓] {category}: {len(output_entries)} images → {out_path}")

if __name__ == "__main__":
    generate_json()
