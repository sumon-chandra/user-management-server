import express from "express";
import "dotenv/config";
import { createUser, getUsers } from "./db.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    // console.log(users);
    res.send(users);
  } catch (error) {
    res.status(500).send("Failed to get users");
    console.log("Failed to get users ", error);
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    console.log(user);
    const createdUser = await createUser(user);
    res.send(createdUser);
  } catch (error) {
    res.status(409).send("Failed to create user");
  }
});

app.get("/users/:id", async (req, res) => {
  const user = await getUsers(req.params.id);
  res.send(user);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
