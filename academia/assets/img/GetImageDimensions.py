from pathlib import Path
from PIL import Image

Direc = Path(__file__).parent / "Slideshow"
AllowedExt = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}

for imag in Direc.iterdir():
    if imag.is_file() and imag.suffix.lower() in AllowedExt:
        with Image.open(imag) as pil_img:
            width, height = pil_img.size
        filename = imag.name
        slide_name = imag.stem
        print(f'<img data-src="assets/img/Slideshow/{filename}" alt="Slide {slide_name}" width="{width}" height="{height}"/>')