import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use consistent paths - point to services directory
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

let oAuth2Client = null;

// Initialize OAuth2 Client
function initializeOAuth2Client() {
  if (oAuth2Client) return oAuth2Client;

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`credentials.json not found at ${CREDENTIALS_PATH}`);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_id, client_secret, redirect_uris } = credentials.web;

  oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Load existing token if available
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    
    // Setup token refresh handler
    oAuth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        // Store the new refresh token
        const currentTokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
        currentTokens.refresh_token = tokens.refresh_token;
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(currentTokens, null, 2));
      }
      // Always update access token
      const updatedTokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
      updatedTokens.access_token = tokens.access_token;
      if (tokens.expiry_date) {
        updatedTokens.expiry_date = tokens.expiry_date;
      }
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(updatedTokens, null, 2));
    });
  }

  return oAuth2Client;
}

// Get OAuth2 Client (for use in routes)
export function getOAuth2Client() {
  return initializeOAuth2Client();
}

// Check if user is authenticated
export function isAuthenticated() {
  return fs.existsSync(TOKEN_PATH);
}

// Save token after OAuth callback
export function saveToken(tokens) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  if (oAuth2Client) {
    oAuth2Client.setCredentials(tokens);
  }
}

// Upload video to YouTube
export async function uploadVideo({ filePath, title, description, tags = [] }) {
  try {
    console.log("🔍 Starting upload process...");
    console.log("📁 File path:", filePath);
    
    const client = initializeOAuth2Client();
    console.log("✅ OAuth client initialized");
    
    if (!isAuthenticated()) {
      throw new Error("Not authenticated. Please authorize first via /auth/google");
    }
    console.log("✅ Token file exists");

    // Read and log token info
    const tokenInfo = JSON.parse(fs.readFileSync(TOKEN_PATH));
    console.log("📋 Token info:", {
      has_access_token: !!tokenInfo.access_token,
      has_refresh_token: !!tokenInfo.refresh_token,
      scope: tokenInfo.scope,
      expires: tokenInfo.expiry_date ? new Date(tokenInfo.expiry_date).toISOString() : 'none',
      is_expired: tokenInfo.expiry_date < Date.now()
    });

    // Check if token is expired and try to refresh
    if (tokenInfo.expiry_date && tokenInfo.expiry_date < Date.now()) {
      console.log("🔄 Token expired, attempting to refresh...");
      try {
        const { credentials } = await client.refreshAccessToken();
        saveToken(credentials);
        console.log("✅ Token refreshed successfully");
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError.message);
        throw new Error("Token expired and refresh failed. Please re-authorize via /auth/google");
      }
    } else {
      console.log("✅ Token is still valid");
    }

    const youtube = google.youtube({ version: "v3", auth: client });
    console.log("✅ YouTube API client created");
    
    console.log(`📤 Uploading video: ${title}`);
    
    const response = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: title || "Untitled Video",
          description: description || "Uploaded via YouTube API",
          categoryId: "22", // People & Blogs
          tags: tags.length > 0 ? tags : ["youtube", "api", "upload"],
        },
        status: { 
          privacyStatus: "private" // Change to "public" or "unlisted" as needed
        },
      },
      media: { 
        body: fs.createReadStream(filePath) 
      },
    });

    console.log(`✅ Video uploaded successfully: ${response.data.id}`);
    return response.data;
    
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Error details:", JSON.stringify(error.errors || error, null, 2));
    
    // Check if it's an auth error
    if (error.code === 401 || error.code === 403) {
      // Delete the invalid token
      if (fs.existsSync(TOKEN_PATH)) {
        console.log("🗑️ Deleting invalid token...");
        fs.unlinkSync(TOKEN_PATH);
      }
      throw new Error("Authentication failed. Token deleted. Please re-authorize via /auth/google");
    }
    
    throw error;
  }
}