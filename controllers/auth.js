const User = require('../models/user');
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isLoggedIn: false
    });
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isLoggedIn: false
    });
}

exports.postSignup = (req, res, next) => { }

exports.postLogin = (req, res, next) => {
    User.findById('6a8484df24be51541680461b')
        .then(user => {
            req.session.loggedIn = true;
            req.session.userId = user._id.toString();
            req.session.save((err) => {
                console.log(err);
                res.redirect('/');
            })
        }).catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}