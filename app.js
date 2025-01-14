const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const db = require('./database/db'); // Koneksi database yang sudah dibuat
const port = 3111;
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');
const session = require('express-session');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

// Konfigurasi penyimpanan file menggunakan multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Middleware untuk file statis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'views')));


// Setting EJS sebagai template engin
app.use('/', authRoutes);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'layouts/main-layout',
    });
});

// Route untuk menampilkan halaman index dengan data dari database
app.get('/', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM product';
    
    // Query untuk mengambil data dari database
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send('Database error: ' + err);
        }

        // Kirim hasil query ke EJS untuk dirender
        res.render('index', { product: results });
    });
});

app.get('/shop', (req, res) => {
    const sql = 'SELECT * FROM product';
    
    // Query untuk mengambil data dari database
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send('Database error: ' + err);
        }

        // Kirim hasil query ke EJS untuk dirender
        res.render('shop', { product: results });
    });
  });

  app.get('/why', (req, res) => {
    res.render('why'); // Ensure the shop.ejs file exists in the views folder
  });

  app.get('/testimoni', (req, res) => {
    res.render('testimonial'); // Ensure the shop.ejs file exists in the views folder
  });


// Route untuk menampilkan detail produk
app.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM product WHERE id_product = ?';
    
    db.query(sql, [productId], (err, result) => {
      if (err) {
        return res.status(500).send('Database error: ' + err);
      }
      if (result.length > 0) {
        res.render('product-detail', { product: result[0] });
      } else {
        res.status(404).send('Produk tidak ditemukan');
      }
    });
  });
  

// GET - Display all products
app.get('/admin', (req, res) => {
    let sql = 'SELECT * FROM product';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('admin', { products: results });
    });
});

// GET - Render insert product form
app.get('/admin/insert', (req, res) => {
    res.render('insert');
});

// POST - Tambah produk baru
app.post('/admin/insert', upload.single('gambar'), (req, res) => {
    const { nama_product, stok, harga, deskripsi, id_kategori } = req.body;
    const gambar = req.file ? `/uploads/${req.file.filename}` : null;

    const sql =
        'INSERT INTO product (nama_product, gambar, stok, harga, deskripsi, id_kategori) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [nama_product, gambar, stok, harga, deskripsi, id_kategori], (err, result) => {
        if (err) throw err;
        res.redirect('/admin');
    });
});

// GET - Render edit product form
app.get('/admin/edit/:id', (req, res) => {
    let sql = 'SELECT * FROM product WHERE id_product = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.render('edit', { product: result[0] });
    });
});

// POST - Update produk
app.post('/admin/edit/:id', upload.single('gambar'), (req, res) => {
    const { nama_product, stok, harga, deskripsi, id_kategori } = req.body;
    const gambar = req.file ? `/uploads/${req.file.filename}` : req.body.old_gambar;

    const sql =
        'UPDATE product SET nama_product = ?, gambar = ?, stok = ?, harga = ?, deskripsi = ?, id_kategori = ? WHERE id_product = ?';
    db.query(sql, [nama_product, gambar, stok, harga, deskripsi, id_kategori, req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/admin');
    });
});

// GET - Delete product
app.get('/admin/delete/:id', (req, res) => {
    let sql = 'DELETE FROM product WHERE id_product = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/admin');
    });
});


// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
