const request = require('supertest');
const app = require('../app'); // Mengimpor file app.js
const db = require('../database/db'); // Mocking database connection

jest.mock('../database/db'); // Mocking koneksi database

describe('POST /order', () => {
  let mockOrderData;

  // Mock data login user
  const mockUser = { id: 1, username: 'testuser', isLoggedIn: true };

  beforeAll(() => {
    // Mocking otentikasi: Simulasikan login sebelum pengujian dimulai
    app.use((req, res, next) => {
      req.user = mockUser; // Simulasikan session yang sudah login
      next();
    });

    mockOrderData = {
      id_product: 1,
      color: 'red',
      size: 'M',
      quantity: 2,
      address: '123 Main Street',
    };
  });

  it('should insert order data into the database and redirect to the homepage', async () => {
    // Mock hasil dari database query
    db.query.mockImplementation((sql, params, callback) => {
      callback(null, { affectedRows: 1 }); // Simulasi sukses query
    });

    const response = await request(app)
      .post('/order')
      .send(mockOrderData);

    expect(response.status).toBe(302); // Mengecek status redirect
    expect(response.headers.location).toBe('/'); // Mengecek lokasi redirect
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO orders (id_product, color, size, quantity, address) VALUES (?, ?, ?, ?, ?)',
      [mockOrderData.id_product, mockOrderData.color, mockOrderData.size, mockOrderData.quantity, mockOrderData.address],
      expect.any(Function)
    );
  });

  it('should return a 500 error when a database error occurs', async () => {
    // Mock database query untuk simulasi error
    db.query.mockImplementation((sql, params, callback) => {
      callback(new Error('Database error'));
    });

    const response = await request(app)
      .post('/order')
      .send(mockOrderData);

    expect(response.status).toBe(500); // Mengecek status error
    expect(response.text).toContain('Database error'); // Mengecek pesan error
  });
});

afterAll(() => {
    db.end(); // Menutup koneksi database setelah pengujian selesai
});
