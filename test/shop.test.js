const request = require('supertest');
const app = require('../app'); // Pastikan app.js adalah file server Express Anda

describe('GET / (Home Page)', () => {
  it('should render the index.ejs with Shop link', async () => {
    const response = await request(app).get('/').expect(200);
  });
});
