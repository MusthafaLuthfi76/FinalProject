const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./database/db'); // Koneksi database yang sudah dibuat
const port = 3111;

// Setting EJS sebagai template engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Route untuk menampilkan halaman index dengan data dari database
app.get('/', (req, res) => {
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

// POST - Insert new product
app.post('/admin/insert', (req, res) => {
    let { nama_product, gambar, stok, harga, deskripsi, id_kategori } = req.body;
    let sql = 'INSERT INTO product (nama_product, gambar, stok, harga, deskripsi, id_kategori) VALUES (?, ?, ?, ?, ?, ?)';
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

// POST - Update product
app.post('/admin/edit/:id', (req, res) => {
    let { nama_product, gambar, stok, harga, deskripsi, id_kategori } = req.body;
    let sql = 'UPDATE product SET nama_product = ?, gambar = ?, stok = ?, harga = ?, deskripsi = ?, id_kategori = ? WHERE id_product = ?';
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
