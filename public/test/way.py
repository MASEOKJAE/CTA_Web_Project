import cv2
import numpy as np
from PIL import Image
import pytesseract

def preprocess_image(image_path):
    # Read the input image
    original_image = cv2.imread(image_path)

    # Convert the image to grayscale
    gray = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)

    # Apply blurring to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Apply high-pass filter (sharpening)
    sharpened = cv2.addWeighted(gray, 1.5, blurred, -0.5, 0)

    # Apply thresholding to create a binary image
    _, thresholded = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Apply erosion to further enhance text features
    kernel = np.ones((3, 3), np.uint8)
    eroded = cv2.erode(thresholded, kernel, iterations=1)

    # Higher blurring and thresholding to obtain text contours
    blurred_high = cv2.GaussianBlur(eroded, (15, 15), 0)
    _, thresholded_high = cv2.threshold(blurred_high, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Find contours in the high-threshold image
    contours, _ = cv2.findContours(thresholded_high, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Find the largest contour
    max_contour = max(contours, key=cv2.contourArea)

    # Get the rotated bounding box of the largest contour
    rect = cv2.minAreaRect(max_contour)
    box = cv2.boxPoints(rect)
    box = np.int0(box)

    # Convert the box points to float32
    box = box.astype(np.float32)

    # Correct the slant of the text
    M = cv2.getPerspectiveTransform(box, np.array([[0, 0], [800, 0], [800, 300], [0, 300]], dtype=np.float32))
    corrected_text = cv2.warpPerspective(original_image, M, (800, 300))


    return original_image, blurred, sharpened, thresholded, eroded, corrected_text

def extract_text(image):
    # Convert the image to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Extract text using Tesseract OCR
    text = pytesseract.image_to_string(Image.fromarray(gray_image))
    
    return text

# Specify the image file path
image_path = "../assets/pimage/photo_2023_11_28_02:18:11.jpg"

# Preprocess the image
original, blurred, sharpened, thresholded, eroded, corrected_text = preprocess_image(image_path)

# Extract text from the corrected text region
extracted_text = extract_text(corrected_text)

# Display the images for visual inspection (you can remove this in production)
cv2.imshow("Original Image", original)
cv2.imshow("Blurred Image", blurred)
cv2.imshow("Sharpened Image", sharpened)
cv2.imshow("Thresholded Image", thresholded)
cv2.imshow("Eroded Image", eroded)
cv2.imshow("Corrected Text", corrected_text)
cv2.waitKey(0)
cv2.destroyAllWindows()

# Print the extracted text
print(f"Extracted Text: {extracted_text}")
