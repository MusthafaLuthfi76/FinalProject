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
    cookie: { 
        secure: false, // Set ke true jika menggunakan HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 1 hari
    }
}));

// Middleware untuk membuat session isLoggedIn tersedia di semua view
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    console.log('isLoggedIn:', res.locals.isLoggedIn); // Tambahkan ini untuk debugging
    next();
});


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

// Route untuk menampilkan halaman index dengan data dari database
app.get('/',  (req, res) => {
    console.log('GET / - isLoggedIn:', req.session.isLoggedIn);
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

app.get('/product/detail/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM product WHERE id_product = ?';
    db.query(sql, [productId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.length > 0) {
            res.json(result[0]); // Kirim detail produk sebagai JSON
        } else {
            res.status(404).json({ error: 'Produk tidak ditemukan' });
        }
    });
});

app.post('/order', isAuthenticated, (req, res) => {
    const { id_product, color, size, quantity, address } = req.body;
    const sql = `INSERT INTO orders (id_product, color, size, quantity, address) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [id_product, color, size, quantity, address], (err, result) => {
        if (err) return res.status(500).send('Database error');
        res.redirect('/'); // Redirect ke halaman utama
    });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query database untuk autentikasi
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            req.session.isLoggedIn = true;
            req.session.user = results[0]; // Simpan user info jika perlu
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        console.log('Session destroyed');
        res.redirect('/');
    });
});

app.post('/order', isAuthenticated, (req, res) => {
    const { id_product, color, size, quantity, address } = req.body;

    const sql = `INSERT INTO orders (id_product, color, size, quantity, address) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [id_product, color, size, quantity, address], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Gagal memproses pesanan.' });
        }

        console.log('Pesanan berhasil masuk ke database');
        res.json({ success: true, message: 'Pesanan berhasil dibuat!' });
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
app.get('/product/:id', isAuthenticated,(req, res) => {
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

// GET - Daftar semua pesanan
app.get('/admin/orders', (req, res) => {
    const sql = 'SELECT * FROM orders';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).send('Database error');
        }
        res.render('orders', { orders: results });
    });
});

// GET - Render form edit pesanan
app.get('/admin/orders/edit/:id', (req, res) => {
    const orderId = req.params.id;
    const sql = 'SELECT * FROM orders WHERE id_order = ?';
    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error('Error fetching order for edit:', err);
            return res.status(500).send('Database error');
        }
        if (result.length > 0) {
            res.render('edit-order', { order: result[0] });
        } else {
            res.status(404).send('Pesanan tidak ditemukan');
        }
    });
});

// POST - Update pesanan
app.post('/admin/orders/edit/:id', (req, res) => {
    const orderId = req.params.id;
    const { id_product, color, size, quantity, address } = req.body;
    const sql = 'UPDATE orders SET id_product = ?, color = ?, size = ?, quantity = ?, address = ? WHERE id_order = ?';
    db.query(sql, [id_product, color, size, quantity, address, orderId], (err) => {
        if (err) {
            console.error('Error updating order:', err);
            return res.status(500).send('Database error');
        }
        res.redirect('/admin/orders');
    });
});

// GET - Hapus pesanan
app.get('/admin/orders/delete/:id', (req, res) => {
    const orderId = req.params.id;
    const sql = 'DELETE FROM orders WHERE id_order = ?';
    db.query(sql, [orderId], (err) => {
        if (err) {
            console.error('Error deleting order:', err);
            return res.status(500).send('Database error');
        }
        res.redirect('/admin/orders');
    });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server berjalan di http://localhost:${port}`);
    });
}

app.get('/', (req, res) => {
    res.render('index'); // Pastikan ini merender index.ejs
  });
  app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).send('Internal Server Error');
  });
  
  

module.exports = app; // Ekspor app untuk pengujian