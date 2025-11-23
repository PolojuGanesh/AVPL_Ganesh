import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import "./index.css";

export default function DashboardAdmin() {
  const [tasks, setTasks] = useState([]);

  async function load() {
    const token = Cookies.get("token");
    const res = await fetch("http://localhost:4000/api/tasks", {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    const json = await res.json();
    setTasks(json);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete task?")) return;
    const token = Cookies.get("token");
    await fetch(`http://localhost:4000/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    load();
  }

  return (
    <>
      <Navbar isAdmin={true} />
      <div className="container">
        <h2>Admin — All Tasks</h2>
        <div className="grid">
          {tasks.length === 0 && <p>No tasks</p>}
          {tasks.map((t) => (
            <div key={t.id} className="card">
              <h3>{t.title}</h3>
              <p className="muted">{t.description}</p>
              <p>CreatedBy: {t.createdBy}</p>
              <p>
                Status: <strong>{t.status}</strong>
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Link to={`/edit/${t.id}`} className="btn">
                  Edit
                </Link>
                <button className="btn" onClick={() => handleDelete(t.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
