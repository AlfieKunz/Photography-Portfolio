from PIL import Image, ImageCms, ImageOps
import os, io

def load_with_icc(path):
    img = Image.open(path)
    
    try:
        img = ImageOps.exif_transpose(img)
    except Exception as e:
        print(f"Warning: Could not apply EXIF transpose to {os.path.basename(path)}. Error: {e}")

    # If the image has an ICC profile, convert to sRGB using it
    if "icc_profile" in img.info:
        icc_bytes = img.info["icc_profile"]
        src_profile = ImageCms.ImageCmsProfile(io.BytesIO(icc_bytes))
        dst_profile = ImageCms.createProfile("sRGB")

        # Convert image to RGB using the correct colour space transformation
        img = ImageCms.profileToProfile(img, src_profile, dst_profile, outputMode="RGB")
    else:
        # Fallback: convert directly to RGB
        img = img.convert("RGB")

    return img

def create_thumbnail(img, size=(450, 450)):
    thumbnail = img.copy()
    thumbnail.thumbnail(size, Image.LANCZOS)  # Best quality resampling
    return thumbnail

def save_thumbnail(img, output_path):
    img.save(output_path, "JPEG", quality=95, subsampling=0, optimize=True)


direc = "C:/Users/alfie/Photography-Portfolio/photography/gallery/images/studioportrait"
input_folder = direc + "/full"
output_folder = direc + "/thumb"
os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if filename.lower().endswith(".jpg") or filename.lower().endswith(".jpeg") or filename.lower().endswith(".png"):
        print(filename)
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, filename)
        
        img = load_with_icc(input_path)
        thumb = create_thumbnail(img)
        save_thumbnail(thumb, output_path)