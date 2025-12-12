import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { readDb, writeDb } from "../../database/database.js";

const JWT_SECRET = "supersecretkey";

export default {
  async register({ username, password, profilePicture }) {
    // TODO: get ahold of the db using readDb();
    const db = await readDb();

    const existingUser = db.users.find((u) => u.username === username);

    // TODO: check if there is an existing user with the same username
    if ( existingUser ) {
      const err = new Error("Username already taken");
      err.statusCode = 400;
      throw err;
    }

    const newUser = {
      id: crypto.randomUUID(),
      username,
      password,
      profilePicture: profilePicture || "",
    };

    db.users.push(newUser);

    await writeDb(db);
    
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

    // TODO: if there is, do the following:
    //       - construct a new Error("Username already taken");
    //       - set the statusCode of that error object to 400
    //       - throw the err
    // TODO: otherwise, create a user object. A user has:
    //       - id: a random string-based id (crypto.randomUUID())
    //       - username: a username
    //       - password: a password
    //       - profilePicture: their profile pic string or an empty string if no picture.
    // TODO:  push this user object into db.users
    // TODO:  call the writeDb(db) operation to save changes.

    // TODO:  return the user object but without their password  (only id, username, profilePicture)

  async login({ username, password }) {
    // TODO: get ahold of the db using readDb();
    const db = await readDb();

    console.log("Attempting login with:", { username, password });
    console.log("Database contains:", JSON.stringify(db.users, null, 2));

    // TODO: check the database for a user with a matching username and password
    const user = db.users.find((u) => u.username === username && u.password === password);

    console.log("Found user:", user);

    // TODO: if there is no user:
    //       - construct a new Error("Invalid username or password");
    if (!user) {
      const err = new Error("Invalid username or password");
      err.statusCode = 401;
      throw err;
    }
    //       - set the statusCode of that error object to 401
    //       - throw the err
    // TODO: otherwise, create a login token. I'll help you out with this one:
    const token = jwt.sign(
      { userId: user.id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    );
    // TODO:  return an object that contains 2 things:
    //  - token
    //  - user : { id: user.id, username: user.username, profilePicture: user.profilePicture }

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    };
  },
  verify(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded; 
    } catch (err) {
      return false;
    }
  }
};
