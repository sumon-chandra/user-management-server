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

export async function getUsers({ name, email }) {
  console.log({ name, email });
  let sqlQuery = `
  SELECT users.*, locations.locationId AS locationId, locations.city, locations.country, avatars.avatarId AS avatarId, avatars.url FROM users
  LEFT JOIN locations ON users.id = locations.userId
  LEFT JOIN avatars ON users.id = avatars.userId
  `;

  const searchQuery = [];
  const conditions = [];

  if (name !== "null") {
    conditions.push(`users.name LIKE ?`);
    searchQuery.push(`%${name}%`);
  }

  if (email !== "null") {
    conditions.push(`users.email LIKE ?`);
    searchQuery.push(`%${email}%`);
  }

  if (conditions.length > 0) {
    sqlQuery += `WHERE ${conditions.join(" AND ")}`;
  }

  const [rows] = await pool.query(sqlQuery, searchQuery);

  const users = rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    profession: user.profession,
    location: user.locationId
      ? {
          locationId: user.locationId,
          city: user.city,
          country: user.country,
        }
      : null,
    avatar: user.avatarId
      ? {
          avatarId: user.avatarId,
          url: user.url,
        }
      : null,
  }));

  // console.log(users);
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

  const upsertLocationQuery = `
  INSERT INTO locations (userId, city, country)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE
  city = VALUES(city),
  country = VALUES(country)
  `;

  const upsertAvatarQuery = `
  INSERT INTO avatars (userId, url)
  VALUES (?, ?)
  ON DUPLICATE KEY UPDATE
  url = VALUES(url)
  `;

  try {
    const [userUpdateResult] = await pool.query(updateUserQuery, [
      user.name,
      user.email,
      user.age,
      user.profession,
      id,
    ]);

    const [locationUpdateResult] = await pool.query(upsertLocationQuery, [
      id,
      user.location?.city || null,
      user.location?.country || null,
    ]);

    const [avatarUpdateResult] = await pool.query(upsertAvatarQuery, [
      id,
      user.avatar?.url || null,
    ]);
    return { userUpdateResult, locationUpdateResult, avatarUpdateResult };
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
  const deleteAvatarQuery = `
    DELETE FROM avatars WHERE userId = ?
  `;
  try {
    await pool.query(deleteLocationQuery, [userId]);
    await pool.query(deleteAvatarQuery, [userId]);
    const [result] = await pool.query(deleteUserQuery, [userId]);
    return result;
  } catch (error) {
    console.error(error);
  }
}
