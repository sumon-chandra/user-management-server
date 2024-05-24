import express from "express";
import "dotenv/config";
import { getUsers } from "./db.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.get("/users", async (req, res) => {
  const users = await getUsers();
  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  const user = await getUsers(req.params.id);
  res.send(user);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
