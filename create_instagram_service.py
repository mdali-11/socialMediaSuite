#!/usr/bin/env python3
"""
Instagram Reels Service - Complete Project Generator
Run this script and it will create the entire project structure with all files
"""

import os
import sys

def create_directory_structure():
    """Create all necessary directories"""
    directories = [
        "instagram-reels-service/node_service/routes",
        "instagram-reels-service/node_service/controllers",
        "instagram-reels-service/node_service/services",
        "instagram-reels-service/node_service/middleware",
        "instagram-reels-service/node_service/config",
        "instagram-reels-service/node_service/uploads",
        "instagram-reels-service/python_service/sessions",
        "instagram-reels-service/python_service/temp_uploads",
        "instagram-reels-service/logs",
        "instagram-reels-service/shared",
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created: {directory}")

def create_file(path, content):
    """Create a file with given content"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Created: {path}")

def main():
    print("=" * 60)
    print("🚀 Instagram Reels Service - Project Generator")
    print("=" * 60)
    print()
    
    # Create directory structure
    print("📁 Creating directory structure...")
    create_directory_structure()
    print()
    
    base_path = "instagram-reels-service"
    
    # Create package.json
    print("📦 Creating package.json...")
    create_file(f"{base_path}/package.json", '''{
  "name": "instagram-reels-service",
  "version": "1.0.0",
  "description": "Instagram Reels automation service",
  "type": "module",
  "main": "node_service/index.js",
  "scripts": {
    "start": "node node_service/index.js",
    "dev": "nodemon node_service/index.js",
    "python": "cd python_service && python app.py",
    "start:all": "concurrently \\"npm run dev\\" \\"npm run python\\""
  },
  "dependencies": {
    "axios": "^1.6.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "form-data": "^4.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "nodemon": "^3.0.2"
  }
}''')
    
    # Create requirements.txt
    print("📦 Creating requirements.txt...")
    create_file(f"{base_path}/requirements.txt", '''ensta==5.3.4
flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
werkzeug==3.0.1
opencv-python==4.8.1.78
Pillow==10.1.0''')
    
    # Create .env
    print("⚙️  Creating .env...")
    create_file(f"{base_path}/.env", '''PORT=5000
NODE_ENV=development
INSTAGRAM_SERVICE_URL=http://localhost:5001
INSTAGRAM_SERVICE_PORT=5001
BATCH_UPLOAD_DELAY=30
MAX_RETRIES=3
MAX_UPLOADS_PER_HOUR=10
MAX_UPLOADS_PER_DAY=50
DEBUG=false''')
    
    # Create .gitignore
    print("📝 Creating .gitignore...")
    create_file(f"{base_path}/.gitignore", '''node_modules/
__pycache__/
*.pyc
.env
node_service/uploads/
python_service/temp_uploads/
python_service/sessions/
logs/
*.log
.DS_Store''')
    
    # Create README.md with instructions
    print("📄 Creating README.md...")
    create_file(f"{base_path}/README.md", '''# Instagram Reels Automation Service

## Quick Start

1. Install dependencies:
```bash
npm install
pip install -r requirements.txt
```

2. Start services:
```bash
npm run start:all
```

3. Upload a reel:
```bash
curl -X POST http://localhost:5000/api/instagram/upload \\
  -F "video=@video.mp4" \\
  -F "caption=My reel!" \\
  -F "username=YOUR_USERNAME" \\
  -F "password=YOUR_PASSWORD"
```

## Important

⚠️ **NEXT STEP**: You need to copy the remaining file contents from the Claude conversation!

The following files need content added:
- python_service/app.py
- python_service/instagram_uploader.py
- python_service/config.py
- python_service/utils.py
- node_service/index.js
- node_service/routes/instagramRoutes.js
- node_service/routes/healthRoutes.js
- node_service/controllers/instagramController.js
- node_service/services/pythonService.js
- node_service/middleware/validation.js
- node_service/config/config.js

Copy these from the artifacts in your Claude conversation.

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/instagram/status` - Check Instagram service
- `POST /api/instagram/upload` - Upload single reel
- `POST /api/instagram/upload-batch` - Upload multiple reels
- `POST /api/instagram/clear-session` - Clear saved session

Made with ❤️''')
    
    # Create placeholder files for others
    placeholder_files = [
        "python_service/app.py",
        "python_service/instagram_uploader.py",
        "python_service/config.py",
        "python_service/utils.py",
        "node_service/index.js",
        "node_service/routes/instagramRoutes.js",
        "node_service/routes/healthRoutes.js",
        "node_service/controllers/instagramController.js",
        "node_service/services/pythonService.js",
        "node_service/middleware/validation.js",
        "node_service/config/config.js",
    ]
    
    print()
    print("📝 Creating placeholder files (you need to add content)...")
    for file_path in placeholder_files:
        full_path = f"{base_path}/{file_path}"
        create_file(full_path, f'''# TODO: Copy content from Claude artifacts
# File: {file_path}
# 
# This file needs the full code content.
# Go back to your Claude conversation and copy the content
# from the artifact I created for this file.
''')
    
    print()
    print("=" * 60)
    print("✅ PROJECT STRUCTURE CREATED!")
    print("=" * 60)
    print()
    print("📍 Location: ./instagram-reels-service/")
    print()
    print("⚠️  IMPORTANT NEXT STEPS:")
    print("1. Go to the instagram-reels-service folder")
    print("2. Open each file in the list above")
    print("3. Copy the FULL content from the Claude artifacts")
    print("4. Replace the placeholder comments")
    print()
    print("Then run:")
    print("  cd instagram-reels-service")
    print("  npm install")
    print("  pip install -r requirements.txt")
    print("  npm run start:all")
    print()
    print("🎉 Happy coding!")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)