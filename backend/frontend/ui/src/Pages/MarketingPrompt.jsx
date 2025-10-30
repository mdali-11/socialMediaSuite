import React, { useState } from "react";
import CampaignDashboard from "./CampaignDashboard";

const MarketingPrompt = () => {
  const [userId, setUserId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [timeframe, setTimeframe] = useState("monthly");
  const [data , setData]= useState ([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { userId, prompt, timeframe };
    console.log("Submitted Data:", payload);
    fetch("http://localhost:5000/api/marketing/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => response.json()).then((res) =>  setData(res.data)).catch((error) => console.error('Error:', error)); 

    // Later we’ll send this payload to your backend / OpenAI API
    // and handle the response to map into dashboard UI
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
          ✨ Generate Marketing Campaign
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter or generate user ID"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Prompt
            </label>
            <textarea
              rows="4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your campaign idea..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 mt-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            Generate Campaign
          </button>
        </form>
      </div>
    </div>
      <CampaignDashboard data={data} />
    </>
  );
};

export default MarketingPrompt;
