const request = require('supertest');
const app = require('../app'); // Pastikan app.js adalah file server Express Anda

describe('GET / (Home Page)', () => {
  it('should render the index.ejs with Contact Us link', async () => {
    const response = await request(app).get('/').expect(200);

    // Verifikasi apakah respons mengandung tautan "Contact Us"
    expect(response.text).toContain('href="https://wa.me/6281357080824"');
  });
});
