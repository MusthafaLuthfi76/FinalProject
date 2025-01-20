const request = require('supertest');
const app = require('../app'); // Sesuaikan dengan path aplikasi Anda
const db = require('../database/db'); // Koneksi database

// Mock session untuk testing
const mockSession = {
    isLoggedIn: true,
    user: {
        id_user: 1,
        username: 'admin'
    }
};

describe('DELETE /admin/delete/:id', () => {
    let productId;

    // Simulasi pembuatan produk sebelum test
    beforeAll((done) => {
        const sql = 'INSERT INTO product (nama_product, stok, harga, deskripsi, id_kategori) VALUES ("Test Product", 10, 100, "Test Description", 1)';
        db.query(sql, (err, result) => {
            if (err) return done(err);
            productId = result.insertId;
            done();
        });
    });

    it('should delete a product', async () => {
        const response = await request(app)
            .get(`/admin/delete/${productId}`)
            .set('Cookie', [`connect.sid=mockSession`]);

        expect(response.status).toBe(302); // Redirection after delete
        expect(response.header.location).toBe('/admin');
    });

    afterAll((done) => {
        // Hapus data produk setelah test
        const sql = 'DELETE FROM product WHERE id_product = ?';
        db.query(sql, [productId], (err) => {
            done(err);
        });
    });
});