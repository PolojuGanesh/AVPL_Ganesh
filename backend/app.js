const express = require("express");
const cors = require("cors");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { log } = require("console");

// app config
const app = express();
const port = 4000;

// middleware
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "database.db");

let db = null;

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(`Error message ${error.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

// register api
app.post("/api/register", async (request, response) => {
  const { username, password, role } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const checkUserQuery = `SELECT * FROM users WHERE username LIKE '${username}';`;
  const userQueryResponse = await db.get(checkUserQuery);

  if (userQueryResponse === undefined) {
    const userInsertQuery = `
        INSERT INTO users
        (username, password, role)
        VALUES (
            '${username}',
            '${hashedPassword}',
            '${role}'
        );
    `;
    await db.run(userInsertQuery);
    const payload = { username: username };
    const jwtToken = jwt.sign(payload, "My_Token");
    response.send({
      jwtToken: jwtToken,
      message: "User registered successfully",
    });
  } else {
    response.status(400);
    response.send({ message: "User already exists!" });
  }
});

// login api
app.post("/api/login", async (request, response) => {
  const { username, password } = request.body;
  const isUserExistsQuery = `SELECT * FROM users WHERE username LIKE '${username}';`;
  const userExistsResponse = await db.get(isUserExistsQuery);

  if (userExistsResponse === undefined) {
    response.status(400);
    response.send({ message: "Invalid User" });
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      userExistsResponse.password
    );
    if (isPasswordMatched) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "My_Token");
      response.send({
        jwtToken: jwtToken,
        message: "Login successfull!",
      });
    } else {
      response.status(400);
      response.send({ message: "Invalid password!" });
    }
  }
});

// Middleware to authenticate JWT Token
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers["authorization"];
  let jwtToken;

  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    return response.status(401).send({ message: "Missing Token" });
  } else {
    jwt.verify(jwtToken, "My_Token", (error, payload) => {
      if (error) {
        return response.status(401).send({ message: "Invalid Token" });
      }
      request.username = payload.username;
      next();
    });
  }
};

// Get logged-in user profile
app.get("/api/me", authenticateToken, async (request, response) => {
  const getUserQuery = `SELECT id, username, role FROM users WHERE username = ?`;
  const user = await db.get(getUserQuery, [request.username]);

  if (!user) {
    return response.status(404).send({ message: "User not found" });
  }

  response.send(user);
});

// add task
app.post("/api/tasks", authenticateToken, async (request, response) => {
  try {
    const { username } = request;
    const { title, description, status } = request.body;

    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [
      username,
    ]);

    if (!title) {
      return response.status(400).send({ message: "Title is required" });
    }

    const createTaskQuery = `
      INSERT INTO tasks (title, description, status, createdBy, createdAt)
      VALUES (?, ?, ?, ?, datetime('now'));
    `;

    const result = await db.run(createTaskQuery, [
      title,
      description || "",
      status || "pending",
      user.id,
    ]);

    response.send({
      message: "Task created successfully",
      taskId: result.lastID,
    });
  } catch (error) {
    response.status(500).send({ message: "Server Error" });
  }
});

// get tasks
app.get("/api/tasks", authenticateToken, async (request, response) => {
  try {
    const { username } = request;

    const userQuery = `
      SELECT * FROM users WHERE username = ?;
    `;
    const user = await db.get(userQuery, [username]);

    if (!user) {
      return response.status(401).send({ message: "Unauthorized" });
    }

    let getTasksQuery;

    if (user.role === "admin") {
      getTasksQuery = `SELECT * FROM tasks ORDER BY datetime(createdAt) DESC;`;
    } else {
      getTasksQuery = `
        SELECT * 
        FROM tasks 
        WHERE createdBy = ? 
        ORDER BY datetime(createdAt) DESC;
      `;
    }

    const tasks =
      user.role === "admin"
        ? await db.all(getTasksQuery)
        : await db.all(getTasksQuery, [user.id]);

    response.send(tasks);
  } catch (error) {
    response.status(500).send({ message: "Server Error" });
  }
});

// get specific task
app.get("/api/tasks/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const getTaskQuery = `SELECT * FROM tasks WHERE id = ?;`;
    const task = await db.get(getTaskQuery, [id]);

    if (!task) {
      return response.status(404).send({ message: "Task not found" });
    }

    response.send(task);
  } catch (error) {
    response.status(500).send({ message: "Server Error" });
  }
});

// edit specific task
app.put("/api/tasks/:id", authenticateToken, async (request, response) => {
  try {
    const { username } = request;
    const { id } = request.params;
    const { title, description, status } = request.body;

    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [
      username,
    ]);
    const task = await db.get(`SELECT * FROM tasks WHERE id = ?`, [id]);

    if (!task) {
      return response.status(404).send({ message: "Task not found" });
    }

    if (task.createdBy !== user.id && user.role !== "admin") {
      return response.status(403).send({ message: "Not authorized" });
    }

    await db.run(
      `UPDATE tasks SET title=?, description=?, status=? WHERE id=?`,
      [title, description, status, id]
    );

    response.send({ message: "Task updated successfully" });
  } catch (error) {
    response.status(500).send({ message: "Server Error" });
  }
});

// delete specific task
app.delete("/api/tasks/:id", authenticateToken, async (request, response) => {
  try {
    const { username } = request;
    const { id } = request.params;

    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [
      username,
    ]);
    const task = await db.get(`SELECT * FROM tasks WHERE id = ?`, [id]);

    if (!task) {
      return response.status(404).send({ message: "Task not found" });
    }

    if (task.createdBy !== user.id && user.role !== "admin") {
      return response.status(403).send({ message: "Not authorized" });
    }

    await db.run(`DELETE FROM tasks WHERE id = ?`, [id]);

    response.send({ message: "Task deleted successfully" });
  } catch (error) {
    response.status(500).send({ message: "Server Error" });
  }
});

module.exports = app;
