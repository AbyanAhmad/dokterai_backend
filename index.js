const express = require("express");
const mysql = require("mysql");
const app = express();

app.use(express.json());
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('dokterai REST API listen on port ${port}');
});

app.get("/", async (req, res) => {
    res.json({status:"Ready to roll!"});
});

app.get("/:person", async (req, res) => {
    const query = "SELECT * FROM person WHERE name = ?";
    console.log("")
    pool.query(query, [ req.params.person ], (error, result) => {
        if (!result[0]) {
            res.json({status:"Not Found!"});
        } else {
            res.json(result[0]);
        }
    });
});

const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
}); 

app.post("/", async (req, res) => {
    const data = {
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender
    }
    const query = "INSERT INTO person VALUES (?, ?, ?)";
    pool.query(query, Object.values(data), (error) => {
        if(error) {
            res.json({status: "failure", reason: error.code});
        } else {
            res.json ({status: "success", data: data});
        }
    });
});
