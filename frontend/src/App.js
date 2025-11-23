import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";

import Login from "./components/Login";
import Register from "./components/Register";
import DashboardUser from "./components/DashboardUser";
import DashboardAdmin from "./components/DashboardAdmin";
import CreateTask from "./components/CreateTask";
import EditTask from "./components/EditTask";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  const token = Cookies.get("token");
  const role = Cookies.get("role"); // user / admin

  return (
    <BrowserRouter>
      <Routes>
        {/* Default route Login */}
        <Route
          path="/"
          element={
            !token ? (
              <Login />
            ) : (
              <Navigate
                to={role === "admin" ? "/dashboard-admin" : "/dashboard-user"}
              />
            )
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            !token ? (
              <Login />
            ) : (
              <Navigate
                to={role === "admin" ? "/dashboard-admin" : "/dashboard-user"}
              />
            )
          }
        />

        {/* Register Page */}
        <Route path="/register" element={<Register />} />

        {/* User Dashboard */}
        <Route
          path="/dashboard-user"
          element={
            <ProtectedRoute>
              <DashboardUser />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/dashboard-admin"
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        {/* Create Task */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateTask />
            </ProtectedRoute>
          }
        />

        {/* Edit Task */}
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditTask />
            </ProtectedRoute>
          }
        />

        {/* All other paths redirect to Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
