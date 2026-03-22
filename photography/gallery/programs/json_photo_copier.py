import json
from pathlib import Path

CATEGORY = "event"
DIREC = Path("C:/Users/alfie/Photography-Portfolio/photography/gallery/data/")
old_json_path = DIREC / f"{CATEGORY}.json"
new_json_path = DIREC / f"{CATEGORY} - New.json"
photo_folder = Path("C:/Users/alfie/Photograph/Projects")

with open(old_json_path, "r", encoding="utf-8") as f:
    old_data = json.load(f)
old_filenames = {entry.get("filename").lower(): entry for entry in old_data if "filename" in entry}
with open(new_json_path, "r", encoding="utf-8") as f:
    new_data = json.load(f)
new_filenames = {entry.get("filename").lower() for entry in new_data if "filename" in entry}

filtered_old_data = []
fields_added = 0
for img in photo_folder.iterdir():
    if img.is_file():
        img_name = img.name.lower()
        # Only add if it exists in the old JSON and isn't already in the new one
        if img_name in old_filenames and img_name not in new_filenames:
            filtered_old_data.append(old_filenames[img_name])
            fields_added += 1

# Combine items, and save to the new json.
with open(new_json_path, "w", encoding="utf-8") as f:
    json.dump(filtered_old_data + new_data, f, indent=4)

print(f"Added {fields_added} new entries.")