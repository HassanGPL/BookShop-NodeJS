const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isLoggedIn: false
    });
}

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPasswords = req.body.confirmPasswords;

    User.findOne({ email: email })
        .then(user => {
            if (user) {
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: hashedPassword,
                        cart: {
                            items: [],
                            totalPrice: 0
                        }
                    })
                    return newUser.save();
                })
                .then(user => {
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err));

}

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isLoggedIn: false
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }

            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        return res.redirect('/login');
                    }
                    req.session.loggedIn = true;
                    req.session.userId = user._id.toString();
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect('/');
                    });
                }).catch(err => {
                    console.log(err);
                    res.redirect('/login');
                })
        }).catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}