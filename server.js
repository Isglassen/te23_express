import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home Page</title>
</head>
<body>
  <h1>Welcome to the Home Page!</h1>
  <p>This is the main page.</p>
  <a href="/about">About</a><br>
  <a href="/users">Users</a><br>
  <a href="/message">Message</a>
</body>
</html>`);
});

app.get("/about", (req, res) => {
  res.send("This is the about page");
});

app.get("/users", (req, res) => {
  res.send("This is the users page");
});

app.get("/message", (req, res) => {
  res.send("Trains are cool!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});