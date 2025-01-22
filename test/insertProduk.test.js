const request = require('supertest');
const app = require('../app'); // Import aplikasi utama
const path = require('path');

describe('POST /admin/insert', () => {

    it('should insert a new product successfully', async () => {
        const response = await request(app)
            .post('/admin/insert')
            .field('nama_product', 'Produk Baru')
            .field('stok', 100)
            .field('harga', 50000)
            .field('deskripsi', 'Deskripsi produk baru')
            .field('id_kategori', 1)
            .attach('gambar', path.resolve(__dirname, '../public/images/logo.png')); // Pastikan file gambar tersedia

        // Pastikan respon berhasil dan diarahkan ke halaman admin
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/admin');
    });

    it('should return error if required fields are missing', async () => {
        const response = await request(app)
            .post('/admin/insert')
            .field('nama_product', '') // Kosongkan salah satu field wajib
            .field('stok', 100)
            .field('harga', 50000)
            .field('deskripsi', 'Deskripsi produk baru')
            .field('id_kategori', 1)
            .attach('gambar', path.resolve(__dirname, '../public/images/logo.png')); // Masih mengirimkan gambar agar gambar tidak null

        // Pastikan server merespon error 400 jika ada field yang kosong
        expect(response.statusCode).toBe(400); // Pastikan status 400
        expect(response.body.message).toContain('Field wajib harus diisi'); // Pastikan pesan error yang benar
    });

}, 10000); // Timeout diperpanjang menjadi 10 detik
