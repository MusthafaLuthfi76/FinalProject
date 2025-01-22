const request = require('supertest');
const app = require('../app'); // Mengimpor instance aplikasi Express
const db = require('../database/db'); // Mocking koneksi database

// npx jest editProduk.test.js

jest.mock('../database/db'); // Mock koneksi database

describe('POST /admin/edit/:id', () => {
  // Data produk untuk pengujian
  const mockProductId = 1;
  const mockProductData = {
    nama_product: 'Produk Baru',
    stok: 10,
    harga: 50000,
    deskripsi: 'Deskripsi produk baru',
    id_kategori: 2,
    old_gambar: 'gambar_lama.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Membersihkan mock sebelum setiap pengujian
  });

  it('should update product data successfully and redirect to /admin', async () => {
    // Mock hasil database query untuk kasus sukses
    db.query.mockImplementation((sql, params, callback) => {
      callback(null, { affectedRows: 1 }); // Simulasi sukses query
    });

    const response = await request(app)
      .post(`/admin/edit/${mockProductId}`)
      .field('nama_product', mockProductData.nama_product)
      .field('stok', mockProductData.stok)
      .field('harga', mockProductData.harga)
      .field('deskripsi', mockProductData.deskripsi)
      .field('id_kategori', mockProductData.id_kategori)
      .field('old_gambar', mockProductData.old_gambar);

    expect(response.status).toBe(302); // Mengecek status redirect
    expect(response.headers.location).toBe('/admin'); // Mengecek lokasi redirect

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE produk SET nama_product = ?, stok = ?, harga = ?, deskripsi = ?, id_kategori = ?, gambar = ? WHERE id_product = ?',
      [
        mockProductData.nama_product,
        mockProductData.stok,
        mockProductData.harga,
        mockProductData.deskripsi,
        mockProductData.id_kategori,
        mockProductData.old_gambar, // Anda dapat mengganti ini dengan nama file baru jika ada file yang diunggah
        mockProductId,
      ],
      expect.any(Function)
    );
  });

  it('should return 500 if database query fails', async () => {
    // Mock database query untuk simulasi error
    db.query.mockImplementation((sql, params, callback) => {
      callback(new Error('Database error'));
    });

    const response = await request(app)
      .post(`/admin/edit/${mockProductId}`)
      .field('nama_product', mockProductData.nama_product)
      .field('stok', mockProductData.stok)
      .field('harga', mockProductData.harga)
      .field('deskripsi', mockProductData.deskripsi)
      .field('id_kategori', mockProductData.id_kategori)
      .field('old_gambar', mockProductData.old_gambar);

    expect(response.status).toBe(500); // Mengecek status error
    expect(response.text).toContain('Database error'); // Mengecek pesan error
  });
});
