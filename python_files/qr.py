# qr.py

import sys
import os
import qrcode
import mysql.connector

def generate_qr_code(data, output_path, database_connection):
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

        # Read QR code image as binary data
        with open(image_path, 'rb') as image_file:
            qr_code_binary = image_file.read()

        # Insert a new row in the 'equipment' table
        insert_query = (
            "INSERT INTO equipment (code, name, installationDate, location, qr_code) "
            "VALUES (%s, %s, %s, %s, %s)"
        )
        insert_data = (data, "", "", "", qr_code_binary)  # Adjust the other fields accordingly
        cursor = database_connection.cursor()
        cursor.execute(insert_query, insert_data)
        database_connection.commit()

        print(f"New QR Code and data saved in the database for code: {data}")

    except Exception as e:
        print(f"Error in generate_qr_code: {e}")

    finally:
        # Close the cursor
        if cursor:
            cursor.close()


if __name__ == "__main__":
    try:
        # Get the code from command line arguments
        code = sys.argv[1] if len(sys.argv) > 1 else "default_code"

        # 생성할 QR 코드에 넣을 문자열 데이터
        data_to_encode = code

        # QR 코드를 저장할 경로
        output_path = "/home/ubuntu/WorkSpace/CTA_Web_Project/public/assets/QRcodes"

        # MySQL 데이터베이스 연결 설정
        db_connection = mysql.connector.connect(
            host="127.0.0.1",
            user="sky",
            password="1234",
            database="CTA"
        )

        # QR 코드 생성 및 저장
        generate_qr_code(data_to_encode, output_path, db_connection)

    except Exception as e:
        print(f"Error in qr.py: {e}")

    finally:
        # Close the database connection
        db_connection.close()
