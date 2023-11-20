import cv2
import numpy as np
from PIL import Image
import pytesseract
import re

def find_and_extract_characters(image_path, output_folder):
    # 이미지 읽기
    image = cv2.imread(image_path)
    
    # 이미지를 그레이스케일로 변환
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 가우시안 블러 적용 (노이즈 감소)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 캐니 에지 검출
    edges = cv2.Canny(blurred, 50, 150)
    
    # 윤곽선 찾기
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # 전체 텍스트를 저장할 변수 초기화
    total_text = ""
    
    # 각 윤곽선에 대해 글자 그리기 및 추출
    for contour in contours:
        # 글자의 좌표 구하기
        x, y, w, h = cv2.boundingRect(contour)
        
        # 이미지에서 글자 추출
        character = gray[y:y+h, x:x+w]
        
        # 추출된 글자 이미지 저장
        character_path = f"{output_folder}/character_{x}_{y}.png"
        cv2.imwrite(character_path, character)
        
        # 사각형을 빨간색으로 표시
        cv2.rectangle(image, (x, y), (x+w, y+h), (0, 0, 255), 2)
        
        # 글자에서 텍스트 추출
        text = pytesseract.image_to_string('./result/character_111_357.png')
        
        # 추출된 텍스트에서 문자와 숫자만 추출
        text = re.findall('\w+', text)
        text = ' '.join(text)
        
        # 추출된 텍스트를 전체 텍스트에 추가
        total_text += text

    # 결과 이미지 저장
    cv2.imwrite(f"{output_folder}/result_image.png", image)
    
    # 전체 텍스트 출력
    print(f"Extracted text: {total_text}")

# 이미지 파일 경로와 결과를 저장할 폴더 지정
image_path = "./ex5.jpg"
output_folder = "./result"

# 함수 호출
find_and_extract_characters(image_path, output_folder)
