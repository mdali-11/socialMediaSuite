"""
Configuration
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    PORT = int(os.getenv('INSTAGRAM_SERVICE_PORT', 5001))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'temp_uploads')
    SESSION_FOLDER = os.path.join(os.path.dirname(__file__), 'sessions')
    MAX_FILE_SIZE = 100 * 1024 * 1024
    
    ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv'}
    ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
    
    BATCH_UPLOAD_DELAY = int(os.getenv('BATCH_UPLOAD_DELAY', 30))
    MAX_RETRIES = int(os.getenv('MAX_RETRIES', 3))
    
    MAX_UPLOADS_PER_HOUR = int(os.getenv('MAX_UPLOADS_PER_HOUR', 10))
    MAX_UPLOADS_PER_DAY = int(os.getenv('MAX_UPLOADS_PER_DAY', 50))