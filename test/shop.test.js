const request = require('supertest');
const app = require('../app'); // Pastikan ini adalah file server Express Anda

describe('GET /shop (Shop Page)', () => {
  it('should render the shop page', async () => {
    const response = await request(app).get('/shop').expect(200);
    expect(response.text).toContain('Shop'); // Sesuaikan dengan konten di halaman Testimonial
  });
});
