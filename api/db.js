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
  const [rows] = await pool.query(`
  SELECT users.*, locations.*, avatars.* FROM users
  INNER JOIN locations ON users.id = locations.userId
  INNER JOIN avatars ON users.id = avatars.userId
  `);

  const users = rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    profession: user.profession,
    location: {
      locationId: user.locationId,
      city: user.city,
      country: user.country,
    },
    avatar: {
      avatarId: user.avatarId,
      url: user.url,
    },
  }));
  return users;
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
  const avatarQuery = "INSERT INTO avatars (url, userId) VALUES (?, ?)";

  const [userResult] = await pool.query(userQuery, [
    user.name,
    user.email,
    user.age,
    user.profession,
  ]);
  const userId = userResult.insertId;

  const [locationResult] = await pool.query(locationQuery, [
    user.location.city,
    user.location.country,
    userId,
  ]);

  const [avatarResult] = await pool.query(avatarQuery, [
    user.avatar.url,
    userId,
  ]);

  const newUser = await getUser(userId);
  return newUser;
}

export async function updateUser(id, user) {
  const updateUserQuery = `
  UPDATE users
  SET name = ?, email = ?, age = ?, profession = ?
  WHERE id = ?
  `;
  const updateLocationQuery = `
  UPDATE locations
  SET city =?, country =?
  WHERE userId =?
  `;
  try {
    const [userUpdateResult] = await pool.query(updateUserQuery, [
      user.name,
      user.email,
      user.age,
      user.profession,
      id,
    ]);
    const [locationUpdateResult] = await pool.query(updateLocationQuery, [
      user.location.city,
      user.location.country,
      id,
    ]);
    return { userUpdateResult, locationUpdateResult };
  } catch (error) {
    console.error(error);
  }
}

export async function deleteUser(userId) {
  const deleteLocationQuery = `
    DELETE FROM locations WHERE userId = ?
  `;
  const deleteUserQuery = `
    DELETE FROM users WHERE id = ?
  `;
  try {
    await pool.query(deleteLocationQuery, [userId]);
    const [result] = await pool.query(deleteUserQuery, [userId]);
    return result;
  } catch (error) {
    console.error(error);
  }
}
