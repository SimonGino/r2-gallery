"""
Database migration script to add width and height columns to images table
"""

import sqlite3
import sys
from pathlib import Path

# Get database path
db_path = Path(__file__).parent / "images.db"

if not db_path.exists():
    print(f"Error: Database file not found at {db_path}")
    sys.exit(1)

print(f"Migrating database at: {db_path}")

try:
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check if columns already exist
    cursor.execute("PRAGMA table_info(images)")
    columns = [col[1] for col in cursor.fetchall()]

    if "width" in columns and "height" in columns:
        print("✓ Columns 'width' and 'height' already exist. No migration needed.")
        conn.close()
        sys.exit(0)

    # Add width column if not exists
    if "width" not in columns:
        print("Adding 'width' column...")
        cursor.execute("ALTER TABLE images ADD COLUMN width INTEGER")
        print("✓ Added 'width' column")

    # Add height column if not exists
    if "height" not in columns:
        print("Adding 'height' column...")
        cursor.execute("ALTER TABLE images ADD COLUMN height INTEGER")
        print("✓ Added 'height' column")

    # Commit changes
    conn.commit()
    print("\n✅ Migration completed successfully!")

    # Show updated schema
    cursor.execute("PRAGMA table_info(images)")
    print("\nUpdated table schema:")
    for col in cursor.fetchall():
        print(f"  - {col[1]} ({col[2]})")

    conn.close()

except sqlite3.Error as e:
    print(f"❌ Database error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)
