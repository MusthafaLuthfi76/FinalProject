const request = require('supertest');
const app = require('../app'); // Path ke file app.js atau server

describe('DELETE /admin/delete/:id', () => {
    test('Menghapus produk yang ada', async () => {
        // Misal ID produk yang ingin dihapus adalah 1
        const productId = 1;

        // Lakukan request delete menggunakan supertest
        const response = await request(app).get(`/admin/delete/${productId}`);

        // Pastikan status code yang dikembalikan 302 karena redirect
        expect(response.status).toBe(302);

        // Pastikan di-redirect ke halaman admin
        expect(response.header.location).toBe('/admin');
    });

    test('Gagal menghapus produk yang tidak ada', async () => {
        // Misal ID produk yang tidak ada adalah 9999
        const productId = 9999;

        // Lakukan request delete menggunakan supertest
        const response = await request(app).get(`/admin/delete/${productId}`);

        // Karena produk tidak ada, tetap redirect ke halaman admin
        expect(response.status).toBe(302);

        // Pastikan redirect ke halaman admin
        expect(response.header.location).toBe('/admin');
    });
});
