from PIL import Image

# Slices from R8 to R14 and R15 (or R14 down to R8)
slices = ["map_7_R8.jpg", "map_6_R9.jpg", "map_5_R10.jpg", "map_4_R11.jpg", "map_3_R12.jpg", "map_2_R13.jpg", "map_1_R14.jpg", "map_0_R15.png"]

# Let's inspect order
imgs = [Image.open(s) for s in slices]
total_h = sum(im.height for im in imgs)
w = imgs[0].width

stitched = Image.new("RGB", (w, total_h))
curr_y = 0
for im in imgs:
    stitched.paste(im, (0, curr_y))
    curr_y += im.height

print(f"Stitched size: {stitched.size}")
# The PDF said Rotation: 90. So rotating by 270 degrees or 90 degrees will make it upright.
# Let's save both and check.
rot90 = stitched.rotate(90, expand=True)
rot270 = stitched.rotate(270, expand=True)

# Also let's save a web-friendly resized version for reference or UI
rot90_web = rot90.resize((int(rot90.width * 0.25), int(rot90.height * 0.25)))
rot270_web = rot270.resize((int(rot270.width * 0.25), int(rot270.height * 0.25)))

rot90_web.save("tiruppur_map_rot90.jpg", quality=85)
rot270_web.save("tiruppur_map_rot270.jpg", quality=85)
print("Saved tiruppur_map_rot90.jpg and rot270.jpg")
