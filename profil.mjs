// profil.mjs
import express from 'express';
import multer from 'multer';
import db from './dbConfig.mjs';
import verifyToken from './authMiddleware.mjs';
import userRouter from './user.mjs'; // Import user router to access userId

const router = express.Router();

// Konfigurasi Multer untuk mengelola pengunggahan file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint untuk menambah atau memperbarui data profil pengguna
router.post('/profile', verifyToken, upload.single('profile_picture'), (req, res) => {
  const userId = req.userId; // Access userId from the req object

  const { fullname, date_of_birth, gender, email_address, phone_number } = req.body;
  const profilePicture = req.file ? req.file.buffer : null;

  // Lakukan operasi insert terlebih dahulu
  const insertProfileQuery = `
    INSERT INTO Profile (profile_id, fullname, date_of_birth, gender, email_address, phone_number, profile_picture)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertProfileQuery,
    [userId, fullname, date_of_birth, gender, email_address, phone_number, profilePicture],
    (insertErr, insertResults) => {
      if (insertErr) {
        // Jika operasi insert gagal, cek apakah itu disebabkan oleh kunci duplikat (profil sudah ada)
        if (insertErr.code === 'ER_DUP_ENTRY') {
          // Jika ini adalah kesalahan kunci duplikat, lanjutkan dengan operasi update
          const updateProfileQuery = `
            UPDATE Profile
            SET fullname = ?, date_of_birth = ?, gender = ?, email_address = ?, phone_number = ?, profile_picture = ?
            WHERE profile_id = ?
          `;

          db.query(
            updateProfileQuery,
            [fullname, date_of_birth, gender, email_address, phone_number, profilePicture, userId],
            (updateErr) => {
              if (updateErr) {
                console.error(updateErr);
                return res.status(500).json({ error: 'Internal Server Error' });
              }
              res.json({ message: 'Profil berhasil diperbarui' });
            }
          );
        } else {
          console.error(insertErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        // Jika operasi insert berhasil, profil telah dibuat
        res.json({ message: 'Profil berhasil dibuat' });
      }
    }
  );
});

// Endpoint untuk mendapatkan data profil berdasarkan profile_id
router.get('/Profile/:profile_id', verifyToken, (req, res) => {
  const userId = req.userId;

  // Query untuk mendapatkan data profil berdasarkan profile_id
  const getProfileQuery = `
    SELECT * FROM Profile
    WHERE profile_id = ?
  `;

  db.query(getProfileQuery, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      const profile = results[0];
      res.json(profile);
    } else {
      res.status(404).json({ error: 'Profil tidak ditemukan' });
    }
  });
});

export default router;
