import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Konfigurasi database
const db = mysql.createConnection({
  host: '34.101.110.63',
  user: 'root',
  password: 'loginapi123',
  database: 'login_api',
});

// Middleware untuk verifikasi token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Failed to authenticate token' });
    }

    req.userId = decoded.id;
    next();
  });
}

// Endpoint register untuk pengguna
app.post('/register', (req, res) => {
  const { email, password, username } = req.body;

  // Hashing password menggunakan bcrypt
  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error(hashErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const query = 'INSERT INTO users (email, password, username) VALUES (?, ?, ?)';

    db.query(query, [email, hashedPassword, username], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Registrasi berhasil
      res.json({ message: 'User registration successful' });
    });
  });
});

// Endpoint login untuk pengguna
app.post('/login', (req, res) => {
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

// Endpoint untuk mendapatkan data pengguna berdasarkan token
app.get('/user', verifyToken, (req, res) => {
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

// Endpoint register untuk perusahaan
app.post('/company/register', (req, res) => {
  const { company_email, password, company_name } = req.body;

  // Hashing password menggunakan bcrypt
  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error(hashErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const query = 'INSERT INTO companies (company_name, password, company_email) VALUES (?, ?, ?)';

    db.query(query, [company_name, hashedPassword, company_email], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Registrasi berhasil
      res.json({ message: 'Company registration successful' });
    });
  });
});

// Endpoint login untuk perusahaan
app.post('/company/login', (req, res) => {
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
app.get('/company', verifyToken, (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
