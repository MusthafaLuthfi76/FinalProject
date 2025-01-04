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

// Halaman utama untuk mengelola produk (Admin Panel)
app.get('/admin/products', (req, res) => {
    const sql = `SELECT product.id_product, product.nama_product, product.gambar, product.stok, product.harga, product.deskripsi, kategori.nama_kategori 
                 FROM product 
                 JOIN kategori ON product.id_kategori = kategori.id_kategori`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('admin', { products: results });
    });
});

// CREATE - Menambah produk baru
app.post('/admin/products', (req, res) => {
    const { nama_product, gambar, stok, harga, deskripsi, id_kategori } = req.body;
    const sql = `INSERT INTO product (nama_product, gambar, stok, harga, deskripsi, id_kategori) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [nama_product, gambar, stok, harga, deskripsi, id_kategori], (err, result) => {
        if (err) throw err;
        res.redirect('/admin/products');
    });
});

// UPDATE - Mengedit produk (menampilkan data lama di form)
app.get('/admin/products/edit/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM product WHERE id_product = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('edit', { product: result[0] });
    });
});


// UPDATE - Simpan perubahan produk
app.post('/admin/products/update/:id', (req, res) => {
    const { id } = req.params;
    const { nama_product, gambar, stok, harga, deskripsi, id_kategori } = req.body;
    const sql = `UPDATE product SET nama_product = ?, gambar = ?, stok = ?, harga = ?, deskripsi = ?, id_kategori = ? WHERE id_product = ?`;
    db.query(sql, [nama_product, gambar, stok, harga, deskripsi, id_kategori, id], (err, result) => {
        if (err) throw err;
        res.redirect('/admin/products');
    });
});

// DELETE - Menghapus produk
app.get('/admin/products/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM product WHERE id_product = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.redirect('/admin/products');
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
