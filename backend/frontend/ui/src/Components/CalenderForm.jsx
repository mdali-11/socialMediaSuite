import React, { useState } from "react";

export const CalendarForm = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || {
      visualType: "",
      caption: "",
      hashtags: [],
      targetAudience: "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      hashtags:
        typeof formData.hashtags === "string"
          ? formData.hashtags.split(",").map((x) => x.trim())
          : formData.hashtags,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Edit Calendar Entry" : "Add New Calendar"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="visualType"
            placeholder="Visual Type (image/video/carousel)"
            value={formData.visualType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <textarea
            name="caption"
            placeholder="Caption"
            value={formData.caption}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="hashtags"
            placeholder="Hashtags (comma-separated)"
            value={formData.hashtags}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="targetAudience"
            placeholder="Target Audience"
            value={formData.targetAudience}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
