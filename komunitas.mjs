// Import module yang dibutuhkan
import express from 'express';
import multer from 'multer';
import db from './dbConfig.mjs';
import verifyToken from './authMiddleware.mjs';
import profilRouter from './profil.mjs'; // Import profil router

// Inisialisasi router Express
const router = express.Router();

// Konfigurasi Multer untuk mengelola pengunggahan file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint untuk menambah atau memperbarui data postingan
router.post('/post', verifyToken, upload.single('post_image'), (req, res) => {
  const { caption } = req.body;
  const postImage = req.file ? req.file.buffer : null;

  // Dapatkan user ID dari token
  const userId = req.userId;

  // Lakukan operasi insert terlebih dahulu
  const insertPostQuery = `
    INSERT INTO Post (profile_id, caption, post_image)
    VALUES (?, ?, ?)
  `;

  db.query(insertPostQuery, [userId, caption, postImage], (insertErr, insertResults) => {
    if (insertErr) {
      console.error(insertErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Jika operasi insert berhasil, post telah dibuat
    res.json({ message: 'Post berhasil dibuat' });
  });
});

// Endpoint untuk mendapatkan data postingan berdasarkan post_id
router.get('/post/:post_id', verifyToken, (req, res) => {
  const postId = req.params.post_id;

  // Query untuk mendapatkan data postingan berdasarkan post_id
  const getPostQuery = `
    SELECT * FROM Post
    WHERE post_id = ?
  `;

  db.query(getPostQuery, [postId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      const post = results[0];
      res.json(post);
    } else {
      res.status(404).json({ error: 'Post tidak ditemukan' });
    }
  });
});

// Endpoint untuk memperbarui data postingan berdasarkan post_id
router.put('/post/:post_id', verifyToken, upload.single('post_image'), (req, res) => {
  const postId = req.params.post_id;
  const { caption } = req.body;
  const postImage = req.file ? req.file.buffer : null;

  // Query untuk memperbarui data postingan berdasarkan post_id
  const updatePostQuery = `
    UPDATE Post
    SET caption = ?, post_image = ?
    WHERE post_id = ?
  `;

  db.query(updatePostQuery, [caption, postImage, postId], (updateErr, updateResults) => {
    if (updateErr) {
      console.error(updateErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Check if any row is updated (affected rows > 0)
    if (updateResults.affectedRows > 0) {
      res.json({ message: 'Data postingan berhasil diperbarui' });
    } else {
      res.status(404).json({ error: 'Data postingan tidak ditemukan' });
    }
  });
});

// Endpoint untuk menghapus data postingan berdasarkan post_id
router.delete('/post/:post_id', verifyToken, (req, res) => {
  const postId = req.params.post_id;

  // Query untuk menghapus data postingan berdasarkan post_id
  const deletePostQuery = `
    DELETE FROM Post
    WHERE post_id = ?
  `;

  db.query(deletePostQuery, [postId], (deleteErr, deleteResults) => {
    if (deleteErr) {
      console.error(deleteErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Check if any row is deleted (affected rows > 0)
    if (deleteResults.affectedRows > 0) {
      res.json({ message: 'Data postingan berhasil dihapus' });
    } else {
      res.status(404).json({ error: 'Data postingan tidak ditemukan' });
    }
  });
});

// Use the profil router
router.use('/profil', profilRouter);


export default router;
