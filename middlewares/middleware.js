function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) {
        return next();
    }
    return res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    return res.status(403).send('Akses ditolak. Anda bukan admin.');
}

module.exports = { isAuthenticated, isAdmin };
