import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.MONGODB_NAME || "blataditz-retail";

function authenticateToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  await client.connect();
  const db = client.db(dbName);
  const customers = db.collection("customers");

  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    const { username, email } = req.query;
    let filter = {};
    if (username) filter.username = username;
    if (email) filter.email = email;

    const result = await customers.find(filter).toArray();
    return res.status(200).json({ data: result, count: result.length });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
