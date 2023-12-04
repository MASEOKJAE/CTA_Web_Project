from PIL import Image
import pytesseract

text = pytesseract.image_to_string(Image.open("./result/character_914_683.png"))

print(text)