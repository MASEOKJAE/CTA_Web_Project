import cv2
from pyzbar.pyzbar import decode
import sys


def read_qr_code(image_path):
    # 이미지 불러오기
    image = cv2.imread(image_path)

    # QR 코드 디코드
    decoded_objects = decode(image)

    # 추출된 정보를 저장할 변수
    qr_code_data = []

    for obj in decoded_objects:
        # QR 코드의 데이터를 디코드하여 변수에 저장
        data = obj.data.decode('utf-8')
        qr_code_data.append(data)

        # 추출된 QR 코드의 윤곽선 그리기
        points = obj.polygon
        if len(points) > 4:
            hull = cv2.convexHull(points, clockwise=True)
            points = hull
        num_of_points = len(points)

        # 윤곽선 그리기
        for j in range(num_of_points):
            cv2.line(image, tuple(points[j]), tuple(points[(j+1) % num_of_points]), (0, 255, 0), 2)

    # 이미지에 윤곽선이 그려진 결과 저장
    # cv2.imwrite("output_image.png", image)

    return qr_code_data

# 이미지 파일 경로
if len(sys.argv) > 1:
    image_path = sys.argv[1]
    # QR 코드 읽기 및 정보 추출
    qr_code_data = read_qr_code(image_path)

# 첫 번째 QR 코드 데이터 출력
if qr_code_data:
    print(qr_code_data[0])
else:
    print("No QR Code image provided")