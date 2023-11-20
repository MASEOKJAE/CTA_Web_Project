import cv2
import pytesseract

# 이미지 불러오기
img = cv2.imread("ex5.jpeg")

# ROI 좌표 설정 (예시)
x, y, w, h = 220, 370, 580, 250  # ROI의 좌상단 (x, y) 좌표 및 폭(w)과 높이(h)

# ROI 추출
roi = img[y:y+h, x:x+w]

# ROI를 그레이 스케일로 변환
gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

# 이미지 파일로 저장
cv2.imwrite("roi_image.png", roi)

# 저장한 이미지에서 텍스트 추출
text = pytesseract.image_to_string("roi_image.png")

print(text)
