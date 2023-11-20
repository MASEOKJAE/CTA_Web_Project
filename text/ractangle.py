import cv2
import numpy as np

def find_and_extract_rectangles(image_path, output_folder):
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
    
    # 각 윤곽선에 대해 사각형 그리기 및 추출
    for contour in contours:
        epsilon = 0.04 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        
        # 사각형인 경우
        if len(approx) == 4:
            # 사각형의 좌표 구하기
            x, y, w, h = cv2.boundingRect(approx)
            
            # 이미지에서 사각형 추출
            rectangle = image[y:y+h, x:x+w]
            
            # 추출된 사각형 이미지 저장
            cv2.imwrite(f"{output_folder}/rectangle_{x}_{y}.png", rectangle)
            
            # 사각형을 빨간색으로 표시
            cv2.drawContours(image, [approx], 0, (0, 0, 255), 2)

    # 결과 이미지 저장
    cv2.imwrite(f"{output_folder}/result_image.png", image)

# 이미지 파일 경로와 결과를 저장할 폴더 지정
image_path = "./green2.png"
output_folder = "./result"

# 함수 호출
find_and_extract_rectangles(image_path, output_folder)
