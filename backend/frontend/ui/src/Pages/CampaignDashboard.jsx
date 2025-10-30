import React from "react";

// RefillRevolution_Campaign_UI.jsx
// Default export: CampaignDashboard component
// Usage:
// <CampaignDashboard data={campaignData} />
// Where campaignData is the JSON object you provided.

export default function CampaignDashboard({ data }) {
  const d = data?.data || data || {};
  const gen = d.generated || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">{gen.campaign_name || d.campaignName || "Campaign"}</h1>
            <p className="mt-1 text-sm text-gray-500">{gen.objective || d.objective}</p>
          </div>
          <div className="text-sm text-right">
            <div className="text-gray-600">Timeframe</div>
            <div className="mt-1 font-medium">{d.timeframe || "monthly"}</div>
          </div>
        </header>

        {/* Top KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card title="Website traffic (monthly)" value={gen.kpis?.website_traffic_monthly || "—"} />
          <Card title="Initial sales (3 months)" value={gen.kpis?.initial_sales || "—"} />
          <Card title="Conversion rate" value={gen.kpis?.website_conversion_rate || "—"} small />
        </section>

        {/* Two column layout: Left - Details, Right - Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            <Panel title="Core Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Objective" value={gen.objective || d.objective} />
                <InfoRow label="Channels" value={(d.channels || gen.channels || []).join(", ")} />
                <InfoRow label="Created At" value={d.createdAt || "—"} />
                <InfoRow label="User ID" value={d.userId || d.userId || "—"} />
              </div>
            </Panel>

            <Panel title="Google Ads (Search Ad samples)">
              {(gen.google_ads || []).map((ad, i) => (
                <div key={i} className="mb-4">
                  <h4 className="font-semibold">Ad #{i + 1}</h4>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Headlines</div>
                      <ul className="mt-1 list-disc pl-5 text-sm">
                        {(ad.headlines || []).map((h, idx) => (
                          <li key={idx}>{h}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Descriptions</div>
                      <ul className="mt-1 list-disc pl-5 text-sm">
                        {(ad.descriptions || []).map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Keywords & Budget</div>
                      <div className="mt-1 text-sm">
                        <div className="mb-2">
                          <strong>Budget (monthly):</strong> {ad.budget_monthly}
                        </div>
                        <div>
                          <strong>Keywords:</strong>
                          <ul className="mt-1 list-disc pl-5 text-sm max-h-40 overflow-auto">
                            {(ad.keywords || []).map((k, idx) => (
                              <li key={idx}>{k}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Panel>

            <Panel title="Instagram Reels & Creative Ideas">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(gen.instagram_reels || []).map((r, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-md bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{r.title}</h4>
                      <div className="text-xs text-gray-400">#{i + 1}</div>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{r.script}</p>
                    <div className="mt-3">
                      <div className="text-xs text-gray-500">Hashtags</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(r.hashtags || []).map((t, idx) => (
                          <Tag key={idx} text={t} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Social Posts & Content Calendar Preview">
              <div className="overflow-x-auto bg-white rounded-md border border-gray-100 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Platform</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Caption (preview)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Visual idea</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(gen.social_posts || []).map((p, i) => (
                      <tr key={i} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{p.platform}</td>
                        <td className="px-4 py-3 text-sm">{p.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xl">{p.caption}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.visual_idea}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* Right: Quick Metadata + Hashtags + KPIs */}
          <aside className="space-y-6">
            <Panel title="Quick Metadata">
              <div className="space-y-3">
                <SmallInfo label="Campaign ID" value={d._id || "—"} />
                <SmallInfo label="User ID" value={d.userId || d.data?.userId || "—"} />
                <SmallInfo label="Created" value={d.createdAt || "—"} />
                <SmallInfo label="Objective (short)" value={(gen.objective || d.objective || "—").slice(0, 80) + ((gen.objective || d.objective || "").length > 80 ? "..." : "")} />
              </div>
            </Panel>

            <Panel title="Hashtags">
              <div className="flex flex-col gap-3">
                {Object.entries(gen.hashtags || {}).map(([key, list]) => (
                  <div key={key}>
                    <div className="text-xs text-gray-500 capitalize">{key}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(list || []).map((t, i) => <Tag key={i} text={t} />)}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="KPIs & Targets">
              <div className="space-y-2">
                {Object.entries(gen.kpis || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <div className="text-gray-600 capitalize">{formatKey(k)}</div>
                    <div className="font-medium">{v}</div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Channels & Quick Actions">
              <div className="flex flex-col gap-3">
                {(d.channels || []).map((c, i) => (
                  <button key={i} className="w-full text-left px-3 py-2 bg-white border border-gray-100 rounded-md shadow-sm hover:shadow">{c}</button>
                ))}
                <a href="#" className="block text-center mt-2 text-sm text-white bg-blue-600 px-3 py-2 rounded-md">Export as CSV</a>
              </div>
            </Panel>
          </aside>
        </div>

        {/* Footer / Notes */}
        <footer className="mt-8 text-sm text-gray-500">
          <div>Tip: pass the full JSON into this component as the <code>data</code> prop. The UI is responsive and built with Tailwind CSS.</div>
        </footer>
      </div>
    </div>
  );
}


/* ---------- Helper components ---------- */
function Card({ title, value, small }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs text-gray-500">{title}</div>
      <div className={`mt-2 text-lg md:text-2xl font-semibold ${small ? 'text-base' : ''}`}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-md">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function SmallInfo({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function Tag({ text }) {
  return (
    <span className="text-xs px-2 py-1 border rounded-full bg-gray-100 text-gray-700">{text}</span>
  );
}

function formatKey(k) {
  return k.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
}
