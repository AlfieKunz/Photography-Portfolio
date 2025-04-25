import os
import json

# Paths
direc = "C:/Users/alfie/Photography-Portfolio/photography/gallery/"
IMAGE_ROOT = direc + "images"
DATA_ROOT = direc + "data"

def format_title(filename):
    base = os.path.splitext(filename)[0]
    base = base.replace("-", " ").replace("_", " ").title()
    return base

def generate_json():
    os.makedirs(DATA_ROOT, exist_ok=True)

    for category in os.listdir(IMAGE_ROOT):
        cat_path = os.path.join(IMAGE_ROOT, category)
        full_path = os.path.join(cat_path, "full")
        if not os.path.isdir(full_path):
            continue

        image_entries = []
        for fname in sorted(os.listdir(full_path), reverse=True):
            if not fname.lower().endswith((".jpg", ".jpeg", ".png")):
                continue

            entry = {
                "filename": fname,
                "title": format_title(fname),
                # "desc": "A description for " + format_title(fname),
                # "position": "center center"
            }
            image_entries.append(entry)

        out_path = os.path.join(DATA_ROOT, f"{category}.json")
        with open(out_path, "w") as f:
            json.dump(image_entries, f, indent=2)

        print(f"[✓] Generated JSON for '{category}' with {len(image_entries)} images → {out_path}")

if __name__ == "__main__":
    generate_json()
