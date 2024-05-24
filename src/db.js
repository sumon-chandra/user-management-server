import mysql from "mysql2";
import "dotenv/config";

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function getUsers() {
  const [rows] = await pool.query(`SELECT * FROM users`);
  return rows;
}

export async function getUser(id) {
  const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
  return rows[0];
}

export async function createUser(user) {
  const userQuery =
    "INSERT INTO users (name, email, age, profession) VALUES (?,?,?,?)";
  const locationQuery =
    "INSERT INTO locations (city, country, userId) VALUES (?, ?, ?)";

  const [userResult] = await pool.query(userQuery, [
    user.name,
    user.email,
    user.age,
    user.profession,
  ]);
  const userId = userResult.insertId;

  const [locationResult] = await pool.query(locationQuery, [
    user.city,
    user.country,
    userId,
  ]);
  const createdUser = { ...userResult, locationResult };
  console.log(createdUser);
  const newUser = await getUser(createUser.id);
  return newUser;
}
// const newUser = {
//   name: "Sayem",
//   email: "sayem@gmail.com",
//   age: 30,
//   profession: "Student",
//   city: "Dhaka",
//   country: "Bangladesh",
// };
// const user = await createUser(newUser);
// console.log(user);

export async function updateUser(user, id) {
  const columns = Object.keys(user);
  const values = Object.values(user);
  const setClause = columns.map((column) => `${column} = ?`).join(", ");
  values.push(id);

  const query = `
  UPDATE users
  SET ${setClause}
  WHERE id = ?
  `;

  try {
    const [result] = await pool.query(query, values);
    return result;
  } catch (error) {
    console.error(error);
  }
}

// const newUser = {
//   name: "Topu",
//   email: "topu@gmail.com",
//   age: 20,
//   profession: "developer",
// };

// const updatedUser = await updateUser(newUser, 7);
// console.log(updatedUser);

export async function deleteUser(id) {
  const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
  console.log(result);
}

// const deletedUser = await deleteUser(1);
// console.log(deletedUser);