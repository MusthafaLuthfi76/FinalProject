const request = require('supertest'); // Untuk menguji endpoint HTTP
const express = require('express');  // Membuat instance aplikasi Express
const bcrypt = require('bcryptjs');  // Mock bcrypt
const db = require('../database/db'); // Mock database
const authRoutes = require('../routes/authRoutes'); // Import authRoutes

// Mock fungsi db.query
jest.mock('../database/db', () => ({
    query: jest.fn(), // Mock fungsi query
}));

// Mulai pengujian
describe('POST /signup', () => {
    let app; // Aplikasi Express

    beforeAll(() => {
        app = express();
        app.use(express.json()); // Parser untuk JSON body
        app.use('/auth', authRoutes); // Gunakan authRoutes
    });

    it('should successfully signup a user', async () => {
        // Mock hasil bcrypt.hash
        jest.spyOn(bcrypt, 'hash').mockImplementation((password, salt, callback) => {
            callback(null, 'mocked_hashed_password'); // Return password hash palsu
        });

        // Mock hasil db.query untuk kasus sukses
        db.query.mockImplementation((query, params, callback) => {
            callback(null, { affectedRows: 1 }); // Simulasikan hasil sukses
        });

        // Kirim permintaan HTTP POST ke endpoint signup
        const response = await request(app)
            .post('/auth/signup')
            .send({ username: 'testuser', password: 'password123' });

        // Periksa respon
        expect(response.status).toBe(302); // Redirect ke /login
        expect(response.headers.location).toBe('/login'); // Cek lokasi redirect
    });

    it('should return 500 if bcrypt.hash fails', async () => {
        // Mock hasil bcrypt.hash untuk kasus error
        jest.spyOn(bcrypt, 'hash').mockImplementation((password, salt, callback) => {
            callback(new Error('Hashing error'), null);
        });

        const response = await request(app)
            .post('/auth/signup')
            .send({ username: 'testuser', password: 'password123' });

        expect(response.status).toBe(500); // Periksa kode status
        expect(response.text).toBe('Error hashing password'); // Pesan error
    });

    it('should return 500 if db.query fails', async () => {
        // Mock hasil bcrypt.hash
        jest.spyOn(bcrypt, 'hash').mockImplementation((password, salt, callback) => {
            callback(null, 'mocked_hashed_password');
        });

        // Mock hasil db.query untuk kasus error
        db.query.mockImplementation((query, params, callback) => {
            callback(new Error('Database error'), null);
        });

        const response = await request(app)
            .post('/auth/signup')
            .send({ username: 'testuser', password: 'password123' });

        expect(response.status).toBe(500); // Periksa kode status
        expect(response.text).toBe('Error registering user'); // Pesan error
    });
});