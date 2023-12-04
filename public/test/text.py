import cv2
import numpy as np
from PIL import Image
import pytesseract

def unsharp_mask(image, sigma=1.0, strength=1.5):
    blurred = cv2.GaussianBlur(image, (0, 0), sigma)
    sharpened = cv2.addWeighted(image, 1.0 + strength, blurred, -strength, 0)
    return sharpened

def find_and_extract_characters(image_path, output_folder):
    # Read the image
    image = cv2.imread(image_path)
    
    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply unsharp masking for enhanced sharpness
    sharpened = unsharp_mask(gray)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(sharpened, (5, 5), 0)
    
    # Apply Canny edge detection
    edges = cv2.Canny(blurred, 50, 150)
    
    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Find the largest contour
    max_contour = max(contours, key=cv2.contourArea)
    
    # Get the coordinates of the bounding rectangle around the text
    x, y, w, h = cv2.boundingRect(max_contour)
    
    # Draw a red rectangle around the text region on the original color image
    cv2.rectangle(image, (x, y), (x+w, y+h), (0, 0, 255), 2)
    
    # Extract the text region from the grayscale image
    character = gray[y:y+h, x:x+w]
    
    # Save the extracted text region
    character_path = f"{output_folder}/character_{x}_{y}.png"
    cv2.imwrite(character_path, character)
    
    # Extract text from the grayscale character region
    text = pytesseract.image_to_string(Image.open(character_path))
    
    # Save the result image (with the red rectangle)
    cv2.imwrite(f"{output_folder}/result_image.png", image)
    
    # Print the extracted text
    print(f"Extracted text: {text}")

# Specify the image file path and the folder to save results
image_path = "../assets/pimage/photo_2023_11_28_02:18:11.jpg"
output_folder = "./result"

# Call the function
find_and_extract_characters(image_path, output_folder)
