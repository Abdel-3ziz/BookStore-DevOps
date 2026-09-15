const http = require("http");

const PORT = process.env.PORT || 3000;
const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:8080";

async function getBooks() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/books`);

    if (!response.ok) {
      throw new Error("Backend error");
    }

    return await response.json();
  } catch (error) {
    return [];
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const server = http.createServer(async (req, res) => {

  if (req.url === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8"
    });

    return res.end(
      JSON.stringify({
        status: "ok",
        service: "frontend"
      })
    );
  }

  if (req.url === "/") {

    const books = await getBooks();

    const bookHtml = books.length
      ? books.map(book => `
          <div class="book">
            <h3>${escapeHtml(book.title)}</h3>
            <p class="author">
              Author: ${escapeHtml(book.author)}
            </p>
            <p class="price">
              $${escapeHtml(book.price)}
            </p>
          </div>
        `).join("")
      : `
          <div class="error">
            Backend is currently unavailable.
          </div>
        `;

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>BookStore</title>

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #f4f6f8;
      color: #222;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 50px 20px;
    }

    header {
      background: #ffffff;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    h1 {
      margin: 0 0 10px;
      font-size: 36px;
    }

    .subtitle {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .books {
      display: grid;
      gap: 15px;
    }

    .book {
      background: #ffffff;
      padding: 22px;
      border-radius: 10px;
      border: 1px solid #e1e5e9;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
    }

    .book h3 {
      margin: 0 0 10px;
      font-size: 22px;
    }

    .author {
      color: #666;
      margin: 8px 0;
    }

    .price {
      font-size: 20px;
      font-weight: bold;
      margin: 10px 0 0;
    }

    .error {
      background: #ffffff;
      padding: 20px;
      border-radius: 10px;
      color: #b00020;
      border: 1px solid #f0caca;
    }

  </style>

</head>

<body>

  <div class="container">

    <header>
      <h1>Online BookStore</h1>
      <p class="subtitle">
        Welcome to our bookstore
      </p>
    </header>

    <div class="books">
      ${bookHtml}
    </div>

  </div>

</body>

</html>
`;

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });

    return res.end(html);
  }

  res.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8"
  });

  res.end("Not Found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend running on port ${PORT}`);
});