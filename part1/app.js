const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 8080;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
});

app.get('/api/dogs', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
            FROM Dogs
            JOIN Users ON Dogs.owner_id = Users.user_id`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/walkrequests/open', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT WalkRequests.request_id, Dogs.name AS dog_name, WalkRequests.requested_time, WalkRequests.duration_minutes, WalkRequests.location, Users.username AS owner_username
            FROM WalkRequests
            JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
            JOIN Users ON Dogs.owner_id = Users.user_id
            WHERE WalkRequests.status = 'open'
            `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/walkers/summary', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT Users.username AS walker_username, COUNT(WalkRatings.rating) AS total_ratings, AVG(WalkRatings.rating) AS average_rating, COUNT(DISTINCT WalkRequests.request_id) AS completed_walks
            FROM Users
            LEFT JOIN WalkRatings ON Users.user_id = WalkRatings.walker_id
            LEFT JOIN WalkRequests ON Users.user_id = WalkRequests.request_id AND WalkRequests.status = 'completed'
            WHERE Users.role = 'walker'
            GROUP BY Users.user_id
            `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server runing at http://localhost:${port}`);
});
