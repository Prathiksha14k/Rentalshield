import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
import requests

def load_image_from_url(url):
    """Downloads an image from a URL (e.g. Cloudinary) and loads it as an OpenCV image."""
    response = requests.get(url)
    image_array = np.frombuffer(response.content, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    return image

def compare_images(image1, image2):
    """
    Compares two images using SSIM.
    Returns a similarity score (0 to 1, where 1 = identical)
    and a diff image highlighting changed regions.
    """
    # Resize image2 to match image1's dimensions, in case photos aren't the same size
    image2_resized = cv2.resize(image2, (image1.shape[1], image1.shape[0]))

    # Convert both images to grayscale — SSIM works on structural/luminance patterns, not color
    gray1 = cv2.cvtColor(image1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(image2_resized, cv2.COLOR_BGR2GRAY)

    # Compute SSIM score and the difference map
    score, diff = ssim(gray1, gray2, full=True)

    # diff values range -1 to 1; convert to a standard 0-255 image format for viewing
    diff = (diff * 255).astype("uint8")

    return score, diff

if __name__ == "__main__":
    url1 = "https://res.cloudinary.com/zydsnk6t/image/upload/v1787677681/rentalshield/inspections/yugk6royqziavvk5u61o.jpg"
    url2 = "https://res.cloudinary.com/zydsnk6t/image/upload/v1787677684/rentalshield/inspections/gqmonobcqngozm6isjcd.jpg"

    img1 = load_image_from_url(url1)
    img2 = load_image_from_url(url2)

    print("Image 1 shape:", img1.shape if img1 is not None else "FAILED TO LOAD")
    print("Image 2 shape:", img2.shape if img2 is not None else "FAILED TO LOAD")

    similarity_score, diff_image = compare_images(img1, img2)

    print(f"Similarity Score: {similarity_score:.4f}")
    print("(1.0 = identical, lower = more different)")

    cv2.imwrite("diff_output.png", diff_image)
    cv2.imwrite("image1_check.png", img1)
    cv2.imwrite("image2_check.png", img2)
    print("Diff image saved as diff_output.png")
    print("Also saved image1_check.png and image2_check.png for visual comparison")