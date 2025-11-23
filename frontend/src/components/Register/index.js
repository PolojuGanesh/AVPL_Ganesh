import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        nav("/");
      } else {
        setError(json.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <input
              type="mail"
              placeholder="example@gmail.com"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="btn" type="submit">
            Create account
          </button>
        </form>
        {error && (
          <p className="error" style={{ color: "#d32f2f" }}>
            {error}
          </p>
        )}
        <p style={{ marginTop: 10 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
