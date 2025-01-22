const request = require('supertest');
const app = require('../app'); // pastikan path ke app.js sesuai
const db = require('../database/db'); // pastikan db.js sesuai dengan konfigurasi DB yang kamu gunakan

describe('POST /order', () => {
    let agent;

    beforeAll(async () => {
        // Menyiapkan agent untuk menjaga session
        agent = request.agent(app);

        // Lakukan login sebelum tes order
        await agent
            .post('/login')
            .send({ username: 'adan', password: 'adan' }) // Ganti dengan data login yang valid
            .expect(302) // Harus mengarah ke homepage setelah login
            .expect('Location', '/'); // Harus mengarah ke homepage jika berhasil login
    });

    test('should insert order data into the database and redirect to the homepage', async () => {
        // Data pesanan yang valid
        const orderData = {
            id_product: 1, 
            color: 'Black', 
            size: 'S', 
            quantity: 1,
            address: 'bekasi', 
        };

        // Melakukan POST request untuk menambahkan order
        const response = await agent
            .post('/order') 
            .send(orderData)
            .expect(302); // Harus redirect setelah berhasil

        // Cek apakah redirect berhasil ke homepage
        expect(response.headers.location).toBe('/');

        // Cek apakah order masuk ke database
        db.query('SELECT * FROM orders WHERE id_product = ?', [orderData.id_product], (err, results) => {
            if (err) {
                console.error('Database error during test:', err);
            } else {
                expect(results.length).toBeGreaterThan(0); // Pastikan ada data order yang dimasukkan
                const order = results[0];
                expect(order.id_product).toBe(orderData.id_product);
                expect(order.color).toBe(orderData.color);
                expect(order.size).toBe(orderData.size);
                expect(order.quantity).toBe(orderData.quantity);
                expect(order.address).toBe(orderData.address);
            }
        });
    });
});
