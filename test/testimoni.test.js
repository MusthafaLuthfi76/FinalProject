const request = require('supertest');
const app = require('../app'); // Pastikan ini adalah file server Express Anda

describe('GET /testimoni (Testimoni Page)', () => {
  it('should render the testimoni page', async () => {
    const response = await request(app).get('/testimoni').expect(200);
    expect(response.text).toContain('Testimoni'); // Sesuaikan dengan konten di halaman Testimonial
  });
});
