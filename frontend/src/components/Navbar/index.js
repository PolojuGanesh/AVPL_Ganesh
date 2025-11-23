import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";

export default function Navbar({ isAdmin = false }) {
  const navigate = useNavigate();

  function doLogout() {
    Cookies.remove("token");
    Cookies.remove("role");
    window.location.href = "/login";
  }

  return (
    <header
      className="nav card"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          to={isAdmin ? "/dashboard-admin" : "/dashboard-user"}
          className="brand"
        >
          Task Manager
        </Link>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link
          to={isAdmin ? "/dashboard-admin" : "/dashboard-user"}
          className="nav-link"
        >
          Dashboard
        </Link>
        <Link to="/create" className="nav-link">
          Create
        </Link>
        <button className="btn small" onClick={doLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
