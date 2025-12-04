import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.MONGODB_NAME || "blataditz-retail";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    await client.connect();
    const db = client.db(dbName);
    const customers = db.collection("customers");

    const { username, email, password, first_name, last_name } = req.body;
    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await customers.findOne({ username });
    if (existingUser) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await customers.insertOne({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      created_at: new Date()
    });

    res.status(201).json({ message: "User registered", customerId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
