import cv2
import numpy as np
import sys

def detect_red_color(image_path):
    # 이미지 파일 읽기
    image = cv2.imread(image_path)

    # 이미지 불러오기 확인
    if image is None:
        return '0'

    height, width, _ = image.shape
    center_x, center_y = width // 2, height // 2

    rect_size = 300  
    x1 = center_x - rect_size // 2
    y1 = center_y - rect_size // 2
    x2 = center_x + rect_size // 2
    y2 = center_y + rect_size // 2

    roi = image[y1:y2, x1:x2]

    average_color = np.mean(np.mean(roi, axis=0), axis=0)
    average_color = average_color.astype(int)

    blue, green, red = average_color
    if red > 100 and blue < 50 and green < 50:
        return '1'

    return '0'

if len(sys.argv) > 1:
    image_path = sys.argv[1]
    result = detect_red_color(image_path)
    print(result)
else:
    print("No image path provided!")