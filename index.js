const express = require("express");
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

app.use(express.json());
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('dokterai REST API listen on port ${port}');
});

app.get("/", async (req, res) => {
    res.json({status:"Ready to roll!"});
});

app.get("/:user", async (req, res) => {
    const query = "SELECT * FROM users WHERE name = ?";
    console.log("")
    pool.query(query, [ req.params.user ], (error, result) => {
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

app.post("/register", async (req, res) => {
    const password = req.body.password;
    const email = req.body.email;
    const name = req.body.name;
    const encryptedPassword = await bcrypt.hash(password, saltRounds)

    const data = {
        "name": name,
        "email": email,
        "password": encryptedPassword,
    }
    const query = "INSERT INTO users SET ?";
    pool.query(query, data, (error) => {
        if(error) {
            res.json({status: "failure", reason: error.code});
        } else {
            res.json ({status: "success", data: data});
        }
    });
});

app.post("/history", async (req, res) => {
    const data = {
        "id": req.body.id,
        "symptoms": req.body.symptoms,
        "illness": req.body.illness,
        "accuracy": req.body.accuracy
    }
    const query = "INSERT INTO history SET ?";
    pool.query(query, data, (error) => {
        if(error) {
            res.json({status: "failure", reason: error.code});
        } else {
            res.json ({status: "success", data: data});
        }
    });
});

app.get("/history/:uid", async (req, res) => {
    const query = "SELECT TOP(10) * FROM history WHERE id=?  ORDER BY reg_date DESC";
    pool.query(query, [ req.params.uid ] , (error, result) => {
        if (!result[0]) {
            res.json({status:"Not Found!"});
        } else {
            res.json(result[0]);
        }
    });
});

