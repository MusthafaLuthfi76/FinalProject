const mysql = require('mysql2');

// Buat koneksi ke database
const db = mysql.createConnection({
    host: 'localhost', // atau '127.0.0.1'
    user: 'root', // user MySQL Anda
    password: '', // password MySQL Anda
    database: 'finalpaw' // nama database
});

// Hubungkan ke database
db.connect((err) => {
    if (err) {
        console.error('Koneksi ke database gagal: ' + err.stack);
        return;
    }
    console.log('Terhubung ke database.');
});

module.exports = db;
