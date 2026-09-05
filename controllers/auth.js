const User = require('../models/user');
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isLoggedIn: false
    });
}

exports.postLogin = (req, res, next) => {
    User.findById('6a8484df24be51541680461b')
        .then(user => {
            req.session.loggedIn = true;
            req.session.user = JSON.parse(JSON.stringify(user));
            res.redirect('/');
        }).catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}