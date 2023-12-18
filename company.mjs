// companyRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './dbConfig.mjs';
import verifyToken from './authMiddleware.mjs';

const router = express.Router();

// Endpoint register untuk perusahaan
router.post('/register', (req, res) => {
  const { company_email, password, company_name } = req.body;

  // Periksa apakah email sudah digunakan
  const checkEmailQuery = 'SELECT * FROM companies WHERE company_email = ?';

  db.query(checkEmailQuery, [company_email], (checkErr, checkResults) => {
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

      const registerQuery = 'INSERT INTO companies (company_name, password, company_email) VALUES (?, ?, ?)';

      db.query(registerQuery, [company_name, hashedPassword, company_email], (registerErr, results) => {
        if (registerErr) {
          console.error(registerErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Registrasi berhasil
        res.json({ message: 'Company registration successful' });
      });
    });
  });
});

// Endpoint login untuk perusahaan
router.post('/login', (req, res) => {
    const { company_email, password } = req.body;
  
    const query = `SELECT * FROM companies WHERE company_email = ?`;
  
    db.query(query, [company_email], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (results.length > 0) {
          const company = results[0];
  
          // Memeriksa password dengan bcrypt
          bcrypt.compare(password, company.password, (bcryptErr, bcryptRes) => {
            if (bcryptErr) {
              console.error(bcryptErr);
              res.status(500).json({ error: 'Internal Server Error' });
            } else if (bcryptRes) {
              // Password cocok, menghasilkan token
              const token = jwt.sign({ id: company.id, company_email: company.company_email, role: 'company' }, 'secret_key', {
                expiresIn: '1h',
              });
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
  

// Endpoint untuk mendapatkan data perusahaan berdasarkan token
router.get('/companyinfo', verifyToken, (req, res) => {
  const companyId = req.userId;

  const query = `SELECT id, company_email, company_name FROM companies WHERE id = ?`;

  db.query(query, [companyId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (results.length > 0) {
        const company = results[0];
        res.json(company);
      } else {
        res.status(404).json({ error: 'Company not found' });
      }
    }
  });
});

export default router;
