import os
import json

# Define paths
CATEGORY = "studioportrait"
DIREC = "C:/Users/alfie/Photography-Portfolio/photography/gallery/data/" + CATEGORY
old_json_path = DIREC + '.json'
new_json_dir = DIREC + ' - New.json'
output_dir = DIREC + '.json'



import json

def update_metadata_from_old_to_new(old_json_path, new_json_path, output_path, match_key="filename", fields_to_copy=["title"]):
    # Load old JSON
    with open(old_json_path, "r", encoding="utf-8") as f:
        old_data = json.load(f)

    # Load new JSON
    with open(new_json_path, "r", encoding="utf-8") as f:
        new_data = json.load(f)

    # Create a lookup dict from old data using the matching key
    old_lookup = {entry[match_key]: entry for entry in old_data if match_key in entry}

    updated_count = 0

    # Update new data with metadata from old data
    for item in new_data:
        key_value = item.get(match_key)
        if key_value and key_value in old_lookup:
            old_item = old_lookup[key_value]
            for field in fields_to_copy:
                if field in old_item:
                    item[field] = old_item[field]
                    updated_count += 1

    # Save updated new JSON
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(new_data, f, indent=2, ensure_ascii=False)

    print(f"Updated {updated_count} fields across {len(new_data)} entries.")
    print(f"Saved updated JSON to: {output_path}")


update_metadata_from_old_to_new(old_json_path, new_json_dir, output_dir)
