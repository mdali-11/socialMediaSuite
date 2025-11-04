import React from 'react'
 import { useState } from "react";
import axios from "axios";

const VideoGenerator = () => {

  
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

    const generateVideo = async () => {
    setLoading(true);
    const { data } = await axios.post("http://localhost:5000/api/video/generate-video", { prompt });
    const { id } = data;

    // Poll every 5s until done
    let done = false;
    while (!done) {
      const res = await axios.get(`/api/check/${id}`);
      if (res.data.status === "succeeded") {
        setVideoUrl(res.data.output[0]);
        done = true;
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
    setLoading(false);
  };
  return (
    <div>
    <div className="p-6">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your video..."
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={generateVideo}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate
      </button>

      {loading && <p>Generating your video...</p>}
      {videoUrl && <video src={videoUrl} controls autoPlay loop />}
    </div>
  

    </div>
  )
}

export default VideoGenerator

