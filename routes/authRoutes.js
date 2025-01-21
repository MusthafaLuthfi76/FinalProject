const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const router = express.Router();



// Route Signup
router.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Hash password sebelum menyimpan
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).send('Error hashing password');

        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err, result) => {
            if (err) return res.status(500).send('Error registering user');
            res.redirect('/login');
        });
    });
});

// Route untuk menampilkan form signup
router.get('/signup', (req, res) => {
    res.render('signup', {
        layout: 'layouts/main-layout',
    });
});

// Route Login
// Route Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Periksa di tabel admin
    db.query('SELECT * FROM admin WHERE username = ?', [username], (err, adminResults) => {
        if (err) return res.status(500).send('Error fetching admin data');
        
        if (adminResults.length > 0) {
            // Jika username ditemukan di tabel admin
            const admin = adminResults[0];
            bcrypt.compare(password, admin.password, (err, isMatch) => {
                if (err) return res.status(500).send('Error checking password');
                if (!isMatch) return res.status(401).send('Incorrect password');

                // Simpan status login admin
                req.session.isLoggedIn = true;
                req.session.user = { id: admin.id_admin, username: admin.username, role: 'admin' };
                return res.redirect('/admin'); // Arahkan ke halaman admin
            });
        } else {
            // Jika tidak ditemukan di tabel admin, periksa di tabel users
            db.query('SELECT * FROM users WHERE username = ?', [username], (err, userResults) => {
                if (err) return res.status(500).send('Error fetching user data');
                if (userResults.length === 0) return res.status(400).send('User not found');

                const user = userResults[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) return res.status(500).send('Error checking password');
                    if (!isMatch) return res.status(401).send('Incorrect password');

                    // Simpan status login user
                    req.session.isLoggedIn = true;
                    req.session.user = { id: user.id, username: user.username, role: 'user' };
                    return res.redirect('/'); // Arahkan ke halaman utama
                });
            });
        }
    });
});


// Route untuk menampilkan form login
router.get('/login', (req, res) => {
    res.render('login', {
        layout: 'layouts/main-layout',
    });
});

// Route Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error logging out');
        res.redirect('/'); // Arahkan kembali ke halaman utama
    });
});

module.exports = router;
