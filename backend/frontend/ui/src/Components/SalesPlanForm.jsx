// src/components/SalesPlanForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const SalesPlanForm = () => {
  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    currentStage: "new",
    painPoints: "",
    goals: "",
    timeframe: "1 month",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        ...form,
        painPoints: form.painPoints.split(",").map((p) => p.trim()),
        goals: form.goals.split(",").map((g) => g.trim()),
      };

      const { data } = await axios.post("http://localhost:5000/api/salesplan/generate", payload);
      setResult(data.data);
    } catch (err) {
      console.error(err);
      alert("Error generating plan. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-2xl border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">🧭 SalesGPT — Growth Plan Generator</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              placeholder="e.g. Glow & Shine Beauty Studio"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Business Type</label>
            <input
              type="text"
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              placeholder="e.g. Beauty / SaaS / Real Estate"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Current Stage</label>
            <select
              name="currentStage"
              value={form.currentStage}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
            >
              <option value="new">New</option>
              <option value="growing">Growing</option>
              <option value="stagnant">Stagnant</option>
              <option value="revamping">Revamping</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Timeframe</label>
            <select
              name="timeframe"
              value={form.timeframe}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
            >
              <option>1 month</option>
              <option>3 months</option>
              <option>6 months</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Pain Points</label>
          <textarea
            name="painPoints"
            value={form.painPoints}
            onChange={handleChange}
            placeholder="e.g. Low conversion, poor follow-up, low brand recall"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
            rows="2"
          ></textarea>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Goals</label>
          <textarea
            name="goals"
            value={form.goals}
            onChange={handleChange}
            placeholder="e.g. Double sales, expand to new market"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200"
            rows="2"
          ></textarea>
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Sales Plan"}
          </button>
        </div>
      </form>

      {/* RESULT */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Generated Sales Plan</h2>

          {result.strategies?.map((strategy, i) => (
            <div key={i} className="mb-8 border p-5 rounded-xl bg-gray-50">
              <h3 className="text-lg font-bold mb-2 text-blue-700 capitalize">
                {strategy.type} Strategy
              </h3>
              <p className="text-gray-600 mb-3">{strategy.description}</p>

              <table className="w-full border text-sm">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="border p-2 text-left">Stage</th>
                    <th className="border p-2 text-left">Goal</th>
                    <th className="border p-2 text-left">Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {strategy.funnel?.map((f, j) => (
                    <tr key={j}>
                      <td className="border p-2 font-medium">{f.stageName}</td>
                      <td className="border p-2">{f.goal}</td>
                      <td className="border p-2">
                        <ul className="list-disc list-inside">
                          {f.tasks?.map((t, k) => (
                            <li key={k}>
                              <span className="font-medium">{t.title}</span> —{" "}
                              <span className="text-gray-600">{t.status}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SalesPlanForm;
