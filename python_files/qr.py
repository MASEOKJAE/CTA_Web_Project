# qr.py
import sys
import os
import qrcode

def generate_qr_code(data, output_path):
    try:
        # QR 코드 생성
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)

        # QR 코드 이미지 생성
        qr_code = qr.make_image(fill_color="black", back_color="white")

        # 이미지 파일 이름
        image_file_name = f"{data}.png"

        # 이미지 저장
        image_path = os.path.join(output_path, image_file_name)
        qr_code.save(image_path)

        print(f"QR Code generated and saved at {image_path}")

    except Exception as e:
        # Log any exceptions or errors that occur during script execution
        print(f"Error in qr.py: {e}")

if __name__ == "__main__":
    try:
        # Get the code from command line arguments
        code = sys.argv[1] if len(sys.argv) > 1 else "default_code"

        # 생성할 QR 코드에 넣을 문자열 데이터
        data_to_encode = code

        # QR 코드를 저장할 경로
        output_path = "/home/ubuntu/WorkSpace/CTA_Web_Project/public/assets/QRcodes"

        # QR 코드 생성 및 저장
        generate_qr_code(data_to_encode, output_path)

    except Exception as e:
        # Log any exceptions or errors that occur during script execution
        print(f"Error in qr.py: {e}")
