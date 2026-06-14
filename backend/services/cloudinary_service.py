import os
import io
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

load_dotenv()

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_API_KEY or not CLOUDINARY_API_SECRET:
    raise Exception("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set in .env")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)


def upload_image(file_bytes: bytes, filename: str) -> str:
    try:
        result = cloudinary.uploader.upload(
            io.BytesIO(file_bytes),
            folder="second-life-commerce",
            public_id=filename,
            overwrite=True,
            resource_type="image",
        )
        return result["secure_url"]
    except Exception as e:
        raise Exception(f"Failed to upload image '{filename}' to Cloudinary: {str(e)}")
