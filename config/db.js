const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.RDS_HOST || process.env.DB_HOST || "127.0.0.1",
  user: process.env.RDS_USER || process.env.DB_USER || "admin",
  password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD || "g6qGCyyqbeY8iv:P7.z0U.)yJQ[G",
  database: process.env.RDS_DATABASE || process.env.DB_NAME || "mysql",
  port: Number(process.env.RDS_PORT || process.env.DB_PORT || 3306),
});

connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to RDS MySQL");
  }
});

module.exports = connection;
