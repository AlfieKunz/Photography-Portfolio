import os
import json
from datetime import datetime
from PIL import Image, ImageOps
from PIL.ExifTags import TAGS

# --- CONFIGURATION ---
CATEGORY = "portrait"
DIREC = "C:/Users/alfie/Photography-Portfolio/photography/gallery"
IMAGE_FOLDER = DIREC + "/images/" + CATEGORY + "/full/"
JSON_OUTPUT_PATH = DIREC + "/data/" + CATEGORY + ".json"
DEFAULT_TITLE = ""
DEFAULT_TYPE = ""
DEFAULT_DATE = "20/07/25"
# ---------------------


# Loads default tags based on the category:
match CATEGORY:
    case "astro":
        DEFAULT_TYPE = ["Signature", "Moon", "Stars"]
    case "corporate":
        DEFAULT_TYPE = ["Signature", "Headshots", "Action & Staged", "Venue"]
    case "event":
        DEFAULT_TYPE = ["Signature", "Groups", "Candids", "Personal & Couples", "Venue", "Awards"]
    case "landscape":
        DEFAULT_TYPE = ["Signature", "City", "Water & Ocean", "Mountains & Hills", "Fields"]
    case "nature":
        DEFAULT_TYPE = ["Signature", "Animals", "Insects", "Plants & Greenery"]
    case "portrait":
        DEFAULT_TYPE = ["Signature", "Nature", "Studio", "Landscape", "Animals"]
    case "studio":
        DEFAULT_TYPE = ["Signature", "Light & Reflection", "Portrait", "Objects & Products", "Macro"]
    case "travel":
        DEFAULT_TYPE = ["Signature", "Street & Buildings", "Greenery", "Water"]
    case _: # Base case.
        DEFAULT_TYPE = ["Signature"]

def get_exif_data(image):
    """Extract EXIF data dictionary from a PIL image."""
    exif_data = {}
    try:
        raw = image._getexif()
        if raw:
            for tag, value in raw.items():
                tag_name = TAGS.get(tag, tag)
                exif_data[tag_name] = value
    except AttributeError:
        pass
    return exif_data

def extract_capture_datetime(exif_data):
    """Try to extract the original date+time and return (formatted_date_str, datetime_obj)."""
    date_str = exif_data.get("DateTimeOriginal") or exif_data.get("DateTime")
    if date_str:
        try:
            dt = datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
            formatted = dt.strftime("%d/%m/%y")
            return formatted, dt
        except Exception:
            pass
    # Fallback
    fallback_dt = datetime.strptime(DEFAULT_DATE, "%d/%m/%y")
    return DEFAULT_DATE, fallback_dt


def get_image_metadata(image_path):
    try:
        with Image.open(image_path) as img:
            exif = get_exif_data(img)
            orientation = exif.get("Orientation", 1)

            width, height = img.size

            # Adjust width/height based on EXIF orientation
            if orientation in [6, 8]:  # 6 = rotate 270° CCW, 8 = rotate 90° CCW
                width, height = height, width

            aspect_ratio = round(width / height, 3) if height != 0 else 0
            date_str, full_dt = extract_capture_datetime(exif)

    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        aspect_ratio = 1
        date_str = DEFAULT_DATE
        full_dt = datetime.strptime(DEFAULT_DATE, "%d/%m/%y")

    return {
        "filename": os.path.basename(image_path),
        "title": DEFAULT_TITLE,
        "datetime": full_dt.isoformat(),
        "type": DEFAULT_TYPE,
        "aspect_ratio": aspect_ratio
    }


def load_existing_json(path):
    if os.path.exists(path):
        with open(path, 'r') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def save_json(data, path):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def sort_by_date_desc(data):
    def parse_dt(entry):
        try:
            return datetime.fromisoformat(entry['datetime'])
        except Exception:
            return datetime.min
    return sorted(data, key=parse_dt, reverse=True)


def main():
    existing_data = load_existing_json(JSON_OUTPUT_PATH)
    filenames_in_existing = {entry['filename'].lower() for entry in existing_data}

    new_data = []
    for fname in os.listdir(IMAGE_FOLDER):
        if fname.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".tiff")):
            if fname.lower() not in filenames_in_existing:
                image_path = os.path.join(IMAGE_FOLDER, fname)
                metadata = get_image_metadata(image_path)
                new_data.append(metadata)

    all_data = existing_data + new_data
    all_data = sort_by_date_desc(all_data)

    save_json(all_data, JSON_OUTPUT_PATH)
    print(f"Processed {len(new_data)} new images. Total entries: {len(all_data)}.")

if __name__ == "__main__":
    main()