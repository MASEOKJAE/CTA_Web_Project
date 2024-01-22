import cv2
import numpy as np
import sys
import os 

# Image crop 
x = 1300
y = 1000 
crop_width = 1800       # Adjust this value based on your desired width
crop_height = 1000      # Adjust this value based on your desired height

# Color filter: Filter#1-Dark Yellow~Yellow,  Filter#2-Green, Filter#3-Brown
num_colors = 3
color_filter = np.array([[[0, 30, 30], [40, 120, 80]], 
                         [[0, 0, 100], [30, 255, 255]], 
                         [[40, 40, 50],[80, 255, 255]]])            

# Filter for temperature decision (35C ~ 75C / step=5C)
filter1 = np.array([[[24.51, 26.55, 65.03],  [28.18, 34.36, 83.62]], 
                    [[25.07, 33.94,	69.90],  [33.11, 49.36, 84.66]], 
                    [[32.84, 69.89, 119.68], [34.04, 79.91,	134.63]], 
                    [[29.37, 98.04,	160.06], [32.89, 100.34, 164.46]],
                    [[25.08, 31.51,	99.87],  [33.17, 96.66, 163.02]],
                    [[23.31, 29.77, 77.38],  [26.53, 32.21, 131.89]], 
                    [[25.88, 31.07, 61.71],  [28.73, 31.52, 104.16]], 
                    [[33.54, 38.92, 79.34],  [34.08, 40.75, 83.37]], 
                    [[33.32, 39.63, 82.45],  [35.31, 41.85, 84.52]]])

filter2 = np.array([[[0.0, 0.0, 0.0], [0.0, 0.0, 0.0]], 
                    [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0]],
                    [[31.81, 70.24, 126.74], [33.93, 79.72, 140.24]], 
                    [[28.17, 98.06, 165.55], [32.16, 99.18, 168.33]],
                    [[29.44, 93.21, 162.69], [31.87, 98.80, 168.24]],
                    [[30.26, 95.75,	167.17], [31.93, 99.06,	170.79]], 
                    [[30.67, 96.46,	169.23], [32.20, 99.43,	171.58]], 
                    [[30.42, 94.89,	164.28], [31.66, 99.74,	170.53]], 
                    [[30.25, 96.23, 165.81], [32.23, 99.99,	169.07]]])

filter3 = np.array([[[0.0, 0.0, 0.0], [0.0, 0.0, 0.0]], 
                    [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0]],
                    [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0]], 
                    [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0]], 
                    [[35.33, 54.15, 65.30], [42.28,	80.74, 72.17]], 
                    [[44.87, 86.16, 75.33], [48.43,	96.01, 77.90]],
                    [[47.93, 96.86,	77.42], [48.96,	98.84, 78.82]], 
                    [[47.54, 93.74,	76.89], [48.72, 99.26, 79.50]], 
                    [[46.79, 94.99,	76.96], [49.19, 99.56, 78.61]]])   

# temperature detect function 
def temperature_detect(image_path): 
    # Remove all jpg 
    current_directory = os.getcwd()
    files = os.listdir(current_directory)

    for file in files: 
        if file.endswith(".jpg"):
            file_path = os.path.join(current_directory, file)
            os.remove(file_path)

    num_circles = [0] * num_colors
    average = [[0, 0, 0]] * num_colors

    for i in range(num_colors):
        # Load image 
        image = cv2.imread(image_path)
        
        # Crop image 
        tmp_image = image[y:y+crop_height, x:x+crop_width]
        file_result = "result-{}_crop.jpg".format(i)
        cv2.imwrite(file_result, tmp_image)

        # Fine Hexagon 
        hsv = cv2.cvtColor(tmp_image, cv2.COLOR_BGR2HSV)

        # Create a mask for pixels within the specified range
        color_mask = cv2.inRange(hsv, color_filter[i][0], color_filter[i][1])

        # Apply the mask to the original image
        color_extracted = cv2.bitwise_and(tmp_image, tmp_image, mask=color_mask)

        gray = color_extracted[:,:,2]
        gray_adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)

        # # Apply GaussianBlur to reduce noise and help edge detection
        blurred = cv2.GaussianBlur(gray_adaptive, (5, 5), 0)

        # Use Canny edge detector to find edges
        edges = cv2.Canny(blurred, 50, 150) # 50-150

        # Find contours in the edges
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours based on the number of sides (hexagons have 6 sides)
        hexagons = []
        colors = []       
        circles = []
        for contour in contours:
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            if len(approx) >= 6 and len(approx) <= 10:
                area = cv2.contourArea(approx)
                # print(f"[{i}] area {area}") 
                if area > 1000:
                    # Find the minimum enclosing rectangle around the hexagon
                    rect = cv2.minAreaRect(contour)
                    center, radius = rect[0], (min(rect[1]) / 2) * 0.7
                    
                    # if radius > 50 and radius < 80:
                    # Add to hexagons
                    hexagons.append(approx)                    
                    
                    # Draw a circle inside the hexagon
                    cv2.circle(tmp_image, (int(center[0]), int(center[1])), int(radius), (0, 0, 255), 2)
                    
                    # Calculate the average color within the circle               
                    roi = tmp_image[int(center[1] - radius):int(center[1] + radius), int(center[0] - radius):int(center[0] + radius)]
                    circles.append(roi)
                    color = np.mean(roi, axis=(0, 1))
                    colors.append(color)             
                    
                    #print(f"[{i}] Circle's Average Color: {color}  /  Center:{center[0]},{center[1]} / Radius:{radius}")               
        
        num_circles[i] = len(hexagons)

        # Draw hexagons on the original image
        cv2.drawContours(tmp_image, hexagons, -1, (0, 255, 0), 2)

        # Save the result 
        file_result = "result-{}.jpg".format(i)
        cv2.imwrite(file_result, tmp_image)
        
        # intermediate results for verification
        file_result = "result-{}_colext.jpg".format(i)
        cv2.imwrite(file_result, color_extracted)
        file_result = "result-{}_gray.jpg".format(i)
        cv2.imwrite(file_result, gray_adaptive)
        file_result = "result-{}_edge.jpg".format(i)
        cv2.imwrite(file_result, edges)

        # Calculate the average color of circles
        if colors:   
            average[i] = np.mean(colors, axis=0)
            print(f"[{i}] Average Color: {average[i]}   /   NumColors: {int(num_circles[i])}")
        
            # Save the average color 
            new_image = np.zeros((100,100,3))
            file_roi = "roi-{}.jpg".format(i)
            cv2.circle(new_image, (50, 50), 50, average[i], -1)  # -1 fills the circle
            cv2.imwrite(file_roi, new_image)
        else:
            print(f"[{i}] Average Color: No average color (array is empty!!!)")
    
    # Temperature decision
    # print(f"{average[0]} / {average[1]} / {average[2]}")
    if np.all(average[0] >= filter1[0][0]) and np.all(average[0] <= filter1[0][1]) \
        and np.all(average[1] == [0, 0, 0]): 
        return '35'
    elif np.all(average[0] >= filter1[1][0]) and np.all(average[0] <= filter1[1][1]) \
        and np.all(average[1] == [0, 0, 0]): 
        return '40'
    elif np.all(average[0] >= filter1[2][0]) and np.all(average[0] <= filter1[2][1]) \
        and np.all(average[1] >= filter2[2][0]) and np.all(average[1] <= filter2[2][1]): \
        return '45'
    elif np.all(average[0] >= filter1[3][0]) and np.all(average[0] <= filter1[3][1]) \
        and np.all(average[1] >= filter2[3][0]) and np.all(average[1] <= filter2[3][1]):
        return '50'
    elif np.all(average[0] >= filter1[4][0]) and np.all(average[0] <= filter1[4][1]) \
         and np.all(average[1] >= filter2[4][0]) and np.all(average[1] <= filter2[4][1]) \
         and np.all(average[2] >= filter3[4][0]) and np.all(average[2] <= filter3[4][1]):
        return '55'
    elif np.all(average[0] >= filter1[5][0]) and np.all(average[0] <= filter1[5][1]) \
         and np.all(average[1] >= filter2[5][0]) and np.all(average[1] <= filter2[5][1]) \
         and np.all(average[2] >= filter3[5][0]) and np.all(average[2] <= filter3[5][1]):
        return '60'
    elif np.all(average[0] >= filter1[6][0]) and np.all(average[0] <= filter1[6][1]) \
         and np.all(average[1] >= filter2[6][0]) and np.all(average[1] <= filter2[6][1]) \
         and np.all(average[2] >= filter3[6][0]) and np.all(average[2] <= filter3[6][1]):
        return '65'
    elif np.all(average[0] >= filter1[7][0]) and np.all(average[0] <= filter1[7][1]) \
         and np.all(average[1] >= filter2[7][0]) and np.all(average[1] <= filter2[7][1]) \
         and np.all(average[2] >= filter3[7][0]) and np.all(average[2] <= filter3[7][1]):
        return '70'
    elif np.all(average[0] >= filter1[8][0]) and np.all(average[0] <= filter1[8][1]) \
         and np.all(average[1] >= filter2[8][0]) and np.all(average[1] <= filter2[8][1]) \
         and np.all(average[2] >= filter3[8][0]) and np.all(average[2] <= filter3[8][1]):
        return '75'
    
    return '0'



# Main (call color_detect)
if len(sys.argv) > 1:
    image_path = sys.argv[1]
    result = temperature_detect(image_path)
    print(result)
else:
    print(f"Usage: {sys.argv[0]} [Image Path]")
    
    