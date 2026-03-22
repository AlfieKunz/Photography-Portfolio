import json
from pathlib import Path

CATEGORY = "event"
DIREC = Path("C:/Users/alfie/Photography-Portfolio/photography/gallery/data/")
old_json_path = DIREC / f"{CATEGORY} - Old.json"
new_json_path = DIREC / f"{CATEGORY}.json"
photo_folder = Path("C:/Users/alfie/Photography/Portfolio/Event")

with open(old_json_path, "r", encoding="utf-8") as f:
    old_data = json.load(f)
old_filenames = {entry.get("filename").lower(): entry for entry in old_data if "filename" in entry}

new_data = []
if new_json_path.exists():
    with open(new_json_path, "r", encoding="utf-8") as f:
        new_data = json.load(f)
new_filenames = {entry.get("filename").lower() for entry in new_data if "filename" in entry}

filtered_old_data = []
fields_added = 0
photos = {img.name.lower() for img in photo_folder.iterdir() if img.is_file()}
for entry in old_data:
    filename = entry.get("filename", "").lower()
    # Check if this entry's file exists in the folder AND isn't already in the new JSON
    if filename in photos and filename not in new_filenames:
        filtered_old_data.append(entry)
        fields_added += 1

# Combine items, and save to the new json.
with open(new_json_path, "w", encoding="utf-8") as f:
    json.dump(filtered_old_data + new_data, f, indent=4)

print(f"Added {fields_added} new entries.")