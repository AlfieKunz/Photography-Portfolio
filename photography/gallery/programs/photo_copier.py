# Deletes all photos in folder 2, unless we can find an adjacent name in folder 1.
from send2trash import send2trash
from pathlib import Path

# --- CONFIGURATION ---
direc = Path("C:/Users/alfie/Photography/Projects/UWCS/")
input_folder = direc / "Edited - JPEG Watermark"
output_folder = direc / "Edited - JPEG Full - Copy"
DeleteBadPhotos = True # Otherwise, just prints the photos to delete.
# ---------------------


InputNames = {file.stem for file in input_folder.iterdir() if file.is_file()}
NoBadPhotos = 0

for OutputFile in output_folder.iterdir():
    if OutputFile.is_file():
        # If the output file's stem doesn't match any input file's stem
        if OutputFile.stem not in InputNames:
            print(f"Found: {OutputFile.name}")
            NoBadPhotos += 1
            if DeleteBadPhotos: send2trash(str(OutputFile.resolve()))

print(f"Found {NoBadPhotos} Bad Photos.")