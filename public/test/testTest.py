import cv2
from pyzbar.pyzbar import decode

img = cv2.imread("photo_2023_12_05_00:35:02.jpg")
img = cv2.resize(img, (0, 0), fx=0.3, fy=0.3)
decoded = decode(img)
print(decoded)