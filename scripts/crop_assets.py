from PIL import Image
import os

base_dir = r"c:\Users\Swaleha\Desktop\Khushi\public\images\products"

# 1. 100g Night Creams Poster crops: (width, height)
img_night_creams = Image.open(os.path.join(base_dir, "night_creams_100g_poster.jpg"))
w, h = img_night_creams.size
print(f"Night creams poster size: {w}x{h}")

# Crop Bridal Night Cream (top section jar)
bridal_crop = img_night_creams.crop((int(w * 0.05), int(h * 0.22), int(w * 0.45), int(h * 0.45)))
bridal_crop.save(os.path.join(base_dir, "bridal_night_cream_100g.jpg"), quality=95)

# Crop Extra Whitening Cream (middle section jar)
extra_crop = img_night_creams.crop((int(w * 0.05), int(h * 0.47), int(w * 0.45), int(h * 0.70)))
extra_crop.save(os.path.join(base_dir, "extra_whitening_cream_100g.jpg"), quality=95)

# Crop King Night Cream 100g (bottom section jar)
king_100g_crop = img_night_creams.crop((int(w * 0.05), int(h * 0.69), int(w * 0.45), int(h * 0.91)))
king_100g_crop.save(os.path.join(base_dir, "king_night_cream_100g.jpg"), quality=95)

# 2. King Night Cream (20g poster)
img_king = Image.open(os.path.join(base_dir, "king_night_cream_poster.jpg"))
kw, kh = img_king.size
print(f"King poster size: {kw}x{kh}")
king_crop = img_king.crop((int(kw * 0.40), int(kh * 0.26), int(kw * 0.95), int(kh * 0.54)))
king_crop.save(os.path.join(base_dir, "king_night_cream_20g.jpg"), quality=95)

# 3. Extra Whitening Combo Poster
img_combo = Image.open(os.path.join(base_dir, "extra_whitening_combo_poster.jpg"))
cw, ch = img_combo.size
print(f"Combo poster size: {cw}x{ch}")
combo_products_crop = img_combo.crop((int(cw * 0.35), int(ch * 0.36), int(cw * 0.97), int(ch * 0.78)))
combo_products_crop.save(os.path.join(base_dir, "extra_whitening_combo.jpg"), quality=95)

# 4. Coffee Instant Whitening Set
img_coffee = Image.open(os.path.join(base_dir, "coffee_whitening_set_poster.jpg"))
fw, fh = img_coffee.size
print(f"Coffee poster size: {fw}x{fh}")
coffee_products_crop = img_coffee.crop((int(fw * 0.04), int(fh * 0.46), int(fw * 0.96), int(fh * 0.82)))
coffee_products_crop.save(os.path.join(base_dir, "coffee_whitening_set.jpg"), quality=95)

print("Product crops generated successfully!")
