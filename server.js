const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'hotel_management'
});

app.get('/hotels', async (req, res) => {
  const { name, city, state } = req.query;

  let sql = 'SELECT * FROM hotels WHERE 1=1';
  const queryParams = [];

  if (name) {
    sql += ' AND name LIKE ?';
    queryParams.push(`%${name}%`);
  }
  if (city) {
    sql += ' AND city LIKE ?';
    queryParams.push(`%${city}%`);
  }
  if (state) {
    sql += ' AND state LIKE ?';
    queryParams.push(`%${state}%`);
  }

  try {
    const [rows] = await db.query(sql, queryParams);
    if (rows.length === 0) {
      return res.status(200).json([]);
    }
    res.json(rows);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ message: 'An error occurred while fetching hotels.' });
  }
});

app.post('/hotels', async (req, res) => {
  const { name, address, city, state, phone } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM hotels WHERE address = ? AND city = ? AND state = ?',
      [address, city, state]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: 'This address, city, and state combination already exists.' });
    }

    const [result] = await db.query(
      'INSERT INTO hotels (name, address, city, state, phone) VALUES (?, ?, ?, ?, ?)',
      [name, address, city, state, phone]
    );

    res.status(201).json({ hotelId: result.insertId });
  } catch (error) {
    console.error('Error adding hotel:', error);
    res.status(500).json({ message: 'An error occurred while adding the hotel.' });
  }
});

app.put('/hotels/:id', async (req, res) => {
  const { id } = req.params;
  const { name, address, city, state, phone } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM hotels WHERE address = ? AND city = ? AND state = ? AND id != ?',
      [address, city, state, id]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: 'This address, city, and state combination already exists.' });
    }

    await db.query(
      'UPDATE hotels SET name = ?, address = ?, city = ?, state = ?, phone = ? WHERE id = ?',
      [name, address, city, state, phone, id]
    );

    res.status(200).json({ message: 'Hotel updated successfully.' });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ message: 'An error occurred while updating the hotel.' });
  }
});

app.delete('/hotels/:id', async (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM hotels WHERE id = ?';
  
  try {
    const [result] = await db.execute(query, [id]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Hotel deleted successfully' });
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (err) {
    console.error('Error deleting hotel:', err);
    res.status(500).json({ message: 'An error occurred while deleting the hotel.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
