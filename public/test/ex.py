from PIL import Image
import pytesseract

text = pytesseract.image_to_string(Image.open("../assets/pimage/green2.png"))

print(text)