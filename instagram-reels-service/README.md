# Instagram Reels Automation Service

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
curl -X POST http://localhost:5000/api/instagram/upload \
  -F "video=@video.mp4" \
  -F "caption=My reel!" \
  -F "username=YOUR_USERNAME" \
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

Made with ❤️