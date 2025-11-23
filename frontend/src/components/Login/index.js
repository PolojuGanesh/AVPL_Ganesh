import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.jwtToken) {
        // store token in cookie (client-side)
        Cookies.set("token", json.jwtToken, { expires: 7 });

        // attempt to read role from token to route admin/user
        try {
          const payload = JSON.parse(atob(json.jwtToken.split(".")[1]));
          if (payload.role === "admin") return nav("/dashboard-admin");
        } catch (err) {
          /* ignore */
        }

        return nav("/dashboard-user");
      } else {
        setError(json.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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
          </div>
          <button className="btn" type="submit">
            Login
          </button>
        </form>
        <p style={{ marginTop: 12 }}>
          New user? <Link to="/register">Register</Link>
        </p>
        {error && (
          <p className="error" style={{ color: "#d32f2f" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
