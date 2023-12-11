import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';

const app = express();
const port = 7000;

// Konfigurasi koneksi ke Cloud SQL
const db = mysql.createConnection({
    host: '34.101.110.63',
    user: 'root',
    password: 'loginapi123',
    database: 'login_api',
});

// Mengecek koneksi ke database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database');
  }
});

// Menggunakan middleware bodyParser untuk mengakses req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint untuk menambahkan data pekerjaan ke database
app.post('/pekerjaan', (req, res) => {
  const { Job_name, Location, Description, Requirements, Salary, Company } = req.body;
  const insertQuery = `INSERT INTO pekerjaan (Job_name, Location, Description, Requirements, Salary, Company) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    insertQuery,
    [Job_name, Location, Description, Requirements, Salary, Company],
    (err, result) => {
      if (err) {
        console.error('Error adding job:', err);
        res.status(500).send('Terjadi kesalahan saat menambahkan data pekerjaan');
      } else {
        res.status(201).send('Data pekerjaan berhasil ditambahkan');
      }
    }
  );
});

// Endpoint untuk mendapatkan semua data pekerjaan
app.get('/pekerjaan', (req, res) => {
  const query = 'SELECT * FROM pekerjaan';

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

// Menjalankan server pada port tertentu
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
