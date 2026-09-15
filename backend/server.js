const http = require("http");
const { Pool } = require("pg");

const PORT = process.env.PORT || 8080;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "bookstore",
  user: process.env.DB_USER || "bookstore_user",
  password: process.env.DB_PASSWORD || "bookstore_pass"
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL
    );
  `);

  const result = await pool.query(
    "SELECT COUNT(*) FROM books"
  );

  if (parseInt(result.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO books (title, author, price)
      VALUES
        ('Clean Code', 'Robert C. Martin', 35),
        ('The DevOps Handbook', 'Gene Kim', 45),
        ('Kubernetes Up & Running', 'Kelsey Hightower', 40)
    `);

    console.log("Database seeded.");
  }
}

async function checkDatabase() {
  await pool.query("SELECT 1");
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {

  if (req.url === "/health") {
    return sendJSON(res, 200, {
      status: "ok",
      service: "backend"
    });
  }

  if (req.url === "/ready") {
    try {
      await checkDatabase();

      return sendJSON(res, 200, {
        status: "ready",
        database: "connected"
      });

    } catch (error) {
      return sendJSON(res, 503, {
        status: "not ready",
        database: "unavailable"
      });
    }
  }

  if (
    req.url === "/api/books" &&
    req.method === "GET"
  ) {
    try {
      const result = await pool.query(`
        SELECT id, title, author, price
        FROM books
        ORDER BY id
      `);

      return sendJSON(res, 200, result.rows);

    } catch (error) {
      console.error(error);

      return sendJSON(res, 500, {
        error: "Database error"
      });
    }
  }

  if (
    req.url === "/api/info" &&
    req.method === "GET"
  ) {
    return sendJSON(res, 200, {
      service: "bookstore-backend",
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME
      }
    });
  }

  return sendJSON(res, 404, {
    error: "Not Found"
  });
});

async function start() {
  const maxRetries = 10;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await initializeDatabase();

      server.listen(PORT, "0.0.0.0", () => {
        console.log(`Backend running on port ${PORT}`);
      });

      return;

    } catch (error) {
      console.log(
        `Database not ready. Attempt ${attempt}/${maxRetries}`
      );

      if (attempt === maxRetries) {
        console.error("Failed to initialize database:", error);
        process.exit(1);
      }

      await new Promise(resolve =>
        setTimeout(resolve, 3000)
      );
    }
  }
}

start();