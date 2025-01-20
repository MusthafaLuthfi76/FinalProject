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

describe('DELETE /admin/orders/delete/:id', () => {
    let orderId;

    // Simulasi pembuatan data pesanan sebelum test
    beforeAll((done) => {
        const sql = 'INSERT INTO orders (id_product, color, size, quantity, address) VALUES (1, "Red", "M", 2, "Jalan Raya 1")';
        db.query(sql, (err, result) => {
            if (err) return done(err);
            orderId = result.insertId;
            done();
        });
    });

    it('should delete an order', async () => {
        const response = await request(app)
            .get(`/admin/orders/delete/${orderId}`)
            .set('Cookie', [`connect.sid=mockSession`]);

        expect(response.status).toBe(302); // Redirection after delete
        expect(response.header.location).toBe('/admin/orders');
    });

    afterAll((done) => {
        // Hapus data pesanan setelah test
        const sql = 'DELETE FROM orders WHERE id_order = ?';
        db.query(sql, [orderId], (err) => {
            done(err);
        });
    });
});