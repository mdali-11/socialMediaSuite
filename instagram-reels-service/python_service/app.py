"""
Instagram Reels Upload Service - Main Flask App
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime

from instagram_uploader import InstagramUploader
from config import Config
from utils import allowed_file, save_uploaded_file, cleanup_file

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('../logs/instagram_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Ensure directories exist
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.SESSION_FOLDER, exist_ok=True)
os.makedirs('../logs', exist_ok=True)

# Initialize Instagram uploader
instagram = InstagramUploader()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Instagram Reels Uploader",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })


@app.route('/upload-reel', methods=['POST'])
def upload_reel():
    """Upload a single reel to Instagram"""
    video_path = None
    thumbnail_path = None
    
    try:
        # Validate request
        if 'video' not in request.files:
            return jsonify({"success": False, "error": "No video file provided"}), 400
        
        video_file = request.files['video']
        thumbnail_file = request.files.get('thumbnail')
        
        if video_file.filename == '':
            return jsonify({"success": False, "error": "No video selected"}), 400
        
        if not allowed_file(video_file.filename, Config.ALLOWED_VIDEO_EXTENSIONS):
            return jsonify({"success": False, "error": f"Invalid video format. Allowed: {Config.ALLOWED_VIDEO_EXTENSIONS}"}), 400
        
        # Get form data
        caption = request.form.get('caption', '')
        username = request.form.get('username')
        password = request.form.get('password')
        use_session = request.form.get('use_session', 'true').lower() == 'true'
        
        if not username or not password:
            return jsonify({"success": False, "error": "Username and password are required"}), 400
        
        logger.info(f"📤 Upload request for @{username}")
        
        # Save uploaded files
        video_path = save_uploaded_file(video_file, Config.UPLOAD_FOLDER)
        logger.info(f"✅ Video saved: {video_path}")
        
        if thumbnail_file:
            thumbnail_path = save_uploaded_file(thumbnail_file, Config.UPLOAD_FOLDER)
            logger.info(f"✅ Thumbnail saved: {thumbnail_path}")
        
        # Upload to Instagram
        logger.info(f"📱 Uploading reel to Instagram...")
        result = instagram.upload_reel(
            username=username,
            password=password,
            video_path=video_path,
            caption=caption,
            thumbnail_path=thumbnail_path,
            use_session=use_session
        )
        
        logger.info(f"✅ Reel uploaded successfully!")
        
        return jsonify({
            "success": True,
            "message": "Reel uploaded successfully",
            "data": result
        })
        
    except Exception as e:
        logger.error(f"❌ Upload failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
        
    finally:
        cleanup_file(video_path)
        cleanup_file(thumbnail_path)


@app.route('/upload-reel-batch', methods=['POST'])
def upload_reel_batch():
    """Upload multiple reels to Instagram"""
    try:
        data = request.get_json()
        
        username = data.get('username')
        password = data.get('password')
        videos = data.get('videos', [])
        use_session = data.get('use_session', True)
        
        if not username or not password:
            return jsonify({"success": False, "error": "Username and password are required"}), 400
        
        if not videos:
            return jsonify({"success": False, "error": "No videos provided"}), 400
        
        logger.info(f"📤 Batch upload: {len(videos)} videos for @{username}")
        
        # Upload batch
        results = instagram.upload_batch(
            username=username,
            password=password,
            videos=videos,
            use_session=use_session
        )
        
        successful = len([r for r in results if r['success']])
        logger.info(f"✅ Batch complete: {successful}/{len(videos)} successful")
        
        return jsonify({
            "success": True,
            "message": f"Uploaded {successful}/{len(videos)} reels",
            "total": len(videos),
            "successful": successful,
            "results": results
        })
        
    except Exception as e:
        logger.error(f"❌ Batch upload failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/clear-session', methods=['POST'])
def clear_session():
    """Clear saved Instagram session for a user"""
    try:
        data = request.get_json()
        username = data.get('username')
        
        if not username:
            return jsonify({"success": False, "error": "Username is required"}), 400
        
        session_file = os.path.join(Config.SESSION_FOLDER, f"{username}_session.json")
        
        if os.path.exists(session_file):
            os.remove(session_file)
            logger.info(f"🗑️ Session cleared for @{username}")
            return jsonify({"success": True, "message": f"Session cleared for @{username}"})
        else:
            return jsonify({"success": False, "error": "No session found for this user"}), 404
            
    except Exception as e:
        logger.error(f"❌ Clear session failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("🚀 Instagram Reels Upload Service")
    logger.info("=" * 60)
    logger.info("📝 Available Endpoints:")
    logger.info("   - GET  /health")
    logger.info("   - POST /upload-reel")
    logger.info("   - POST /upload-reel-batch")
    logger.info("   - POST /clear-session")
    logger.info("=" * 60)
    logger.info(f"🌐 Service running on http://0.0.0.0:{Config.PORT}")
    logger.info("=" * 60)
    
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)