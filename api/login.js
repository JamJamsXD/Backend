import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.MONGODB_NAME || "blataditz-retail";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    await client.connect();
    const db = client.db(dbName);
    const customers = db.collection("customers");

    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await customers.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
