import os
from PIL import Image
from math import gcd

def get_aspect_ratio(width, height):
    divisor = gcd(width, height)
    return f"{width // divisor}:{height // divisor}"

def check_image_sizes(directory):
    print(f"{'Filename':<30} | {'Width':<6} | {'Height':<6} | {'Aspect Ratio':<12} | {'Simpl. Ratio'}")
    print("-" * 75)
    
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            filepath = os.path.join(directory, filename)
            try:
                with Image.open(filepath) as img:
                    width, height = img.size
                    ratio = width / height
                    simpl_ratio = get_aspect_ratio(width, height)
                    print(f"{filename:<30} | {width:<6} | {height:<6} | {ratio:<12.2f} | {simpl_ratio}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    assets_events_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'events')
    if os.path.exists(assets_events_path):
        check_image_sizes(assets_events_path)
    else:
        print(f"Directory not found: {assets_events_path}")
