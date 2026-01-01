"""
Update existing images with width and height information
Downloads images from R2 and extracts dimensions using Pillow
"""

import io
import sqlite3
import sys
from pathlib import Path

# Add parent directory to path to import from src
sys.path.insert(0, str(Path(__file__).parent / "src"))

from PIL import Image as PILImage

from core.config import get_settings
from core.storage import get_r2_client

# Get settings and R2 client
settings = get_settings()
s3_client = get_r2_client()

# Database path
db_path = Path(__file__).parent / "images.db"

print("🔄 Updating existing images with width/height information...\n")

try:
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Find images without width/height
    cursor.execute("""
        SELECT id, key, url
        FROM images
        WHERE width IS NULL OR height IS NULL
    """)
    images = cursor.fetchall()

    if not images:
        print("✅ All images already have width/height information!")
        conn.close()
        sys.exit(0)

    print(f"Found {len(images)} images to update\n")

    updated = 0
    failed = 0

    for img_id, key, url in images:
        try:
            print(f"Processing: {key}...", end=" ")

            # Download image from R2
            response = s3_client.get_object(Bucket=settings.BUCKET_NAME, Key=key)
            image_data = response["Body"].read()

            # Get dimensions
            img = PILImage.open(io.BytesIO(image_data))
            width, height = img.size

            # Update database
            cursor.execute(
                """
                UPDATE images
                SET width = ?, height = ?
                WHERE id = ?
            """,
                (width, height, img_id),
            )

            print(f"✓ {width}x{height}")
            updated += 1

        except Exception as e:
            print(f"✗ Error: {e}")
            failed += 1
            continue

    # Commit all changes
    conn.commit()
    conn.close()

    print(f"\n{'=' * 50}")
    print(f"✅ Successfully updated: {updated} images")
    if failed > 0:
        print(f"❌ Failed: {failed} images")
    print(f"{'=' * 50}")

except sqlite3.Error as e:
    print(f"❌ Database error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)
