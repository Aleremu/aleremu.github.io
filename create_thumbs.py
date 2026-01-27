import os
import sys
from PIL import Image

def create_thumbs(directory):
    # Ensure directory exists
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return

    print(f"Buscando imágenes en: {directory}")

    # Iterate over files in the directory
    for filename in os.listdir(directory):
        # Check for common image extensions, ignoring SVGs
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            file_path = os.path.join(directory, filename)
            
            # Skip if it's already a thumb to avoid re-processing thumbs
            if "_thumb" in filename:
                continue

            try:
                with Image.open(file_path) as img:
                    # Calculate new size (1/3 of original)
                    new_width = int(img.width / 3)
                    new_height = int(img.height / 3)
                    
                    # Resize using LANCZOS for high quality downsampling
                    img_thumb = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Construct new filename: name_thumb.webp
                    name, _ = os.path.splitext(filename)
                    thumb_filename = f"thumb_{name}.webp"
                    thumb_path = os.path.join(directory, thumb_filename)
                    
                    # Save the thumbnail as WEBP
                    img_thumb.save(thumb_path, "WEBP")
                    print(f"Created thumb: {thumb_filename} ({new_width}x{new_height})")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    # Check if path is provided as argument
    if len(sys.argv) > 1:
        target_folder = sys.argv[1]
    else:
        # Ask user for input
        print("Introduce la ruta de la carpeta de imágenes.")
        print("Ejemplo: assets/images/casadellibro")
        user_input = input("Ruta (o Enter para usar la carpeta actual): ")
        
        if user_input.strip():
            target_folder = user_input.strip()
        else:
            target_folder = os.getcwd()
            
    # Handle relative paths
    if not os.path.isabs(target_folder):
        target_folder = os.path.abspath(target_folder)

    create_thumbs(target_folder)
