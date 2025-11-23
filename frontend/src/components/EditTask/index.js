import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
import "./index.css";

export default function EditTask() {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const token = Cookies.get("token");
      const res = await fetch(`http://localhost:4000/api/tasks/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.ok) {
        const json = await res.json();
        const task = json.task || json;
        setForm({
          title: task.title || "",
          description: task.description || "",
          status: task.status || "pending",
        });
      } else {
        alert("Failed to load task");
      }
      setLoading(false);
    })();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = Cookies.get("token");
    const res = await fetch(`http://localhost:4000/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      nav("/dashboard-user");
    } else {
      alert("Failed to update");
    }
  }

  if (loading) return <p className="container">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="card">
          <h2>Edit Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
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
            <button className="btn" type="submit">
              Save
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
