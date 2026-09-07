from flask import Flask, request, jsonify
import requests
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
from compare import load_image_from_url, compare_images

app = Flask(__name__)

NODE_BACKEND_URL = "http://localhost:5000"

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "AI service is running"}), 200

@app.route('/compare-inspections', methods=['POST'])
def compare_inspections():
    try:
        data = request.get_json()
        move_in_id = data.get('moveInInspectionId')
        move_out_id = data.get('moveOutInspectionId')
        auth_token = data.get('authToken')

        if not move_in_id or not move_out_id or not auth_token:
            return jsonify({"error": "moveInInspectionId, moveOutInspectionId, and authToken are required"}), 400

        headers = {"Authorization": f"Bearer {auth_token}"}

        move_in_res = requests.get(f"{NODE_BACKEND_URL}/api/inspections/{move_in_id}", headers=headers)
        move_out_res = requests.get(f"{NODE_BACKEND_URL}/api/inspections/{move_out_id}", headers=headers)

        if move_in_res.status_code != 200:
            return jsonify({"error": "Could not fetch move-in inspection", "details": move_in_res.json()}), 400
        if move_out_res.status_code != 200:
            return jsonify({"error": "Could not fetch move-out inspection", "details": move_out_res.json()}), 400

        move_in_photos = move_in_res.json().get('photos', [])
        move_out_photos = move_out_res.json().get('photos', [])

        move_in_by_label = {p['label']: p['url'] for p in move_in_photos}
        move_out_by_label = {p['label']: p['url'] for p in move_out_photos}

        common_labels = set(move_in_by_label.keys()) & set(move_out_by_label.keys())

        if not common_labels:
            return jsonify({"error": "No matching photo labels found between the two inspections"}), 400

        results = []
        for label in common_labels:
            img1 = load_image_from_url(move_in_by_label[label])
            img2 = load_image_from_url(move_out_by_label[label])
            score, _ = compare_images(img1, img2)

            results.append({
                "label": label,
                "similarityScore": round(float(score), 4),
                "moveInPhotoUrl": move_in_by_label[label],
                "moveOutPhotoUrl": move_out_by_label[label]
            })

        # Save the report via the Node backend instead of just returning raw results
        save_res = requests.post(
            f"{NODE_BACKEND_URL}/api/ai-reports",
            headers=headers,
            json={
                "moveInInspectionId": move_in_id,
                "moveOutInspectionId": move_out_id,
                "results": results
            }
        )

        if save_res.status_code != 201:
            return jsonify({"error": "Comparison succeeded but saving the report failed", "details": save_res.json()}), 500

        return jsonify(save_res.json()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)