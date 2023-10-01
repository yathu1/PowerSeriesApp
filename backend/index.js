import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
const port = 8800;

// Create a MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "power_series_task",
});
app.use(cors());
// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: ", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Create tables if they don't exist
db.query(
  "CREATE TABLE IF NOT EXISTS userInput (id INT AUTO_INCREMENT PRIMARY KEY, number INT)",
  (err) => {
    if (err) {
      console.error("Error creating userInput table: ", err);
    }
  }
);
db.query(
  "CREATE TABLE IF NOT EXISTS powerSeries (id INT AUTO_INCREMENT PRIMARY KEY, input_id INT, result TEXT, FOREIGN KEY (input_id) REFERENCES userInput(id))",
  (err) => {
    if (err) {
      console.error("Error creating powerSeries table: ", err);
    }
  }
);

app.use(express.json());

// Store input number and calculate the power series
app.post("/api/storeInput", (req, res) => {
  const { number } = req.body;
  if (number >= 1 && number <= 10) {
    // Calculate the power series
    const powerSeries = Array.from({ length: 10 }, (_, index) => {
      const power = index + 1;
      const result = BigInt(Math.pow(number, power)).toString(); // Convert to string
      return result;
    });

    // Store the input number and power series results as an array
    db.query("INSERT INTO userInput (number) VALUES (?)", [number], (err, result) => {
      if (err) {
        console.error("Error storing input number: ", err);
        res.sendStatus(500).send("Error storing input number");
      } else {
        const inputId = result.insertId;

        db.query(
          "INSERT INTO powerSeries (input_id, result) VALUES (?, ?)",
          [inputId, JSON.stringify(powerSeries)], // Store power series as JSON
          (err) => {
            if (err) {
              console.error("Error storing power series: ", err);
              res.sendStatus(500).send("Error storing power series");
            } else {
                res.status(200).send(inputId.toString());
            }
          }
        );
      }
    });
  } else {
    res.status(400).send("Number must be between 1 and 10");
  }
});

// Retrieve power series using an inputId
app.get("/api/calculatePowerSeries/:inputId", (req, res) => {
  const { inputId } = req.params;
  const query =
    "SELECT result FROM powerSeries WHERE input_id = ? ORDER BY id LIMIT 1";
  db.query(query, [inputId], (err, rows) => {
    if (err) {
      console.error("Error retrieving power series: ", err);
      res.status(500).send("Error retrieving power series");
    } else if (rows.length === 0) {
      res.status(400).send("No power series found for the input number");
    } else {
      const powerSeries = JSON.parse(rows[0].result); // Parse JSON to get the array
      res.json(powerSeries);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
