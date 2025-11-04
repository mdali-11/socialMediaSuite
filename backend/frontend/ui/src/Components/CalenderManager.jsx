import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CalendarManager() {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    visualType: "",
    caption: "",
    hashtags: "",
    targetAudience: "",
  });

  // Fetch all calendars
  const fetchCalendars = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/calendar/user/6728b31f7c8d92f4e4f1e3a2");
      console.log("API Response:", res.data);

      const data = res.data?.data;
      if (Array.isArray(data)) {
        setCalendars(data);
      } else if (data) {
        setCalendars([data]);
      } else {
        setCalendars([]);
      }
    } catch (err) {
      console.error("Error fetching calendars:", err);
      setCalendars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Add new calendar
  const handleAdd = async () => {
    if (!form.visualType || !form.caption) {
      alert("Please fill required fields!");
      return;
    }

    try {
      await axios.post("/api/calendar/create", {
        ...form,
        hashtags: form.hashtags.split(",").map((t) => t.trim()),
      });
      setForm({ visualType: "", caption: "", hashtags: "", targetAudience: "" });
      fetchCalendars();
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  // Update calendar
  const handleUpdate = async () => {
    try {
      await axios.put(`/api/calendar/update/${editing._id}`, {
        ...form,
        hashtags: form.hashtags.split(",").map((t) => t.trim()),
      });
      setEditing(null);
      setForm({ visualType: "", caption: "", hashtags: "", targetAudience: "" });
      fetchCalendars();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Delete single record
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`/api/calendar/delete/${id}`);
      fetchCalendars();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Bulk delete selected
  const handleBulkDelete = async () => {
    if (!window.confirm("Delete selected items?")) return;
    try {
      await axios.post("/api/calendar/bulk-delete", { ids: selected });
      setSelected([]);
      fetchCalendars();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
  };

  // Select logic
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === calendars.length) setSelected([]);
    else setSelected(calendars.map((c) => c._id));
  };

  // When editing
  const startEdit = (item) => {
    setEditing(item);
    setForm({
      visualType: item.visualType || "",
      caption: item.caption || "",
      hashtags: (item.hashtags || []).join(", "),
      targetAudience: item.targetAudience || "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📅 Calendar Manager</h1>

      {/* Add / Edit Form */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded-lg p-3 w-full"
            placeholder="Visual Type"
            name="visualType"
            value={form.visualType}
            onChange={handleChange}
          />
          <input
            className="border rounded-lg p-3 w-full"
            placeholder="Caption"
            name="caption"
            value={form.caption}
            onChange={handleChange}
          />
          <input
            className="border rounded-lg p-3 w-full"
            placeholder="Hashtags (comma separated)"
            name="hashtags"
            value={form.hashtags}
            onChange={handleChange}
          />
          <input
            className="border rounded-lg p-3 w-full"
            placeholder="Target Audience"
            name="targetAudience"
            value={form.targetAudience}
            onChange={handleChange}
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setForm({
                    visualType: "",
                    caption: "",
                    hashtags: "",
                    targetAudience: "",
                  });
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Calendar
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">All Calendars</h2>
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
            >
              Delete Selected ({selected.length})
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center p-6 text-gray-500">Loading...</p>
        ) : calendars.length === 0 ? (
          <p className="text-center p-6 text-gray-500">No data found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">
                    <input
                      type="checkbox"
                      checked={
                        calendars.length > 0 &&
                        selected.length === calendars.length
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3">Visual Type</th>
                  <th className="p-3">Caption</th>
                  <th className="p-3">Hashtags</th>
                  <th className="p-3">Target Audience</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
<tbody>
  {Array.isArray(calendars) &&
    calendars.map((calendar) =>
      calendar.posts?.map((post, idx) => (
        <tr key={`${calendar._id}-${idx}`} className="border-b hover:bg-gray-50">
          {/* Checkbox */}
          <td className="p-3">
            <input
              type="checkbox"
              checked={selected.includes(`${calendar._id}-${idx}`)}
              onChange={() => toggleSelect(`${calendar._id}-${idx}`)}
            />
          </td>

          {/* Visual type */}
          <td className="p-3">
            {post.visuals?.[0]?.type || "N/A"}
          </td>

          {/* Caption (Full text + Copy button) */}
          <td className="p-3 relative">
            <div className="flex justify-between items-start">
              <span className="whitespace-pre-wrap break-words">{post.caption}</span>
              <button
                onClick={() => navigator.clipboard.writeText(post.caption || "")}
                title="Copy caption"
                className="text-gray-500 hover:text-blue-600 ml-2"
              >
                📋
              </button>
            </div>
          </td>

          {/* Hashtags (# format + Copy button) */}
          <td className="p-3 relative">
            {post.hashtags?.length ? (
              <div className="flex justify-between items-start">
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((tag, i) => (
                    <span key={i} className="text-blue-600">#{tag}</span>
                  ))}
                </div>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      post.hashtags.map((tag) => `#${tag}`).join(" ")
                    )
                  }
                  title="Copy all hashtags"
                  className="text-gray-500 hover:text-blue-600 ml-2"
                >
                  📋
                </button>
              </div>
            ) : (
              "N/A"
            )}
          </td>

          {/* Audience */}
          <td className="p-3">{post.audience || "N/A"}</td>

          {/* Actions */}
          <td className="p-3 text-right">
            <button
              onClick={() => startEdit(calendar._id, idx, post)}
              className="text-blue-600 hover:underline mr-3"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeletePost(calendar._id, idx)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </td>
        </tr>
      ))
    )}
</tbody>


            </table>
          </div>
        )}
      </div>
    </div>
  );
}
