import express from 'express';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.post("/users", (req, res) => {
  const {name, age, email, isAdmin} = req.body;
  res.send(`Hello ${name}, your are ${age}, your email address is ${email}, and you are ${isAdmin ? "an admin" : "not an admin"}`);
});

app.get("/message", (req, res) => {
  res.send("Trains are cool!");
});

app.post("/posts", (req, res) => {
  const {title, content, attachment, username} = req.body
  res.send(`${username} created post ${title}: ${content}
with image ${attachment}`)
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});