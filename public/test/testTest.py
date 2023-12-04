import cv2
import numpy as np
from PIL import Image
import pytesseract
import sys


def find_and_extract_characters(image_path, output_folder):
    # 이미지 읽기
    image = cv2.imread(image_path)
    
    # 이미지를 그레이스케일로 변환
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    cv2.imwrite("./converts/gray.jpg", gray)

    # 이미지 이진화
    ret, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    
    # 가우시안 블러 적용 (노이즈 감소)
    blurred = cv2.GaussianBlur(gray, (11, 11), 0)

    cv2.imwrite("./converts/blurred.jpg", blurred)

    
    # 캐니 에지 검출
    edges = cv2.Canny(blurred, 50, 100)

    cv2.imwrite("./converts/originalEdge.jpg", edges)

    # Dilate the edges
    # kernel = np.ones((3,3), np.uint8)
    # edges = cv2.dilate(edges, kernel, iterations=2)

    # cv2.imwrite("./converts/edges.jpg", edges)
    
    # 윤곽선 찾기
    # cv2.findContours() 함수는 이미지에서 윤곽선을 찾아내고, 이를 리스트 형태로 반환, 이 때 각 윤곽선은 이미지 상에서 같은 객체를 이루는 점들의 집합으로, 이 점들은 객체의 경계를 표현
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # 빈 이미지 생성
    contour_img = np.zeros_like(edges)

    # 윤곽선 그리기
    cv2.drawContours(contour_img, contours, -1, (255, 255, 255), 1)

    cv2.imwrite("./converts/countour_image.jpg", contour_img)
    
    # 전체 텍스트를 저장할 변수 초기화
    total_text = ""
    
    # 각 윤곽선에 대해 글자 그리기 및 추출
    for contour in contours:
        # 글자의 좌표 구하기
        x, y, w, h = cv2.boundingRect(contour)
        
        # 이미지에서 글자 추출
        character = gray[y:y+h, x:x+w]
        
        # 글자에서 텍스트 추출
        text = pytesseract.image_to_string(Image.fromarray(character))
        
        # 추출된 텍스트가 2개 이상의 글자를 포함하는 경우에만 이미지 저장 및 텍스트 추가
        if len(text) >= 2:
            # 추출된 글자 이미지 저장
            character_path = f"{output_folder}/character_{x}_{y}.png"
            cv2.imwrite(character_path, character)
            
            # 사각형을 빨간색으로 표시
            cv2.rectangle(image, (x, y), (x+w, y+h), (0, 0, 255), 2)

            # 추출된 텍스트를 전체 텍스트에 추가
            total_text += text

    # 결과 이미지 저장
    cv2.imwrite(f"{output_folder}/result_image.png", image)
    
    # 전체 텍스트 출력
    print(f"Extracted text: {total_text}")

# 이미지 파일 경로와 결과를 저장할 폴더 지정
# test 경로
# image_path = "../assets/pimage/ex5.jpg"
image_path = "../assets/pimage/photo_2023_11_28_02:18:27.jpg"

# dynamic 경로
# image_path = sys.argv[1]

output_folder = "./converts"

# 함수 호출
find_and_extract_characters(image_path, output_folder)