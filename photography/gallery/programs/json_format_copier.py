import os
import json

# Define paths
CATEGORY = "event"
DIREC = "C:/Users/alfie/Photography-Portfolio/photography/gallery/data/" + CATEGORY
old_json_path = DIREC + '.json'
new_json_dir = DIREC + ' - New.json'
output_dir = DIREC + '.json'


def update_metadata_from_old_to_new(old_json_path, new_json_path, output_path, match_key="filename"):
    # Load old JSON
    with open(old_json_path, "r", encoding="utf-8") as f:
        old_data = json.load(f)

    # Load new JSON
    with open(new_json_path, "r", encoding="utf-8") as f:
        new_data = json.load(f)
        
        
    source_lookup = {entry.get(match_key).lower(): entry for entry in new_data if match_key in entry}

    total_fields_copied = 0
    updated_entry_count = 0

    for old_entry in old_data:
        key_value = old_entry.get(match_key).lower()
        if key_value in source_lookup:
            source_entry = source_lookup[key_value]
            fields_copied_this_entry = 0
            for field, value in source_entry.items():
                if field != match_key:
                    old_entry[field] = value
                    fields_copied_this_entry += 1
            
            if fields_copied_this_entry > 0:
                updated_entry_count += 1
                total_fields_copied += fields_copied_this_entry


    # Save the updated destination data back to the same file
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(old_data, f, indent=2, ensure_ascii=False)
    print(f"Updated {total_fields_copied} fields across {updated_entry_count} entries.")
    print(f"Saved updated JSON to: {output_path}")


update_metadata_from_old_to_new(old_json_path, new_json_dir, output_dir)
