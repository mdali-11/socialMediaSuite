"""
Instagram Upload Logic
"""

import os
import logging
import time
from ensta import Web
from config import Config

logger = logging.getLogger(__name__)


class InstagramUploader:
    def __init__(self):
        self.clients = {}
    
    def _get_session_path(self, username):
        return os.path.join(Config.SESSION_FOLDER, f"{username}_session.json")
    
    def _login(self, username, password, use_session=True):
        session_path = self._get_session_path(username)
        
        try:
            if username in self.clients:
                logger.info(f"♻️ Using cached client for @{username}")
                return self.clients[username]
            
            if use_session and os.path.exists(session_path):
                logger.info(f"📂 Loading session for @{username}")
                try:
                    client = Web.load_session(session_path)
                    self.clients[username] = client
                    logger.info(f"✅ Session loaded successfully")
                    return client
                except Exception as e:
                    logger.warning(f"⚠️ Session load failed: {e}, logging in fresh")
            
            logger.info(f"🔐 Logging in as @{username}...")
            client = Web(username, password)
            
            if use_session:
                try:
                    client.save_session(session_path)
                    logger.info(f"💾 Session saved")
                except Exception as e:
                    logger.warning(f"⚠️ Could not save session: {e}")
            
            self.clients[username] = client
            logger.info(f"✅ Login successful")
            return client
            
        except Exception as e:
            logger.error(f"❌ Login failed for @{username}: {e}")
            raise Exception(f"Instagram login failed: {str(e)}")
    
    def upload_reel(self, username, password, video_path, caption="", 
                   thumbnail_path=None, use_session=True):
        try:
            client = self._login(username, password, use_session)
            
            logger.info(f"📤 Uploading video: {os.path.basename(video_path)}")
            video_id = client.upload_video_for_reel(video_path, thumbnail=thumbnail_path)
            
            logger.info(f"📝 Publishing reel...")
            result = client.pub_reel(video_id, caption=caption)
            
            logger.info(f"✅ Reel published successfully!")
            
            return {
                "video_id": video_id,
                "caption": caption,
                "status": "published"
            }
            
        except Exception as e:
            logger.error(f"❌ Upload failed: {str(e)}")
            raise Exception(f"Reel upload failed: {str(e)}")
    
    def upload_batch(self, username, password, videos, use_session=True):
        results = []
        
        try:
            client = self._login(username, password, use_session)
            
            for i, video_data in enumerate(videos):
                try:
                    video_path = video_data.get('video_path')
                    caption = video_data.get('caption', '')
                    thumbnail_path = video_data.get('thumbnail_path')
                    
                    logger.info(f"📤 Uploading video {i+1}/{len(videos)}: {video_path}")
                    
                    video_id = client.upload_video_for_reel(video_path, thumbnail=thumbnail_path)
                    client.pub_reel(video_id, caption=caption)
                    
                    results.append({
                        "index": i,
                        "success": True,
                        "video_id": video_id,
                        "caption": caption
                    })
                    
                    logger.info(f"✅ Video {i+1} uploaded successfully")
                    
                    if i < len(videos) - 1:
                        delay = Config.BATCH_UPLOAD_DELAY
                        logger.info(f"⏳ Waiting {delay}s...")
                        time.sleep(delay)
                    
                except Exception as e:
                    logger.error(f"❌ Video {i+1} failed: {str(e)}")
                    results.append({
                        "index": i,
                        "success": False,
                        "error": str(e)
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Batch upload failed: {str(e)}")
            raise Exception(f"Batch upload failed: {str(e)}")