const request = require('supertest');
const app = require('../app'); // Sesuaikan path jika app.js ada di folder yang berbeda
const db = require('../database/db'); // Sesuaikan path jika file db.js ada di folder yang berbeda

// Mock data untuk produk
const mockProductId = 1;
const mockProduct = {
    id_product: 1,
    nama_product: 'Product Name',
    gambar: '/uploads/sample.jpg',
    stok: 100,
    harga: 50000,
    deskripsi: 'Product description',
    id_kategori: 2
};

// Menyiapkan mock data produk di database sebelum test dijalankan
beforeAll(done => {
    const sql = 'INSERT INTO product (id_product, nama_product, gambar, stok, harga, deskripsi, id_kategori) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [
        mockProduct.id_product,
        mockProduct.nama_product,
        mockProduct.gambar,
        mockProduct.stok,
        mockProduct.harga,
        mockProduct.deskripsi,
        mockProduct.id_kategori
    ], (err) => {
        if (err) {
            console.error('Error inserting mock data:', err);
        }
        done();
    });
});

// Test route GET /admin/edit/:id
describe('GET /admin/edit/:id', () => {
    it('should render the edit form with the correct product data', async () => {
        const response = await request(app).get(`/admin/edit/${mockProductId}`);
        
        // Pastikan response status 200 (OK)
        expect(response.status).toBe(200);
        
        // Pastikan produk yang ditampilkan sesuai dengan data mock
        expect(response.text).toContain(mockProduct.nama_product);
        expect(response.text).toContain(mockProduct.stok.toString()); // Mengubah nilai stok menjadi string
        expect(response.text).toContain(mockProduct.harga.toString()); // Mengubah nilai harga menjadi string
    });

    it('should return a 404 error if product does not exist', async () => {
        const nonExistentProductId = 999; // ID yang tidak ada
        const response = await request(app).get(`/admin/edit/${nonExistentProductId}`);
        
        // Pastikan response status 404 (Not Found)
        expect(response.status).toBe(404);
        expect(response.text).toContain('Produk tidak ditemukan');
    });
});

// Menjaga database bersih setelah test dijalankan
afterAll(done => {
    const sql = 'DELETE FROM product WHERE id_product = ?';
    db.query(sql, [mockProductId], (err) => {
        if (err) {
            console.error('Error deleting mock data:', err);
        }
        done();
    });
});
