import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Replicate from "replicate";
import fs from "node:fs";


dotenv.config();


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
const router = express.Router();

router.post("/generate-video", async (req, res) => {
  const { prompt } = req.body;

  try {

    const input = {
  prompt: prompt,
  prompt_optimizer: true
};

const output = await replicate.run("minimax/video-01", { input });

//     const input = {
//   fps: 24,
//   prompt: prompt,
//   duration: 5,
//   resolution: "720p",
//   aspect_ratio: "16:9",
//   camera_fixed: false
// };

// const output = await replicate.run("bytedance/seedance-1-lite", { input });

// To access the file URL:
console.log(output.url()); //=> "http://example.com"
// fs.writeFile("my-image.png", output);


// To write the file to disk:
return res.json({ output: output.url() });
//     const response = await axios.post(
//       "https://api.replicate.com/v1/predictions",
//       {
// version: "b4cc48f1d4cf99b27b041b2ad59f9fefb836b4b44a2e6f1b64b6f833ed9fae0b",
//         input: { prompt },
//       },
//       {
//         headers: {
//           Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const prediction = response.data;
//     res.json({ id: prediction.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/check/:id", async (req, res) => {
  const { id } = req.params;

  const response = await axios.get(
    `https://api.replicate.com/v1/predictions/${id}`,
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    }
  );

  res.json(response.data);
});


export default router;
