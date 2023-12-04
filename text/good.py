import cv2
import numpy as np
from PIL import Image
import pytesseract

def find_and_extract_characters(image_path, output_folder):
    # 이미지 읽기
    image = cv2.imread(image_path)
    
    # 이미지를 그레이스케일로 변환
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 가우시안 블러 적용 (노이즈 감소)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 이미지 이진화 (검은색 테두리 추출)
    _, binary = cv2.threshold(blurred, 100, 255, cv2.THRESH_BINARY_INV)
    
    # 윤곽선 찾기
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # 가장 큰 윤곽선 찾기
    largest_contour = max(contours, key=cv2.contourArea)
    
    # 윤곽선에 따라 이미지 잘라내기
    x, y, w, h = cv2.boundingRect(largest_contour)
    cropped = gray[y:y+h, x:x+w]
    
    # 잘라낸 이미지 저장
    cropped_path = f"{output_folder}/cropped.png"
    cv2.imwrite(cropped_path, cropped)

    # 잘라낸 이미지에서 텍스트 추출
    total_text = pytesseract.image_to_string(Image.open(cropped_path))
    
    # 전체 텍스트 출력
    print(f"Extracted text: {total_text}")

# 이미지 파일 경로와 결과를 저장할 폴더 지정
image_path = "../public/assets/pimage/photo_2023_11_21_13:36:05.jpg"
output_folder = "./result"

# 함수 호출
find_and_extract_characters(image_path, output_folder)
