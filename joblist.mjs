import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import db from './dbConfig.mjs';
import multer from 'multer';

const router = express.Router();

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to add job data to the database with image upload
router.post('/pekerjaan', upload.single('job_image'), (req, res) => {
  const { Job_name, Location, Description, Requirements, Salary, Company } = req.body;
  const jobImage = req.file ? req.file.buffer : null;

  const insertQuery = `
    INSERT INTO pekerjaan (Job_name, Location, Description, Requirements, Salary, Company, job_image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertQuery,
    [Job_name, Location, Description, Requirements, Salary, Company, jobImage],
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


// Endpoint untuk mendapatkan data pekerjaan berdasarkan ID
router.get('/pekerjaan/:id', (req, res) => {
  const jobId = req.params.id;
  const query = 'SELECT * FROM pekerjaan WHERE id = ?';

  db.query(query, [jobId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // Check if any results are returned
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).json({ error: 'Data pekerjaan tidak ditemukan' });
      }
    }
  });
});


router.put('/pekerjaan/:id', upload.single('job_image'), (req, res) => {
  const jobId = req.params.id;
  const { Job_name, Location, Description, Requirements, Salary, Company } = req.body;
  const jobImage = req.file ? req.file.buffer : null;

  const updateQuery = `
    UPDATE pekerjaan
    SET Job_name = ?, Location = ?, Description = ?, Requirements = ?, Salary = ?, Company = ?, job_image = ?
    WHERE id = ?
  `;

  db.query(
    updateQuery,
    [Job_name, Location, Description, Requirements, Salary, Company, jobImage, jobId],
    (err, result) => {
      if (err) {
        console.error('Error updating job:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        // Check if any row is updated (affected rows > 0)
        if (result.affectedRows > 0) {
          res.json({ message: 'Data pekerjaan berhasil diperbarui' });
        } else {
          res.status(404).json({ error: 'Data pekerjaan tidak ditemukan' });
        }
      }
    }
  );
});


// Endpoint untuk menghapus data pekerjaan dari database berdasarkan ID
router.delete('/pekerjaan/:id', (req, res) => {
  const jobId = req.params.id;
  const deleteQuery = 'DELETE FROM pekerjaan WHERE id = ?';

  db.query(deleteQuery, [jobId], (err, result) => {
    if (err) {
      console.error('Error deleting job:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // Periksa apakah ada baris yang terhapus (affected rows > 0)
      if (result.affectedRows > 0) {
        res.json({ message: 'Data pekerjaan berhasil dihapus' });
      } else {
        res.status(404).json({ error: 'Data pekerjaan tidak ditemukan' });
      }
    }
  });
});

export default router;