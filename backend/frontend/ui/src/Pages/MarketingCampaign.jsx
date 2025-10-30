import React, { useState } from "react";

// MarketingCampaignExporter.jsx
// Single-file React component (Tailwind + Framer Motion friendly)
// Features:
// - Accepts campaign JSON (sample included)
// - Animated summary cards
// - Prompt / userId / timeframe inputs (userId randomizer)
// - Export to CSV (download) and Copy CSV to clipboard
// - Responsive two-column layout

// NOTE: This component assumes TailwindCSS is available in your project.
// If you want Framer Motion animations, install `framer-motion` and uncomment imports
// import { motion } from 'framer-motion'

const sampleData = {
  userId: "652bfe9e6f1a0e3bb1234567",
  prompt: "Launch a new eco-friendly water bottle brand for Gen Z",
  campaignName: "RefillRevolution: Hydrate Your Future",
  objective:
    "Achieve 50,000 unique website visits and 1,000 initial sales within the first 3 months post-launch, while establishing a strong brand identity rooted in sustainability and Gen Z values across digital platforms.",
  timeframe: "monthly",
  channels: ["google_ads", "instagram", "facebook"],
  generated: {
    campaign_name: "RefillRevolution: Hydrate Your Future",
    objective:
      "Achieve 50,000 unique website visits and 1,000 initial sales within the first 3 months post-launch, while establishing a strong brand identity rooted in sustainability and Gen Z values across digital platforms.",
    google_ads: [
      {
        type: "Search Ad",
        headlines: [
          "Refill Revolution: Eco Bottles",
          "Sustainable Hydration for Gen Z",
          "Planet-Friendly Water Bottles",
        ],
        descriptions: [
          "Ditch single-use plastic. Our bottles are made from recycled materials, designed for your lifestyle. Shop now!",
        ],
        keywords: ["eco friendly water bottle", "reusable water bottle gen z"],
        budget_monthly: "$1,500 - $2,000 (initial 3 months)",
      },
    ],
    instagram_reels: [
      {
        title: "Morning Routine Glow Up ✨",
        script:
          "Visual: Gen Z wakes up, stretches, makes coffee/tea. Grabs Refill Revolution bottle from a designated spot.",
        hashtags: ["#RefillRevolution", "#MorningVibes"],
      },
    ],
    hashtags: {
      primary: ["#RefillRevolution", "#EcoFriendlyBottle"],
      secondary: ["#GoGreen", "#PlasticFree"],
      niche: ["#StudentLifeHacks", "#FitnessEssentials"],
    },
    social_posts: [
      {
        platform: "Instagram/TikTok/Facebook",
        type: "Image/Carousel",
        caption:
          "🚨 THE WAIT IS OVER! 🚨 Introducing Refill Revolution – your new favorite eco-friendly water bottle.",
      },
    ],
    kpis: {
      google_ads_ctr: "3.5% (initial target)",
      website_conversion_rate: "1.5% - 2.5%",
      social_media_engagement_rate: "5%",
    },
  },
};

function jsonToCsvRows(obj) {
  // Flatten some nested arrays and objects into rows for CSV export
  const rows = [];

  // Basic campaign row
  rows.push({
    type: "campaign",
    campaignName: obj.campaignName || obj.generated?.campaign_name || "",
    objective: obj.objective || obj.generated?.objective || "",
    timeframe: obj.timeframe || "",
    channels: (obj.channels || []).join("|") || "",
  });

  // Google ads rows
  (obj.generated?.google_ads || []).forEach((ad, i) => {
    rows.push({
      type: `google_ad_${i + 1}`,
      ad_type: ad.type || "",
      headlines: (ad.headlines || []).join(" | ") || "",
      descriptions: (ad.descriptions || []).join(" | ") || "",
      keywords: (ad.keywords || []).join(" | ") || "",
      budget_monthly: ad.budget_monthly || "",
    });
  });

  // Instagram reels rows
  (obj.generated?.instagram_reels || []).forEach((reel, i) => {
    rows.push({
      type: `ig_reel_${i + 1}`,
      title: reel.title || "",
      script: reel.script || "",
      hashtags: (reel.hashtags || []).join(" | "),
    });
  });

  // Social posts
  (obj.generated?.social_posts || []).forEach((post, i) => {
    rows.push({
      type: `social_post_${i + 1}`,
      platform: post.platform || "",
      post_type: post.type || "",
      caption: post.caption || "",
    });
  });

  // KPIs row
  rows.push({
    type: "kpis",
    ...Object.entries(obj.generated?.kpis || {}).reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {}),
  });

  return rows;
}

function toCsv(textRows) {
  // textRows: array of objects
  if (!textRows.length) return "";
  const keys = Array.from(
    new Set(textRows.flatMap((r) => Object.keys(r)))
  );
  const header = keys.join(",");
  const lines = textRows.map((row) =>
    keys
      .map((k) => {
        const cell = row[k] ?? "";
        if (typeof cell === "string") {
          // escape quotes
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return `"${String(cell)}"`;
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
}

export default function MarketingCampaignExporter({ initial = sampleData }) {
  const [data, setData] = useState(initial);
  const [userId, setUserId] = useState(initial.userId || randomUserId());
  const [prompt, setPrompt] = useState(initial.prompt || "");
  const [timeframe, setTimeframe] = useState(initial.timeframe || "monthly");
  const [copied, setCopied] = useState(false);

  function randomUserId() {
    return Math.random().toString(36).slice(2, 10);
  }

  const regenerateUserId = () => {
    const id = randomUserId();
    setUserId(id);
  };

  const handleApply = () => {
    // Simulate generating new campaign result (for demo we keep sample generated)
    setData((prev) => ({ ...prev, userId, prompt, timeframe }));
  };

  const rows = jsonToCsvRows(data);
  const csvText = toCsv(rows);

  const handleCopyCsv = async () => {
    try {
      await navigator.clipboard.writeText(csvText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
      alert("Copy failed — your browser may block clipboard access.");
    }
  };

  const handleDownloadCsv = () => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.campaignName || "campaign").replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="col-span-1 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Prompt & Config</h2>

          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <div className="flex gap-2 mb-3">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={regenerateUserId}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Random
            </button>
          </div>

          <label className="block text-sm font-medium text-gray-700">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full mb-3 px-3 py-2 border rounded-lg"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <label className="block text-sm font-medium text-gray-700">Prompt</label>
          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter user prompt..."
            className="w-full mb-3 px-3 py-2 border rounded-lg"
          />

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg shadow"
            >
              Apply
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Copy JSON
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-600">CSV Export</h3>
            <p className="text-xs text-gray-500 mb-2">Export the campaign data as CSV for sharing or analytics.</p>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadCsv}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Download CSV
              </button>
              <button
                onClick={handleCopyCsv}
                className={`px-4 py-2 rounded-lg border ${copied ? 'bg-green-100 border-green-400' : 'bg-white'}`}
              >
                {copied ? 'Copied ✓' : 'Copy CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Animated summary + CSV preview (span 2 cols) */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{data.campaignName}</h1>
                <p className="text-sm text-gray-600 mt-1">{data.objective}</p>
              </div>
              <div className="text-sm text-gray-500">
                <div>Timeframe: <strong>{data.timeframe}</strong></div>
                <div>User: <strong>{data.userId}</strong></div>
              </div>
            </div>

            {/* Animated cards row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl border hover:shadow-lg transition">
                <h4 className="text-sm font-semibold">Google Ads</h4>
                <p className="text-xs text-gray-500 mt-2">Ads count: {data.generated?.google_ads?.length || 0}</p>
                <p className="mt-2 text-sm">Budget: {data.generated?.google_ads?.[0]?.budget_monthly || '—'}</p>
              </div>

              <div className="p-4 rounded-xl border hover:shadow-lg transition">
                <h4 className="text-sm font-semibold">Instagram Reels</h4>
                <p className="text-xs text-gray-500 mt-2">Ideas: {data.generated?.instagram_reels?.length || 0}</p>
                <p className="mt-2 text-sm">Top hashtag: {data.generated?.hashtags?.primary?.[0] || '—'}</p>
              </div>

              <div className="p-4 rounded-xl border hover:shadow-lg transition">
                <h4 className="text-sm font-semibold">KPIs</h4>
                <p className="text-xs text-gray-500 mt-2">CTR: {data.generated?.kpis?.google_ads_ctr || '—'}</p>
                <p className="mt-2 text-sm">Conv rate: {data.generated?.kpis?.website_conversion_rate || '—'}</p>
              </div>
            </div>

            {/* CSV preview table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Key</th>
                    <th className="px-3 py-2 text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 align-top font-medium">{row.type}</td>
                      <td className="px-3 py-2 align-top">
                        {Object.keys(row).filter(k => k !== 'type').map((k) => (
                          <div key={k} className="text-xs text-gray-600">{k}</div>
                        ))}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {Object.entries(row).filter(([k]) => k !== 'type').map(([k, v]) => (
                          <div key={k} className="mb-2 text-sm">{String(v)}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>

      <footer className="max-w-6xl mx-auto mt-6 text-xs text-gray-500">
        Pro export generated from campaign data • Copy / Download CSV or Copy JSON for API usage.
      </footer>
    </div>
  );
}
