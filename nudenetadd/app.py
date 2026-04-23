import os
import tempfile
import requests
from flask import Flask, request, jsonify
from PIL import Image, ExifTags
import imagehash
from nudenet import NudeDetector
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# DB config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./images.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# AI model (NSFW)
detector = NudeDetector()

# Thresholds
NSFW_CONFIDENCE = float(os.getenv("NUDENET_NSWF_CONFIDENCE", "0.7"))
DEFAULT_DUPLICATE_DISTANCE = int(os.getenv("NUDENET_DUPLICATE_DISTANCE", "5"))
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# DB Table
class ImageData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hash = db.Column(db.String(20), unique=True)
    status = db.Column(db.String(20))
    tags = db.Column(db.Text)
    value_estimate = db.Column(db.String(20))

# Create DB
with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return jsonify({"status": "active", "engine": "DataKart AI Guard 🛡️"})

NSFW_LABELS = [
    "BUTTOCKS_EXPOSED", "FEMALE_BREAST_EXPOSED", "FEMALE_GENITALIA_EXPOSED",
    "MALE_GENITALIA_EXPOSED", "ANUS_EXPOSED", "EXPOSED_BUTTOCKS",
    "EXPOSED_BREAST_F", "EXPOSED_GENITALIA_F", "EXPOSED_GENITALIA_M", "EXPOSED_ANUS"
]

def is_nsfw(result):
    for item in result:
        conf = item.get("score", item.get("confidence", 0))
        label = item.get("class", "").upper()
        if conf > NSFW_CONFIDENCE and label in NSFW_LABELS:
            return True
    return False

def get_exif(img):
    exif = {}
    try:
        info = img._getexif()
        if info:
            for tag, value in info.items():
                decoded = ExifTags.TAGS.get(tag, tag)
                exif[decoded] = str(value)
    except:
        pass
    return exif

def get_ai_tags(image_path):
    try:
        with open(image_path, "rb") as f:
            data = f.read()
        response = requests.post(
            "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
            headers={"Authorization": f"Bearer {HF_API_KEY}"},
            data=data
        )
        return response.json()[0].get("generated_text", "generic data")
    except:
        return "unclassified"

@app.route("/check", methods=["POST", "OPTIONS"])
def check_image():
    if request.method == "OPTIONS":
        return ("", 204)

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp_path = tmp.name
            file.save(tmp_path)

        # 1. NSFW check
        result = detector.detect(tmp_path)
        nsfw_found = is_nsfw(result)
        
        # 2. Hashing & Duplicate check
        img = Image.open(tmp_path)
        new_hash = imagehash.phash(img)
        duplicate_distance = int(os.getenv("NUDENET_DUPLICATE_DISTANCE", str(DEFAULT_DUPLICATE_DISTANCE)))
        
        is_duplicate = False
        stored_hashes = ImageData.query.with_entities(ImageData.hash).all()
        for row in stored_hashes:
            if new_hash - imagehash.hex_to_hash(row[0]) <= duplicate_distance:
                is_duplicate = True
                break

        # 3. AI Tagging (New Feature)
        tags = get_ai_tags(tmp_path)
        
        # 4. EXIF Extraction (New Feature)
        metadata = get_exif(img)

        status = "safe"
        if nsfw_found: status = "nsfw"
        if is_duplicate: status = "duplicate"

        # Store results
        if not is_duplicate:
            new_entry = ImageData(hash=str(new_hash), status=status, tags=tags)
            db.session.add(new_entry)
            db.session.commit()

        return jsonify({
            "status": status,
            "hash": str(new_hash),
            "ai_tags": tags,
            "metadata": metadata,
            "nsfw_details": result if nsfw_found else []
        })
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

if __name__ == "__main__":
    app.run(port=5001, debug=True)