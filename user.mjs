// userRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './dbConfig.mjs';
import verifyToken from './authMiddleware.mjs';

const router = express.Router();

// Endpoint register untuk pengguna
router.post('/register', (req, res) => {
  const { email, password, username } = req.body;

  // Periksa apakah email sudah digunakan
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';

  db.query(checkEmailQuery, [email], (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (checkResults.length > 0) {
      // Email sudah digunakan
      return res.status(400).json({ error: 'Email has already been used' });
    }

    // Jika email belum digunakan, lakukan registrasi
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error(hashErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const registerQuery = 'INSERT INTO users (email, password, username) VALUES (?, ?, ?)';

      db.query(registerQuery, [email, hashedPassword, username], (registerErr, results) => {
        if (registerErr) {
          console.error(registerErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Registrasi berhasil
        res.json({ message: 'User registration successful' });
      });
    });
  });
});

// Endpoint login untuk pengguna
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (results.length > 0) {
        const user = results[0];

        // Memeriksa password dengan bcrypt
        bcrypt.compare(password, user.password, (bcryptErr, bcryptRes) => {
          if (bcryptErr) {
            console.error(bcryptErr);
            res.status(500).json({ error: 'Internal Server Error' });
          } else if (bcryptRes) {
            // Password cocok, menghasilkan token
            const token = jwt.sign({ id: user.id, email: user.email }, 'secret_key', {
              expiresIn: '30d',
            });

            // Menambahkan userId ke objek req untuk digunakan di endpoint lainnya
            req.userId = user.id;

            res.json({ token });
          } else {
            // Password tidak cocok
            res.status(401).json({ error: 'Invalid credentials' });
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    }
  });
});

// Endpoint untuk mendapatkan data pengguna berdasarkan token
router.get('/userinfo', verifyToken, (req, res) => {
    const userId = req.userId;

    const query = `SELECT id, email, username FROM users WHERE id = ?`;
  
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (results.length > 0) {
          const user = results[0];
          res.json(user);
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      }
    });
  });

export default router;
