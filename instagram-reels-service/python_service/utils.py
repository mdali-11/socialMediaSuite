"""
Utility functions
"""

import os
import uuid
import logging
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)


def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


def save_uploaded_file(file, upload_folder):
    if not file:
        return None
    
    original_filename = secure_filename(file.filename)
    extension = original_filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{extension}"
    
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    
    logger.info(f"💾 File saved: {unique_filename}")
    return file_path


def cleanup_file(file_path):
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
            logger.info(f"🗑️ Cleaned up: {os.path.basename(file_path)}")
        except Exception as e:
            logger.warning(f"⚠️ Could not delete {file_path}: {e}")