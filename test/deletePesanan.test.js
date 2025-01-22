const request = require('supertest');
const app = require('../app'); // Path ke file app.js atau server

describe('DELETE /admin/orders/delete/:id', () => {
    test('Menghapus pesanan yang ada', async () => {
        // Misal ID pesanan yang ingin dihapus adalah 1
        const orderId = 1;

        // Lakukan request delete menggunakan supertest
        const response = await request(app).get(`/admin/orders/delete/${orderId}`);

        // Pastikan status code yang dikembalikan 302 karena redirect
        expect(response.status).toBe(302);

        // Pastikan di-redirect ke halaman pesanan admin
        expect(response.header.location).toBe('/admin/orders');
    });

    test('Gagal menghapus pesanan yang tidak ada', async () => {
        // Misal ID pesanan yang tidak ada adalah 9999
        const orderId = 9999;

        // Lakukan request delete menggunakan supertest
        const response = await request(app).get(`/admin/orders/delete/${orderId}`);

        // Karena pesanan tidak ada, tetap redirect ke halaman pesanan admin
        expect(response.status).toBe(302);

        // Pastikan redirect ke halaman pesanan admin
        expect(response.header.location).toBe('/admin/orders');
    });
});
