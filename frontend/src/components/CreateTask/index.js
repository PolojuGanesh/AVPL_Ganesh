import React, { useState } from "react";
import Navbar from "../Navbar";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./index.css";

export default function CreateTask() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
  });
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title required");
    setSaving(true);
    const token = Cookies.get("token");

    const payload = { ...form, createdBy: 1 };

    const res = await fetch("http://localhost:4000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      nav("/dashboard-user");
    } else {
      alert("Failed to create task");
    }
    setSaving(false);
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="card">
          <h2>Create Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
